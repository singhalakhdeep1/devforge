import { Router } from 'express'
import { protect } from '../middleware/auth.middleware'
import {
  createEnrollment,
  getEnrollments,
  getEnrollmentById,
  cancelEnrollment
} from '../controllers/enrollment.controller'

const router = Router()

// Protected routes
router.post('/course/:courseId', protect, createEnrollment)
router.get('/my-courses', protect, getEnrollments)
router.get('/:id', protect, getEnrollmentById)
router.delete('/:id', protect, cancelEnrollment)

export default router
