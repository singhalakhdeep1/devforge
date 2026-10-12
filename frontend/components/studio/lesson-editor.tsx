'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { apiErrorMessage, instructorApi, type EditorLesson, type EditorQuestion, type LessonType } from '../../lib/api'
import { Markdown } from '../markdown'
import { useToast } from '../toast'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Select } from '../ui/select'
import { Textarea } from '../ui/textarea'

const emptyQuestion = (): EditorQuestion => ({ question: '', options: ['', ''], correctAnswer: 0, explanation: '' })

/** Edits one lesson. Remount it (via `key`) when a different lesson is selected. */
export function LessonEditor({ lesson, onSaved }: { lesson: EditorLesson; onSaved: () => void }) {
  const toast = useToast()
  const [form, setForm] = useState({
    title: lesson.title,
    type: lesson.type,
    content: lesson.content,
    videoUrl: lesson.videoUrl ?? '',
    durationMin: lesson.durationMin,
  })
  const [questions, setQuestions] = useState<EditorQuestion[]>(lesson.questions.length ? lesson.questions : [])
  const [preview, setPreview] = useState(false)
  const [saving, setSaving] = useState(false)

  const setQuestion = (i: number, patch: Partial<EditorQuestion>) => setQuestions((qs) => qs.map((q, qi) => (qi === i ? { ...q, ...patch } : q)))
  const setOption = (qi: number, oi: number, value: string) => setQuestion(qi, { options: questions[qi].options.map((o, i) => (i === oi ? value : o)) })

  const save = async () => {
    setSaving(true)
    try {
      await instructorApi.updateLesson(lesson.id, form)
      if (form.type === 'QUIZ') {
        await instructorApi.saveQuestions(
          lesson.id,
          questions.map((q) => ({ question: q.question, options: q.options, correctAnswer: q.correctAnswer, explanation: q.explanation || undefined }))
        )
      }
      toast.success('Lesson saved')
      onSaved()
    } catch (e) {
      toast.error(apiErrorMessage(e, 'Could not save the lesson'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-[1fr_9rem_7rem]">
        <div className="space-y-2">
          <Label htmlFor="lesson-title">Title</Label>
          <Input id="lesson-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={150} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lesson-type">Type</Label>
          <Select id="lesson-type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as LessonType })}>
            <option value="ARTICLE">Article</option>
            <option value="VIDEO">Video</option>
            <option value="EXERCISE">Exercise</option>
            <option value="QUIZ">Quiz</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="lesson-minutes">Minutes</Label>
          <Input id="lesson-minutes" type="number" min={1} max={600} value={form.durationMin} onChange={(e) => setForm({ ...form, durationMin: Number(e.target.value) || 1 })} />
        </div>
      </div>

      {form.type !== 'QUIZ' && (
        <>
          {(form.type === 'VIDEO' || form.videoUrl) && (
            <div className="space-y-2">
              <Label htmlFor="lesson-video">Video URL</Label>
              <Input id="lesson-video" type="url" placeholder="https://www.youtube.com/watch?v=…" value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} />
              <p className="text-xs text-muted-foreground">YouTube, Vimeo or a direct .mp4 / .webm link.</p>
            </div>
          )}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="lesson-content">Content (Markdown)</Label>
              <button type="button" onClick={() => setPreview((p) => !p)} className="text-xs text-blue-600 hover:underline">
                {preview ? 'Edit' : 'Preview'}
              </button>
            </div>
            {preview ? (
              <div className="min-h-48 rounded-md border p-4">{form.content ? <Markdown>{form.content}</Markdown> : <p className="text-sm text-muted-foreground">Nothing to preview.</p>}</div>
            ) : (
              <Textarea id="lesson-content" className="min-h-64 font-mono text-sm" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} maxLength={50000} />
            )}
          </div>
        </>
      )}

      {form.type === 'QUIZ' && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Students need 70% to pass. Mark the correct option for each question.</p>
          {questions.map((q, qi) => (
            <fieldset key={qi} className="space-y-3 rounded-lg border p-4">
              <div className="flex gap-2">
                <Input value={q.question} onChange={(e) => setQuestion(qi, { question: e.target.value })} placeholder={`Question ${qi + 1}`} aria-label={`Question ${qi + 1}`} maxLength={500} />
                <Button type="button" variant="ghost" size="icon" onClick={() => setQuestions((qs) => qs.filter((_, i) => i !== qi))} aria-label="Remove question">
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
              {q.options.map((o, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input type="radio" name={`correct-${qi}`} checked={q.correctAnswer === oi} onChange={() => setQuestion(qi, { correctAnswer: oi })} aria-label={`Option ${oi + 1} is correct`} />
                  <Input value={o} onChange={(e) => setOption(qi, oi, e.target.value)} placeholder={`Option ${oi + 1}`} aria-label={`Option ${oi + 1}`} maxLength={200} />
                  {q.options.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Remove option"
                      onClick={() => setQuestion(qi, { options: q.options.filter((_, i) => i !== oi), correctAnswer: q.correctAnswer === oi ? 0 : q.correctAnswer > oi ? q.correctAnswer - 1 : q.correctAnswer })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {q.options.length < 6 && (
                <Button type="button" variant="outline" size="sm" onClick={() => setQuestion(qi, { options: [...q.options, ''] })}>
                  <Plus className="mr-1 h-4 w-4" />Add option
                </Button>
              )}
              <Input value={q.explanation ?? ''} onChange={(e) => setQuestion(qi, { explanation: e.target.value })} placeholder="Explanation shown after answering (optional)" aria-label="Explanation" maxLength={500} />
            </fieldset>
          ))}
          <Button type="button" variant="outline" onClick={() => setQuestions((qs) => [...qs, emptyQuestion()])}>
            <Plus className="mr-1 h-4 w-4" />Add question
          </Button>
        </div>
      )}

      <Button onClick={save} disabled={saving || !form.title.trim()}>{saving ? 'Saving…' : 'Save lesson'}</Button>
    </div>
  )
}
