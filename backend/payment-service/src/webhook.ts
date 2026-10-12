import type { Request, Response } from 'express'
import type Stripe from 'stripe'
import { createLogger } from '@devhub/shared'
import { cfg, stripeConfigured } from './config'
import { prisma } from './db'
import { expireSession, fulfillSession, syncSubscription } from './service'
import { stripe } from './stripe'

const log = createLogger('payment')

/** Stripe webhook. Mounted with a raw body parser before express.json(): the signature covers the raw bytes. */
export async function stripeWebhook(req: Request, res: Response) {
  if (!stripeConfigured || !cfg.webhookSecret) return res.status(503).json({ error: 'Webhook is not configured' })

  let event: Stripe.Event
  try {
    event = stripe().webhooks.constructEvent(req.body, String(req.headers['stripe-signature'] ?? ''), cfg.webhookSecret)
  } catch {
    return res.status(400).json({ error: 'Invalid signature' })
  }

  // Each event id is processed once; Stripe re-sends until it gets a 2xx
  const claimed = await prisma.stripeEvent.createMany({ data: [{ id: event.id, type: event.type }], skipDuplicates: true })
  if (claimed.count === 0) return res.json({ received: true, duplicate: true })

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded':
        await fulfillSession(event.data.object as Stripe.Checkout.Session)
        break
      case 'checkout.session.expired':
      case 'checkout.session.async_payment_failed': {
        const s = event.data.object as Stripe.Checkout.Session
        await expireSession(s.id)
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await syncSubscription(event.data.object as Stripe.Subscription)
        break
      default:
        break
    }
    res.json({ received: true })
  } catch (error) {
    // release the claim so Stripe's retry is processed instead of being treated as a duplicate
    await prisma.stripeEvent.delete({ where: { id: event.id } }).catch(() => undefined)
    log.logError('webhook processing failed', String(error), { type: event.type })
    res.status(500).json({ error: 'Webhook processing failed' })
  }
}
