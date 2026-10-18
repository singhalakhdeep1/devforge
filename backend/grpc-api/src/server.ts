/**
 * gRPC API (HTTP/2, port GRPC_PORT, default 50051) implementing devforge.proto. Each call is
 * authenticated from the `authorization` metadata and forwarded to the owning service with the
 * caller's identity. An HTTP side (health, readiness, metrics) runs on the usual service port.
 */
import path from 'node:path'
import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import { AppError, createLogger, createServiceClient, envInt, startService, verifyAccessToken, type AuthUser, type ServiceName } from '@devhub/shared'

const log = createLogger('grpc')
const PROTO = path.join(__dirname, '..', 'src', 'devforge.proto')
const definition = protoLoader.loadSync(PROTO, { keepCase: true, longs: String, enums: String, defaults: true, oneofs: true })
const proto = grpc.loadPackageDefinition(definition) as any

const clients = new Map<ServiceName, ReturnType<typeof createServiceClient>>()
const svc = (name: ServiceName) => {
  let c = clients.get(name)
  if (!c) clients.set(name, (c = createServiceClient(name, { timeoutMs: 10_000 })))
  return c
}

/** Maps HTTP-style errors from the services to gRPC status codes. */
function toStatus(e: unknown): grpc.ServiceError {
  const status = (e as AppError).statusCode ?? 500
  const code =
    status === 400 || status === 422 ? grpc.status.INVALID_ARGUMENT
      : status === 401 ? grpc.status.UNAUTHENTICATED
        : status === 403 ? grpc.status.PERMISSION_DENIED
          : status === 404 ? grpc.status.NOT_FOUND
            : status === 409 ? grpc.status.ALREADY_EXISTS
              : status === 429 ? grpc.status.RESOURCE_EXHAUSTED
                : status === 503 ? grpc.status.UNAVAILABLE
                  : grpc.status.INTERNAL
  return Object.assign(new Error((e as Error).message || 'Request failed'), { code, details: (e as Error).message, metadata: new grpc.Metadata() })
}

function callerOf(call: grpc.ServerUnaryCall<unknown, unknown>): AuthUser {
  const raw = String(call.metadata.get('authorization')[0] ?? '')
  if (!raw) throw AppError.unauthorized('Send metadata "authorization: Bearer <token>"')
  try {
    return verifyAccessToken(raw.replace(/^Bearer\s+/i, ''))
  } catch {
    throw AppError.unauthorized('Invalid or expired token')
  }
}

/** Wraps an async handler: resolves the caller (unless public) and converts errors. */
const unary = <Req, Res>(fn: (req: Req, user: AuthUser | undefined) => Promise<Res>, isPublic = false): grpc.handleUnaryCall<Req, Res> => (call, callback) => {
  const started = Date.now()
  Promise.resolve()
    .then(() => fn(call.request, isPublic ? undefined : callerOf(call as grpc.ServerUnaryCall<unknown, unknown>)))
    .then((res) => callback(null, res))
    .catch((e) => {
      log.logWarning('grpc call failed', { method: call.getPath(), error: (e as Error).message, ms: Date.now() - started })
      callback(toStatus(e))
    })
}

const daysBetween = (start?: string, end?: string) => {
  const to = end ? new Date(end) : new Date()
  const from = start ? new Date(start) : new Date(to.getTime() - 29 * 86_400_000)
  return Math.min(365, Math.max(1, Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1))
}

const handlers = {
  Analytics: {
    GetAnalytics: unary<{ userId: string; startDate: string; endDate: string }, object>(async (req, user) => {
      const days = daysBetween(req.startDate, req.endDate)
      const target = req.userId || user!.id
      // analytics-service only exposes a user's own activity (admins use the platform overview)
      if (target !== user!.id) throw AppError.forbidden('You can only read your own analytics')
      const stats = await svc('analytics').get<{ activeDays: number; topEvents: { name: string; count: number }[] }>('/api/analytics/me', { days }, user)
      return {
        userId: target,
        pageViews: stats.topEvents.filter((e) => /page_?view/i.test(e.name)).reduce((s, e) => s + e.count, 0),
        uniqueVisitors: stats.activeDays,
        bounceRate: 0,
        avgSessionDuration: 0,
        json: JSON.stringify(stats),
      }
    }),
  },

  Editor: {
    SaveDocument: unary<{ documentId: string; content: string; title: string; language: string }, object>(async (req, user) => {
      let id = req.documentId
      if (!id) {
        if (!req.title) throw AppError.badRequest('title is required to create a document')
        id = (await svc('editor').post<{ id: string }>('/api/editor/documents', { title: req.title, ...(req.language ? { language: req.language } : {}), text: req.content }, user)).id
      } else {
        if (req.title) await svc('editor').patch(`/api/editor/documents/${id}`, { title: req.title }, user)
        await svc('editor').put(`/api/editor/documents/${id}/text`, { text: req.content }, user)
      }
      return { success: true, documentId: id, savedAt: new Date().toISOString() }
    }),
    GetDocument: unary<{ documentId: string }, object>(async (req, user) => {
      const [doc, text] = await Promise.all([
        svc('editor').get<any>(`/api/editor/documents/${req.documentId}`, undefined, user),
        svc('editor').get<{ text: string }>(`/api/editor/documents/${req.documentId}/text`, undefined, user),
      ])
      return { documentId: doc.id, title: doc.title, content: text.text, updatedAt: new Date(doc.updatedAt).toISOString(), language: doc.language, access: doc.access }
    }),
  },

  Kanban: {
    GetBoard: unary<{ boardId: string }, object>(async (req, user) => {
      const b = await svc('kanban').get<any>(`/api/boards/${req.boardId}`, undefined, user)
      return {
        boardId: b.id,
        name: b.name,
        columns: (b.columns ?? []).map((c: any) => ({ id: c.id, name: c.name, taskCount: c.count ?? 0, wipLimit: c.wipLimit ?? 0 })),
        cards: (b.tasks ?? []).map((t: any) => ({ id: t.id, columnId: t.columnId, title: t.title, priority: t.priority ?? '', assigneeId: t.assignee?.id ?? '' })),
      }
    }),
    CreateCard: unary<{ columnId: string; title: string; description: string; boardId: string; priority: string }, object>(async (req, user) => {
      if (!req.boardId) throw AppError.badRequest('boardId is required')
      const t = await svc('kanban').post<any>('/api/tasks', { boardId: req.boardId, columnId: req.columnId, title: req.title, ...(req.description ? { description: req.description } : {}), ...(req.priority ? { priority: req.priority } : {}) }, user)
      return { success: true, cardId: t.id, columnId: t.columnId }
    }),
  },

  Auth: {
    Login: unary<{ email: string; password: string }, object>(async (req) => {
      const r = await svc('auth').post<any>('/api/auth/login', { email: req.email, password: req.password })
      if (r.requires2FA) return { success: false, token: '', requires2FA: true, challengeToken: r.challengeToken }
      return { success: true, token: r.accessToken, user: { id: r.user.id, email: r.user.email, name: r.user.name, role: r.user.role } }
    }, true),
    Register: unary<{ email: string; password: string; name: string }, object>(async (req) => {
      const r = await svc('auth').post<any>('/api/auth/register', { email: req.email, password: req.password, name: req.name })
      return { success: true, userId: r.user.id, email: r.user.email, name: r.user.name, token: r.accessToken ?? '' }
    }, true),
  },
}

const grpcServer = new grpc.Server({ 'grpc.max_receive_message_length': 4 * 1024 * 1024 })
for (const [name, impl] of Object.entries(handlers)) grpcServer.addService(proto.devforge[name].service, impl as grpc.UntypedServiceImplementation)

const grpcPort = envInt('GRPC_PORT', 50051)
let bound = false

void startService({
  name: 'grpc',
  cors: false,
  routes: (app) => {
    app.get('/api/grpc/services', (_req, res) => res.json({ port: grpcPort, proto: 'devforge.proto', services: Object.fromEntries(Object.entries(handlers).map(([s, m]) => [`devforge.${s}`, Object.keys(m)])) }))
  },
  ready: { grpc: async () => bound },
  onStart: () =>
    new Promise<void>((resolve, reject) =>
      grpcServer.bindAsync(`0.0.0.0:${grpcPort}`, grpc.ServerCredentials.createInsecure(), (err) => {
        if (err) return reject(err)
        bound = true
        log.logInformation('gRPC listening', { port: grpcPort })
        resolve()
      }),
    ),
  onStop: () => new Promise<void>((resolve) => grpcServer.tryShutdown(() => resolve())),
})
