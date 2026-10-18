'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Download, ShieldCheck } from 'lucide-react'
import { adminApi, type AuditLog, type AuditQuery } from '../../../lib/api/platform'
import { Json, Modal, PageHeader, Table, formatDate } from '../../../components/kit'
import { ErrorBox, Loading } from '../../../components/state'
import { useToast } from '../../../components/toast'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Select } from '../../../components/ui/select'

export default function AuditPage() {
  const toast = useToast()
  const [f, setF] = useState<AuditQuery>({ page: 1, pageSize: 50 })
  const [open, setOpen] = useState<AuditLog | null>(null)
  const [verifying, setVerifying] = useState(false)
  const q = useQuery({ queryKey: ['audit', f], queryFn: () => adminApi.auditLogs(f) })
  const actions = useQuery({ queryKey: ['audit-actions'], queryFn: adminApi.auditActions })
  const set = (k: keyof AuditQuery, v: string) => setF({ ...f, [k]: v || undefined, page: 1 })

  const verify = async () => {
    setVerifying(true)
    try {
      const r = await adminApi.auditVerify()
      if (r.ok) toast.success(`Hash chain intact (${r.checked} entries checked${r.truncated ? ', more remain' : ''})`)
      else toast.error(`Tampering detected at entry ${r.firstBadId}: ${r.reason}`)
    } catch {
      toast.error('Verification failed')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Audit log"
        description="Every security-relevant action, chained by hash so changes are detectable."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={verify} disabled={verifying}>
              <ShieldCheck className="mr-1 h-4 w-4" /> {verifying ? 'Checking…' : 'Verify integrity'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => adminApi.auditExport({ ...f, page: undefined, pageSize: undefined })}>
              <Download className="mr-1 h-4 w-4" /> Export CSV
            </Button>
          </>
        }
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <Select className="w-56" value={f.action ?? ''} onChange={(e) => set('action', e.target.value)} aria-label="Action">
          <option value="">All actions</option>
          {(actions.data ?? []).map((a) => (
            <option key={a.action} value={a.action}>
              {a.action} ({a.count})
            </option>
          ))}
        </Select>
        <Input className="w-40" placeholder="Resource (e.g. auth)" value={f.resource ?? ''} onChange={(e) => set('resource', e.target.value)} aria-label="Resource" />
        <Input className="w-56" placeholder="Actor user id" value={f.actor ?? ''} onChange={(e) => set('actor', e.target.value)} aria-label="Actor" />
        <Select className="w-32" value={f.status ?? ''} onChange={(e) => set('status', e.target.value)} aria-label="Outcome">
          <option value="">Any outcome</option>
          <option value="SUCCESS">success</option>
          <option value="FAILURE">failure</option>
        </Select>
        <Input className="w-40" type="date" value={f.from?.slice(0, 10) ?? ''} onChange={(e) => set('from', e.target.value)} aria-label="From" />
        <Input className="w-40" type="date" value={f.to?.slice(0, 10) ?? ''} onChange={(e) => set('to', e.target.value ? `${e.target.value}T23:59:59` : '')} aria-label="To" />
      </div>
      {q.isLoading ? (
        <Loading />
      ) : q.error ? (
        <ErrorBox error={q.error} onRetry={() => q.refetch()} />
      ) : (
        <>
          <Table head={['When', 'Who', 'Action', 'Target', 'Outcome', 'IP']} empty={(q.data?.data ?? []).length === 0}>
            {(q.data?.data ?? []).map((r) => (
              <tr key={r.id} className="cursor-pointer hover:bg-accent" onClick={() => setOpen(r)}>
                <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">{formatDate(r.at)}</td>
                <td className="px-3 py-2">{r.actor?.name ?? r.actor?.id ?? 'system'}</td>
                <td className="px-3 py-2 font-mono text-xs">{r.action}</td>
                <td className="px-3 py-2 text-xs">
                  {r.resource}
                  {r.resourceId && <span className="text-muted-foreground"> {r.resourceId.slice(0, 12)}</span>}
                </td>
                <td className="px-3 py-2">{r.status === 'SUCCESS' ? <Badge variant="outline">success</Badge> : <Badge variant="destructive">failure</Badge>}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{r.ip ?? '—'}</td>
              </tr>
            ))}
          </Table>
          <div className="mt-4 flex items-center justify-center gap-3 text-sm">
            <Button variant="outline" size="sm" disabled={(f.page ?? 1) <= 1} onClick={() => setF({ ...f, page: (f.page ?? 1) - 1 })}>
              Newer
            </Button>
            Page {f.page} of {q.data?.totalPages ?? 1}
            <Button variant="outline" size="sm" disabled={(f.page ?? 1) >= (q.data?.totalPages ?? 1)} onClick={() => setF({ ...f, page: (f.page ?? 1) + 1 })}>
              Older
            </Button>
          </div>
        </>
      )}
      <Modal open={Boolean(open)} onClose={() => setOpen(null)} title={open?.action ?? ''} wide>
        {open && <Json value={open} />}
      </Modal>
    </div>
  )
}
