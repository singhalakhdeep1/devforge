import fs from 'node:fs'
import path from 'node:path'
import Handlebars from 'handlebars'
import { env } from '@devhub/shared'

const FRONTEND = env('FRONTEND_URL', 'http://localhost:3000').replace(/\/$/, '')
const BRAND = env('EMAIL_BRAND', 'DevForge')

export type TemplateName = 'welcome' | 'verify' | 'reset' | 'receipt' | 'invite' | 'alert'
export const TEMPLATES: TemplateName[] = ['welcome', 'verify', 'reset', 'receipt', 'invite', 'alert']

export interface Rendered {
  subject: string
  html: string
  text: string
}

// The welcome email is a designed (MJML-built) file; the rest share a small, accessible layout
const welcomeSource = fs.readFileSync(path.resolve(__dirname, '../templates/welcome.html'), 'utf8')
const welcome = Handlebars.compile(welcomeSource)

const layout = Handlebars.compile(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{{title}}</title></head>
<body style="margin:0;background:#f4f4f5;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#18181b">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 0"><tr><td align="center">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden">
<tr><td style="background:#4f46e5;color:#ffffff;padding:20px 28px;font-size:20px;font-weight:700">{{brand}}</td></tr>
<tr><td style="padding:28px">
<h1 style="margin:0 0 12px;font-size:22px">{{title}}</h1>
{{{body}}}
{{#if url}}<p style="margin:24px 0"><a href="{{url}}" style="background:#4f46e5;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:8px;display:inline-block;font-weight:600">{{action}}</a></p>
<p style="font-size:12px;color:#71717a;word-break:break-all">If the button does not work, copy this link into your browser:<br>{{url}}</p>{{/if}}
</td></tr>
<tr><td style="padding:16px 28px;font-size:12px;color:#71717a;border-top:1px solid #e4e4e7">{{footer}}</td></tr>
</table></td></tr></table></body></html>`)

const esc = (s: unknown) => Handlebars.escapeExpression(String(s ?? ''))
const money = (n: unknown, cur = 'usd') => new Intl.NumberFormat('en-US', { style: 'currency', currency: cur.toUpperCase() }).format(Number(n) || 0)

const wrap = (title: string, body: string, opts: { url?: string; action?: string; footer?: string } = {}) =>
  layout({ title, body, brand: BRAND, url: opts.url, action: opts.action, footer: opts.footer ?? `You received this email because of activity on your ${BRAND} account.` })

export function render(template: TemplateName, d: Record<string, unknown>): Rendered {
  const name = esc(d.name || 'there')
  switch (template) {
    case 'welcome': {
      const html = welcome({
        name: d.name || 'there',
        dashboardUrl: `${FRONTEND}/dashboard`,
        docsUrl: `${FRONTEND}/courses`,
        supportUrl: `${FRONTEND}/support`,
        preferencesUrl: `${FRONTEND}/profile`,
        unsubscribeUrl: `${FRONTEND}/profile`,
      })
      return { subject: `Welcome to ${BRAND}`, html, text: `Welcome to ${BRAND}, ${d.name || 'there'}!\n\nStart learning: ${FRONTEND}/dashboard\n` }
    }
    case 'verify':
      return {
        subject: `Confirm your ${BRAND} email`,
        html: wrap('Confirm your email', `<p>Hi ${name}, thanks for signing up. Please confirm your email address to finish setting up your account. The link works for 24 hours.</p>`, { url: String(d.url), action: 'Confirm email' }),
        text: `Hi ${d.name || 'there'},\n\nConfirm your email address (valid for 24 hours):\n${d.url}\n`,
      }
    case 'reset':
      return {
        subject: `Reset your ${BRAND} password`,
        html: wrap('Reset your password', `<p>Hi ${name}, we received a request to reset your password. The link works for one hour. If this was not you, you can ignore this email: your password stays the same.</p>`, { url: String(d.url), action: 'Choose a new password' }),
        text: `Hi ${d.name || 'there'},\n\nReset your password (valid for 1 hour):\n${d.url}\n\nIf you did not ask for this, ignore this email.\n`,
      }
    case 'invite': {
      const who = esc(d.inviterName || 'Someone')
      const what = esc(d.entityName || 'a project')
      const kind = d.kind === 'team' ? 'team' : 'project'
      return {
        subject: `${d.inviterName || 'Someone'} invited you to ${d.entityName || 'a ' + kind} on ${BRAND}`,
        html: wrap(`You are invited to ${what}`, `<p>Hi ${name}, <strong>${who}</strong> invited you to join the ${kind} <strong>${what}</strong> as ${esc(String(d.role || 'member').toLowerCase())}. The invitation works for 7 days and only for this email address.</p>`, { url: String(d.url), action: 'View invitation' }),
        text: `${d.inviterName || 'Someone'} invited you to join the ${kind} ${d.entityName || ''} on ${BRAND}.\n\nView the invitation (valid for 7 days):\n${d.url}\n`,
      }
    }
    case 'alert': {
      const resolved = d.state === 'resolved'
      return {
        subject: `[${resolved ? 'RESOLVED' : String(d.severity || 'alert').toUpperCase()}] ${d.message}`,
        html: wrap(resolved ? 'Alert resolved' : 'Alert firing', `<p><strong>${esc(d.message)}</strong></p><p style="color:#52525b">Severity: ${esc(d.severity)} &middot; Subject: ${esc(d.subject)}</p>`, { url: `${FRONTEND}/admin/monitoring`, action: 'Open monitoring', footer: `Sent by ${BRAND} monitoring.` }),
        text: `${resolved ? 'RESOLVED' : 'FIRING'} (${d.severity}): ${d.message}\nSubject: ${d.subject}\n${FRONTEND}/admin/monitoring\n`,
      }
    }
    case 'receipt': {
      const total = money(d.amount, String(d.currency || 'usd'))
      return {
        subject: `Your ${BRAND} receipt (${total})`,
        html: wrap('Payment received', `<p>Hi ${name}, thank you for your purchase.</p><table role="presentation" width="100%" style="margin-top:12px;border-top:1px solid #e4e4e7"><tr><td style="padding:12px 0">${esc(d.courseTitle || 'Course purchase')}</td><td align="right" style="padding:12px 0;font-weight:600">${esc(total)}</td></tr></table><p style="font-size:13px;color:#71717a">Order ${esc(d.orderId)}. You can start learning right away.</p>`, { url: `${FRONTEND}/courses/${esc(d.courseId)}`, action: 'Go to the course' }),
        text: `Thank you for your purchase.\n\n${d.courseTitle || 'Course purchase'}: ${total}\nOrder ${d.orderId}\n\n${FRONTEND}/courses/${d.courseId}\n`,
      }
    }
  }
}

export const isTemplate = (v: unknown): v is TemplateName => TEMPLATES.includes(v as TemplateName)

export const SAMPLE: Record<TemplateName, Record<string, unknown>> = {
  welcome: { name: 'Sam' },
  verify: { name: 'Sam', url: `${FRONTEND}/verify/sample-token` },
  reset: { name: 'Sam', url: `${FRONTEND}/reset-password/sample-token` },
  invite: { name: 'Sam', inviterName: 'Alicia', entityName: 'Compiler Club', kind: 'project', role: 'MEMBER', url: `${FRONTEND}/invitations/sample-token` },
  alert: { severity: 'critical', state: 'firing', message: 'search is not responding', subject: 'search' },
  receipt: { name: 'Sam', amount: 49, currency: 'usd', courseTitle: 'Build REST APIs with Node and Express', courseId: 2, orderId: 'sample-order' },
}
