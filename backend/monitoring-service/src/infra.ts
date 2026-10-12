import mongoose from 'mongoose'
import { createRedis, env, getRedis } from '@devhub/shared'

export interface InfraItem {
  name: string
  healthy: boolean
  latencyMs: number | null
  detail?: Record<string, unknown>
  error?: string
}

async function timed<T>(name: string, fn: () => Promise<T>, detail?: (r: T) => Record<string, unknown>): Promise<InfraItem> {
  const t = Date.now()
  try {
    const r = await fn()
    return { name, healthy: true, latencyMs: Date.now() - t, detail: detail?.(r) }
  } catch (e) {
    return { name, healthy: false, latencyMs: null, error: String((e as Error).message ?? e).slice(0, 160) }
  }
}

const parseInfo = (text: string) => Object.fromEntries(text.split('\r\n').filter((l) => l && !l.startsWith('#')).map((l) => l.split(':') as [string, string]))

export async function infrastructure(): Promise<InfraItem[]> {
  const redis = getRedis()
  const items = await Promise.all([
    timed('redis', async () => parseInfo(await redis.info()), (i) => ({
      version: i.redis_version,
      usedMemoryMB: Math.round(Number(i.used_memory) / 1048576),
      maxMemoryMB: Number(i.maxmemory) ? Math.round(Number(i.maxmemory) / 1048576) : null,
      clients: Number(i.connected_clients),
      opsPerSec: Number(i.instantaneous_ops_per_sec),
      evictedKeys: Number(i.evicted_keys),
    })),
    timed('mongodb', async () => {
      const c = mongoose.connection.readyState === 1 ? mongoose.connection : (await mongoose.createConnection(env('MONGODB_URI', 'mongodb://localhost:27017'), { serverSelectionTimeoutMS: 2000 }).asPromise())
      return c.db!.admin().ping()
    }),
    timed('elasticsearch', async () => {
      const r = await fetch(`${env('ELASTICSEARCH_URL', 'http://localhost:9200')}/_cluster/health`, { signal: AbortSignal.timeout(2500) })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.json() as Promise<{ status: string; number_of_nodes: number; unassigned_shards: number }>
    }, (h) => ({ status: h.status, nodes: h.number_of_nodes, unassignedShards: h.unassigned_shards })),
  ])
  const es = items.find((i) => i.name === 'elasticsearch')
  if (es?.healthy && es.detail?.status === 'red') es.healthy = false
  return items
}

/* ───────────── event bus (Redis Streams): the pulse of the whole system ───────────── */

export interface StreamStat {
  topic: string
  length: number
  deadLetters: number
  groups: { name: string; consumers: number; pending: number; lag: number | null }[]
}

export async function streams(): Promise<StreamStat[]> {
  const redis = createRedis({ name: 'monitoring-streams' })
  try {
    const keys: string[] = []
    let cursor = '0'
    do {
      const [next, batch] = await redis.scan(cursor, 'MATCH', 'evt:*', 'COUNT', 200)
      cursor = next
      keys.push(...batch)
    } while (cursor !== '0')
    const topics = keys.filter((k) => !k.endsWith('.dlq')).sort()
    return await Promise.all(
      topics.map(async (key) => {
        const [length, dlq, groupsRaw] = await Promise.all([
          redis.xlen(key),
          redis.xlen(`${key}.dlq`).catch(() => 0),
          (redis.xinfo('GROUPS', key) as Promise<unknown[]>).catch(() => [] as unknown[]),
        ])
        const groups = (groupsRaw as unknown[][]).map((g) => {
          const o: Record<string, unknown> = {}
          for (let i = 0; i < g.length; i += 2) o[String(g[i])] = g[i + 1]
          return { name: String(o.name), consumers: Number(o.consumers), pending: Number(o.pending), lag: o.lag === null || o.lag === undefined ? null : Number(o.lag) }
        })
        return { topic: key.slice(4), length, deadLetters: dlq, groups }
      })
    )
  } finally {
    redis.disconnect()
  }
}

export async function queues() {
  const redis = getRedis()
  const out: Record<string, Record<string, number>> = {}
  const names = new Set<string>()
  let cursor = '0'
  do {
    const [next, batch] = await redis.scan(cursor, 'MATCH', 'bull:*:id', 'COUNT', 200)
    cursor = next
    for (const k of batch) names.add(k.split(':')[1])
  } while (cursor !== '0')
  for (const q of names) {
    const [waiting, active, delayed, failed, completed] = await Promise.all([
      redis.llen(`bull:${q}:wait`), redis.llen(`bull:${q}:active`), redis.zcard(`bull:${q}:delayed`), redis.zcard(`bull:${q}:failed`), redis.zcard(`bull:${q}:completed`),
    ])
    out[q] = { waiting, active, delayed, failed, completed }
  }
  return out
}
