import { Router } from 'express'
import { protect } from '../middleware/auth.middleware'

const router = Router()

router.post('/submit', protect, (req, res) => {
    res.json({ message: 'Submit quiz' })
})

router.get('/:quizId/results', protect, (req, res) => {
    res.json({ message: `Get quiz results for ${req.params.quizId}` })
})

export default router
