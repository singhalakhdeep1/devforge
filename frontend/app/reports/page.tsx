'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, Play, Trash2 } from 'lucide-react'
import { adminApi } from '../../lib/api/platform'
import { useAuthStore } from '../../lib/store/authStore'
import { Field, PageHeader, Table, formatBytes, formatDate, useAction } from '../../components/kit'
import { RequireAuth } from '../../components/require-auth'
import { ErrorBox, Loading } from '../../components/state'
import { useToast } from '../../components/toast'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Select } from '../../components/ui/select'

export default function ReportsPage() {
  return (
    <RequireAuth roles={['ADMIN', 'INSTRUCTOR']}>
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <Reports />
      </div>
    </RequireAuth>
  )
}

function Reports() {
  const toast = useToast()
  const admin = useAuthStore((s) => s.user?.role === 'ADMIN')
  const types = useQuery({ queryKey: ['report-types'], queryFn: adminApi.reportTypes })
  const [all, setAll] = useState(false)
  const runs = useQuery({ queryKey: ['report-runs', all], queryFn: () => adminApi.reportRuns(all) })
  const schedules = useQuery({ queryKey: ['report-schedules'], queryFn: adminApi.reportSchedules })
  const [type, setType] = useState('')
  const [format, setFormat] = useState('pdf')
  const [days, setDays] = useState(30)
  const [frequency, setFrequency] = useState('WEEKLY')
  const [hourUtc, setHourUtc] = useState(6)
  const [recipients, setRecipients] = useState('')
  const chosen = type || types.data?.types[0]?.id || ''

  const generate = useAction(() => adminApi.generateReport({ type: chosen, format, days }), {
    invalidate: [['report-runs']],
    onDone: (r) => (r.missing ? toast.info(`Report ready; these sections were unavailable: ${r.missing}`) : toast.success('Report downloaded')),
  })
  const schedule = useAction(() => adminApi.createSchedule({ type: chosen, format, days, frequency, hourUtc, recipients: recipients.split(',').map((x) => x.trim()).filter(Boolean) }), { success: 'Schedule saved', invalidate: [['report-schedules']] })
  const toggle = useAction(({ id, enabled }: { id: string; enabled: boolean }) => adminApi.updateSchedule(id, { enabled }), { invalidate: [['report-schedules']] })
  const runNow = useAction(adminApi.runSchedule, { success: 'Report generated', invalidate: [['report-runs'], ['report-schedules']] })
  const removeSchedule = useAction(adminApi.deleteSchedule, { invalidate: [['report-schedules']] })
  const removeRun = useAction(adminApi.deleteReport, { invalidate: [['report-runs']] })

  if (types.isLoading) return <Loading />
  if (types.error || !types.data) return <ErrorBox error={types.error} />

  return (
    <div className="space-y-8">
      <PageHeader title="Reports" description="Download a report now or get one on a schedule." />
      <Card className="space-y-4 p-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Report" htmlFor="r-type">
            <Select id="r-type" value={chosen} onChange={(e) => setType(e.target.value)}>
              {types.data.types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Format" htmlFor="r-format">
            <Select id="r-format" value={format} onChange={(e) => setFormat(e.target.value)}>
              {types.data.formats.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </Select>
          </Field>
          <Field label="Period (days)" htmlFor="r-days">
            <Input id="r-days" type="number" min={1} max={365} value={days} onChange={(e) => setDays(Number(e.target.value))} />
          </Field>
        </div>
        <p className="text-sm text-muted-foreground">{types.data.types.find((t) => t.id === chosen)?.description}</p>
        <Button onClick={() => generate.mutate(undefined)} disabled={!chosen || generate.isPending}>
          <Download className="mr-1 h-4 w-4" /> {generate.isPending ? 'Building…' : 'Download'}
        </Button>
        <div className="grid gap-3 border-t pt-4 sm:grid-cols-4">
          <Field label="Repeat" htmlFor="r-freq">
            <Select id="r-freq" value={frequency} onChange={(e) => setFrequency(e.target.value)}>
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly (Mondays)</option>
              <option value="MONTHLY">Monthly (1st)</option>
            </Select>
          </Field>
          <Field label="Hour (UTC)" htmlFor="r-hour">
            <Input id="r-hour" type="number" min={0} max={23} value={hourUtc} onChange={(e) => setHourUtc(Number(e.target.value))} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Email when ready" htmlFor="r-to" hint="Comma separated, up to 10">
              <Input id="r-to" value={recipients} onChange={(e) => setRecipients(e.target.value)} placeholder="me@example.com" />
            </Field>
          </div>
        </div>
        <Button variant="outline" onClick={() => schedule.mutate(undefined)} disabled={!chosen || schedule.isPending}>
          Schedule this report
        </Button>
      </Card>

      <section>
        <h2 className="mb-2 font-semibold">Schedules</h2>
        <Table head={['Report', 'Repeat', 'Next run', 'Status', '']} empty={(schedules.data ?? []).length === 0}>
          {(schedules.data ?? []).map((s) => (
            <tr key={s.id}>
              <td className="px-3 py-2">
                {types.data!.types.find((t) => t.id === s.type)?.label ?? s.type} <span className="text-xs text-muted-foreground">({s.format}, {s.days} d)</span>
              </td>
              <td className="px-3 py-2">
                {s.frequency.toLowerCase()} at {String(s.hourUtc).padStart(2, '0')}:00 UTC
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">{formatDate(s.nextRunAt)}</td>
              <td className="px-3 py-2">
                <button onClick={() => toggle.mutate({ id: s.id, enabled: !s.enabled })}>
                  <Badge variant={s.enabled ? 'default' : 'outline'}>{s.enabled ? 'on' : 'paused'}</Badge>
                </button>
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-right">
                <Button variant="ghost" size="icon" aria-label="Run now" onClick={() => runNow.mutate(s.id)}>
                  <Play className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Delete schedule" onClick={() => removeSchedule.mutate(s.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </Table>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-semibold">History</h2>
          {admin && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={all} onChange={(e) => setAll(e.target.checked)} /> Everyone&apos;s reports
            </label>
          )}
        </div>
        <Table head={['File', 'Size', 'Created', 'Status', '']} empty={(runs.data ?? []).length === 0}>
          {(runs.data ?? []).map((r) => (
            <tr key={r.id}>
              <td className="px-3 py-2 font-mono text-xs">{r.filename}</td>
              <td className="px-3 py-2">{formatBytes(r.size)}</td>
              <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">{formatDate(r.createdAt)}</td>
              <td className="px-3 py-2">
                <Badge variant={r.status === 'OK' ? 'outline' : 'destructive'}>{r.status.toLowerCase()}</Badge>
                {r.missing.length > 0 && <span className="ml-1 text-xs text-amber-600">missing {r.missing.join(', ')}</span>}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-right">
                <Button variant="ghost" size="icon" aria-label="Download" onClick={() => adminApi.downloadReport(r.id, r.filename)}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => removeRun.mutate(r.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </Table>
      </section>
    </div>
  )
}
