import { TOPICS, createEventBus, redisHealthy, startService } from '@devhub/shared'
import { prisma } from './db'
import router, { internalRouter, publicRouter, purgeUser } from './routes'
import { storage } from './storage'

void startService({
  name: 'file',
  trustProxy: true,
  cors: false,
  routes: (app) => {
    app.use('/uploads', publicRouter)
    app.use('/api/files', router)
    app.use('/internal', internalRouter)
  },
  ready: { postgres: () => prisma.$queryRaw`SELECT 1`, redis: () => redisHealthy(), storage: async () => storage().kind },
  onStart: async () => {
    await createEventBus('file').subscribe(TOPICS.userDeleted, 'file-service', async ({ data }) => purgeUser(data.id))
  },
  onStop: async () => {
    await createEventBus('file').close()
    await prisma.$disconnect()
  },
}).catch((e) => {
  console.error('file-service failed to start', e)
  process.exit(1)
})
