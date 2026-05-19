import { Router } from 'express'
import { protect } from '../middleware/auth.middleware'

const router = Router()

router.get('/my-courses', protect, (req, res) => {
    res.json({ message: 'Get user enrollments' })
})

router.get('/progress/:courseId', protect, (req, res) => {
    res.json({ message: `Get progress for course ${req.params.courseId}` })
})

export default router
