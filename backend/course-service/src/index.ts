import { CacheService, createEventBus, httpCache, invalidateOnWrite, redisHealthy, startService } from '@devhub/shared'
import { startConsumers } from './events'
import internalRoutes from './internal'
import { prisma } from './lib/prisma'
import certificateRoutes from './routes/certificate.routes'
import courseRoutes from './routes/course.routes'
import dashboardRoutes from './routes/dashboard.routes'
import discussionRoutes from './routes/discussion.routes'
import instructorRoutes from './routes/instructor.routes'
import learnRoutes from './routes/learn.routes'

const cache = new CacheService('course', 'course')

void startService({
    name: 'course',
    trustProxy: true,
    cors: false, // reachable only through the gateway
    routes: (app) => {
        app.use(invalidateOnWrite(cache))
        // Public catalogue reads are cached for a minute (personalised requests always bypass the cache)
        app.use('/api/courses', httpCache(cache, 60), courseRoutes)
        app.use('/api/learn', learnRoutes)
        app.use('/api/instructor', instructorRoutes)
        app.use('/api/discussions', discussionRoutes)
        app.use('/api/certificates', certificateRoutes)
        app.use('/api/dashboard', dashboardRoutes)
        app.use('/internal', internalRoutes)
    },
    ready: { postgres: () => prisma.$queryRaw`SELECT 1`, redis: () => redisHealthy() },
    onStart: () => startConsumers(),
    onStop: async () => {
        await createEventBus('course').close()
        await prisma.$disconnect()
    },
}).catch((e) => {
    console.error('course-service failed to start', e)
    process.exit(1)
})
