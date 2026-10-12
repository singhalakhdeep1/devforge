import { env, envInt } from '@devhub/shared'

export const cfg = {
  stripeKey: env('STRIPE_SECRET_KEY'),
  webhookSecret: env('STRIPE_WEBHOOK_SECRET'),
  /** Point the SDK at another host (a local Stripe-compatible fake in tests). Unset in production. */
  stripeHost: env('STRIPE_API_HOST'),
  stripePort: env('STRIPE_API_PORT'),
  stripeProtocol: env('STRIPE_API_PROTOCOL', 'https') as 'http' | 'https',
  frontendUrl: env('FRONTEND_URL', 'http://localhost:3000').replace(/\/$/, ''),
  currency: env('PAYMENT_CURRENCY', 'usd'),
  /** A buyer can refund their own order within this many days of paying. Admins can always refund. */
  refundWindowDays: envInt('REFUND_WINDOW_DAYS', 14),
  plans: {
    monthly: { id: 'monthly', name: 'DevForge Pro (monthly)', amountCents: envInt('PRO_MONTHLY_CENTS', 1900), interval: 'month' as const, priceId: env('STRIPE_PRICE_PRO_MONTHLY') },
    yearly: { id: 'yearly', name: 'DevForge Pro (yearly)', amountCents: envInt('PRO_YEARLY_CENTS', 19000), interval: 'year' as const, priceId: env('STRIPE_PRICE_PRO_YEARLY') },
  },
}

export type PlanId = keyof typeof cfg.plans
export const stripeConfigured = Boolean(cfg.stripeKey)
