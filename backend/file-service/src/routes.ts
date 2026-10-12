import crypto from 'node:crypto'
import { Router, type NextFunction, type Request, type Response } from 'express'
import multer from 'multer'
import sharp from 'sharp'
import { z } from 'zod'
import { AppError, TOPICS, asyncHandler, authenticate, internalOnly, createEventBus, createServiceClient, emit, env, envInt, fileUploadSize, fileUploads, userOf, validate } from '@devhub/shared'
import { prisma } from './db'
import { storage } from './storage'

const bus = createEventBus('file')
const auth = createServiceClient('auth')
const me = (req: Request) => userOf(req)!

const MAX_FILE = envInt('MAX_FILE_MB', 25) * 1024 * 1024
const QUOTA = envInt('FILE_QUOTA_MB', 100) * 1024 * 1024
const MAX_AVATAR = 2 * 1024 * 1024

/** Allowed uploads. SVG is excluded on purpose: it can carry scripts. */
const ALLOWED: Record<string, string[]> = {
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf'],
  'application/zip': ['.zip'],
  'text/plain': ['.txt', '.md', '.log', '.csv', '.ts', '.js', '.py', '.go', '.rs', '.java', '.c', '.cpp', '.sql', '.sh', '.yml', '.yaml', '.toml'],
  'application/json': ['.json'],
  'video/mp4': ['.mp4'],
  'video/webm': ['.webm'],
}

/** The first bytes decide what a file really is; a client-supplied type is only a claim. */
function sniff(b: Buffer): string | null {
  if (b.length >= 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png'
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg'
  if (b.length >= 6 && ['GIF87a', 'GIF89a'].includes(b.subarray(0, 6).toString('latin1'))) return 'image/gif'
  if (b.length >= 12 && b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP') return 'image/webp'
  if (b.length >= 5 && b.subarray(0, 5).toString('latin1') === '%PDF-') return 'application/pdf'
  if (b.length >= 4 && b[0] === 0x50 && b[1] === 0x4b && (b[2] === 0x03 || b[2] === 0x05)) return 'application/zip'
  if (b.length >= 12 && b.subarray(4, 8).toString('latin1') === 'ftyp') return 'video/mp4'
  if (b.length >= 4 && b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3) return 'video/webm'
  return null
}
const looksLikeText = (b: Buffer) => !b.subarray(0, 8000).includes(0)

const upload = (field: string, maxBytes: number) => {
  const m = multer({ storage: multer.memoryStorage(), limits: { fileSize: maxBytes, files: 1 } }).single(field)
  return (req: Request, res: Response, next: NextFunction) =>
    m(req, res, (err: unknown) => {
      if (!err) return next()
      if (err instanceof multer.MulterError) {
        return next(err.code === 'LIMIT_FILE_SIZE' ? new AppError(413, `File is too large (max ${Math.round(maxBytes / 1024 / 1024)} MB)`, 'TOO_LARGE') : AppError.badRequest(err.message))
      }
      next(err)
    })
}

const safeName = (name: string) => name.replace(/[\r\n"\\/]+/g, '_').replace(/[^\p{L}\p{N}._ -]+/gu, '_').slice(0, 120) || 'file'
const ext = (name: string) => (name.includes('.') ? name.slice(name.lastIndexOf('.')).toLowerCase() : '')

export const publicRouter = Router() // no authentication: avatars and files their owner made public

const NAME = /^[\w-]{8,64}\.(webp|png|jpe?g)$/
publicRouter.get(
  '/avatars/:name',
  asyncHandler(async (req, res) => {
    if (!NAME.test(req.params.name)) throw AppError.notFound('Not found')
    const obj = await storage().get(`avatars/${req.params.name}`)
    if (!obj) throw AppError.notFound('Not found')
    res.setHeader('Content-Type', req.params.name.endsWith('.png') ? 'image/png' : req.params.name.endsWith('.webp') ? 'image/webp' : 'image/jpeg')
    res.setHeader('Cache-Control', 'public, max-age=604800, immutable')
    obj.stream.pipe(res)
  })
)

publicRouter.get(
  '/files/:id/:name',
  asyncHandler(async (req, res) => {
    const f = await prisma.file.findUnique({ where: { id: req.params.id } }).catch(() => null)
    if (!f || f.visibility !== 'PUBLIC') throw AppError.notFound('Not found')
    await sendFile(res, f, false)
  })
)

async function sendFile(res: Response, f: { key: string; name: string; mimeType: string; size: number }, attachment: boolean) {
  const s = storage()
  if (attachment) {
    const url = await s.presign(f.key, 300, f.name)
    if (url) return res.redirect(url)
  }
  const obj = await s.get(f.key)
  if (!obj) throw AppError.notFound('The file is missing from storage')
  const inline = !attachment && f.mimeType.startsWith('image/')
  res.setHeader('Content-Type', f.mimeType)
  res.setHeader('Content-Length', String(f.size))
  res.setHeader('Content-Disposition', `${inline ? 'inline' : 'attachment'}; filename="${safeName(f.name)}"`)
  res.setHeader('X-Content-Type-Options', 'nosniff')
  obj.stream.pipe(res)
}

const router = Router()
router.use(authenticate)

const fileJson = (f: { id: string; name: string; mimeType: string; size: number; visibility: string; createdAt: Date }) => ({
  id: f.id, name: f.name, mimeType: f.mimeType, size: f.size, visibility: f.visibility, createdAt: f.createdAt,
  url: f.visibility === 'PUBLIC' ? `/uploads/files/${f.id}/${encodeURIComponent(safeName(f.name))}` : null,
  downloadUrl: `/api/files/${f.id}/download`,
})

/* ───────────── avatar ───────────── */

router.post(
  '/avatar',
  upload('avatar', MAX_AVATAR),
  asyncHandler(async (req, res) => {
    const file = req.file
    if (!file) throw AppError.badRequest('Upload a PNG, JPEG or WebP image up to 2 MB')
    const kind = sniff(file.buffer)
    if (!kind || !['image/png', 'image/jpeg', 'image/webp'].includes(kind)) throw AppError.badRequest('Upload a PNG, JPEG or WebP image up to 2 MB')

    let processed: Buffer
    try {
      processed = await sharp(file.buffer, { limitInputPixels: 40_000_000 }).rotate().resize(256, 256, { fit: 'cover' }).webp({ quality: 82 }).toBuffer()
    } catch {
      throw AppError.badRequest('That image could not be read')
    }
    const userId = me(req).id
    const id = crypto.randomUUID()
    const key = `avatars/${id}.webp`
    await storage().put(key, processed, 'image/webp')
    const avatar = `/uploads/avatars/${id}.webp`

    const { previous } = await auth.patch<{ avatar: string; previous: string | null }>(`/internal/users/${userId}/avatar`, { avatar }, { id: userId, role: me(req).role }).catch(async (e) => {
      await storage().delete(key) // do not leave an orphan if the profile could not be updated
      throw e
    })
    await prisma.file.create({ data: { id, ownerId: userId, name: 'avatar.webp', mimeType: 'image/webp', size: processed.length, key, visibility: 'PUBLIC' } })

    if (previous?.startsWith('/uploads/avatars/')) {
      const oldKey = `avatars/${previous.split('/').pop()}`
      await storage().delete(oldKey).catch(() => undefined)
      await prisma.file.deleteMany({ where: { key: oldKey } })
    }
    fileUploads.inc({ status: 'ok', file_type: 'avatar', service: 'file' })
    res.json({ avatar })
  })
)

/* ───────────── general files ───────────── */

router.post(
  '/',
  upload('file', MAX_FILE),
  asyncHandler(async (req, res) => {
    const file = req.file
    const userId = me(req).id
    if (!file) throw AppError.badRequest('Attach a file in the "file" field')
    const visibility = req.body?.visibility === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE'

    // what the file really is, not what the browser said
    const claimed = file.mimetype
    const real = sniff(file.buffer) ?? (looksLikeText(file.buffer) && ['text/plain', 'application/json'].includes(claimed) ? claimed : null)
    const allowedExts = real ? ALLOWED[real] : undefined
    if (!real || !allowedExts) throw AppError.badRequest('This file type is not allowed')
    if (real === 'application/json') {
      try { JSON.parse(file.buffer.toString('utf8')) } catch { throw AppError.badRequest('That is not valid JSON') }
    }
    const name = safeName(file.originalname)
    if (!allowedExts.includes(ext(name))) throw AppError.badRequest(`The file extension does not match its content (${real})`)

    const used = (await prisma.file.aggregate({ where: { ownerId: userId }, _sum: { size: true } }))._sum.size ?? 0
    if (used + file.size > QUOTA) throw new AppError(413, `Storage quota exceeded (${Math.round(QUOTA / 1024 / 1024)} MB)`, 'QUOTA')

    const id = crypto.randomUUID()
    const key = `files/${userId}/${id}`
    await storage().put(key, file.buffer, real)
    const row = await prisma.file.create({ data: { id, ownerId: userId, name, mimeType: real, size: file.size, key, visibility } })
    fileUploads.inc({ status: 'ok', file_type: real, service: 'file' })
    fileUploadSize.observe({ file_type: real, service: 'file' }, file.size)
    emit(bus, TOPICS.fileUploaded, 'file.uploaded', { id, ownerId: userId, name, mimeType: real, size: file.size }, userId)
    res.status(201).json(fileJson(row))
  })
)

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const userId = me(req).id
    const [files, used] = await Promise.all([
      prisma.file.findMany({ where: { ownerId: userId, key: { startsWith: 'files/' } }, orderBy: { createdAt: 'desc' }, take: 200 }),
      prisma.file.aggregate({ where: { ownerId: userId }, _sum: { size: true } }),
    ])
    res.json({ files: files.map(fileJson), usedBytes: used._sum.size ?? 0, quotaBytes: QUOTA })
  })
)

const own = async (id: string, req: Request) => {
  const f = await prisma.file.findUnique({ where: { id } }).catch(() => null)
  // admins may read any file, only owners may change one
  if (!f || (f.ownerId !== me(req).id && me(req).role !== 'ADMIN')) throw AppError.notFound('File not found')
  return f
}

router.get('/:id', asyncHandler(async (req, res) => res.json(fileJson(await own(req.params.id, req)))))

router.get(
  '/:id/download',
  asyncHandler(async (req, res) => {
    await sendFile(res, await own(req.params.id, req), true)
  })
)

router.patch(
  '/:id',
  validate(z.object({ name: z.string().trim().min(1).max(120).optional(), visibility: z.enum(['PRIVATE', 'PUBLIC']).optional() })),
  asyncHandler(async (req, res) => {
    const f = await own(req.params.id, req)
    if (f.ownerId !== me(req).id) throw AppError.forbidden()
    res.json(fileJson(await prisma.file.update({ where: { id: f.id }, data: { ...(req.body.name ? { name: safeName(req.body.name) } : {}), ...(req.body.visibility ? { visibility: req.body.visibility } : {}) } })))
  })
)

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const f = await own(req.params.id, req)
    if (f.ownerId !== me(req).id) throw AppError.forbidden()
    await storage().delete(f.key)
    await prisma.file.delete({ where: { id: f.id } })
    res.json({ message: 'File deleted' })
  })
)

/** Remove everything a deleted account owned. */
export async function purgeUser(userId: string) {
  const files = await prisma.file.findMany({ where: { ownerId: userId } })
  for (const f of files) await storage().delete(f.key).catch(() => undefined)
  await prisma.file.deleteMany({ where: { ownerId: userId } })
}

/** For other services (a project attaching a file): metadata only, never the bytes. */
export const internalRouter = Router()
internalRouter.use(internalOnly)
internalRouter.get(
  '/files/:id',
  asyncHandler(async (req, res) => {
    const f = await prisma.file.findUnique({ where: { id: req.params.id } }).catch(() => null)
    if (!f || !f.key.startsWith('files/')) throw AppError.notFound('File not found')
    res.json({ id: f.id, ownerId: f.ownerId, name: f.name, mimeType: f.mimeType, size: f.size, visibility: f.visibility })
  })
)

export { env }
export default router
