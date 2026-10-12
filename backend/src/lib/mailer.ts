import nodemailer from 'nodemailer'
import { emailConfigured, env } from '../config/env'

const transporter = emailConfigured
    ? nodemailer.createTransport({
          host: env.SMTP_HOST,
          port: env.SMTP_PORT,
          secure: env.SMTP_PORT === 465,
          auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
      })
    : null

interface Mail {
    to: string
    subject: string
    html: string
    /** Plain text shown in the server log when SMTP is not configured (development). */
    text: string
}

/**
 * Sends an email. Never throws: a mail outage must not fail registration or password
 * resets. Without SMTP configured the message is printed to the server log instead.
 */
export async function sendMail({ to, subject, html, text }: Mail): Promise<boolean> {
    if (!transporter) {
        console.log(`[mail disabled] To: ${to}\nSubject: ${subject}\n${text}\n`)
        return false
    }
    try {
        await transporter.sendMail({ from: env.FROM_EMAIL, to, subject, html, text })
        return true
    } catch (error) {
        console.error('Failed to send email:', error)
        return false
    }
}

const layout = (title: string, body: string) =>
    `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px"><h2>${title}</h2>${body}<p style="color:#888;font-size:12px;margin-top:32px">DevForge</p></div>`

export const verificationEmail = (name: string, link: string) => ({
    subject: 'Verify your DevForge email',
    html: layout(`Welcome, ${escapeHtml(name)}!`, `<p>Confirm your email address to finish setting up your account.</p><p><a href="${link}">Verify email</a></p><p>This link expires in 24 hours.</p>`),
    text: `Welcome, ${name}! Verify your email: ${link} (expires in 24 hours)`,
})

export const resetEmail = (name: string, link: string) => ({
    subject: 'Reset your DevForge password',
    html: layout('Password reset', `<p>Hi ${escapeHtml(name)}, click below to choose a new password.</p><p><a href="${link}">Reset password</a></p><p>This link expires in 1 hour. If you did not ask for this, ignore this email.</p>`),
    text: `Hi ${name}, reset your password: ${link} (expires in 1 hour)`,
})

function escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
}
