import { TOPICS, createLogger, emit } from '@devhub/shared'
import { Role } from './generated/client'
import { bus, notify } from './lib/notify'
import { prisma } from './lib/prisma'

const log = createLogger('course')
const GROUP = 'course-service'
const role = (r: unknown): Role => ((Object.values(Role) as string[]).includes(String(r)) ? (r as Role) : 'STUDENT')

/** Keeps the local user projection in step with the auth-service, and fulfils paid orders. */
export async function startConsumers() {
    await bus.subscribe(TOPICS.userRegistered, GROUP, async ({ data }) => {
        await prisma.user.upsert({
            where: { id: data.id },
            update: { email: data.email, name: data.name, avatar: data.avatar ?? null, role: role(data.role) },
            create: { id: data.id, email: data.email, name: data.name, avatar: data.avatar ?? null, role: role(data.role) },
        })
    })

    await bus.subscribe(TOPICS.userUpdated, GROUP, async ({ data }) => {
        await prisma.user.updateMany({
            where: { id: data.id },
            data: { name: data.name, avatar: data.avatar ?? null, role: role(data.role), ...(typeof data.isVerified === 'boolean' ? { isVerified: data.isVerified } : {}) },
        })
    })

    await bus.subscribe(TOPICS.userDeleted, GROUP, async ({ data }) => {
        await prisma.user.deleteMany({ where: { id: data.id } })
    })

    // payment.succeeded -> record revenue + enroll. Idempotent: orderId is unique, enrollment is an upsert.
    await bus.subscribe(TOPICS.paymentSucceeded, GROUP, async ({ data }) => {
        const course = await prisma.course.findUnique({ where: { id: Number(data.courseId) }, select: { id: true, title: true, instructorId: true } })
        if (!course) {
            log.logWarning('payment for unknown course', { orderId: data.orderId, courseId: data.courseId })
            return
        }
        // make sure the buyer exists locally before the enrollment foreign key
        await prisma.user.upsert({ where: { id: data.userId }, update: {}, create: { id: data.userId, email: data.email ?? `${data.userId}@unknown.local`, name: data.name ?? 'Learner' } })

        const first = await prisma.coursePayment.createMany({
            data: [{ orderId: String(data.orderId), userId: data.userId, courseId: course.id, amount: Number(data.amount) }],
            skipDuplicates: true,
        })
        await prisma.enrollment.upsert({
            where: { userId_courseId: { userId: data.userId, courseId: course.id } },
            update: {},
            create: { userId: data.userId, courseId: course.id },
        })
        if (first.count > 0) {
            await notify({ userId: data.userId, type: 'payment', title: 'Payment received', body: `You are enrolled in ${course.title}`, link: `/learn/${course.id}` })
            await notify({ userId: course.instructorId, type: 'enrollment', title: 'New paid enrollment', body: `${course.title} was purchased`, link: `/instructor/courses/${course.id}` })
            emit(bus, TOPICS.courseEnrolled, 'course.enrolled', { userId: data.userId, courseId: course.id, paid: true, amount: Number(data.amount) }, data.userId)
        }
    })

    // payment.refunded -> drop the revenue row and the access that was bought
    await bus.subscribe(TOPICS.paymentRefunded, GROUP, async ({ data }) => {
        await prisma.coursePayment.deleteMany({ where: { orderId: String(data.orderId) } })
        const stillPaid = await prisma.coursePayment.count({ where: { userId: data.userId, courseId: Number(data.courseId) } })
        if (stillPaid === 0) await prisma.enrollment.deleteMany({ where: { userId: data.userId, courseId: Number(data.courseId) } })
        await notify({ userId: data.userId, type: 'payment', title: 'Refund issued', body: 'Your purchase was refunded and course access removed.', link: '/courses' })
    })

    log.logInformation('event consumers started')
}
