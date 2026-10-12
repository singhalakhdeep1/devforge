/** Minimal parser for the Prometheus text exposition format: enough to read counters, gauges and histogram buckets. */
export interface Sample {
  name: string
  labels: Record<string, string>
  value: number
}

export function parseProm(text: string): Sample[] {
  const out: Sample[] = []
  for (const line of text.split('\n')) {
    if (!line || line.startsWith('#')) continue
    const m = /^([a-zA-Z_:][\w:]*)(?:\{(.*)\})?\s+(-?[\d.eE+-]+|NaN|\+Inf|-Inf)/.exec(line)
    if (!m) continue
    const labels: Record<string, string> = {}
    if (m[2]) for (const lm of m[2].matchAll(/(\w+)="((?:[^"\\]|\\.)*)"/g)) labels[lm[1]] = lm[2]
    out.push({ name: m[1], labels, value: m[3] === '+Inf' ? Infinity : Number(m[3]) })
  }
  return out
}

export const sum = (s: Sample[], name: string, where: (l: Record<string, string>) => boolean = () => true) =>
  s.filter((x) => x.name === name && where(x.labels)).reduce((n, x) => n + (Number.isFinite(x.value) ? x.value : 0), 0)

/** Cumulative histogram buckets summed over all label sets: Map<upper bound, count>. */
export function buckets(s: Sample[], name: string): [number, number][] {
  const m = new Map<number, number>()
  for (const x of s) {
    if (x.name !== `${name}_bucket`) continue
    const le = x.labels.le === '+Inf' ? Infinity : Number(x.labels.le)
    m.set(le, (m.get(le) ?? 0) + x.value)
  }
  return [...m.entries()].sort((a, b) => a[0] - b[0])
}

/** q-quantile from cumulative bucket counts, interpolating inside the bucket (what Prometheus does). */
export function quantile(q: number, cumulative: [number, number][]): number | null {
  const total = cumulative.at(-1)?.[1] ?? 0
  if (total <= 0) return null
  const rank = q * total
  let prevLe = 0
  let prevCount = 0
  for (const [le, count] of cumulative) {
    if (count >= rank) {
      if (!Number.isFinite(le)) return prevLe
      const span = count - prevCount
      return span <= 0 ? le : prevLe + ((le - prevLe) * (rank - prevCount)) / span
    }
    prevLe = le
    prevCount = count
  }
  return prevLe
}
