'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminApi } from '../../../lib/api/platform'
import { Json, Modal, PageHeader, Stat, Table, Tabs, formatDate, useAction } from '../../../components/kit'
import { ErrorBox, Loading } from '../../../components/state'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Select } from '../../../components/ui/select'

export default function SystemPage() {
  const [tab, setTab] = useState<'email' | 'events' | 'search'>('email')
  return (
    <div>
      <PageHeader title="System" description="Email delivery, the event bus and the search engine." />
      <Tabs
        tabs={[
          { id: 'email', label: 'Email' },
          { id: 'events', label: 'Event bus' },
          { id: 'search', label: 'Search engine' },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === 'email' && <Email />}
      {tab === 'events' && <Events />}
      {tab === 'search' && <SearchEngine />}
    </div>
  )
}

function Email() {
  const queue = useQuery({ queryKey: ['email-queue'], queryFn: adminApi.emailQueue, refetchInterval: 10_000 })
  const failed = useQuery({ queryKey: ['email-failed'], queryFn: adminApi.emailFailed })
  const templates = useQuery({ queryKey: ['email-templates'], queryFn: adminApi.emailTemplates })
  const [to, setTo] = useState('')
  const [template, setTemplate] = useState('welcome')
  const retry = useAction(adminApi.retryEmail, { success: 'Queued again', invalidate: [['email-failed'], ['email-queue']] })
  const test = useAction(() => adminApi.sendTestEmail(to, template), { success: 'Test email queued', invalidate: [['email-queue']] })
  if (queue.isLoading) return <Loading />
  if (queue.error) return <ErrorBox error={queue.error} onRetry={() => queue.refetch()} />
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-6">
        <Stat label="Transport" value={queue.data?.transport ?? '—'} />
        {Object.entries(queue.data?.counts ?? {}).map(([k, v]) => (
          <Stat key={k} label={k} value={v} />
        ))}
      </div>
      <form className="flex flex-wrap gap-2" onSubmit={(e) => (e.preventDefault(), test.mutate(undefined))}>
        <Input className="max-w-xs" type="email" placeholder="Send a test to…" value={to} onChange={(e) => setTo(e.target.value)} required aria-label="Recipient" />
        <Select className="w-40" value={template} onChange={(e) => setTemplate(e.target.value)} aria-label="Template">
          {(templates.data?.templates ?? ['welcome']).map((t) => (
            <option key={t}>{t}</option>
          ))}
        </Select>
        <Button type="submit" variant="outline" disabled={test.isPending}>
          Send test
        </Button>
      </form>
      <section>
        <h2 className="mb-2 font-semibold">Failed deliveries</h2>
        <Table head={['To', 'Template', 'Attempts', 'Reason', 'When', '']} empty={(failed.data ?? []).length === 0}>
          {(failed.data ?? []).map((j) => (
            <tr key={j.id}>
              <td className="px-3 py-2">{j.to}</td>
              <td className="px-3 py-2">{j.template}</td>
              <td className="px-3 py-2">{j.attempts}</td>
              <td className="max-w-xs truncate px-3 py-2 text-xs text-red-600" title={j.reason}>
                {j.reason}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">{j.at ? formatDate(new Date(j.at).toISOString()) : '—'}</td>
              <td className="px-3 py-2 text-right">
                <Button variant="ghost" size="sm" onClick={() => retry.mutate(j.id)}>
                  Retry
                </Button>
              </td>
            </tr>
          ))}
        </Table>
      </section>
    </div>
  )
}

function Events() {
  const status = useQuery({ queryKey: ['events-status'], queryFn: adminApi.eventsStatus })
  const topics = useQuery({ queryKey: ['event-topics'], queryFn: adminApi.eventTopics })
  const groups = useQuery({ queryKey: ['event-groups'], queryFn: adminApi.eventGroups })
  const [dlq, setDlq] = useState<string | null>(null)
  if (status.isLoading) return <Loading />
  if (status.error) return <ErrorBox error={status.error} onRetry={() => status.refetch()} />
  const list = (topics.data?.topics ?? []).map((t) => (typeof t === 'string' ? { topic: t as string } : t))
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Transport" value={status.data?.transport ?? '—'} />
        <Stat label="Healthy" value={status.data?.healthy ? 'yes' : 'no'} />
        <Stat label="Topics" value={list.length} />
      </div>
      <Table head={['Topic', 'Details', '']} empty={list.length === 0}>
        {list.map((t) => {
          const name = String(t.topic ?? t.name)
          const { topic: _t, name: _n, ...rest } = t
          return (
            <tr key={name}>
              <td className="px-3 py-2 font-mono text-xs">{name}</td>
              <td className="px-3 py-2 text-xs text-muted-foreground">
                {Object.entries(rest)
                  .filter(([, v]) => typeof v !== 'object')
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(' · ')}
              </td>
              <td className="px-3 py-2 text-right">
                {!name.endsWith('.dlq') && (
                  <Button variant="ghost" size="sm" onClick={() => setDlq(name)}>
                    Dead letters
                  </Button>
                )}
              </td>
            </tr>
          )
        })}
      </Table>
      <section>
        <h2 className="mb-2 font-semibold">Consumer groups</h2>
        <Json value={groups.data?.groups ?? []} />
      </section>
      <Modal open={Boolean(dlq)} onClose={() => setDlq(null)} title={`Dead letters: ${dlq}`} wide>
        {dlq && <DeadLetters topic={dlq} />}
      </Modal>
    </div>
  )
}

function DeadLetters({ topic }: { topic: string }) {
  const q = useQuery({ queryKey: ['dlq', topic], queryFn: () => adminApi.deadLetters(topic) })
  const replay = useAction(() => adminApi.replayDeadLetters(topic), { success: 'Replayed onto the topic', invalidate: [['dlq', topic]] })
  const purge = useAction(() => adminApi.purgeDeadLetters(topic), { success: 'Dead letters removed', invalidate: [['dlq', topic]] })
  if (q.isLoading) return <Loading />
  if (q.error || !q.data) return <ErrorBox error={q.error} />
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge variant="outline">{q.data.count} failed events</Badge>
        <Button size="sm" disabled={!q.data.count || replay.isPending} onClick={() => replay.mutate(undefined)}>
          Replay all
        </Button>
        <Button size="sm" variant="destructive" disabled={!q.data.count || purge.isPending} onClick={() => confirm('Delete these failed events permanently?') && purge.mutate(undefined)}>
          Purge
        </Button>
      </div>
      {q.data.letters.length > 0 && <Json value={q.data.letters} />}
    </div>
  )
}

function SearchEngine() {
  const health = useQuery({ queryKey: ['search-engine'], queryFn: adminApi.searchEngine })
  const stats = useQuery({ queryKey: ['search-stats'], queryFn: adminApi.searchStats })
  const indices = useQuery({ queryKey: ['search-indices'], queryFn: adminApi.searchIndices })
  const reindex = useAction(adminApi.reindex, { success: 'Re-indexed everything', invalidate: [['search-stats'], ['search-indices']] })
  if (health.isLoading) return <Loading />
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Cluster" value={String(health.data?.status ?? health.data?.cluster?.status ?? (health.error ? 'unreachable' : '—'))} />
        {Object.entries(stats.data?.documents ?? {}).map(([k, v]) => (
          <Stat key={k} label={`${k} indexed`} value={v} />
        ))}
      </div>
      <Button onClick={() => confirm('Rebuild every search index from the source services?') && reindex.mutate(undefined)} disabled={reindex.isPending}>
        {reindex.isPending ? 'Re-indexing…' : 'Re-index everything'}
      </Button>
      <section>
        <h2 className="mb-2 font-semibold">Indices</h2>
        <Json value={indices.data ?? health.data ?? {}} />
      </section>
    </div>
  )
}
