'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { adminApi, type ServiceStatus } from '../../../lib/api/platform'
import { cn } from '../../../lib/utils'
import { Modal, PageHeader, Stat, Table, useAction } from '../../../components/kit'
import { ErrorBox, Loading } from '../../../components/state'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'

const dot: Record<ServiceStatus['status'], string> = { up: 'bg-green-500', degraded: 'bg-amber-500', down: 'bg-red-500', 'not-deployed': 'bg-slate-300' }
const duration = (s: number | null) => (s === null ? '—' : s > 86400 ? `${Math.floor(s / 86400)} d` : s > 3600 ? `${Math.floor(s / 3600)} h` : `${Math.floor(s / 60)} min`)

export default function Monitoring() {
  const q = useQuery({ queryKey: ['monitoring'], queryFn: adminApi.monitoring, refetchInterval: 15_000 })
  const infra = useQuery({ queryKey: ['infrastructure'], queryFn: adminApi.infrastructure, refetchInterval: 30_000 })
  const alerts = useQuery({ queryKey: ['alerts'], queryFn: adminApi.alerts, refetchInterval: 30_000 })
  const host = useQuery({ queryKey: ['host'], queryFn: adminApi.host, refetchInterval: 30_000 })
  const [open, setOpen] = useState<string | null>(null)
  const silence = useAction(({ key, minutes }: { key: string; minutes: number }) => adminApi.silence(key, minutes), { success: 'Alert silenced', invalidate: [['alerts'], ['monitoring']] })

  if (q.isLoading) return <Loading />
  if (q.error || !q.data) return <ErrorBox error={q.error} onRetry={() => q.refetch()} />
  const { summary, services } = q.data

  return (
    <div className="space-y-8">
      <PageHeader title="Monitoring" description={`Updated ${new Date(q.data.updatedAt).toLocaleTimeString()}`} />
      <div className="grid gap-3 sm:grid-cols-5">
        <Stat label="Up" value={summary.up} />
        <Stat label="Degraded" value={summary.degraded} />
        <Stat label="Down" value={summary.down} />
        <Stat label="Not deployed" value={summary.notDeployed} />
        <Stat label="Alerts firing" value={summary.firingAlerts} />
      </div>

      {(alerts.data?.active ?? []).length > 0 && (
        <section>
          <h2 className="mb-2 font-semibold">Alerts</h2>
          <Table head={['Alert', 'Subject', 'State', 'Since', '']}>
            {alerts.data!.active.map((a) => (
              <tr key={a.key}>
                <td className="px-3 py-2">
                  <Badge variant={a.severity === 'critical' ? 'destructive' : 'outline'}>{a.severity}</Badge> {a.ruleName}
                  <p className="text-xs text-muted-foreground">{a.message}</p>
                </td>
                <td className="px-3 py-2">{a.subject}</td>
                <td className="px-3 py-2">{a.state}</td>
                <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">{new Date(a.firedAt ?? a.since).toLocaleString()}</td>
                <td className="px-3 py-2 text-right">
                  <Button variant="ghost" size="sm" onClick={() => silence.mutate({ key: a.key, minutes: 60 })}>
                    Silence 1 h
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        </section>
      )}

      <section>
        <h2 className="mb-2 font-semibold">Services</h2>
        <Table head={['Service', 'Status', 'Requests/min', 'Errors', 'p95', 'Memory', 'Uptime']}>
          {services.map((s) => (
            <tr key={s.service} className="cursor-pointer hover:bg-accent" onClick={() => setOpen(s.service)}>
              <td className="px-3 py-2 font-medium">
                <span className={cn('mr-2 inline-block h-2.5 w-2.5 rounded-full', dot[s.status])} />
                {s.service}
              </td>
              <td className="px-3 py-2">
                {s.status}
                {Object.entries(s.checks).filter(([, v]) => v !== 'up').map(([k, v]) => (
                  <span key={k} className="ml-1 text-xs text-red-600">
                    {k}: {v}
                  </span>
                ))}
              </td>
              <td className="px-3 py-2">{s.requestsPerMin ?? '—'}</td>
              <td className={cn('px-3 py-2', (s.errorRatePct ?? 0) > 5 && 'font-semibold text-red-600')}>{s.errorRatePct !== null ? `${s.errorRatePct}%` : '—'}</td>
              <td className="px-3 py-2">{s.p95Ms !== null ? `${s.p95Ms} ms` : '—'}</td>
              <td className="px-3 py-2">{s.memoryMB !== null ? `${s.memoryMB} MB` : '—'}</td>
              <td className="px-3 py-2">{duration(s.uptimeSeconds)}</td>
            </tr>
          ))}
        </Table>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-2 font-semibold">Infrastructure</h2>
          <Table head={['Dependency', 'Status', 'Latency']} empty={(infra.data?.items ?? []).length === 0}>
            {(infra.data?.items ?? []).map((i) => (
              <tr key={i.name}>
                <td className="px-3 py-2">{i.name}</td>
                <td className="px-3 py-2">{i.healthy ? <Badge variant="outline">healthy</Badge> : <span className="text-red-600">{i.error ?? 'down'}</span>}</td>
                <td className="px-3 py-2">{i.latencyMs !== null ? `${i.latencyMs} ms` : '—'}</td>
              </tr>
            ))}
          </Table>
        </section>
        {host.data && (
          <section>
            <h2 className="mb-2 font-semibold">Host</h2>
            <Table head={['', '']}>
              <tr>
                <td className="px-3 py-2">Machine</td>
                <td className="px-3 py-2">
                  {host.data.hostname} ({host.data.platform}, {host.data.cpus} CPUs)
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">Load</td>
                <td className="px-3 py-2">
                  {host.data.loadAverage.l1.toFixed(2)} / {host.data.loadAverage.l5.toFixed(2)} / {host.data.loadAverage.l15.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">Memory</td>
                <td className="px-3 py-2">
                  {host.data.memory.totalMB - host.data.memory.freeMB} of {host.data.memory.totalMB} MB used
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2">Uptime</td>
                <td className="px-3 py-2">{duration(host.data.uptimeSeconds)}</td>
              </tr>
            </Table>
          </section>
        )}
      </div>

      <Modal open={Boolean(open)} onClose={() => setOpen(null)} title={`${open} service`} wide>
        {open && <ServiceDetail name={open} />}
      </Modal>
    </div>
  )
}

function ServiceDetail({ name }: { name: string }) {
  const q = useQuery({ queryKey: ['monitoring-service', name], queryFn: () => adminApi.monitoringService(name), refetchInterval: 15_000 })
  if (q.isLoading) return <Loading />
  if (q.error || !q.data) return <ErrorBox error={q.error} />
  const data = q.data.series.map((p) => ({ ...p, time: new Date(p.t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }))
  return (
    <div className="space-y-6">
      {(['healthMs', 'requests', 'memoryMB'] as const).map((k) => (
        <div key={k}>
          <p className="mb-1 text-sm font-medium">{k === 'healthMs' ? 'Health check latency (ms)' : k === 'requests' ? 'Requests per interval' : 'Memory (MB)'}</p>
          <div className="h-40">
            <ResponsiveContainer>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey={k} stroke="#3b82f6" dot={false} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ))}
    </div>
  )
}
