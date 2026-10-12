import crypto from 'node:crypto'
import { prisma } from './db'
import type { Prisma } from './generated/client'

export const GENESIS = '0'.repeat(64)
const LOCK_KEY = 7_001_001 // pg advisory lock: one writer at a time keeps the chain linear

/** Canonical form: object keys sorted at every level, so the same data always hashes the same. */
const canonical = (v: unknown): string => {
  if (v === null || typeof v !== 'object') return JSON.stringify(v ?? null)
  if (Array.isArray(v)) return `[${v.map(canonical).join(',')}]`
  const o = v as Record<string, unknown>
  return `{${Object.keys(o).sort().map((k) => `${JSON.stringify(k)}:${canonical(o[k])}`).join(',')}}`
}

export interface Entry {
  at: Date
  actorId: string | null
  action: string
  resource: string
  resourceId: string | null
  status: string
  ip: string | null
  userAgent: string | null
  details: Prisma.InputJsonValue
}

export const hashOf = (prevHash: string, e: Pick<Entry, 'at' | 'actorId' | 'action' | 'resource' | 'resourceId' | 'status' | 'ip' | 'userAgent'> & { details: unknown }) =>
  crypto
    .createHash('sha256')
    .update([prevHash, e.at.toISOString(), e.actorId ?? '', e.action, e.resource, e.resourceId ?? '', e.status, e.ip ?? '', e.userAgent ?? '', canonical(e.details)].join('|'))
    .digest('hex')

/** Appends one entry to the chain. Returns false when the same bus event was already recorded. */
export async function append(e: Entry, eventId?: string): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(${LOCK_KEY})`
    if (eventId && (await tx.auditLog.findUnique({ where: { eventId }, select: { id: true } }))) return false
    const last = await tx.auditLog.findFirst({ orderBy: { id: 'desc' }, select: { hash: true } })
    const prevHash = last?.hash ?? GENESIS
    await tx.auditLog.create({ data: { ...e, prevHash, hash: hashOf(prevHash, e), eventId } })
    return true
  }, { timeout: 15_000 })
}

/** Walks the chain from `fromId` (or the beginning) and reports the first row that does not fit. */
export async function verify(fromId?: bigint, limit = 200_000) {
  let prev = GENESIS
  let cursor = (fromId ?? 1n) - 1n
  if (fromId !== undefined && fromId > 1n) {
    const before = await prisma.auditLog.findFirst({ where: { id: { lt: fromId } }, orderBy: { id: 'desc' }, select: { hash: true } })
    prev = before?.hash ?? GENESIS
  }
  let checked = 0
  for (;;) {
    const rows = await prisma.auditLog.findMany({ where: { id: { gt: cursor } }, orderBy: { id: 'asc' }, take: 1000 })
    if (rows.length === 0) return { ok: true, checked }
    for (const r of rows) {
      if (r.prevHash !== prev) return { ok: false, checked, firstBadId: r.id.toString(), reason: 'The chain is broken here: an earlier row was removed or replaced' }
      if (r.hash !== hashOf(r.prevHash, { ...r, details: r.details })) return { ok: false, checked, firstBadId: r.id.toString(), reason: 'This row does not match its hash: it was modified after it was written' }
      prev = r.hash
      cursor = r.id
      if (++checked >= limit) return { ok: true, checked, truncated: true }
    }
  }
}
