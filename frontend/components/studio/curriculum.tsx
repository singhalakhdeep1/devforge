'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowDown, ArrowUp, FileText, HelpCircle, PlayCircle, BookOpen, Plus, Trash2 } from 'lucide-react'
import { apiErrorMessage, instructorApi, type EditorCourse, type LessonType } from '../../lib/api'
import { cn } from '../../lib/utils'
import { useToast } from '../toast'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { LessonEditor } from './lesson-editor'

const icon: Record<LessonType, typeof FileText> = { ARTICLE: FileText, VIDEO: PlayCircle, QUIZ: HelpCircle, EXERCISE: BookOpen }

export function Curriculum({ course }: { course: EditorCourse }) {
  const qc = useQueryClient()
  const toast = useToast()
  const [selected, setSelected] = useState<number | null>(null)
  const [newModule, setNewModule] = useState('')
  const [editingModule, setEditingModule] = useState<{ id: number; title: string } | null>(null)

  const refresh = () => qc.invalidateQueries({ queryKey: ['instructor-course', String(course.id)] })
  const onError = (e: unknown) => toast.error(apiErrorMessage(e))

  const addModule = useMutation({
    mutationFn: () => instructorApi.addModule(course.id, newModule.trim()),
    onSuccess: () => {
      setNewModule('')
      refresh()
    },
    onError,
  })
  const renameModule = useMutation({
    mutationFn: ({ id, title }: { id: number; title: string }) => instructorApi.renameModule(id, title),
    onSuccess: () => {
      setEditingModule(null)
      refresh()
    },
    onError,
  })
  const deleteModule = useMutation({ mutationFn: (id: number) => instructorApi.deleteModule(id), onSuccess: refresh, onError })
  const addLesson = useMutation({
    mutationFn: ({ moduleId, type }: { moduleId: number; type: LessonType }) =>
      instructorApi.addLesson(moduleId, { title: type === 'QUIZ' ? 'New quiz' : 'New lesson', type, durationMin: type === 'QUIZ' ? 3 : 5 }),
    onSuccess: (lesson) => {
      setSelected(lesson.id)
      refresh()
    },
    onError,
  })
  const deleteLesson = useMutation({
    mutationFn: (id: number) => instructorApi.deleteLesson(id),
    onSuccess: (_d, id) => {
      if (selected === id) setSelected(null)
      refresh()
    },
    onError,
  })
  const reorder = useMutation({
    mutationFn: (modules: { id: number; lessonIds: number[] }[]) => instructorApi.saveOrder(course.id, modules),
    onSuccess: refresh,
    onError,
  })

  const current = () => course.modules.map((m) => ({ id: m.id, lessonIds: m.lessons.map((l) => l.id) }))

  const moveModule = (index: number, dir: -1 | 1) => {
    const order = current()
    const target = index + dir
    if (target < 0 || target >= order.length) return
    ;[order[index], order[target]] = [order[target], order[index]]
    reorder.mutate(order)
  }

  // Moving past the first/last lesson of a module sends it into the neighbouring module
  const moveLesson = (mi: number, li: number, dir: -1 | 1) => {
    const order = current()
    const ids = order[mi].lessonIds
    const lessonId = ids[li]
    const target = li + dir
    if (target >= 0 && target < ids.length) {
      ;[ids[li], ids[target]] = [ids[target], ids[li]]
    } else {
      const neighbour = order[mi + dir]
      if (!neighbour) return
      ids.splice(li, 1)
      if (dir === -1) neighbour.lessonIds.push(lessonId)
      else neighbour.lessonIds.unshift(lessonId)
    }
    reorder.mutate(order)
  }

  const lesson = course.modules.flatMap((m) => m.lessons).find((l) => l.id === selected) ?? null

  return (
    <div className="grid gap-6 lg:grid-cols-[22rem_1fr]">
      <div className="space-y-4">
        {course.modules.map((m, mi) => (
          <div key={m.id} className="rounded-lg border">
            <div className="flex items-center gap-1 border-b bg-muted/40 px-3 py-2">
              {editingModule?.id === m.id ? (
                <form
                  className="flex flex-1 gap-1"
                  onSubmit={(e) => {
                    e.preventDefault()
                    renameModule.mutate(editingModule)
                  }}
                >
                  <Input autoFocus value={editingModule.title} onChange={(e) => setEditingModule({ id: m.id, title: e.target.value })} className="h-8" maxLength={150} aria-label="Module title" />
                  <Button type="submit" size="sm" disabled={!editingModule.title.trim()}>Save</Button>
                </form>
              ) : (
                <button className="flex-1 truncate text-left text-sm font-semibold hover:underline" onClick={() => setEditingModule({ id: m.id, title: m.title })} title="Click to rename">
                  {m.title}
                </button>
              )}
              <Button variant="ghost" size="icon" className="h-7 w-7" disabled={mi === 0} onClick={() => moveModule(mi, -1)} aria-label="Move module up"><ArrowUp className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" disabled={mi === course.modules.length - 1} onClick={() => moveModule(mi, 1)} aria-label="Move module down"><ArrowDown className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => confirm(`Delete module "${m.title}" and its ${m.lessons.length} lessons?`) && deleteModule.mutate(m.id)} aria-label="Delete module"><Trash2 className="h-4 w-4 text-red-600" /></Button>
            </div>

            <ul>
              {m.lessons.map((l, li) => {
                const Icon = icon[l.type]
                return (
                  <li key={l.id} className={cn('flex items-center gap-1 border-b px-3 py-1.5 last:border-b-0', selected === l.id && 'bg-accent')}>
                    <button className="flex flex-1 items-center gap-2 truncate text-left text-sm" onClick={() => setSelected(l.id)}>
                      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">{l.title}</span>
                    </button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" disabled={mi === 0 && li === 0} onClick={() => moveLesson(mi, li, -1)} aria-label="Move lesson up"><ArrowUp className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" disabled={mi === course.modules.length - 1 && li === m.lessons.length - 1} onClick={() => moveLesson(mi, li, 1)} aria-label="Move lesson down"><ArrowDown className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => confirm(`Delete lesson "${l.title}"?`) && deleteLesson.mutate(l.id)} aria-label="Delete lesson"><Trash2 className="h-3.5 w-3.5 text-red-600" /></Button>
                  </li>
                )
              })}
            </ul>

            <div className="flex gap-2 border-t p-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => addLesson.mutate({ moduleId: m.id, type: 'ARTICLE' })}><Plus className="mr-1 h-3.5 w-3.5" />Lesson</Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => addLesson.mutate({ moduleId: m.id, type: 'QUIZ' })}><Plus className="mr-1 h-3.5 w-3.5" />Quiz</Button>
            </div>
          </div>
        ))}

        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (newModule.trim()) addModule.mutate()
          }}
        >
          <Input value={newModule} onChange={(e) => setNewModule(e.target.value)} placeholder="New module title" maxLength={150} aria-label="New module title" />
          <Button type="submit" disabled={!newModule.trim() || addModule.isPending}>Add</Button>
        </form>
      </div>

      <div className="min-w-0 rounded-lg border p-5">
        {lesson ? <LessonEditor key={lesson.id} lesson={lesson} onSaved={refresh} /> : <p className="text-sm text-muted-foreground">Select a lesson to edit it, or add a module and a lesson to get started.</p>}
      </div>
    </div>
  )
}
