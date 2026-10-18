/**
 * API calls for the collaboration side of DevForge (projects, teams, boards, documents, files,
 * search, video) and for account security, billing and administration. Paths are relative to the
 * gateway's /api prefix. Response types list the fields the UI reads; services may return more.
 */
import apiClient from './client'
import type { User } from './types'

const get = async <T>(url: string, params?: object) => (await apiClient.get<T>(url, { params })).data
const post = async <T>(url: string, body?: object) => (await apiClient.post<T>(url, body)).data
const patch = async <T>(url: string, body?: object) => (await apiClient.patch<T>(url, body)).data
const put = async <T>(url: string, body?: object) => (await apiClient.put<T>(url, body)).data
const del = async <T = unknown>(url: string, body?: object) => (await apiClient.delete<T>(url, { data: body })).data

export interface PersonRef {
  id: string
  name: string
  avatar?: string | null
}

export interface Page<T> {
  data?: T[]
  items?: T[]
  total: number
  page?: number
  pageSize?: number
  totalPages?: number
}

/** Services page with either `data` or `items`; this reads whichever is there. */
export const rows = <T>(p: Page<T> | T[] | undefined): T[] => (Array.isArray(p) ? p : (p?.data ?? p?.items ?? []))

// ---------- Projects, teams, social ----------
export type ProjectRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER'
export interface Project {
  id: string
  slug: string
  name: string
  description?: string | null
  readme?: string | null
  visibility: 'PUBLIC' | 'PRIVATE' | 'TEAM'
  status?: 'ACTIVE' | 'ARCHIVED'
  tags: string[]
  stars: number
  comments?: number
  forks?: number
  starred?: boolean
  role?: ProjectRole | null
  canEdit?: boolean
  owner?: PersonRef
  repoUrl?: string | null
  team?: { id: string; name: string; slug: string } | null
  forkedFrom?: { id: string; name: string; slug: string } | null
  members?: (PersonRef & { role: ProjectRole; joinedAt: string })[]
  createdAt: string
  updatedAt: string
}
export interface ProjectInput {
  name: string
  description?: string
  readme?: string
  visibility?: 'PUBLIC' | 'PRIVATE' | 'TEAM'
  tags?: string[]
  repoUrl?: string
  teamId?: string | null
  status?: 'ACTIVE' | 'ARCHIVED'
}
export interface Comment {
  id: string
  content: string
  author?: PersonRef
  createdAt: string
  edited?: boolean
  mine?: boolean
  replies?: Comment[]
}
export interface Activity {
  id: string
  type: string
  summary: string
  projectId?: string | null
  user?: PersonRef
  createdAt: string
}
export interface Invitation {
  id: string
  type?: 'PROJECT' | 'TEAM'
  entity?: { name: string; slug: string } | null
  email?: string
  role: string
  status?: string
  invitedBy?: PersonRef
  createdAt?: string
  expiresAt?: string
  forYou?: boolean
}
export interface ProjectFile {
  id: string
  fileId: string
  name: string
  mimeType: string
  size: number
  createdAt: string
}
export interface TeamSummary {
  id: string
  slug: string
  name: string
  description?: string | null
  isPublic: boolean
  members: number
  projects: number
  role: string | null
}
export interface Team {
  id: string
  slug: string
  name: string
  description?: string | null
  isPublic: boolean
  role: string | null
  members: (PersonRef & { role: string; joinedAt: string })[]
  projects: Project[]
}

export const projectApi = {
  list: (params: { q?: string; tag?: string; scope?: 'public' | 'mine'; sort?: 'updated' | 'newest' | 'stars'; page?: number; pageSize?: number }) => get<Page<Project>>('/projects', params),
  tags: () => get<{ tag: string; count: number }[]>('/projects/tags'),
  get: (idOrSlug: string) => get<Project>(`/projects/${idOrSlug}`),
  create: (body: ProjectInput) => post<Project>('/projects', body),
  update: (id: string, body: Partial<ProjectInput>) => patch<Project>(`/projects/${id}`, body),
  remove: (id: string) => del(`/projects/${id}`),
  star: (id: string) => post<{ starred: boolean; stars: number }>(`/projects/${id}/star`),
  unstar: (id: string) => del<{ starred: boolean; stars: number }>(`/projects/${id}/star`),
  fork: (id: string, name?: string) => post<Project>(`/projects/${id}/fork`, name ? { name } : {}),
  setMemberRole: (id: string, userId: string, role: ProjectRole) => patch(`/projects/${id}/members/${userId}`, { role }),
  removeMember: (id: string, userId: string) => del(`/projects/${id}/members/${userId}`),
  invite: (id: string, email: string, role: ProjectRole) => post<Invitation>(`/projects/${id}/invitations`, { email, role }),
  invitations: (id: string) => get<Invitation[]>(`/projects/${id}/invitations`),
  cancelInvitation: (id: string, invitationId: string) => del(`/projects/${id}/invitations/${invitationId}`),
  comments: (id: string) => get<Page<Comment>>(`/projects/${id}/comments`, { pageSize: 50 }),
  comment: (id: string, content: string, parentId?: string) => post<Comment>(`/projects/${id}/comments`, { content, ...(parentId ? { parentId } : {}) }),
  editComment: (id: string, commentId: string, content: string) => patch<Comment>(`/projects/${id}/comments/${commentId}`, { content }),
  deleteComment: (id: string, commentId: string) => del(`/projects/${id}/comments/${commentId}`),
  files: (id: string) => get<ProjectFile[]>(`/projects/${id}/files`),
  attachFile: (id: string, fileId: string) => post(`/projects/${id}/files`, { fileId }),
  detachFile: (id: string, fileId: string) => del(`/projects/${id}/files/${fileId}`),
  activity: (id: string) => get<Activity[]>(`/projects/${id}/activity`),
}

export const teamApi = {
  list: () => get<Page<TeamSummary>>('/teams', { pageSize: 50 }),
  get: (idOrSlug: string) => get<Team>(`/teams/${idOrSlug}`),
  create: (body: { name: string; description?: string; isPublic?: boolean }) => post<Team>('/teams', body),
  update: (id: string, body: { name?: string; description?: string; isPublic?: boolean }) => patch<Team>(`/teams/${id}`, body),
  remove: (id: string) => del(`/teams/${id}`),
  invite: (id: string, email: string, role: string) => post<Invitation>(`/teams/${id}/invitations`, { email, role }),
  setMemberRole: (id: string, userId: string, role: string) => patch(`/teams/${id}/members/${userId}`, { role }),
  removeMember: (id: string, userId: string) => del(`/teams/${id}/members/${userId}`),
}

export interface PersonProfile {
  user?: PersonRef & { bio?: string | null }
  followers: number
  following: number
  isFollowing: boolean
  projects: Project[]
}

export const socialApi = {
  follow: (userId: string) => post(`/social/follow/${userId}`),
  unfollow: (userId: string) => del(`/social/follow/${userId}`),
  person: (userId: string) => get<PersonProfile>(`/social/people/${userId}`),
  followers: () => get<PersonRef[] | Page<PersonRef>>('/social/followers'),
  following: () => get<PersonRef[] | Page<PersonRef>>('/social/following'),
  feed: (page = 1) => get<Page<Activity>>('/social/feed', { page }),
  myInvitations: () => get<Invitation[]>('/social/invitations/mine'),
  invitation: (token: string) => get<Invitation>(`/social/invitations/${token}`),
  accept: (token: string) => post<{ project?: Project; team?: Team }>(`/social/invitations/${token}/accept`),
  reject: (token: string) => post(`/social/invitations/${token}/reject`),
}

// ---------- Kanban ----------
export type Priority = 'LOWEST' | 'LOW' | 'MEDIUM' | 'HIGH' | 'HIGHEST'
export type TaskType = 'TASK' | 'BUG' | 'STORY' | 'SUBTASK'
export interface BoardSummary {
  id: string
  projectId: string
  name: string
  description?: string | null
  keyPrefix?: string
  visibility?: string
  archived?: boolean
  tasks?: number
  updatedAt?: string
}
export interface BoardColumn {
  id: string
  name: string
  color?: string | null
  status: 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE'
  wipLimit: number | null
  order: number
  count: number
}
export interface Label {
  id: string
  name: string
  color: string
}
export interface Sprint {
  id: string
  name: string
  goal?: string | null
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED'
  startDate: string
  endDate: string
}
export interface Epic {
  id: string
  name: string
  color?: string
}
export interface TaskCard {
  id: string
  key: string
  title: string
  type: TaskType
  priority: Priority
  status: string
  points: number | null
  columnId: string
  order: number
  sprintId: string | null
  epicId: string | null
  dueDate: string | null
  assignee: PersonRef | null
  labels: Label[]
  comments: number
  attachments: number
  subtasks: number
  subtasksDone: number
  overdue: boolean
}
export interface Board extends Omit<BoardSummary, 'tasks'> {
  access: { read: boolean; write: boolean; admin: boolean }
  columns: BoardColumn[]
  labels: Label[]
  epics: Epic[]
  sprints: Sprint[]
  activeSprint: Sprint | null
  people: PersonRef[]
  tasks: TaskCard[]
}
export interface TaskDetail extends Omit<TaskCard, 'comments' | 'attachments' | 'subtasks'> {
  description?: string | null
  boardId: string
  estimatedHours?: number | null
  column?: { id: string; name: string; status: string }
  sprint?: { id: string; name: string; status: string } | null
  epic?: { id: string; name: string; color?: string } | null
  parent?: { id: string; key: string; title: string } | null
  reporter?: PersonRef | null
  subtasks: { id: string; key: string; title: string; status: string; assignee: PersonRef | null }[]
  comments: TaskComment[]
  attachments: { id: string; fileId: string; name: string; mimeType?: string; size?: number; createdAt: string }[]
  timeEntries: { id: string; hours: number; description?: string | null; date: string; user?: PersonRef; mine: boolean }[]
  loggedHours: number
  watching: boolean
  watchers: number
  activity: { id: string; action: string; detail?: Record<string, unknown>; user?: PersonRef; createdAt: string }[]
  access: { read: boolean; write: boolean; admin: boolean }
  createdAt: string
  updatedAt: string
}
export interface TaskComment {
  id: string
  content: string
  author?: PersonRef
  edited?: boolean
  mine?: boolean
  createdAt: string
}
export interface TaskInput {
  boardId: string
  columnId: string
  title: string
  description?: string
  type?: TaskType
  priority?: Priority
  assigneeId?: string | null
  sprintId?: string | null
  epicId?: string | null
  parentId?: string | null
  points?: number | null
  estimatedHours?: number | null
  dueDate?: string | null
  labelIds?: string[]
}

export const boardApi = {
  list: (projectId: string) => get<{ canCreate: boolean; boards: BoardSummary[] }>('/boards', { projectId }),
  get: (id: string, filter?: Record<string, string | undefined>) => get<Board>(`/boards/${id}`, filter),
  create: (body: { projectId: string; name: string; description?: string; visibility?: 'PRIVATE' | 'PUBLIC'; keyPrefix?: string }) => post<Board>('/boards', body),
  update: (id: string, body: Partial<{ name: string; description: string; visibility: string; archived: boolean }>) => patch<Board>(`/boards/${id}`, body),
  remove: (id: string) => del(`/boards/${id}`),
  activity: (id: string) => get<Activity[] | Page<Activity>>(`/boards/${id}/activity`),
  addColumn: (id: string, body: { name: string; status?: string; wipLimit?: number | null; color?: string }) => post<BoardColumn>(`/boards/${id}/columns`, body),
  reorderColumns: (id: string, ids: string[]) => post(`/boards/${id}/columns/reorder`, { ids }),
  updateColumn: (columnId: string, body: Partial<{ name: string; status: string; wipLimit: number | null; color: string }>) => patch<BoardColumn>(`/boards/columns/${columnId}`, body),
  deleteColumn: (columnId: string, moveTo?: string) => del(`/boards/columns/${columnId}`, moveTo ? { moveTo } : undefined),
  addLabel: (id: string, name: string, color: string) => post<Label>(`/boards/${id}/labels`, { name, color }),
  deleteLabel: (labelId: string) => del(`/boards/labels/${labelId}`),
  addEpic: (id: string, name: string, color?: string) => post<Epic>(`/boards/${id}/epics`, { name, ...(color ? { color } : {}) }),
  deleteEpic: (epicId: string) => del(`/boards/epics/${epicId}`),
  addSprint: (id: string, body: { name: string; goal?: string; startDate: string; endDate: string }) => post<Sprint>(`/boards/${id}/sprints`, body),
  startSprint: (sprintId: string) => post<Sprint>(`/boards/sprints/${sprintId}/start`),
  completeSprint: (sprintId: string, moveIncompleteTo: string = 'backlog') => post<Sprint>(`/boards/sprints/${sprintId}/complete`, { moveIncompleteTo }),
  burndown: (sprintId: string) => get<{ sprint: Pick<Sprint, 'id' | 'name' | 'status'>; totalPoints: number; series: { day: string; remaining: number | null; ideal: number }[]; note?: string }>(`/boards/sprints/${sprintId}/burndown`),
  analytics: (id: string) => get<Record<string, any>>(`/boards/${id}/analytics`),
}

export const taskApi = {
  create: (body: TaskInput) => post<TaskDetail>('/tasks', body),
  get: (id: string) => get<TaskDetail>(`/tasks/${id}`),
  update: (id: string, body: Partial<Omit<TaskInput, 'boardId' | 'columnId'>>) => patch<TaskDetail>(`/tasks/${id}`, body),
  remove: (id: string) => del(`/tasks/${id}`),
  move: (id: string, columnId: string, index: number, force = false) => post<TaskDetail>(`/tasks/${id}/move`, { columnId, index, ...(force ? { force } : {}) }),
  addLabel: (id: string, labelId: string) => post(`/tasks/${id}/labels/${labelId}`),
  removeLabel: (id: string, labelId: string) => del(`/tasks/${id}/labels/${labelId}`),
  watch: (id: string) => post(`/tasks/${id}/watch`),
  unwatch: (id: string) => del(`/tasks/${id}/watch`),
  comment: (id: string, content: string, mentions: string[] = []) => post<TaskComment>(`/tasks/${id}/comments`, { content, mentions }),
  editComment: (id: string, commentId: string, content: string) => patch<TaskComment>(`/tasks/${id}/comments/${commentId}`, { content }),
  deleteComment: (id: string, commentId: string) => del(`/tasks/${id}/comments/${commentId}`),
  logTime: (id: string, hours: number, description?: string) => post(`/tasks/${id}/time`, { hours, ...(description ? { description } : {}) }),
  deleteTime: (id: string, entryId: string) => del(`/tasks/${id}/time/${entryId}`),
  attach: (id: string, fileId: string) => post(`/tasks/${id}/attachments`, { fileId }),
  detach: (id: string, attachmentId: string) => del(`/tasks/${id}/attachments/${attachmentId}`),
}

// ---------- Collaborative documents ----------
export type DocAccess = 'owner' | 'edit' | 'view'
export interface DocumentSummary {
  id: string
  title: string
  language: string
  visibility: 'PRIVATE' | 'LINK_VIEW' | 'LINK_EDIT'
  ownerId: string
  owner?: PersonRef
  access: DocAccess
  updatedAt: string
  createdAt: string
  members?: { userId: string; role: 'EDITOR' | 'VIEWER'; user?: PersonRef }[]
}
export interface Snapshot {
  id: string
  name: string
  createdAt: string
  createdBy?: PersonRef | string
}

export const documentApi = {
  list: () => get<DocumentSummary[] | Page<DocumentSummary>>('/editor/documents'),
  get: (id: string) => get<DocumentSummary>(`/editor/documents/${id}`),
  create: (body: { title: string; language?: string; visibility?: string; text?: string }) => post<DocumentSummary>('/editor/documents', body),
  update: (id: string, body: Partial<{ title: string; language: string; visibility: string }>) => patch<DocumentSummary>(`/editor/documents/${id}`, body),
  remove: (id: string) => del(`/editor/documents/${id}`),
  addMember: (id: string, email: string, role: 'EDITOR' | 'VIEWER') => post(`/editor/documents/${id}/members`, { email, role }),
  removeMember: (id: string, userId: string) => del(`/editor/documents/${id}/members/${userId}`),
  text: (id: string) => get<{ text: string }>(`/editor/documents/${id}/text`),
  setText: (id: string, text: string) => put(`/editor/documents/${id}/text`, { text }),
  exportUrl: (id: string) => `/editor/documents/${id}/export`,
  snapshots: (id: string) => get<Snapshot[]>(`/editor/documents/${id}/snapshots`),
  snapshot: (id: string, name: string) => post<Snapshot>(`/editor/documents/${id}/snapshots`, { name }),
  restore: (id: string, snapshotId: string) => post(`/editor/documents/${id}/restore`, { snapshotId }),
  deleteSnapshot: (id: string, snapshotId: string) => del(`/editor/documents/${id}/snapshots/${snapshotId}`),
}

// ---------- Files ----------
export interface FileItem {
  id: string
  name: string
  originalName?: string
  mimeType: string
  size: number
  url?: string
  downloadUrl?: string
  visibility?: string
  createdAt: string
}

export const fileApi = {
  list: () => get<{ files: FileItem[]; usedBytes: number; quotaBytes: number }>('/files'),
  get: (id: string) => get<FileItem>(`/files/${id}`),
  upload: async (file: File, onProgress?: (pct: number) => void) => {
    const form = new FormData()
    form.append('file', file)
    return (
      await apiClient.post<FileItem>('/files', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => e.total && onProgress?.(Math.round((e.loaded / e.total) * 100)),
      })
    ).data
  },
  rename: (id: string, name: string) => patch<FileItem>(`/files/${id}`, { name }),
  remove: (id: string) => del(`/files/${id}`),
  download: async (id: string, name: string) => {
    const res = await apiClient.get(`/files/${id}/download`, { responseType: 'blob' })
    saveBlob(res.data as Blob, name)
  },
}

export function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// ---------- Search ----------
export interface SearchHit {
  id: string | number
  title?: string
  name?: string
  slug?: string
  description?: string
  category?: string
  level?: string
  role?: string
  avatar?: string | null
  rating?: number
  price?: number
  tags?: string[]
  highlight?: Record<string, string[]>
  [k: string]: unknown
}
export interface Hits {
  total: number
  data: SearchHit[]
  page?: number
  totalPages?: number
}
export interface SearchResponse {
  query: string
  courses: Hits | null
  instructors: Hits | null
  projects: Hits | null
  didYouMean: string | null
}
export interface Suggestion {
  type: 'course' | 'instructor' | 'project'
  id: string | number
  label: string
  hint?: string
  url: string
}

export const searchApi = {
  all: (q: string, type: 'all' | 'courses' | 'users' | 'projects' = 'all', page = 1) => get<SearchResponse>('/search', { q, type, page, pageSize: type === 'all' ? 5 : 20 }),
  autocomplete: (q: string) => get<{ suggestions: Suggestion[] }>('/search/autocomplete', { q }),
}

// ---------- Account security and billing ----------
export interface SessionRow {
  id: string
  userAgent?: string | null
  ip?: string | null
  createdAt: string
  lastUsedAt?: string | null
  current: boolean
}

export const securityApi = {
  loginWith2fa: (challengeToken: string, code: string) => post<{ user: User; accessToken: string }>('/auth/login/2fa', { challengeToken, code }),
  sessions: () => get<SessionRow[]>('/auth/sessions'),
  revokeSession: (id: string) => del(`/auth/sessions/${id}`),
  logoutAll: () => post('/auth/logout-all'),
  twoFactorStatus: () => get<{ enabled: boolean; backupCodesRemaining: number }>('/auth/2fa/status'),
  setup2fa: () => post<{ secret: string; otpauthUrl: string; qrCode: string }>('/auth/2fa/setup'),
  enable2fa: (code: string) => post<{ enabled: true; backupCodes: string[] }>('/auth/2fa/enable', { code }),
  disable2fa: (code: string, password?: string) => post<{ enabled: false }>('/auth/2fa/disable', { code, ...(password ? { password } : {}) }),
  regenerateBackupCodes: (code: string) => post<{ backupCodes: string[] }>('/auth/2fa/backup-codes', { code }),
  oauthProviders: () => get<{ providers: string[] } | string[]>('/auth/oauth/providers'),
}

export interface Order {
  id: string
  courseId: number
  courseTitle: string
  course?: { id: number; title: string }
  amount: number
  refunded: number
  currency: string
  status: 'PENDING' | 'PAID' | 'REFUNDED' | 'PARTIALLY_REFUNDED' | 'FAILED' | 'CANCELED' | string
  createdAt: string
  paidAt?: string | null
  buyerEmail?: string | null
  buyerName?: string | null
  userId?: string
}
export interface Subscription {
  id: string
  plan: 'monthly' | 'yearly'
  status: string
  currentPeriodEnd?: string | null
  cancelAtPeriodEnd?: boolean
}
export interface Invoice {
  id: string
  number?: string | null
  status?: string | null
  amount: number
  currency: string
  created: string
  url?: string | null
  pdf?: string | null
}

export const billingApi = {
  config: () => get<{ enabled: boolean; currency: string; refundWindowDays: number; plans: { id: 'monthly' | 'yearly'; name: string; amountCents: number; interval: string }[] }>('/payments/config'),
  orders: () => get<Order[]>('/payments/orders'),
  refund: (id: string, reason?: string) => post(`/payments/orders/${id}/refund`, reason ? { reason } : {}),
  subscribe: (plan: 'monthly' | 'yearly') => post<{ url: string }>('/payments/subscribe', { plan }),
  subscription: () => get<{ subscription: Subscription | null; active: boolean }>('/payments/subscription'),
  cancel: () => post('/payments/subscription/cancel'),
  resume: () => post('/payments/subscription/resume'),
  portal: () => post<{ url: string }>('/payments/portal'),
  invoices: () => get<Invoice[]>('/payments/invoices'),
  paymentMethods: () => get<{ id: string; brand?: string; last4?: string; expMonth?: number; expYear?: number }[]>('/payments/payment-methods'),
}

// ---------- Video calls ----------
export interface CallRoom {
  id: string
  name: string
  scope: 'adhoc' | 'board' | 'document' | 'project'
  resourceId?: string
  ownerId: string
  ownerName?: string
  invited: string[]
  maxPeers: number
  createdAt: string
  inviteCode?: string
  joinLink?: string
  active?: number
  participants?: { peerId: string; userId: string; name?: string }[]
}

export const videoApi = {
  rooms: () => get<{ items: CallRoom[] }>('/video/rooms'),
  room: (id: string, code?: string) => get<CallRoom>(`/video/rooms/${id}`, code ? { code } : undefined),
  create: (body: { name: string; scope?: CallRoom['scope']; resourceId?: string; invite?: string[] }) => post<CallRoom>('/video/rooms', body),
  invite: (id: string, userIds: string[]) => post<{ invited: string[]; added: string[] }>(`/video/rooms/${id}/invite`, { userIds }),
  end: (id: string) => del(`/video/rooms/${id}`),
}

// ---------- Administration ----------
export interface AdminUser extends User {
  isActive: boolean
  lastLoginAt?: string | null
}
export interface AuditLog {
  id: string
  at: string
  actor: { id: string; name: string | null } | null
  action: string
  resource: string
  resourceId: string | null
  status: 'SUCCESS' | 'FAILURE'
  ip?: string | null
  userAgent?: string | null
  details?: Record<string, unknown>
}
export interface AuditQuery {
  actor?: string
  action?: string
  resource?: string
  status?: 'SUCCESS' | 'FAILURE'
  from?: string
  to?: string
  page?: number
  pageSize?: number
}
export interface ServiceStatus {
  service: string
  status: 'up' | 'degraded' | 'down' | 'not-deployed'
  healthMs: number | null
  checks: Record<string, string>
  requestsPerMin: number | null
  errorRatePct: number | null
  p95Ms: number | null
  memoryMB: number | null
  uptimeSeconds: number | null
  lastSeenUp: number | null
}
export interface Alert {
  key: string
  ruleId: string
  ruleName: string
  severity: string
  subject: string
  message: string
  value: number
  since: number
  firedAt: number | null
  resolvedAt?: number
  state: 'pending' | 'firing' | 'resolved'
}
export interface ReportRun {
  id: string
  type: string
  format: string
  days: number
  filename: string
  size: number
  status: string
  missing: string[]
  scheduleId?: string | null
  createdAt: string
}
export interface ReportSchedule {
  id: string
  type: string
  format: string
  days: number
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY'
  hourUtc: number
  recipients: string[]
  enabled: boolean
  nextRunAt: string
  lastRunAt?: string | null
}

export const adminApi = {
  users: (params: { search?: string; role?: string; page?: number; limit?: number }) => get<Page<AdminUser>>('/auth/admin/users', params),
  setRole: (id: string, role: string) => patch(`/auth/admin/users/${id}/role`, { role }),
  setActive: (id: string, active: boolean) => patch(`/auth/admin/users/${id}/active`, { active }),

  analytics: (days: number) => get<Record<string, any>>('/analytics/admin/overview', { days }),
  analyticsPart: (part: 'pageviews' | 'browsers' | 'devices' | 'systems' | 'geographic', days: number) => get<Record<string, any>>(`/analytics/admin/${part}`, { days }),
  paymentStats: () => get<{ paidOrders: number; revenue: number; refundedOrders: number; refunded: number; activeSubscriptions: number }>('/payments/admin/stats'),
  paymentOrders: (params?: object) => get<Page<Order> | Order[]>('/payments/admin/orders', params),

  auditLogs: (params: AuditQuery) => get<Page<AuditLog>>('/audit/logs', params),
  auditActions: () => get<{ action: string; count: number }[]>('/audit/actions'),
  auditStats: (days = 7) => get<{ days: number; total: number; failures: number; byResource: Record<string, number>; byDay: { day: string; count: number }[]; topActors: { id: string; name: string | null; count: number }[] }>('/audit/stats', { days }),
  auditVerify: () => get<{ ok: boolean; checked: number; firstBadId?: string; reason?: string; truncated?: boolean }>('/audit/verify'),
  auditExport: async (params: AuditQuery) => saveBlob((await apiClient.get('/audit/export', { params, responseType: 'blob' })).data as Blob, 'audit-log.csv'),

  monitoring: () => get<{ updatedAt: number; summary: { up: number; degraded: number; down: number; notDeployed: number; firingAlerts: number }; services: ServiceStatus[]; alerts: Alert[] }>('/monitoring/overview'),
  monitoringService: (name: string) => get<{ status: ServiceStatus; series: { t: number; up: boolean; healthMs: number | null; requests: number | null; errors: number | null; memoryMB: number | null }[] }>(`/monitoring/services/${name}`),
  infrastructure: () => get<{ items: { name: string; healthy: boolean; latencyMs: number | null; error?: string; detail?: unknown }[] }>('/monitoring/infrastructure'),
  alerts: () => get<{ active: Alert[]; history: Alert[] }>('/monitoring/alerts'),
  silence: (key: string, minutes: number) => post('/monitoring/alerts/silence', { key, minutes }),
  host: () => get<{ hostname: string; platform: string; cpus: number; loadAverage: { l1: number; l5: number; l15: number }; memory: { totalMB: number; freeMB: number }; uptimeSeconds: number }>('/monitoring/host'),
  queues: () => get<{ queues: Record<string, Record<string, number>> }>('/monitoring/queues'),

  reportTypes: () => get<{ formats: string[]; types: { id: string; label: string; description?: string }[] }>('/reports/types'),
  generateReport: async (body: { type: string; format: string; days: number }) => {
    const res = await apiClient.post('/reports/generate', body, { responseType: 'blob' })
    const name = /filename="([^"]+)"/.exec(String(res.headers['content-disposition'] ?? ''))?.[1] ?? `${body.type}.${body.format}`
    saveBlob(res.data as Blob, name)
    return { missing: String(res.headers['x-report-missing'] ?? '') }
  },
  reportRuns: (all = false) => get<ReportRun[]>('/reports/runs', all ? { all: 'true' } : undefined),
  downloadReport: async (id: string, name: string) => saveBlob((await apiClient.get(`/reports/runs/${id}/download`, { responseType: 'blob' })).data as Blob, name),
  deleteReport: (id: string) => del(`/reports/runs/${id}`),
  reportSchedules: () => get<ReportSchedule[]>('/reports/schedules'),
  createSchedule: (body: { type: string; format: string; days: number; frequency: string; hourUtc: number; recipients: string[] }) => post<ReportSchedule>('/reports/schedules', body),
  updateSchedule: (id: string, body: Partial<Pick<ReportSchedule, 'enabled' | 'frequency' | 'hourUtc' | 'recipients' | 'days' | 'format'>>) => patch(`/reports/schedules/${id}`, body),
  deleteSchedule: (id: string) => del(`/reports/schedules/${id}`),
  runSchedule: (id: string) => post(`/reports/schedules/${id}/run`),

  emailQueue: () => get<{ transport: string; counts: Record<string, number> }>('/admin/email/queue'),
  emailFailed: () => get<{ id: string; to: string; template: string; attempts: number; reason?: string; at?: number }[]>('/admin/email/failed'),
  retryEmail: (id: string) => post(`/admin/email/failed/${id}/retry`),
  emailTemplates: () => get<{ templates: string[] }>('/admin/email/templates'),
  sendTestEmail: (to: string, template: string) => post('/admin/email/send-test', { to, template }),

  eventsStatus: () => get<{ transport: string; healthy: boolean }>('/admin/events/status'),
  eventTopics: () => get<{ transport: string; topics: { topic?: string; name?: string; length?: number; partitions?: number; [k: string]: unknown }[] }>('/admin/events/topics'),
  eventGroups: () => get<{ transport: string; groups: unknown[] }>('/admin/events/groups'),
  deadLetters: (topic: string) => get<{ topic: string; count: number; letters: { ref: string; id?: string; type?: string; source?: string; at?: string; data?: unknown; unreadable: boolean }[] }>(`/admin/events/dlq/${encodeURIComponent(topic)}`),
  replayDeadLetters: (topic: string) => post<{ replayed?: number }>(`/admin/events/dlq/${encodeURIComponent(topic)}/replay`),
  purgeDeadLetters: (topic: string) => del(`/admin/events/dlq/${encodeURIComponent(topic)}`),

  searchEngine: () => get<Record<string, any>>('/admin/search-engine/health'),
  searchIndices: () => get<any>('/admin/search-engine/indices'),
  searchStats: () => get<{ documents: Record<string, number> }>('/search/admin/stats'),
  reindex: () => post<Record<string, unknown>>('/search/admin/reindex', {}),
}

export interface BackupRecord {
  id: string
  trigger: 'scheduled' | 'manual'
  requestedBy?: string
  status: 'running' | 'success' | 'partial' | 'failed'
  startedAt: string
  finishedAt?: string
  size: number
  sha256?: string
  sources: { name: string; engine: string; ok: boolean; bytes: number; ms: number; error?: string }[]
  error?: string
}
export interface BackupJob {
  id: string
  type: 'backup' | 'restore'
  backupId: string
  status: 'running' | 'success' | 'failed'
  startedAt: string
  finishedAt?: string
  results: BackupRecord['sources']
  error?: string
}

export const backupApi = {
  list: () => get<{ items: BackupRecord[] }>('/backups'),
  status: () => get<{ schedule: string | null; storage: { kind: string; location: string }; retention: { days: number; keepMin: number }; sources: { name: string; engine: string; schema?: string }[]; tools: Record<string, string | null>; busy: boolean; last: BackupRecord | null; lastSuccess: BackupRecord | null; jobs: BackupJob[] }>('/backups/status'),
  run: () => post<{ job: BackupJob }>('/backups'),
  retention: () => post<{ removed: string[] }>('/backups/retention'),
  job: (id: string) => get<BackupJob>(`/backups/jobs/${id}`),
  restore: (id: string, sources?: string[]) => post<{ job: BackupJob }>(`/backups/${id}/restore`, { confirm: id, ...(sources?.length ? { sources } : {}) }),
  remove: (id: string) => del(`/backups/${id}`),
  download: async (id: string) => saveBlob((await apiClient.get(`/backups/${id}/download`, { responseType: 'blob' })).data as Blob, `${id}.tar.gz`),
}

/** Languages offered for shared documents (Monaco language ids). */
export const LANGUAGES = ['javascript', 'typescript', 'python', 'java', 'go', 'rust', 'cpp', 'csharp', 'sql', 'html', 'css', 'json', 'markdown', 'plaintext']
