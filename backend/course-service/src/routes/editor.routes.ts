import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'
import { env } from '../config/env'
import { HttpError, handle, intParam, notFound } from '../lib/errors'
import { prisma } from '../lib/prisma'
import { protect } from '../middleware/auth'
import { validate } from '../middleware/validate'

const router = Router()
router.use(protect)

// ---------- Code execution (Piston) ----------

const executeLimiter = rateLimit({
    windowMs: 60_000,
    max: 20,
    keyGenerator: (req) => req.user.id,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many runs, wait a minute and try again' },
})

interface PistonRuntime {
    language: string
    version: string
    aliases: string[]
}

let runtimeCache: { at: number; runtimes: PistonRuntime[] } | null = null

async function pistonRuntimes(): Promise<PistonRuntime[]> {
    if (runtimeCache && Date.now() - runtimeCache.at < 10 * 60_000) return runtimeCache.runtimes
    const res = await fetch(`${env.PISTON_URL}/api/v2/runtimes`, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) throw new HttpError(502, 'Code execution service is unavailable')
    const runtimes = (await res.json()) as PistonRuntime[]
    runtimeCache = { at: Date.now(), runtimes }
    return runtimes
}

// GET /api/editor/runtimes - what can run on the server; JavaScript always runs in the browser
router.get(
    '/runtimes',
    handle(async (_req, res) => {
        if (!env.PISTON_URL) return res.json({ serverExecution: false, languages: [] })
        try {
            const runtimes = await pistonRuntimes()
            res.json({ serverExecution: true, languages: [...new Set(runtimes.map((r) => r.language))].sort() })
        } catch {
            res.json({ serverExecution: false, languages: [] })
        }
    })
)

router.post(
    '/execute',
    executeLimiter,
    validate(
        z.object({
            language: z.string().trim().min(1).max(32),
            code: z.string().min(1, 'Code is required').max(50_000),
            stdin: z.string().max(10_000).default(''),
        })
    ),
    handle(async (req, res) => {
        if (!env.PISTON_URL) {
            throw new HttpError(503, 'Server-side code execution is not configured. JavaScript can still run in your browser.')
        }
        const { language, code, stdin } = req.body as { language: string; code: string; stdin: string }

        const runtime = (await pistonRuntimes()).find((r) => r.language === language || r.aliases.includes(language))
        if (!runtime) throw new HttpError(400, `Unsupported language: ${language}`)

        const started = Date.now()
        const response = await fetch(`${env.PISTON_URL}/api/v2/execute`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(30_000),
            body: JSON.stringify({
                language: runtime.language,
                version: runtime.version,
                files: [{ content: code }],
                stdin,
                compile_timeout: 10_000,
                run_timeout: 5_000,
                run_memory_limit: 128 * 1024 * 1024,
            }),
        })
        if (!response.ok) throw new HttpError(502, 'Code execution service failed')

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

// ---------- Snippets ----------

const snippetSchema = z.object({
    title: z.string().trim().min(1, 'Title is required').max(120),
    code: z.string().min(1, 'Code is required').max(50_000),
    language: z.string().trim().min(1).max(32),
    description: z.string().trim().max(500).default(''),
})

router.get(
    '/snippets',
    handle(async (req, res) => {
        res.json(await prisma.snippet.findMany({ where: { userId: req.user.id }, orderBy: { updatedAt: 'desc' } }))
    })
)

router.post(
    '/snippets',
    validate(snippetSchema),
    handle(async (req, res) => {
        res.status(201).json(await prisma.snippet.create({ data: { ...req.body, userId: req.user.id } }))
    })
)

router.get(
    '/snippets/:id',
    handle(async (req, res) => {
        const snippet = await prisma.snippet.findFirst({ where: { id: intParam(req.params.id), userId: req.user.id } })
        if (!snippet) throw notFound('Snippet')
        res.json(snippet)
    })
)

router.put(
    '/snippets/:id',
    validate(snippetSchema.partial()),
    handle(async (req, res) => {
        const id = intParam(req.params.id)
        const result = await prisma.snippet.updateMany({ where: { id, userId: req.user.id }, data: req.body })
        if (result.count === 0) throw notFound('Snippet')
        res.json(await prisma.snippet.findUniqueOrThrow({ where: { id } }))
    })
)

router.delete(
    '/snippets/:id',
    handle(async (req, res) => {
        const result = await prisma.snippet.deleteMany({ where: { id: intParam(req.params.id), userId: req.user.id } })
        if (result.count === 0) throw notFound('Snippet')
        res.json({ message: 'Snippet deleted' })
    })
)

export default router
