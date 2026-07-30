import { Router } from 'express'
import { protect } from '../middleware/auth.middleware'
import {
  submitQuiz,
  getQuizResults,
  getQuizByLesson
} from '../controllers/quiz.controller'

const router = Router()

// Protected routes
router.post('/submit', protect, submitQuiz)
router.get('/:quizId/results', protect, getQuizResults)
router.get('/lesson/:lessonId', protect, getQuizByLesson)

export default router
