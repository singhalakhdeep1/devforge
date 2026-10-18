'use client'

import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { socialApi } from '../../../lib/api/platform'
import { useAuthStore } from '../../../lib/store/authStore'
import { useAction } from '../../../components/kit'
import { ProjectCard } from '../../../components/projects'
import { Empty, ErrorBox, Loading } from '../../../components/state'
import { Button } from '../../../components/ui/button'
import { UserAvatar } from '../../../components/user-avatar'

export default function PersonPage() {
  const { id } = useParams<{ id: string }>()
  const me = useAuthStore((s) => s.user)
  const q = useQuery({ queryKey: ['person', id], queryFn: () => socialApi.person(id) })
  const follow = useAction(() => (q.data?.isFollowing ? socialApi.unfollow(id) : socialApi.follow(id)), { invalidate: [['person', id]] })

  if (q.isLoading) return <Loading />
  if (q.error || !q.data) return <ErrorBox error={q.error} onRetry={() => q.refetch()} />
  const p = q.data
  const name = p.user?.name ?? 'Unknown user'

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <UserAvatar name={name} src={p.user?.avatar} className="h-20 w-20 text-2xl" />
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{name}</h1>
          {p.user?.bio && <p className="text-sm text-muted-foreground">{p.user.bio}</p>}
          <p className="mt-1 text-sm text-muted-foreground">
            <strong className="text-foreground">{p.followers}</strong> followers · <strong className="text-foreground">{p.following}</strong> following
          </p>
        </div>
        {me && me.id !== id && (
          <Button variant={p.isFollowing ? 'outline' : 'default'} onClick={() => follow.mutate(undefined)} disabled={follow.isPending}>
            {p.isFollowing ? 'Unfollow' : 'Follow'}
          </Button>
        )}
      </div>
      <h2 className="mb-3 font-semibold">Public projects</h2>
      {p.projects.length === 0 ? (
        <Empty title="No public projects" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {p.projects.map((pr) => (
            <ProjectCard key={pr.id} p={{ ...pr, tags: pr.tags ?? [], owner: pr.owner ?? p.user }} />
          ))}
        </div>
      )}
    </div>
  )
}
