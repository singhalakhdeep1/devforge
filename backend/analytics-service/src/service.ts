import { createLogger } from '@devhub/shared'
import { AnalyticsEvent, CourseDay, Daily, DailyActive, FirstSeen } from './model'

const log = createLogger('analytics')

export const dayOf = (d: Date) => d.toISOString().slice(0, 10)
const startOfDay = (day: string) => new Date(`${day}T00:00:00.000Z`)
export const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000)

// Writing the same (day, user) pair on every event would be wasteful: remember what this process already wrote
const seenToday = new Set<string>()
let seenDay = ''
const remember = (key: string) => {
    const today = dayOf(new Date())
    if (seenDay !== today) {
        seenToday.clear()
        seenDay = today
    }
    if (seenToday.has(key)) return false
    if (seenToday.size > 200_000) seenToday.clear()
    seenToday.add(key)
    return true
}

export interface IncomingEvent {
    sessionId: string
    eventType: 'pageview' | 'click' | 'form_submit' | 'api_call' | 'error' | 'custom' | 'domain'
    eventName: string
    properties?: Record<string, unknown>
    path?: string
    referrer?: string
    timestamp?: Date
}
export interface Context {
    userId?: string
    device?: string
    browser?: string
    os?: string
    country?: string
}

async function touchUser(userId: string | undefined, at: Date) {
    if (!userId) return
    const day = dayOf(at)
    if (remember(`a|${day}|${userId}`)) await DailyActive.updateOne({ day, userId }, { $setOnInsert: { day, userId } }, { upsert: true })
    if (remember(`f|${userId}`)) await FirstSeen.updateOne({ userId }, { $setOnInsert: { userId, firstSeen: at } }, { upsert: true })
}

/** Stores a batch of client-side events and keeps the daily rollup current. */
export async function ingest(events: IncomingEvent[], ctx: Context) {
    const now = new Date()
    const docs = events.map((e) => ({ ...ctx, ...e, timestamp: e.timestamp && e.timestamp <= now && e.timestamp > daysAgo(2) ? e.timestamp : now }))
    await AnalyticsEvent.insertMany(docs, { ordered: false })

    const byDay = new Map<string, { pageviews: number; events: number; paths: Map<string, number> }>()
    for (const d of docs) {
        const day = dayOf(d.timestamp)
        const row = byDay.get(day) ?? { pageviews: 0, events: 0, paths: new Map() }
        row.events++
        if (d.eventType === 'pageview') {
            row.pageviews++
            const p = (d.path ?? '/').split('?')[0].replace(/\./g, '_').slice(0, 120) // Mongo map keys cannot contain dots
            row.paths.set(p, (row.paths.get(p) ?? 0) + 1)
        }
        byDay.set(day, row)
    }
    await Promise.all(
        [...byDay.entries()].map(([day, r]) => {
            const inc: Record<string, number> = { pageviews: r.pageviews, events: r.events }
            for (const [p, n] of r.paths) inc[`paths.${p}`] = n
            return Daily.updateOne({ day }, { $inc: inc, $setOnInsert: { day } }, { upsert: true })
        })
    )
    await touchUser(ctx.userId, now)
    return docs.length
}

/** A fact announced by another service (signup, enrollment, payment...). Counted once per bus event. */
export async function recordDomain(eventKey: string, name: string, at: Date, userId: string | undefined, data: Record<string, unknown>, rollup: Record<string, number>, courseId?: number) {
    try {
        await AnalyticsEvent.create({ eventKey, eventType: 'domain', eventName: name, sessionId: `domain:${userId ?? 'system'}`, userId, timestamp: at, properties: data })
    } catch (e) {
        if ((e as { code?: number }).code === 11000) return false // already counted
        throw e
    }
    const day = dayOf(at)
    await Daily.updateOne({ day }, { $inc: { ...rollup, events: 1 }, $setOnInsert: { day } }, { upsert: true })
    if (courseId !== undefined) {
        const c: Record<string, number> = {}
        if (rollup.enrollments) c.enrollments = rollup.enrollments
        if (rollup.completions) c.completions = rollup.completions
        if (rollup.revenueCents) c.revenueCents = rollup.revenueCents
        if (Object.keys(c).length) await CourseDay.updateOne({ courseId, day }, { $inc: c, $setOnInsert: { courseId, day } }, { upsert: true })
    }
    await touchUser(userId, at)
    return true
}

/* ───────────────────────── queries ───────────────────────── */

const range = (days: number) => ({ from: startOfDay(dayOf(daysAgo(days - 1))), to: new Date() })

export async function overview(days: number) {
    const { from } = range(days)
    const [rows, active] = await Promise.all([
        Daily.find({ day: { $gte: dayOf(from) } }).sort({ day: 1 }).lean(),
        DailyActive.aggregate<{ _id: string; n: number }>([{ $match: { day: { $gte: dayOf(from) } } }, { $group: { _id: '$day', n: { $sum: 1 } } }]),
    ])
    const activeBy = new Map(active.map((a) => [a._id, a.n]))
    const byDay = new Map(rows.map((r) => [r.day, r]))
    const series: { day: string; pageviews: number; events: number; activeUsers: number; signups: number; enrollments: number; completions: number; lessonsCompleted: number; revenue: number }[] = []
    for (let i = days - 1; i >= 0; i--) {
        const day = dayOf(daysAgo(i))
        const r = byDay.get(day)
        series.push({ day, pageviews: r?.pageviews ?? 0, events: r?.events ?? 0, activeUsers: activeBy.get(day) ?? 0, signups: r?.signups ?? 0, enrollments: r?.enrollments ?? 0, completions: r?.completions ?? 0, lessonsCompleted: r?.lessonsCompleted ?? 0, revenue: (r?.revenueCents ?? 0) / 100 })
    }
    const sum = (k: keyof (typeof series)[number]) => series.reduce((s, r) => s + (r[k] as number), 0)
    const uniqueActive = await DailyActive.distinct('userId', { day: { $gte: dayOf(from) } })
    return {
        days,
        totals: { pageviews: sum('pageviews'), events: sum('events'), signups: sum('signups'), enrollments: sum('enrollments'), completions: sum('completions'), lessonsCompleted: sum('lessonsCompleted'), revenue: Number(sum('revenue').toFixed(2)), activeUsers: uniqueActive.length },
        series,
    }
}

export async function topPaths(days: number, limit = 10) {
    const rows = await Daily.find({ day: { $gte: dayOf(range(days).from) } }).lean()
    const totals = new Map<string, number>()
    for (const r of rows) for (const [p, n] of Object.entries(r.paths ?? {}) as [string, number][]) totals.set(p, (totals.get(p) ?? 0) + n)
    return [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([path, views]) => ({ path, views }))
}

async function breakdown(field: 'browser' | 'device' | 'os' | 'country', days: number) {
    const rows = await AnalyticsEvent.aggregate<{ _id: string | null; count: number; users: string[] }>([
        { $match: { timestamp: { $gte: range(days).from }, eventType: 'pageview', [field]: { $nin: [null, ''] } } },
        { $group: { _id: `$${field}`, count: { $sum: 1 }, users: { $addToSet: '$sessionId' } } },
        { $sort: { count: -1 } },
        { $limit: 15 },
    ])
    const total = rows.reduce((s, r) => s + r.count, 0) || 1
    return rows.map((r) => ({ name: r._id, pageviews: r.count, sessions: r.users.length, share: Number(((r.count / total) * 100).toFixed(1)) }))
}
export const browsers = (d: number) => breakdown('browser', d)
export const devices = (d: number) => breakdown('device', d)
export const systems = (d: number) => breakdown('os', d)
export const countries = (d: number) => breakdown('country', d)

/** Of the sessions that did step 1, how many went on to do step 2, 3... in that order. */
export async function funnel(steps: string[], days: number) {
    const sessions = await AnalyticsEvent.aggregate<{ _id: string; names: { n: string; t: Date }[] }>([
        { $match: { timestamp: { $gte: range(days).from }, eventName: { $in: steps } } },
        { $sort: { timestamp: 1 } },
        { $group: { _id: '$sessionId', names: { $push: { n: '$eventName', t: '$timestamp' } } } },
    ])
    const reached = steps.map(() => 0)
    for (const s of sessions) {
        let at = -1
        for (let i = 0; i < steps.length; i++) {
            const idx = s.names.findIndex((e, k) => k > at && e.n === steps[i])
            if (idx === -1) break
            reached[i]++
            at = idx
        }
    }
    return steps.map((step, i) => ({ step, sessions: reached[i], conversionFromStart: reached[0] ? Number(((reached[i] / reached[0]) * 100).toFixed(1)) : 0, conversionFromPrevious: i === 0 ? 100 : reached[i - 1] ? Number(((reached[i] / reached[i - 1]) * 100).toFixed(1)) : 0 }))
}

/** Of the users first seen on `cohortDay`, the share that came back on day 1, 3, 7, 14 and 30. */
export async function retention(cohortDay: string, offsets = [1, 3, 7, 14, 30]) {
    const start = startOfDay(cohortDay)
    const cohort = await FirstSeen.find({ firstSeen: { $gte: start, $lt: new Date(start.getTime() + 86_400_000) } }).distinct('userId')
    const out = []
    for (const n of offsets) {
        const day = dayOf(new Date(start.getTime() + n * 86_400_000))
        const matured = new Date(day) <= new Date()
        const back = matured && cohort.length ? await DailyActive.countDocuments({ day, userId: { $in: cohort } }) : 0
        out.push({ day: n, date: day, returned: back, rate: matured && cohort.length ? Number(((back / cohort.length) * 100).toFixed(1)) : null })
    }
    return { cohort: cohortDay, size: cohort.length, retention: out }
}

export async function userStats(userId: string, days: number) {
    const from = range(days).from
    const [byType, byDay, last] = await Promise.all([
        AnalyticsEvent.aggregate<{ _id: string; n: number }>([{ $match: { userId, timestamp: { $gte: from } } }, { $group: { _id: '$eventName', n: { $sum: 1 } } }, { $sort: { n: -1 } }, { $limit: 15 }]),
        DailyActive.find({ userId, day: { $gte: dayOf(from) } }).distinct('day'),
        AnalyticsEvent.findOne({ userId }).sort({ timestamp: -1 }).lean(),
    ])
    return { days, activeDays: byDay.length, topEvents: byType.map((r) => ({ name: r._id, count: r.n })), lastSeen: last?.timestamp ?? null }
}

export async function courseInsights(courseIds: number[], days: number) {
    const from = dayOf(range(days).from)
    const rows = await CourseDay.find({ courseId: { $in: courseIds }, day: { $gte: from } }).sort({ day: 1 }).lean()
    const per = new Map<number, { enrollments: number; completions: number; revenue: number }>()
    for (const r of rows) {
        const t = per.get(r.courseId) ?? { enrollments: 0, completions: 0, revenue: 0 }
        t.enrollments += r.enrollments ?? 0
        t.completions += r.completions ?? 0
        t.revenue += (r.revenueCents ?? 0) / 100
        per.set(r.courseId, t)
    }
    const series = new Map<string, { day: string; enrollments: number; completions: number; revenue: number }>()
    for (const r of rows) {
        const s = series.get(r.day) ?? { day: r.day, enrollments: 0, completions: 0, revenue: 0 }
        s.enrollments += r.enrollments ?? 0
        s.completions += r.completions ?? 0
        s.revenue += (r.revenueCents ?? 0) / 100
        series.set(r.day, s)
    }
    return { days, courses: courseIds.map((id) => ({ courseId: id, ...(per.get(id) ?? { enrollments: 0, completions: 0, revenue: 0 }) })), series: [...series.values()] }
}

export async function recentEvents(filter: { name?: string; type?: string; userId?: string }, limit: number) {
    const q: Record<string, unknown> = {}
    if (filter.name) q.eventName = filter.name
    if (filter.type) q.eventType = filter.type
    if (filter.userId) q.userId = filter.userId
    return AnalyticsEvent.find(q).sort({ timestamp: -1 }).limit(limit).lean()
}

/** Recomputes a day's counters from the raw events. Run nightly for yesterday so drift cannot accumulate. */
export async function rebuildDay(day: string) {
    const from = startOfDay(day)
    const to = new Date(from.getTime() + 86_400_000)
    const rows = await AnalyticsEvent.aggregate<{ _id: { type: string; name: string }; n: number; cents: number }>([
        { $match: { timestamp: { $gte: from, $lt: to } } },
        { $group: { _id: { type: '$eventType', name: '$eventName' }, n: { $sum: 1 }, cents: { $sum: { $ifNull: ['$properties.amountCents', 0] } } } },
    ])
    const get = (name: string) => rows.filter((r) => r._id.name === name)
    const count = (name: string) => get(name).reduce((s, r) => s + r.n, 0)
    const set = {
        events: rows.reduce((s, r) => s + r.n, 0),
        pageviews: rows.filter((r) => r._id.type === 'pageview').reduce((s, r) => s + r.n, 0),
        signups: count('user.registered'),
        enrollments: count('course.enrolled'),
        completions: count('course.completed'),
        lessonsCompleted: count('lesson.completed'),
        revenueCents: get('payment.succeeded').reduce((s, r) => s + r.cents, 0) - get('payment.refunded').reduce((s, r) => s + r.cents, 0),
    }
    await Daily.updateOne({ day }, { $set: set, $setOnInsert: { day } }, { upsert: true })
    log.logInformation('rebuilt daily rollup', { day, ...set })
    return set
}
