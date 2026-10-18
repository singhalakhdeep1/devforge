/**
 * Query and mutation resolvers. Each one calls the service that owns the data, forwarding the
 * caller's identity (the services enforce their own permissions), so GraphQL adds no rules of its own.
 */
import { GraphQLError } from 'graphql'
import { DateTimeResolver, JSONResolver } from 'graphql-scalars'
import { AppError, createServiceClient, getRedis, onlineUsers, type AuthUser, type ServiceName } from '@devhub/shared'

export interface Context {
  user?: AuthUser
}

const clients = new Map<ServiceName, ReturnType<typeof createServiceClient>>()
const client = (name: ServiceName) => {
  let c = clients.get(name)
  if (!c) clients.set(name, (c = createServiceClient(name, { timeoutMs: 10_000 })))
  return c
}

/** Calls a service; service errors become GraphQL errors with the same status and message. */
async function call<T = any>(ctx: Context, service: ServiceName, method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE', url: string, body?: unknown, params?: object): Promise<T> {
  try {
    return await client(service).request<T>({ method, url, data: body, params }, ctx.user)
  } catch (e) {
    const err = e as AppError & { statusCode?: number; status?: number }
    const status = err.statusCode ?? err.status ?? 500
    const code = status === 401 ? 'UNAUTHENTICATED' : status === 403 ? 'FORBIDDEN' : status === 404 ? 'NOT_FOUND' : status === 400 || status === 409 || status === 422 ? 'BAD_USER_INPUT' : 'INTERNAL_SERVER_ERROR'
    throw new GraphQLError(err.message || 'Request failed', { extensions: { code, http: { status } } })
  }
}

const needUser = (ctx: Context) => {
  if (!ctx.user) throw new GraphQLError('Sign in first', { extensions: { code: 'UNAUTHENTICATED' } })
  return ctx.user
}

const clean = <T extends object>(o: T) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== null)) as Partial<T>
const withRaw = <T extends object>(o: T) => ({ ...o, raw: o })

// ---- shapers (services return richer objects; GraphQL exposes the common fields plus raw) ----
const user = (u: any) => u && withRaw({ ...u, avatar: u.avatar ?? u.avatarUrl ?? null })
const task = (t: any) => t && withRaw({ ...t, assigneeId: t.assigneeId ?? t.assignee?.id ?? null, dueDate: t.dueDate ? new Date(t.dueDate).toISOString() : null })
const board = (b: any) => b && withRaw({ ...b, columns: (b.columns ?? []).map((c: any) => ({ ...c, taskCount: c.count ?? c.taskCount })), tasks: (b.tasks ?? []).map(task), sprints: (b.sprints ?? []).map(withRaw), labels: b.labels ?? [] })
const course = (c: any) => c && withRaw({ ...c, price: c.price === undefined ? null : Number(c.price) })
const project = (p: any) => p && withRaw({ ...p, stars: p.stars ?? p.starCount ?? p._count?.stars ?? null, tags: p.tags ?? [] })
const doc = (d: any) => d && withRaw(d)
const notification = (n: any) => ({ id: n.id ?? n._id, type: n.type, title: n.title, message: n.message ?? n.body, link: n.link ?? n.actionUrl ?? null, read: Boolean(n.read ?? n.readAt), createdAt: n.createdAt })
const list = (r: any) => (Array.isArray(r) ? r : (r?.data ?? r?.items ?? []))

/** Boards of one project, or (without a project) of every project the caller belongs to. */
async function visibleBoards(ctx: Context, projectId?: string): Promise<any[]> {
  const projectIds = projectId ? [projectId] : list(await call(ctx, 'project', 'GET', '/api/projects', undefined, { scope: 'mine', pageSize: 50 })).map((p: any) => p.id)
  const perProject = await Promise.all(
    projectIds.map((id: string) => call(ctx, 'kanban', 'GET', '/api/boards', undefined, { projectId: id }).then((r: any) => (r.boards ?? []).map((b: any) => ({ ...b, projectId: id }))).catch(() => [])),
  )
  return perProject.flat()
}

export const resolvers = {
  DateTime: DateTimeResolver,
  JSON: JSONResolver,

  Query: {
    me: async (_: unknown, __: unknown, ctx: Context) => (ctx.user ? user(await call(ctx, 'auth', 'GET', '/api/auth/me')) : null),
    user: async (_: unknown, { id }: { id: string }, ctx: Context) => user(await call(ctx, 'auth', 'GET', `/api/users/${id}/public`)),
    users: async (_: unknown, { filter, limit = 20, offset = 0 }: { filter?: { search?: string; role?: string }; limit?: number; offset?: number }, ctx: Context) => {
      needUser(ctx)
      const r = await call(ctx, 'auth', 'GET', '/api/auth/admin/users', undefined, { q: filter?.search, role: filter?.role, page: Math.floor(offset / limit) + 1, pageSize: limit })
      return { nodes: list(r).map(user), total: r.total ?? list(r).length }
    },

    board: async (_: unknown, { id }: { id: string }, ctx: Context) => board(await call(ctx, 'kanban', 'GET', `/api/boards/${id}`)),
    boards: async (_: unknown, { projectId }: { projectId?: string; filter?: { archived?: boolean } }, ctx: Context) => (await visibleBoards(ctx, projectId)).map(board),
    task: async (_: unknown, { id }: { id: string }, ctx: Context) => task(await call(ctx, 'kanban', 'GET', `/api/tasks/${id}`)),
    tasks: async (_: unknown, { boardId, filter }: { boardId: string; filter?: Record<string, string> }, ctx: Context) => (await call(ctx, 'kanban', 'GET', `/api/boards/${boardId}`, undefined, clean(filter ?? {}))).tasks.map(task),
    myTasks: async (_: unknown, { filter }: { filter?: Record<string, string> }, ctx: Context) => {
      needUser(ctx)
      const boards = await visibleBoards(ctx)
      const all = await Promise.all(boards.map((b: any) => call(ctx, 'kanban', 'GET', `/api/boards/${b.id}`, undefined, { ...clean(filter ?? {}), assignee: 'me' }).catch(() => ({ tasks: [] }))))
      return all.flatMap((b: any) => b.tasks).map(task)
    },
    sprints: async (_: unknown, { boardId }: { boardId: string }, ctx: Context) => ((await call(ctx, 'kanban', 'GET', `/api/boards/${boardId}`)).sprints ?? []).map(withRaw),
    boardAnalytics: async (_: unknown, { boardId }: { boardId: string }, ctx: Context) => ({ boardId, data: await call(ctx, 'kanban', 'GET', `/api/boards/${boardId}/analytics`) }),
    burndown: (_: unknown, { sprintId }: { sprintId: string }, ctx: Context) => call(ctx, 'kanban', 'GET', `/api/boards/sprints/${sprintId}/burndown`),
    searchTasks: async (_: unknown, { query, boardId, limit = 20 }: { query: string; boardId: string; limit?: number }, ctx: Context) => (await call(ctx, 'kanban', 'GET', `/api/boards/${boardId}`, undefined, { q: query })).tasks.slice(0, limit).map(task),

    courses: async (_: unknown, args: { search?: string; category?: string; level?: string; page?: number; pageSize?: number }, ctx: Context) => {
      const r = await call(ctx, 'course', 'GET', '/api/courses', undefined, clean(args))
      return { nodes: list(r).map(course), total: r.total ?? 0, page: r.page, totalPages: r.totalPages }
    },
    course: async (_: unknown, { id }: { id: string }, ctx: Context) => course(await call(ctx, 'course', 'GET', `/api/courses/${id}`)),
    myCourses: async (_: unknown, __: unknown, ctx: Context) => { needUser(ctx); return list(await call(ctx, 'course', 'GET', '/api/learn/my-courses')).map((e: any) => course(e.course ?? e)) },
    dashboard: (_: unknown, __: unknown, ctx: Context) => { needUser(ctx); return call(ctx, 'course', 'GET', '/api/dashboard') },

    projects: async (_: unknown, args: { search?: string; page?: number; pageSize?: number }, ctx: Context) => {
      const r = await call(ctx, 'project', 'GET', '/api/projects', undefined, clean({ q: args.search, page: args.page, pageSize: args.pageSize }))
      return { nodes: list(r).map(project), total: r.total ?? 0, page: r.page, totalPages: r.totalPages }
    },
    project: async (_: unknown, { id }: { id: string }, ctx: Context) => project(await call(ctx, 'project', 'GET', `/api/projects/${id}`)),
    documents: async (_: unknown, __: unknown, ctx: Context) => { needUser(ctx); return list(await call(ctx, 'editor', 'GET', '/api/editor/documents')).map(doc) },
    document: async (_: unknown, { id }: { id: string }, ctx: Context) => doc(await call(ctx, 'editor', 'GET', `/api/editor/documents/${id}`)),

    search: (_: unknown, { query, type = 'all' }: { query: string; type?: string }, ctx: Context) => call(ctx, 'search', 'GET', '/api/search', undefined, { q: query, type }),
    notifications: async (_: unknown, { limit = 20, offset = 0 }: { limit?: number; offset?: number }, ctx: Context) => {
      needUser(ctx)
      const r = await call(ctx, 'notification', 'GET', '/api/notifications', undefined, { limit, offset, page: Math.floor(offset / limit) + 1 })
      return { nodes: list(r).map(notification), unread: r.unread ?? 0 }
    },
    unreadNotificationsCount: async (_: unknown, __: unknown, ctx: Context) => { needUser(ctx); return (await call(ctx, 'notification', 'GET', '/api/notifications/unread-count')).unread ?? 0 },
    onlineUsers: async (_: unknown, __: unknown, ctx: Context) => { needUser(ctx); return onlineUsers(getRedis()) },
    analyticsOverview: (_: unknown, { days = 30 }: { days?: number }, ctx: Context) => {
      if (needUser(ctx).role !== 'ADMIN') throw new GraphQLError('Admins only', { extensions: { code: 'FORBIDDEN' } })
      return call(ctx, 'analytics', 'GET', '/api/analytics/admin/overview', undefined, { days })
    },
  },

  Mutation: {
    updateProfile: async (_: unknown, { input }: { input: object }, ctx: Context) => user(await call(ctx, 'auth', 'PATCH', '/api/auth/me', clean(input))),

    createBoard: async (_: unknown, { input }: { input: object }, ctx: Context) => board(await call(ctx, 'kanban', 'POST', '/api/boards', clean(input))),
    updateBoard: async (_: unknown, { id, input }: { id: string; input: object }, ctx: Context) => board(await call(ctx, 'kanban', 'PATCH', `/api/boards/${id}`, clean(input))),
    deleteBoard: async (_: unknown, { id }: { id: string }, ctx: Context) => (await call(ctx, 'kanban', 'DELETE', `/api/boards/${id}`), true),

    createColumn: (_: unknown, { input: { boardId, ...rest } }: { input: { boardId: string } & object }, ctx: Context) => call(ctx, 'kanban', 'POST', `/api/boards/${boardId}/columns`, clean(rest)),
    updateColumn: (_: unknown, { id, input }: { id: string; input: object }, ctx: Context) => call(ctx, 'kanban', 'PATCH', `/api/boards/columns/${id}`, clean(input)),
    deleteColumn: async (_: unknown, { id, moveTo }: { id: string; moveTo?: string }, ctx: Context) => (await call(ctx, 'kanban', 'DELETE', `/api/boards/columns/${id}`, clean({ moveTo })), true),
    reorderColumns: async (_: unknown, { boardId, columnIds }: { boardId: string; columnIds: string[] }, ctx: Context) => (await call(ctx, 'kanban', 'POST', `/api/boards/${boardId}/columns/reorder`, { ids: columnIds }), true),

    createTask: async (_: unknown, { input }: { input: object }, ctx: Context) => task(await call(ctx, 'kanban', 'POST', '/api/tasks', clean(input))),
    updateTask: async (_: unknown, { id, input }: { id: string; input: object }, ctx: Context) => task(await call(ctx, 'kanban', 'PATCH', `/api/tasks/${id}`, input)),
    deleteTask: async (_: unknown, { id }: { id: string }, ctx: Context) => (await call(ctx, 'kanban', 'DELETE', `/api/tasks/${id}`), true),
    moveTask: async (_: unknown, { id, columnId, order }: { id: string; columnId: string; order?: number }, ctx: Context) => task(await call(ctx, 'kanban', 'POST', `/api/tasks/${id}/move`, clean({ columnId, index: order }))),
    assignTask: async (_: unknown, { id, userId }: { id: string; userId: string }, ctx: Context) => task(await call(ctx, 'kanban', 'PATCH', `/api/tasks/${id}`, { assigneeId: userId })),
    unassignTask: async (_: unknown, { id }: { id: string }, ctx: Context) => task(await call(ctx, 'kanban', 'PATCH', `/api/tasks/${id}`, { assigneeId: null })),
    addTaskLabel: async (_: unknown, { taskId, labelId }: { taskId: string; labelId: string }, ctx: Context) => (await call(ctx, 'kanban', 'POST', `/api/tasks/${taskId}/labels/${labelId}`), true),
    removeTaskLabel: async (_: unknown, { taskId, labelId }: { taskId: string; labelId: string }, ctx: Context) => (await call(ctx, 'kanban', 'DELETE', `/api/tasks/${taskId}/labels/${labelId}`), true),
    addTaskToSprint: async (_: unknown, { taskId, sprintId }: { taskId: string; sprintId: string }, ctx: Context) => task(await call(ctx, 'kanban', 'PATCH', `/api/tasks/${taskId}`, { sprintId })),
    removeTaskFromSprint: async (_: unknown, { taskId }: { taskId: string }, ctx: Context) => task(await call(ctx, 'kanban', 'PATCH', `/api/tasks/${taskId}`, { sprintId: null })),
    watchTask: async (_: unknown, { taskId }: { taskId: string }, ctx: Context) => (await call(ctx, 'kanban', 'POST', `/api/tasks/${taskId}/watch`), true),
    unwatchTask: async (_: unknown, { taskId }: { taskId: string }, ctx: Context) => (await call(ctx, 'kanban', 'DELETE', `/api/tasks/${taskId}/watch`), true),
    addComment: (_: unknown, { taskId, body }: { taskId: string; body: string }, ctx: Context) => call(ctx, 'kanban', 'POST', `/api/tasks/${taskId}/comments`, { body }),

    createSprint: async (_: unknown, { input: { boardId, ...rest } }: { input: { boardId: string } & object }, ctx: Context) => withRaw(await call(ctx, 'kanban', 'POST', `/api/boards/${boardId}/sprints`, clean(rest))),
    startSprint: async (_: unknown, { id }: { id: string }, ctx: Context) => withRaw(await call(ctx, 'kanban', 'POST', `/api/boards/sprints/${id}/start`)),
    completeSprint: async (_: unknown, { id, moveIncompleteTo }: { id: string; moveIncompleteTo?: string }, ctx: Context) => withRaw(await call(ctx, 'kanban', 'POST', `/api/boards/sprints/${id}/complete`, clean({ moveIncompleteTo }))),
    createLabel: (_: unknown, { input: { boardId, ...rest } }: { input: { boardId: string } & object }, ctx: Context) => call(ctx, 'kanban', 'POST', `/api/boards/${boardId}/labels`, rest),

    enroll: async (_: unknown, { courseId }: { courseId: string }, ctx: Context) => (await call(ctx, 'course', 'POST', `/api/courses/${courseId}/enroll`), true),
    createProject: async (_: unknown, { input }: { input: object }, ctx: Context) => project(await call(ctx, 'project', 'POST', '/api/projects', clean(input))),
    starProject: async (_: unknown, { id }: { id: string }, ctx: Context) => (await call(ctx, 'project', 'POST', `/api/projects/${id}/star`), true),
    createDocument: async (_: unknown, args: { title: string; language?: string }, ctx: Context) => doc(await call(ctx, 'editor', 'POST', '/api/editor/documents', clean(args))),
    updateDocument: async (_: unknown, { id, ...rest }: { id: string; title?: string; visibility?: string }, ctx: Context) => doc(await call(ctx, 'editor', 'PATCH', `/api/editor/documents/${id}`, clean(rest))),
    deleteDocument: async (_: unknown, { id }: { id: string }, ctx: Context) => (await call(ctx, 'editor', 'DELETE', `/api/editor/documents/${id}`), true),

    markNotificationRead: async (_: unknown, { id }: { id: string }, ctx: Context) => (await call(ctx, 'notification', 'POST', `/api/notifications/${id}/read`), true),
    markAllNotificationsRead: async (_: unknown, __: unknown, ctx: Context) => (await call(ctx, 'notification', 'POST', '/api/notifications/read-all')).updated ?? 0,
  },
}
