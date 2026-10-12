'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { learnApi } from '../../../lib/api'
import { RequireAuth } from '../../../components/require-auth'
import { ErrorBox, Loading } from '../../../components/state'

function Redirect() {
  const { courseId } = useParams<{ courseId: string }>()
  const router = useRouter()
  const outline = useQuery({ queryKey: ['outline', courseId], queryFn: () => learnApi.outline(courseId) })

  useEffect(() => {
    if (!outline.data) return
    const first = outline.data.modules.flatMap((m) => m.lessons)[0]
    const target = outline.data.progress.nextLessonId ?? first?.id
    if (target) router.replace(`/learn/${courseId}/${target}`)
  }, [outline.data, courseId, router])

  if (outline.isError) return <ErrorBox error={outline.error} onRetry={() => outline.refetch()} />
  if (outline.data && outline.data.modules.every((m) => m.lessons.length === 0)) {
    return <p className="p-10 text-center text-muted-foreground">This course has no lessons yet.</p>
  }
  return <Loading label="Opening your course…" />
}

export default function LearnIndexPage() {
  return (
    <RequireAuth>
      <Redirect />
    </RequireAuth>
  )
}
