'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Copy, Download, Globe, Lock, Trash2, Upload } from 'lucide-react'
import { fileApi } from '../../lib/api/platform'
import { FILES_URL } from '../../lib/api/client'
import apiClient from '../../lib/api/client'
import { timeAgo } from '../../lib/utils'
import { PageHeader, Table, formatBytes, useAction } from '../../components/kit'
import { RequireAuth } from '../../components/require-auth'
import { ErrorBox, Loading } from '../../components/state'
import { useToast } from '../../components/toast'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Progress } from '../../components/ui/progress'

export default function FilesPage() {
  return (
    <RequireAuth>
      <Files />
    </RequireAuth>
  )
}

function Files() {
  const toast = useToast()
  const q = useQuery({ queryKey: ['files'], queryFn: fileApi.list })
  const [progress, setProgress] = useState<number | null>(null)
  const [filter, setFilter] = useState('')
  const upload = useAction((f: File) => fileApi.upload(f, setProgress), { success: (f) => `Uploaded ${f.name}`, invalidate: [['files']], onDone: () => setProgress(null) })
  const visibility = useAction(({ id, v }: { id: string; v: 'PUBLIC' | 'PRIVATE' }) => apiClient.patch(`/files/${id}`, { visibility: v }), { invalidate: [['files']] })
  const rename = useAction(({ id, name }: { id: string; name: string }) => fileApi.rename(id, name), { invalidate: [['files']] })
  const remove = useAction(fileApi.remove, { success: 'Deleted', invalidate: [['files']] })

  if (q.isLoading) return <Loading />
  if (q.error || !q.data) return <ErrorBox error={q.error} onRetry={() => q.refetch()} />
  const { files, usedBytes, quotaBytes } = q.data
  const shown = files.filter((f) => f.name.toLowerCase().includes(filter.toLowerCase()))

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <PageHeader
        title="Files"
        description={`${formatBytes(usedBytes)} of ${formatBytes(quotaBytes)} used`}
        actions={
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <Upload className="h-4 w-4" /> {progress !== null ? `Uploading ${progress}%` : 'Upload'}
            <input type="file" className="hidden" disabled={upload.isPending} onChange={(e) => e.target.files?.[0] && upload.mutate(e.target.files[0])} />
          </label>
        }
      />
      <Progress value={Math.min(100, (usedBytes / Math.max(1, quotaBytes)) * 100)} className="mb-6 h-2" />
      <Input className="mb-4 max-w-xs" placeholder="Filter by name…" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter files" />
      <Table head={['Name', 'Size', 'Type', 'Uploaded', 'Sharing', '']} empty={shown.length === 0}>
        {shown.map((f) => (
          <tr key={f.id}>
            <td className="px-3 py-2">
              <Input className="h-8 border-transparent hover:border-input" defaultValue={f.name} onBlur={(e) => e.target.value.trim() && e.target.value !== f.name && rename.mutate({ id: f.id, name: e.target.value.trim() })} aria-label="File name" />
            </td>
            <td className="whitespace-nowrap px-3 py-2">{formatBytes(f.size)}</td>
            <td className="px-3 py-2 text-muted-foreground">{f.mimeType}</td>
            <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">{timeAgo(f.createdAt)}</td>
            <td className="px-3 py-2">
              <button className="flex items-center gap-1 text-xs hover:underline" onClick={() => visibility.mutate({ id: f.id, v: f.visibility === 'PUBLIC' ? 'PRIVATE' : 'PUBLIC' })}>
                {f.visibility === 'PUBLIC' ? <Globe className="h-3.5 w-3.5 text-green-600" /> : <Lock className="h-3.5 w-3.5" />}
                {f.visibility === 'PUBLIC' ? 'public link' : 'private'}
              </button>
            </td>
            <td className="whitespace-nowrap px-3 py-2 text-right">
              {f.url && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Copy public link"
                  onClick={() => {
                    void navigator.clipboard.writeText(`${FILES_URL}${f.url}`)
                    toast.success('Link copied')
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" aria-label={`Download ${f.name}`} onClick={() => fileApi.download(f.id, f.name)}>
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" aria-label={`Delete ${f.name}`} onClick={() => confirm(`Delete ${f.name}?`) && remove.mutate(f.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  )
}
