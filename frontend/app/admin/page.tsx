'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { adminApi } from '../../lib/api/platform'
import { PageHeader, Stat, Table } from '../../components/kit'
import { ErrorBox, Loading } from '../../components/state'
import { Card } from '../../components/ui/card'
import { Select } from '../../components/ui/select'

const money = (n: number) => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n)

export default function AdminOverview() {
  const [days, setDays] = useState(30)
  const health = useQuery({ queryKey: ['monitoring'], queryFn: adminApi.monitoring, refetchInterval: 30_000 })
  const analytics = useQuery({ queryKey: ['admin-analytics', days], queryFn: () => adminApi.analytics(days) })
  const pages = useQuery({ queryKey: ['admin-pageviews', days], queryFn: () => adminApi.analyticsPart('pageviews', days) })
  const devices = useQuery({ queryKey: ['admin-devices', days], queryFn: () => adminApi.analyticsPart('devices', days) })
  const payments = useQuery({ queryKey: ['payment-stats'], queryFn: adminApi.paymentStats })
  const audit = useQuery({ queryKey: ['audit-stats', 7], queryFn: () => adminApi.auditStats(7) })

  const t = analytics.data?.totals ?? {}
  const s = health.data?.summary

  return (
    <div className="space-y-8">
      <PageHeader
        title="Administration"
        description="Platform health and activity at a glance."
        actions={
          <Select className="w-36" value={days} onChange={(e) => setDays(Number(e.target.value))} aria-label="Period">
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </Select>
        }
      />

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/monitoring">
          <Stat label="Services up" value={s ? `${s.up} / ${s.up + s.degraded + s.down}` : '…'} hint={s ? `${s.degraded} degraded · ${s.down} down · ${s.firingAlerts} alerts firing` : undefined} />
        </Link>
        <Stat label="Active users" value={t.activeUsers ?? '…'} hint={`${t.signups ?? 0} sign-ups`} />
        <Stat label="Revenue" value={payments.data ? money(payments.data.revenue) : '…'} hint={payments.data ? `${payments.data.paidOrders} orders · ${payments.data.activeSubscriptions} subscriptions` : undefined} />
        <Link href="/admin/audit">
          <Stat label="Audit events (7 d)" value={audit.data?.total ?? '…'} hint={audit.data ? `${audit.data.failures} failures` : undefined} />
        </Link>
      </section>

      <section className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Page views" value={t.pageviews ?? '…'} />
        <Stat label="Events" value={t.events ?? '…'} />
        <Stat label="Enrollments" value={t.enrollments ?? '…'} />
        <Stat label="Completions" value={t.completions ?? '…'} />
        <Stat label="Lessons done" value={t.lessonsCompleted ?? '…'} />
        <Stat label="Course revenue" value={t.revenue !== undefined ? money(t.revenue) : '…'} />
      </section>

      <Card className="p-4">
        <p className="mb-3 text-sm font-medium">Daily activity</p>
        {analytics.isLoading ? (
          <Loading />
        ) : analytics.error ? (
          <ErrorBox error={analytics.error} />
        ) : (
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={analytics.data?.series ?? []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="pageviews" name="Page views" stroke="#3b82f6" fill="#3b82f633" />
                <Area type="monotone" dataKey="activeUsers" name="Active users" stroke="#10b981" fill="#10b98133" />
                <Area type="monotone" dataKey="enrollments" name="Enrollments" stroke="#f59e0b" fill="#f59e0b33" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-medium">Top pages</p>
          <Table head={['Path', 'Views']} empty={(pages.data?.paths ?? []).length === 0}>
            {(pages.data?.paths ?? []).slice(0, 10).map((p: { path: string; views: number }) => (
              <tr key={p.path}>
                <td className="truncate px-3 py-2 font-mono text-xs">{p.path}</td>
                <td className="px-3 py-2">{p.views}</td>
              </tr>
            ))}
          </Table>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">Devices</p>
          <Table head={['Device', 'Page views', 'Sessions', 'Share']} empty={(devices.data?.devices ?? []).length === 0}>
            {(devices.data?.devices ?? []).map((d: { name: string; pageviews: number; sessions: number; share: number }) => (
              <tr key={d.name}>
                <td className="px-3 py-2">{d.name}</td>
                <td className="px-3 py-2">{d.pageviews}</td>
                <td className="px-3 py-2">{d.sessions}</td>
                <td className="px-3 py-2">{d.share}%</td>
              </tr>
            ))}
          </Table>
        </div>
      </div>

      {audit.data && audit.data.topActors.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium">Most active this week</p>
          <Table head={['Person', 'Actions']}>
            {audit.data.topActors.map((a) => (
              <tr key={a.id}>
                <td className="px-3 py-2">{a.name ?? a.id}</td>
                <td className="px-3 py-2">{a.count}</td>
              </tr>
            ))}
          </Table>
        </div>
      )}
    </div>
  )
}
