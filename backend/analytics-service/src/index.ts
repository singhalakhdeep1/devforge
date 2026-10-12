import cron from 'node-cron'
import mongoose from 'mongoose'
import { TOPICS, createEventBus, createLogger, env, startService } from '@devhub/shared'
import { AnalyticsEvent, CourseDay, Daily, DailyActive, FirstSeen } from './model'
import router from './routes'
import { dayOf, daysAgo, rebuildDay, recordDomain } from './service'

const log = createLogger('analytics')
const GROUP = 'analytics-service'
let tasks: cron.ScheduledTask[] = []

async function startConsumers() {
    const bus = createEventBus('analytics')
    const at = (e: { timestamp: string }) => new Date(e.timestamp)

    await bus.subscribe(TOPICS.userRegistered, GROUP, (e) => recordDomain(e.id, 'user.registered', at(e), e.data.id, { role: e.data.role }, { signups: 1 }).then(() => undefined))
    await bus.subscribe(TOPICS.courseEnrolled, GROUP, (e) => recordDomain(e.id, 'course.enrolled', at(e), e.data.userId, { courseId: e.data.courseId, paid: Boolean(e.data.paid) }, { enrollments: 1 }, Number(e.data.courseId)).then(() => undefined))
    await bus.subscribe(TOPICS.courseCompleted, GROUP, (e) => recordDomain(e.id, 'course.completed', at(e), e.data.userId, { courseId: e.data.courseId }, { completions: 1 }, Number(e.data.courseId)).then(() => undefined))
    await bus.subscribe(TOPICS.lessonCompleted, GROUP, (e) => recordDomain(e.id, 'lesson.completed', at(e), e.data.userId, { courseId: e.data.courseId, lessonId: e.data.lessonId }, { lessonsCompleted: 1 }).then(() => undefined))
    await bus.subscribe(TOPICS.paymentSucceeded, GROUP, (e) => {
        const cents = Number(e.data.amountCents ?? Math.round(Number(e.data.amount) * 100))
        return recordDomain(e.id, 'payment.succeeded', at(e), e.data.userId, { courseId: e.data.courseId, amountCents: cents }, { revenueCents: cents }, Number(e.data.courseId)).then(() => undefined)
    })
    await bus.subscribe(TOPICS.paymentRefunded, GROUP, (e) => {
        const cents = Math.round(Number(e.data.amount) * 100)
        return recordDomain(e.id, 'payment.refunded', at(e), e.data.userId, { courseId: e.data.courseId, amountCents: cents }, { revenueCents: -cents }, Number(e.data.courseId)).then(() => undefined)
    })
    // the account is gone: forget what it did
    await bus.subscribe(TOPICS.userDeleted, GROUP, async (e) => {
        await Promise.all([AnalyticsEvent.deleteMany({ userId: e.data.id }), DailyActive.deleteMany({ userId: e.data.id }), FirstSeen.deleteMany({ userId: e.data.id })])
    })
    log.logInformation('analytics consumers started')
}

void (async () => {
    await mongoose.connect(env('MONGODB_URI', 'mongodb://localhost:27017'), { dbName: env('ANALYTICS_DB', 'devforge_analytics'), serverSelectionTimeoutMS: 8000 })
    await Promise.all([AnalyticsEvent.init(), Daily.init(), DailyActive.init(), FirstSeen.init(), CourseDay.init()])
    await startService({
        name: 'analytics',
        trustProxy: true,
        cors: false,
        jsonLimit: '256kb',
        routes: (app) => {
            app.use('/api/analytics', router)
        },
        ready: { mongodb: async () => mongoose.connection.readyState === 1 },
        onStart: async () => {
            await startConsumers()
            // 00:10 UTC: recompute yesterday (and the day before, for late events) from raw events so drift cannot build up
            tasks.push(cron.schedule('10 0 * * *', () => void Promise.all([rebuildDay(dayOf(daysAgo(1))), rebuildDay(dayOf(daysAgo(2)))]).catch((e) => log.logError('nightly rollup failed', String(e))), { timezone: 'UTC' }))
        },
        onStop: async () => {
            tasks.forEach((t) => t.stop())
            await createEventBus('analytics').close()
            await mongoose.disconnect()
        },
    })
})().catch((e) => {
    console.error('analytics-service failed to start', e)
    process.exit(1)
})
