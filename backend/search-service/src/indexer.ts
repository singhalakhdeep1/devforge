import { INDEX, es, indexDoc, rebuildIndex, removeDoc } from '@devhub/elasticsearch-service'
import { AppError, TOPICS, createEventBus, createLogger, createServiceClient } from '@devhub/shared'

const log = createLogger('search')
const courses = createServiceClient('course')
const auth = createServiceClient('auth')
const GROUP = 'search-service'

interface CourseDoc {
  id: number
  published: boolean
  [k: string]: unknown
}
interface PublicUser {
  id: string
  name: string
  avatar: string | null
  role: string
  bio: string | null
  skills: string[]
  location: string | null
  createdAt: string
}

/** Exactly the fields the index maps (it is strict, so stray fields are rejected rather than silently indexed). */
const courseDoc = (d: Record<string, unknown>) => ({
  id: d.id, title: d.title, description: d.description, category: d.category, level: d.level, price: d.price,
  thumbnailUrl: d.thumbnailUrl ?? null, instructor: d.instructor, modules: d.modules, lessons: d.lessons,
  lessonCount: d.lessonCount, totalMinutes: d.totalMinutes, students: d.students, rating: d.rating, ratingCount: d.ratingCount,
  createdAt: d.createdAt, updatedAt: d.updatedAt,
})

const notFound = (e: unknown) => e instanceof AppError && e.statusCode === 404

/** Index (or remove) one course from its current state. Idempotent, so replays and retries are harmless. */
export async function syncCourse(id: number) {
  try {
    const doc = await courses.get<CourseDoc>(`/internal/courses/${id}/doc`)
    if (!doc.published) return removeDoc(INDEX.courses, id)
    await indexDoc(INDEX.courses, id, courseDoc(doc))
  } catch (e) {
    if (notFound(e)) return removeDoc(INDEX.courses, id)
    throw e
  }
}

// Only teaching profiles are discoverable; students are not listed in search
const searchable = (u: PublicUser) => u.role === 'INSTRUCTOR'
const userDoc = (u: PublicUser) => ({ id: u.id, name: u.name, bio: u.bio ?? '', skills: u.skills ?? [], location: u.location ?? '', role: u.role, avatar: u.avatar, createdAt: u.createdAt })

export async function syncUser(id: string) {
  try {
    const u = await auth.get<PublicUser>(`/internal/users/${id}/public`)
    if (!searchable(u)) return removeDoc(INDEX.users, id)
    await indexDoc(INDEX.users, id, userDoc(u))
  } catch (e) {
    if (notFound(e)) return removeDoc(INDEX.users, id)
    throw e
  }
}

export async function startIndexing() {
  const bus = createEventBus('search')
  await bus.subscribe(TOPICS.courseChanged, GROUP, async ({ data }) => {
    if (data.action === 'deleted') return removeDoc(INDEX.courses, data.courseId)
    await syncCourse(Number(data.courseId))
  })
  const userChanged = async ({ data }: { data: { id: string } }) => syncUser(data.id)
  await bus.subscribe(TOPICS.userRegistered, GROUP, userChanged)
  await bus.subscribe(TOPICS.userUpdated, GROUP, userChanged)
  await bus.subscribe(TOPICS.userDeleted, GROUP, async ({ data }) => removeDoc(INDEX.users, data.id))

  // Projects are indexed from their own events (the project-service owns the data)
  await bus.subscribe(TOPICS.projectChanged, GROUP, async ({ data }) => {
    if (data.action === 'deleted' || data.visibility !== 'PUBLIC') return removeDoc(INDEX.projects, data.id)
    await indexDoc(INDEX.projects, data.id, data.doc)
  })
  log.logInformation('search indexers started')
}

/* ───────────── full rebuilds (backfill and the admin reindex) ───────────── */

async function* courseBatches(): AsyncGenerator<Record<string, unknown>[]> {
  let after = 0
  for (;;) {
    const page = await courses.get<{ ids: number[]; next: number | null }>('/internal/courses', { after, limit: 100 })
    const docs: Record<string, unknown>[] = []
    for (const id of page.ids) {
      try {
        const d = await courses.get<CourseDoc>(`/internal/courses/${id}/doc`)
        if (d.published) docs.push(courseDoc(d))
      } catch (e) {
        if (!notFound(e)) throw e
      }
    }
    yield docs
    if (!page.next) return
    after = page.next
  }
}

async function* userBatches(): AsyncGenerator<Record<string, unknown>[]> {
  let after = ''
  for (;;) {
    const page = await auth.get<{ users: PublicUser[]; next: string | null }>('/internal/users', { after, limit: 200 })
    yield page.users.filter(searchable).map(userDoc)
    if (!page.next) return
    after = page.next
  }
}

export async function reindex(which: 'courses' | 'users' | 'all') {
  const out: Record<string, unknown> = {}
  if (which === 'courses' || which === 'all') out.courses = await rebuildIndex(INDEX.courses, courseBatches() as AsyncIterable<{ id: number }[]>)
  if (which === 'users' || which === 'all') out.users = await rebuildIndex(INDEX.users, userBatches() as AsyncIterable<{ id: string }[]>)
  return out
}

/** On a fresh cluster (or after data loss) fill the indexes without waiting for an admin to ask. */
export async function backfillIfEmpty() {
  for (const [name, alias] of [['courses', INDEX.courses], ['users', INDEX.users]] as const) {
    const { count } = await es().count({ index: alias })
    if (count === 0) {
      log.logInformation(`backfilling empty ${name} index`)
      await reindex(name).catch((e) => log.logWarning('backfill failed (will retry on next start)', { error: String(e) }))
    }
  }
}
