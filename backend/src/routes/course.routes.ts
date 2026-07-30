import { Router } from 'express'
import { protect } from '../middleware/auth.middleware'
import {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  getEnrolledCourses,
  getCourseProgress,
  updateCourseProgress
} from '../controllers/course.controller'

const router = Router()

// Public routes
router.get('/', getAllCourses)
router.get('/:id', getCourseById)

// Protected routes
router.post('/', protect, createCourse)
router.put('/:id', protect, updateCourse)
router.delete('/:id', protect, deleteCourse)
router.post('/:id/enroll', protect, enrollInCourse)
router.get('/enrolled/my-courses', protect, getEnrolledCourses)
router.get('/:id/progress', protect, getCourseProgress)
router.post('/:id/progress', protect, updateCourseProgress)

export default router
