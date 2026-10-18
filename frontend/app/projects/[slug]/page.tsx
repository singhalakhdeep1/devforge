'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Download, ExternalLink, GitFork, KanbanSquare, Plus, Star, Trash2, Video } from 'lucide-react'
import { boardApi, fileApi, projectApi, videoApi, type Comment, type Project, type ProjectRole } from '../../../lib/api/platform'
import { useAuthStore } from '../../../lib/store/authStore'
import { timeAgo } from '../../../lib/utils'
import { Field, formatBytes, Modal, PageHeader, Table, Tabs, useAction, useHashTab } from '../../../components/kit'
import { Markdown } from '../../../components/markdown'
import { ProjectForm } from '../../../components/projects'
import { Empty, ErrorBox, Loading } from '../../../components/state'
import { Badge } from '../../../components/ui/badge'
import { Button, ButtonLink } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Select } from '../../../components/ui/select'
import { Textarea } from '../../../components/ui/textarea'
import { UserAvatar } from '../../../components/user-avatar'

const TABS = ['overview', 'boards', 'discussion', 'files', 'activity', 'members', 'settings'] as const
type Tab = (typeof TABS)[number]
const RANK: Record<ProjectRole, number> = { OWNER: 4, ADMIN: 3, MEMBER: 2, VIEWER: 1 }
const atLeast = (role: ProjectRole | null | undefined, min: ProjectRole) => Boolean(role && RANK[role] >= RANK[min])

export default function ProjectPage() {
  const { slug } = useParams<{ slug: string }>()
  const user = useAuthStore((s) => s.user)
  const [tab, setTab] = useHashTab(TABS, 'overview')
  const q = useQuery({ queryKey: ['project', slug], queryFn: () => projectApi.get(slug) })

  if (q.isLoading) return <Loading />
  if (q.error || !q.data) return <ErrorBox error={q.error} onRetry={() => q.refetch()} />
  const p = q.data
  const visible = TABS.filter((t) => (t === 'settings' ? p.canEdit : t === 'files' || t === 'activity' ? Boolean(p.role) || p.visibility === 'PUBLIC' : true))

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <ProjectHeader p={p} signedIn={Boolean(user)} />
      <Tabs tabs={visible.map((id) => ({ id, label: id[0].toUpperCase() + id.slice(1) }))} value={tab} onChange={setTab} />
      {tab === 'overview' && <Overview p={p} />}
      {tab === 'boards' && <Boards p={p} />}
      {tab === 'discussion' && <Discussion p={p} />}
      {tab === 'files' && <Files p={p} />}
      {tab === 'activity' && <ActivityTab p={p} />}
      {tab === 'members' && <Members p={p} />}
      {tab === 'settings' && p.canEdit && <Settings p={p} />}
    </div>
  )
}

function ProjectHeader({ p, signedIn }: { p: Project; signedIn: boolean }) {
  const router = useRouter()
  const star = useAction(() => (p.starred ? projectApi.unstar(p.id) : projectApi.star(p.id)), { invalidate: [['project', p.slug]] })
  const fork = useAction(() => projectApi.fork(p.id), { success: 'Forked', onDone: (f) => router.push(`/projects/${f.slug}`) })
  const call = useAction(() => videoApi.create({ name: `${p.name} call`, scope: 'project', resourceId: p.id }), { onDone: (r) => router.push(`/video/${r.id}`) })
  return (
    <PageHeader
      title={p.name}
      description={
        <span className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{p.visibility.toLowerCase()}</Badge>
          {p.status === 'ARCHIVED' && <Badge variant="secondary">archived</Badge>}
          {p.role && <Badge>{p.role.toLowerCase()}</Badge>}
          {p.team && <Link className="hover:underline" href={`/teams/${p.team.slug}`}>team {p.team.name}</Link>}
          {p.forkedFrom && (
            <Link className="hover:underline" href={`/projects/${p.forkedFrom.slug}`}>
              forked from {p.forkedFrom.name}
            </Link>
          )}
          <span>{p.description}</span>
        </span>
      }
      actions={
        signedIn && (
          <>
            {p.role && (
              <Button variant="outline" size="sm" onClick={() => call.mutate(undefined)} disabled={call.isPending}>
                <Video className="mr-1 h-4 w-4" /> Start call
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => star.mutate(undefined)} disabled={star.isPending}>
              <Star className={p.starred ? 'mr-1 h-4 w-4 fill-yellow-400 text-yellow-400' : 'mr-1 h-4 w-4'} /> {p.stars}
            </Button>
            <Button variant="outline" size="sm" onClick={() => fork.mutate(undefined)} disabled={fork.isPending}>
              <GitFork className="mr-1 h-4 w-4" /> Fork {p.forks ?? 0}
            </Button>
          </>
        )
      }
    />
  )
}

function Overview({ p }: { p: Project }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <Card className="p-6">{p.readme ? <Markdown>{p.readme}</Markdown> : <p className="text-sm text-muted-foreground">This project has no README yet.</p>}</Card>
      <div className="space-y-4">
        {p.repoUrl && (
          <a href={p.repoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
            <ExternalLink className="h-4 w-4" /> Repository
          </a>
        )}
        {p.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {p.tags.map((t) => (
              <Badge key={t} variant="secondary">
                {t}
              </Badge>
            ))}
          </div>
        )}
        <div>
          <p className="mb-2 text-sm font-medium">People</p>
          <ul className="space-y-2">
            {[...(p.owner ? [{ ...p.owner, role: 'OWNER' as const }] : []), ...(p.members ?? []).filter((m) => m.id !== p.owner?.id)].map((m) => (
              <li key={m.id} className="flex items-center gap-2 text-sm">
                <UserAvatar name={m.name} src={m.avatar} className="h-6 w-6" />
                <Link href={`/people/${m.id}`} className="hover:underline">
                  {m.name}
                </Link>
                <span className="ml-auto text-xs text-muted-foreground">{m.role.toLowerCase()}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-muted-foreground">Created {timeAgo(p.createdAt)} · updated {timeAgo(p.updatedAt)}</p>
      </div>
    </div>
  )
}

function Boards({ p }: { p: Project }) {
  const q = useQuery({ queryKey: ['boards', p.id], queryFn: () => boardApi.list(p.id) })
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [keyPrefix, setKeyPrefix] = useState('')
  const create = useAction(() => boardApi.create({ projectId: p.id, name, description: description || undefined, keyPrefix: keyPrefix || undefined }), {
    success: 'Board created',
    invalidate: [['boards', p.id]],
    onDone: () => {
      setOpen(false)
      setName('')
    },
  })
  if (q.isLoading) return <Loading />
  if (q.error) return <ErrorBox error={q.error} onRetry={() => q.refetch()} />
  return (
    <div>
      {q.data?.canCreate && (
        <Button className="mb-4" onClick={() => setOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> New board
        </Button>
      )}
      {q.data!.boards.length === 0 ? (
        <Empty title="No boards yet">{q.data?.canCreate ? 'Create a board to plan the work in columns and sprints.' : 'Project admins can create boards.'}</Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {q.data!.boards.map((b) => (
            <Link key={b.id} href={`/boards/${b.id}`}>
              <Card className="p-4 transition-shadow hover:shadow-md">
                <div className="flex items-center gap-2">
                  <KanbanSquare className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">{b.name}</h3>
                  <Badge variant="outline" className="ml-auto">
                    {b.keyPrefix}
                  </Badge>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{b.description || 'No description'}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {b.tasks ?? 0} tasks · {b.updatedAt && timeAgo(b.updatedAt)}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="New board">
        <form className="space-y-4" onSubmit={(e) => (e.preventDefault(), create.mutate(undefined))}>
          <Field label="Name" htmlFor="b-name">
            <Input id="b-name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} />
          </Field>
          <Field label="Description" htmlFor="b-desc">
            <Input id="b-desc" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} />
          </Field>
          <Field label="Task key prefix" htmlFor="b-key" hint="2 to 5 letters, e.g. WEB gives task keys WEB-1, WEB-2…">
            <Input id="b-key" value={keyPrefix} onChange={(e) => setKeyPrefix(e.target.value.toUpperCase())} pattern="[A-Z][A-Z0-9]{1,4}" />
          </Field>
          <Button type="submit" disabled={create.isPending}>
            Create board
          </Button>
        </form>
      </Modal>
    </div>
  )
}

function CommentItem({ c, p, onReply }: { c: Comment; p: Project; onReply?: (c: Comment) => void }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(c.content)
  const save = useAction(() => projectApi.editComment(p.id, c.id, text), { invalidate: [['project-comments', p.id]], onDone: () => setEditing(false) })
  const remove = useAction(() => projectApi.deleteComment(p.id, c.id), { invalidate: [['project-comments', p.id]] })
  return (
    <div id={`comment-${c.id}`} className="flex gap-3">
      <UserAvatar name={c.author?.name ?? '?'} src={c.author?.avatar} className="h-8 w-8" />
      <div className="min-w-0 flex-1">
        <p className="text-sm">
          <span className="font-medium">{c.author?.name ?? 'Deleted user'}</span> <span className="text-xs text-muted-foreground">{timeAgo(c.createdAt)}{c.edited && ' · edited'}</span>
        </p>
        {editing ? (
          <div className="mt-1 space-y-2">
            <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => save.mutate(undefined)} disabled={!text.trim()}>
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-0.5 whitespace-pre-wrap text-sm">{c.content}</p>
        )}
        <div className="mt-1 flex gap-3 text-xs text-muted-foreground">
          {onReply && <button onClick={() => onReply(c)} className="hover:underline">Reply</button>}
          {c.mine && !editing && <button onClick={() => setEditing(true)} className="hover:underline">Edit</button>}
          {(c.mine || p.canEdit) && <button onClick={() => confirm('Delete this comment?') && remove.mutate(undefined)} className="hover:underline">Delete</button>}
        </div>
      </div>
    </div>
  )
}

function Discussion({ p }: { p: Project }) {
  const user = useAuthStore((s) => s.user)
  const q = useQuery({ queryKey: ['project-comments', p.id], queryFn: () => projectApi.comments(p.id) })
  const [text, setText] = useState('')
  const [replyTo, setReplyTo] = useState<Comment | null>(null)
  const post = useAction(() => projectApi.comment(p.id, text, replyTo?.id), { invalidate: [['project-comments', p.id]], onDone: () => (setText(''), setReplyTo(null)) })
  return (
    <div className="max-w-3xl space-y-6">
      {user && (
        <form onSubmit={(e) => (e.preventDefault(), text.trim() && post.mutate(undefined))} className="space-y-2">
          {replyTo && (
            <p className="text-xs text-muted-foreground">
              Replying to {replyTo.author?.name} · <button type="button" className="underline" onClick={() => setReplyTo(null)}>cancel</button>
            </p>
          )}
          <Textarea placeholder="Start a discussion…" value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={2000} aria-label="Comment" />
          <Button type="submit" size="sm" disabled={post.isPending || !text.trim()}>
            Comment
          </Button>
        </form>
      )}
      {q.isLoading ? (
        <Loading />
      ) : (q.data?.data ?? []).length === 0 ? (
        <Empty title="No comments yet" />
      ) : (
        <div className="space-y-5">
          {q.data!.data!.map((c) => (
            <div key={c.id} className="space-y-3">
              <CommentItem c={c} p={p} onReply={user ? setReplyTo : undefined} />
              {(c.replies ?? []).length > 0 && (
                <div className="ml-11 space-y-3 border-l pl-4">
                  {c.replies!.map((r) => (
                    <CommentItem key={r.id} c={r} p={p} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Files({ p }: { p: Project }) {
  const q = useQuery({ queryKey: ['project-files', p.id], queryFn: () => projectApi.files(p.id) })
  const [progress, setProgress] = useState<number | null>(null)
  const canWrite = atLeast(p.role, 'MEMBER')
  const upload = useAction(
    async (file: File) => {
      const f = await fileApi.upload(file, setProgress)
      await projectApi.attachFile(p.id, f.id)
    },
    { success: 'File added', invalidate: [['project-files', p.id]], onDone: () => setProgress(null) }
  )
  const detach = useAction((fileId: string) => projectApi.detachFile(p.id, fileId), { invalidate: [['project-files', p.id]] })
  return (
    <div className="space-y-4">
      {canWrite && (
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent">
          <Plus className="h-4 w-4" /> {progress !== null ? `Uploading ${progress}%` : 'Upload file'}
          <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && upload.mutate(e.target.files[0])} disabled={upload.isPending} />
        </label>
      )}
      {q.isLoading ? (
        <Loading />
      ) : (
        <Table head={['Name', 'Type', 'Size', 'Added', '']} empty={(q.data ?? []).length === 0}>
          {(q.data ?? []).map((f) => (
            <tr key={f.id}>
              <td className="px-3 py-2 font-medium">{f.name}</td>
              <td className="px-3 py-2 text-muted-foreground">{f.mimeType}</td>
              <td className="px-3 py-2">{formatBytes(f.size)}</td>
              <td className="px-3 py-2 text-muted-foreground">{timeAgo(f.createdAt)}</td>
              <td className="space-x-1 whitespace-nowrap px-3 py-2 text-right">
                <Button variant="ghost" size="icon" aria-label={`Download ${f.name}`} onClick={() => fileApi.download(f.fileId, f.name)}>
                  <Download className="h-4 w-4" />
                </Button>
                {canWrite && (
                  <Button variant="ghost" size="icon" aria-label={`Remove ${f.name}`} onClick={() => detach.mutate(f.fileId)}>
                    <Trash2 className="h-4 w-4" />
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

function ActivityTab({ p }: { p: Project }) {
  const q = useQuery({ queryKey: ['project-activity', p.id], queryFn: () => projectApi.activity(p.id) })
  if (q.isLoading) return <Loading />
  if ((q.data ?? []).length === 0) return <Empty title="No activity yet" />
  return (
    <ul className="max-w-3xl space-y-3">
      {q.data!.map((a) => (
        <li key={a.id} className="flex items-center gap-3 text-sm">
          <UserAvatar name={a.user?.name ?? '?'} src={a.user?.avatar} className="h-7 w-7" />
          <span>
            <span className="font-medium">{a.user?.name ?? 'Someone'}</span> {a.summary.charAt(0).toLowerCase() + a.summary.slice(1)}
          </span>
          <span className="ml-auto text-xs text-muted-foreground">{timeAgo(a.createdAt)}</span>
        </li>
      ))}
    </ul>
  )
}

function Members({ p }: { p: Project }) {
  const user = useAuthStore((s) => s.user)
  const admin = atLeast(p.role, 'ADMIN')
  const invites = useQuery({ queryKey: ['project-invitations', p.id], queryFn: () => projectApi.invitations(p.id), enabled: admin })
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<ProjectRole>('MEMBER')
  const invite = useAction(() => projectApi.invite(p.id, email, role), { success: 'Invitation sent', invalidate: [['project-invitations', p.id]], onDone: () => setEmail('') })
  const setMemberRole = useAction(({ userId, r }: { userId: string; r: ProjectRole }) => projectApi.setMemberRole(p.id, userId, r), { success: 'Role updated', invalidate: [['project', p.slug]] })
  const remove = useAction((userId: string) => projectApi.removeMember(p.id, userId), { success: 'Removed', invalidate: [['project', p.slug]] })
  const cancel = useAction((id: string) => projectApi.cancelInvitation(p.id, id), { invalidate: [['project-invitations', p.id]] })

  return (
    <div className="max-w-3xl space-y-8">
      <Table head={['Person', 'Role', '']}>
        {p.owner && (
          <tr>
            <td className="px-3 py-2">{p.owner.name}</td>
            <td className="px-3 py-2">owner</td>
            <td />
          </tr>
        )}
        {(p.members ?? [])
          .filter((m) => m.id !== p.owner?.id)
          .map((m) => (
            <tr key={m.id}>
              <td className="px-3 py-2">
                <Link href={`/people/${m.id}`} className="hover:underline">
                  {m.name}
                </Link>
              </td>
              <td className="px-3 py-2">
                {admin ? (
                  <Select className="h-8 w-32" value={m.role} onChange={(e) => setMemberRole.mutate({ userId: m.id, r: e.target.value as ProjectRole })} aria-label={`Role of ${m.name}`}>
                    <option value="ADMIN">Admin</option>
                    <option value="MEMBER">Member</option>
                    <option value="VIEWER">Viewer</option>
                  </Select>
                ) : (
                  m.role.toLowerCase()
                )}
              </td>
              <td className="px-3 py-2 text-right">
                {(admin || m.id === user?.id) && (
                  <Button variant="ghost" size="sm" onClick={() => confirm(m.id === user?.id ? 'Leave this project?' : `Remove ${m.name}?`) && remove.mutate(m.id)}>
                    {m.id === user?.id ? 'Leave' : 'Remove'}
                  </Button>
                )}
              </td>
            </tr>
          ))}
      </Table>

      {admin && (
        <div className="space-y-3">
          <h3 className="font-semibold">Invite people</h3>
          <form className="flex flex-wrap gap-2" onSubmit={(e) => (e.preventDefault(), invite.mutate(undefined))}>
            <Input className="max-w-xs" type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required aria-label="Email to invite" />
            <Select className="w-32" value={role} onChange={(e) => setRole(e.target.value as ProjectRole)} aria-label="Role">
              <option value="ADMIN">Admin</option>
              <option value="MEMBER">Member</option>
              <option value="VIEWER">Viewer</option>
            </Select>
            <Button type="submit" disabled={invite.isPending}>
              Send invitation
            </Button>
          </form>
          {(invites.data ?? []).length > 0 && (
            <Table head={['Pending invitation', 'Role', 'Expires', '']}>
              {invites.data!.map((i) => (
                <tr key={i.id}>
                  <td className="px-3 py-2">{i.email}</td>
                  <td className="px-3 py-2">{i.role.toLowerCase()}</td>
                  <td className="px-3 py-2 text-muted-foreground">{i.expiresAt && new Date(i.expiresAt).toLocaleDateString()}</td>
                  <td className="px-3 py-2 text-right">
                    <Button variant="ghost" size="sm" onClick={() => cancel.mutate(i.id)}>
                      Cancel
                    </Button>
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </div>
      )}
    </div>
  )
}

function Settings({ p }: { p: Project }) {
  const router = useRouter()
  const update = useAction((v: Parameters<typeof projectApi.update>[1]) => projectApi.update(p.id, v), {
    success: 'Saved',
    invalidate: [['project', p.slug], ['projects']],
    onDone: (np) => np.slug !== p.slug && router.replace(`/projects/${np.slug}#settings`),
  })
  const remove = useAction(() => projectApi.remove(p.id), { success: 'Project deleted', invalidate: [['projects']], onDone: () => router.push('/projects') })
  return (
    <div className="max-w-3xl space-y-8">
      <Card className="p-6">
        <ProjectForm initial={p} submitLabel="Save changes" busy={update.isPending} onSubmit={(v) => update.mutate(v)} />
      </Card>
      <Card className="space-y-3 border-red-200 p-6">
        <h3 className="font-semibold">Danger zone</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => update.mutate({ status: p.status === 'ARCHIVED' ? 'ACTIVE' : 'ARCHIVED' })}>
            {p.status === 'ARCHIVED' ? 'Unarchive' : 'Archive'} project
          </Button>
          {p.role === 'OWNER' && (
            <Button variant="destructive" onClick={() => prompt(`Type "${p.name}" to delete this project and everything in it`) === p.name && remove.mutate(undefined)}>
              Delete project
            </Button>
          )}
        </div>
      </Card>
      <ButtonLink href={`/projects/${p.slug}`} variant="link" className="px-0">
        Back to overview
      </ButtonLink>
    </div>
  )
}
