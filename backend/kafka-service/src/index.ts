import { Router } from 'express'
import { z } from 'zod'
import { AppError, TOPICS, asyncHandler, createEventBus, requireRole, startService, validate } from '@devhub/shared'
import { makeBackend } from './backends'

const backend = makeBackend()
const bus = createEventBus('kafka-service')
const knownTopics = new Set<string>(Object.values(TOPICS))

const router = Router()
router.use(requireRole('ADMIN'))

const topicParam = (t: string) => {
  if (!/^devforge\.[\w.-]{1,100}$/.test(t) || t.endsWith('.dlq')) throw AppError.badRequest('Use a devforge.* topic name without the .dlq suffix')
  return t
}

router.get('/status', asyncHandler(async (_req, res) => {
  const healthy = await backend.healthy()
  res.json({ transport: backend.kind, healthy })
}))

router.get('/topics', asyncHandler(async (_req, res) => {
  res.json({ transport: backend.kind, topics: await backend.topics() })
}))

router.get('/groups', asyncHandler(async (_req, res) => {
  res.json({ transport: backend.kind, groups: await backend.groups() })
}))

router.get('/dlq/:topic', validate(z.object({ limit: z.coerce.number().int().min(1).max(200).default(50) }), 'query'), asyncHandler(async (req, res) => {
  const topic = topicParam(req.params.topic)
  const letters = await backend.deadLetters(topic, Number((req.query as { limit?: number }).limit ?? 50))
  res.json({ topic, count: letters.length, letters: letters.map((l) => ({ ref: l.ref, id: l.event?.id, type: l.event?.type, source: l.event?.source, at: l.event?.timestamp, data: l.event?.data, unreadable: !l.event })) })
}))

// Put dead letters back on their topic. Event ids are preserved, so consumers that already handled one skip it.
router.post('/dlq/:topic/replay', validate(z.object({ limit: z.number().int().min(1).max(500).default(100) })), asyncHandler(async (req, res) => {
  const topic = topicParam(req.params.topic)
  const replayed = await backend.replay(topic, req.body.limit, (e) => bus.republish({ ...e, topic }))
  res.json({ topic, replayed })
}))

router.delete('/dlq/:topic', asyncHandler(async (req, res) => {
  const topic = topicParam(req.params.topic)
  res.json({ topic, purged: await backend.purge(topic) })
}))

// For operators: emit a harmless test event on a known topic to see the pipeline react
router.post('/publish', validate(z.object({ topic: z.string(), type: z.string().min(1).max(80), data: z.record(z.unknown()).default({}) })), asyncHandler(async (req, res) => {
  if (!knownTopics.has(req.body.topic)) throw AppError.badRequest('Unknown topic. Known topics: ' + [...knownTopics].join(', '))
  const e = await bus.publish(req.body.topic, req.body.type, req.body.data)
  res.status(202).json({ published: e.id, topic: e.topic })
}))

router.get('/known-topics', (_req, res) => res.json({ topics: [...knownTopics].sort() }))

void startService({
  name: 'kafka',
  trustProxy: true,
  cors: false,
  routes: (app) => {
    app.use('/api/admin/events', router)
  },
  ready: { eventBus: () => backend.healthy() },
  onStop: async () => {
    await bus.close()
    await backend.close()
  },
}).catch((e) => {
  console.error('kafka-service failed to start', e)
  process.exit(1)
})
