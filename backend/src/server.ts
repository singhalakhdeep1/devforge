import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import { config } from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'

// Load environment variables
config()

// Import routes
import authRoutes from './routes/auth.routes'
import userRoutes from './routes/user.routes'
import courseRoutes from './routes/course.routes'
import enrollmentRoutes from './routes/enrollment.routes'
import quizRoutes from './routes/quiz.routes'
import discussionRoutes from './routes/discussion.routes'
import editorRoutes from './routes/editor.routes'

// Import middleware
import { errorHandler } from './middleware/error.middleware'
import { notFound } from './middleware/notFound.middleware'

const app = express()
const httpServer = createServer(app)

// Socket.IO setup
const io = new Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    },
})

// Middleware
app.use(helmet())
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}))
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
})
app.use('/api/', limiter)

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/enrollments', enrollmentRoutes)
app.use('/api/quizzes', quizRoutes)
app.use('/api/discussions', discussionRoutes)
app.use('/api/editor', editorRoutes)

// Socket.IO events
io.on('connection', (socket) => {
    console.log('User connected:', socket.id)

    // Join room for real-time collaboration
    socket.on('join-room', (roomId: string) => {
        socket.join(roomId)
        console.log(`User ${socket.id} joined room ${roomId}`)
    })

    // Handle code changes
    socket.on('code-change', (data: { roomId: string; code: string }) => {
        socket.to(data.roomId).emit('code-update', data.code)
    })

    // Handle cursor position
    socket.on('cursor-move', (data: { roomId: string; position: any }) => {
        socket.to(data.roomId).emit('cursor-update', { userId: socket.id, position: data.position })
    })

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id)
    })
})

// Error handling
app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000

httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`📝 API: http://localhost:${PORT}/api`)
    console.log(`🔌 Socket.IO ready for connections`)
})

export { io }
export default app
