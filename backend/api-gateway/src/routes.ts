import { serviceUrl, type ServiceName } from '@devhub/shared'

export interface Route {
  /** Public path prefix handled by this route. */
  prefix: string
  service: ServiceName
  /** Rewrite the public path before forwarding (default: forward unchanged). */
  rewrite?: (path: string) => string
  /** Routes that must carry a verified identity are rejected at the edge without one. */
  auth?: 'required' | 'optional'
  /** Also accept WebSocket upgrades on this prefix. */
  ws?: boolean
}

/**
 * The public API surface. Order matters: the first matching prefix wins, so specific routes go first.
 * `/internal/*` is deliberately absent: service-to-service endpoints are never reachable from outside.
 */
export const routes: Route[] = [
  { prefix: '/api/auth', service: 'auth' },
  { prefix: '/api/users/avatar', service: 'file', rewrite: () => '/api/files/avatar', auth: 'required' },
  { prefix: '/api/users', service: 'auth' },

  { prefix: '/api/courses', service: 'course', auth: 'optional' },
  { prefix: '/api/learn', service: 'course', auth: 'required' },
  { prefix: '/api/instructor', service: 'course', auth: 'required' },
  { prefix: '/api/discussions', service: 'course', auth: 'optional' },
  { prefix: '/api/certificates', service: 'course', auth: 'optional' },
  { prefix: '/api/dashboard', service: 'course', auth: 'required' },

  { prefix: '/api/payments/webhook', service: 'payment' }, // authenticated by Stripe's signature, not a user
  { prefix: '/api/payments/config', service: 'payment' },
  { prefix: '/api/payments', service: 'payment', auth: 'required' },

  { prefix: '/api/notifications', service: 'notification', auth: 'required' },
  { prefix: '/ws/editor', service: 'editor', ws: true }, // Yjs documents; the editor-service verifies the token itself
  { prefix: '/api/editor', service: 'editor', auth: 'required' },
  { prefix: '/api/files', service: 'file', auth: 'required' },
  { prefix: '/uploads', service: 'file' },

  { prefix: '/api/admin/email', service: 'email', auth: 'required' },
  { prefix: '/api/admin/search-engine', service: 'elasticsearch', auth: 'required' },
  { prefix: '/api/search', service: 'search', auth: 'optional' },
  { prefix: '/api/analytics', service: 'analytics', auth: 'optional' },
  { prefix: '/api/projects', service: 'project', auth: 'optional' },
  { prefix: '/api/teams', service: 'project', auth: 'required' },
  { prefix: '/api/social', service: 'project', auth: 'optional' },
  { prefix: '/api/boards', service: 'kanban', auth: 'required' },
  { prefix: '/api/tasks', service: 'kanban', auth: 'required' },
  { prefix: '/api/video', service: 'video', auth: 'required' },
  { prefix: '/api/reports', service: 'reporting', auth: 'required' },
  { prefix: '/api/audit', service: 'audit', auth: 'required' },
  { prefix: '/socket.io', service: 'websocket', ws: true }, // Socket.IO authenticates in its own handshake
  { prefix: '/graphql', service: 'graphql', auth: 'optional' },
  { prefix: '/trpc', service: 'trpc', auth: 'optional' },
]

export const match = (path: string): Route | undefined =>
  routes.find((r) => path === r.prefix || path.startsWith(r.prefix + '/') || path.startsWith(r.prefix + '?'))

/** Services whose /health the gateway aggregates. */
export const monitored: ServiceName[] = ['auth', 'course', 'payment', 'notification', 'websocket', 'editor', 'file', 'search', 'elasticsearch', 'analytics', 'project', 'kanban', 'video', 'email', 'audit', 'reporting', 'graphql', 'trpc']
export const targetOf = (service: ServiceName) => serviceUrl(service)
