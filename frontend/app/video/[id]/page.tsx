'use client'

import { Suspense, useState } from 'react'
import dynamic from 'next/dynamic'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { Copy } from 'lucide-react'
import { videoApi } from '../../../lib/api/platform'
import { useAuthStore } from '../../../lib/store/authStore'
import { useAction } from '../../../components/kit'
import { RequireAuth } from '../../../components/require-auth'
import { ErrorBox, Loading } from '../../../components/state'
import { useToast } from '../../../components/toast'
import { Button } from '../../../components/ui/button'
import { Card } from '../../../components/ui/card'

const VideoCall = dynamic(() => import('../../../components/video-call').then((m) => m.VideoCall), { ssr: false, loading: () => <Loading label="Starting…" /> })

export default function CallPage() {
  return (
    <RequireAuth>
      <Suspense fallback={<Loading />}>
        <Call />
      </Suspense>
    </RequireAuth>
  )
}

function Call() {
  const { id } = useParams<{ id: string }>()
  const code = useSearchParams().get('code') ?? undefined
  const router = useRouter()
  const toast = useToast()
  const me = useAuthStore((s) => s.user)
  const [inCall, setInCall] = useState(false)
  const q = useQuery({ queryKey: ['call', id, code], queryFn: () => videoApi.room(id, code), retry: false })
  const end = useAction(() => videoApi.end(id), { success: 'Call ended for everyone', onDone: () => router.push('/video') })

  if (q.isLoading) return <Loading />
  if (q.error || !q.data) return <ErrorBox error={q.error} />
  const room = q.data
  const host = room.ownerId === me?.id || me?.role === 'ADMIN'
  const link = room.joinLink && typeof window !== 'undefined' ? `${window.location.origin}${room.joinLink}` : null

  if (inCall)
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-slate-950">
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-2 text-white">
          <h1 className="font-semibold">{room.name}</h1>
          {host && (
            <Button size="sm" variant="destructive" className="ml-auto" onClick={() => confirm('End the call for everyone?') && end.mutate(undefined)}>
              End for all
            </Button>
          )}
        </div>
        <div className="min-h-0 flex-1">
          <VideoCall roomId={id} code={code} onLeave={() => setInCall(false)} />
        </div>
      </div>
    )

  return (
    <div className="container mx-auto max-w-lg px-4 py-16">
      <Card className="space-y-4 p-6">
        <h1 className="text-xl font-bold">{room.name}</h1>
        <p className="text-sm text-muted-foreground">
          {room.participants?.length ? `${room.participants.map((p) => p.name ?? 'Guest').join(', ')} ${room.participants.length === 1 ? 'is' : 'are'} in the call.` : 'Nobody is in the call yet.'}
        </p>
        <p className="text-xs text-muted-foreground">Your browser will ask for camera and microphone access. You can turn either off once you are in.</p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setInCall(true)}>Join call</Button>
          <Button variant="outline" onClick={() => router.push('/video')}>
            Back
          </Button>
        </div>
        {link && (
          <div className="space-y-1 border-t pt-4">
            <p className="text-sm font-medium">Invite link</p>
            <p className="text-xs text-muted-foreground">Anyone signed in with this link can join.</p>
            <div className="flex gap-2">
              <input readOnly value={link} className="flex-1 rounded-md border bg-muted px-2 text-xs" aria-label="Invite link" />
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  void navigator.clipboard.writeText(link)
                  toast.success('Link copied')
                }}
              >
                <Copy className="mr-1 h-3.5 w-3.5" /> Copy
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
