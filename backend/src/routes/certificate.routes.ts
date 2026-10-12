import { Router } from 'express'
import { handle, notFound } from '../lib/errors'
import { prisma } from '../lib/prisma'
import { protect } from '../middleware/auth'

const router = Router()

const shape = (c: { id: string; issuedAt: Date; user: { name: string }; course: { id: number; title: string; instructor: { name: string } } }) => ({
    id: c.id,
    issuedAt: c.issuedAt,
    studentName: c.user.name,
    courseId: c.course.id,
    courseTitle: c.course.title,
    instructorName: c.course.instructor.name,
})

const include = { user: { select: { name: true } }, course: { select: { id: true, title: true, instructor: { select: { name: true } } } } }

// GET /api/certificates  - the caller's certificates
router.get(
    '/',
    protect,
    handle(async (req, res) => {
        const certs = await prisma.certificate.findMany({ where: { userId: req.user.id }, orderBy: { issuedAt: 'desc' }, include })
        res.json(certs.map(shape))
    })
)

// GET /api/certificates/:id  - public, so anyone can verify a certificate code
router.get(
    '/:id',
    handle(async (req, res) => {
        const id = String(req.params.id)
        if (!/^[0-9a-f-]{36}$/i.test(id)) throw notFound('Certificate')
        const cert = await prisma.certificate.findUnique({ where: { id }, include })
        if (!cert) throw notFound('Certificate')
        res.json(shape(cert))
    })
)

export default router
