'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Device, type types } from 'mediasoup-client'
import { io, type Socket } from 'socket.io-client'
import { Hand, MessageSquare, Mic, MicOff, MonitorUp, PhoneOff, Send, Video, VideoOff } from 'lucide-react'
import { FILES_URL } from '../lib/api/client'
import { useAuthStore } from '../lib/store/authStore'
import { cn } from '../lib/utils'
import { Button } from './ui/button'
import { Input } from './ui/input'

interface Remote {
  peerId: string
  userId: string
  name: string
  stream: MediaStream
  screen?: MediaStream
  hand?: boolean
}
interface ChatLine {
  name: string
  message: string
  at: Date
  mine?: boolean
}
type Ack<T> = T & { error?: string }

/** Socket.IO request with an acknowledgement; rejects with the server's error message. */
function request<T>(socket: Socket, event: string, payload: object = {}): Promise<T> {
  return new Promise((resolve, reject) => {
    socket.timeout(15_000).emit(event, payload, (err: Error | null, res: Ack<T>) => {
      if (err) return reject(new Error(`${event} timed out`))
      if (res?.error) return reject(new Error(res.error))
      resolve(res)
    })
  })
}

function Tile({ stream, name, muted, mirrored, hand, big }: { stream: MediaStream | null; name: string; muted?: boolean; mirrored?: boolean; hand?: boolean; big?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    if (ref.current && ref.current.srcObject !== stream) ref.current.srcObject = stream
  }, [stream])
  const hasVideo = Boolean(stream?.getVideoTracks().some((t) => t.readyState === 'live' && t.enabled))
  return (
    <div className={cn('relative overflow-hidden rounded-lg bg-slate-900', big ? 'col-span-full aspect-video' : 'aspect-video')}>
      <video ref={ref} autoPlay playsInline muted={muted} className={cn('h-full w-full object-contain', mirrored && '-scale-x-100', !hasVideo && 'invisible')} />
      {!hasVideo && <div className="absolute inset-0 flex items-center justify-center text-4xl font-semibold text-white/70">{name.slice(0, 1).toUpperCase()}</div>}
      <span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
        {hand && '✋ '}
        {name}
      </span>
    </div>
  )
}

export function VideoCall({ roomId, code, onLeave }: { roomId: string; code?: string; onLeave: () => void }) {
  const user = useAuthStore((s) => s.user)
  const token = useAuthStore((s) => s.accessToken)
  const [status, setStatus] = useState<'connecting' | 'live' | 'ended' | 'error'>('connecting')
  const [error, setError] = useState('')
  const [local, setLocal] = useState<MediaStream | null>(null)
  const [screen, setScreen] = useState<MediaStream | null>(null)
  const [remotes, setRemotes] = useState<Record<string, Remote>>({})
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const [hand, setHand] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [chat, setChat] = useState<ChatLine[]>([])
  const [draft, setDraft] = useState('')

  const socketRef = useRef<Socket | null>(null)
  const sendRef = useRef<types.Transport | null>(null)
  const recvRef = useRef<types.Transport | null>(null)
  const deviceRef = useRef<Device | null>(null)
  const producers = useRef<{ audio?: types.Producer; video?: types.Producer; screen?: types.Producer }>({})
  const consumers = useRef(new Map<string, { consumer: types.Consumer; peerId: string; source: string }>())

  const addTrack = useCallback((peerId: string, info: { userId?: string; name?: string }, track: MediaStreamTrack, source: string) => {
    setRemotes((prev) => {
      const r = prev[peerId] ?? { peerId, userId: info.userId ?? '', name: info.name ?? 'Guest', stream: new MediaStream() }
      if (source === 'screen') {
        const s = new MediaStream([track])
        return { ...prev, [peerId]: { ...r, screen: s } }
      }
      const stream = new MediaStream([...r.stream.getTracks().filter((t) => t.kind !== track.kind), track])
      return { ...prev, [peerId]: { ...r, name: info.name ?? r.name, userId: info.userId ?? r.userId, stream } }
    })
  }, [])

  const dropConsumer = useCallback((match: (c: { consumer: types.Consumer; peerId: string; source: string }) => boolean) => {
    for (const [id, c] of consumers.current) {
      if (!match(c)) continue
      c.consumer.close()
      consumers.current.delete(id)
      setRemotes((prev) => {
        const r = prev[c.peerId]
        if (!r) return prev
        if (c.source === 'screen') return { ...prev, [c.peerId]: { ...r, screen: undefined } }
        return { ...prev, [c.peerId]: { ...r, stream: new MediaStream(r.stream.getTracks().filter((t) => t.id !== c.consumer.track.id)) } }
      })
    }
  }, [])

  useEffect(() => {
    if (!token) return
    let cancelled = false
    const socket = io(FILES_URL, { path: '/video/socket.io', auth: { token }, transports: ['websocket'] })
    socketRef.current = socket

    const consume = async (p: { peerId: string; producerId: string; userId?: string; name?: string; appData?: { source?: string } }) => {
      const device = deviceRef.current
      const recv = recvRef.current
      if (!device || !recv) return
      const params = await request<{ id: string; producerId: string; kind: types.MediaKind; rtpParameters: types.RtpParameters }>(socket, 'consume', {
        producerPeerId: p.peerId,
        producerId: p.producerId,
        rtpCapabilities: device.rtpCapabilities,
      })
      const consumer = await recv.consume({ id: params.id, producerId: params.producerId, kind: params.kind, rtpParameters: params.rtpParameters })
      const source = p.appData?.source ?? (params.kind === 'audio' ? 'mic' : 'webcam')
      consumers.current.set(consumer.id, { consumer, peerId: p.peerId, source })
      addTrack(p.peerId, p, consumer.track, source)
      await request(socket, 'resumeConsumer', { consumerId: consumer.id })
    }

    const start = async () => {
      // camera and microphone first, so the browser asks before we join
      let media: MediaStream
      try {
        media = await navigator.mediaDevices.getUserMedia({ audio: true, video: { width: { ideal: 1280 }, height: { ideal: 720 } } })
      } catch {
        media = await navigator.mediaDevices.getUserMedia({ audio: true }).catch(() => new MediaStream())
        setCamOn(false)
      }
      if (cancelled) return media.getTracks().forEach((t) => t.stop())
      setLocal(media)

      const joined = await request<{ peerId: string; rtpCapabilities: types.RtpCapabilities; producers: { peerId: string; producerId: string; userId: string; name?: string; appData?: { source?: string } }[]; participants: { peerId: string; userId: string; name?: string }[] }>(socket, 'join', { roomId, code })
      const device = new Device()
      await device.load({ routerRtpCapabilities: joined.rtpCapabilities })
      deviceRef.current = device

      const sendParams = await request<types.TransportOptions>(socket, 'createTransport', { direction: 'send' })
      const send = device.createSendTransport(sendParams)
      send.on('connect', ({ dtlsParameters }, ok, fail) => void request(socket, 'connectTransport', { transportId: send.id, dtlsParameters }).then(() => ok(), fail))
      send.on('produce', ({ kind, rtpParameters, appData }, ok, fail) => void request<{ id: string }>(socket, 'produce', { transportId: send.id, kind, rtpParameters, appData }).then(ok, fail))
      sendRef.current = send

      const recvParams = await request<types.TransportOptions>(socket, 'createTransport', { direction: 'recv' })
      const recv = device.createRecvTransport(recvParams)
      recv.on('connect', ({ dtlsParameters }, ok, fail) => void request(socket, 'connectTransport', { transportId: recv.id, dtlsParameters }).then(() => ok(), fail))
      recvRef.current = recv

      const audio = media.getAudioTracks()[0]
      const video = media.getVideoTracks()[0]
      if (audio) producers.current.audio = await send.produce({ track: audio, appData: { source: 'mic' } })
      if (video) producers.current.video = await send.produce({ track: video, appData: { source: 'webcam' }, encodings: [{ maxBitrate: 900_000 }] })

      for (const p of joined.participants) if (p.peerId !== joined.peerId) setRemotes((prev) => ({ ...prev, [p.peerId]: prev[p.peerId] ?? { peerId: p.peerId, userId: p.userId, name: p.name ?? 'Guest', stream: new MediaStream() } }))
      for (const p of joined.producers) await consume(p).catch(() => undefined)
      if (!cancelled) setStatus('live')
    }

    socket.on('connect_error', (e) => {
      setError(e.message)
      setStatus('error')
    })
    socket.on('newPeer', (p: { peerId: string; userId: string; name?: string }) => setRemotes((prev) => ({ ...prev, [p.peerId]: prev[p.peerId] ?? { peerId: p.peerId, userId: p.userId, name: p.name ?? 'Guest', stream: new MediaStream() } })))
    socket.on('newProducer', (p) => void consume(p).catch(() => undefined))
    socket.on('producerClosed', ({ producerId }: { producerId: string }) => dropConsumer((c) => c.consumer.producerId === producerId))
    socket.on('consumerClosed', ({ consumerId }: { consumerId: string }) => dropConsumer((c) => c.consumer.id === consumerId))
    socket.on('peerLeft', ({ peerId }: { peerId: string }) => {
      dropConsumer((c) => c.peerId === peerId)
      setRemotes((prev) => {
        const { [peerId]: _gone, ...rest } = prev
        return rest
      })
    })
    socket.on('handRaised', ({ peerId }: { peerId: string }) => setRemotes((prev) => (prev[peerId] ? { ...prev, [peerId]: { ...prev[peerId], hand: true } } : prev)))
    socket.on('handLowered', ({ peerId }: { peerId: string }) => setRemotes((prev) => (prev[peerId] ? { ...prev, [peerId]: { ...prev[peerId], hand: false } } : prev)))
    socket.on('chatMessage', (m: { name?: string; message: string; timestamp: string }) => setChat((c) => [...c.slice(-199), { name: m.name ?? 'Guest', message: m.message, at: new Date(m.timestamp) }]))
    socket.on('roomClosed', () => setStatus('ended'))

    socket.once('connect', () =>
      start().catch((e: Error) => {
        setError(e.message)
        setStatus('error')
      })
    )

    return () => {
      cancelled = true
      socket.emit('leave', {})
      socket.close()
      sendRef.current?.close()
      recvRef.current?.close()
      setLocal((m) => (m?.getTracks().forEach((t) => t.stop()), null))
      setScreen((m) => (m?.getTracks().forEach((t) => t.stop()), null))
      consumers.current.clear()
      producers.current = {}
    }
    // the token is read once; a refreshed token is not needed for an open socket
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId, code, addTrack, dropConsumer])

  const toggle = async (kind: 'audio' | 'video') => {
    const p = producers.current[kind]
    const socket = socketRef.current
    const on = kind === 'audio' ? micOn : camOn
    const set = kind === 'audio' ? setMicOn : setCamOn
    if (p && socket) {
      if (on) {
        p.pause()
        await request(socket, 'pauseProducer', { producerId: p.id }).catch(() => undefined)
      } else {
        p.resume()
        await request(socket, 'resumeProducer', { producerId: p.id }).catch(() => undefined)
      }
    }
    local?.getTracks().filter((t) => t.kind === kind).forEach((t) => (t.enabled = !on))
    set(!on)
  }

  const shareScreen = async () => {
    const socket = socketRef.current
    if (screen) {
      const p = producers.current.screen
      if (p && socket) {
        p.close()
        await request(socket, 'closeProducer', { producerId: p.id }).catch(() => undefined)
        socket.emit('screenShareStopped')
      }
      producers.current.screen = undefined
      screen.getTracks().forEach((t) => t.stop())
      setScreen(null)
      return
    }
    const display = await navigator.mediaDevices.getDisplayMedia({ video: true }).catch(() => null)
    if (!display || !sendRef.current) return
    const track = display.getVideoTracks()[0]
    producers.current.screen = await sendRef.current.produce({ track, appData: { source: 'screen' } })
    socket?.emit('screenShareStarted')
    track.addEventListener('ended', () => void (producers.current.screen && shareScreen()))
    setScreen(display)
  }

  const raiseHand = () => {
    socketRef.current?.emit(hand ? 'lowerHand' : 'raiseHand')
    setHand(!hand)
  }

  const sendChat = (e: React.FormEvent) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    socketRef.current?.emit('chatMessage', { message: text })
    setChat((c) => [...c, { name: 'You', message: text, at: new Date(), mine: true }])
    setDraft('')
  }

  if (status === 'error' || status === 'ended')
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-white">
        <p className="text-lg">{status === 'ended' ? 'The host ended this call.' : error || 'Could not join the call.'}</p>
        <Button variant="secondary" onClick={onLeave}>
          Back
        </Button>
      </div>
    )

  const list = Object.values(remotes)
  const sharer = list.find((r) => r.screen)
  return (
    <div className="flex h-full">
      <div className="flex flex-1 flex-col">
        <div className="grid flex-1 auto-rows-min content-center gap-3 overflow-y-auto p-4 sm:grid-cols-2 lg:grid-cols-3">
          {screen && <Tile stream={screen} name="Your screen" muted big />}
          {sharer?.screen && <Tile stream={sharer.screen} name={`${sharer.name}'s screen`} big />}
          <Tile stream={local} name={`${user?.name ?? 'You'} (you)`} muted mirrored hand={hand} />
          {list.map((r) => (
            <Tile key={r.peerId} stream={r.stream} name={r.name} hand={r.hand} />
          ))}
        </div>
        <div className="flex items-center justify-center gap-2 border-t border-white/10 p-3">
          {status === 'connecting' && <span className="mr-2 text-sm text-white/70">Connecting…</span>}
          <Button variant={micOn ? 'secondary' : 'destructive'} size="icon" onClick={() => toggle('audio')} aria-label={micOn ? 'Mute' : 'Unmute'}>
            {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>
          <Button variant={camOn ? 'secondary' : 'destructive'} size="icon" onClick={() => toggle('video')} aria-label={camOn ? 'Turn camera off' : 'Turn camera on'}>
            {camOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>
          <Button variant={screen ? 'default' : 'secondary'} size="icon" onClick={shareScreen} aria-label={screen ? 'Stop sharing' : 'Share screen'} disabled={status !== 'live'}>
            <MonitorUp className="h-5 w-5" />
          </Button>
          <Button variant={hand ? 'default' : 'secondary'} size="icon" onClick={raiseHand} aria-label={hand ? 'Lower hand' : 'Raise hand'}>
            <Hand className="h-5 w-5" />
          </Button>
          <Button variant={chatOpen ? 'default' : 'secondary'} size="icon" onClick={() => setChatOpen(!chatOpen)} aria-label="Chat">
            <MessageSquare className="h-5 w-5" />
          </Button>
          <Button variant="destructive" onClick={onLeave} className="ml-2">
            <PhoneOff className="mr-1 h-4 w-4" /> Leave
          </Button>
        </div>
      </div>
      {chatOpen && (
        <aside className="flex w-80 flex-col border-l border-white/10 bg-slate-950 text-white">
          <p className="border-b border-white/10 px-4 py-2 text-sm font-semibold">In-call chat</p>
          <div className="flex-1 space-y-2 overflow-y-auto p-3 text-sm">
            {chat.length === 0 && <p className="text-white/50">Messages are visible to everyone in the call and are not saved.</p>}
            {chat.map((m, i) => (
              <p key={i}>
                <span className={cn('font-medium', m.mine && 'text-sky-300')}>{m.name}</span> <span className="text-xs text-white/40">{m.at.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <br />
                {m.message}
              </p>
            ))}
          </div>
          <form className="flex gap-2 border-t border-white/10 p-3" onSubmit={sendChat}>
            <Input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Message" maxLength={2000} className="bg-slate-900 text-white" aria-label="Chat message" />
            <Button type="submit" size="icon" aria-label="Send">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </aside>
      )}
    </div>
  )
}
