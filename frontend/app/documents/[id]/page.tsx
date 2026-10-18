'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Download, History, Share2, Trash2, Video } from 'lucide-react'
import { LANGUAGES, documentApi, saveBlob, videoApi } from '../../../lib/api/platform'
import apiClient from '../../../lib/api/client'
import type { Peer } from '../../../components/collab-editor'
import { Field, Modal, Table, formatDate, useAction } from '../../../components/kit'
import { RequireAuth } from '../../../components/require-auth'
import { ErrorBox, Loading } from '../../../components/state'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Select } from '../../../components/ui/select'

const CollabEditor = dynamic(() => import('../../../components/collab-editor').then((m) => m.CollabEditor), { ssr: false, loading: () => <Loading label="Loading editor…" /> })

interface DocDetail {
  id: string
  title: string
  language: string
  visibility: 'PRIVATE' | 'LINK_VIEW' | 'LINK_EDIT'
  ownerId: string
  access: 'owner' | 'edit' | 'view'
  length: number
  updatedAt: string
  activeUsers: number
  members?: { userId: string; role: 'EDITOR' | 'VIEWER'; name: string | null; email: string | null }[]
}

export default function DocumentPage() {
  return (
    <RequireAuth>
      <DocumentView />
    </RequireAuth>
  )
}

function DocumentView() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const q = useQuery({ queryKey: ['document', id], queryFn: () => documentApi.get(id) as unknown as Promise<DocDetail> })
  const [peers, setPeers] = useState<Peer[]>([])
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const [panel, setPanel] = useState<null | 'share' | 'history'>(null)
  const rename = useAction((title: string) => documentApi.update(id, { title }), { invalidate: [['document', id], ['documents']] })
  const setLanguage = useAction((language: string) => documentApi.update(id, { language }), { invalidate: [['document', id]] })
  const remove = useAction(() => documentApi.remove(id), { success: 'Document deleted', invalidate: [['documents']], onDone: () => router.push('/documents') })
  const call = useAction(() => videoApi.create({ name: `${q.data?.title ?? 'Document'} review`, scope: 'document', resourceId: id }), { onDone: (r) => router.push(`/video/${r.id}`) })

  if (q.isLoading) return <Loading />
  if (q.error || !q.data) return <ErrorBox error={q.error} onRetry={() => q.refetch()} />
  const d = q.data
  const owner = d.access === 'owner'

  const exportFile = async () => {
    const { data } = await apiClient.get<{ title: string; text: string }>(documentApi.exportUrl(id))
    const ext: Record<string, string> = { javascript: 'js', typescript: 'ts', python: 'py', markdown: 'md', plaintext: 'txt', csharp: 'cs', rust: 'rs' }
    saveBlob(new Blob([data.text], { type: 'text/plain' }), `${data.title.replace(/[^\w.-]+/g, '_')}.${ext[d.language] ?? d.language}`)
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b px-4 py-2">
        <Link href="/documents" className="rounded p-1 hover:bg-accent" aria-label="Back to documents">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        {owner ? (
          <Input className="h-9 max-w-xs font-semibold" defaultValue={d.title} onBlur={(e) => e.target.value.trim() && e.target.value !== d.title && rename.mutate(e.target.value.trim())} aria-label="Title" />
        ) : (
          <h1 className="font-semibold">{d.title}</h1>
        )}
        {owner ? (
          <Select className="h-9 w-36" value={d.language} onChange={(e) => setLanguage.mutate(e.target.value)} aria-label="Language">
            {LANGUAGES.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </Select>
        ) : (
          <Badge variant="outline">{d.language}</Badge>
        )}
        {d.access === 'view' && <Badge variant="secondary">view only</Badge>}
        <span className={`text-xs ${status === 'connected' ? 'text-green-600' : 'text-amber-600'}`}>● {status}</span>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex -space-x-2" aria-label={`${peers.length} people here`}>
            {peers.slice(0, 6).map((p) => (
              <span key={p.clientId} title={p.name} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background text-xs font-semibold text-white" style={{ backgroundColor: p.color }}>
                {p.name.slice(0, 1).toUpperCase()}
              </span>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={() => call.mutate(undefined)} disabled={call.isPending}>
            <Video className="mr-1 h-4 w-4" /> Call
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPanel('history')}>
            <History className="mr-1 h-4 w-4" /> History
          </Button>
          <Button variant="outline" size="sm" onClick={exportFile}>
            <Download className="mr-1 h-4 w-4" /> Export
          </Button>
          {owner && (
            <>
              <Button size="sm" onClick={() => setPanel('share')}>
                <Share2 className="mr-1 h-4 w-4" /> Share
              </Button>
              <Button variant="ghost" size="icon" aria-label="Delete document" onClick={() => confirm('Delete this document for everyone?') && remove.mutate(undefined)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
      <div className="flex-1">
        <CollabEditor documentId={id} language={d.language} readOnly={d.access === 'view'} onPeers={setPeers} onStatus={setStatus} />
      </div>
      <Modal open={panel === 'share'} onClose={() => setPanel(null)} title="Share document">
        <Share d={d} />
      </Modal>
      <Modal open={panel === 'history'} onClose={() => setPanel(null)} title="Snapshots" wide>
        <Snapshots id={id} canEdit={d.access !== 'view'} owner={owner} />
      </Modal>
    </div>
  )
}

function Share({ d }: { d: DocDetail }) {
  const keys = [['document', d.id]]
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'EDITOR' | 'VIEWER'>('EDITOR')
  const add = useAction(() => documentApi.addMember(d.id, email, role), { success: 'Shared', invalidate: keys, onDone: () => setEmail('') })
  const remove = useAction((userId: string) => documentApi.removeMember(d.id, userId), { invalidate: keys })
  const visibility = useAction((v: string) => documentApi.update(d.id, { visibility: v }), { success: 'Link access updated', invalidate: keys })
  const link = typeof window !== 'undefined' ? `${window.location.origin}/documents/${d.id}` : ''
  return (
    <div className="space-y-5">
      <form className="flex gap-2" onSubmit={(e) => (e.preventDefault(), add.mutate(undefined))}>
        <Input type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required aria-label="Email" />
        <Select className="w-28" value={role} onChange={(e) => setRole(e.target.value as 'EDITOR' | 'VIEWER')} aria-label="Role">
          <option value="EDITOR">Editor</option>
          <option value="VIEWER">Viewer</option>
        </Select>
        <Button type="submit" disabled={add.isPending}>
          Add
        </Button>
      </form>
      {(d.members ?? []).length > 0 && (
        <ul className="space-y-1 text-sm">
          {d.members!.map((m) => (
            <li key={m.userId} className="flex items-center gap-2">
              <span>{m.name ?? m.email ?? m.userId}</span>
              <Badge variant="outline">{m.role.toLowerCase()}</Badge>
              <button className="ml-auto text-xs text-muted-foreground hover:text-red-600" onClick={() => remove.mutate(m.userId)}>
                remove
              </button>
            </li>
          ))}
        </ul>
      )}
      <Field label="Anyone signed in with the link" htmlFor="doc-vis">
        <Select id="doc-vis" value={d.visibility} onChange={(e) => visibility.mutate(e.target.value)}>
          <option value="PRIVATE">No access (only people added above)</option>
          <option value="LINK_VIEW">Can view</option>
          <option value="LINK_EDIT">Can edit</option>
        </Select>
      </Field>
      <div className="flex gap-2">
        <Input readOnly value={link} aria-label="Document link" />
        <Button variant="outline" onClick={() => navigator.clipboard.writeText(link)}>
          Copy
        </Button>
      </div>
    </div>
  )
}

function Snapshots({ id, canEdit, owner }: { id: string; canEdit: boolean; owner: boolean }) {
  const q = useQuery({ queryKey: ['snapshots', id], queryFn: () => documentApi.snapshots(id) })
  const [name, setName] = useState('')
  const take = useAction(() => documentApi.snapshot(id, name || 'Snapshot'), { success: 'Snapshot saved', invalidate: [['snapshots', id]], onDone: () => setName('') })
  const restore = useAction((snapshotId: string) => documentApi.restore(id, snapshotId), { success: 'Restored for everyone' })
  const remove = useAction((snapshotId: string) => documentApi.deleteSnapshot(id, snapshotId), { invalidate: [['snapshots', id]] })
  return (
    <div className="space-y-4">
      {canEdit && (
        <form className="flex gap-2" onSubmit={(e) => (e.preventDefault(), take.mutate(undefined))}>
          <Input placeholder="Snapshot name (optional)" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} aria-label="Snapshot name" />
          <Button type="submit" disabled={take.isPending}>
            Save snapshot
          </Button>
        </form>
      )}
      {q.isLoading ? (
        <Loading />
      ) : (
        <Table head={['Name', 'Saved', '']} empty={(q.data ?? []).length === 0}>
          {(q.data ?? []).map((s) => (
            <tr key={s.id}>
              <td className="px-3 py-2">{s.name}</td>
              <td className="px-3 py-2 text-muted-foreground">{formatDate(s.createdAt)}</td>
              <td className="space-x-1 px-3 py-2 text-right">
                {canEdit && (
                  <Button variant="outline" size="sm" onClick={() => confirm('Replace the current text with this snapshot for everyone?') && restore.mutate(s.id)}>
                    Restore
                  </Button>
                )}
                {owner && (
                  <Button variant="ghost" size="sm" onClick={() => remove.mutate(s.id)}>
                    Delete
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  )
}
