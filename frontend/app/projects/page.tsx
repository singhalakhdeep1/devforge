'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { projectApi, rows } from '../../lib/api/platform'
import { useAuthStore } from '../../lib/store/authStore'
import { Modal, PageHeader, Tabs, useAction } from '../../components/kit'
import { ProjectCard, ProjectForm } from '../../components/projects'
import { Empty, ErrorBox, Loading } from '../../components/state'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Select } from '../../components/ui/select'

export default function ProjectsPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const [scope, setScope] = useState<'public' | 'mine'>('public')
  const [q, setQ] = useState('')
  const [tag, setTag] = useState('')
  const [sort, setSort] = useState<'updated' | 'newest' | 'stars'>('updated')
  const [page, setPage] = useState(1)
  const [creating, setCreating] = useState(false)

  const list = useQuery({ queryKey: ['projects', scope, q, tag, sort, page], queryFn: () => projectApi.list({ scope, q: q || undefined, tag: tag || undefined, sort, page, pageSize: 12 }) })
  const tags = useQuery({ queryKey: ['project-tags'], queryFn: projectApi.tags })
  const create = useAction(projectApi.create, { success: 'Project created', invalidate: [['projects']], onDone: (p) => router.push(`/projects/${p.slug}`) })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <PageHeader
        title="Projects"
        description="Build with others: boards, docs, files and discussion in one place."
        actions={
          user && (
            <Button onClick={() => setCreating(true)}>
              <Plus className="mr-1 h-4 w-4" /> New project
            </Button>
          )
        }
      />
      {user && (
        <Tabs
          tabs={[
            { id: 'public', label: 'Explore' },
            { id: 'mine', label: 'My projects' },
          ]}
          value={scope}
          onChange={(s) => {
            setScope(s)
            setPage(1)
          }}
        />
      )}
      <div className="mb-6 flex flex-wrap gap-2">
        <Input className="max-w-xs" placeholder="Search projects…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} aria-label="Search projects" />
        <Select className="w-40" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="Sort">
          <option value="updated">Recently updated</option>
          <option value="newest">Newest</option>
          <option value="stars">Most starred</option>
        </Select>
        {tag && (
          <Button variant="outline" size="sm" onClick={() => setTag('')}>
            #{tag} ✕
          </Button>
        )}
      </div>
      {!tag && (tags.data?.length ?? 0) > 0 && (
        <div className="mb-6 flex flex-wrap gap-1.5">
          {tags.data!.slice(0, 15).map((t) => (
            <button key={t.tag} onClick={() => setTag(t.tag)} className="rounded-full border px-2.5 py-0.5 text-xs hover:bg-accent">
              #{t.tag} <span className="text-muted-foreground">{t.count}</span>
            </button>
          ))}
        </div>
      )}

      {list.isLoading ? (
        <Loading />
      ) : list.error ? (
        <ErrorBox error={list.error} onRetry={() => list.refetch()} />
      ) : rows(list.data).length === 0 ? (
        <Empty title={scope === 'mine' ? 'You have no projects yet' : 'No projects found'}>{scope === 'mine' && 'Create one to get a board and shared docs for your team.'}</Empty>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows(list.data).map((p) => (
              <ProjectCard key={p.id} p={p} />
            ))}
          </div>
          {(list.data?.totalPages ?? 1) > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3 text-sm">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              Page {page} of {list.data!.totalPages}
              <Button variant="outline" size="sm" disabled={page >= (list.data!.totalPages ?? 1)} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
          )}
        </>
      )}

      <Modal open={creating} onClose={() => setCreating(false)} title="New project" wide>
        <ProjectForm submitLabel="Create project" busy={create.isPending} onSubmit={(v) => create.mutate(v)} />
      </Modal>
    </div>
  )
}
