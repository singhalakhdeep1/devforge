'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, Play, RotateCcw, Trash2 } from 'lucide-react'
import { backupApi, type BackupRecord } from '../../../lib/api/platform'
import { Modal, PageHeader, Stat, Table, formatBytes, formatDate, useAction } from '../../../components/kit'
import { ErrorBox, Loading } from '../../../components/state'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'

const tone: Record<BackupRecord['status'], 'default' | 'secondary' | 'destructive' | 'outline'> = { success: 'default', partial: 'secondary', failed: 'destructive', running: 'outline' }

export default function BackupsPage() {
  const status = useQuery({ queryKey: ['backup-status'], queryFn: backupApi.status, refetchInterval: (q) => (q.state.data?.busy ? 3000 : 30_000) })
  const list = useQuery({ queryKey: ['backups'], queryFn: backupApi.list, refetchInterval: status.data?.busy ? 3000 : false })
  const keys = [['backups'], ['backup-status']]
  const run = useAction(backupApi.run, { success: 'Backup started', invalidate: keys })
  const retention = useAction(backupApi.retention, { success: (r) => (r.removed.length ? `Removed ${r.removed.length} old backups` : 'Nothing to remove'), invalidate: keys })
  const remove = useAction(backupApi.remove, { success: 'Backup deleted', invalidate: keys })
  const [restoring, setRestoring] = useState<BackupRecord | null>(null)

  if (status.isLoading) return <Loading />
  if (status.error || !status.data) return <ErrorBox error={status.error} onRetry={() => status.refetch()} />
  const s = status.data
  const missingTools = Object.entries(s.tools).filter(([, v]) => !v).map(([k]) => k)

  return (
    <div className="space-y-8">
      <PageHeader
        title="Backups"
        description={`${s.storage.kind === 's3' ? 'Stored in' : 'Stored on disk at'} ${s.storage.location}`}
        actions={
          <>
            <Button variant="outline" onClick={() => retention.mutate(undefined)} disabled={retention.isPending}>
              Apply retention
            </Button>
            <Button onClick={() => run.mutate(undefined)} disabled={s.busy || run.isPending}>
              <Play className="mr-1 h-4 w-4" /> {s.busy ? 'Running…' : 'Back up now'}
            </Button>
          </>
        }
      />
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Schedule" value={s.schedule ?? 'off'} hint="cron, UTC" />
        <Stat label="Retention" value={`${s.retention.days} days`} hint={`always keeps the newest ${s.retention.keepMin}`} />
        <Stat label="Last success" value={s.lastSuccess ? formatDate(s.lastSuccess.finishedAt ?? s.lastSuccess.startedAt) : 'never'} />
        <Stat label="Sources" value={s.sources.length} hint={s.sources.map((x) => x.name).join(', ')} />
      </div>
      {missingTools.length > 0 && <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm dark:bg-amber-950/30">Not installed on the backup server: {missingTools.join(', ')}. Sources needing them will fail.</p>}

      <Table head={['Backup', 'Trigger', 'Status', 'Size', 'Sources', '']} empty={(list.data?.items ?? []).length === 0}>
        {(list.data?.items ?? []).map((b) => (
          <tr key={b.id}>
            <td className="px-3 py-2">
              <p className="font-mono text-xs">{b.id}</p>
              <p className="text-xs text-muted-foreground">{formatDate(b.startedAt)}</p>
            </td>
            <td className="px-3 py-2">{b.trigger}</td>
            <td className="px-3 py-2">
              <Badge variant={tone[b.status]}>{b.status}</Badge>
              {b.error && <p className="text-xs text-red-600">{b.error}</p>}
            </td>
            <td className="whitespace-nowrap px-3 py-2">{formatBytes(b.size)}</td>
            <td className="px-3 py-2 text-xs">
              {b.sources.map((x) => (
                <span key={x.name} className={x.ok ? '' : 'text-red-600'} title={x.error}>
                  {x.name}
                  {x.ok ? '' : ' ✕'}{' '}
                </span>
              ))}
            </td>
            <td className="whitespace-nowrap px-3 py-2 text-right">
              {(b.status === 'success' || b.status === 'partial') && (
                <>
                  <Button variant="ghost" size="icon" aria-label="Download" onClick={() => backupApi.download(b.id)}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Restore" onClick={() => setRestoring(b)} disabled={s.busy}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </>
              )}
              {b.status !== 'running' && (
                <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => confirm(`Delete ${b.id}?`) && remove.mutate(b.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </td>
          </tr>
        ))}
      </Table>

      {s.jobs.length > 0 && (
        <section>
          <h2 className="mb-2 font-semibold">Recent jobs (this server)</h2>
          <Table head={['Job', 'Backup', 'Status', 'Started', 'Finished']}>
            {s.jobs.map((j) => (
              <tr key={j.id}>
                <td className="px-3 py-2">{j.type}</td>
                <td className="px-3 py-2 font-mono text-xs">{j.backupId}</td>
                <td className="px-3 py-2">
                  {j.status}
                  {j.error && <p className="text-xs text-red-600">{j.error}</p>}
                </td>
                <td className="px-3 py-2 text-muted-foreground">{formatDate(j.startedAt)}</td>
                <td className="px-3 py-2 text-muted-foreground">{formatDate(j.finishedAt)}</td>
              </tr>
            ))}
          </Table>
        </section>
      )}

      <Modal open={Boolean(restoring)} onClose={() => setRestoring(null)} title="Restore backup">
        {restoring && <Restore b={restoring} onDone={() => setRestoring(null)} />}
      </Modal>
    </div>
  )
}

function Restore({ b, onDone }: { b: BackupRecord; onDone: () => void }) {
  const [chosen, setChosen] = useState<string[]>(b.sources.filter((x) => x.ok).map((x) => x.name))
  const [confirmText, setConfirmText] = useState('')
  const restore = useAction(() => backupApi.restore(b.id, chosen), { success: 'Restore started; watch the jobs list', invalidate: [['backup-status']], onDone })
  return (
    <div className="space-y-4">
      <p className="text-sm text-red-600">Restoring replaces the live data of the selected sources with this backup from {formatDate(b.startedAt)}. Changes made since then are lost.</p>
      <div className="space-y-1">
        {b.sources.filter((x) => x.ok).map((x) => (
          <label key={x.name} className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={chosen.includes(x.name)} onChange={(e) => setChosen(e.target.checked ? [...chosen, x.name] : chosen.filter((n) => n !== x.name))} />
            {x.name} <span className="text-xs text-muted-foreground">({x.engine}, {formatBytes(x.bytes)})</span>
          </label>
        ))}
      </div>
      <Input placeholder={`Type ${b.id} to confirm`} value={confirmText} onChange={(e) => setConfirmText(e.target.value)} aria-label="Confirmation" />
      <Button variant="destructive" disabled={confirmText !== b.id || chosen.length === 0 || restore.isPending} onClick={() => restore.mutate(undefined)}>
        Restore {chosen.length} source{chosen.length === 1 ? '' : 's'}
      </Button>
    </div>
  )
}
