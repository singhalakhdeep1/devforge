import Stripe from 'stripe'
import { AppError } from '@devhub/shared'
import { cfg, stripeConfigured } from './config'

let client: Stripe | null = null

export function stripe(): Stripe {
  if (!stripeConfigured) throw new AppError(503, 'Payments are not configured on this server', 'PAYMENTS_DISABLED')
  client ??= new Stripe(cfg.stripeKey, {
    apiVersion: '2023-10-16',
    maxNetworkRetries: 2,
    timeout: 15_000,
    ...(cfg.stripeHost ? { host: cfg.stripeHost, port: cfg.stripePort || undefined, protocol: cfg.stripeProtocol } : {}),
  })
  return client
}
