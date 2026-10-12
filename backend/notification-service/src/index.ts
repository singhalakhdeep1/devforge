import mongoose from 'mongoose'
import { TOPICS, createEventBus, createLogger, env, startService } from '@devhub/shared'
import { Notification } from './model'
import router, { internalRouter } from './routes'
import { createNotification } from './service'

const log = createLogger('notification')
const GROUP = 'notification-service'

async function startConsumers() {
    const bus = createEventBus('notification')

    // Any service can ask for a notification by publishing this event
    await bus.subscribe(TOPICS.notificationRequested, GROUP, async ({ data }) => {
        await createNotification(data)
    })

    await bus.subscribe(TOPICS.userRegistered, GROUP, async ({ data }) => {
        await createNotification({ userId: data.id, type: 'system', title: 'Welcome to DevForge', body: 'Browse the catalogue and start your first course.', link: '/courses' })
    })

    await bus.subscribe(TOPICS.certificateIssued, GROUP, async ({ data }) => {
        await createNotification({ userId: data.userId, type: 'certificate', title: 'Certificate earned', body: data.courseTitle ? `You completed ${data.courseTitle}` : undefined, link: '/certificates' })
    })

    // The account is gone: its notifications go too
    await bus.subscribe(TOPICS.userDeleted, GROUP, async ({ data }) => {
        await Notification.deleteMany({ userId: data.id })
    })
    log.logInformation('event consumers started')
}

void (async () => {
    await mongoose.connect(env('MONGODB_URI', 'mongodb://localhost:27017') + '', { dbName: env('NOTIFICATION_DB', 'devforge_notifications'), serverSelectionTimeoutMS: 8000 })
    await Notification.init() // make sure the TTL / lookup indexes exist before serving
    await startService({
        name: 'notification',
        trustProxy: true,
        cors: false,
        routes: (app) => {
            app.use('/api/notifications', router)
            app.use('/internal', internalRouter)
        },
        ready: { mongodb: async () => mongoose.connection.readyState === 1 },
        onStart: () => startConsumers(),
        onStop: async () => {
            await createEventBus('notification').close()
            await mongoose.disconnect()
        },
    })
})().catch((e) => {
    console.error('notification-service failed to start', e)
    process.exit(1)
})
