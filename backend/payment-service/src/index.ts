import express from 'express'
import { createEventBus, redisHealthy, startService } from '@devhub/shared'
import { prisma, startOutboxRelay } from './db'
import router, { internalRouter } from './routes'
import { stripeWebhook } from './webhook'

let stopRelay: (() => void) | undefined

void startService({
  name: 'payment',
  trustProxy: true,
  cors: false,
  // Stripe signs the raw bytes, so this route must be registered before express.json()
  beforeBody: (app) => {
    app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), stripeWebhook)
  },
  routes: (app) => {
    app.use('/api/payments', router)
    app.use('/internal', internalRouter)
  },
  ready: { postgres: () => prisma.$queryRaw`SELECT 1`, redis: () => redisHealthy() },
  onStart: () => {
    stopRelay = startOutboxRelay()
  },
  onStop: async () => {
    stopRelay?.()
    await createEventBus('payment').close()
    await prisma.$disconnect()
  },
}).catch((e) => {
  console.error('payment-service failed to start', e)
  process.exit(1)
})
