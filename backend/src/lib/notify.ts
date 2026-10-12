import { prisma } from './prisma'
import { emitToUser } from '../socket'

interface NotificationInput {
    userId: string
    type: 'enrollment' | 'answer' | 'discussion' | 'certificate' | 'quiz' | 'payment' | 'system'
    title: string
    body?: string
    link?: string
}

/** Stores a notification and pushes it live. Failures are logged, never thrown into the caller's request. */
export async function notify({ userId, type, title, body = '', link }: NotificationInput) {
    try {
        const notification = await prisma.notification.create({ data: { userId, type, title, body, link } })
        emitToUser(userId, 'notification', notification)
    } catch (error) {
        console.error('Failed to create notification:', error)
    }
}
