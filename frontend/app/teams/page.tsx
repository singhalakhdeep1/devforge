'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Plus, Users } from 'lucide-react'
import { rows, teamApi } from '../../lib/api/platform'
import { Field, Modal, PageHeader, useAction } from '../../components/kit'
import { RequireAuth } from '../../components/require-auth'
import { Empty, ErrorBox, Loading } from '../../components/state'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Input } from '../../components/ui/input'

export default function TeamsPage() {
  return (
    <RequireAuth>
      <Teams />
    </RequireAuth>
  )
}

function Teams() {
  const router = useRouter()
  const q = useQuery({ queryKey: ['teams'], queryFn: teamApi.list })
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const create = useAction(() => teamApi.create({ name, description: description || undefined, isPublic }), { success: 'Team created', invalidate: [['teams']], onDone: (t) => router.push(`/teams/${t.slug}`) })

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <PageHeader
        title="Teams"
        description="Groups of people who share projects."
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> New team
          </Button>
        }
      />
      {q.isLoading ? (
        <Loading />
      ) : q.error ? (
        <ErrorBox error={q.error} onRetry={() => q.refetch()} />
      ) : rows(q.data).length === 0 ? (
        <Empty title="You are not in any team yet">Create one, or accept an invitation from a teammate.</Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {rows(q.data).map((t) => (
            <Link key={t.id} href={`/teams/${t.slug}`}>
              <Card className="p-4 transition-shadow hover:shadow-md">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">{t.name}</h3>
                  {t.role && (
                    <Badge variant="outline" className="ml-auto">
                      {t.role.toLowerCase()}
                    </Badge>
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{t.description || 'No description'}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {t.members} members · {t.projects} projects{t.isPublic ? ' · public' : ''}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="New team">
        <form className="space-y-4" onSubmit={(e) => (e.preventDefault(), create.mutate(undefined))}>
          <Field label="Name" htmlFor="t-name">
            <Input id="t-name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={60} />
          </Field>
          <Field label="Description" htmlFor="t-desc">
            <Input id="t-desc" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={300} />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} /> Anyone can see this team and its members
          </label>
          <Button type="submit" disabled={create.isPending}>
            Create team
          </Button>
        </form>
      </Modal>
    </div>
  )
}
