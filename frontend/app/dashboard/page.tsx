'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Award, BookOpen, CheckCircle2, Clock, Flame, GraduationCap } from 'lucide-react'
import { certificateApi, dashboardApi } from '../../lib/api'
import { useAuthStore } from '../../lib/store/authStore'
import { timeAgo } from '../../lib/utils'
import { RequireAuth } from '../../components/require-auth'
import { Empty, ErrorBox, Loading } from '../../components/state'
import { Badge } from '../../components/ui/badge'
import { Button, ButtonLink } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Progress } from '../../components/ui/progress'

function Content() {
  const user = useAuthStore((s) => s.user)!
  const dash = useQuery({ queryKey: ['dashboard'], queryFn: dashboardApi.get })
  const certs = useQuery({ queryKey: ['certificates'], queryFn: certificateApi.mine })

  if (dash.isLoading) return <Loading />
  if (dash.isError) return <ErrorBox error={dash.error} onRetry={() => dash.refetch()} />
  const { stats, courses, activity } = dash.data!

  const tiles = [
    { label: 'Enrolled courses', value: stats.enrolledCourses, icon: BookOpen },
    { label: 'Completed', value: stats.completedCourses, icon: CheckCircle2 },
    { label: 'Hours learned', value: stats.hoursLearned, icon: Clock },
    { label: 'Day streak', value: stats.streak, icon: Flame },
    { label: 'Certificates', value: stats.certificates, icon: Award },
  ]

  const inProgress = courses.filter((c) => !c.completed)
  const finished = courses.filter((c) => c.completed)

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-bold">Welcome back, {user.name.split(' ')[0]}</h1>
      <p className="mt-1 text-muted-foreground">Pick up where you left off.</p>

      {!user.isVerified && (
        <p className="mt-4 rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-900 dark:bg-yellow-950/30 dark:text-yellow-200">
          Please verify your email address. Check your inbox, or request a new link from your <Link href="/profile" className="underline">profile</Link>.
        </p>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-5">
        {tiles.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 p-4">
              <Icon className="h-6 w-6 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <section>
          <h2 className="text-xl font-semibold">Continue learning</h2>
          {courses.length === 0 ? (
            <div className="mt-4">
              <Empty title="You have not enrolled in any course yet">
                <ButtonLink href="/courses" className="mt-2">Browse courses</ButtonLink>
              </Empty>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {[...inProgress, ...finished].map((c) => (
                <Card key={c.id}>
                  <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{c.title}</h3>
                        {c.completed && <Badge>Completed</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{c.instructor} · {c.category} · last active {timeAgo(c.lastAccessed)}</p>
                      <div className="flex items-center gap-3">
                        <Progress value={c.progress} className="flex-1" />
                        <span className="w-24 text-right text-xs text-muted-foreground">{c.completedLessons}/{c.totalLessons} lessons</span>
                      </div>
                    </div>
                    <ButtonLink href={c.nextLessonId ? `/learn/${c.id}/${c.nextLessonId}` : `/learn/${c.id}`} variant={c.completed ? 'outline' : 'default'}>{c.completed ? 'Review' : c.completedLessons ? 'Continue' : 'Start'}</ButtonLink>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-lg">Recent activity</CardTitle></CardHeader>
            <CardContent>
              {activity.length === 0 ? (
                <p className="text-sm text-muted-foreground">Complete a lesson to see it here.</p>
              ) : (
                <ul className="space-y-3">
                  {activity.map((a, i) => (
                    <li key={i} className="text-sm">
                      <p>{a.action}</p>
                      <p className="text-xs text-muted-foreground">{a.course} · {timeAgo(a.timestamp)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><GraduationCap className="h-5 w-5" />Certificates</CardTitle></CardHeader>
            <CardContent>
              {!certs.data?.length ? (
                <p className="text-sm text-muted-foreground">Finish a course to earn your first certificate.</p>
              ) : (
                <ul className="space-y-2">
                  {certs.data.map((c) => (
                    <li key={c.id}>
                      <Link href={`/certificates/${c.id}`} className="text-sm text-blue-600 hover:underline">{c.courseTitle}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <Content />
    </RequireAuth>
  )
}
