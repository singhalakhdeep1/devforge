import { Router } from 'express'
import { protect } from '../middleware/auth.middleware'

const router = Router()

// Placeholder routes - implement controllers
router.get('/', (req, res) => {
    res.json({ message: 'Get all users' })
})

router.get('/profile', protect, (req, res) => {
    res.json({ message: 'Get user profile' })
})

router.put('/profile', protect, (req, res) => {
    res.json({ message: 'Update user profile' })
})

export default router
