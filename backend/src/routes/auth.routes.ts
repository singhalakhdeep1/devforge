import { Router } from 'express'
import { body } from 'express-validator'
import {
    register,
    login,
    logout,
    refreshToken,
    getMe,
    verifyEmail,
    forgotPassword,
    resetPassword,
} from '../controllers/auth.controller'
import { protect } from '../middleware/auth.middleware'
import { validate } from '../middleware/validation.middleware'

const router = Router()

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
    '/register',
    [
        body('email').isEmail().withMessage('Please provide a valid email'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters'),
        body('name').notEmpty().withMessage('Name is required'),
    ],
    validate,
    register
)

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Please provide a valid email'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    validate,
    login
)

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', protect, logout)

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', refreshToken)

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, getMe)

// @route   GET /api/auth/verify/:token
// @desc    Verify email
// @access  Public
router.get('/verify/:token', verifyEmail)

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post(
    '/forgot-password',
    [body('email').isEmail().withMessage('Please provide a valid email')],
    validate,
    forgotPassword
)

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password
// @access  Public
router.post(
    '/reset-password/:token',
    [
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters'),
    ],
    validate,
    resetPassword
)

export default router
