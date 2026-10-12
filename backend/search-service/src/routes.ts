import { Router } from 'express'
import { z } from 'zod'
import { INDEX, es } from '@devhub/elasticsearch-service'
import { AppError, asyncHandler, attachUser, rateLimitMiddleware, requireRole, validate } from '@devhub/shared'
import { reindex, syncCourse } from './indexer'
import { parseNaturalQuery } from './nlp'
import { autocomplete, didYouMean, searchCourses, searchProjects, searchUsers, similarCourses } from './query'

const router = Router()
router.use(attachUser)
// search is public, so it gets its own, tighter, per-client limit on top of the gateway's
router.use(rateLimitMiddleware({ capacity: 60, refillPerSecond: 2, prefix: 'search' }))

const num = (min?: number, max?: number) => z.coerce.number().min(min ?? -Infinity).max(max ?? Infinity)
const courseQuery = z.object({
  q: z.string().trim().max(200).optional(),
  category: z.string().trim().max(60).optional(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  minPrice: num(0).optional(),
  maxPrice: num(0).optional(),
  free: z.enum(['true', 'false']).optional().transform((v) => v === 'true'),
  minRating: num(0, 5).optional(),
  sort: z.enum(['relevance', 'newest', 'popular', 'rating', 'price_asc', 'price_desc']).optional(),
  page: num(1).default(1).transform(Math.floor),
  pageSize: num(1, 50).default(12).transform(Math.floor),
})
const paging = z.object({ q: z.string().trim().max(200).optional(), tag: z.string().trim().max(40).optional(), page: num(1).default(1).transform(Math.floor), pageSize: num(1, 50).default(10).transform(Math.floor) })

const pageOf = (r: { total: number }, page: number, pageSize: number) => ({ total: r.total, page, pageSize, totalPages: Math.max(1, Math.ceil(r.total / pageSize)) })

// GET /api/search?q=&type=all|courses|users|projects
router.get(
  '/',
  validate(courseQuery.extend({ type: z.enum(['all', 'courses', 'users', 'projects']).default('all'), pageSize: num(1, 50).default(5).transform(Math.floor) }), 'query'),
  asyncHandler(async (req, res) => {
    const f = req.query as unknown as z.infer<typeof courseQuery> & { type: string }
    const wants = (t: string) => f.type === 'all' || f.type === t
    const [c, u, p, suggestions] = await Promise.all([
      wants('courses') ? searchCourses({ ...f, free: f.free }) : null,
      wants('users') ? searchUsers(f.q, 1, f.type === 'users' ? f.pageSize : 5) : null,
      wants('projects') ? searchProjects(f.q, undefined, 1, f.type === 'projects' ? f.pageSize : 5) : null,
      f.q && wants('courses') ? didYouMean(f.q) : [],
    ])
    res.json({
      query: f.q ?? '',
      courses: c && { ...c, ...pageOf(c, f.page, f.pageSize) },
      instructors: u,
      projects: p,
      didYouMean: suggestions.length && (c?.total ?? 0) < 3 ? suggestions[0] : null,
    })
  })
)

router.get(
  '/courses',
  validate(courseQuery, 'query'),
  asyncHandler(async (req, res) => {
    const f = req.query as unknown as z.infer<typeof courseQuery>
    const r = await searchCourses(f)
    res.json({ ...r, ...pageOf(r, f.page, f.pageSize), didYouMean: f.q && r.total < 3 ? ((await didYouMean(f.q))[0] ?? null) : null })
  })
)

router.get(
  '/users',
  validate(paging, 'query'),
  asyncHandler(async (req, res) => {
    const f = req.query as unknown as z.infer<typeof paging>
    const r = await searchUsers(f.q, f.page, f.pageSize)
    res.json({ ...r, ...pageOf(r, f.page, f.pageSize) })
  })
)

router.get(
  '/projects',
  validate(paging, 'query'),
  asyncHandler(async (req, res) => {
    const f = req.query as unknown as z.infer<typeof paging>
    const r = await searchProjects(f.q, f.tag, f.page, f.pageSize)
    res.json({ ...r, ...pageOf(r, f.page, f.pageSize) })
  })
)

router.get(
  '/autocomplete',
  validate(z.object({ q: z.string().trim().min(1).max(60), limit: num(1, 15).default(8).transform(Math.floor) }), 'query'),
  asyncHandler(async (req, res) => {
    const { q, limit } = req.query as unknown as { q: string; limit: number }
    res.json({ suggestions: await autocomplete(q, limit) })
  })
)

router.get(
  '/suggestions',
  validate(z.object({ q: z.string().trim().min(2).max(100) }), 'query'),
  asyncHandler(async (req, res) => {
    res.json({ suggestions: await didYouMean((req.query as { q: string }).q) })
  })
)

router.get(
  '/similar/courses/:id',
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id)
    if (!Number.isInteger(id) || id <= 0) throw AppError.badRequest('Invalid course id')
    res.json({ data: await similarCourses(id, Math.min(20, Number(req.query.limit) || 6)) })
  })
)

// GET /api/search/nlp?q=beginner javascript under $20
router.get(
  '/nlp',
  validate(z.object({ q: z.string().trim().min(2).max(200), page: num(1).default(1).transform(Math.floor), pageSize: num(1, 50).default(12).transform(Math.floor) }), 'query'),
  asyncHandler(async (req, res) => {
    const { q, page, pageSize } = req.query as unknown as { q: string; page: number; pageSize: number }
    const cats = await es().search({ index: INDEX.courses, size: 0, aggs: { c: { terms: { field: 'category', size: 50 } } } })
    const known = ((cats.aggregations?.c as { buckets: { key: string }[] } | undefined)?.buckets ?? []).map((b) => b.key)
    const parsed = parseNaturalQuery(q, known)
    const r = await searchCourses({ q: parsed.text || undefined, category: parsed.category, level: parsed.level, minPrice: parsed.minPrice, maxPrice: parsed.maxPrice, free: parsed.free, minRating: parsed.minRating, sort: parsed.sort, page, pageSize })
    res.json({ interpreted: parsed.interpreted, parsed: { ...parsed, interpreted: undefined }, ...r, ...pageOf(r, page, pageSize) })
  })
)

/* ───────────── admin ───────────── */

const admin = Router()
admin.use(requireRole('ADMIN'))

admin.post(
  '/reindex',
  validate(z.object({ index: z.enum(['courses', 'users', 'all']).default('all') })),
  asyncHandler(async (req, res) => {
    const started = Date.now()
    res.json({ ...(await reindex(req.body.index)), tookMs: Date.now() - started })
  })
)

admin.post(
  '/courses/:id/sync',
  asyncHandler(async (req, res) => {
    await syncCourse(Number(req.params.id))
    res.json({ message: 'Course re-indexed' })
  })
)

admin.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const counts = await Promise.all(Object.values(INDEX).map(async (alias) => [alias, (await es().count({ index: alias })).count] as const))
    res.json({ documents: Object.fromEntries(counts) })
  })
)

router.use('/admin', admin)
export default router
