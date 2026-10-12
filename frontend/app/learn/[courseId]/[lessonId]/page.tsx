'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Award, BookOpen, CheckCircle2, ChevronLeft, ChevronRight, Circle, FileText, HelpCircle, Menu, PlayCircle, X } from 'lucide-react'
import { apiErrorMessage, learnApi, type LessonType } from '../../../../lib/api'
import { cn, formatDuration } from '../../../../lib/utils'
import { DiscussionPanel } from '../../../../components/discussion-panel'
import { Markdown } from '../../../../components/markdown'
import { Quiz } from '../../../../components/quiz'
import { RequireAuth } from '../../../../components/require-auth'
import { ErrorBox, Loading } from '../../../../components/state'
import { useToast } from '../../../../components/toast'
import { Button, ButtonLink } from '../../../../components/ui/button'
import { Progress } from '../../../../components/ui/progress'

const icon: Record<LessonType, typeof FileText> = { ARTICLE: FileText, VIDEO: PlayCircle, QUIZ: HelpCircle, EXERCISE: BookOpen }

/** Turns a YouTube / Vimeo watch URL into an embeddable one; returns null for anything else. */
function embedUrl(url: string): string | null {
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\./, '')
    if (host === 'youtube.com' && u.searchParams.get('v')) return `https://www.youtube.com/embed/${u.searchParams.get('v')}`
    if (host === 'youtu.be') return `https://www.youtube.com/embed${u.pathname}`
    if (host === 'vimeo.com') return `https://player.vimeo.com/video${u.pathname}`
  } catch {
    /* not a URL */
  }
  return null
}

function VideoPlayer({ url }: { url: string }) {
  const embed = embedUrl(url)
  if (embed) {
    return (
      <div className="aspect-video overflow-hidden rounded-lg bg-black">
        <iframe src={embed} title="Lesson video" className="h-full w-full" allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowFullScreen />
      </div>
    )
  }
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(url)) {
    return <video src={url} controls className="aspect-video w-full rounded-lg bg-black" />
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
      Open the video in a new tab
    </a>
  )
}

function Player() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>()
  const router = useRouter()
  const qc = useQueryClient()
  const toast = useToast()
  const [tab, setTab] = useState<'lesson' | 'discussion'>('lesson')
  const [sidebar, setSidebar] = useState(false)
  const [certificateId, setCertificateId] = useState<string | null>(null)

  const outline = useQuery({ queryKey: ['outline', courseId], queryFn: () => learnApi.outline(courseId) })
  const lesson = useQuery({ queryKey: ['lesson', lessonId], queryFn: () => learnApi.lesson(lessonId) })

  const refreshProgress = () => {
    qc.invalidateQueries({ queryKey: ['outline', courseId] })
    qc.invalidateQueries({ queryKey: ['lesson', lessonId] })
    qc.invalidateQueries({ queryKey: ['dashboard'] })
  }

  const complete = useMutation({
    mutationFn: () => learnApi.complete(Number(lessonId)),
    onSuccess: (p) => {
      refreshProgress()
      if (p.certificateId) {
        setCertificateId(p.certificateId)
        toast.success('Course complete! Your certificate is ready.')
      } else if (lesson.data?.nextLessonId) {
        router.push(`/learn/${courseId}/${lesson.data.nextLessonId}`)
      }
    },
    onError: (e) => toast.error(apiErrorMessage(e)),
  })
  const undo = useMutation({ mutationFn: () => learnApi.uncomplete(Number(lessonId)), onSuccess: refreshProgress, onError: (e) => toast.error(apiErrorMessage(e)) })

  if (outline.isError) return <ErrorBox error={outline.error} onRetry={() => outline.refetch()} />
  if (outline.isLoading) return <Loading />
  const o = outline.data!
  const completed = new Set(o.progress.completedLessonIds)

  const sidebarContent = (
    <nav aria-label="Course outline" className="space-y-4">
      {o.modules.map((m) => (
        <div key={m.id}>
          <p className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{m.title}</p>
          <ul className="mt-1">
            {m.lessons.map((l) => {
              const Icon = icon[l.type]
              const current = String(l.id) === lessonId
              return (
                <li key={l.id}>
                  <Link
                    href={`/learn/${courseId}/${l.id}`}
                    onClick={() => setSidebar(false)}
                    className={cn('flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent', current && 'bg-accent font-medium')}
                    aria-current={current ? 'page' : undefined}
                  >
                    {completed.has(l.id) ? <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" /> : <Circle className="h-4 w-4 shrink-0 text-muted-foreground/50" />}
                    <span className="flex-1">{l.title}</span>
                    <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center gap-3 border-b px-4 py-3">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebar(true)} aria-label="Open course outline">
          <Menu className="h-5 w-5" />
        </Button>
        <Link href={`/courses/${courseId}`} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Course page</span>
        </Link>
        <h1 className="flex-1 truncate text-center font-semibold">{o.title}</h1>
        <div className="hidden w-48 items-center gap-2 sm:flex">
          <Progress value={o.progress.percent} />
          <span className="text-xs text-muted-foreground">{o.progress.percent}%</span>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-80 shrink-0 overflow-y-auto border-r p-3 lg:block">{sidebarContent}</aside>

        {sidebar && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div className="w-80 max-w-[85%] overflow-y-auto bg-background p-3 shadow-xl">
              <div className="mb-2 flex justify-end">
                <Button variant="ghost" size="icon" onClick={() => setSidebar(false)} aria-label="Close outline">
                  <X className="h-5 w-5" />
                </Button>
              </div>
              {sidebarContent}
            </div>
            <button className="flex-1 bg-black/50" onClick={() => setSidebar(false)} aria-label="Close outline" />
          </div>
        )}

        <main className="min-w-0 flex-1 overflow-y-auto">
          {lesson.isLoading ? (
            <Loading />
          ) : lesson.isError ? (
            <ErrorBox error={lesson.error} onRetry={() => lesson.refetch()} />
          ) : (
            (() => {
              const l = lesson.data!
              const done = completed.has(l.id)
              const staffPreview = o.preview
              return (
                <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
                  <div>
                    <p className="text-sm text-muted-foreground">{l.module.title} · {formatDuration(l.durationMin)}</p>
                    <h2 className="mt-1 text-3xl font-bold">{l.title}</h2>
                  </div>

                  <div className="flex gap-1 border-b">
                    {(['lesson', 'discussion'] as const).map((t) => (
                      <button key={t} onClick={() => setTab(t)} className={cn('border-b-2 px-4 py-2 text-sm font-medium capitalize', tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-muted-foreground hover:text-foreground')}>
                        {t === 'lesson' ? 'Lesson' : 'Questions & answers'}
                      </button>
                    ))}
                  </div>

                  {tab === 'discussion' ? (
                    <DiscussionPanel courseId={Number(courseId)} lessonId={l.id} isInstructor={o.preview} />
                  ) : (
                    <>
                      {l.videoUrl && <VideoPlayer url={l.videoUrl} />}
                      {l.type === 'QUIZ' ? (
                        l.questions.length ? (
                          <Quiz key={l.id} lesson={l} onPassed={(r) => {
                            refreshProgress()
                            if (r.progress?.certificateId) setCertificateId(r.progress.certificateId)
                          }} />
                        ) : (
                          <p className="text-muted-foreground">This quiz has no questions yet.</p>
                        )
                      ) : l.content ? (
                        <Markdown>{l.content}</Markdown>
                      ) : !l.videoUrl ? (
                        <p className="text-muted-foreground">No content has been added to this lesson yet.</p>
                      ) : null}

                      {certificateId && (
                        <div className="flex items-center gap-4 rounded-lg border border-yellow-400 bg-yellow-50 p-4 dark:bg-yellow-950/30">
                          <Award className="h-10 w-10 text-yellow-600" />
                          <div className="flex-1">
                            <p className="font-semibold">You finished the course!</p>
                            <p className="text-sm text-muted-foreground">Your certificate has been issued.</p>
                          </div>
                          <ButtonLink href={`/certificates/${certificateId}`}>View certificate</ButtonLink>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-6">
                        <Button variant="outline" disabled={!l.prevLessonId} onClick={() => router.push(`/learn/${courseId}/${l.prevLessonId}`)}>
                          <ChevronLeft className="mr-1 h-4 w-4" />Previous
                        </Button>

                        {l.type !== 'QUIZ' && !staffPreview && (
                          done ? (
                            <Button variant="ghost" onClick={() => undo.mutate()} disabled={undo.isPending}>
                              <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />Completed (undo)
                            </Button>
                          ) : (
                            <Button onClick={() => complete.mutate()} disabled={complete.isPending}>
                              {complete.isPending ? 'Saving…' : l.nextLessonId ? 'Mark complete & continue' : 'Mark complete'}
                            </Button>
                          )
                        )}

                        <Button variant="outline" disabled={!l.nextLessonId} onClick={() => router.push(`/learn/${courseId}/${l.nextLessonId}`)}>
                          Next<ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )
            })()
          )}
        </main>
      </div>
    </div>
  )
}

export default function LessonPage() {
  return (
    <RequireAuth>
      <Player />
    </RequireAuth>
  )
}
