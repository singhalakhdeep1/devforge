import { Router } from 'express'
import { protect } from '../middleware/auth.middleware'

const router = Router()

// Placeholder routes
router.get('/', (req, res) => {
    res.json({ message: 'Get all courses' })
})

router.get('/:id', (req, res) => {
    res.json({ message: `Get course ${req.params.id}` })
})

router.post('/', protect, (req, res) => {
    res.json({ message: 'Create course' })
})

router.post('/:id/enroll', protect, (req, res) => {
    res.json({ message: `Enroll in course ${req.params.id}` })
})

export default router
