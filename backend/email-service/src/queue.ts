import { Queue, Worker, type Job } from 'bullmq'
import { createLogger, createRedis, emailDelivery, trackBackgroundJob } from '@devhub/shared'
import { isTemplate, render, type TemplateName } from './templates'
import { transportFor } from './transport'

const log = createLogger('email')
const QUEUE = 'email'

export interface EmailJob {
  to: string
  template: TemplateName
  data: Record<string, unknown>
}

let queue: Queue<EmailJob> | null = null
let worker: Worker<EmailJob> | null = null

export const emailQueue = () => (queue ??= new Queue<EmailJob>(QUEUE, {
  connection: createRedis({ name: 'email-queue', blocking: true }),
  defaultJobOptions: { attempts: 5, backoff: { type: 'exponential', delay: 5000 }, removeOnComplete: { count: 1000 }, removeOnFail: { count: 5000 } },
}))

/** Queue an email. `dedupeId` (the event id) makes redelivered events harmless: the same id is only queued once. */
export async function enqueue(job: EmailJob, dedupeId?: string) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(job.to)) {
    log.logWarning('skipping email with an invalid recipient', { template: job.template })
    return null
  }
  return emailQueue().add('send', job, dedupeId ? { jobId: dedupeId } : undefined)
}

async function process(job: Job<EmailJob>) {
  const started = Date.now()
  const { to, template, data } = job.data
  const mail = render(template, data)
  try {
    await transportFor().send({ to, ...mail })
    emailDelivery.inc({ status: 'sent', template, service: 'email' })
    trackBackgroundJob(QUEUE, template, 'email', 'completed', (Date.now() - started) / 1000)
    return { to, transport: transportFor().kind }
  } catch (e) {
    emailDelivery.inc({ status: 'failed', template, service: 'email' })
    trackBackgroundJob(QUEUE, template, 'email', 'failed', (Date.now() - started) / 1000)
    throw e // BullMQ retries with backoff, then keeps it in the failed set for the admin
  }
}

export function startWorker() {
  worker ??= new Worker<EmailJob>(QUEUE, process, {
    connection: createRedis({ name: 'email-worker', blocking: true }),
    concurrency: 5,
    limiter: { max: 20, duration: 1000 }, // stay inside provider rate limits
  })
  worker.on('failed', (job, err) => log.logWarning('email job failed', { id: job?.id, attempts: job?.attemptsMade, error: err.message }))
  return worker
}

export async function closeQueue() {
  await worker?.close()
  await queue?.close()
}

export { isTemplate }
