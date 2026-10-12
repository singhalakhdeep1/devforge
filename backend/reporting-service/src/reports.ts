import { createServiceClient } from '@devhub/shared'

export interface Section { title: string; columns: string[]; rows: (string | number | null)[][] }
export interface Report {
  type: string
  title: string
  days: number
  generatedAt: string
  summary: { label: string; value: string | number }[]
  sections: Section[]
  /** parts of the report that could not be built because a service did not answer */
  missing: string[]
}

export const REPORT_TYPES = {
  platform: { label: 'Platform overview', description: 'Users, learning, revenue, projects, delivery and engagement in one page', roles: ['ADMIN'] },
  users: { label: 'Users', description: 'Sign-ups, roles, verification and two-factor adoption', roles: ['ADMIN'] },
  courses: { label: 'Courses', description: 'Catalogue size, enrolments, completions, ratings and top courses', roles: ['ADMIN'] },
  revenue: { label: 'Revenue', description: 'Paid orders, refunds, daily revenue, best sellers and subscriptions', roles: ['ADMIN'] },
  projects: { label: 'Projects', description: 'Project and team activity, stars, comments and popular tags', roles: ['ADMIN'] },
  delivery: { label: 'Delivery (boards)', description: 'Tasks created and completed, overdue work and logged hours', roles: ['ADMIN'] },
  engagement: { label: 'Engagement', description: 'Page views, active users and learning activity from analytics', roles: ['ADMIN'] },
  instructor: { label: 'My courses', description: 'Per-course students, completions, ratings and revenue for an instructor', roles: ['ADMIN', 'INSTRUCTOR'] },
} as const
export type ReportType = keyof typeof REPORT_TYPES

const clients = {
  auth: createServiceClient('auth'),
  course: createServiceClient('course'),
  payment: createServiceClient('payment'),
  project: createServiceClient('project'),
  kanban: createServiceClient('kanban'),
  analytics: createServiceClient('analytics'),
}
// The reporting service acts with an administrator's identity when it reads other services' admin endpoints
const SYSTEM = { id: 'reporting-service', role: 'ADMIN' }

type Fetched<T> = { ok: true; data: T } | { ok: false }
async function fetchStats<T>(call: () => Promise<T>, label: string, missing: string[]): Promise<Fetched<T>> {
  try { return { ok: true, data: await call() } } catch { missing.push(label); return { ok: false } }
}

const money = (n: number) => `$${n.toFixed(2)}`
const day = (rows: { day: string; count?: number; revenue?: number; orders?: number }[], key: 'count' | 'revenue' = 'count'): Section['rows'] => rows.map((r) => [r.day, (r[key] as number) ?? 0])
const pct = (a: number, b: number) => (b ? `${((a / b) * 100).toFixed(1)}%` : 'n/a')

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function build(type: ReportType, days: number, opts: { instructorId?: string } = {}): Promise<Report> {
  const missing: string[] = []
  const r: Report = { type, title: REPORT_TYPES[type].label, days, generatedAt: new Date().toISOString(), summary: [], sections: [], missing }
  const q = { days }

  const users = type === 'platform' || type === 'users' ? await fetchStats<any>(() => clients.auth.get('/internal/stats', q), 'users', missing) : null
  const courses = type === 'platform' || type === 'courses' ? await fetchStats<any>(() => clients.course.get('/internal/stats', q), 'courses', missing) : null
  const pay = type === 'platform' || type === 'revenue' ? await fetchStats<any>(() => clients.payment.get('/internal/stats', q), 'revenue', missing) : null
  const proj = type === 'platform' || type === 'projects' ? await fetchStats<any>(() => clients.project.get('/internal/stats', q), 'projects', missing) : null
  const kan = type === 'platform' || type === 'delivery' ? await fetchStats<any>(() => clients.kanban.get('/internal/stats', q), 'delivery', missing) : null
  const eng = type === 'platform' || type === 'engagement' ? await fetchStats<any>(() => clients.analytics.get(`/api/analytics/admin/overview?days=${days}`, undefined, SYSTEM), 'engagement', missing) : null

  if (users?.ok) {
    const u = users.data
    r.summary.push({ label: 'Users', value: u.total }, { label: `New users (${days}d)`, value: u.newUsers }, { label: `Signed in (${days}d)`, value: u.activeInPeriod })
    if (type === 'users') r.summary.push({ label: 'Verified email', value: pct(u.verified, u.total) }, { label: 'Two-factor enabled', value: pct(u.twoFactor, u.total) })
    r.sections.push({ title: 'Users by role', columns: ['Role', 'Users'], rows: Object.entries(u.byRole) as any })
    if (type === 'users') r.sections.push({ title: 'Sign-ups per day', columns: ['Day', 'Sign-ups'], rows: day(u.signupsPerDay) })
  }
  if (courses?.ok) {
    const c = courses.data
    r.summary.push({ label: 'Published courses', value: c.published }, { label: `New enrolments (${days}d)`, value: c.newEnrollments }, { label: `Completions (${days}d)`, value: c.completions })
    if (type === 'courses') r.summary.push({ label: 'Average rating', value: c.averageRating }, { label: 'Completion rate', value: c.completionRate === null ? 'n/a' : `${c.completionRate}%` }, { label: 'Draft courses', value: c.drafts })
    r.sections.push({ title: 'Top courses', columns: ['Course', 'Category', 'Price', 'Enrolments', 'Reviews', `Revenue (${days}d)`], rows: c.topCourses.map((t: any) => [t.title, t.category, money(t.price), t.enrollments, t.reviews, money(t.revenue)]) })
    if (type === 'courses') {
      r.sections.push({ title: 'Courses by category', columns: ['Category', 'Courses'], rows: c.byCategory.map((x: any) => [x.category, x.courses]) })
      r.sections.push({ title: 'Enrolments per day', columns: ['Day', 'Enrolments'], rows: day(c.enrollmentsPerDay) })
    }
  }
  if (pay?.ok) {
    const p = pay.data
    r.summary.push({ label: `Revenue (${days}d)`, value: money(p.revenue) }, { label: 'Refunded', value: money(p.refunded) }, { label: 'Net', value: money(p.net) })
    if (type === 'revenue') r.summary.push({ label: 'Paid orders', value: p.paidOrders }, { label: 'Refunded orders', value: p.refundedOrders })
    if (type === 'revenue') {
      r.sections.push({ title: 'Revenue per day', columns: ['Day', 'Revenue', 'Orders'], rows: p.revenuePerDay.map((d: any) => [d.day, money(d.revenue), d.orders]) })
      r.sections.push({ title: 'Best sellers', columns: ['Course', 'Orders', 'Revenue'], rows: p.topCourses.map((t: any) => [t.title, t.orders, money(t.revenue)]) })
      r.sections.push({ title: 'Subscriptions', columns: ['Plan', 'Status', 'Subscribers'], rows: p.subscriptions.map((s: any) => [s.plan, s.status, s.count]) })
      r.sections.push({ title: 'Orders by status', columns: ['Status', 'Orders'], rows: Object.entries(p.ordersByStatus) as any })
    }
  }
  if (proj?.ok) {
    const p = proj.data
    r.summary.push({ label: 'Projects', value: p.total }, { label: `New projects (${days}d)`, value: p.newProjects })
    if (type === 'projects') r.summary.push({ label: 'Teams', value: p.teams }, { label: `Comments (${days}d)`, value: p.commentsInPeriod }, { label: `Stars (${days}d)`, value: p.starsInPeriod }, { label: 'Archived', value: p.archived })
    if (type === 'projects') {
      r.sections.push({ title: 'Projects by visibility', columns: ['Visibility', 'Projects'], rows: Object.entries(p.byVisibility) as any })
      r.sections.push({ title: 'Top projects', columns: ['Project', 'Stars', 'Comments', 'Members'], rows: p.topProjects.map((t: any) => [t.name, t.stars, t.comments, t.members]) })
      r.sections.push({ title: 'Popular tags', columns: ['Tag', 'Projects'], rows: p.topTags.map((t: any) => [t.tag, t.projects]) })
      r.sections.push({ title: 'New projects per day', columns: ['Day', 'Projects'], rows: day(p.projectsPerDay) })
    }
  }
  if (kan?.ok) {
    const k = kan.data
    r.summary.push({ label: `Tasks completed (${days}d)`, value: k.completed }, { label: `Tasks created (${days}d)`, value: k.created }, { label: 'Overdue tasks', value: k.overdue })
    if (type === 'delivery') {
      r.summary.push({ label: 'Boards', value: k.boards }, { label: 'Hours logged', value: k.hoursLogged }, { label: 'Sprints completed', value: k.sprintsCompleted })
      r.sections.push({ title: 'Tasks by status', columns: ['Status', 'Tasks'], rows: Object.entries(k.tasksByStatus) as any })
      r.sections.push({ title: 'Created per day', columns: ['Day', 'Tasks'], rows: day(k.createdPerDay) })
      r.sections.push({ title: 'Completed per day', columns: ['Day', 'Tasks'], rows: day(k.completedPerDay) })
    }
  }
  if (eng?.ok) {
    const e = eng.data
    r.summary.push({ label: `Active users (${days}d)`, value: e.totals.activeUsers }, { label: `Page views (${days}d)`, value: e.totals.pageviews })
    if (type === 'engagement') {
      r.summary.push({ label: 'Lessons completed', value: e.totals.lessonsCompleted }, { label: 'Sign-ups', value: e.totals.signups })
      r.sections.push({ title: 'Daily activity', columns: ['Day', 'Page views', 'Active users', 'Sign-ups', 'Enrolments', 'Lessons completed'], rows: e.series.map((d: any) => [d.day, d.pageviews, d.activeUsers, d.signups, d.enrollments, d.lessonsCompleted]) })
    }
  }
  if (type === 'instructor') {
    if (!opts.instructorId) throw new Error('instructorId is required')
    const rep = await fetchStats<any>(() => clients.course.get(`/internal/instructors/${opts.instructorId}/report`, q), 'courses', missing)
    if (rep.ok) {
      const rows = rep.data.courses
      r.summary.push({ label: 'Courses', value: rows.length }, { label: 'Students', value: rows.reduce((n: number, c: any) => n + c.students, 0) }, { label: `New enrolments (${days}d)`, value: rows.reduce((n: number, c: any) => n + c.newEnrollments, 0) }, { label: `Revenue (${days}d)`, value: money(rows.reduce((n: number, c: any) => n + c.revenue, 0)) })
      r.sections.push({ title: 'Your courses', columns: ['Course', 'Status', 'Price', 'Students', `New (${days}d)`, `Completed (${days}d)`, 'Rating', 'Reviews', `Revenue (${days}d)`], rows: rows.map((c: any) => [c.title, c.published ? 'Published' : 'Draft', money(c.price), c.students, c.newEnrollments, c.completions, c.rating, c.reviews, money(c.revenue)]) })
    }
  }
  return r
}
