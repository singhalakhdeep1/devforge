import { TOPICS, emit } from '@devhub/shared'
import { bus } from './lib'

/** Ask the email-service to send a template. Delivery problems never fail the request that triggered it. */
export function emitEmail(m: { to: string; template: 'invite'; name?: string; url: string; data?: Record<string, unknown> }) {
  emit(bus, TOPICS.emailRequested, `email.${m.template}`, { to: m.to, template: m.template, name: m.name, url: m.url, data: m.data })
}
