import { SERVICE_PORTS, serviceUrl, type ServiceName } from '@devhub/shared'
import { buckets, parseProm, quantile, sum } from './prom'

export interface Snapshot {
  t: number
  up: boolean
  ready: 'ready' | 'degraded' | 'unknown'
  checks: Record<string, string>
  healthMs: number | null
  requests: number // cumulative
  errors5xx: number // cumulative
  buckets: [number, number][]
  memoryBytes: number | null
  wsConnections: number | null
  uptime: number | null
}

export interface ServiceStatus {
  service: string
  status: 'up' | 'degraded' | 'down' | 'not-deployed'
  healthMs: number | null
  checks: Record<string, string>
  requestsPerMin: number | null
  errorRatePct: number | null
  p95Ms: number | null
  memoryMB: number | null
  uptimeSeconds: number | null
  lastSeenUp: number | null
}

const HISTORY = 240 // one hour at 15 seconds
const history = new Map<string, Snapshot[]>()
const everUp = new Set<string>()
const lastUp = new Map<string, number>()

export const allServices = (): ServiceName[] => (process.env.MONITORED_SERVICES ? (process.env.MONITORED_SERVICES.split(',').map((s) => s.trim()) as ServiceName[]) : (Object.keys(SERVICE_PORTS) as ServiceName[])).filter((s) => s !== 'monitoring')
export const seenUp = (s: string) => everUp.has(s)

async function get(url: string, ms: number) {
  const started = Date.now()
  const res = await fetch(url, { signal: AbortSignal.timeout(ms) })
  return { res, ms: Date.now() - started }
}

export async function scrape(service: ServiceName): Promise<Snapshot> {
  const base = serviceUrl(service)
  const snap: Snapshot = { t: Date.now(), up: false, ready: 'unknown', checks: {}, healthMs: null, requests: 0, errors5xx: 0, buckets: [], memoryBytes: null, wsConnections: null, uptime: null }
  try {
    const { res, ms } = await get(`${base}/health`, 2500)
    snap.up = res.ok
    snap.healthMs = ms
    snap.uptime = ((await res.json().catch(() => ({}))) as { uptime?: number }).uptime ?? null
  } catch {
    // unreachable
  }
  if (snap.up) {
    everUp.add(service)
    lastUp.set(service, snap.t)
    try {
      const { res } = await get(`${base}/ready`, 2500)
      const body = (await res.json().catch(() => ({}))) as { status?: string; checks?: Record<string, string> }
      snap.ready = body.status === 'ready' ? 'ready' : 'degraded'
      snap.checks = body.checks ?? {}
    } catch {
      snap.ready = 'degraded'
    }
    try {
      const { res } = await get(`${base}/metrics`, 3000)
      const samples = parseProm(await res.text())
      snap.requests = sum(samples, 'http_requests_total')
      snap.errors5xx = sum(samples, 'http_requests_total', (l) => /^5/.test(l.status_code ?? ''))
      snap.buckets = buckets(samples, 'http_request_duration_seconds')
      snap.memoryBytes = sum(samples, 'devhub_process_resident_memory_bytes') || null
      snap.wsConnections = sum(samples, 'websocket_connections_active') || null
    } catch {
      // metrics are optional
    }
  }
  const h = history.get(service) ?? []
  h.push(snap)
  if (h.length > HISTORY) h.shift()
  history.set(service, h)
  return snap
}

/** Rates over the last ~5 minutes, from the difference of cumulative counters (so restarts reset cleanly). */
export function statusOf(service: string): ServiceStatus {
  const h = history.get(service) ?? []
  const last = h.at(-1)
  const window = h.filter((s) => last && s.t >= last.t - 5 * 60_000 && s.up)
  const first = window[0]
  let rpm: number | null = null
  let err: number | null = null
  let p95: number | null = null
  if (last?.up && first && window.length >= 2 && last.requests >= first.requests) {
    const dReq = last.requests - first.requests
    const dErr = last.errors5xx - first.errors5xx
    const minutes = (last.t - first.t) / 60_000
    rpm = minutes > 0 ? Number((dReq / minutes).toFixed(1)) : null
    err = dReq > 0 ? Number(((dErr / dReq) * 100).toFixed(2)) : 0
    const delta = last.buckets.map(([le, c]) => [le, Math.max(0, c - (first.buckets.find(([l]) => l === le)?.[1] ?? 0))] as [number, number])
    const q = quantile(0.95, delta)
    p95 = q === null ? null : Math.round(q * 1000)
  }
  const status: ServiceStatus['status'] = !last ? 'not-deployed' : last.up ? (last.ready === 'degraded' ? 'degraded' : 'up') : everUp.has(service) ? 'down' : 'not-deployed'
  return { service, status, healthMs: last?.healthMs ?? null, checks: last?.checks ?? {}, requestsPerMin: rpm, errorRatePct: err, p95Ms: p95, memoryMB: last?.memoryBytes ? Math.round(last.memoryBytes / 1048576) : null, uptimeSeconds: last?.uptime ?? null, lastSeenUp: lastUp.get(service) ?? null }
}

export const seriesOf = (service: string, points = 60) =>
  (history.get(service) ?? []).slice(-points).map((s, i, arr) => {
    const prev = arr[i - 1]
    const dReq = prev && s.requests >= prev.requests ? s.requests - prev.requests : null
    return { t: s.t, up: s.up, healthMs: s.healthMs, requests: dReq, errors: prev && dReq !== null ? s.errors5xx - prev.errors5xx : null, memoryMB: s.memoryBytes ? Math.round(s.memoryBytes / 1048576) : null }
  })
