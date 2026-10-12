import { Request, Response, Router } from 'express'
import Stripe from 'stripe'
import { z } from 'zod'
import { env, stripeConfigured } from '../config/env'
import { HttpError, badRequest, conflict, handle, notFound } from '../lib/errors'
import { notify } from '../lib/notify'
import { prisma } from '../lib/prisma'
import { protect } from '../middleware/auth'
import { validate } from '../middleware/validate'

const router = Router()

let client: Stripe | null = null
function stripe(): Stripe {
    if (!stripeConfigured) throw new HttpError(503, 'Payments are not configured on this server')
    client ??= new Stripe(env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })
    return client
}

/**
 * Marks the order paid and enrolls the buyer. Safe to call repeatedly (webhook retries,
 * the user returning from Stripe, a page refresh): only the first call has an effect.
 */
async function fulfillSession(session: Stripe.Checkout.Session) {
    if (session.payment_status !== 'paid') return null

    const order = await prisma.order.findUnique({ where: { stripeSessionId: session.id }, include: { course: { select: { title: true, instructorId: true } } } })
    if (!order) return null

    const flipped = await prisma.order.updateMany({ where: { id: order.id, status: { not: 'PAID' } }, data: { status: 'PAID', paidAt: new Date() } })
    await prisma.enrollment.upsert({
        where: { userId_courseId: { userId: order.userId, courseId: order.courseId } },
        update: {},
        create: { userId: order.userId, courseId: order.courseId },
    })

    if (flipped.count > 0) {
        await notify({ userId: order.userId, type: 'payment', title: 'Payment received', body: `You are enrolled in ${order.course.title}`, link: `/learn/${order.courseId}` })
        await notify({ userId: order.course.instructorId, type: 'enrollment', title: 'New paid enrollment', body: `${order.course.title} was purchased`, link: `/instructor/courses/${order.courseId}` })
    }
    return order
}

// POST /api/payments/checkout  { courseId }
router.post(
    '/checkout',
    protect,
    validate(z.object({ courseId: z.number().int() })),
    handle(async (req, res) => {
        const { courseId } = req.body as { courseId: number }
        const course = await prisma.course.findUnique({ where: { id: courseId } })
        if (!course || !course.published) throw notFound('Course')
        if (course.instructorId === req.user.id) throw badRequest('You cannot buy your own course')

        const price = Number(course.price)
        if (price <= 0) throw badRequest('This course is free. Use the enroll button.')
        if (await prisma.enrollment.findUnique({ where: { userId_courseId: { userId: req.user.id, courseId } } })) throw conflict('You are already enrolled in this course')

        const order = await prisma.order.create({ data: { userId: req.user.id, courseId, amount: course.price } })
        const session = await stripe().checkout.sessions.create({
            mode: 'payment',
            customer_email: (await prisma.user.findUniqueOrThrow({ where: { id: req.user.id } })).email,
            line_items: [
                {
                    quantity: 1,
                    price_data: {
                        currency: 'usd',
                        unit_amount: Math.round(price * 100),
                        product_data: { name: course.title, description: course.description.slice(0, 250) },
                    },
                },
            ],
            metadata: { orderId: String(order.id), userId: req.user.id, courseId: String(courseId) },
            success_url: `${env.FRONTEND_URL}/courses/${courseId}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${env.FRONTEND_URL}/courses/${courseId}?payment=cancelled`,
        })
        await prisma.order.update({ where: { id: order.id }, data: { stripeSessionId: session.id } })

        res.json({ url: session.url })
    })
)

// POST /api/payments/confirm  { sessionId }  - called when the buyer returns from Stripe
router.post(
    '/confirm',
    protect,
    validate(z.object({ sessionId: z.string().min(1).max(200) })),
    handle(async (req, res) => {
        const order = await prisma.order.findUnique({ where: { stripeSessionId: req.body.sessionId } })
        if (!order || order.userId !== req.user.id) throw notFound('Order')

        const session = await stripe().checkout.sessions.retrieve(req.body.sessionId)
        const fulfilled = await fulfillSession(session)
        res.json({ paid: Boolean(fulfilled), courseId: order.courseId })
    })
)

// GET /api/payments/orders
router.get(
    '/orders',
    protect,
    handle(async (req, res) => {
        const orders = await prisma.order.findMany({
            where: { userId: req.user.id },
            orderBy: { createdAt: 'desc' },
            include: { course: { select: { id: true, title: true } } },
        })
        res.json(orders.map((o) => ({ ...o, amount: Number(o.amount) })))
    })
)

/** Stripe webhook. Mounted in app.ts with a raw body parser, before express.json(). */
export const stripeWebhook = async (req: Request, res: Response) => {
    if (!stripeConfigured || !env.STRIPE_WEBHOOK_SECRET) return res.status(503).json({ error: 'Webhook is not configured' })

    let event: Stripe.Event
    try {
        event = stripe().webhooks.constructEvent(req.body, String(req.headers['stripe-signature'] ?? ''), env.STRIPE_WEBHOOK_SECRET)
    } catch {
        return res.status(400).json({ error: 'Invalid signature' })
    }

    try {
        if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
            await fulfillSession(event.data.object as Stripe.Checkout.Session)
        } else if (event.type === 'checkout.session.expired' || event.type === 'checkout.session.async_payment_failed') {
            const session = event.data.object as Stripe.Checkout.Session
            await prisma.order.updateMany({ where: { stripeSessionId: session.id, status: 'PENDING' }, data: { status: 'FAILED' } })
        }
        res.json({ received: true })
    } catch (error) {
        console.error('Stripe webhook processing failed:', error)
        res.status(500).json({ error: 'Webhook processing failed' }) // Stripe retries
    }
}

export default router
