import { createEventBus, redisHealthy, startService, TOPICS } from '@devhub/shared'
import codeRouter from './code'
import { prisma } from './db'
import { flushAll, startRelay, stats } from './rooms'
import documents from './routes'
import { attachWebSocket } from './ws'

let ws: ReturnType<typeof attachWebSocket> | undefined

void startService({
  name: 'editor',
  trustProxy: true,
  cors: false,
  jsonLimit: '1mb',
  routes: (app) => {
    app.get('/api/editor/stats', (_req, res) => res.json(stats()))
    app.use('/api/editor', documents)
    app.use('/api/editor', codeRouter)
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
