import cron from 'node-cron'
import { Router } from 'express'
import { z } from 'zod'
import { AppError, TOPICS, asyncHandler, authenticate, createEventBus, createLogger, emit, env, redisHealthy, startService, userOf, validate } from '@devhub/shared'
import { prisma } from './db'
import type { Frequency, Schedule } from './generated/client'
import { FORMATS, render, type Format } from './render'
import { REPORT_TYPES, build, type ReportType } from './reports'

const log = createLogger('reporting')
const bus = createEventBus('reporting')
const FRONTEND = env('FRONTEND_URL', 'http://localhost:3000').replace(/\/$/, '')
const me = (req: Parameters<typeof userOf>[0]) => userOf(req)!
const isAdmin = (req: Parameters<typeof userOf>[0]) => me(req).role === 'ADMIN'

const typeKeys = Object.keys(REPORT_TYPES) as [ReportType, ...ReportType[]]
const base = z.object({
  type: z.enum(typeKeys),
  format: z.enum(['json', 'csv', 'xlsx', 'pdf']).default('pdf'),
  days: z.number().int().min(1).max(365).default(30),
  instructorId: z.string().max(64).optional(),
})

/** Who may run which report, and for whom. Instructors only ever see their own courses. */
function authorize(req: Parameters<typeof userOf>[0], type: ReportType, instructorId?: string) {
  const roles = REPORT_TYPES[type].roles as readonly string[]
  if (!roles.includes(me(req).role)) throw AppError.forbidden('You cannot run that report')
  if (type !== 'instructor') return undefined
  if (!isAdmin(req) && instructorId && instructorId !== me(req).id) throw AppError.forbidden('You can only run this report for your own courses')
  return instructorId ?? me(req).id
}

const filename = (type: string, days: number, ext: string) => `devforge-${type}-${days}d-${new Date().toISOString().slice(0, 10)}.${ext}`

async function produce(type: ReportType, format: Format, days: number, instructorId: string | undefined, ownerId: string, scheduleId?: string) {
  const report = await build(type, days, { instructorId })
  const out = await render(report, format)
  const run = await prisma.run.create({
    data: { scheduleId, ownerId, type, format, days, filename: filename(type, days, out.ext), mimeType: out.mimeType, size: out.data.length, missing: report.missing, status: report.missing.length ? 'PARTIAL' : 'OK', data: out.data },
  })
  return { run, report, out }
}

const router = Router()
router.use(authenticate)

router.get('/types', (req, res) => {
  const role = me(req).role
  res.json({ formats: FORMATS, types: Object.entries(REPORT_TYPES).filter(([, v]) => (v.roles as readonly string[]).includes(role)).map(([id, v]) => ({ id, label: v.label, description: v.description })) })
})

// Same data as the downloads, as JSON, for on-screen viewing
router.get('/preview', validate(z.object({ type: z.enum(typeKeys), days: z.coerce.number().int().min(1).max(365).default(30), instructorId: z.string().max(64).optional() }), 'query'), asyncHandler(async (req, res) => {
  const q = req.query as unknown as { type: ReportType; days: number; instructorId?: string }
  const subject = authorize(req, q.type, q.instructorId)
  res.json(await build(q.type, q.days, { instructorId: subject }))
}))

router.post('/generate', validate(base), asyncHandler(async (req, res) => {
  const b = req.body as z.infer<typeof base>
  const subject = authorize(req, b.type, b.instructorId)
  const { run, out } = await produce(b.type, b.format, b.days, subject, me(req).id)
  res.setHeader('Content-Type', out.mimeType)
  res.setHeader('Content-Disposition', `attachment; filename="${run.filename}"`)
  res.setHeader('X-Report-Run', run.id)
  if (run.missing.length) res.setHeader('X-Report-Missing', run.missing.join(','))
  res.send(out.data)
}))

/* ───────────── history ───────────── */

router.get('/runs', asyncHandler(async (req, res) => {
  const where = isAdmin(req) && req.query.all === 'true' ? {} : { ownerId: me(req).id }
  const rows = await prisma.run.findMany({ where, orderBy: { createdAt: 'desc' }, take: 50, select: { id: true, scheduleId: true, ownerId: true, type: true, format: true, days: true, filename: true, size: true, status: true, missing: true, createdAt: true } })
  res.json(rows)
}))

router.get('/runs/:id/download', asyncHandler(async (req, res) => {
  const run = await prisma.run.findUnique({ where: { id: req.params.id } }).catch(() => null)
  if (!run || (run.ownerId !== me(req).id && !isAdmin(req)) || !run.data) throw AppError.notFound('Report not found')
  res.setHeader('Content-Type', run.mimeType)
  res.setHeader('Content-Disposition', `attachment; filename="${run.filename}"`)
  res.send(Buffer.from(run.data))
}))

router.delete('/runs/:id', asyncHandler(async (req, res) => {
  const r = await prisma.run.deleteMany({ where: { id: req.params.id, ...(isAdmin(req) ? {} : { ownerId: me(req).id }) } })
  if (r.count === 0) throw AppError.notFound('Report not found')
  res.json({ message: 'Report deleted' })
}))

/* ───────────── schedules ───────────── */

export function nextRun(frequency: Frequency, hourUtc: number, from = new Date()): Date {
  const d = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate(), hourUtc, 0, 0))
  if (frequency === 'DAILY') { if (d <= from) d.setUTCDate(d.getUTCDate() + 1) }
  else if (frequency === 'WEEKLY') { d.setUTCDate(d.getUTCDate() + ((8 - d.getUTCDay()) % 7 || 7)) } // next Monday
  else { d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() + 1) } // first of next month
  return d
}

const scheduleBody = base.extend({
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
  hourUtc: z.number().int().min(0).max(23).default(6),
  recipients: z.array(z.string().email()).max(10).default([]),
  enabled: z.boolean().default(true),
})

router.get('/schedules', asyncHandler(async (req, res) => {
  res.json(await prisma.schedule.findMany({ where: isAdmin(req) && req.query.all === 'true' ? {} : { ownerId: me(req).id }, orderBy: { createdAt: 'desc' } }))
}))

router.post('/schedules', validate(scheduleBody), asyncHandler(async (req, res) => {
  const b = req.body as z.infer<typeof scheduleBody>
  const subject = authorize(req, b.type, b.instructorId)
  if ((await prisma.schedule.count({ where: { ownerId: me(req).id } })) >= 20) throw AppError.badRequest('You can have up to 20 scheduled reports')
  const s = await prisma.schedule.create({ data: { ownerId: me(req).id, type: b.type, format: b.format, days: b.days, frequency: b.frequency, hourUtc: b.hourUtc, recipients: b.recipients, subjectId: subject, enabled: b.enabled, nextRunAt: nextRun(b.frequency, b.hourUtc) } })
  res.status(201).json(s)
}))

router.patch('/schedules/:id', validate(z.object({ enabled: z.boolean().optional(), frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']).optional(), hourUtc: z.number().int().min(0).max(23).optional(), recipients: z.array(z.string().email()).max(10).optional(), days: z.number().int().min(1).max(365).optional(), format: z.enum(['json', 'csv', 'xlsx', 'pdf']).optional() })), asyncHandler(async (req, res) => {
  const s = await prisma.schedule.findFirst({ where: { id: req.params.id, ...(isAdmin(req) ? {} : { ownerId: me(req).id }) } }).catch(() => null)
  if (!s) throw AppError.notFound('Schedule not found')
  const freq = req.body.frequency ?? s.frequency, hour = req.body.hourUtc ?? s.hourUtc
  res.json(await prisma.schedule.update({ where: { id: s.id }, data: { ...req.body, nextRunAt: nextRun(freq, hour) } }))
}))

router.delete('/schedules/:id', asyncHandler(async (req, res) => {
  const r = await prisma.schedule.deleteMany({ where: { id: req.params.id, ...(isAdmin(req) ? {} : { ownerId: me(req).id }) } })
  if (r.count === 0) throw AppError.notFound('Schedule not found')
  res.json({ message: 'Schedule deleted' })
}))

router.post('/schedules/:id/run', asyncHandler(async (req, res) => {
  const s = await prisma.schedule.findFirst({ where: { id: req.params.id, ...(isAdmin(req) ? {} : { ownerId: me(req).id }) } }).catch(() => null)
  if (!s) throw AppError.notFound('Schedule not found')
  const run = await runSchedule(s)
  res.status(201).json({ id: run.id, filename: run.filename, status: run.status })
}))

async function runSchedule(s: Schedule) {
  try {
    const { run } = await produce(s.type as ReportType, s.format as Format, s.days, s.subjectId ?? undefined, s.ownerId, s.id)
    emit(bus, TOPICS.notificationRequested, 'notification.requested', { userId: s.ownerId, type: 'report', title: 'Your scheduled report is ready', body: run.filename, link: '/reports' }, s.ownerId)
    for (const to of s.recipients) emit(bus, TOPICS.emailRequested, 'email.report', { to, template: 'report', name: 'there', url: `${FRONTEND}/reports`, data: { title: REPORT_TYPES[s.type as ReportType]?.label ?? s.type, filename: run.filename, days: s.days } })
    return run
  } catch (e) {
    log.logError('scheduled report failed', String(e), { scheduleId: s.id })
    return prisma.run.create({ data: { scheduleId: s.id, ownerId: s.ownerId, type: s.type, format: s.format, days: s.days, filename: '-', mimeType: '-', size: 0, status: 'FAILED', error: String(e).slice(0, 300) } })
  } finally {
    await prisma.schedule.update({ where: { id: s.id }, data: { lastRunAt: new Date(), nextRunAt: nextRun(s.frequency, s.hourUtc) } }).catch(() => undefined)
  }
}

/** Claims due schedules one at a time (SKIP LOCKED) so several instances never run the same report twice. */
async function tick() {
  for (let i = 0; i < 20; i++) {
    const due = await prisma.$transaction(async (tx) => {
      const rows = await tx.$queryRaw<{ id: string }[]>`SELECT id FROM "Schedule" WHERE enabled AND "nextRunAt" <= now() ORDER BY "nextRunAt" LIMIT 1 FOR UPDATE SKIP LOCKED`
      if (!rows[0]) return null
      const s = await tx.schedule.findUniqueOrThrow({ where: { id: rows[0].id } })
      await tx.schedule.update({ where: { id: s.id }, data: { nextRunAt: nextRun(s.frequency, s.hourUtc) } }) // claim before running
      return s
    })
    if (!due) return
    await runSchedule(due)
  }
}

let task: cron.ScheduledTask | undefined
void startService({
  name: 'reporting',
  trustProxy: true,
  cors: false,
  routes: (app) => {
    app.use('/api/reports', router)
  },
  ready: { postgres: () => prisma.$queryRaw`SELECT 1`, redis: () => redisHealthy() },
  onStart: async () => {
    task = cron.schedule('* * * * *', () => void tick().catch((e) => log.logWarning('scheduler tick failed', { error: String(e) })))
    // runs older than 90 days are removed so the table does not grow forever
    cron.schedule('30 3 * * *', () => void prisma.run.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - 90 * 86_400_000) } } }).catch(() => undefined))
  },
  onStop: async () => {
    task?.stop()
    await createEventBus('reporting').close()
    await prisma.$disconnect()
  },
}).catch((e) => {
  console.error('reporting-service failed to start', e)
  process.exit(1)
})
