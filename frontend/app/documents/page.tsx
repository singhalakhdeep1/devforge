'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { FileCode2, Plus } from 'lucide-react'
import { LANGUAGES, documentApi, rows } from '../../lib/api/platform'
import { timeAgo } from '../../lib/utils'
import { Field, Modal, PageHeader, useAction } from '../../components/kit'

import { RequireAuth } from '../../components/require-auth'
import { Empty, ErrorBox, Loading } from '../../components/state'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Select } from '../../components/ui/select'

export default function DocumentsPage() {
  return (
    <RequireAuth>
      <Documents />
    </RequireAuth>
  )
}

function Documents() {
  const router = useRouter()
  const q = useQuery({ queryKey: ['documents'], queryFn: documentApi.list })
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [filter, setFilter] = useState('')
  const create = useAction(() => documentApi.create({ title, language }), { invalidate: [['documents']], onDone: (d) => router.push(`/documents/${d.id}`) })
  const docs = rows(q.data).filter((d) => d.title.toLowerCase().includes(filter.toLowerCase()))

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <PageHeader
        title="Documents"
        description="Code and notes you edit together in real time."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> New document
          </Button>
        }
      />
      <Input className="mb-4 max-w-xs" placeholder="Filter by title…" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter documents" />
      {q.isLoading ? (
        <Loading />
      ) : q.error ? (
        <ErrorBox error={q.error} onRetry={() => q.refetch()} />
      ) : docs.length === 0 ? (
        <Empty title="No documents yet">Create one and share it with your team.</Empty>
      ) : (
        <Card className="divide-y">
          {docs.map((d) => (
            <Link key={d.id} href={`/documents/${d.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-accent">
              <FileCode2 className="h-5 w-5 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{d.title}</p>
                <p className="text-xs text-muted-foreground">
                  {d.language} · updated {timeAgo(d.updatedAt)}
                </p>
              </div>
              {d.visibility !== 'PRIVATE' && <Badge variant="secondary">{d.visibility === 'LINK_EDIT' ? 'link can edit' : 'link can view'}</Badge>}
              <Badge variant="outline">{d.access}</Badge>
            </Link>
          ))}
        </Card>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="New document">
        <form className="space-y-4" onSubmit={(e) => (e.preventDefault(), create.mutate(undefined))}>
          <Field label="Title" htmlFor="d-title">
            <Input id="d-title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={120} />
          </Field>
          <Field label="Language" htmlFor="d-lang">
            <Select id="d-lang" value={language} onChange={(e) => setLanguage(e.target.value)}>
              {LANGUAGES.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </Select>
          </Field>
          <Button type="submit" disabled={create.isPending}>
            Create
          </Button>
        </form>
      </Modal>
    </div>
  )
}
