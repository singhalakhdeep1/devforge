import { Router } from 'express'
import { z } from 'zod'
import { AppError, asyncHandler, authenticate, createServiceClient, internalOnly, requireRole, userOf, validate } from '@devhub/shared'
import { cfg, stripeConfigured, type PlanId } from './config'
import { prisma } from './db'
import { ACTIVE_STATUSES, activeSubscription, ensureCustomer, fulfillSession, refundOrder, toCents } from './service'
import { stripe } from './stripe'

const router = Router()
const courses = createServiceClient('course')
const me = (req: Parameters<typeof userOf>[0]) => userOf(req)!

const orderJson = (o: { amountCents: number; refundedCents: number } & Record<string, unknown>) => ({ ...o, amount: o.amountCents / 100, refunded: o.refundedCents / 100 })

router.get('/config', (_req, res) => {
  res.json({
    enabled: stripeConfigured,
    currency: cfg.currency,
    refundWindowDays: cfg.refundWindowDays,
    plans: Object.values(cfg.plans).map((p) => ({ id: p.id, name: p.name, amountCents: p.amountCents, interval: p.interval })),
  })
})

router.use(authenticate)

/* ───────────────────────── course checkout ───────────────────────── */

// POST /api/payments/checkout  { courseId }
router.post(
  '/checkout',
  validate(z.object({ courseId: z.number().int().positive() })),
  asyncHandler(async (req, res) => {
    const user = me(req)
    const { courseId } = req.body as { courseId: number }
    const course = await courses.get<{ id: number; title: string; description: string; price: number; published: boolean; instructorId: string }>(`/internal/courses/${courseId}`)
    if (!course.published) throw AppError.notFound('Course not found')
    if (course.instructorId === user.id) throw AppError.badRequest('You cannot buy your own course')
    if (course.price <= 0) throw AppError.badRequest('This course is free. Use the enroll button.')
    if ((await courses.get<{ enrolled: boolean }>(`/internal/enrollments/${user.id}/${courseId}`)).enrolled) throw AppError.conflict('You are already enrolled in this course')

    const customer = await ensureCustomer(user)
    // a new attempt replaces earlier unpaid ones for the same course
    const stale = await prisma.order.findMany({ where: { userId: user.id, courseId, status: 'PENDING' } })
    for (const o of stale) {
      if (o.stripeSessionId) await stripe().checkout.sessions.expire(o.stripeSessionId).catch(() => undefined)
    }
    await prisma.order.updateMany({ where: { id: { in: stale.map((o) => o.id) } }, data: { status: 'EXPIRED' } })

    const order = await prisma.order.create({
      data: { userId: user.id, buyerEmail: user.email, buyerName: user.name, courseId, courseTitle: course.title, amountCents: toCents(course.price), currency: cfg.currency },
    })
    const session = await stripe().checkout.sessions.create({
      mode: 'payment',
      customer,
      allow_promotion_codes: true,
      line_items: [{ quantity: 1, price_data: { currency: cfg.currency, unit_amount: order.amountCents, product_data: { name: course.title, description: course.description.slice(0, 250) } } }],
      metadata: { orderId: order.id, userId: user.id, courseId: String(courseId) },
      success_url: `${cfg.frontendUrl}/courses/${courseId}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${cfg.frontendUrl}/courses/${courseId}?payment=cancelled`,
    })
    await prisma.order.update({ where: { id: order.id }, data: { stripeSessionId: session.id } })
    res.json({ url: session.url, orderId: order.id })
  })
)

// POST /api/payments/confirm  { sessionId }   (buyer returns from Stripe; the webhook may be slower)
router.post(
  '/confirm',
  validate(z.object({ sessionId: z.string().min(1).max(200) })),
  asyncHandler(async (req, res) => {
    const order = await prisma.order.findUnique({ where: { stripeSessionId: req.body.sessionId } })
    if (!order || order.userId !== me(req).id) throw AppError.notFound('Order not found')
    const session = await stripe().checkout.sessions.retrieve(req.body.sessionId)
    const fulfilled = await fulfillSession(session)
    res.json({ paid: Boolean(fulfilled && fulfilled.status === 'PAID'), courseId: order.courseId })
  })
)

router.get(
  '/orders',
  asyncHandler(async (req, res) => {
    const orders = await prisma.order.findMany({ where: { userId: me(req).id }, orderBy: { createdAt: 'desc' }, take: 100 })
    res.json(orders.map((o) => orderJson({ ...o, course: { id: o.courseId, title: o.courseTitle } })))
  })
)

// POST /api/payments/orders/:id/refund   (buyer within the window, or an admin at any time)
router.post(
  '/orders/:id/refund',
  validate(z.object({ reason: z.string().trim().max(200).default('requested by customer') })),
  asyncHandler(async (req, res) => {
    const user = me(req)
    const order = await prisma.order.findUnique({ where: { id: req.params.id } })
    if (!order || (order.userId !== user.id && user.role !== 'ADMIN')) throw AppError.notFound('Order not found')
    if (user.role !== 'ADMIN') {
      const ageDays = (Date.now() - (order.paidAt?.getTime() ?? 0)) / 86_400_000
      if (!order.paidAt || ageDays > cfg.refundWindowDays) throw AppError.badRequest(`Refunds are available within ${cfg.refundWindowDays} days of purchase`)
    }
    res.json(orderJson(await refundOrder(order, req.body.reason)))
  })
)

/* ───────────────────────── Pro subscription ───────────────────────── */

router.post(
  '/subscribe',
  validate(z.object({ plan: z.enum(['monthly', 'yearly']) })),
  asyncHandler(async (req, res) => {
    const user = me(req)
    if (await activeSubscription(user.id)) throw AppError.conflict('You already have an active subscription')
    const plan = cfg.plans[req.body.plan as PlanId]
    const customer = await ensureCustomer(user)
    const session = await stripe().checkout.sessions.create({
      mode: 'subscription',
      customer,
      allow_promotion_codes: true,
      line_items: [
        plan.priceId
          ? { price: plan.priceId, quantity: 1 }
          : { quantity: 1, price_data: { currency: cfg.currency, unit_amount: plan.amountCents, recurring: { interval: plan.interval }, product_data: { name: plan.name } } },
      ],
      subscription_data: { metadata: { userId: user.id, plan: plan.id } },
      metadata: { userId: user.id, plan: plan.id },
      success_url: `${cfg.frontendUrl}/settings?subscribed=1#billing`,
      cancel_url: `${cfg.frontendUrl}/settings#billing`,
    })
    res.json({ url: session.url })
  })
)

router.get(
  '/subscription',
  asyncHandler(async (req, res) => {
    const sub = await prisma.subscription.findFirst({ where: { userId: me(req).id }, orderBy: { updatedAt: 'desc' } })
    res.json({ subscription: sub, active: Boolean(sub && ACTIVE_STATUSES.includes(sub.status)) })
  })
)

const ownSubscription = async (userId: string) => {
  const sub = await activeSubscription(userId)
  if (!sub) throw AppError.notFound('No active subscription')
  return sub
}

router.post(
  '/subscription/cancel',
  validate(z.object({ immediately: z.boolean().default(false) })),
  asyncHandler(async (req, res) => {
    const sub = await ownSubscription(me(req).id)
    if (req.body.immediately) await stripe().subscriptions.cancel(sub.stripeSubscriptionId)
    else await stripe().subscriptions.update(sub.stripeSubscriptionId, { cancel_at_period_end: true })
    // the webhook is the source of truth, but reflect the intent immediately
    await prisma.subscription.update({ where: { id: sub.id }, data: req.body.immediately ? { status: 'canceled' } : { cancelAtPeriodEnd: true } })
    res.json({ message: req.body.immediately ? 'Subscription cancelled' : 'Your subscription will end at the end of the billing period' })
  })
)

router.post(
  '/subscription/resume',
  asyncHandler(async (req, res) => {
    const sub = await ownSubscription(me(req).id)
    await stripe().subscriptions.update(sub.stripeSubscriptionId, { cancel_at_period_end: false })
    await prisma.subscription.update({ where: { id: sub.id }, data: { cancelAtPeriodEnd: false } })
    res.json({ message: 'Subscription resumed' })
  })
)

/* ───────────────────────── billing details (own customer only) ───────────────────────── */

const customerOf = async (userId: string) => (await prisma.customer.findUnique({ where: { userId } }))?.stripeCustomerId ?? null

router.post(
  '/portal',
  asyncHandler(async (req, res) => {
    const customer = await customerOf(me(req).id)
    if (!customer) throw AppError.notFound('No billing profile yet')
    const session = await stripe().billingPortal.sessions.create({ customer, return_url: `${cfg.frontendUrl}/settings#billing` })
    res.json({ url: session.url })
  })
)

router.get(
  '/invoices',
  asyncHandler(async (req, res) => {
    const customer = await customerOf(me(req).id)
    if (!customer) return res.json([])
    const list = await stripe().invoices.list({ customer, limit: 24 })
    res.json(list.data.map((i) => ({ id: i.id, number: i.number, status: i.status, amount: (i.amount_paid || i.amount_due) / 100, currency: i.currency, created: new Date(i.created * 1000), url: i.hosted_invoice_url, pdf: i.invoice_pdf })))
  })
)

router.get(
  '/payment-methods',
  asyncHandler(async (req, res) => {
    const customer = await customerOf(me(req).id)
    if (!customer) return res.json([])
    const list = await stripe().paymentMethods.list({ customer, type: 'card' })
    res.json(list.data.map((m) => ({ id: m.id, brand: m.card?.brand, last4: m.card?.last4, expMonth: m.card?.exp_month, expYear: m.card?.exp_year })))
  })
)

/* ───────────────────────── admin ───────────────────────── */

router.get(
  '/admin/orders',
  requireRole('ADMIN'),
  asyncHandler(async (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1)
    const status = String(req.query.status ?? '')
    const where = ['PENDING', 'PAID', 'FAILED', 'EXPIRED', 'REFUNDED'].includes(status) ? { status: status as 'PAID' } : {}
    const [total, rows] = await Promise.all([prisma.order.count({ where }), prisma.order.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * 25, take: 25 })])
    res.json({ data: rows.map((o) => orderJson(o)), total, page, pageSize: 25, totalPages: Math.ceil(total / 25) })
  })
)

router.get(
  '/admin/stats',
  requireRole('ADMIN'),
  asyncHandler(async (_req, res) => {
    const [paid, refunded, subs] = await Promise.all([
      prisma.order.aggregate({ where: { status: 'PAID' }, _sum: { amountCents: true }, _count: true }),
      prisma.order.aggregate({ where: { status: 'REFUNDED' }, _sum: { refundedCents: true }, _count: true }),
      prisma.subscription.count({ where: { status: { in: ACTIVE_STATUSES } } }),
    ])
    res.json({ paidOrders: paid._count, revenue: (paid._sum.amountCents ?? 0) / 100, refundedOrders: refunded._count, refunded: (refunded._sum.refundedCents ?? 0) / 100, activeSubscriptions: subs })
  })
)

/* ───────────────────────── internal ───────────────────────── */

export const internalRouter = Router()
internalRouter.use(internalOnly)
/** Aggregates for the reporting-service. */
internalRouter.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const days = Math.min(365, Math.max(1, Number(req.query.days) || 30))
    const since = new Date(Date.now() - days * 86_400_000)
    const [paid, refunded, perDay, byCourse, subs, byStatus] = await Promise.all([
      prisma.order.aggregate({ where: { status: 'PAID', paidAt: { gte: since } }, _sum: { amountCents: true }, _count: true }),
      prisma.order.aggregate({ where: { status: 'REFUNDED', refundedAt: { gte: since } }, _sum: { refundedCents: true }, _count: true }),
      prisma.$queryRaw<{ day: Date; cents: bigint; n: bigint }[]>`SELECT date_trunc('day', "paidAt") AS day, sum("amountCents") AS cents, count(*) AS n FROM "Order" WHERE "paidAt" >= ${since} AND status IN ('PAID','REFUNDED') GROUP BY 1 ORDER BY 1`,
      prisma.order.groupBy({ by: ['courseId', 'courseTitle'], where: { status: 'PAID', paidAt: { gte: since } }, _sum: { amountCents: true }, _count: true, orderBy: { _sum: { amountCents: 'desc' } }, take: 10 }),
      prisma.subscription.groupBy({ by: ['plan', 'status'], _count: true }),
      prisma.order.groupBy({ by: ['status'], _count: true }),
    ])
    res.json({
      days,
      paidOrders: paid._count, revenue: (paid._sum.amountCents ?? 0) / 100,
      refundedOrders: refunded._count, refunded: (refunded._sum.refundedCents ?? 0) / 100,
      net: ((paid._sum.amountCents ?? 0) - (refunded._sum.refundedCents ?? 0)) / 100,
      revenuePerDay: perDay.map((d) => ({ day: d.day.toISOString().slice(0, 10), revenue: Number(d.cents) / 100, orders: Number(d.n) })),
      topCourses: byCourse.map((c) => ({ courseId: c.courseId, title: c.courseTitle, orders: c._count, revenue: (c._sum.amountCents ?? 0) / 100 })),
      subscriptions: subs.map((s) => ({ plan: s.plan, status: s.status, count: s._count })),
      ordersByStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count])),
    })
  })
)

internalRouter.get(
  '/subscriptions/:userId',
  asyncHandler(async (req, res) => {
    const sub = await activeSubscription(req.params.userId)
    res.json({ active: Boolean(sub), plan: sub?.plan ?? null, currentPeriodEnd: sub?.currentPeriodEnd ?? null })
  })
)

export default router
