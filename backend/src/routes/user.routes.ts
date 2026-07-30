import { Router } from 'express'
import { protect } from '../middleware/auth.middleware'
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  changePassword,
  deleteAccount
} from '../controllers/user.controller'

const router = Router()

// Protected routes
router.get('/profile', protect, getProfile)
router.put('/profile', protect, updateProfile)
router.post('/avatar', protect, uploadAvatar)
router.post('/change-password', protect, changePassword)
router.delete('/account', protect, deleteAccount)

export default router
