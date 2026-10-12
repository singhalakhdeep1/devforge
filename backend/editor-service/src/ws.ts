import type { IncomingMessage, Server } from 'node:http'
import type { Duplex } from 'node:stream'
import { WebSocketServer, type WebSocket } from 'ws'
import { createLogger, verifyAccessToken, websocketConnections } from '@devhub/shared'
import { loadWithAccess } from './access'
import { getRoom } from './rooms'

const log = createLogger('editor')

interface Live extends WebSocket {
  alive?: boolean
}

/**
 * WebSocket endpoint: ws://host/ws/editor?documentId=<uuid>&token=<access token>
 * The caller's identity comes from the verified token and the document's access rules, never from
 * query parameters the client could make up.
 */
export function attachWebSocket(server: Server) {
  const wss = new WebSocketServer({ noServer: true, maxPayload: 2_000_000 })

  const reject = (socket: Duplex, code: number, reason: string) => {
    socket.write(`HTTP/1.1 ${code} ${reason}\r\nConnection: close\r\n\r\n`)
    socket.destroy()
  }

  server.on('upgrade', async (req: IncomingMessage, socket: Duplex, head: Buffer) => {
    const url = new URL(req.url ?? '/', 'http://localhost')
    if (url.pathname !== '/ws/editor') return // other upgrade handlers (none today) may claim it
    try {
      const user = verifyAccessToken(url.searchParams.get('token') ?? '')
      const found = await loadWithAccess(url.searchParams.get('documentId') ?? '', user.id)
      if (!found) return reject(socket, 403, 'Forbidden')
      const room = await getRoom(found.doc.id)
      if (!room) return reject(socket, 404, 'Not Found')

      wss.handleUpgrade(req, socket, head, (ws: Live) => {
        ws.alive = true
        room.attach(ws, found.access === 'owner' ? 'edit' : found.access)
        websocketConnections.inc({ service: 'editor' })
        ws.on('pong', () => (ws.alive = true))
        ws.on('message', (data: Buffer) => {
          try {
            room.handleMessage(ws, new Uint8Array(data))
          } catch (e) {
            log.logWarning('bad editor frame', { error: String(e) })
          }
        })
        ws.on('close', () => {
          websocketConnections.dec({ service: 'editor' })
          room.detach(ws)
        })
        ws.on('error', () => ws.terminate())
      })
    } catch {
      reject(socket, 401, 'Unauthorized')
    }
  })

  // drop half-open connections
  const heartbeat = setInterval(() => {
    for (const ws of wss.clients as Set<Live>) {
      if (ws.alive === false) { ws.terminate(); continue }
      ws.alive = false
      ws.ping()
    }
  }, 30_000)
  heartbeat.unref()

  return { wss, close: () => { clearInterval(heartbeat); wss.close() } }
}
