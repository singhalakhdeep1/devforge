import { Router } from 'express'
import { asyncHandler, createEventBus, internalOnly, redisHealthy, startService, TOPICS } from '@devhub/shared'
import { loadWithAccess } from './access'
import codeRouter from './code'
import { prisma } from './db'
import { flushAll, startRelay, stats } from './rooms'
import documents from './routes'
import { attachWebSocket } from './ws'

let ws: ReturnType<typeof attachWebSocket> | undefined

/** For the GraphQL API: may this user see a document (and its live changes)? */
const internal = Router()
internal.use(internalOnly)
internal.get('/documents/:id/access/:userId', asyncHandler(async (req, res) => {
  const found = /^[0-9a-f-]{36}$/i.test(req.params.id) ? await loadWithAccess(req.params.id, req.params.userId) : null
  res.json({ access: found?.access ?? null })
}))

void startService({
  name: 'editor',
  trustProxy: true,
  cors: false,
  jsonLimit: '1mb',
  routes: (app) => {
    app.get('/api/editor/stats', (_req, res) => res.json(stats()))
    app.use('/api/editor', documents)
    app.use('/api/editor', codeRouter)
    app.use('/internal', internal)
  },
  ready: { postgres: () => prisma.$queryRaw`SELECT 1`, redis: () => redisHealthy() },
  onStart: async (server) => {
    ws = attachWebSocket(server)
    await startRelay()
    // when an account is deleted, its documents and snippets go with it
    await createEventBus('editor').subscribe(TOPICS.userDeleted, 'editor-service', async ({ data }) => {
      await prisma.document.deleteMany({ where: { ownerId: data.id } })
      await prisma.documentMember.deleteMany({ where: { userId: data.id } })
      await prisma.snippet.deleteMany({ where: { userId: data.id } })
    })
  },
  onStop: async () => {
    ws?.close()
    await flushAll() // never lose the last few seconds of typing on shutdown
    await createEventBus('editor').close()
    await prisma.$disconnect()
  },
}).catch((e) => {
  console.error('editor-service failed to start', e)
  process.exit(1)
})
