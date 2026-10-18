'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Plus, Video } from 'lucide-react'
import { videoApi } from '../../lib/api/platform'
import { useAuthStore } from '../../lib/store/authStore'
import { timeAgo } from '../../lib/utils'
import { Field, PageHeader, useAction } from '../../components/kit'
import { RequireAuth } from '../../components/require-auth'
import { Empty, ErrorBox, Loading } from '../../components/state'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { Input } from '../../components/ui/input'

export default function VideoPage() {
  return (
    <RequireAuth>
      <Calls />
    </RequireAuth>
  )
}

function Calls() {
  const router = useRouter()
  const me = useAuthStore((s) => s.user)
  const q = useQuery({ queryKey: ['calls'], queryFn: videoApi.rooms, refetchInterval: 15_000 })
  const [name, setName] = useState('')
  const create = useAction(() => videoApi.create({ name: name || `${me?.name ?? 'My'}'s call` }), { onDone: (r) => router.push(`/video/${r.id}`) })

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <PageHeader title="Video calls" description="Start a call and share its link, or open one from a board, document or project." />
      <Card className="mb-8 p-5">
        <form className="flex flex-wrap items-end gap-3" onSubmit={(e) => (e.preventDefault(), create.mutate(undefined))}>
          <div className="min-w-60 flex-1">
            <Field label="Call name" htmlFor="call-name">
              <Input id="call-name" placeholder="Design review" value={name} onChange={(e) => setName(e.target.value)} maxLength={80} />
            </Field>
          </div>
          <Button type="submit" disabled={create.isPending}>
            <Plus className="mr-1 h-4 w-4" /> Start a call
          </Button>
        </form>
      </Card>
      <h2 className="mb-3 font-semibold">Your open calls</h2>
      {q.isLoading ? (
        <Loading />
      ) : q.error ? (
        <ErrorBox error={q.error} onRetry={() => q.refetch()} />
      ) : (q.data?.items ?? []).length === 0 ? (
        <Empty title="No open calls">Calls you start or are invited to stay here for a day.</Empty>
      ) : (
        <Card className="divide-y">
          {q.data!.items.map((r) => (
            <Link key={r.id} href={`/video/${r.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-accent">
              <Video className="h-5 w-5 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{r.name}</p>
                <p className="text-xs text-muted-foreground">
                  {r.ownerId === me?.id ? 'You' : r.ownerName} started it {timeAgo(r.createdAt)}
                  {r.scope !== 'adhoc' && ` · ${r.scope} call`}
                </p>
              </div>
              {(r.active ?? 0) > 0 && <Badge>{r.active} in call</Badge>}
            </Link>
          ))}
        </Card>
      )}
    </div>
  )
}
