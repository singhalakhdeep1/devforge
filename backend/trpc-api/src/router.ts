/**
 * tRPC router. Procedures call the owning services with the caller's identity (forwarded by the
 * gateway), so their permission rules apply unchanged. The flat procedures from the first version
 * (getAnalytics, saveDocument, ...) are kept; newer ones are grouped by area.
 */
import { initTRPC, TRPCError } from '@trpc/server'
import { z } from 'zod'
import { createServiceClient, type AuthUser, type ServiceName } from '@devhub/shared'

export interface Context {
  user?: AuthUser
}

const t = initTRPC.context<Context>().create({
  errorFormatter: ({ shape, error }) => ({ ...shape, data: { ...shape.data, stack: process.env.NODE_ENV === 'production' ? undefined : shape.data.stack, cause: error.cause?.message } }),
})

const clients = new Map<ServiceName, ReturnType<typeof createServiceClient>>()
const svc = (name: ServiceName) => {
  let c = clients.get(name)
  if (!c) clients.set(name, (c = createServiceClient(name, { timeoutMs: 10_000 })))
  return c
}

const CODES: Record<number, TRPCError['code']> = { 400: 'BAD_REQUEST', 401: 'UNAUTHORIZED', 403: 'FORBIDDEN', 404: 'NOT_FOUND', 409: 'CONFLICT', 422: 'UNPROCESSABLE_CONTENT', 429: 'TOO_MANY_REQUESTS' }

/** Calls a service and maps its HTTP errors to tRPC errors. */
async function call<T = any>(user: AuthUser | undefined, name: ServiceName, method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE', url: string, data?: unknown, params?: object): Promise<T> {
  try {
    return await svc(name).request<T>({ method, url, data, params }, user)
  } catch (e) {
    const status = (e as { statusCode?: number }).statusCode ?? 500
    throw new TRPCError({ code: CODES[status] ?? 'INTERNAL_SERVER_ERROR', message: (e as Error).message })
  }
}

const publicProcedure = t.procedure
const authed = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Sign in first' })
  return next({ ctx: { user: ctx.user } })
})
const admin = authed.use(({ ctx, next }) => {
  if (ctx.user.role !== 'ADMIN') throw new TRPCError({ code: 'FORBIDDEN', message: 'Admins only' })
  return next()
})

const id = z.string().min(1)

/** Boards of one project, or (without a project) of every project the caller belongs to. */
async function visibleBoards(user: AuthUser, projectId?: string): Promise<{ id: string; projectId: string; name: string }[]> {
  const projectIds = projectId ? [projectId] : (await call<{ data: { id: string }[] }>(user, 'project', 'GET', '/api/projects', undefined, { scope: 'mine', pageSize: 50 })).data.map((p) => p.id)
  const perProject = await Promise.all(
    projectIds.map((pid) => call<{ boards: { id: string; name: string }[] }>(user, 'kanban', 'GET', '/api/boards', undefined, { projectId: pid }).then((r) => r.boards.map((b) => ({ ...b, projectId: pid }))).catch(() => [])),
  )
  return perProject.flat()
}
const days = z.number().int().min(1).max(365).default(30)

const authRouter = t.router({
  login: publicProcedure.input(z.object({ email: z.string().email(), password: z.string().min(1) })).mutation(({ input }) => call(undefined, 'auth', 'POST', '/api/auth/login', input)),
  register: publicProcedure.input(z.object({ email: z.string().email(), password: z.string().min(8), name: z.string().min(1) })).mutation(({ input }) => call(undefined, 'auth', 'POST', '/api/auth/register', input)),
  me: authed.query(({ ctx }) => call(ctx.user, 'auth', 'GET', '/api/auth/me')),
})

const documentsRouter = t.router({
  list: authed.query(({ ctx }) => call(ctx.user, 'editor', 'GET', '/api/editor/documents')),
  get: authed.input(z.object({ id })).query(async ({ ctx, input }) => {
    const [doc, text] = await Promise.all([call(ctx.user, 'editor', 'GET', `/api/editor/documents/${input.id}`), call<{ text: string }>(ctx.user, 'editor', 'GET', `/api/editor/documents/${input.id}/text`)])
    return { ...doc, content: text.text }
  }),
  create: authed.input(z.object({ title: z.string().min(1).max(120), language: z.string().optional(), content: z.string().optional() })).mutation(({ ctx, input }) => call(ctx.user, 'editor', 'POST', '/api/editor/documents', { title: input.title, language: input.language, text: input.content })),
  save: authed.input(z.object({ id, content: z.string().max(500_000), title: z.string().min(1).max(120).optional() })).mutation(async ({ ctx, input }) => {
    if (input.title) await call(ctx.user, 'editor', 'PATCH', `/api/editor/documents/${input.id}`, { title: input.title })
    await call(ctx.user, 'editor', 'PUT', `/api/editor/documents/${input.id}/text`, { text: input.content })
    return { success: true, documentId: input.id, savedAt: new Date().toISOString() }
  }),
  delete: authed.input(z.object({ id })).mutation(async ({ ctx, input }) => (await call(ctx.user, 'editor', 'DELETE', `/api/editor/documents/${input.id}`), { success: true })),
})

const kanbanRouter = t.router({
  boards: authed.input(z.object({ projectId: z.string().optional() }).optional()).query(({ ctx, input }) => visibleBoards(ctx.user, input?.projectId)),
  board: authed.input(z.object({ id })).query(({ ctx, input }) => call(ctx.user, 'kanban', 'GET', `/api/boards/${input.id}`)),
  createTask: authed
    .input(z.object({ boardId: id, columnId: id, title: z.string().min(1).max(200), description: z.string().optional(), priority: z.enum(['LOWEST', 'LOW', 'MEDIUM', 'HIGH', 'HIGHEST']).optional(), assigneeId: z.string().optional() }))
    .mutation(({ ctx, input }) => call(ctx.user, 'kanban', 'POST', '/api/tasks', input)),
  updateTask: authed.input(z.object({ id, patch: z.record(z.unknown()) })).mutation(({ ctx, input }) => call(ctx.user, 'kanban', 'PATCH', `/api/tasks/${input.id}`, input.patch)),
  moveTask: authed.input(z.object({ id, columnId: id, index: z.number().int().min(0).optional() })).mutation(({ ctx, input }) => call(ctx.user, 'kanban', 'POST', `/api/tasks/${input.id}/move`, { columnId: input.columnId, index: input.index })),
  deleteTask: authed.input(z.object({ id })).mutation(async ({ ctx, input }) => (await call(ctx.user, 'kanban', 'DELETE', `/api/tasks/${input.id}`), { success: true })),
  // tasks assigned to the caller across every board they can see
  myTasks: authed.query(async ({ ctx }) => {
    const boards = await visibleBoards(ctx.user)
    const all = await Promise.all(boards.map((b) => call<{ tasks: object[] }>(ctx.user, 'kanban', 'GET', `/api/boards/${b.id}`, undefined, { assignee: 'me' }).catch(() => ({ tasks: [] }))))
    return all.flatMap((b, i) => b.tasks.map((t) => ({ ...t, boardId: boards[i].id })))
  }),
})

const notificationsRouter = t.router({
  list: authed.input(z.object({ limit: z.number().int().min(1).max(100).default(20), offset: z.number().int().min(0).default(0) }).optional()).query(({ ctx, input }) => call(ctx.user, 'notification', 'GET', '/api/notifications', undefined, input)),
  unreadCount: authed.query(async ({ ctx }) => (await call<{ unread: number }>(ctx.user, 'notification', 'GET', '/api/notifications/unread-count')).unread),
  markRead: authed.input(z.object({ id })).mutation(async ({ ctx, input }) => (await call(ctx.user, 'notification', 'POST', `/api/notifications/${input.id}/read`), { success: true })),
  markAllRead: authed.mutation(({ ctx }) => call(ctx.user, 'notification', 'POST', '/api/notifications/read-all')),
})

const analyticsRouter = t.router({
  me: authed.input(z.object({ days }).optional()).query(({ ctx, input }) => call(ctx.user, 'analytics', 'GET', '/api/analytics/me', undefined, { days: input?.days ?? 30 })),
  overview: admin.input(z.object({ days }).optional()).query(({ ctx, input }) => call(ctx.user, 'analytics', 'GET', '/api/analytics/admin/overview', undefined, { days: input?.days ?? 30 })),
})

export const appRouter = t.router({
  auth: authRouter,
  documents: documentsRouter,
  kanban: kanbanRouter,
  notifications: notificationsRouter,
  analytics: analyticsRouter,

  // first-version procedures, same names and inputs
  getAnalytics: authed.input(z.object({ userId: z.string().optional(), startDate: z.string().optional(), endDate: z.string().optional() })).query(async ({ ctx, input }) => {
    if (input.userId && input.userId !== ctx.user.id) throw new TRPCError({ code: 'FORBIDDEN', message: 'You can only read your own analytics' })
    const to = input.endDate ? new Date(input.endDate) : new Date()
    const from = input.startDate ? new Date(input.startDate) : new Date(to.getTime() - 29 * 86_400_000)
    const span = Math.min(365, Math.max(1, Math.round((to.getTime() - from.getTime()) / 86_400_000) + 1))
    return call(ctx.user, 'analytics', 'GET', '/api/analytics/me', undefined, { days: span })
  }),
  saveDocument: authed.input(z.object({ documentId: id, content: z.string().max(500_000), title: z.string().optional() })).mutation(({ ctx, input }) => documentsRouter.createCaller(ctx).save({ id: input.documentId, content: input.content, title: input.title || undefined })),
  getDocument: authed.input(z.object({ documentId: id })).query(({ ctx, input }) => documentsRouter.createCaller(ctx).get({ id: input.documentId })),
  getBoard: authed.input(z.object({ boardId: id })).query(({ ctx, input }) => call(ctx.user, 'kanban', 'GET', `/api/boards/${input.boardId}`)),
  createCard: authed.input(z.object({ boardId: id, columnId: id, title: z.string().min(1).max(200), description: z.string().optional() })).mutation(({ ctx, input }) => call(ctx.user, 'kanban', 'POST', '/api/tasks', input)),
  login: authRouter.login,
  register: authRouter.register,
  getNotifications: authed.query(({ ctx }) => call(ctx.user, 'notification', 'GET', '/api/notifications')),
})

export type AppRouter = typeof appRouter
