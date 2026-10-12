import type Stripe from 'stripe'
import { AppError, TOPICS, createLogger } from '@devhub/shared'
import { cfg, type PlanId } from './config'
import { enqueue, prisma } from './db'
import type { Order } from './generated/client'
import { stripe } from './stripe'

const log = createLogger('payment')

export const ACTIVE_STATUSES = ['active', 'trialing', 'past_due']

/** One Stripe customer per user, created on first need. */
export async function ensureCustomer(user: { id: string; email?: string; name?: string }): Promise<string> {
  const existing = await prisma.customer.findUnique({ where: { userId: user.id } })
  if (existing) return existing.stripeCustomerId
  const created = await stripe().customers.create({ email: user.email, name: user.name, metadata: { userId: user.id } })
  try {
    await prisma.customer.create({ data: { userId: user.id, stripeCustomerId: created.id } })
    return created.id
  } catch {
    // lost a race with a parallel request: use the winner
    return (await prisma.customer.findUniqueOrThrow({ where: { userId: user.id } })).stripeCustomerId
  }
}

const amountDollars = (cents: number) => Number((cents / 100).toFixed(2))

/**
 * Marks an order paid and queues payment.succeeded. Safe to call repeatedly (webhook retries, the
 * buyer returning from Stripe, a page refresh): only the call that flips the status queues the event.
 */
export async function fulfillSession(session: Stripe.Checkout.Session): Promise<Order | null> {
  if (session.mode !== 'payment' || session.payment_status !== 'paid') return null
  const order = await prisma.order.findUnique({ where: { stripeSessionId: session.id } })
  if (!order) return null
  const paymentIntent = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id ?? null

  await prisma.$transaction(async (tx) => {
    const flipped = await tx.order.updateMany({
      where: { id: order.id, status: { in: ['PENDING', 'EXPIRED', 'FAILED'] } },
      data: { status: 'PAID', paidAt: new Date(), stripePaymentIntentId: paymentIntent },
    })
    if (flipped.count > 0) {
      await enqueue(tx, TOPICS.paymentSucceeded, 'payment.succeeded', order.userId, {
        orderId: order.id,
        userId: order.userId,
        courseId: order.courseId,
        amount: amountDollars(order.amountCents),
        amountCents: order.amountCents,
        currency: order.currency,
        email: order.buyerEmail,
        name: order.buyerName,
      })
    }
  })
  return prisma.order.findUnique({ where: { id: order.id } })
}

export async function expireSession(sessionId: string) {
  await prisma.order.updateMany({ where: { stripeSessionId: sessionId, status: 'PENDING' }, data: { status: 'EXPIRED' } })
}

/** Refunds the remaining balance of an order and tells the other services. */
export async function refundOrder(order: Order, reason: string): Promise<Order> {
  if (order.status !== 'PAID') throw AppError.badRequest('Only paid orders can be refunded')
  if (!order.stripePaymentIntentId) throw AppError.badRequest('This order has no payment to refund')
  const remaining = order.amountCents - order.refundedCents
  if (remaining <= 0) throw AppError.conflict('This order is already refunded')

  const refund = await stripe().refunds.create({ payment_intent: order.stripePaymentIntentId, amount: remaining, reason: 'requested_by_customer', metadata: { orderId: order.id, note: reason.slice(0, 200) } })
  return prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({ where: { id: order.id }, data: { status: 'REFUNDED', refundedCents: order.amountCents, refundedAt: new Date() } })
    await enqueue(tx, TOPICS.paymentRefunded, 'payment.refunded', order.userId, {
      orderId: order.id,
      userId: order.userId,
      courseId: order.courseId,
      amount: amountDollars(remaining),
      stripeRefundId: refund.id,
    })
    return updated
  })
}

/** Keeps the local subscription row in step with Stripe and announces entitlement changes. */
export async function syncSubscription(sub: Stripe.Subscription) {
  const userId = sub.metadata?.userId
  if (!userId) {
    log.logWarning('subscription without userId metadata ignored', { id: sub.id })
    return
  }
  const plan = (sub.metadata?.plan as PlanId) ?? 'monthly'
  const periodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000) : null
  await prisma.$transaction(async (tx) => {
    await tx.subscription.upsert({
      where: { stripeSubscriptionId: sub.id },
      update: { status: sub.status, plan, currentPeriodEnd: periodEnd, cancelAtPeriodEnd: sub.cancel_at_period_end },
      create: { userId, stripeSubscriptionId: sub.id, status: sub.status, plan, currentPeriodEnd: periodEnd, cancelAtPeriodEnd: sub.cancel_at_period_end },
    })
    await enqueue(tx, TOPICS.subscriptionChanged, 'subscription.changed', userId, { userId, status: sub.status, plan, active: ACTIVE_STATUSES.includes(sub.status), currentPeriodEnd: periodEnd?.toISOString() ?? null })
  })
}

export async function activeSubscription(userId: string) {
  const sub = await prisma.subscription.findFirst({
    where: { userId, status: { in: ACTIVE_STATUSES }, OR: [{ currentPeriodEnd: null }, { currentPeriodEnd: { gt: new Date() } }] },
    orderBy: { updatedAt: 'desc' },
  })
  return sub
}

export const toCents = (price: number) => Math.round(price * 100)
export { cfg }
