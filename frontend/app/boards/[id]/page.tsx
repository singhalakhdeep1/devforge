'use client'

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { BarChart3, CalendarClock, ChevronLeft, ChevronRight, MessageSquare, Paperclip, Plus, Settings2, Trash2, Video } from 'lucide-react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { boardApi, taskApi, videoApi, type Board, type BoardColumn, type Priority, type TaskCard } from '../../../lib/api/platform'
import { apiErrorMessage } from '../../../lib/api/client'
import { getSocket } from '../../../lib/socket'
import { useAuthStore } from '../../../lib/store/authStore'
import { cn } from '../../../lib/utils'
import { Field, Modal, Stat, Table, useAction } from '../../../components/kit'
import { PRIORITIES, TaskDrawer, priorityColor } from '../../../components/kanban/task-drawer'
import { ErrorBox, Loading } from '../../../components/state'
import { useToast } from '../../../components/toast'
import { Badge } from '../../../components/ui/badge'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Select } from '../../../components/ui/select'
import { UserAvatar } from '../../../components/user-avatar'

type Filter = { q?: string; assignee?: string; priority?: string; sprint?: string; label?: string }

export default function BoardPage() {
  return (
    <Suspense fallback={<Loading />}>
      <BoardView />
    </Suspense>
  )
}

function BoardView() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const pathname = usePathname()
  const search = useSearchParams()
  const qc = useQueryClient()
  const toast = useToast()
  const accessToken = useAuthStore((s) => s.accessToken)
  const [filter, setFilter] = useState<Filter>({})
  const [panel, setPanel] = useState<null | 'sprints' | 'analytics' | 'settings'>(null)
  const openTask = search.get('task')

  const q = useQuery({ queryKey: ['board', id, filter], queryFn: () => boardApi.get(id, filter as Record<string, string | undefined>) })

  // live updates from everyone else on this board
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return
    const room = `board:${id}`
    const join = () => socket.emit('join_room', room)
    join()
    socket.on('connect', join)
    const onEvent = (event: string, payload?: { id?: string }) => {
      if (!event.startsWith('task:') && !event.startsWith('board:') && !event.startsWith('column:') && !event.startsWith('sprint:')) return
      void qc.invalidateQueries({ queryKey: ['board', id] })
      if (payload?.id) void qc.invalidateQueries({ queryKey: ['task', payload.id] })
    }
    socket.onAny(onEvent)
    return () => {
      socket.emit('leave_room', room)
      socket.off('connect', join)
      socket.offAny(onEvent)
    }
  }, [id, qc, accessToken])

  const setTask = useCallback(
    (taskId: string | null) => {
      const params = new URLSearchParams(search.toString())
      if (taskId) params.set('task', taskId)
      else params.delete('task')
      router.replace(`${pathname}${params.size ? `?${params}` : ''}`, { scroll: false })
    },
    [pathname, router, search]
  )

  const call = useAction(() => videoApi.create({ name: `${q.data?.name ?? 'Board'} stand-up`, scope: 'board', resourceId: id }), { onDone: (r) => router.push(`/video/${r.id}`) })

  if (q.isLoading) return <Loading />
  if (q.error || !q.data) return <ErrorBox error={q.error} onRetry={() => q.refetch()} />
  const board = q.data

  const move = async (task: TaskCard, columnId: string, index: number) => {
    try {
      await taskApi.move(task.id, columnId, index)
    } catch (e) {
      const conflict = (e as { response?: { status?: number } }).response?.status === 409
      if (conflict && board.access.admin && confirm(`${apiErrorMessage(e, 'Column is full')}. Move it anyway?`)) await taskApi.move(task.id, columnId, index, true).catch((err) => toast.error(apiErrorMessage(err, 'Move failed')))
      else toast.error(apiErrorMessage(e, 'Move failed'))
    }
    void qc.invalidateQueries({ queryKey: ['board', id] })
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <div className="border-b px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <Link href={`/projects/${board.projectId}#boards`} className="text-sm text-muted-foreground hover:underline">
            Project
          </Link>
          <span className="text-muted-foreground">/</span>
          <h1 className="text-xl font-bold">{board.name}</h1>
          <Badge variant="outline">{board.keyPrefix}</Badge>
          {board.activeSprint && (
            <Badge className="gap-1">
              <CalendarClock className="h-3 w-3" /> {board.activeSprint.name} · ends {new Date(board.activeSprint.endDate).toLocaleDateString()}
            </Badge>
          )}
          {!board.access.write && <Badge variant="secondary">view only</Badge>}
          <div className="ml-auto flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => call.mutate(undefined)} disabled={call.isPending}>
              <Video className="mr-1 h-4 w-4" /> Call
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPanel('sprints')}>
              <CalendarClock className="mr-1 h-4 w-4" /> Sprints
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPanel('analytics')}>
              <BarChart3 className="mr-1 h-4 w-4" /> Insights
            </Button>
            {board.access.admin && (
              <Button variant="outline" size="sm" onClick={() => setPanel('settings')}>
                <Settings2 className="mr-1 h-4 w-4" /> Settings
              </Button>
            )}
          </div>
        </div>
        <Filters board={board} filter={filter} setFilter={setFilter} />
      </div>

      <div className="flex flex-1 gap-4 overflow-x-auto p-4">
        {board.columns.map((col) => (
          <ColumnView key={col.id} col={col} board={board} tasks={board.tasks.filter((t) => t.columnId === col.id).sort((a, b) => a.order - b.order)} onOpen={setTask} onMove={move} />
        ))}
      </div>

      {openTask && <TaskDrawer taskId={openTask} board={board} onClose={() => setTask(null)} />}
      <Modal open={panel === 'sprints'} onClose={() => setPanel(null)} title="Sprints" wide>
        <Sprints board={board} />
      </Modal>
      <Modal open={panel === 'analytics'} onClose={() => setPanel(null)} title="Board insights" wide>
        <Insights board={board} />
      </Modal>
      <Modal open={panel === 'settings'} onClose={() => setPanel(null)} title="Board settings" wide>
        <BoardSettings board={board} onDeleted={() => router.push(`/projects/${board.projectId}#boards`)} />
      </Modal>
    </div>
  )
}

function Filters({ board, filter, setFilter }: { board: Board; filter: Filter; setFilter: (f: Filter) => void }) {
  const set = (k: keyof Filter, v: string) => setFilter({ ...filter, [k]: v || undefined })
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <Input className="h-9 w-48" placeholder="Filter tasks…" value={filter.q ?? ''} onChange={(e) => set('q', e.target.value)} aria-label="Filter tasks" />
      <Select className="h-9 w-40" value={filter.assignee ?? ''} onChange={(e) => set('assignee', e.target.value)} aria-label="Assignee">
        <option value="">Anyone</option>
        <option value="me">Assigned to me</option>
        <option value="none">Unassigned</option>
        {board.people.filter(Boolean).map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </Select>
      <Select className="h-9 w-36" value={filter.priority ?? ''} onChange={(e) => set('priority', e.target.value)} aria-label="Priority">
        <option value="">Any priority</option>
        {PRIORITIES.map((p) => (
          <option key={p} value={p}>
            {p.toLowerCase()}
          </option>
        ))}
      </Select>
      <Select className="h-9 w-40" value={filter.sprint ?? ''} onChange={(e) => set('sprint', e.target.value)} aria-label="Sprint">
        <option value="">All sprints</option>
        <option value="active">Active sprint</option>
        <option value="backlog">Backlog</option>
        {board.sprints.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </Select>
      {board.labels.length > 0 && (
        <Select className="h-9 w-36" value={filter.label ?? ''} onChange={(e) => set('label', e.target.value)} aria-label="Label">
          <option value="">Any label</option>
          {board.labels.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </Select>
      )}
      {Object.values(filter).some(Boolean) && (
        <Button variant="ghost" size="sm" onClick={() => setFilter({})}>
          Clear
        </Button>
      )}
    </div>
  )
}

function ColumnView({ col, board, tasks, onOpen, onMove }: { col: BoardColumn; board: Board; tasks: TaskCard[]; onOpen: (id: string) => void; onMove: (t: TaskCard, columnId: string, index: number) => void }) {
  const [over, setOver] = useState<number | null>(null)
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const create = useAction(() => taskApi.create({ boardId: board.id, columnId: col.id, title: title.trim(), ...(board.activeSprint ? { sprintId: board.activeSprint.id } : {}) }), {
    invalidate: [['board', board.id]],
    onDone: () => setTitle(''),
  })
  const full = col.wipLimit !== null && col.count >= col.wipLimit

  const drop = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setOver(null)
    const taskId = e.dataTransfer.getData('text/task')
    const task = board.tasks.find((t) => t.id === taskId)
    if (!task) return
    // dropping below itself in the same column: the slot it leaves shifts the index
    const current = tasks.findIndex((t) => t.id === taskId)
    const target = current !== -1 && current < index ? index - 1 : index
    if (task.columnId === col.id && current === target) return
    onMove(task, col.id, target)
  }

  return (
    <section
      aria-label={col.name}
      className={cn('flex w-72 shrink-0 flex-col rounded-lg bg-muted/50', over !== null && 'ring-2 ring-primary/40')}
      onDragOver={(e) => {
        if (!board.access.write) return
        e.preventDefault()
        if (over === null) setOver(tasks.length)
      }}
      onDragLeave={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setOver(null)}
      onDrop={(e) => drop(e, over ?? tasks.length)}
    >
      <header className="flex items-center gap-2 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: col.color ?? '#6b7280' }} />
        <h2 className="text-sm font-semibold">{col.name}</h2>
        <span className={cn('text-xs', full ? 'font-semibold text-red-600' : 'text-muted-foreground')}>
          {col.count}
          {col.wipLimit !== null && ` / ${col.wipLimit}`}
        </span>
        {board.access.write && (
          <button className="ml-auto rounded p-1 text-muted-foreground hover:bg-accent" aria-label={`Add task to ${col.name}`} onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" />
          </button>
        )}
      </header>
      <div className="flex-1 space-y-2 overflow-y-auto px-2 pb-2">
        {adding && (
          <form onSubmit={(e) => (e.preventDefault(), title.trim() && create.mutate(undefined))}>
            <Input autoFocus placeholder="Task title" value={title} onChange={(e) => setTitle(e.target.value)} onBlur={() => !title && setAdding(false)} onKeyDown={(e) => e.key === 'Escape' && setAdding(false)} maxLength={200} aria-label="New task title" />
          </form>
        )}
        {tasks.map((t, i) => (
          <div
            key={t.id}
            onDragOver={(e) => {
              if (!board.access.write) return
              e.preventDefault()
              e.stopPropagation()
              const r = e.currentTarget.getBoundingClientRect()
              setOver(e.clientY < r.top + r.height / 2 ? i : i + 1)
            }}
            onDrop={(e) => (e.stopPropagation(), drop(e, over ?? i))}
          >
            {over === i && <div className="mb-2 h-1 rounded bg-primary" />}
            <Card t={t} draggable={board.access.write} onOpen={() => onOpen(t.id)} />
            {over === tasks.length && i === tasks.length - 1 && <div className="mt-2 h-1 rounded bg-primary" />}
          </div>
        ))}
        {tasks.length === 0 && over !== null && <div className="h-1 rounded bg-primary" />}
      </div>
    </section>
  )
}

function Card({ t, draggable, onOpen }: { t: TaskCard; draggable: boolean; onOpen: () => void }) {
  return (
    <button
      draggable={draggable}
      onDragStart={(e) => {
        e.dataTransfer.setData('text/task', t.id)
        e.dataTransfer.effectAllowed = 'move'
      }}
      onClick={onOpen}
      className="block w-full rounded-md border bg-background p-3 text-left shadow-sm transition-shadow hover:shadow-md"
    >
      {t.labels.length > 0 && (
        <div className="mb-1.5 flex flex-wrap gap-1">
          {t.labels.map((l) => (
            <span key={l.id} className="h-1.5 w-8 rounded-full" style={{ backgroundColor: l.color }} title={l.name} />
          ))}
        </div>
      )}
      <p className="text-sm font-medium">{t.title}</p>
      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        <span className="font-mono">{t.key}</span>
        <span className={cn('font-semibold', priorityColor[t.priority as Priority])} title={`${t.priority.toLowerCase()} priority`}>
          {t.priority === 'HIGHEST' ? '⇈' : t.priority === 'HIGH' ? '↑' : t.priority === 'MEDIUM' ? '=' : t.priority === 'LOW' ? '↓' : '⇊'}
        </span>
        {t.type !== 'TASK' && <span>{t.type.toLowerCase()}</span>}
        {t.points !== null && <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">{t.points}</Badge>}
        {t.comments > 0 && (
          <span className="flex items-center gap-0.5">
            <MessageSquare className="h-3 w-3" />
            {t.comments}
          </span>
        )}
        {t.attachments > 0 && (
          <span className="flex items-center gap-0.5">
            <Paperclip className="h-3 w-3" />
            {t.attachments}
          </span>
        )}
        {t.subtasks > 0 && (
          <span>
            {t.subtasksDone}/{t.subtasks}
          </span>
        )}
        {t.dueDate && <span className={t.overdue ? 'font-semibold text-red-600' : ''}>{new Date(t.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>}
        {t.assignee && <UserAvatar name={t.assignee.name} src={t.assignee.avatar} className="ml-auto h-6 w-6" />}
      </div>
    </button>
  )
}

function Sprints({ board }: { board: Board }) {
  const keys = [['board', board.id]]
  const [name, setName] = useState(`Sprint ${board.sprints.length + 1}`)
  const [goal, setGoal] = useState('')
  const today = new Date().toISOString().slice(0, 10)
  const [start, setStart] = useState(today)
  const [end, setEnd] = useState(new Date(Date.now() + 13 * 86_400_000).toISOString().slice(0, 10))
  const [chart, setChart] = useState<string | null>(board.activeSprint?.id ?? null)
  const create = useAction(() => boardApi.addSprint(board.id, { name, goal: goal || undefined, startDate: new Date(start).toISOString(), endDate: new Date(`${end}T23:59:59`).toISOString() }), { success: 'Sprint planned', invalidate: keys })
  const startSprint = useAction(boardApi.startSprint, { success: 'Sprint started', invalidate: keys })
  const complete = useAction((sprintId: string) => boardApi.completeSprint(sprintId, 'backlog'), { success: 'Sprint completed; unfinished work moved to the backlog', invalidate: keys })
  const burndown = useQuery({ queryKey: ['burndown', chart], queryFn: () => boardApi.burndown(chart!), enabled: Boolean(chart) })

  return (
    <div className="space-y-6">
      <Table head={['Sprint', 'Dates', 'Status', '']} empty={board.sprints.length === 0}>
        {board.sprints.map((s) => (
          <tr key={s.id}>
            <td className="px-3 py-2">
              <p className="font-medium">{s.name}</p>
              {s.goal && <p className="text-xs text-muted-foreground">{s.goal}</p>}
            </td>
            <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
              {new Date(s.startDate).toLocaleDateString()} – {new Date(s.endDate).toLocaleDateString()}
            </td>
            <td className="px-3 py-2">
              <Badge variant={s.status === 'ACTIVE' ? 'default' : 'outline'}>{s.status.toLowerCase()}</Badge>
            </td>
            <td className="space-x-1 whitespace-nowrap px-3 py-2 text-right">
              <Button variant="ghost" size="sm" onClick={() => setChart(s.id)}>
                Burndown
              </Button>
              {board.access.admin && s.status === 'PLANNED' && !board.activeSprint && (
                <Button size="sm" variant="outline" onClick={() => startSprint.mutate(s.id)}>
                  Start
                </Button>
              )}
              {board.access.admin && s.status === 'ACTIVE' && (
                <Button size="sm" variant="outline" onClick={() => confirm('Complete this sprint? Unfinished tasks go back to the backlog.') && complete.mutate(s.id)}>
                  Complete
                </Button>
              )}
            </td>
          </tr>
        ))}
      </Table>

      {chart && burndown.data && (
        <div>
          <p className="mb-2 text-sm font-medium">
            {burndown.data.sprint.name}: {burndown.data.totalPoints} points
          </p>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={burndown.data.series}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="ideal" stroke="#94a3b8" strokeDasharray="5 5" dot={false} name="Ideal" />
                <Line type="monotone" dataKey="remaining" stroke="#3b82f6" connectNulls={false} name="Remaining" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {burndown.data.note && <p className="text-xs text-muted-foreground">{burndown.data.note}</p>}
        </div>
      )}

      {board.access.admin && (
        <form className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2" onSubmit={(e) => (e.preventDefault(), create.mutate(undefined))}>
          <p className="font-medium sm:col-span-2">Plan a sprint</p>
          <Field label="Name" htmlFor="s-name">
            <Input id="s-name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={80} />
          </Field>
          <Field label="Goal" htmlFor="s-goal">
            <Input id="s-goal" value={goal} onChange={(e) => setGoal(e.target.value)} maxLength={300} />
          </Field>
          <Field label="Start" htmlFor="s-start">
            <Input id="s-start" type="date" value={start} onChange={(e) => setStart(e.target.value)} required />
          </Field>
          <Field label="End" htmlFor="s-end">
            <Input id="s-end" type="date" value={end} min={start} onChange={(e) => setEnd(e.target.value)} required />
          </Field>
          <Button type="submit" className="sm:col-span-2 sm:w-fit" disabled={create.isPending}>
            Plan sprint
          </Button>
        </form>
      )}
    </div>
  )
}

function Insights({ board }: { board: Board }) {
  const q = useQuery({ queryKey: ['board-analytics', board.id], queryFn: () => boardApi.analytics(board.id) })
  if (q.isLoading) return <Loading />
  if (q.error || !q.data) return <ErrorBox error={q.error} />
  const a = q.data
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="Overdue" value={a.overdue ?? 0} />
        <Stat label="Points done" value={`${a.points?.done ?? 0} / ${a.points?.total ?? 0}`} />
        <Stat label="Avg cycle time" value={a.averageCycleDays !== null && a.averageCycleDays !== undefined ? `${a.averageCycleDays} d` : '—'} />
        <Stat label="Tasks" value={Object.values((a.byStatus ?? {}) as Record<string, number>).reduce((n, v) => n + v, 0)} />
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <Breakdown title="By status" data={a.byStatus ?? {}} />
        <Breakdown title="By priority" data={a.byPriority ?? {}} />
      </div>
      <Table head={['Column', 'Tasks', 'WIP limit']}>
        {(a.columns ?? []).map((c: { id: string; name: string; tasks: number; wipLimit: number | null; overLimit: boolean }) => (
          <tr key={c.id}>
            <td className="px-3 py-2">{c.name}</td>
            <td className={cn('px-3 py-2', c.overLimit && 'font-semibold text-red-600')}>{c.tasks}</td>
            <td className="px-3 py-2">{c.wipLimit ?? '—'}</td>
          </tr>
        ))}
      </Table>
    </div>
  )
}

function Breakdown({ title, data }: { title: string; data: Record<string, number> }) {
  const total = Object.values(data).reduce((n, v) => n + v, 0) || 1
  return (
    <div>
      <p className="mb-2 text-sm font-medium">{title}</p>
      <ul className="space-y-1.5">
        {Object.entries(data).map(([k, v]) => (
          <li key={k} className="text-xs">
            <div className="flex justify-between">
              <span>{k.toLowerCase().replace(/_/g, ' ')}</span>
              <span>{v}</span>
            </div>
            <div className="mt-0.5 h-1.5 rounded bg-muted">
              <div className="h-1.5 rounded bg-primary" style={{ width: `${(v / total) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function BoardSettings({ board, onDeleted }: { board: Board; onDeleted: () => void }) {
  const keys = [['board', board.id]]
  const [name, setName] = useState(board.name)
  const [colName, setColName] = useState('')
  const [labelName, setLabelName] = useState('')
  const [labelColor, setLabelColor] = useState('#3b82f6')
  const [epicName, setEpicName] = useState('')
  const order = useMemo(() => board.columns.map((c) => c.id), [board.columns])

  const rename = useAction(() => boardApi.update(board.id, { name }), { success: 'Board renamed', invalidate: keys })
  const archive = useAction(() => boardApi.update(board.id, { archived: true }), { success: 'Board archived', onDone: onDeleted })
  const remove = useAction(() => boardApi.remove(board.id), { success: 'Board deleted', onDone: onDeleted })
  const addCol = useAction(() => boardApi.addColumn(board.id, { name: colName }), { invalidate: keys, onDone: () => setColName('') })
  const updateCol = useAction(({ id, body }: { id: string; body: Parameters<typeof boardApi.updateColumn>[1] }) => boardApi.updateColumn(id, body), { invalidate: keys })
  const deleteCol = useAction(({ id, moveTo }: { id: string; moveTo?: string }) => boardApi.deleteColumn(id, moveTo), { success: 'Column removed', invalidate: keys })
  const reorder = useAction((ids: string[]) => boardApi.reorderColumns(board.id, ids), { invalidate: keys })
  const addLabel = useAction(() => boardApi.addLabel(board.id, labelName, labelColor), { invalidate: keys, onDone: () => setLabelName('') })
  const deleteLabel = useAction(boardApi.deleteLabel, { invalidate: keys })
  const addEpic = useAction(() => boardApi.addEpic(board.id, epicName), { invalidate: keys, onDone: () => setEpicName('') })
  const deleteEpic = useAction(boardApi.deleteEpic, { invalidate: keys })

  const shift = (i: number, d: -1 | 1) => {
    const next = [...order]
    ;[next[i], next[i + d]] = [next[i + d], next[i]]
    reorder.mutate(next)
  }

  return (
    <div className="space-y-8">
      <form className="flex gap-2" onSubmit={(e) => (e.preventDefault(), rename.mutate(undefined))}>
        <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} aria-label="Board name" />
        <Button type="submit" variant="outline">
          Rename
        </Button>
      </form>

      <section>
        <h3 className="mb-2 font-semibold">Columns</h3>
        <Table head={['Name', 'Kind', 'WIP limit', '']}>
          {board.columns.map((c, i) => (
            <tr key={c.id}>
              <td className="px-3 py-2">
                <Input className="h-8" defaultValue={c.name} onBlur={(e) => e.target.value.trim() && e.target.value !== c.name && updateCol.mutate({ id: c.id, body: { name: e.target.value.trim() } })} aria-label="Column name" />
              </td>
              <td className="px-3 py-2">
                <Select className="h-8" value={c.status} onChange={(e) => updateCol.mutate({ id: c.id, body: { status: e.target.value } })} aria-label="Column kind">
                  <option value="TODO">To do</option>
                  <option value="IN_PROGRESS">In progress</option>
                  <option value="IN_REVIEW">In review</option>
                  <option value="DONE">Done</option>
                </Select>
              </td>
              <td className="px-3 py-2">
                <Input className="h-8 w-20" type="number" min={1} defaultValue={c.wipLimit ?? ''} onBlur={(e) => updateCol.mutate({ id: c.id, body: { wipLimit: e.target.value ? Number(e.target.value) : null } })} aria-label="WIP limit" />
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-right">
                <Button variant="ghost" size="icon" disabled={i === 0} onClick={() => shift(i, -1)} aria-label="Move left">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" disabled={i === board.columns.length - 1} onClick={() => shift(i, 1)} aria-label="Move right">
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Delete ${c.name}`}
                  onClick={() => {
                    if (board.columns.length <= 1) return
                    const other = board.columns.find((x) => x.id !== c.id)!
                    if (confirm(`Delete "${c.name}"? Its tasks move to "${other.name}".`)) deleteCol.mutate({ id: c.id, moveTo: other.id })
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </Table>
        <form className="mt-2 flex gap-2" onSubmit={(e) => (e.preventDefault(), colName.trim() && addCol.mutate(undefined))}>
          <Input className="max-w-xs" placeholder="New column" value={colName} onChange={(e) => setColName(e.target.value)} maxLength={40} aria-label="New column name" />
          <Button type="submit" variant="outline">
            Add column
          </Button>
        </form>
      </section>

      <section>
        <h3 className="mb-2 font-semibold">Labels</h3>
        <div className="mb-2 flex flex-wrap gap-1.5">
          {board.labels.map((l) => (
            <span key={l.id} className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs text-white" style={{ backgroundColor: l.color }}>
              {l.name}
              <button onClick={() => deleteLabel.mutate(l.id)} aria-label={`Delete label ${l.name}`}>
                ✕
              </button>
            </span>
          ))}
        </div>
        <form className="flex gap-2" onSubmit={(e) => (e.preventDefault(), labelName.trim() && addLabel.mutate(undefined))}>
          <Input className="max-w-xs" placeholder="Label name" value={labelName} onChange={(e) => setLabelName(e.target.value)} maxLength={30} aria-label="Label name" />
          <input type="color" value={labelColor} onChange={(e) => setLabelColor(e.target.value)} className="h-10 w-12 rounded border" aria-label="Label color" />
          <Button type="submit" variant="outline">
            Add label
          </Button>
        </form>
      </section>

      <section>
        <h3 className="mb-2 font-semibold">Epics</h3>
        <ul className="mb-2 space-y-1 text-sm">
          {board.epics.map((ep) => (
            <li key={ep.id} className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ep.color ?? '#8b5cf6' }} />
              {ep.name}
              <button className="ml-auto text-muted-foreground hover:text-red-600" onClick={() => deleteEpic.mutate(ep.id)} aria-label={`Delete epic ${ep.name}`}>
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
        <form className="flex gap-2" onSubmit={(e) => (e.preventDefault(), epicName.trim() && addEpic.mutate(undefined))}>
          <Input className="max-w-xs" placeholder="Epic name" value={epicName} onChange={(e) => setEpicName(e.target.value)} maxLength={80} aria-label="Epic name" />
          <Button type="submit" variant="outline">
            Add epic
          </Button>
        </form>
      </section>

      <section className="flex gap-2 border-t pt-4">
        <Button variant="outline" onClick={() => confirm('Archive this board?') && archive.mutate(undefined)}>
          Archive board
        </Button>
        <Button variant="destructive" onClick={() => prompt(`Type "${board.name}" to delete this board and all its tasks`) === board.name && remove.mutate(undefined)}>
          Delete board
        </Button>
      </section>
    </div>
  )
}
