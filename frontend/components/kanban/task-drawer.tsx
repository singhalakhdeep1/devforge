'use client'

import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Eye, EyeOff, Paperclip, Trash2, X } from 'lucide-react'
import { fileApi, taskApi, type Board, type Priority, type TaskDetail, type TaskType } from '../../lib/api/platform'
import { timeAgo } from '../../lib/utils'
import { Field, formatBytes, useAction } from '../kit'
import { Markdown } from '../markdown'
import { ErrorBox, Loading } from '../state'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Select } from '../ui/select'
import { Textarea } from '../ui/textarea'
import { UserAvatar } from '../user-avatar'

export const PRIORITIES: Priority[] = ['HIGHEST', 'HIGH', 'MEDIUM', 'LOW', 'LOWEST']
export const TYPES: TaskType[] = ['TASK', 'STORY', 'BUG', 'SUBTASK']
export const priorityColor: Record<Priority, string> = { HIGHEST: 'text-red-600', HIGH: 'text-orange-500', MEDIUM: 'text-yellow-600', LOW: 'text-blue-500', LOWEST: 'text-slate-400' }

export function TaskDrawer({ taskId, board, onClose }: { taskId: string; board: Board; onClose: () => void }) {
  const q = useQuery({ queryKey: ['task', taskId], queryFn: () => taskApi.get(taskId) })
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/30" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside role="dialog" aria-label="Task details" className="h-full w-full max-w-2xl overflow-y-auto border-l bg-background shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-5 py-3">
          <span className="font-mono text-sm text-muted-foreground">{q.data?.key ?? '…'}</span>
          <button onClick={onClose} aria-label="Close" className="rounded p-1 hover:bg-accent">
            <X className="h-4 w-4" />
          </button>
        </div>
        {q.isLoading ? <Loading /> : q.error || !q.data ? <ErrorBox error={q.error} onRetry={() => q.refetch()} /> : <TaskBody t={q.data} board={board} onClose={onClose} />}
      </aside>
    </div>
  )
}

function TaskBody({ t, board, onClose }: { t: TaskDetail; board: Board; onClose: () => void }) {
  const canWrite = t.access.write
  const keys = [['task', t.id], ['board', board.id]]
  const update = useAction((body: Parameters<typeof taskApi.update>[1]) => taskApi.update(t.id, body), { invalidate: keys })
  const remove = useAction(() => taskApi.remove(t.id), { success: 'Task deleted', invalidate: [['board', board.id]], onDone: onClose })
  const watch = useAction(() => (t.watching ? taskApi.unwatch(t.id) : taskApi.watch(t.id)), { invalidate: keys })
  const toggleLabel = useAction((labelId: string) => (t.labels.some((l) => l.id === labelId) ? taskApi.removeLabel(t.id, labelId) : taskApi.addLabel(t.id, labelId)), { invalidate: keys })
  const move = useAction((columnId: string) => taskApi.move(t.id, columnId, 0), { invalidate: keys })

  const [title, setTitle] = useState(t.title)
  const [editingDesc, setEditingDesc] = useState(false)
  const [description, setDescription] = useState(t.description ?? '')
  useEffect(() => {
    setTitle(t.title)
    setDescription(t.description ?? '')
  }, [t.title, t.description])

  return (
    <div className="space-y-6 p-5">
      <div className="space-y-2">
        <Input
          aria-label="Title"
          className="border-transparent text-lg font-semibold hover:border-input"
          value={title}
          disabled={!canWrite}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => title.trim() && title !== t.title && update.mutate({ title: title.trim() })}
        />
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline">{t.column?.name}</Badge>
          {t.parent && <span>sub-task of {t.parent.key}</span>}
          <span>created {timeAgo(t.createdAt)} by {t.reporter?.name ?? 'someone'}</span>
          {t.overdue && <Badge variant="destructive">overdue</Badge>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Status" htmlFor="t-col">
          <Select id="t-col" value={t.columnId} disabled={!canWrite} onChange={(e) => move.mutate(e.target.value)}>
            {board.columns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Assignee" htmlFor="t-assignee">
          <Select id="t-assignee" value={t.assignee?.id ?? ''} disabled={!canWrite} onChange={(e) => update.mutate({ assigneeId: e.target.value || null })}>
            <option value="">Unassigned</option>
            {board.people.filter(Boolean).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Priority" htmlFor="t-priority">
          <Select id="t-priority" value={t.priority} disabled={!canWrite} onChange={(e) => update.mutate({ priority: e.target.value as Priority })}>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p.toLowerCase()}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Type" htmlFor="t-type">
          <Select id="t-type" value={t.type} disabled={!canWrite} onChange={(e) => update.mutate({ type: e.target.value as TaskType })}>
            {TYPES.map((x) => (
              <option key={x} value={x}>
                {x.toLowerCase()}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Sprint" htmlFor="t-sprint">
          <Select id="t-sprint" value={t.sprintId ?? ''} disabled={!canWrite} onChange={(e) => update.mutate({ sprintId: e.target.value || null })}>
            <option value="">Backlog</option>
            {board.sprints.filter((s) => s.status !== 'COMPLETED').map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.status.toLowerCase()})
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Epic" htmlFor="t-epic">
          <Select id="t-epic" value={t.epicId ?? ''} disabled={!canWrite} onChange={(e) => update.mutate({ epicId: e.target.value || null })}>
            <option value="">None</option>
            {board.epics.map((ep) => (
              <option key={ep.id} value={ep.id}>
                {ep.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Story points" htmlFor="t-points">
          <Input id="t-points" type="number" min={0} max={100} defaultValue={t.points ?? ''} disabled={!canWrite} onBlur={(e) => update.mutate({ points: e.target.value === '' ? null : Number(e.target.value) })} />
        </Field>
        <Field label="Due date" htmlFor="t-due">
          <Input id="t-due" type="date" defaultValue={t.dueDate ? t.dueDate.slice(0, 10) : ''} disabled={!canWrite} onChange={(e) => update.mutate({ dueDate: e.target.value ? new Date(e.target.value).toISOString() : null })} />
        </Field>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Labels</p>
        <div className="flex flex-wrap gap-1.5">
          {board.labels.length === 0 && <span className="text-xs text-muted-foreground">No labels on this board yet</span>}
          {board.labels.map((l) => {
            const on = t.labels.some((x) => x.id === l.id)
            return (
              <button
                key={l.id}
                disabled={!canWrite}
                onClick={() => toggleLabel.mutate(l.id)}
                className="rounded-full border px-2.5 py-0.5 text-xs font-medium"
                style={on ? { backgroundColor: l.color, borderColor: l.color, color: '#fff' } : { borderColor: l.color, color: l.color }}
                aria-pressed={on}
              >
                {l.name}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium">Description</p>
          {canWrite && !editingDesc && (
            <Button variant="ghost" size="sm" onClick={() => setEditingDesc(true)}>
              Edit
            </Button>
          )}
        </div>
        {editingDesc ? (
          <div className="space-y-2">
            <Textarea rows={8} value={description} onChange={(e) => setDescription(e.target.value)} aria-label="Description" />
            <div className="flex gap-2">
              <Button size="sm" onClick={() => (update.mutate({ description }), setEditingDesc(false))}>
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => (setDescription(t.description ?? ''), setEditingDesc(false))}>
                Cancel
              </Button>
            </div>
          </div>
        ) : t.description ? (
          <div className="rounded-md border p-3 text-sm">
            <Markdown>{t.description}</Markdown>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No description</p>
        )}
      </div>

      {t.subtasks.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium">Sub-tasks</p>
          <ul className="space-y-1 text-sm">
            {t.subtasks.map((s) => (
              <li key={s.id} className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">{s.key}</span>
                <span className={s.status === 'DONE' ? 'line-through' : ''}>{s.title}</span>
                {s.assignee && <span className="ml-auto text-xs text-muted-foreground">{s.assignee.name}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Attachments t={t} boardId={board.id} />
      <TimeLog t={t} boardId={board.id} />
      <Comments t={t} board={board} />

      <div className="flex flex-wrap gap-2 border-t pt-4">
        <Button variant="outline" size="sm" onClick={() => watch.mutate(undefined)}>
          {t.watching ? <EyeOff className="mr-1 h-4 w-4" /> : <Eye className="mr-1 h-4 w-4" />}
          {t.watching ? 'Stop watching' : 'Watch'} ({t.watchers})
        </Button>
        {canWrite && (
          <Button variant="outline" size="sm" className="text-red-600" onClick={() => confirm(`Delete ${t.key}?`) && remove.mutate(undefined)}>
            <Trash2 className="mr-1 h-4 w-4" /> Delete
          </Button>
        )}
      </div>

      {t.activity.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium">History</p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            {t.activity.map((a) => (
              <li key={a.id}>
                {a.user?.name ?? 'Someone'} · {a.action.replace(/^task\./, '').replace(/_/g, ' ')} · {timeAgo(a.createdAt)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function Attachments({ t, boardId }: { t: TaskDetail; boardId: string }) {
  const keys = [['task', t.id], ['board', boardId]]
  const [progress, setProgress] = useState<number | null>(null)
  const attach = useAction(
    async (file: File) => {
      const f = await fileApi.upload(file, setProgress)
      await taskApi.attach(t.id, f.id)
    },
    { invalidate: keys, onDone: () => setProgress(null) }
  )
  const detach = useAction((id: string) => taskApi.detach(t.id, id), { invalidate: keys })
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium">Attachments</p>
        {t.access.write && (
          <label className="flex cursor-pointer items-center gap-1 text-sm text-blue-600 hover:underline">
            <Paperclip className="h-4 w-4" /> {progress !== null ? `${progress}%` : 'Attach'}
            <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && attach.mutate(e.target.files[0])} />
          </label>
        )}
      </div>
      {t.attachments.length === 0 ? (
        <p className="text-sm text-muted-foreground">None</p>
      ) : (
        <ul className="space-y-1 text-sm">
          {t.attachments.map((a) => (
            <li key={a.id} className="flex items-center gap-2">
              <button className="truncate text-blue-600 hover:underline" onClick={() => fileApi.download(a.fileId, a.name)}>
                {a.name}
              </button>
              {a.size !== undefined && <span className="text-xs text-muted-foreground">{formatBytes(a.size)}</span>}
              {t.access.write && (
                <button className="ml-auto text-muted-foreground hover:text-red-600" aria-label={`Remove ${a.name}`} onClick={() => detach.mutate(a.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function TimeLog({ t, boardId }: { t: TaskDetail; boardId: string }) {
  const keys = [['task', t.id], ['board', boardId]]
  const [hours, setHours] = useState('')
  const [note, setNote] = useState('')
  const log = useAction(() => taskApi.logTime(t.id, Number(hours), note || undefined), { invalidate: keys, onDone: () => (setHours(''), setNote('')) })
  const remove = useAction((id: string) => taskApi.deleteTime(t.id, id), { invalidate: keys })
  return (
    <div>
      <p className="mb-2 text-sm font-medium">
        Time logged: {t.loggedHours} h{t.estimatedHours ? ` of ${t.estimatedHours} h estimated` : ''}
      </p>
      {t.access.write && (
        <form className="mb-2 flex gap-2" onSubmit={(e) => (e.preventDefault(), Number(hours) > 0 && log.mutate(undefined))}>
          <Input className="w-24" type="number" step="0.25" min="0.1" max="24" placeholder="Hours" value={hours} onChange={(e) => setHours(e.target.value)} aria-label="Hours" />
          <Input placeholder="What did you do?" value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} aria-label="Work description" />
          <Button type="submit" size="sm" variant="outline" disabled={log.isPending}>
            Log
          </Button>
        </form>
      )}
      <ul className="space-y-1 text-xs text-muted-foreground">
        {t.timeEntries.map((e) => (
          <li key={e.id} className="flex items-center gap-2">
            {e.hours} h · {e.user?.name} · {new Date(e.date).toLocaleDateString()} {e.description && `· ${e.description}`}
            {e.mine && (
              <button className="ml-auto hover:text-red-600" aria-label="Delete entry" onClick={() => remove.mutate(e.id)}>
                <Trash2 className="h-3 w-3" />
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Comments({ t, board }: { t: TaskDetail; board: Board }) {
  const keys = [['task', t.id], ['board', board.id]]
  const [text, setText] = useState('')
  // @Name mentions notify the person mentioned
  const mentions = board.people.filter((p) => p && text.includes(`@${p.name}`)).map((p) => p.id)
  const post = useAction(() => taskApi.comment(t.id, text, mentions), { invalidate: keys, onDone: () => setText('') })
  const remove = useAction((id: string) => taskApi.deleteComment(t.id, id), { invalidate: keys })
  return (
    <div>
      <p className="mb-2 text-sm font-medium">Comments ({t.comments.length})</p>
      <div className="space-y-3">
        {t.comments.map((c) => (
          <div key={c.id} className="flex gap-2">
            <UserAvatar name={c.author?.name ?? '?'} src={c.author?.avatar} className="h-7 w-7" />
            <div className="min-w-0 flex-1 text-sm">
              <p>
                <span className="font-medium">{c.author?.name ?? 'Deleted user'}</span>{' '}
                <span className="text-xs text-muted-foreground">
                  {timeAgo(c.createdAt)}
                  {c.edited && ' · edited'}
                </span>
                {c.mine && (
                  <button className="ml-2 text-xs text-muted-foreground hover:text-red-600" onClick={() => remove.mutate(c.id)}>
                    delete
                  </button>
                )}
              </p>
              <p className="whitespace-pre-wrap">{c.content}</p>
            </div>
          </div>
        ))}
      </div>
      <form className="mt-3 space-y-2" onSubmit={(e) => (e.preventDefault(), text.trim() && post.mutate(undefined))}>
        <Textarea rows={2} placeholder="Add a comment… use @Name to mention someone" value={text} onChange={(e) => setText(e.target.value)} maxLength={5000} aria-label="New comment" />
        <Button type="submit" size="sm" disabled={post.isPending || !text.trim()}>
          Comment
        </Button>
      </form>
    </div>
  )
}
