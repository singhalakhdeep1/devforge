'use client'

import { useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Award, Bell, CheckCheck, CreditCard, GraduationCap, HelpCircle, MessageSquare, Trash2, UserPlus } from 'lucide-react'
import { apiErrorMessage, notificationApi } from '../../lib/api'
import { cn, timeAgo } from '../../lib/utils'
import { RequireAuth } from '../../components/require-auth'
import { Empty, ErrorBox, Loading } from '../../components/state'
import { useToast } from '../../components/toast'
import { Button } from '../../components/ui/button'

const icons: Record<string, typeof Bell> = {
  enrollment: UserPlus,
  answer: MessageSquare,
  discussion: HelpCircle,
  certificate: Award,
  quiz: GraduationCap,
  payment: CreditCard,
}

function Content() {
  const router = useRouter()
  const qc = useQueryClient()
  const toast = useToast()
  const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: ['notifications'], queryFn: notificationApi.list })

  const refresh = () => qc.invalidateQueries({ queryKey: ['notifications'] })
  const onError = (e: unknown) => toast.error(apiErrorMessage(e))
  const readAll = useMutation({ mutationFn: notificationApi.readAll, onSuccess: refresh, onError })
  const remove = useMutation({ mutationFn: (id: number) => notificationApi.remove(id), onSuccess: refresh, onError })

  const open = async (id: number, link: string | null, unread: boolean) => {
    if (unread) await notificationApi.read(id).catch(() => undefined)
    refresh()
    if (link) router.push(link)
  }

  if (isLoading) return <Loading />
  if (isError) return <ErrorBox error={error} onRetry={() => refetch()} />

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">{data!.unread ? `${data!.unread} unread` : 'All caught up'}</p>
        </div>
        <Button variant="outline" onClick={() => readAll.mutate()} disabled={!data!.unread || readAll.isPending}>
          <CheckCheck className="mr-2 h-4 w-4" />Mark all read
        </Button>
      </div>

      <div className="mt-6">
        {data!.items.length === 0 ? (
          <Empty title="No notifications yet">Answers to your questions, quiz results and certificates will show up here.</Empty>
        ) : (
          <ul className="divide-y rounded-lg border">
            {data!.items.map((n) => {
              const Icon = icons[n.type] ?? Bell
              return (
                <li key={n.id} className={cn('flex items-start gap-3 p-4', !n.readAt && 'bg-blue-50/60 dark:bg-blue-950/30')}>
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                  <button className="flex-1 text-left" onClick={() => open(n.id, n.link, !n.readAt)}>
                    <p className={cn('text-sm', !n.readAt && 'font-semibold')}>{n.title}</p>
                    {n.body && <p className="text-sm text-muted-foreground">{n.body}</p>}
                    <p className="mt-1 text-xs text-muted-foreground">{timeAgo(n.createdAt)}</p>
                  </button>
                  <button onClick={() => remove.mutate(n.id)} aria-label="Delete notification" className="text-muted-foreground hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

export default function NotificationsPage() {
  return (
    <RequireAuth>
      <Content />
    </RequireAuth>
  )
}
