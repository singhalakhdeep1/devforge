import { Router } from 'express'
import { z } from 'zod'
import { AppError, TOPICS, asyncHandler, createEventBus, createLogger, env, getRedis, redisHealthy, requireRole, startService, validate } from '@devhub/shared'
import { closeQueue, emailQueue, enqueue, isTemplate, startWorker } from './queue'
import { SAMPLE, TEMPLATES, render } from './templates'
import { OUTBOX_KEY, transportFor } from './transport'

const log = createLogger('email')
const GROUP = 'email-service'

async function startConsumers() {
  const bus = createEventBus('email')

  // auth-service (and anyone else) asks for an email by template name
  await bus.subscribe(TOPICS.emailRequested, GROUP, async (event) => {
    const { to, template, name, url, data } = event.data as { to: string; template: string; name?: string; url?: string; data?: Record<string, unknown> }
    if (!isTemplate(template)) return log.logWarning('unknown email template ignored', { template })
    await enqueue({ to, template, data: { name, url, ...data } }, event.id)
  })

  // a receipt for every successful payment
  await bus.subscribe(TOPICS.paymentSucceeded, GROUP, async (event) => {
    const p = event.data as { email?: string; name?: string; orderId: string; amount: number; currency?: string; courseId: number }
    if (p.email) await enqueue({ to: p.email, template: 'receipt', data: { name: p.name, amount: p.amount, currency: p.currency, orderId: p.orderId, courseId: p.courseId } }, `receipt-${p.orderId}`)
  })
  log.logInformation('email consumers started')
}

const admin = Router()
admin.use(requireRole('ADMIN'))

admin.get('/queue', asyncHandler(async (_req, res) => {
  res.json({ transport: transportFor().kind, counts: await emailQueue().getJobCounts('waiting', 'active', 'completed', 'failed', 'delayed') })
}))

admin.get('/failed', asyncHandler(async (_req, res) => {
  const jobs = await emailQueue().getFailed(0, 49)
  res.json(jobs.map((j) => ({ id: j.id, to: j.data.to, template: j.data.template, attempts: j.attemptsMade, reason: j.failedReason, at: j.finishedOn })))
}))

admin.post('/failed/:id/retry', asyncHandler(async (req, res) => {
  const job = await emailQueue().getJob(req.params.id)
  if (!job) throw AppError.notFound('Job not found')
  await job.retry()
  res.json({ message: 'Retrying' })
}))

admin.get('/templates', (_req, res) => res.json({ templates: TEMPLATES }))

admin.get('/preview/:template', (req, res) => {
  if (!isTemplate(req.params.template)) throw AppError.notFound('Unknown template')
  const r = render(req.params.template, SAMPLE[req.params.template])
  if (req.query.format === 'json') return res.json(r)
  res.type('html').send(r.html)
})

admin.post('/send-test', validate(z.object({ to: z.string().email(), template: z.enum(['welcome', 'verify', 'reset', 'receipt']).default('welcome') })), asyncHandler(async (req, res) => {
  const job = await enqueue({ to: req.body.to, template: req.body.template, data: SAMPLE[req.body.template as keyof typeof SAMPLE] })
  res.status(202).json({ queued: Boolean(job), jobId: job?.id })
}))

// Without a provider the messages land here so a developer can click the links
admin.get('/outbox', asyncHandler(async (_req, res) => {
  if (transportFor().kind !== 'log') throw AppError.notFound('A real email provider is configured; there is no dev outbox')
  res.json((await getRedis().lrange(OUTBOX_KEY, 0, 49)).map((m) => JSON.parse(m)))
}))

void startService({
  name: 'email',
  trustProxy: true,
  cors: false,
  routes: (app) => {
    app.use('/api/admin/email', admin)
  },
  ready: { redis: () => redisHealthy() },
  onStart: async () => {
    startWorker()
    await startConsumers()
    log.logInformation(`email transport: ${transportFor().kind}${env('EMAIL_FROM') ? '' : ' (set EMAIL_FROM)'}`)
  },
  onStop: async () => {
    await closeQueue()
    await createEventBus('email').close()
  },
}).catch((e) => {
  console.error('email-service failed to start', e)
  process.exit(1)
})
