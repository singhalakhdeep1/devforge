'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from '@tanstack/react-query'
import { DollarSign, Plus, Star, Users } from 'lucide-react'
import { apiErrorMessage, instructorApi, type Level } from '../../lib/api'
import { formatPrice } from '../../lib/utils'
import { RequireAuth } from '../../components/require-auth'
import { Empty, ErrorBox, Loading } from '../../components/state'
import { useToast } from '../../components/toast'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select } from '../../components/ui/select'
import { Textarea } from '../../components/ui/textarea'

function NewCourseForm({ onCancel }: { onCancel: () => void }) {
  const router = useRouter()
  const toast = useToast()
  const [form, setForm] = useState({ title: '', description: '', category: 'Programming', level: 'BEGINNER' as Level, price: '0' })
  const create = useMutation({
    mutationFn: () => instructorApi.createCourse({ ...form, price: Number(form.price) || 0 }),
    onSuccess: (c) => router.push(`/instructor/courses/${c.id}`),
    onError: (e) => toast.error(apiErrorMessage(e)),
  })

  return (
    <Card className="mb-8">
      <CardHeader><CardTitle>New course</CardTitle></CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            create.mutate()
          }}
          className="grid gap-4 md:grid-cols-2"
        >
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" required minLength={3} maxLength={120} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" required minLength={10} maxLength={5000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input id="category" required maxLength={60} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="level">Level</Label>
            <Select id="level" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value as Level })}>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price (USD, 0 = free)</Label>
            <Input id="price" type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <div className="flex items-end gap-2">
            <Button type="submit" disabled={create.isPending}>{create.isPending ? 'Creating…' : 'Create and add lessons'}</Button>
            <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function Content() {
  const [creating, setCreating] = useState(false)
  const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: ['instructor-courses'], queryFn: instructorApi.courses })

  if (isLoading) return <Loading />
  if (isError) return <ErrorBox error={error} onRetry={() => refetch()} />

  const totalStudents = data!.reduce((s, c) => s + c.students, 0)
  const revenue = data!.reduce((s, c) => s + c.revenue, 0)

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Instructor studio</h1>
          <p className="text-muted-foreground">Create courses, track students and earnings.</p>
        </div>
        <Button onClick={() => setCreating(true)}><Plus className="mr-2 h-4 w-4" />New course</Button>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        {[
          { label: 'Courses', value: data!.length, icon: Star },
          { label: 'Students', value: totalStudents, icon: Users },
          { label: 'Revenue', value: `$${revenue.toFixed(2)}`, icon: DollarSign },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 p-4">
              <Icon className="h-6 w-6 text-blue-600" />
              <div><p className="text-2xl font-bold">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        {creating && <NewCourseForm onCancel={() => setCreating(false)} />}
        {data!.length === 0 && !creating ? (
          <Empty title="You have not created a course yet">Click “New course” to start building your first one.</Empty>
        ) : (
          <div className="space-y-3">
            {data!.map((c) => (
              <Link key={c.id} href={`/instructor/courses/${c.id}`} className="block">
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="flex flex-wrap items-center gap-4 p-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate font-semibold">{c.title}</h3>
                        <Badge className={c.published ? '' : 'bg-yellow-100 text-yellow-900'}>{c.published ? 'Published' : 'Draft'}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{c.category} · {c.lessonCount} lessons · {formatPrice(c.price)}</p>
                    </div>
                    <div className="flex gap-6 text-sm">
                      <span title="Students"><Users className="mr-1 inline h-4 w-4" />{c.students}</span>
                      <span title="Completed">{c.completions} done</span>
                      <span title="Rating"><Star className="mr-1 inline h-4 w-4" />{c.ratingCount ? c.rating.toFixed(1) : '-'}</span>
                      <span title="Revenue">${c.revenue.toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function InstructorPage() {
  return (
    <RequireAuth roles={['INSTRUCTOR', 'ADMIN']}>
      <Content />
    </RequireAuth>
  )
}
