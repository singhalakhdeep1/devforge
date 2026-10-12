'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, Eye, EyeOff } from 'lucide-react'
import { apiErrorMessage, instructorApi, type EditorCourse, type Level } from '../../../../lib/api'
import { cn, timeAgo } from '../../../../lib/utils'
import { RequireAuth } from '../../../../components/require-auth'
import { ErrorBox, Loading } from '../../../../components/state'
import { Curriculum } from '../../../../components/studio/curriculum'
import { useToast } from '../../../../components/toast'
import { Badge } from '../../../../components/ui/badge'
import { Button, ButtonLink } from '../../../../components/ui/button'
import { Input } from '../../../../components/ui/input'
import { Label } from '../../../../components/ui/label'
import { Progress } from '../../../../components/ui/progress'
import { Select } from '../../../../components/ui/select'
import { Textarea } from '../../../../components/ui/textarea'
import { UserAvatar } from '../../../../components/user-avatar'

function DetailsForm({ course }: { course: EditorCourse }) {
  const qc = useQueryClient()
  const router = useRouter()
  const toast = useToast()
  const [form, setForm] = useState({
    title: course.title,
    description: course.description,
    category: course.category,
    level: course.level,
    price: String(course.price),
    thumbnailUrl: course.thumbnailUrl ?? '',
  })

  const save = useMutation({
    mutationFn: () => instructorApi.updateCourse(course.id, { ...form, price: Number(form.price) || 0 }),
    onSuccess: () => {
      toast.success('Course saved')
      qc.invalidateQueries({ queryKey: ['instructor-course', String(course.id)] })
      qc.invalidateQueries({ queryKey: ['instructor-courses'] })
    },
    onError: (e) => toast.error(apiErrorMessage(e)),
  })
  const remove = useMutation({
    mutationFn: () => instructorApi.deleteCourse(course.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['instructor-courses'] })
      router.replace('/instructor')
    },
    onError: (e) => toast.error(apiErrorMessage(e)),
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        save.mutate()
      }}
      className="grid max-w-3xl gap-4 md:grid-cols-2"
    >
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="d-title">Title</Label>
        <Input id="d-title" required minLength={3} maxLength={120} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="d-desc">Description</Label>
        <Textarea id="d-desc" required minLength={10} maxLength={5000} className="min-h-32" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="d-cat">Category</Label>
        <Input id="d-cat" required maxLength={60} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="d-level">Level</Label>
        <Select id="d-level" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value as Level })}>
          <option value="BEGINNER">Beginner</option>
          <option value="INTERMEDIATE">Intermediate</option>
          <option value="ADVANCED">Advanced</option>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="d-price">Price (USD, 0 = free)</Label>
        <Input id="d-price" type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="d-thumb">Thumbnail URL (optional)</Label>
        <Input id="d-thumb" type="url" value={form.thumbnailUrl} onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })} placeholder="https://" />
      </div>
      <div className="flex gap-2 md:col-span-2">
        <Button type="submit" disabled={save.isPending}>{save.isPending ? 'Saving…' : 'Save details'}</Button>
        <Button type="button" variant="outline" className="ml-auto text-red-600" onClick={() => confirm('Delete this course permanently?') && remove.mutate()}>
          Delete course
        </Button>
      </div>
    </form>
  )
}

function Students({ courseId }: { courseId: number }) {
  const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: ['instructor-students', courseId], queryFn: () => instructorApi.students(courseId) })
  if (isLoading) return <Loading />
  if (isError) return <ErrorBox error={error} onRetry={() => refetch()} />
  if (!data!.length) return <p className="text-sm text-muted-foreground">No students have enrolled yet.</p>
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left">
          <tr>
            <th className="p-3">Student</th>
            <th className="p-3">Enrolled</th>
            <th className="p-3 w-56">Progress</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {data!.map((s) => (
            <tr key={s.user.id}>
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <UserAvatar name={s.user.name} src={s.user.avatar} className="h-7 w-7 text-xs" />
                  <div><p className="font-medium">{s.user.name}</p><p className="text-xs text-muted-foreground">{s.user.email}</p></div>
                </div>
              </td>
              <td className="p-3 text-muted-foreground">{timeAgo(s.enrolledAt)}</td>
              <td className="p-3"><div className="flex items-center gap-2"><Progress value={s.progress} className="flex-1" /><span className="w-10 text-xs">{s.progress}%</span></div></td>
              <td className="p-3">{s.completedAt ? <Badge>Completed</Badge> : <span className="text-muted-foreground">In progress</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Editor() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()
  const toast = useToast()
  const [tab, setTab] = useState<'curriculum' | 'details' | 'students'>('curriculum')
  const course = useQuery({ queryKey: ['instructor-course', id], queryFn: () => instructorApi.course(id) })

  const publish = useMutation({
    mutationFn: (published: boolean) => instructorApi.publish(Number(id), published),
    onSuccess: (r) => {
      toast.success(r.published ? 'Course published' : 'Course unpublished')
      qc.invalidateQueries({ queryKey: ['instructor-course', id] })
      qc.invalidateQueries({ queryKey: ['instructor-courses'] })
    },
    onError: (e) => toast.error(apiErrorMessage(e)),
  })

  if (course.isLoading) return <Loading />
  if (course.isError) return <ErrorBox error={course.error} onRetry={() => course.refetch()} />
  const c = course.data!

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/instructor" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" />All courses
      </Link>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{c.title}</h1>
        <Badge className={c.published ? '' : 'bg-yellow-100 text-yellow-900'}>{c.published ? 'Published' : 'Draft'}</Badge>
        <div className="ml-auto flex gap-2">
          <ButtonLink href={`/courses/${c.id}`} variant="outline"><Eye className="mr-2 h-4 w-4" />Preview</ButtonLink>
          {c.published ? (
            <Button variant="outline" onClick={() => publish.mutate(false)} disabled={publish.isPending}><EyeOff className="mr-2 h-4 w-4" />Unpublish</Button>
          ) : (
            <Button onClick={() => publish.mutate(true)} disabled={publish.isPending}>Publish</Button>
          )}
        </div>
      </div>

      <div className="mt-6 flex gap-1 border-b">
        {(['curriculum', 'details', 'students'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn('border-b-2 px-4 py-2 text-sm font-medium capitalize', tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-muted-foreground hover:text-foreground')}>
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'curriculum' && <Curriculum course={c} />}
        {tab === 'details' && <DetailsForm course={c} />}
        {tab === 'students' && <Students courseId={c.id} />}
      </div>
    </div>
  )
}

export default function CourseStudioPage() {
  return (
    <RequireAuth roles={['INSTRUCTOR', 'ADMIN']}>
      <Editor />
    </RequireAuth>
  )
}
