import { Prisma, PrismaClient } from './generated/client'
import { TOPICS, createEventBus, createLogger } from '@devhub/shared'

export const prisma = new PrismaClient()
const log = createLogger('payment')

type Tx = Prisma.TransactionClient

/** Queue an event inside the caller's transaction. The relay publishes it once the transaction committed. */
export const enqueue = (tx: Tx, topic: string, type: string, key: string, payload: Prisma.InputJsonValue) =>
  tx.outbox.create({ data: { topic, type, key, payload } })

/**
 * Publishes committed outbox rows. Safe to run on several instances: rows are claimed with
 * FOR UPDATE SKIP LOCKED, and delivery is at-least-once (consumers are idempotent).
 */
export function startOutboxRelay(intervalMs = 1000): () => void {
  const bus = createEventBus('payment')
  let busy = false
  const tick = async () => {
    if (busy) return
    busy = true
    try {
      await prisma.$transaction(
        async (tx) => {
          const rows = await tx.$queryRaw<{ id: number; topic: string; type: string; key: string | null; payload: unknown }[]>`
            SELECT id, topic, type, key, payload FROM "Outbox" WHERE "publishedAt" IS NULL ORDER BY id LIMIT 50 FOR UPDATE SKIP LOCKED`
          for (const r of rows) await bus.publish(r.topic, r.type, r.payload, r.key ?? undefined)
          if (rows.length) await tx.outbox.updateMany({ where: { id: { in: rows.map((r) => r.id) } }, data: { publishedAt: new Date() } })
        },
        { timeout: 20_000 }
      )
    } catch (e) {
      log.logWarning('outbox relay failed, will retry', { error: String(e) })
    } finally {
      busy = false
    }
  }
  const timer = setInterval(() => void tick(), intervalMs)
  void tick()
  return () => clearInterval(timer)
}

export { TOPICS }
