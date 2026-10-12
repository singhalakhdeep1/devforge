import { TOPICS, createEventBus, emit } from '@devhub/shared'

interface NotificationInput {
    userId: string
    type: 'enrollment' | 'answer' | 'discussion' | 'certificate' | 'quiz' | 'payment' | 'system'
    title: string
    body?: string
    link?: string
}

export const bus = createEventBus('course')

/** Asks the notification-service to store and push a notification. Never throws into the caller's request. */
export async function notify({ userId, type, title, body = '', link }: NotificationInput) {
    emit(bus, TOPICS.notificationRequested, 'notification.requested', { userId, type, title, body, link }, userId)
}
