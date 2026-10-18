'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { socialApi } from '../../../lib/api/platform'
import { useAction } from '../../../components/kit'
import { RequireAuth } from '../../../components/require-auth'
import { ErrorBox, Loading } from '../../../components/state'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'

export default function InvitationPage() {
  return (
    <RequireAuth>
      <Invitation />
    </RequireAuth>
  )
}

function Invitation() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const q = useQuery({ queryKey: ['invitation', token], queryFn: () => socialApi.invitation(token), retry: false })
  const target = q.data?.entity ? `/${q.data.type === 'TEAM' ? 'teams' : 'projects'}/${q.data.entity.slug}` : '/projects'
  const accept = useAction(() => socialApi.accept(token), { success: 'Welcome aboard', onDone: () => router.push(target) })
  const reject = useAction(() => socialApi.reject(token), { success: 'Invitation declined', onDone: () => router.push('/feed') })

  if (q.isLoading) return <Loading />
  if (q.error || !q.data) return <ErrorBox error={q.error} />
  const i = q.data
  return (
    <div className="container mx-auto max-w-lg px-4 py-16">
      <Card className="space-y-4 p-6 text-center">
        <h1 className="text-xl font-bold">You are invited</h1>
        <p className="text-sm">
          <strong>{i.invitedBy?.name ?? 'Someone'}</strong> invited you to join the {i.type === 'TEAM' ? 'team' : 'project'} <strong>{i.entity?.name}</strong> as {i.role.toLowerCase()}.
        </p>
        {i.forYou === false ? (
          <p className="text-sm text-red-600">This invitation was sent to a different email address. Sign in with that account to accept it.</p>
        ) : (
          <div className="flex justify-center gap-2">
            <Button onClick={() => accept.mutate(undefined)} disabled={accept.isPending}>
              Accept
            </Button>
            <Button variant="outline" onClick={() => reject.mutate(undefined)} disabled={reject.isPending}>
              Decline
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
