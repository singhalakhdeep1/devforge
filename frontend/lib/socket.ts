import { io, Socket } from 'socket.io-client'
import { FILES_URL } from './api/client'
import { useAuthStore } from './store/authStore'

let socket: Socket | null = null
let connectedToken: string | null = null

/**
 * Shared realtime connection (notifications + collaborative editor rooms).
 * Reconnects with a fresh access token when the session was refreshed.
 */
export function getSocket(): Socket | null {
  const token = useAuthStore.getState().accessToken
  if (!token) return null

  if (socket && connectedToken === token) return socket
  socket?.close()

  connectedToken = token
  socket = io(FILES_URL, { auth: { token }, transports: ['websocket'], reconnectionDelayMax: 10_000 })
  return socket
}

export function closeSocket() {
  socket?.close()
  socket = null
  connectedToken = null
}
