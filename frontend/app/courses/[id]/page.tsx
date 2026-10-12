'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BookOpen, CheckCircle2, Clock, FileText, HelpCircle, PlayCircle, Star, Users } from 'lucide-react'
import { apiErrorMessage, courseApi, paymentApi, type LessonType } from '../../../lib/api'
import { useAuthStore } from '../../../lib/store/authStore'
import { cn, formatDuration, formatPrice, timeAgo } from '../../../lib/utils'
import { ErrorBox, Loading } from '../../../components/state'
import { useToast } from '../../../components/toast'
import { Badge } from '../../../components/ui/badge'
import { Button, ButtonLink } from '../../../components/ui/button'
import { Card, CardContent } from '../../../components/ui/card'
import { Progress } from '../../../components/ui/progress'
import { Textarea } from '../../../components/ui/textarea'
import { UserAvatar } from '../../../components/user-avatar'

const lessonIcon: Record<LessonType, typeof FileText> = { ARTICLE: FileText, VIDEO: PlayCircle, QUIZ: HelpCircle, EXERCISE: BookOpen }

function Stars({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <span className="inline-flex" role={onChange ? 'radiogroup' : undefined} aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}
        >
          <Star className={cn('h-5 w-5', n <= Math.round(value) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/40')} />
        </button>
      ))}
    </span>
  )
}

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const pathname = usePathname()
  const search = useSearchParams()
  const qc = useQueryClient()
  const toast = useToast()
  const user = useAuthStore((s) => s.user)
  const initialized = useAuthStore((s) => s.initialized)

  const course = useQuery({ queryKey: ['course', id, user?.id], queryFn: () => courseApi.get(id), enabled: initialized })
  const reviews = useQuery({ queryKey: ['reviews', id], queryFn: () => courseApi.reviews(Number(id)) })

  // Returning from Stripe Checkout: confirm the payment, then refresh the page state
  const handled = useRef(false)
  useEffect(() => {
    const payment = search.get('payment')
    if (!payment || handled.current || !user) return
    handled.current = true
    if (payment === 'cancelled') toast.info('Checkout cancelled. You have not been charged.')
    const sessionId = search.get('session_id')
    if (payment === 'success' && sessionId) {
      paymentApi
        .confirm(sessionId)
        .then((r) => (r.paid ? toast.success('Payment received. You are enrolled!') : toast.info('Payment is still processing. Refresh in a moment.')))
        .catch((e) => toast.error(apiErrorMessage(e, 'Could not confirm the payment')))
        .finally(() => {
          qc.invalidateQueries({ queryKey: ['course', id] })
          router.replace(pathname)
        })
    } else {
      router.replace(pathname)
    }
  }, [search, user, id, qc, router, pathname, toast])

  const enroll = useMutation({
    mutationFn: () => courseApi.enroll(Number(id)),
    onSuccess: () => {
      toast.success('You are enrolled')
      qc.invalidateQueries({ queryKey: ['course', id] })
      router.push(`/learn/${id}`)
    },
    onError: (e) => toast.error(apiErrorMessage(e)),
  })
  const buy = useMutation({
    mutationFn: () => paymentApi.checkout(Number(id)),
    onSuccess: ({ url }) => {
      window.location.href = url
    },
    onError: (e) => toast.error(apiErrorMessage(e)),
  })
  const leave = useMutation({
    mutationFn: () => courseApi.leave(Number(id)),
    onSuccess: () => {
      toast.success('You left the course')
      qc.invalidateQueries({ queryKey: ['course', id] })
    },
    onError: (e) => toast.error(apiErrorMessage(e)),
  })

  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const review = useMutation({
    mutationFn: () => courseApi.review(Number(id), rating, comment),
    onSuccess: () => {
      toast.success('Thanks for your review')
      setComment('')
      qc.invalidateQueries({ queryKey: ['reviews', id] })
      qc.invalidateQueries({ queryKey: ['course', id] })
    },
    onError: (e) => toast.error(apiErrorMessage(e)),
  })

  if (course.isLoading || !initialized) return <Loading />
  if (course.isError) return <ErrorBox error={course.error} onRetry={() => course.refetch()} />
  const c = course.data!
  const { enrolled, completed, progress } = c.enrollment
  const signInHref = `/login?next=${encodeURIComponent(`/courses/${id}`)}`

  return (
    <div>
      <section className="bg-gradient-to-br from-slate-900 to-indigo-900 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-[1fr_22rem]">
          <div>
            <Badge className="bg-white/15 text-white">{c.category}</Badge>
            <h1 className="mt-3 text-3xl font-bold md:text-4xl">{c.title}</h1>
            <p className="mt-3 max-w-2xl text-slate-200">{c.description}</p>
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-200">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                {c.ratingCount ? `${c.rating.toFixed(1)} (${c.ratingCount} reviews)` : 'No reviews yet'}
              </span>
              <span className="flex items-center gap-1"><Users className="h-4 w-4" />{c.students} students</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{formatDuration(c.totalMinutes)}</span>
              <span>{c.lessonCount} lessons</span>
              <span className="capitalize">{c.level.toLowerCase()}</span>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <UserAvatar name={c.instructor.name} src={c.instructor.avatar} />
              <span className="text-sm">Taught by <strong>{c.instructor.name}</strong></span>
            </div>
            {!c.published && <p className="mt-4 inline-block rounded bg-yellow-400/20 px-3 py-1 text-sm text-yellow-200">Draft: only you can see this page</p>}
          </div>

          <Card className="h-fit text-foreground">
            <CardContent className="space-y-4 p-6">
              <p className="text-3xl font-bold">{formatPrice(c.price)}</p>

              {c.isOwner ? (
                <ButtonLink href={`/instructor/courses/${c.id}`} className="w-full">Edit in studio</ButtonLink>
              ) : enrolled ? (
                <>
                  <div className="space-y-1">
                    <Progress value={progress?.percent ?? 0} />
                    <p className="text-xs text-muted-foreground">{progress?.completedLessons}/{progress?.totalLessons} lessons · {progress?.percent}%</p>
                  </div>
                  <ButtonLink href={`/learn/${c.id}`} className="w-full">{completed ? 'Review course' : progress && progress.completedLessons > 0 ? 'Continue learning' : 'Start learning'}</ButtonLink>
                  {c.price === 0 && !completed && (
                    <button className="w-full text-center text-xs text-muted-foreground hover:underline" onClick={() => confirm('Leave this course?') && leave.mutate()}>
                      Leave course
                    </button>
                  )}
                </>
              ) : !user ? (
                <ButtonLink href={signInHref} className="w-full">{c.price > 0 ? 'Sign in to buy' : 'Sign in to enroll'}</ButtonLink>
              ) : c.price > 0 ? (
                <Button className="w-full" onClick={() => buy.mutate()} disabled={buy.isPending}>
                  {buy.isPending ? 'Redirecting to checkout…' : `Buy for ${formatPrice(c.price)}`}
                </Button>
              ) : (
                <Button className="w-full" onClick={() => enroll.mutate()} disabled={enroll.isPending}>
                  {enroll.isPending ? 'Enrolling…' : 'Enroll for free'}
                </Button>
              )}

              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" />Lifetime access</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" />Quizzes with instant feedback</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-600" />Certificate on completion</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-10">
          <section>
            <h2 className="text-2xl font-bold">Curriculum</h2>
            <div className="mt-4 space-y-3">
              {c.modules.map((m, i) => (
                <details key={m.id} open={i === 0} className="rounded-lg border">
                  <summary className="flex cursor-pointer items-center justify-between px-4 py-3 font-medium">
                    <span>{m.title}</span>
                    <span className="text-xs font-normal text-muted-foreground">{m.lessons.length} lessons</span>
                  </summary>
                  <ul className="divide-y border-t">
                    {m.lessons.map((l) => {
                      const Icon = lessonIcon[l.type]
                      const done = progress?.completedLessonIds.includes(l.id)
                      return (
                        <li key={l.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                          {done ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Icon className="h-4 w-4 text-muted-foreground" />}
                          <span className="flex-1">{l.title}</span>
                          <span className="text-xs text-muted-foreground">{formatDuration(l.durationMin)}</span>
                        </li>
                      )
                    })}
                  </ul>
                </details>
              ))}
              {c.modules.length === 0 && <p className="text-sm text-muted-foreground">The instructor has not added lessons yet.</p>}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold">Instructor</h2>
            <div className="mt-4 flex gap-4">
              <UserAvatar name={c.instructor.name} src={c.instructor.avatar} className="h-14 w-14 text-lg" />
              <div>
                <p className="font-semibold">{c.instructor.name}</p>
                <p className="text-sm text-muted-foreground">{c.instructor.bio || 'No bio yet.'}</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold">Reviews</h2>

            {enrolled && !c.isOwner && (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  review.mutate()
                }}
                className="mt-4 space-y-3 rounded-lg border p-4"
              >
                <p className="text-sm font-medium">Rate this course</p>
                <Stars value={rating} onChange={setRating} />
                <Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share what you learned (optional)" maxLength={1000} />
                <Button type="submit" disabled={review.isPending}>{review.isPending ? 'Saving…' : 'Submit review'}</Button>
              </form>
            )}

            <div className="mt-4 space-y-4">
              {reviews.data?.map((r) => (
                <div key={r.id} className="flex gap-3 border-b pb-4">
                  <UserAvatar name={r.user.name} src={r.user.avatar} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{r.user.name}</span>
                      <Stars value={r.rating} />
                      <span className="text-xs text-muted-foreground">{timeAgo(r.createdAt)}</span>
                    </div>
                    {r.comment && <p className="mt-1 text-sm">{r.comment}</p>}
                  </div>
                </div>
              ))}
              {reviews.data?.length === 0 && <p className="text-sm text-muted-foreground">No reviews yet.</p>}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
