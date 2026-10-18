'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { KanbanSquare } from 'lucide-react'
import { boardApi, projectApi, rows, type BoardSummary, type Project, type TaskCard } from '../../lib/api/platform'
import { timeAgo } from '../../lib/utils'
import { PageHeader } from '../../components/kit'
import { RequireAuth } from '../../components/require-auth'
import { Empty, ErrorBox, Loading } from '../../components/state'
import { Badge } from '../../components/ui/badge'
import { ButtonLink } from '../../components/ui/button'
import { Card } from '../../components/ui/card'

interface Group {
  project: Project
  boards: BoardSummary[]
  mine: (TaskCard & { boardId: string; boardName: string })[]
}

/** Boards of every project I belong to, and the open tasks assigned to me on them. */
async function load(): Promise<Group[]> {
  const projects = rows(await projectApi.list({ scope: 'mine', pageSize: 50 }))
  return Promise.all(
    projects.map(async (project) => {
      const { boards } = await boardApi.list(project.id).catch(() => ({ boards: [] as BoardSummary[] }))
      const mine = (
        await Promise.all(
          boards.map((b) =>
            boardApi
              .get(b.id, { assignee: 'me' })
              .then((full) => full.tasks.filter((t) => t.status !== 'DONE').map((t) => ({ ...t, boardId: b.id, boardName: b.name })))
              .catch(() => [])
          )
        )
      ).flat()
      return { project, boards, mine }
    })
  )
}

export default function BoardsPage() {
  return (
    <RequireAuth>
      <Boards />
    </RequireAuth>
  )
}

function Boards() {
  const q = useQuery({ queryKey: ['my-boards'], queryFn: load })
  if (q.isLoading) return <Loading />
  if (q.error) return <ErrorBox error={q.error} onRetry={() => q.refetch()} />
  const groups = q.data!.filter((g) => g.boards.length > 0)
  const mine = q.data!.flatMap((g) => g.mine)

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <PageHeader title="Boards" description="Every board in your projects." actions={<ButtonLink href="/projects" variant="outline">Projects</ButtonLink>} />
      {mine.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 font-semibold">Assigned to me ({mine.length})</h2>
          <Card className="divide-y">
            {mine.slice(0, 20).map((t) => (
              <Link key={t.id} href={`/boards/${t.boardId}?task=${t.id}`} className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent">
                <span className="font-mono text-xs text-muted-foreground">{t.key}</span>
                <span className="flex-1 truncate">{t.title}</span>
                {t.overdue && <Badge variant="destructive">overdue</Badge>}
                <Badge variant="outline">{t.priority.toLowerCase()}</Badge>
                <span className="hidden text-xs text-muted-foreground sm:inline">{t.boardName}</span>
              </Link>
            ))}
          </Card>
        </section>
      )}
      {groups.length === 0 ? (
        <Empty title="No boards yet">Open a project and create a board from its Boards tab.</Empty>
      ) : (
        groups.map((g) => (
          <section key={g.project.id} className="mb-8">
            <h2 className="mb-3 font-semibold">
              <Link href={`/projects/${g.project.slug}`} className="hover:underline">
                {g.project.name}
              </Link>
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {g.boards.map((b) => (
                <Link key={b.id} href={`/boards/${b.id}`}>
                  <Card className="p-4 transition-shadow hover:shadow-md">
                    <div className="flex items-center gap-2">
                      <KanbanSquare className="h-5 w-5 text-primary" />
                      <h3 className="font-semibold">{b.name}</h3>
                      <Badge variant="outline" className="ml-auto">
                        {b.keyPrefix}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {b.tasks ?? 0} tasks{b.updatedAt && ` · updated ${timeAgo(b.updatedAt)}`}
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  )
}
