import { Router } from 'express'
import { protect } from '../middleware/auth.middleware'

const router = Router()

router.get('/', (req, res) => {
    res.json({ message: 'Get all discussions' })
})

router.post('/', protect, (req, res) => {
    res.json({ message: 'Create discussion' })
})

router.post('/:id/answer', protect, (req, res) => {
    res.json({ message: `Answer discussion ${req.params.id}` })
})

export default router
