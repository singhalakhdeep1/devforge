/**
 * Yjs rooms: one live Y.Doc per open document, kept in sync with every connected client,
 * persisted to Postgres, and relayed through Redis so several editor-service instances share a room.
 */
import crypto from 'node:crypto'
import * as decoding from 'lib0/decoding'
import * as encoding from 'lib0/encoding'
import type { WebSocket } from 'ws'
import * as awarenessProtocol from 'y-protocols/awareness'
import * as syncProtocol from 'y-protocols/sync'
import * as Y from 'yjs'
import { createLogger, createRedis, getRedis } from '@devhub/shared'
import { prisma } from './db'

const log = createLogger('editor')

export const MESSAGE_SYNC = 0
export const MESSAGE_AWARENESS = 1
export type Access = 'owner' | 'edit' | 'view'

const INSTANCE = crypto.randomUUID()
const RELAY_CHANNEL = 'editor:yjs'
const PERSIST_DEBOUNCE_MS = 2000
const PERSIST_MAX_WAIT_MS = 10_000
const EVICT_AFTER_MS = 60_000
const MAX_UPDATE_BYTES = 2_000_000

interface Conn {
  access: Access
  controlled: Set<number> // awareness client ids this socket owns, removed when it leaves
}

export class Room {
  readonly doc = new Y.Doc()
  readonly awareness = new awarenessProtocol.Awareness(this.doc)
  readonly conns = new Map<WebSocket, Conn>()
  private persistTimer?: NodeJS.Timeout
  private firstDirtyAt = 0
  private evictTimer?: NodeJS.Timeout

  constructor(readonly id: string) {
    this.awareness.setLocalState(null) // the server is not a participant

    this.doc.on('update', (update: Uint8Array, origin: unknown) => {
      const enc = encoding.createEncoder()
      encoding.writeVarUint(enc, MESSAGE_SYNC)
      syncProtocol.writeUpdate(enc, update)
      this.broadcast(encoding.toUint8Array(enc))
      if (origin !== 'redis') {
        void publishRelay({ t: 'u', doc: this.id, data: Buffer.from(update).toString('base64') })
      }
      if (origin !== 'load') this.schedulePersist()
    })

    this.awareness.on('update', ({ added, updated, removed }: { added: number[]; updated: number[]; removed: number[] }, origin: unknown) => {
      const changed = [...added, ...updated, ...removed]
      if (origin instanceof Object && 'send' in origin) {
        const conn = this.conns.get(origin as WebSocket)
        if (conn) {
          added.forEach((c) => conn.controlled.add(c))
          removed.forEach((c) => conn.controlled.delete(c))
        }
      }
      const enc = encoding.createEncoder()
      encoding.writeVarUint(enc, MESSAGE_AWARENESS)
      encoding.writeVarUint8Array(enc, awarenessProtocol.encodeAwarenessUpdate(this.awareness, changed))
      this.broadcast(encoding.toUint8Array(enc))
      if (origin !== 'redis') {
        void publishRelay({ t: 'a', doc: this.id, data: Buffer.from(awarenessProtocol.encodeAwarenessUpdate(this.awareness, changed)).toString('base64') })
      }
    })
  }

  get text(): Y.Text {
    return this.doc.getText('content')
  }

  private broadcast(message: Uint8Array) {
    for (const ws of this.conns.keys()) {
      if (ws.readyState === ws.OPEN) ws.send(message, (err) => err && ws.terminate())
    }
  }

  /** Called for every binary frame from a client. Viewers can sync down and show a cursor, never write. */
  handleMessage(ws: WebSocket, data: Uint8Array) {
    const conn = this.conns.get(ws)
    if (!conn || data.byteLength > MAX_UPDATE_BYTES) return
    const decoder = decoding.createDecoder(data)
    const type = decoding.readVarUint(decoder)

    if (type === MESSAGE_SYNC) {
      const enc = encoding.createEncoder()
      encoding.writeVarUint(enc, MESSAGE_SYNC)
      const syncType = decoding.readVarUint(decoder)
      if (syncType === syncProtocol.messageYjsSyncStep1) {
        syncProtocol.readSyncStep1(decoder, enc, this.doc) // asking for our state is always allowed
      } else if (conn.access !== 'view') {
        if (syncType === syncProtocol.messageYjsSyncStep2) syncProtocol.readSyncStep2(decoder, this.doc, ws)
        else if (syncType === syncProtocol.messageYjsUpdate) syncProtocol.readUpdate(decoder, this.doc, ws)
      }
      if (encoding.length(enc) > 1) ws.send(encoding.toUint8Array(enc))
    } else if (type === MESSAGE_AWARENESS) {
      awarenessProtocol.applyAwarenessUpdate(this.awareness, decoding.readVarUint8Array(decoder), ws)
    }
  }

  attach(ws: WebSocket, access: Access) {
    clearTimeout(this.evictTimer)
    this.conns.set(ws, { access, controlled: new Set() })
    // greet the client: our state vector (it answers with what we lack) and who is here
    const sync = encoding.createEncoder()
    encoding.writeVarUint(sync, MESSAGE_SYNC)
    syncProtocol.writeSyncStep1(sync, this.doc)
    ws.send(encoding.toUint8Array(sync))
    const states = this.awareness.getStates()
    if (states.size > 0) {
      const aw = encoding.createEncoder()
      encoding.writeVarUint(aw, MESSAGE_AWARENESS)
      encoding.writeVarUint8Array(aw, awarenessProtocol.encodeAwarenessUpdate(this.awareness, [...states.keys()]))
      ws.send(encoding.toUint8Array(aw))
    }
  }

  detach(ws: WebSocket) {
    const conn = this.conns.get(ws)
    this.conns.delete(ws)
    if (conn) awarenessProtocol.removeAwarenessStates(this.awareness, [...conn.controlled], null)
    if (this.conns.size === 0) {
      void this.persist() // do not wait for the debounce when the last editor leaves
      this.evictTimer = setTimeout(() => rooms.delete(this.id) && this.destroy(), EVICT_AFTER_MS)
    }
  }

  private schedulePersist() {
    const now = Date.now()
    if (!this.firstDirtyAt) this.firstDirtyAt = now
    clearTimeout(this.persistTimer)
    // debounce, but never postpone beyond the max wait so a long editing burst is still saved
    const wait = Math.min(PERSIST_DEBOUNCE_MS, Math.max(0, this.firstDirtyAt + PERSIST_MAX_WAIT_MS - now))
    this.persistTimer = setTimeout(() => void this.persist(), wait)
  }

  async persist() {
    clearTimeout(this.persistTimer)
    if (!this.firstDirtyAt) return
    this.firstDirtyAt = 0
    try {
      await prisma.document.update({
        where: { id: this.id },
        data: { state: Buffer.from(Y.encodeStateAsUpdate(this.doc)), length: this.text.length },
      })
    } catch (e) {
      this.firstDirtyAt = Date.now() // retry on the next change
      log.logWarning('could not persist document', { id: this.id, error: String(e) })
    }
  }

  destroy() {
    clearTimeout(this.persistTimer)
    clearTimeout(this.evictTimer)
    this.awareness.destroy()
    this.doc.destroy()
  }
}

const rooms = new Map<string, Room>()
const loading = new Map<string, Promise<Room | null>>()

/** The live room for a document, loading its saved state on first use. Null if the document does not exist. */
export function getRoom(id: string): Promise<Room | null> {
  const existing = rooms.get(id)
  if (existing) return Promise.resolve(existing)
  let p = loading.get(id)
  if (!p) {
    p = (async () => {
      const row = await prisma.document.findUnique({ where: { id }, select: { state: true } })
      if (!row) return null
      const room = new Room(id)
      if (row.state) Y.applyUpdate(room.doc, new Uint8Array(row.state), 'load')
      rooms.set(id, room)
      return room
    })().finally(() => loading.delete(id))
    loading.set(id, p)
  }
  return p
}

export const openRoom = (id: string) => rooms.get(id)

/** Text of a document, from the live room when open, otherwise from storage. */
export async function currentText(id: string): Promise<string | null> {
  const live = rooms.get(id)
  if (live) return live.text.toString()
  const row = await prisma.document.findUnique({ where: { id }, select: { state: true } })
  if (!row) return null
  const doc = new Y.Doc()
  if (row.state) Y.applyUpdate(doc, new Uint8Array(row.state))
  const text = doc.getText('content').toString()
  doc.destroy()
  return text
}

/** Replace the whole text through the live document so connected editors see it as a normal edit. */
export async function replaceText(id: string, text: string): Promise<void> {
  const room = await getRoom(id)
  if (!room) return
  room.doc.transact(() => {
    room.text.delete(0, room.text.length)
    room.text.insert(0, text)
  }, 'server')
  await room.persist()
}

export async function flushAll() {
  await Promise.all([...rooms.values()].map((r) => r.persist()))
}

export const stats = () => ({ rooms: rooms.size, connections: [...rooms.values()].reduce((n, r) => n + r.conns.size, 0) })

/* ───────────── relay between instances ───────────── */

async function publishRelay(msg: { t: 'u' | 'a'; doc: string; data: string }) {
  try {
    await getRedis().publish(RELAY_CHANNEL, JSON.stringify({ ...msg, from: INSTANCE }))
  } catch {
    /* relay is best effort; each instance still converges when clients reconnect */
  }
}

let relayStarted = false
export async function startRelay() {
  if (relayStarted) return
  relayStarted = true
  const sub = createRedis({ name: 'editor-relay' })
  await sub.subscribe(RELAY_CHANNEL)
  sub.on('message', (_c, raw) => {
    try {
      const m = JSON.parse(raw) as { t: string; doc: string; data: string; from: string }
      if (m.from === INSTANCE) return
      const room = rooms.get(m.doc)
      if (!room) return // nobody here has it open
      const bytes = new Uint8Array(Buffer.from(m.data, 'base64'))
      if (m.t === 'u') Y.applyUpdate(room.doc, bytes, 'redis')
      else if (m.t === 'a') awarenessProtocol.applyAwarenessUpdate(room.awareness, bytes, 'redis')
    } catch (e) {
      log.logWarning('bad relay message', { error: String(e) })
    }
  })
}
