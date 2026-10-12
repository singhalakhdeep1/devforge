import os from 'node:os'
import { Router } from 'express'
import { z } from 'zod'
import { AppError, SERVICE_PORTS, asyncHandler, createEventBus, createLogger, getRedis, redisHealthy, requireRole, startService, validate } from '@devhub/shared'
import { Registry, Gauge } from 'prom-client'
import { activeAlerts, alertHistory, deleteRule, evaluateAll, loadRules, saveRule, silence, type Rule } from './alerts'
import { allServices, scrape, seriesOf, statusOf } from './scraper'

const log = createLogger('monitoring')
const SCRAPE_MS = Number(process.env.SCRAPE_INTERVAL_MS) || 15_000

// Prometheus view of the same facts, so Grafana can chart service health too
const reg = new Registry()
const upGauge = new Gauge({ name: 'devforge_service_up', help: '1 if the service answered /health', labelNames: ['service'], registers: [reg] })
const errGauge = new Gauge({ name: 'devforge_service_error_rate_percent', help: '5xx share over the last 5 minutes', labelNames: ['service'], registers: [reg] })
const p95Gauge = new Gauge({ name: 'devforge_service_latency_p95_ms', help: 'p95 latency over the last 5 minutes', labelNames: ['service'], registers: [reg] })
const alertGauge = new Gauge({ name: 'devforge_alerts_firing', help: 'alerts currently firing', labelNames: ['severity'], registers: [reg] })

let last: Awaited<ReturnType<typeof evaluateAll>> | null = null
let timer: NodeJS.Timeout | undefined
let busy = false

/** Only one monitoring instance scrapes at a time: the leader holds a short-lived Redis lock. */
async function isLeader() {
  const r = getRedis()
  const me = String(process.pid)
  const ok = await r.set('monitoring:leader', me, 'EX', Math.ceil((SCRAPE_MS * 3) / 1000), 'NX')
  if (ok) return true
  if ((await r.get('monitoring:leader')) === me) { await r.expire('monitoring:leader', Math.ceil((SCRAPE_MS * 3) / 1000)); return true }
  return false
}

async function cycle() {
  if (busy || !(await isLeader().catch(() => false))) return
  busy = true
  try {
    await Promise.all(allServices().map(scrape))
    last = await evaluateAll()
    for (const s of allServices()) {
      const st = statusOf(s)
      upGauge.set({ service: s }, st.status === 'up' || st.status === 'degraded' ? 1 : 0)
      if (st.errorRatePct !== null) errGauge.set({ service: s }, st.errorRatePct)
      if (st.p95Ms !== null) p95Gauge.set({ service: s }, st.p95Ms)
    }
    alertGauge.reset()
    for (const a of await activeAlerts()) if (a.state === 'firing') alertGauge.inc({ severity: a.severity })
  } catch (e) {
    log.logWarning('monitoring cycle failed', { error: String(e) })
  } finally {
    busy = false
  }
}

const router = Router()
router.use(requireRole('ADMIN'))

router.get('/overview', asyncHandler(async (_req, res) => {
  const services = allServices().map(statusOf)
  const alerts = await activeAlerts()
  res.json({
    updatedAt: Date.now(),
    summary: {
      up: services.filter((s) => s.status === 'up').length,
      degraded: services.filter((s) => s.status === 'degraded').length,
      down: services.filter((s) => s.status === 'down').length,
      notDeployed: services.filter((s) => s.status === 'not-deployed').length,
      firingAlerts: alerts.filter((a) => a.state === 'firing').length,
    },
    services,
    alerts: alerts.filter((a) => a.state === 'firing'),
  })
}))

router.get('/services/:name', asyncHandler(async (req, res) => {
  if (!(req.params.name in SERVICE_PORTS)) throw AppError.notFound('Unknown service')
  res.json({ status: statusOf(req.params.name), series: seriesOf(req.params.name, Math.min(240, Number(req.query.points) || 60)) })
}))

router.get('/infrastructure', asyncHandler(async (_req, res) => res.json({ items: last?.infra ?? [] })))
router.get('/events', asyncHandler(async (_req, res) => res.json({ topics: last?.streams ?? [] })))
router.get('/queues', asyncHandler(async (_req, res) => res.json({ queues: last?.queues ?? {} })))

router.get('/host', (_req, res) => {
  const [l1, l5, l15] = os.loadavg()
  res.json({ hostname: os.hostname(), platform: os.platform(), cpus: os.cpus().length, loadAverage: { l1, l5, l15 }, memory: { totalMB: Math.round(os.totalmem() / 1048576), freeMB: Math.round(os.freemem() / 1048576) }, uptimeSeconds: Math.round(os.uptime()) })
})

router.get('/alerts', asyncHandler(async (_req, res) => res.json({ active: await activeAlerts(), history: await alertHistory() })))

router.post('/alerts/silence', validate(z.object({ key: z.string().min(1).max(200), minutes: z.number().int().min(1).max(10_080).default(60) })), asyncHandler(async (req, res) => {
  await silence(req.body.key, req.body.minutes)
  res.json({ silenced: req.body.key, minutes: req.body.minutes })
}))

const ruleSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{2,40}$/),
  name: z.string().min(2).max(80),
  kind: z.enum(['service_down', 'error_rate', 'latency_p95', 'consumer_lag', 'dead_letters', 'queue_failed', 'infra_down', 'redis_memory']),
  threshold: z.number().min(0).max(1_000_000),
  forSeconds: z.number().int().min(0).max(3600),
  severity: z.enum(['info', 'warning', 'critical']),
  enabled: z.boolean().default(true),
  actions: z.array(z.enum(['log', 'email', 'webhook', 'slack'])).max(4),
})
router.get('/alerts/rules', asyncHandler(async (_req, res) => res.json(await loadRules())))
router.put('/alerts/rules/:id', validate(ruleSchema.omit({ id: true })), asyncHandler(async (req, res) => {
  const rule: Rule = { ...req.body, id: req.params.id }
  if (!/^[a-z0-9-]{2,40}$/.test(rule.id)) throw AppError.badRequest('Rule ids use lowercase letters, numbers and dashes')
  await saveRule(rule)
  res.json(rule)
}))
router.delete('/alerts/rules/:id', asyncHandler(async (req, res) => {
  await deleteRule(req.params.id)
  res.json({ message: 'Rule deleted' })
}))

void startService({
  name: 'monitoring',
  trustProxy: true,
  cors: false,
  routes: (app) => {
    app.get('/prometheus', async (_req, res) => {
      res.set('Content-Type', reg.contentType)
      res.end(await reg.metrics())
    })
    app.use('/api/monitoring', router)
  },
  ready: { redis: () => redisHealthy() },
  onStart: () => {
    void cycle()
    timer = setInterval(() => void cycle(), SCRAPE_MS)
  },
  onStop: async () => {
    clearInterval(timer)
    await createEventBus('monitoring').close()
  },
}).catch((e) => {
  console.error('monitoring-service failed to start', e)
  process.exit(1)
})
