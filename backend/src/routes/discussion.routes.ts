import { Router } from 'express'
import { protect } from '../middleware/auth.middleware'
import {
  createDiscussion,
  getDiscussionsByCourse,
  getDiscussionById,
  addAnswer,
  upvoteAnswer
} from '../controllers/discussion.controller'

const router = Router()

// Protected routes
router.post('/', protect, createDiscussion)
router.get('/course/:courseId', protect, getDiscussionsByCourse)
router.get('/:id', protect, getDiscussionById)
router.post('/:id/answer', protect, addAnswer)
router.post('/:discussionId/answer/:answerId/upvote', protect, upvoteAnswer)

export default router
