'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { socialApi, type PersonRef } from '../../lib/api/platform'
import { timeAgo } from '../../lib/utils'
import { PageHeader, Tabs } from '../../components/kit'
import { RequireAuth } from '../../components/require-auth'
import { Empty, ErrorBox, Loading } from '../../components/state'
import { Button } from '../../components/ui/button'
import { Card } from '../../components/ui/card'
import { UserAvatar } from '../../components/user-avatar'

export default function FeedPage() {
  return (
    <RequireAuth>
      <Feed />
    </RequireAuth>
  )
}

const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)

function Feed() {
  const [tab, setTab] = useState<'feed' | 'followers' | 'following' | 'invitations'>('feed')
  const [page, setPage] = useState(1)
  const feed = useQuery({ queryKey: ['feed', page], queryFn: () => socialApi.feed(page), enabled: tab === 'feed' })
  const followers = useQuery({ queryKey: ['followers'], queryFn: socialApi.followers, enabled: tab === 'followers' })
  const following = useQuery({ queryKey: ['following'], queryFn: socialApi.following, enabled: tab === 'following' })
  const invitations = useQuery({ queryKey: ['my-invitations'], queryFn: socialApi.myInvitations })
  const people = tab === 'followers' ? followers : following
  const peopleList = (Array.isArray(people.data) ? people.data : []).filter(Boolean) as PersonRef[]
  const items = feed.data?.data ?? []

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <PageHeader title="Activity" description="What the people you follow and your projects have been up to." />
      <Tabs
        tabs={[
          { id: 'feed', label: 'Feed' },
          { id: 'invitations', label: `Invitations${invitations.data?.length ? ` (${invitations.data.length})` : ''}` },
          { id: 'followers', label: 'Followers' },
          { id: 'following', label: 'Following' },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === 'feed' &&
        (feed.isLoading ? (
          <Loading />
        ) : feed.error ? (
          <ErrorBox error={feed.error} onRetry={() => feed.refetch()} />
        ) : items.length === 0 ? (
          <Empty title="Nothing yet">Follow people or join projects to see their activity here.</Empty>
        ) : (
          <>
            <ul className="space-y-3">
              {items.map((a) => (
                <li key={a.id} className="flex items-center gap-3 text-sm">
                  <UserAvatar name={a.user?.name ?? '?'} src={a.user?.avatar} className="h-8 w-8" />
                  <span className="flex-1">
                    {a.user ? (
                      <Link href={`/people/${a.user.id}`} className="font-medium hover:underline">
                        {a.user.name}
                      </Link>
                    ) : (
                      'Someone'
                    )}{' '}
                    {a.projectId ? (
                      <Link href={`/projects/${a.projectId}`} className="hover:underline">
                        {lower(a.summary)}
                      </Link>
                    ) : (
                      lower(a.summary)
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground">{timeAgo(a.createdAt)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Newer
              </Button>
              <Button variant="outline" size="sm" disabled={page * (feed.data?.pageSize ?? 20) >= (feed.data?.total ?? 0)} onClick={() => setPage(page + 1)}>
                Older
              </Button>
            </div>
          </>
        ))}

      {tab === 'invitations' &&
        ((invitations.data ?? []).length === 0 ? (
          <Empty title="No pending invitations">Invitations to projects and teams sent to your email appear here.</Empty>
        ) : (
          <div className="space-y-2">
            {invitations.data!.map((i) => (
              <Card key={i.id} className="p-4 text-sm">
                <strong>{i.invitedBy?.name ?? 'Someone'}</strong> invited you to the {i.type === 'TEAM' ? 'team' : 'project'} <strong>{i.entity?.name ?? '(deleted)'}</strong> as {i.role.toLowerCase()}.
                <p className="mt-1 text-xs text-muted-foreground">Open the link in the invitation email or notification to accept. Expires {i.expiresAt && new Date(i.expiresAt).toLocaleDateString()}.</p>
              </Card>
            ))}
          </div>
        ))}

      {(tab === 'followers' || tab === 'following') &&
        (people.isLoading ? (
          <Loading />
        ) : peopleList.length === 0 ? (
          <Empty title={tab === 'followers' ? 'No followers yet' : 'You are not following anyone'} />
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {peopleList.map((p) => (
              <li key={p.id}>
                <Link href={`/people/${p.id}`} className="flex items-center gap-2 rounded-md border p-3 hover:bg-accent">
                  <UserAvatar name={p.name} src={p.avatar} className="h-8 w-8" />
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        ))}
    </div>
  )
}
