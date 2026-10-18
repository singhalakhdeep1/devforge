import { Router } from 'express'
import * as Y from 'yjs'
import { z } from 'zod'
import { AppError, TOPICS, asyncHandler, authenticate, createEventBus, createServiceClient, emit, userOf, validate } from '@devhub/shared'
import { loadWithAccess } from './access'
import { prisma } from './db'
import { currentText, getRoom, openRoom, replaceText } from './rooms'

const router = Router()
const auth = createServiceClient('auth')
const bus = createEventBus('editor')
/** Other services (GraphQL subscriptions, search) learn about document changes from this event. */
const changed = (action: 'created' | 'updated' | 'deleted', doc: { id: string; title: string; ownerId: string }, userId: string) =>
  emit(bus, TOPICS.documentChanged, `document.${action}`, { action, id: doc.id, title: doc.title, ownerId: doc.ownerId, userId }, doc.id)
router.use(authenticate)
const me = (req: Parameters<typeof userOf>[0]) => userOf(req)!

const docJson = (d: { id: string; title: string; language: string; ownerId: string; visibility: string; length: number; createdAt: Date; updatedAt: Date }, access: string) => ({
  id: d.id, title: d.title, language: d.language, ownerId: d.ownerId, visibility: d.visibility, length: d.length, createdAt: d.createdAt, updatedAt: d.updatedAt, access,
})

async function mustAccess(id: string, userId: string, need: 'view' | 'edit' | 'owner') {
  const found = await loadWithAccess(id, userId)
  if (!found) throw AppError.notFound('Document not found') // do not reveal that a private document exists
  const rank = { view: 1, edit: 2, owner: 3 } as const
  if (rank[found.access] < rank[need]) throw AppError.forbidden(need === 'owner' ? 'Only the owner can do that' : 'You have view-only access to this document')
  return found
}

const createSchema = z.object({
  title: z.string().trim().min(1).max(120),
  language: z.string().trim().min(1).max(32).default('javascript'),
  visibility: z.enum(['PRIVATE', 'LINK_VIEW', 'LINK_EDIT']).default('PRIVATE'),
  text: z.string().max(500_000).optional(),
})

router.post('/documents', validate(createSchema), asyncHandler(async (req, res) => {
  const doc = await prisma.document.create({ data: { title: req.body.title, language: req.body.language, visibility: req.body.visibility, ownerId: me(req).id } })
  if (req.body.text) await replaceText(doc.id, req.body.text)
  changed('created', doc, me(req).id)
  res.status(201).json(docJson(await prisma.document.findUniqueOrThrow({ where: { id: doc.id } }), 'owner'))
}))

router.get('/documents', asyncHandler(async (req, res) => {
  const userId = me(req).id
  const docs = await prisma.document.findMany({
    where: { OR: [{ ownerId: userId }, { members: { some: { userId } } }] },
    include: { members: true },
    orderBy: { updatedAt: 'desc' },
    take: 200,
  })
  res.json(docs.map((d) => docJson(d, d.ownerId === userId ? 'owner' : d.members.find((m) => m.userId === userId)?.role === 'EDITOR' ? 'edit' : 'view')))
}))

router.get('/documents/:id', asyncHandler(async (req, res) => {
  const { doc, access } = await mustAccess(req.params.id, me(req).id, 'view')
  const people = access === 'owner' ? await auth.post<{ id: string; name: string; email: string }[]>('/internal/users/lookup', { ids: doc.members.map((m) => m.userId) }).catch(() => []) : []
  res.json({
    ...docJson(doc, access),
    members: access === 'owner' ? doc.members.map((m) => ({ userId: m.userId, role: m.role, name: people.find((p) => p.id === m.userId)?.name ?? null, email: people.find((p) => p.id === m.userId)?.email ?? null })) : undefined,
    activeUsers: openRoom(doc.id)?.awareness.getStates().size ?? 0,
  })
}))

router.patch('/documents/:id', validate(createSchema.omit({ text: true }).partial()), asyncHandler(async (req, res) => {
  await mustAccess(req.params.id, me(req).id, 'owner')
  const doc = await prisma.document.update({ where: { id: req.params.id }, data: req.body })
  changed('updated', doc, me(req).id)
  res.json(docJson(doc, 'owner'))
}))

router.delete('/documents/:id', asyncHandler(async (req, res) => {
  const { doc } = await mustAccess(req.params.id, me(req).id, 'owner')
  await prisma.document.delete({ where: { id: req.params.id } })
  changed('deleted', doc, me(req).id)
  openRoom(req.params.id)?.conns.forEach((_c, ws) => ws.close(4403, 'Document deleted'))
  res.json({ message: 'Document deleted' })
}))

/* ───────────── collaborators ───────────── */

router.post('/documents/:id/members', validate(z.object({ email: z.string().trim().toLowerCase().email(), role: z.enum(['EDITOR', 'VIEWER']).default('EDITOR') })), asyncHandler(async (req, res) => {
  const { doc } = await mustAccess(req.params.id, me(req).id, 'owner')
  const user = await auth.get<{ id: string; name: string }>(`/internal/users/by-email/${encodeURIComponent(req.body.email)}`).catch((e: AppError) => {
    if (e.statusCode === 404) throw AppError.notFound('No DevForge account uses that email');
    throw e
  })
  if (user.id === doc.ownerId) throw AppError.badRequest('The owner already has full access')
  const member = await prisma.documentMember.upsert({
    where: { documentId_userId: { documentId: doc.id, userId: user.id } },
    update: { role: req.body.role },
    create: { documentId: doc.id, userId: user.id, role: req.body.role },
  })
  res.status(201).json({ userId: member.userId, role: member.role, name: user.name })
}))

router.delete('/documents/:id/members/:userId', asyncHandler(async (req, res) => {
  const userId = me(req).id
  const { doc } = await mustAccess(req.params.id, userId, 'view')
  if (doc.ownerId !== userId && req.params.userId !== userId) throw AppError.forbidden('Only the owner can remove other people')
  await prisma.documentMember.deleteMany({ where: { documentId: doc.id, userId: req.params.userId } })
  res.json({ message: 'Removed' })
}))

/* ───────────── content ───────────── */

router.get('/documents/:id/text', asyncHandler(async (req, res) => {
  await mustAccess(req.params.id, me(req).id, 'view')
  res.json({ text: (await currentText(req.params.id)) ?? '' })
}))

router.put('/documents/:id/text', validate(z.object({ text: z.string().max(500_000) })), asyncHandler(async (req, res) => {
  await mustAccess(req.params.id, me(req).id, 'edit')
  await replaceText(req.params.id, req.body.text)
  res.json({ length: req.body.text.length })
}))

router.get('/documents/:id/export', asyncHandler(async (req, res) => {
  const { doc } = await mustAccess(req.params.id, me(req).id, 'view')
  const text = (await currentText(doc.id)) ?? ''
  const format = String(req.query.format ?? 'json')
  const base = doc.title.replace(/[^\w.-]+/g, '_').slice(0, 60) || 'document'
  if (format === 'md') {
    res.type('text/markdown').attachment(`${base}.md`).send(`# ${doc.title}\n\n\`\`\`${doc.language}\n${text}\n\`\`\`\n`)
  } else if (format === 'txt') {
    res.type('text/plain').attachment(`${base}.txt`).send(text)
  } else if (format === 'json') {
    res.json({ id: doc.id, title: doc.title, language: doc.language, text, exportedAt: new Date().toISOString() })
  } else {
    throw AppError.badRequest('format must be json, md or txt')
  }
}))

/* ───────────── snapshots ───────────── */

async function takeSnapshot(docId: string, name: string, userId: string) {
  const room = await getRoom(docId)
  if (!room) throw AppError.notFound('Document not found')
  return prisma.snapshot.create({
    data: { documentId: docId, name, createdBy: userId, text: room.text.toString(), state: Buffer.from(Y.encodeStateAsUpdate(room.doc)) },
    select: { id: true, name: true, createdAt: true, createdBy: true },
  })
}

router.post('/documents/:id/snapshots', validate(z.object({ name: z.string().trim().min(1).max(80).default('Snapshot') })), asyncHandler(async (req, res) => {
  const count = await prisma.snapshot.count({ where: { documentId: req.params.id } })
  await mustAccess(req.params.id, me(req).id, 'edit')
  if (count >= 100) throw AppError.badRequest('Snapshot limit reached; delete some first')
  res.status(201).json(await takeSnapshot(req.params.id, req.body.name, me(req).id))
}))

router.get('/documents/:id/snapshots', asyncHandler(async (req, res) => {
  await mustAccess(req.params.id, me(req).id, 'view')
  res.json(await prisma.snapshot.findMany({ where: { documentId: req.params.id }, select: { id: true, name: true, createdAt: true, createdBy: true }, orderBy: { createdAt: 'desc' }, take: 100 }))
}))

router.post('/documents/:id/restore', validate(z.object({ snapshotId: z.string().uuid() })), asyncHandler(async (req, res) => {
  await mustAccess(req.params.id, me(req).id, 'edit')
  const snap = await prisma.snapshot.findFirst({ where: { id: req.body.snapshotId, documentId: req.params.id } })
  if (!snap) throw AppError.notFound('Snapshot not found')
  await takeSnapshot(req.params.id, `Before restoring "${snap.name}"`, me(req).id) // restoring is undoable
  await replaceText(req.params.id, snap.text)
  res.json({ restored: snap.name, length: snap.text.length })
}))

router.delete('/documents/:id/snapshots/:snapshotId', asyncHandler(async (req, res) => {
  await mustAccess(req.params.id, me(req).id, 'owner')
  await prisma.snapshot.deleteMany({ where: { id: req.params.snapshotId, documentId: req.params.id } })
  res.json({ message: 'Snapshot deleted' })
}))

export default router
