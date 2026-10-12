import { config } from 'dotenv'
import { z } from 'zod'

config()

const schema = z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(5000),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

    JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
    JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 characters'),
    JWT_EXPIRY: z.string().default('15m'),
    REFRESH_TOKEN_DAYS: z.coerce.number().int().positive().default(7),

    FRONTEND_URL: z.string().url().default('http://localhost:3000'),
    // Set to "true" when the frontend and API are on different sites (cookie needs SameSite=None; Secure)
    CROSS_SITE_COOKIES: z.enum(['true', 'false']).default('false'),

    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().int().positive().default(587),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    FROM_EMAIL: z.string().default('DevForge <noreply@devforge.local>'),

    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),

    // Base URL of a Piston code-execution server (https://github.com/engineer-man/piston)
    PISTON_URL: z.string().url().optional(),

    UPLOAD_DIR: z.string().default('uploads'),

    // Used only by `npm run prisma:seed` to create an admin account
    ADMIN_EMAIL: z.string().email().optional(),
    ADMIN_PASSWORD: z.string().min(8).optional(),
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
    const problems = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n')
    console.error(`Invalid environment configuration:\n${problems}\nSee backend/.env.example.`)
    process.exit(1)
}

export const env = parsed.data
export const isProd = env.NODE_ENV === 'production'
export const emailConfigured = Boolean(env.SMTP_HOST)
export const stripeConfigured = Boolean(env.STRIPE_SECRET_KEY)
