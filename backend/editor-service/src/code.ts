import { Router } from 'express'
import { z } from 'zod'
import { AppError, asyncHandler, authenticate, env, rateLimitMiddleware, userOf, validate } from '@devhub/shared'
import { prisma } from './db'

const router = Router()
router.use(authenticate)
const me = (req: Parameters<typeof userOf>[0]) => userOf(req)!

/* ───────────── sandboxed execution (Piston) ───────────── */

const PISTON_URL = env('PISTON_URL').replace(/\/$/, '')

interface PistonRuntime { language: string; version: string; aliases: string[] }
let runtimeCache: { at: number; runtimes: PistonRuntime[] } | null = null

async function pistonRuntimes(): Promise<PistonRuntime[]> {
  if (runtimeCache && Date.now() - runtimeCache.at < 10 * 60_000) return runtimeCache.runtimes
  const res = await fetch(`${PISTON_URL}/api/v2/runtimes`, { signal: AbortSignal.timeout(5000) })
  if (!res.ok) throw new AppError(502, 'Code execution service is unavailable')
  const runtimes = (await res.json()) as PistonRuntime[]
  runtimeCache = { at: Date.now(), runtimes }
  return runtimes
}

// What can run on the server; JavaScript always runs in the browser
router.get('/runtimes', asyncHandler(async (_req, res) => {
  if (!PISTON_URL) return res.json({ serverExecution: false, languages: [] })
  try {
    const runtimes = await pistonRuntimes()
    res.json({ serverExecution: true, languages: [...new Set(runtimes.map((r) => r.language))].sort() })
  } catch {
    res.json({ serverExecution: false, languages: [] })
  }
}))

const executeLimit = rateLimitMiddleware({ capacity: 20, refillPerSecond: 20 / 60, prefix: 'exec', keyFn: (req) => userOf(req)?.id ?? req.ip ?? 'anon' })

router.post(
  '/execute',
  executeLimit,
  validate(z.object({ language: z.string().trim().min(1).max(32), code: z.string().min(1, 'Code is required').max(50_000), stdin: z.string().max(10_000).default('') })),
  asyncHandler(async (req, res) => {
    if (!PISTON_URL) throw new AppError(503, 'Server-side code execution is not configured. JavaScript can still run in your browser.')
    const { language, code, stdin } = req.body as { language: string; code: string; stdin: string }
    const runtime = (await pistonRuntimes()).find((r) => r.language === language || r.aliases.includes(language))
    if (!runtime) throw AppError.badRequest(`Unsupported language: ${language}`)

    const started = Date.now()
    const response = await fetch(`${PISTON_URL}/api/v2/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(30_000),
      body: JSON.stringify({ language: runtime.language, version: runtime.version, files: [{ content: code }], stdin, compile_timeout: 10_000, run_timeout: 5_000, run_memory_limit: 128 * 1024 * 1024 }),
    })
    if (!response.ok) throw new AppError(502, 'Code execution service failed')
    const result = (await response.json()) as {
      compile?: { stdout: string; stderr: string; code: number | null; output: string }
      run: { stdout: string; stderr: string; code: number | null; signal: string | null; output: string }
    }
    const failedToCompile = result.compile && result.compile.code !== 0
    const output = (failedToCompile ? result.compile!.output : result.run.output) ?? ''
    res.json({
      output: output.slice(0, 20_000),
      stderr: (failedToCompile ? result.compile!.stderr : result.run.stderr)?.slice(0, 20_000) ?? '',
      exitCode: failedToCompile ? result.compile!.code : result.run.code,
      success: !failedToCompile && result.run.code === 0,
      timedOut: result.run.signal === 'SIGKILL',
      executionTimeMs: Date.now() - started,
      runtime: `${runtime.language} ${runtime.version}`,
    })
  })
)

/* ───────────── snippets ───────────── */

const snippetSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120),
  code: z.string().min(1, 'Code is required').max(50_000),
  language: z.string().trim().min(1).max(32),
  description: z.string().trim().max(500).default(''),
})
const idParam = (v: string) => {
  const n = Number(v)
  if (!Number.isInteger(n) || n <= 0) throw AppError.badRequest('Invalid id')
  return n
}

router.get('/snippets', asyncHandler(async (req, res) => {
  res.json(await prisma.snippet.findMany({ where: { userId: me(req).id }, orderBy: { updatedAt: 'desc' } }))
}))
router.post('/snippets', validate(snippetSchema), asyncHandler(async (req, res) => {
  res.status(201).json(await prisma.snippet.create({ data: { ...req.body, userId: me(req).id } }))
}))
router.get('/snippets/:id', asyncHandler(async (req, res) => {
  const s = await prisma.snippet.findFirst({ where: { id: idParam(req.params.id), userId: me(req).id } })
  if (!s) throw AppError.notFound('Snippet not found')
  res.json(s)
}))
router.put('/snippets/:id', validate(snippetSchema.partial()), asyncHandler(async (req, res) => {
  const id = idParam(req.params.id)
  const r = await prisma.snippet.updateMany({ where: { id, userId: me(req).id }, data: req.body })
  if (r.count === 0) throw AppError.notFound('Snippet not found')
  res.json(await prisma.snippet.findUniqueOrThrow({ where: { id } }))
}))
router.delete('/snippets/:id', asyncHandler(async (req, res) => {
  const r = await prisma.snippet.deleteMany({ where: { id: idParam(req.params.id), userId: me(req).id } })
  if (r.count === 0) throw AppError.notFound('Snippet not found')
  res.json({ message: 'Snippet deleted' })
}))

export default router
