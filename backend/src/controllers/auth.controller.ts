import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { sendEmail } from '../utils/email'
import { generateToken, generateRefreshToken } from '../utils/jwt'

const prisma = new PrismaClient()

// @desc    Register a new user
export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password, name } = req.body

        // Check if user exists
        const userExists = await prisma.user.findUnique({ where: { email } })
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' })
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // Generate verification token
        const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET!, { expiresIn: '1d' })

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                verificationToken,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        })

        // Send verification email
        await sendEmail({
            to: email,
            subject: 'Verify your DevHub account',
            html: `
        <h1>Welcome to DevHub!</h1>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${process.env.FRONTEND_URL}/verify/${verificationToken}">Verify Email</a>
      `,
        })

        // Generate tokens
        const accessToken = generateToken(user.id)
        const refreshToken = generateRefreshToken(user.id)

        // Set refresh token in cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        })

        res.status(201).json({
            success: true,
            data: {
                user,
                accessToken,
            },
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Login user
export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body

        // Check if user exists
        const user = await prisma.user.findUnique({ where: { email } })
        if (!user || !user.password) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' })
        }

        // Generate tokens
        const accessToken = generateToken(user.id)
        const refreshToken = generateRefreshToken(user.id)

        // Set refresh token in cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })

        const { password: _, ...userWithoutPassword } = user

        res.json({
            success: true,
            data: {
                user: userWithoutPassword,
                accessToken,
            },
        })
    } catch (error) {
        next(error)
    }
}

// @desc    Logout user
export const logout = (req: Request, res: Response) => {
    res.clearCookie('refreshToken')
    res.json({ success: true, message: 'Logged out successfully' })
}

// @desc    Refresh access token
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { refreshToken } = req.cookies

        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token not found' })
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string }
        const accessToken = generateToken(decoded.userId)

        res.json({ success: true, data: { accessToken } })
    } catch (error) {
        res.status(401).json({ message: 'Invalid refresh token' })
    }
}

// @desc    Get current user
export const getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                role: true,
                bio: true,
                skills: true,
                githubUrl: true,
                linkedinUrl: true,
                portfolioUrl: true,
                isVerified: true,
                createdAt: true,
            },
        })

        res.json({ success: true, data: user })
    } catch (error) {
        next(error)
    }
}

// @desc    Verify email
export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token } = req.params

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { email: string }

        await prisma.user.update({
            where: { email: decoded.email },
            data: { isVerified: true, verificationToken: null },
        })

        res.json({ success: true, message: 'Email verified successfully' })
    } catch (error) {
        res.status(400).json({ message: 'Invalid or expired token' })
    }
}

// @desc    Forgot password
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        // Generate reset token
        const resetToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '1h' })
        const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour

        await prisma.user.update({
            where: { id: user.id },
            data: { resetToken, resetTokenExpiry },
        })

        // Send reset email
        await sendEmail({
            to: email,
            subject: 'Reset your DevHub password',
            html: `
        <h1>Password Reset</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${process.env.FRONTEND_URL}/reset-password/${resetToken}">Reset Password</a>
        <p>This link expires in 1 hour.</p>
      `,
        })

        res.json({ success: true, message: 'Password reset email sent' })
    } catch (error) {
        next(error)
    }
}

// @desc    Reset password
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token } = req.params
        const { password } = req.body

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
        })

        if (!user || user.resetToken !== token || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired token' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null,
            },
        })

        res.json({ success: true, message: 'Password reset successfully' })
    } catch (error) {
        res.status(400).json({ message: 'Invalid or expired token' })
    }
}
