import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import morgan from 'morgan'
import path from 'path'
import { env, isProd } from './config/env'
import { prisma } from './lib/prisma'
import { errorHandler, notFoundHandler } from './middleware/error'
import authRoutes from './routes/auth.routes'
import certificateRoutes from './routes/certificate.routes'
import courseRoutes from './routes/course.routes'
import dashboardRoutes from './routes/dashboard.routes'
import discussionRoutes from './routes/discussion.routes'
import editorRoutes from './routes/editor.routes'
import instructorRoutes from './routes/instructor.routes'
import learnRoutes from './routes/learn.routes'
import notificationRoutes from './routes/notification.routes'
import paymentRoutes, { stripeWebhook } from './routes/payment.routes'
import userRoutes from './routes/user.routes'

const app = express()

if (isProd) app.set('trust proxy', 1) // correct client IPs for rate limiting behind a reverse proxy

// Uploaded avatars are embedded by the frontend, which is a different origin
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }))
if (env.NODE_ENV !== 'test') app.use(morgan(isProd ? 'combined' : 'dev'))

// Stripe signs the raw bytes, so this route must be registered before express.json()
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), stripeWebhook)

app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())

app.use(
    '/api',
    rateLimit({ windowMs: 15 * 60 * 1000, max: 600, standardHeaders: true, legacyHeaders: false, message: { error: 'Too many requests, please slow down' } })
)

app.use('/uploads', express.static(path.resolve(env.UPLOAD_DIR), { maxAge: '7d', index: false }))

app.get('/health', async (_req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`
        res.json({ status: 'ok', timestamp: new Date().toISOString() })
    } catch {
        res.status(503).json({ status: 'database unavailable' })
    }
})

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/learn', learnRoutes)
app.use('/api/instructor', instructorRoutes)
app.use('/api/discussions', discussionRoutes)
app.use('/api/editor', editorRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/certificates', certificateRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/payments', paymentRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

export default app
