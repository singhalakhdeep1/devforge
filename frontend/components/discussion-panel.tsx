'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, ChevronUp, Trash2 } from 'lucide-react'
import { apiErrorMessage, discussionApi, type Discussion } from '../lib/api'
import { useAuthStore } from '../lib/store/authStore'
import { cn, timeAgo } from '../lib/utils'
import { ErrorBox, Loading } from './state'
import { useToast } from './toast'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { UserAvatar } from './user-avatar'

interface Props {
  courseId: number
  /** When set, new questions are attached to this lesson and the list is filtered to it. */
  lessonId?: number
  isInstructor: boolean
}

export function DiscussionPanel({ courseId, lessonId, isInstructor }: Props) {
  const toast = useToast()
  const qc = useQueryClient()
  const me = useAuthStore((s) => s.user)
  const key = ['discussions', courseId, lessonId ?? 'all']
  const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: key, queryFn: () => discussionApi.list(courseId, lessonId) })

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const refresh = () => qc.invalidateQueries({ queryKey: ['discussions', courseId] })
  const onError = (e: unknown) => toast.error(apiErrorMessage(e))

  const ask = useMutation({
    mutationFn: () => discussionApi.create({ courseId, lessonId, title, content }),
    onSuccess: () => {
      setTitle('')
      setContent('')
      toast.success('Question posted')
      refresh()
    },
    onError,
  })

  return (
    <div className="space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          ask.mutate()
        }}
        className="space-y-3 rounded-lg border p-4"
      >
        <p className="font-medium">Ask a question</p>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required minLength={3} maxLength={200} />
        <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Describe what you are stuck on" required maxLength={5000} />
        <Button type="submit" disabled={ask.isPending}>{ask.isPending ? 'Posting…' : 'Post question'}</Button>
      </form>

      {isLoading ? (
        <Loading />
      ) : isError ? (
        <ErrorBox error={error} onRetry={() => refetch()} />
      ) : data!.length === 0 ? (
        <p className="text-sm text-muted-foreground">No questions yet. Be the first to ask.</p>
      ) : (
        <div className="space-y-6">
          {data!.map((d) => (
            <DiscussionItem key={d.id} d={d} meId={me?.id} canModerate={isInstructor} onChange={refresh} onError={onError} />
          ))}
        </div>
      )}
    </div>
  )
}

function DiscussionItem({ d, meId, canModerate, onChange, onError }: { d: Discussion; meId?: string; canModerate: boolean; onChange: () => void; onError: (e: unknown) => void }) {
  const [reply, setReply] = useState('')
  const answer = useMutation({
    mutationFn: () => discussionApi.answer(d.id, reply),
    onSuccess: () => {
      setReply('')
      onChange()
    },
    onError,
  })
  const vote = useMutation({ mutationFn: (id: number) => discussionApi.vote(id), onSuccess: onChange, onError })
  const accept = useMutation({ mutationFn: (id: number) => discussionApi.accept(id), onSuccess: onChange, onError })
  const remove = useMutation({ mutationFn: () => discussionApi.remove(d.id), onSuccess: onChange, onError })

  const canAccept = meId === d.user.id || canModerate

  return (
    <article className="rounded-lg border p-4">
      <header className="flex items-start gap-3">
        <UserAvatar name={d.user.name} src={d.user.avatar} />
        <div className="flex-1">
          <h3 className="font-semibold">{d.title}</h3>
          <p className="text-xs text-muted-foreground">
            {d.user.name} · {timeAgo(d.createdAt)}
            {d.lesson && <> · on “{d.lesson.title}”</>}
          </p>
        </div>
        {(meId === d.user.id || canModerate) && (
          <button onClick={() => confirm('Delete this question?') && remove.mutate()} aria-label="Delete question" className="text-muted-foreground hover:text-red-600">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </header>
      <p className="mt-3 whitespace-pre-wrap text-sm">{d.content}</p>

      <div className="mt-4 space-y-3 border-t pt-4">
        {d.answers.map((a) => (
          <div key={a.id} className={cn('flex gap-3 rounded-md p-3', a.accepted ? 'bg-green-50 dark:bg-green-950/30' : 'bg-muted/40')}>
            <button
              onClick={() => vote.mutate(a.id)}
              disabled={a.user.id === meId}
              aria-label={a.voted ? 'Remove upvote' : 'Upvote'}
              className={cn('flex h-fit flex-col items-center rounded border px-2 py-1 text-xs disabled:opacity-50', a.voted && 'border-blue-600 text-blue-600')}
            >
              <ChevronUp className="h-4 w-4" />
              {a.upvotes}
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <UserAvatar name={a.user.name} src={a.user.avatar} className="h-6 w-6 text-xs" />
                <span className="font-medium text-foreground">{a.user.name}</span>
                {a.user.role !== 'STUDENT' && <span className="rounded bg-blue-100 px-1.5 py-0.5 text-blue-700">Instructor</span>}
                <span>{timeAgo(a.createdAt)}</span>
                {a.accepted && <span className="flex items-center gap-1 font-medium text-green-700"><Check className="h-3 w-3" />Accepted</span>}
              </div>
              <p className="mt-1 whitespace-pre-wrap text-sm">{a.content}</p>
              {canAccept && (
                <button onClick={() => accept.mutate(a.id)} className="mt-1 text-xs text-blue-600 hover:underline">
                  {a.accepted ? 'Unmark as accepted' : 'Mark as accepted'}
                </button>
              )}
            </div>
          </div>
        ))}

        <form
          onSubmit={(e) => {
            e.preventDefault()
            answer.mutate()
          }}
          className="flex gap-2"
        >
          <Input value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write an answer…" required maxLength={5000} aria-label="Your answer" />
          <Button type="submit" variant="outline" disabled={answer.isPending}>Reply</Button>
        </form>
      </div>
    </article>
  )
}
