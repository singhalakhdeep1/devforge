import { TOPICS, createEventBus, createLogger, emit, env, getRedis } from '@devhub/shared'
import { infrastructure, queues, streams } from './infra'
import { allServices, seenUp, statusOf } from './scraper'

const log = createLogger('monitoring')
const bus = createEventBus('monitoring')
const R = { rules: 'monitoring:rules', active: 'monitoring:alerts', history: 'monitoring:alert-history', silence: (k: string) => `monitoring:silence:${k}` }

export type Kind = 'service_down' | 'error_rate' | 'latency_p95' | 'consumer_lag' | 'dead_letters' | 'queue_failed' | 'infra_down' | 'redis_memory'
export interface Rule {
  id: string
  name: string
  kind: Kind
  threshold: number
  /** the condition must hold this long before the alert fires (avoids flapping) */
  forSeconds: number
  severity: 'info' | 'warning' | 'critical'
  enabled: boolean
  actions: ('log' | 'email' | 'webhook' | 'slack')[]
}
export interface Alert {
  key: string
  ruleId: string
  ruleName: string
  severity: Rule['severity']
  subject: string
  message: string
  value: number
  since: number
  firedAt: number | null
  resolvedAt?: number
  state: 'pending' | 'firing' | 'resolved'
}

export const DEFAULT_RULES: Rule[] = [
  { id: 'service-down', name: 'Service is down', kind: 'service_down', threshold: 1, forSeconds: 30, severity: 'critical', enabled: true, actions: ['log', 'email', 'webhook', 'slack'] },
  { id: 'error-rate', name: 'High 5xx error rate', kind: 'error_rate', threshold: 5, forSeconds: 60, severity: 'warning', enabled: true, actions: ['log', 'email', 'webhook', 'slack'] },
  { id: 'latency-p95', name: 'Slow responses (p95)', kind: 'latency_p95', threshold: 1500, forSeconds: 120, severity: 'warning', enabled: true, actions: ['log', 'webhook', 'slack'] },
  { id: 'consumer-lag', name: 'Event consumer is falling behind', kind: 'consumer_lag', threshold: 500, forSeconds: 60, severity: 'warning', enabled: true, actions: ['log', 'email', 'webhook', 'slack'] },
  { id: 'dead-letters', name: 'Events in a dead-letter stream', kind: 'dead_letters', threshold: 1, forSeconds: 0, severity: 'warning', enabled: true, actions: ['log', 'email', 'webhook', 'slack'] },
  { id: 'queue-failed', name: 'Failed background jobs', kind: 'queue_failed', threshold: 10, forSeconds: 60, severity: 'warning', enabled: true, actions: ['log', 'email', 'webhook', 'slack'] },
  { id: 'infra-down', name: 'Infrastructure dependency unhealthy', kind: 'infra_down', threshold: 1, forSeconds: 30, severity: 'critical', enabled: true, actions: ['log', 'email', 'webhook', 'slack'] },
  { id: 'redis-memory', name: 'Redis memory above limit', kind: 'redis_memory', threshold: 80, forSeconds: 120, severity: 'warning', enabled: true, actions: ['log', 'email'] },
]

export async function loadRules(): Promise<Rule[]> {
  const r = getRedis()
  const raw = await r.hgetall(R.rules)
  if (Object.keys(raw).length === 0) {
    await r.hset(R.rules, ...DEFAULT_RULES.flatMap((x) => [x.id, JSON.stringify(x)]))
    return DEFAULT_RULES
  }
  return Object.values(raw).map((v) => JSON.parse(v) as Rule)
}
export const saveRule = (rule: Rule) => getRedis().hset(R.rules, rule.id, JSON.stringify(rule))
export const deleteRule = (id: string) => getRedis().hdel(R.rules, id)

interface Finding { key: string; subject: string; value: number; message: string }

/** What is wrong right now, for one rule. */
async function evaluate(rule: Rule, ctx: { infra: Awaited<ReturnType<typeof infrastructure>>; streams: Awaited<ReturnType<typeof streams>>; queues: Awaited<ReturnType<typeof queues>> }): Promise<Finding[]> {
  const out: Finding[] = []
  const f = (subject: string, value: number, message: string) => out.push({ key: `${rule.id}:${subject}`, subject, value, message })
  switch (rule.kind) {
    case 'service_down':
      for (const s of allServices()) {
        const st = statusOf(s)
        // only services that were seen up (or are listed as required) can be "down"; undeployed ones are not an incident
        if (st.status === 'down' || (st.status === 'not-deployed' && env('REQUIRED_SERVICES').split(',').includes(s))) f(s, 1, `${s} is not responding`)
      }
      break
    case 'error_rate':
      for (const s of allServices()) { const st = statusOf(s); if (st.errorRatePct !== null && st.errorRatePct >= rule.threshold && (st.requestsPerMin ?? 0) >= 2) f(s, st.errorRatePct, `${s}: ${st.errorRatePct}% of responses are 5xx`) }
      break
    case 'latency_p95':
      for (const s of allServices()) { const st = statusOf(s); if (st.p95Ms !== null && st.p95Ms >= rule.threshold) f(s, st.p95Ms, `${s}: p95 latency ${st.p95Ms} ms`) }
      break
    case 'consumer_lag':
      for (const t of ctx.streams) for (const g of t.groups) if ((g.lag ?? 0) + g.pending >= rule.threshold) f(`${t.topic}/${g.name}`, (g.lag ?? 0) + g.pending, `${g.name} is ${(g.lag ?? 0) + g.pending} events behind on ${t.topic}`)
      break
    case 'dead_letters':
      for (const t of ctx.streams) if (t.deadLetters >= rule.threshold) f(t.topic, t.deadLetters, `${t.deadLetters} event(s) in the dead-letter stream of ${t.topic}`)
      break
    case 'queue_failed':
      for (const [q, c] of Object.entries(ctx.queues)) if (c.failed >= rule.threshold) f(q, c.failed, `${c.failed} failed jobs in the ${q} queue`)
      break
    case 'infra_down':
      for (const i of ctx.infra) if (!i.healthy) f(i.name, 1, `${i.name} is unhealthy${i.error ? `: ${i.error}` : ''}`)
      break
    case 'redis_memory': {
      const r = ctx.infra.find((i) => i.name === 'redis')
      const used = Number(r?.detail?.usedMemoryMB), max = Number(r?.detail?.maxMemoryMB)
      if (max && used / max >= rule.threshold / 100) f('redis', Math.round((used / max) * 100), `Redis is using ${used} MB of ${max} MB`)
      break
    }
  }
  return out
}

/* ───────────── notifications ───────────── */

async function notify(rule: Rule, a: Alert, what: 'firing' | 'resolved') {
  const text = `[${what.toUpperCase()}] ${a.severity}: ${a.message}`
  for (const action of rule.actions) {
    try {
      if (action === 'log') log[what === 'firing' ? 'logWarning' : 'logInformation'](text, { alert: a.key })
      if (action === 'email') for (const to of env('ALERT_EMAILS').split(',').map((s) => s.trim()).filter(Boolean)) emit(bus, TOPICS.emailRequested, 'email.alert', { to, template: 'alert', name: 'on-call', data: { severity: a.severity, state: what, message: a.message, subject: a.subject } })
      if (action === 'webhook' && env('ALERT_WEBHOOK_URL')) await fetch(env('ALERT_WEBHOOK_URL'), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...a, state: what }), signal: AbortSignal.timeout(5000) })
      if (action === 'slack' && env('SLACK_WEBHOOK_URL')) await fetch(env('SLACK_WEBHOOK_URL'), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text }), signal: AbortSignal.timeout(5000) })
    } catch (e) {
      log.logWarning('alert notification failed', { action, error: String(e) })
    }
  }
}

/* ───────────── state machine ───────────── */

export async function evaluateAll() {
  const r = getRedis()
  const [rules, infra, st, qs] = await Promise.all([loadRules(), infrastructure(), streams().catch(() => []), queues().catch(() => ({}))])
  const ctx = { infra, streams: st, queues: qs }
  const active = new Map<string, Alert>(Object.entries(await r.hgetall(R.active)).map(([k, v]) => [k, JSON.parse(v) as Alert]))
  const seen = new Set<string>()
  const now = Date.now()

  for (const rule of rules.filter((x) => x.enabled)) {
    for (const finding of await evaluate(rule, ctx)) {
      seen.add(finding.key)
      let a = active.get(finding.key)
      if (!a) a = { key: finding.key, ruleId: rule.id, ruleName: rule.name, severity: rule.severity, subject: finding.subject, message: finding.message, value: finding.value, since: now, firedAt: null, state: 'pending' }
      a.message = finding.message
      a.value = finding.value
      if (a.state === 'pending' && now - a.since >= rule.forSeconds * 1000) {
        a.state = 'firing'
        a.firedAt = now
        if (!(await r.exists(R.silence(a.key)))) await notify(rule, a, 'firing')
        await r.lpush(R.history, JSON.stringify({ ...a, event: 'fired' })).then(() => r.ltrim(R.history, 0, 199))
      }
      active.set(a.key, a)
      await r.hset(R.active, a.key, JSON.stringify(a))
    }
  }
  // anything that was active but is no longer found has recovered
  for (const [key, a] of active) {
    if (seen.has(key)) continue
    if (a.state === 'firing') {
      const rule = rules.find((x) => x.id === a.ruleId)
      const resolved = { ...a, state: 'resolved' as const, resolvedAt: now }
      if (rule && !(await r.exists(R.silence(key)))) await notify(rule, resolved, 'resolved')
      await r.lpush(R.history, JSON.stringify({ ...resolved, event: 'resolved' })).then(() => r.ltrim(R.history, 0, 199))
    }
    await r.hdel(R.active, key)
  }
  return { infra, streams: st, queues: qs }
}

export async function activeAlerts(): Promise<Alert[]> {
  const raw = await getRedis().hgetall(R.active)
  return Object.values(raw).map((v) => JSON.parse(v) as Alert).sort((a, b) => (b.firedAt ?? 0) - (a.firedAt ?? 0))
}
export const alertHistory = async () => (await getRedis().lrange(R.history, 0, 99)).map((x) => JSON.parse(x))
export const silence = (key: string, minutes: number) => getRedis().set(R.silence(key), '1', 'EX', minutes * 60)
export const seen = seenUp
