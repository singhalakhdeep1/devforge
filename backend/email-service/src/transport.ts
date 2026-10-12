import sgMail from '@sendgrid/mail'
import nodemailer from 'nodemailer'
import { createLogger, env, envInt, getRedis } from '@devhub/shared'

const log = createLogger('email')

export interface Message {
  to: string
  subject: string
  html: string
  text: string
}

export interface Transport {
  readonly kind: 'sendgrid' | 'smtp' | 'log'
  send(m: Message): Promise<void>
}

const FROM = env('EMAIL_FROM', 'DevForge <noreply@devforge.local>')

class SendGrid implements Transport {
  readonly kind = 'sendgrid' as const
  constructor(key: string) {
    sgMail.setApiKey(key)
  }
  async send(m: Message) {
    await sgMail.send({ to: m.to, from: FROM, subject: m.subject, html: m.html, text: m.text })
  }
}

class Smtp implements Transport {
  readonly kind = 'smtp' as const
  private readonly t = nodemailer.createTransport({
    host: env('SMTP_HOST'),
    port: envInt('SMTP_PORT', 587),
    secure: envInt('SMTP_PORT', 587) === 465,
    auth: env('SMTP_USER') ? { user: env('SMTP_USER'), pass: env('SMTP_PASS') } : undefined,
  })
  async send(m: Message) {
    await this.t.sendMail({ from: FROM, to: m.to, subject: m.subject, html: m.html, text: m.text })
  }
}

/** No provider configured: keep the mail where a developer can read it instead of dropping it silently. */
export const OUTBOX_KEY = 'email:dev-outbox'
class LogOnly implements Transport {
  readonly kind = 'log' as const
  async send(m: Message) {
    log.logInformation('email (no provider configured, kept in the dev outbox)', { to: m.to, subject: m.subject })
    const r = getRedis()
    await r.lpush(OUTBOX_KEY, JSON.stringify({ ...m, at: new Date().toISOString() }))
    await r.ltrim(OUTBOX_KEY, 0, 199)
  }
}

let transport: Transport | null = null
export function transportFor(): Transport {
  transport ??= env('SENDGRID_API_KEY') ? new SendGrid(env('SENDGRID_API_KEY')) : env('SMTP_HOST') ? new Smtp() : new LogOnly()
  return transport
}
