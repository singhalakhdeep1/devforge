/**
 * Backup service (admins only, via the gateway at /api/backups): scheduled and on-demand backups of
 * every data store, listing, download, retention and restore. With several replicas a Redis lock
 * makes each scheduled run happen once.
 */
import { Router } from 'express'
import cron from 'node-cron'
import { z } from 'zod'
import { asyncHandler, createEventBus, createLogger, env, envBool, getRedis, redisHealthy, requireRole, startService, TOPICS, userOf, validate } from '@devhub/shared'
import { backupService } from './backup.service'

const log = createLogger('backup')
const bus = createEventBus('backup')
const SCHEDULE = env('BACKUP_CRON', '0 2 * * *')
const LOCK_KEY = 'devforge:backup:lock'
const LOCK_MS = 6 * 60 * 60 * 1000

const audit = (type: string, actor: string | undefined, data: Record<string, unknown>) =>
  bus.publish(TOPICS.auditRecorded, type, { actor: actor ?? 'system', target: data.backupId, ...data }).catch((e) => log.logWarning('audit event failed', { error: (e as Error).message }))

/** Scheduled run: take the cluster-wide lock, back up, apply retention. */
async function scheduledRun() {
  const holder = `${process.pid}-${Date.now()}`
  const got = await getRedis().set(LOCK_KEY, holder, 'PX', LOCK_MS, 'NX').catch(() => 'OK') // no Redis: single instance
  if (got !== 'OK') return log.logInformation('scheduled backup skipped: another replica holds the lock')
  try {
    const record = await backupService.performBackup('scheduled')
    await audit(record.status === 'failed' ? 'backup.failed' : 'backup.created', undefined, { backupId: record.id, status: record.status, size: record.size })
    const removed = await backupService.applyRetention()
    if (removed.length) await audit('backup.retention', undefined, { removed })
  } catch (e) {
    log.logError('scheduled backup failed', (e as Error).message)
  } finally {
    if ((await getRedis().get(LOCK_KEY).catch(() => null)) === holder) await getRedis().del(LOCK_KEY).catch(() => undefined)
  }
}

const router = Router()
router.use(requireRole('ADMIN'))

router.get('/', asyncHandler(async (_req, res) => res.json({ items: await backupService.list() })))

router.get('/status', asyncHandler(async (_req, res) => {
  const items = await backupService.list()
  res.json({
    schedule: envBool('BACKUP_SCHEDULE_ENABLED', true) ? SCHEDULE : null,
    storage: { kind: backupService.store.kind, location: backupService.store.location },
    retention: { days: Number(env('BACKUP_RETENTION_DAYS', '30')), keepMin: Number(env('BACKUP_KEEP_MIN', '5')) },
    sources: backupService.sources().map((s) => ({ name: s.name, engine: s.engine, schema: s.schema })),
    tools: await backupService.tools(),
    busy: backupService.busy,
    last: items[0] ?? null,
    lastSuccess: items.find((r) => r.status === 'success') ?? null,
    jobs: backupService.recentJobs(),
  })
}))

// starts a backup and answers at once; the record (status "running") is listed immediately
router.post('/', asyncHandler(async (req, res) => {
  const actor = userOf(req)!.id
  if (backupService.busy) return res.status(409).json({ error: { code: 'BUSY', message: 'Another backup or restore is running' } })
  const done = backupService.performBackup('manual', actor)
  done.then((r) => audit(r.status === 'failed' ? 'backup.failed' : 'backup.created', actor, { backupId: r.id, status: r.status, size: r.size })).catch(() => undefined)
  await new Promise((r) => setTimeout(r, 50)) // let the record and job be registered
  res.status(202).json({ job: backupService.recentJobs()[0] })
}))

router.post('/retention', asyncHandler(async (req, res) => {
  const removed = await backupService.applyRetention()
  if (removed.length) await audit('backup.retention', userOf(req)!.id, { removed })
  res.json({ removed })
}))

router.get('/jobs/:jobId', asyncHandler(async (req, res) => res.json(backupService.job(req.params.jobId))))

router.get('/:id', asyncHandler(async (req, res) => res.json(await backupService.get(req.params.id))))

router.get('/:id/download', asyncHandler(async (req, res) => {
  const { record, stream } = await backupService.download(req.params.id)
  res.setHeader('Content-Type', 'application/gzip')
  res.setHeader('Content-Disposition', `attachment; filename="${record.id}.tar.gz"`)
  if (record.size) res.setHeader('Content-Length', String(record.size))
  if (record.sha256) res.setHeader('X-Checksum-SHA256', record.sha256)
  await audit('backup.downloaded', userOf(req)!.id, { backupId: record.id })
  stream.on('error', (e) => res.destroy(e))
  stream.pipe(res)
}))

// restoring overwrites live data, so the caller repeats the backup id as confirmation
router.post(
  '/:id/restore',
  validate(z.object({ confirm: z.string(), sources: z.array(z.string().min(1)).max(50).optional() })),
  asyncHandler(async (req, res) => {
    if (req.body.confirm !== req.params.id) return res.status(400).json({ error: { code: 'CONFIRM', message: 'Set "confirm" to the backup id to restore it' } })
    const actor = userOf(req)!.id
    const job = await backupService.startRestore(req.params.id, req.body.sources, actor)
    await audit('backup.restore.started', actor, { backupId: req.params.id, sources: req.body.sources ?? 'all' })
    res.status(202).json({ job })
  }),
)

router.delete('/:id', asyncHandler(async (req, res) => {
  await backupService.remove(req.params.id)
  await audit('backup.deleted', userOf(req)!.id, { backupId: req.params.id })
  res.status(204).end()
}))

let task: cron.ScheduledTask | undefined

void startService({
  name: 'backup',
  trustProxy: true,
  routes: (app) => {
    app.use('/api/backups', router)
  },
  ready: { redis: () => redisHealthy() },
  onStart: () => {
    if (!envBool('BACKUP_SCHEDULE_ENABLED', true)) return
    if (!cron.validate(SCHEDULE)) throw new Error(`BACKUP_CRON is not a valid cron expression: ${SCHEDULE}`)
    task = cron.schedule(SCHEDULE, () => void scheduledRun(), { timezone: env('BACKUP_TZ', 'UTC') })
    log.logInformation('backups scheduled', { cron: SCHEDULE, sources: backupService.sources().map((s) => s.name) })
  },
  onStop: async () => {
    task?.stop()
    await bus.close()
  },
})
