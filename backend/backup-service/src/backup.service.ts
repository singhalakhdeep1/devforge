/**
 * Backups of every DevForge data store. Sources are discovered from the environment: each
 * `<SERVICE>_DATABASE_URL` (PostgreSQL, dumped with pg_dump in custom format) and each
 * `MONGODB_URI` / `<SERVICE>_MONGODB_URI` (dumped with mongodump --archive --gzip), plus optional
 * directories (BACKUP_INCLUDE_DIRS, e.g. local uploads). Everything goes into one `<id>.tar.gz`
 * with a manifest and a SHA-256 checksum, stored by ./storage. Restores verify the checksum and
 * run pg_restore --clean / mongorestore --drop for the chosen sources.
 */
import crypto from 'node:crypto'
import { execFile } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import * as tar from 'tar'
import { AppError, createLogger, env, envInt } from '@devhub/shared'
import { createStore, type BackupStore } from './storage'

const run = promisify(execFile)
const log = createLogger('backup')

export type Engine = 'postgres' | 'mongo' | 'files'

export interface Source {
  name: string
  engine: Engine
  /** Connection string (passwords stay in memory only) or directory. */
  target: string
  /** PostgreSQL schema from Prisma's `?schema=` parameter, when present. */
  schema?: string
}

export interface SourceResult {
  name: string
  engine: Engine
  ok: boolean
  bytes: number
  ms: number
  error?: string
}

export interface BackupRecord {
  id: string
  trigger: 'scheduled' | 'manual'
  requestedBy?: string
  status: 'running' | 'success' | 'partial' | 'failed'
  startedAt: string
  finishedAt?: string
  size: number
  sha256?: string
  sources: SourceResult[]
  error?: string
}

export interface Job {
  id: string
  type: 'backup' | 'restore'
  backupId: string
  status: 'running' | 'success' | 'failed'
  startedAt: string
  finishedAt?: string
  requestedBy?: string
  results: SourceResult[]
  error?: string
}

const PRISMA_ONLY_PARAMS = ['schema', 'connection_limit', 'pool_timeout', 'pgbouncer', 'statement_cache_size', 'socket_timeout']

/** A Prisma URL as libpq accepts it: Prisma-only parameters removed, `schema` returned apart. */
export function libpqUrl(raw: string): { url: string; schema?: string } {
  const u = new URL(raw)
  const schema = u.searchParams.get('schema') ?? undefined
  for (const p of PRISMA_ONLY_PARAMS) u.searchParams.delete(p)
  return { url: u.toString(), schema }
}

const redact = (text: string) => text.replace(/\/\/([^:@/\s]+):[^@/\s]*@/g, '//$1:***@')

/** All sources configured for this deployment; two services sharing one database (and schema) are dumped once. */
export function discoverSources(environment: NodeJS.ProcessEnv = process.env): Source[] {
  const out: Source[] = []
  const seen = new Set<string>()
  const add = (s: Source) => {
    const key = `${s.engine}|${s.engine === 'postgres' ? libpqUrl(s.target).url : s.target}|${s.schema ?? ''}`
    if (seen.has(key)) return
    seen.add(key)
    out.push(s)
  }
  for (const [k, v] of Object.entries(environment).sort(([a], [b]) => a.localeCompare(b))) {
    if (!v) continue
    const pg = /^([A-Z][A-Z0-9]*)_DATABASE_URL$/.exec(k)
    if (pg && /^postgres(ql)?:\/\//.test(v)) add({ name: pg[1].toLowerCase(), engine: 'postgres', target: v, schema: libpqUrl(v).schema })
    else if (k === 'DATABASE_URL' && /^postgres(ql)?:\/\//.test(v)) add({ name: 'default', engine: 'postgres', target: v, schema: libpqUrl(v).schema })
    const mongo = /^(?:([A-Z][A-Z0-9]*)_)?MONGODB_URI$/.exec(k)
    if (mongo && /^mongodb(\+srv)?:\/\//.test(v)) add({ name: mongo[1] ? `${mongo[1].toLowerCase()}-mongo` : 'mongo', engine: 'mongo', target: v })
  }
  for (const dir of (environment.BACKUP_INCLUDE_DIRS ?? '').split(',').map((d) => d.trim()).filter(Boolean)) {
    add({ name: `files-${path.basename(dir)}`, engine: 'files', target: path.resolve(dir) })
  }
  const only = (environment.BACKUP_SOURCES ?? '').split(',').map((s) => s.trim()).filter(Boolean)
  return only.length ? out.filter((s) => only.includes(s.name)) : out
}

const tool = (name: 'pg_dump' | 'pg_restore' | 'mongodump' | 'mongorestore') => env(`${name.toUpperCase()}_PATH`, name)

async function sizeOf(p: string): Promise<number> {
  const st = await fs.promises.stat(p)
  if (!st.isDirectory()) return st.size
  let total = 0
  for (const e of await fs.promises.readdir(p)) total += await sizeOf(path.join(p, e))
  return total
}

async function sha256(file: string): Promise<string> {
  const h = crypto.createHash('sha256')
  for await (const chunk of fs.createReadStream(file)) h.update(chunk as Buffer)
  return h.digest('hex')
}

const dumpFile = (s: Source) => (s.engine === 'postgres' ? `postgres/${s.name}.dump` : s.engine === 'mongo' ? `mongo/${s.name}.archive.gz` : `files/${s.name}`)

const failure = (e: unknown) => redact(((e as { stderr?: string }).stderr || (e as Error).message).trim().split('\n').slice(-3).join(' ')).slice(0, 500)

async function dump(s: Source, workdir: string): Promise<SourceResult> {
  const started = Date.now()
  const out = path.join(workdir, dumpFile(s))
  await fs.promises.mkdir(path.dirname(out), { recursive: true })
  try {
    if (s.engine === 'postgres') {
      const { url, schema } = libpqUrl(s.target)
      await run(tool('pg_dump'), ['--format=custom', '--no-owner', '--no-privileges', ...(schema ? [`--schema=${schema}`] : []), `--file=${out}`, `--dbname=${url}`], { maxBuffer: 16 * 1024 * 1024 })
    } else if (s.engine === 'mongo') {
      await run(tool('mongodump'), [`--uri=${s.target}`, `--archive=${out}`, '--gzip'], { maxBuffer: 16 * 1024 * 1024 })
    } else {
      await fs.promises.cp(s.target, out, { recursive: true })
    }
    return { name: s.name, engine: s.engine, ok: true, bytes: await sizeOf(out), ms: Date.now() - started }
  } catch (e) {
    return { name: s.name, engine: s.engine, ok: false, bytes: 0, ms: Date.now() - started, error: failure(e) }
  }
}

async function restoreOne(s: Source, workdir: string): Promise<SourceResult> {
  const started = Date.now()
  const file = path.join(workdir, dumpFile(s))
  try {
    if (!fs.existsSync(file)) throw new Error('not in this backup')
    if (s.engine === 'postgres') {
      const { url } = libpqUrl(s.target)
      await run(tool('pg_restore'), ['--clean', '--if-exists', '--no-owner', '--no-privileges', '--single-transaction', `--dbname=${url}`, file], { maxBuffer: 16 * 1024 * 1024 })
    } else if (s.engine === 'mongo') {
      await run(tool('mongorestore'), [`--uri=${s.target}`, `--archive=${file}`, '--gzip', '--drop'], { maxBuffer: 16 * 1024 * 1024 })
    } else {
      await fs.promises.rm(s.target, { recursive: true, force: true })
      await fs.promises.cp(file, s.target, { recursive: true })
    }
    return { name: s.name, engine: s.engine, ok: true, bytes: await sizeOf(file), ms: Date.now() - started }
  } catch (e) {
    return { name: s.name, engine: s.engine, ok: false, bytes: 0, ms: Date.now() - started, error: failure(e) }
  }
}

const ID_RE = /^backup-\d{8}T\d{6}Z-[a-f0-9]{6}$/

export class BackupService {
  readonly store: BackupStore = createStore()
  private readonly jobs = new Map<string, Job>()
  private current?: Job

  sources() {
    return discoverSources()
  }

  get busy() {
    return this.current?.status === 'running'
  }

  /** Runs a backup now. Resolves when the archive is stored (or the backup failed). */
  async performBackup(trigger: BackupRecord['trigger'], requestedBy?: string): Promise<BackupRecord> {
    if (this.busy) throw new AppError(409, 'Another backup or restore is running', 'BUSY')
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z')
    const id = `backup-${stamp}-${crypto.randomBytes(3).toString('hex')}`
    const record: BackupRecord = { id, trigger, requestedBy, status: 'running', startedAt: new Date().toISOString(), size: 0, sources: [] }
    const job = this.track({ id: crypto.randomUUID(), type: 'backup', backupId: id, status: 'running', startedAt: record.startedAt, requestedBy, results: record.sources })
    const workdir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'devforge-backup-'))
    try {
      await this.store.putJSON(`${id}.json`, record)
      const sources = this.sources()
      if (!sources.length) throw new Error('No data sources configured (set <SERVICE>_DATABASE_URL / MONGODB_URI)')
      for (const s of sources) {
        const r = await dump(s, workdir)
        record.sources.push(r)
        if (!r.ok) log.logWarning('backup source failed', { backup: id, source: s.name, error: r.error })
      }
      if (!record.sources.some((r) => r.ok)) throw new Error('Every source failed')
      await fs.promises.writeFile(path.join(workdir, 'manifest.json'), JSON.stringify({ id, createdAt: record.startedAt, format: 1, sources: record.sources }, null, 2))
      const archive = path.join(os.tmpdir(), `${id}.tar.gz`)
      await tar.c({ gzip: true, file: archive, cwd: workdir, portable: true }, await fs.promises.readdir(workdir))
      record.size = (await fs.promises.stat(archive)).size
      record.sha256 = await sha256(archive)
      await this.store.putFile(`${id}.tar.gz`, archive)
      await fs.promises.rm(archive, { force: true })
      record.status = record.sources.every((r) => r.ok) ? 'success' : 'partial'
    } catch (e) {
      record.status = 'failed'
      record.error = redact((e as Error).message)
      log.logError('backup failed', record.error, { backup: id })
    } finally {
      record.finishedAt = new Date().toISOString()
      await this.store.putJSON(`${id}.json`, record).catch((e) => log.logError('could not save backup record', (e as Error).message, { backup: id }))
      await fs.promises.rm(workdir, { recursive: true, force: true })
      this.finish(job, record.status === 'failed' ? 'failed' : 'success', record.error)
    }
    log.logInformation('backup finished', { backup: id, status: record.status, size: record.size })
    return record
  }

  /** Starts a restore in the background; poll the returned job. */
  async startRestore(backupId: string, only: string[] | undefined, requestedBy?: string): Promise<Job> {
    const record = await this.get(backupId)
    if (record.status === 'failed' || record.status === 'running') throw AppError.badRequest(`Backup ${backupId} is ${record.status} and cannot be restored`)
    if (this.busy) throw new AppError(409, 'Another backup or restore is running', 'BUSY')
    const inBackup = new Set(record.sources.filter((r) => r.ok).map((r) => r.name))
    const chosen = this.sources().filter((s) => inBackup.has(s.name) && (!only?.length || only.includes(s.name)))
    const unknown = (only ?? []).filter((n) => !chosen.some((s) => s.name === n))
    if (unknown.length) throw AppError.badRequest(`Not restorable here: ${unknown.join(', ')}`)
    if (!chosen.length) throw AppError.badRequest('None of the sources in this backup are configured on this deployment')
    const job = this.track({ id: crypto.randomUUID(), type: 'restore', backupId, status: 'running', startedAt: new Date().toISOString(), requestedBy, results: [] })
    void this.runRestore(job, record, chosen)
    return job
  }

  private async runRestore(job: Job, record: BackupRecord, chosen: Source[]) {
    const workdir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'devforge-restore-'))
    try {
      const archive = path.join(workdir, 'archive.tar.gz')
      await this.store.getFile(`${record.id}.tar.gz`, archive)
      if (record.sha256 && (await sha256(archive)) !== record.sha256) throw new Error('Checksum mismatch: the archive is corrupt')
      await tar.x({ file: archive, cwd: workdir })
      for (const s of chosen) job.results.push(await restoreOne(s, workdir))
      const failed = job.results.filter((r) => !r.ok)
      this.finish(job, failed.length ? 'failed' : 'success', failed.length ? `Failed: ${failed.map((r) => r.name).join(', ')}` : undefined)
    } catch (e) {
      this.finish(job, 'failed', redact((e as Error).message))
    } finally {
      await fs.promises.rm(workdir, { recursive: true, force: true })
    }
    log.logInformation('restore finished', { backup: record.id, status: job.status })
  }

  async list(): Promise<BackupRecord[]> {
    const keys = (await this.store.list()).filter((k) => k.endsWith('.json') && ID_RE.test(k.slice(0, -5)))
    const records = await Promise.all(keys.map((k) => this.store.getJSON<BackupRecord>(k)))
    return records.filter((r): r is BackupRecord => Boolean(r)).sort((a, b) => b.startedAt.localeCompare(a.startedAt))
  }

  async get(id: string): Promise<BackupRecord> {
    if (!ID_RE.test(id)) throw AppError.notFound('Backup not found')
    const r = await this.store.getJSON<BackupRecord>(`${id}.json`)
    if (!r) throw AppError.notFound('Backup not found')
    return r
  }

  async download(id: string) {
    const record = await this.get(id)
    const stream = await this.store.stream(`${id}.tar.gz`)
    if (!stream) throw AppError.notFound('Archive not found')
    return { record, stream }
  }

  async remove(id: string) {
    await this.get(id)
    await this.store.remove(`${id}.tar.gz`)
    await this.store.remove(`${id}.json`)
  }

  /** Deletes backups older than BACKUP_RETENTION_DAYS, always keeping the newest BACKUP_KEEP_MIN good ones. */
  async applyRetention(): Promise<string[]> {
    const days = envInt('BACKUP_RETENTION_DAYS', 30)
    const keepMin = envInt('BACKUP_KEEP_MIN', 5)
    const cutoff = Date.now() - days * 86_400_000
    const all = await this.list()
    const keep = new Set(all.filter((r) => r.status === 'success' || r.status === 'partial').slice(0, keepMin).map((r) => r.id))
    const stale = all.filter((r) => r.status !== 'running' && !keep.has(r.id) && new Date(r.startedAt).getTime() < cutoff)
    for (const r of stale) await this.remove(r.id)
    if (stale.length) log.logInformation('retention removed backups', { count: stale.length, days })
    return stale.map((r) => r.id)
  }

  job(id: string) {
    const j = this.jobs.get(id)
    if (!j) throw AppError.notFound('Job not found')
    return j
  }

  recentJobs() {
    return [...this.jobs.values()].sort((a, b) => b.startedAt.localeCompare(a.startedAt)).slice(0, 20)
  }

  /** Which dump tools are installed and their versions. */
  async tools() {
    const names = ['pg_dump', 'pg_restore', 'mongodump', 'mongorestore'] as const
    const out: Record<string, string | null> = {}
    await Promise.all(
      names.map(async (n) => {
        try {
          out[n] = (await run(tool(n), ['--version'], { timeout: 5000 })).stdout.trim().split('\n')[0]
        } catch {
          out[n] = null
        }
      }),
    )
    return out
  }

  private track(job: Job) {
    this.jobs.set(job.id, job)
    this.current = job
    if (this.jobs.size > 50) this.jobs.delete(this.jobs.keys().next().value!)
    return job
  }

  private finish(job: Job, status: Job['status'], error?: string) {
    job.status = status
    job.error = error
    job.finishedAt = new Date().toISOString()
  }
}

export const backupService = new BackupService()
