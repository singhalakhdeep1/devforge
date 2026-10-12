import { Router } from 'express'
import { z } from 'zod'
import { AppError, asyncHandler, attachUser, authenticate, createServiceClient, rateLimitMiddleware, requireRole, userOf, validate } from '@devhub/shared'
import { courseInsights, countries, browsers, devices, funnel, ingest, overview, recentEvents, retention, systems, topPaths, userStats } from './service'
import { parseUserAgent, regionFromLanguage } from './ua'

const router = Router()
const courses = createServiceClient('course')
const n = (min: number, max: number, def: number) => z.coerce.number().min(min).max(max).default(def).transform(Math.floor)
const daysQuery = z.object({ days: n(1, 365, 30) })

/* ───────────── collection (anonymous allowed, tightly limited) ───────────── */

const eventSchema = z.object({
    sessionId: z.string().trim().min(8).max(64),
    eventType: z.enum(['pageview', 'click', 'form_submit', 'api_call', 'error', 'custom']).default('custom'),
    eventName: z.string().trim().min(1).max(80).regex(/^[\w.:/ -]+$/, 'Letters, numbers and . : / - _ only'),
    properties: z.record(z.unknown()).refine((o) => JSON.stringify(o).length <= 4000, 'properties too large').optional(),
    path: z.string().max(300).optional(),
    referrer: z.string().max(300).optional(),
    timestamp: z.coerce.date().optional(),
})

router.post(
    '/track',
    attachUser,
    rateLimitMiddleware({ capacity: 120, refillPerSecond: 2, prefix: 'track' }),
    validate(z.union([eventSchema.transform((e) => ({ events: [e] })), z.object({ events: z.array(eventSchema).min(1).max(50) })])),
    asyncHandler(async (req, res) => {
        const ua = parseUserAgent(String(req.headers['user-agent'] ?? ''))
        if (ua.device === 'bot') return res.status(202).json({ accepted: 0 }) // crawlers are not users
        const accepted = await ingest(req.body.events, {
            userId: userOf(req)?.id, // from the verified token, never from the request body
            device: ua.device,
            browser: ua.browser,
            os: ua.os,
            country: regionFromLanguage(String(req.headers['accept-language'] ?? '')),
        })
        res.status(202).json({ accepted })
    })
)

/* ───────────── what a signed-in user may see: only their own activity ───────────── */

router.get(
    '/me',
    authenticate,
    validate(daysQuery, 'query'),
    asyncHandler(async (req, res) => {
        res.json(await userStats(userOf(req)!.id, (req.query as unknown as { days: number }).days))
    })
)

/* ───────────── instructor insights: only for courses they teach ───────────── */

router.get(
    '/instructor',
    requireRole('INSTRUCTOR', 'ADMIN'),
    validate(daysQuery, 'query'),
    asyncHandler(async (req, res) => {
        const me = userOf(req)!
        const { ids } = await courses.get<{ ids: number[] }>(`/internal/instructors/${me.id}/courses`)
        res.json(await courseInsights(ids, (req.query as unknown as { days: number }).days))
    })
)

/* ───────────── platform reports: admins only ───────────── */

const admin = Router()
admin.use(requireRole('ADMIN'))

admin.get('/overview', validate(daysQuery, 'query'), asyncHandler(async (req, res) => res.json(await overview((req.query as unknown as { days: number }).days))))
admin.get('/pageviews', validate(daysQuery, 'query'), asyncHandler(async (req, res) => res.json({ paths: await topPaths((req.query as unknown as { days: number }).days) })))
admin.get('/browsers', validate(daysQuery, 'query'), asyncHandler(async (req, res) => res.json({ browsers: await browsers((req.query as unknown as { days: number }).days) })))
admin.get('/devices', validate(daysQuery, 'query'), asyncHandler(async (req, res) => res.json({ devices: await devices((req.query as unknown as { days: number }).days) })))
admin.get('/systems', validate(daysQuery, 'query'), asyncHandler(async (req, res) => res.json({ systems: await systems((req.query as unknown as { days: number }).days) })))
admin.get('/geographic', validate(daysQuery, 'query'), asyncHandler(async (req, res) => res.json({ note: 'Approximate: derived from the browser language region, not from IP geolocation', countries: await countries((req.query as unknown as { days: number }).days) })))

admin.post(
    '/funnel',
    validate(z.object({ steps: z.array(z.string().trim().min(1).max(80)).min(2).max(8), days: n(1, 90, 30) })),
    asyncHandler(async (req, res) => res.json({ steps: await funnel(req.body.steps, req.body.days) }))
)

admin.get(
    '/retention',
    validate(z.object({ cohort: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'cohort must be YYYY-MM-DD') }), 'query'),
    asyncHandler(async (req, res) => res.json(await retention((req.query as { cohort: string }).cohort)))
)

admin.get(
    '/events',
    validate(z.object({ name: z.string().max(80).optional(), type: z.string().max(20).optional(), userId: z.string().max(64).optional(), limit: n(1, 200, 50) }), 'query'),
    asyncHandler(async (req, res) => {
        const q = req.query as unknown as { name?: string; type?: string; userId?: string; limit: number }
        res.json({ events: await recentEvents(q, q.limit) })
    })
)

admin.get(
    '/users/:id',
    validate(daysQuery, 'query'),
    asyncHandler(async (req, res) => {
        if (!/^[\w-]{1,64}$/.test(req.params.id)) throw AppError.badRequest('Invalid user id')
        res.json(await userStats(req.params.id, (req.query as unknown as { days: number }).days))
    })
)

router.use('/admin', admin)
export default router
