'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { searchApi, type Hits, type SearchHit } from '../../lib/api/platform'
import { PageHeader, Tabs } from '../../components/kit'
import { Empty, ErrorBox, Loading } from '../../components/state'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { UserAvatar } from '../../components/user-avatar'

type Kind = 'all' | 'courses' | 'users' | 'projects'

export default function SearchPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SearchView />
    </Suspense>
  )
}

/** Elasticsearch highlights wrap matches in <em>; render them without trusting other markup. */
function Highlighted({ text }: { text: string }) {
  return (
    <>
      {text.split(/(<em>.*?<\/em>)/g).map((part, i) =>
        part.startsWith('<em>') ? (
          <mark key={i} className="bg-yellow-200 dark:bg-yellow-700">
            {part.slice(4, -5)}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

function SearchView() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const q = params.get('q') ?? ''
  const kind = (params.get('type') as Kind) || 'all'
  const page = Number(params.get('page') ?? 1)
  const [text, setText] = useState(q)
  const [debounced, setDebounced] = useState(q)
  useEffect(() => setText(q), [q])
  useEffect(() => {
    const t = setTimeout(() => setDebounced(text), 200)
    return () => clearTimeout(t)
  }, [text])

  const go = (next: { q?: string; type?: Kind; page?: number }) => {
    const sp = new URLSearchParams({ q: next.q ?? q, type: next.type ?? kind, page: String(next.page ?? 1) })
    router.push(`${pathname}?${sp}`)
  }

  const results = useQuery({ queryKey: ['search', q, kind, page], queryFn: () => searchApi.all(q, kind, page), enabled: q.trim().length > 0 })
  const suggest = useQuery({ queryKey: ['autocomplete', debounced], queryFn: () => searchApi.autocomplete(debounced), enabled: debounced.trim().length >= 2 && debounced !== q })
  const r = results.data

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <PageHeader title="Search" description="Courses, instructors and public projects." />
      <form className="relative mb-6" onSubmit={(e) => (e.preventDefault(), go({ q: text }))}>
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Try “react hooks” or “python for beginners”" value={text} onChange={(e) => setText(e.target.value)} aria-label="Search" autoFocus />
        {(suggest.data?.suggestions.length ?? 0) > 0 && text !== q && (
          <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border bg-background shadow-lg">
            {suggest.data!.suggestions.map((s) => (
              <li key={`${s.type}-${s.id}`}>
                <Link href={s.type === 'instructor' ? `/people/${s.id}` : s.url} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent">
                  <Badge variant="outline">{s.type}</Badge>
                  {s.label}
                  {s.hint && <span className="ml-auto text-xs text-muted-foreground">{s.hint}</span>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </form>

      {q && (
        <Tabs
          tabs={[
            { id: 'all', label: 'All' },
            { id: 'courses', label: `Courses${r?.courses ? ` (${r.courses.total})` : ''}` },
            { id: 'users', label: `Instructors${r?.instructors ? ` (${r.instructors.total})` : ''}` },
            { id: 'projects', label: `Projects${r?.projects ? ` (${r.projects.total})` : ''}` },
          ]}
          value={kind}
          onChange={(t) => go({ type: t })}
        />
      )}

      {!q ? (
        <Empty title="Type something to search" />
      ) : results.isLoading ? (
        <Loading />
      ) : results.error ? (
        <ErrorBox error={results.error} onRetry={() => results.refetch()} />
      ) : (
        <div className="space-y-8">
          {r?.didYouMean && (
            <p className="text-sm">
              Did you mean{' '}
              <button className="font-medium text-blue-600 hover:underline" onClick={() => go({ q: r.didYouMean! })}>
                {r.didYouMean}
              </button>
              ?
            </p>
          )}
          {(kind === 'all' || kind === 'courses') && r?.courses && <Section title="Courses" hits={r.courses} more={kind === 'all' ? () => go({ type: 'courses' }) : undefined} render={(h) => <CourseHit h={h} />} />}
          {(kind === 'all' || kind === 'users') && r?.instructors && <Section title="Instructors" hits={r.instructors} more={kind === 'all' ? () => go({ type: 'users' }) : undefined} render={(h) => <PersonHit h={h} />} />}
          {(kind === 'all' || kind === 'projects') && r?.projects && <Section title="Projects" hits={r.projects} more={kind === 'all' ? () => go({ type: 'projects' }) : undefined} render={(h) => <ProjectHit h={h} />} />}
          {kind !== 'all' && (
            <div className="flex justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => go({ page: page - 1 })}>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled={page * 20 >= (r?.courses?.total ?? r?.instructors?.total ?? r?.projects?.total ?? 0)} onClick={() => go({ page: page + 1 })}>
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Section({ title, hits, render, more }: { title: string; hits: Hits; render: (h: SearchHit) => React.ReactNode; more?: () => void }) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-semibold">{title}</h2>
        {more && hits.total > hits.data.length && (
          <button className="text-sm text-blue-600 hover:underline" onClick={more}>
            See all {hits.total}
          </button>
        )}
      </div>
      {hits.data.length === 0 ? <p className="text-sm text-muted-foreground">No matches</p> : <div className="space-y-2">{hits.data.map((h) => <div key={String(h.id)}>{render(h)}</div>)}</div>}
    </section>
  )
}

function CourseHit({ h }: { h: SearchHit }) {
  const snippet = h.highlight?.description?.[0] ?? h.highlight?.['lessons.title']?.[0]
  return (
    <Link href={`/courses/${h.id}`}>
      <Card className="p-4 hover:shadow-md">
        <p className="font-medium">{h.highlight?.title?.[0] ? <Highlighted text={h.highlight.title[0]} /> : h.title}</p>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{snippet ? <Highlighted text={snippet} /> : h.description}</p>
        <div className="mt-2 flex gap-2 text-xs text-muted-foreground">
          {h.category && <Badge variant="secondary">{h.category}</Badge>}
          {h.level && <span>{String(h.level).toLowerCase()}</span>}
          {typeof h.rating === 'number' && h.rating > 0 && <span>★ {h.rating.toFixed(1)}</span>}
          {typeof h.price === 'number' && <span>{h.price === 0 ? 'Free' : `$${h.price}`}</span>}
        </div>
      </Card>
    </Link>
  )
}

function PersonHit({ h }: { h: SearchHit }) {
  return (
    <Link href={`/people/${h.id}`} className="flex items-center gap-3 rounded-md border p-3 hover:bg-accent">
      <UserAvatar name={h.name ?? '?'} src={h.avatar} className="h-9 w-9" />
      <div>
        <p className="font-medium">{h.name}</p>
        {h.role && <p className="text-xs text-muted-foreground">{String(h.role).toLowerCase()}</p>}
      </div>
    </Link>
  )
}

function ProjectHit({ h }: { h: SearchHit }) {
  return (
    <Link href={`/projects/${h.slug ?? h.id}`}>
      <Card className="p-4 hover:shadow-md">
        <p className="font-medium">{h.name}</p>
        <p className="line-clamp-1 text-sm text-muted-foreground">{h.description}</p>
        {(h.tags ?? []).length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {h.tags!.slice(0, 5).map((t) => (
              <Badge key={t} variant="secondary">
                {t}
              </Badge>
            ))}
          </div>
        )}
      </Card>
    </Link>
  )
}
