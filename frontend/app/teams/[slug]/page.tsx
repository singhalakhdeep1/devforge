'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { teamApi, type Project } from '../../../lib/api/platform'
import { useAuthStore } from '../../../lib/store/authStore'
import { Field, PageHeader, Table, useAction } from '../../../components/kit'
import { RequireAuth } from '../../../components/require-auth'
import { Empty, ErrorBox, Loading } from '../../../components/state'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Select } from '../../../components/ui/select'
import { UserAvatar } from '../../../components/user-avatar'

export default function TeamPage() {
  return (
    <RequireAuth>
      <TeamView />
    </RequireAuth>
  )
}

function TeamView() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const me = useAuthStore((s) => s.user)
  const q = useQuery({ queryKey: ['team', slug], queryFn: () => teamApi.get(slug) })
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('MEMBER')
  const keys = [['team', slug], ['teams']]
  const invite = useAction(() => teamApi.invite(q.data!.id, email, role), { success: 'Invitation sent', onDone: () => setEmail('') })
  const setMemberRole = useAction(({ userId, r }: { userId: string; r: string }) => teamApi.setMemberRole(q.data!.id, userId, r), { success: 'Role updated', invalidate: keys })
  const removeMember = useAction((userId: string) => teamApi.removeMember(q.data!.id, userId), { invalidate: keys, onDone: () => q.refetch() })
  const update = useAction((body: { name?: string; description?: string; isPublic?: boolean }) => teamApi.update(q.data!.id, body), {
    success: 'Saved',
    invalidate: keys,
    onDone: (t) => t.slug !== slug && router.replace(`/teams/${t.slug}`),
  })
  const remove = useAction(() => teamApi.remove(q.data!.id), { success: 'Team deleted', invalidate: [['teams']], onDone: () => router.push('/teams') })

  if (q.isLoading) return <Loading />
  if (q.error || !q.data) return <ErrorBox error={q.error} onRetry={() => q.refetch()} />
  const t = q.data
  const admin = t.role === 'OWNER' || t.role === 'ADMIN'

  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-4 py-8">
      <PageHeader title={t.name} description={t.description ?? undefined} actions={t.role && <Badge>{t.role.toLowerCase()}</Badge>} />

      <section>
        <h2 className="mb-3 font-semibold">Projects</h2>
        {t.projects.length === 0 ? (
          <Empty title="No team projects yet">Create a project and pick this team for it.</Empty>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {t.projects.map((p: Project) => (
              <Link key={p.id} href={`/projects/${p.slug}`}>
                <Card className="p-4 hover:shadow-md">
                  <p className="font-medium">{p.name}</p>
                  <p className="line-clamp-1 text-sm text-muted-foreground">{p.description || 'No description'}</p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-semibold">Members ({t.members.length})</h2>
        <Table head={['Person', 'Role', '']}>
          {t.members.map((m) => (
            <tr key={m.id}>
              <td className="px-3 py-2">
                <Link href={`/people/${m.id}`} className="flex items-center gap-2 hover:underline">
                  <UserAvatar name={m.name} src={m.avatar} className="h-6 w-6" />
                  {m.name}
                </Link>
              </td>
              <td className="px-3 py-2">
                {admin && m.role !== 'OWNER' ? (
                  <Select className="h-8 w-28" value={m.role} onChange={(e) => setMemberRole.mutate({ userId: m.id, r: e.target.value })} aria-label={`Role of ${m.name}`}>
                    <option value="ADMIN">Admin</option>
                    <option value="MEMBER">Member</option>
                  </Select>
                ) : (
                  m.role.toLowerCase()
                )}
              </td>
              <td className="px-3 py-2 text-right">
                {m.role !== 'OWNER' && (admin || m.id === me?.id) && (
                  <Button variant="ghost" size="sm" onClick={() => confirm(m.id === me?.id ? 'Leave this team?' : `Remove ${m.name}?`) && removeMember.mutate(m.id)}>
                    {m.id === me?.id ? 'Leave' : 'Remove'}
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </Table>
        {admin && (
          <form className="mt-3 flex flex-wrap gap-2" onSubmit={(e) => (e.preventDefault(), invite.mutate(undefined))}>
            <Input className="max-w-xs" type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required aria-label="Email to invite" />
            <Select className="w-32" value={role} onChange={(e) => setRole(e.target.value)} aria-label="Role">
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </Select>
            <Button type="submit" disabled={invite.isPending}>
              Invite
            </Button>
          </form>
        )}
      </section>

      {admin && (
        <section className="space-y-4 rounded-lg border p-5">
          <h2 className="font-semibold">Settings</h2>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault()
              const f = new FormData(e.currentTarget)
              update.mutate({ name: String(f.get('name')), description: String(f.get('description')), isPublic: f.get('isPublic') === 'on' })
            }}
          >
            <Field label="Name" htmlFor="team-name">
              <Input id="team-name" name="name" defaultValue={t.name} required minLength={2} maxLength={60} />
            </Field>
            <Field label="Description" htmlFor="team-desc">
              <Input id="team-desc" name="description" defaultValue={t.description ?? ''} maxLength={300} />
            </Field>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isPublic" defaultChecked={t.isPublic} /> Public team
            </label>
            <Button type="submit" variant="outline" disabled={update.isPending}>
              Save
            </Button>
          </form>
          {t.role === 'OWNER' && (
            <Button variant="destructive" onClick={() => prompt(`Type "${t.name}" to delete this team`) === t.name && remove.mutate(undefined)}>
              Delete team
            </Button>
          )}
        </section>
      )}
    </div>
  )
}
