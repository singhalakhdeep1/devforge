import { createEventBus, redisHealthy, startService } from '@devhub/shared';
import { prisma } from './db';
import router, { internalRouter } from './routes';

void startService({
  name: 'auth',
  trustProxy: true,
  cors: false, // only reachable through the gateway, which owns CORS
  routes: (app) => {
    app.use('/api/auth', router);
    app.use('/internal', internalRouter);
  },
  ready: {
    postgres: () => prisma.$queryRaw`SELECT 1`,
    redis: () => redisHealthy(),
  },
  onStop: async () => {
    await createEventBus('auth').close();
    await prisma.$disconnect();
  },
}).catch((e) => {
  console.error('auth-service failed to start', e);
  process.exit(1);
});
