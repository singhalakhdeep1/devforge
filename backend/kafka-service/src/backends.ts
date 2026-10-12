import { Kafka, logLevel } from 'kafkajs'
import { createRedis, env, type DomainEvent } from '@devhub/shared'

export interface TopicInfo { topic: string; messages: number; partitions?: number; deadLetters: number }
export interface GroupInfo { group: string; topic: string; state?: string; members: number; lag: number | null; pending?: number }
export interface DeadLetter { ref: string; event: DomainEvent | null; raw?: string }

export interface Backend {
  readonly kind: 'kafka' | 'redis-streams'
  healthy(): Promise<boolean>
  topics(): Promise<TopicInfo[]>
  groups(): Promise<GroupInfo[]>
  deadLetters(topic: string, limit: number): Promise<DeadLetter[]>
  /** Move dead letters back to the original topic. Returns how many were replayed. */
  replay(topic: string, limit: number, publish: (e: DomainEvent) => Promise<void>): Promise<number>
  purge(topic: string): Promise<number>
  close(): Promise<void>
}

const parse = (raw: string): DomainEvent | null => { try { return JSON.parse(raw) as DomainEvent } catch { return null } }
const isEventTopic = (t: string) => t.startsWith('devforge.')

/* ───────────────────────── Redis Streams ───────────────────────── */

class RedisBackend implements Backend {
  readonly kind = 'redis-streams' as const
  private readonly r = createRedis({ name: 'kafka-service' })

  async healthy() { try { return (await this.r.ping()) === 'PONG' } catch { return false } }

  private async keys() {
    const out: string[] = []
    let cursor = '0'
    do { const [n, b] = await this.r.scan(cursor, 'MATCH', 'evt:*', 'COUNT', 200); cursor = n; out.push(...b) } while (cursor !== '0')
    return out
  }

  async topics() {
    const keys = (await this.keys()).filter((k) => !k.endsWith('.dlq'))
    return Promise.all(keys.sort().map(async (k) => ({ topic: k.slice(4), messages: await this.r.xlen(k), deadLetters: await this.r.xlen(`${k}.dlq`).catch(() => 0) })))
  }

  async groups() {
    const out: GroupInfo[] = []
    for (const k of (await this.keys()).filter((x) => !x.endsWith('.dlq'))) {
      const raw = (await (this.r.xinfo('GROUPS', k) as Promise<unknown[][]>).catch(() => [])) as unknown[][]
      for (const g of raw) {
        const o: Record<string, unknown> = {}
        for (let i = 0; i < g.length; i += 2) o[String(g[i])] = g[i + 1]
        out.push({ group: String(o.name), topic: k.slice(4), members: Number(o.consumers), lag: o.lag == null ? null : Number(o.lag), pending: Number(o.pending) })
      }
    }
    return out
  }

  async deadLetters(topic: string, limit: number) {
    const rows = await this.r.xrange(`evt:${topic}.dlq`, '-', '+', 'COUNT', limit)
    return rows.map(([id, f]) => { const raw = f[f.indexOf('event') + 1]; return { ref: id, event: parse(raw), raw } })
  }

  async replay(topic: string, limit: number, publish: (e: DomainEvent) => Promise<void>) {
    let n = 0
    for (const dl of await this.deadLetters(topic, limit)) {
      if (!dl.event) continue
      await publish(dl.event)
      await this.r.xdel(`evt:${topic}.dlq`, dl.ref)
      n++
    }
    return n
  }

  async purge(topic: string) {
    const n = await this.r.xlen(`evt:${topic}.dlq`).catch(() => 0)
    await this.r.del(`evt:${topic}.dlq`)
    return n
  }

  async close() { this.r.disconnect() }
}

/* ───────────────────────── Kafka ───────────────────────── */

class KafkaBackend implements Backend {
  readonly kind = 'kafka' as const
  private readonly kafka = new Kafka({ clientId: 'devforge-kafka-service', brokers: env('KAFKA_BROKERS').split(',').map((s) => s.trim()), logLevel: logLevel.NOTHING, retry: { retries: 3 } })

  private async admin<T>(fn: (a: ReturnType<Kafka['admin']>) => Promise<T>): Promise<T> {
    const a = this.kafka.admin()
    await a.connect()
    try { return await fn(a) } finally { await a.disconnect().catch(() => undefined) }
  }

  async healthy() { try { await this.admin((a) => a.listTopics()); return true } catch { return false } }

  async topics() {
    return this.admin(async (a) => {
      const names = (await a.listTopics()).filter(isEventTopic).sort()
      const live = names.filter((n) => !n.endsWith('.dlq'))
      const meta = await a.fetchTopicMetadata({ topics: live })
      return Promise.all(live.map(async (t) => {
        const offs = await a.fetchTopicOffsets(t)
        const dlq = names.includes(`${t}.dlq`) ? (await a.fetchTopicOffsets(`${t}.dlq`)).reduce((n, o) => n + (Number(o.high) - Number(o.low)), 0) : 0
        return { topic: t, messages: offs.reduce((n, o) => n + (Number(o.high) - Number(o.low)), 0), partitions: meta.topics.find((x) => x.name === t)?.partitions.length, deadLetters: dlq }
      }))
    })
  }

  async groups() {
    return this.admin(async (a) => {
      const { groups } = await a.listGroups()
      const out: GroupInfo[] = []
      for (const g of groups.filter((x) => !x.groupId.startsWith('kafka-service'))) {
        const [topicName] = g.groupId.split('.').length > 1 ? [g.groupId.slice(g.groupId.indexOf('.') + 1)] : ['']
        if (!isEventTopic(topicName)) continue
        const [desc] = (await a.describeGroups([g.groupId])).groups
        const committed = await a.fetchOffsets({ groupId: g.groupId, topics: [topicName] })
        const latest = await a.fetchTopicOffsets(topicName)
        let lag = 0
        for (const p of committed[0]?.partitions ?? []) {
          const high = Number(latest.find((o) => o.partition === p.partition)?.high ?? 0)
          lag += Math.max(0, high - (Number(p.offset) < 0 ? Number(latest.find((o) => o.partition === p.partition)?.low ?? 0) : Number(p.offset)))
        }
        out.push({ group: g.groupId.slice(0, g.groupId.indexOf('.')), topic: topicName, state: desc?.state, members: desc?.members.length ?? 0, lag })
      }
      return out
    })
  }

  /** Reads the dead-letter topic with a group that remembers its position, so each message is shown/replayed once. */
  private async drain(topic: string, limit: number, commit: boolean, handle: (dl: DeadLetter) => Promise<void>) {
    const consumer = this.kafka.consumer({ groupId: `kafka-service.dlq.${topic}${commit ? '' : '.peek'}.${commit ? 'replay' : Date.now()}`, allowAutoTopicCreation: false })
    await consumer.connect()
    let seen = 0
    try {
      await consumer.subscribe({ topic: `${topic}.dlq`, fromBeginning: true })
      await new Promise<void>((resolve) => {
        const idle = () => setTimeout(resolve, 3500)
        let timer = idle()
        void consumer.run({
          autoCommit: commit,
          eachMessage: async ({ partition, message }) => {
            clearTimeout(timer)
            if (seen < limit && message.value) {
              seen++
              await handle({ ref: `${partition}:${message.offset}`, event: parse(message.value.toString()), raw: message.value.toString() })
            }
            if (seen >= limit) resolve()
            else timer = idle()
          },
        })
      })
    } finally {
      await consumer.disconnect().catch(() => undefined)
    }
  }

  async deadLetters(topic: string, limit: number) {
    const out: DeadLetter[] = []
    await this.drain(topic, limit, false, async (dl) => void out.push(dl)).catch(() => undefined)
    return out
  }

  async replay(topic: string, limit: number, publish: (e: DomainEvent) => Promise<void>) {
    let n = 0
    await this.drain(topic, limit, true, async (dl) => {
      if (dl.event) { await publish(dl.event); n++ }
    })
    return n
  }

  async purge(topic: string) {
    return this.admin(async (a) => {
      const offs = await a.fetchTopicOffsets(`${topic}.dlq`).catch(() => [])
      const n = offs.reduce((s, o) => s + (Number(o.high) - Number(o.low)), 0)
      if (n) await a.deleteTopicRecords({ topic: `${topic}.dlq`, partitions: offs.map((o) => ({ partition: o.partition, offset: o.high })) })
      return n
    })
  }

  async close() { /* admin connections are opened per call */ }
}

export const makeBackend = (): Backend => (env('KAFKA_BROKERS') ? new KafkaBackend() : new RedisBackend())
