import { toUser } from '@devhub/shared'
import { Notification, Preference, toJSON } from './model'

export interface NotificationInput {
    userId: string
    type: string
    title: string
    body?: string
    link?: string
    data?: unknown
}

/** Stores a notification (unless the user muted that type) and pushes it to their open tabs. */
export async function createNotification(input: NotificationInput) {
    if (!input.userId || !input.title) return null
    const pref = await Preference.findOne({ userId: input.userId }).lean()
    if (pref?.muted?.includes(input.type)) return null

    const doc = await Notification.create({
        userId: input.userId,
        type: input.type.slice(0, 40),
        title: input.title.slice(0, 200),
        body: (input.body ?? '').slice(0, 1000),
        link: input.link,
        data: input.data,
    })
    const json = toJSON(doc)
    await toUser(input.userId, 'notification', json)
    return json
}

export const unreadCount = (userId: string) => Notification.countDocuments({ userId, readAt: null })
