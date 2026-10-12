import mongoose, { Schema } from 'mongoose'

const NINETY_DAYS_MS = 90 * 24 * 3600 * 1000

const notificationSchema = new Schema(
    {
        userId: { type: String, required: true },
        type: { type: String, required: true, maxlength: 40 }, // open set: enrollment, answer, payment, task, system ...
        title: { type: String, required: true, maxlength: 200 },
        body: { type: String, default: '', maxlength: 1000 },
        link: { type: String, maxlength: 300 },
        data: { type: Schema.Types.Mixed },
        readAt: { type: Date, default: null },
        // MongoDB deletes the document itself once this date passes (TTL index below)
        expiresAt: { type: Date, default: () => new Date(Date.now() + NINETY_DAYS_MS) },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
)

notificationSchema.index({ userId: 1, createdAt: -1 })
notificationSchema.index({ userId: 1, readAt: 1 })
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export const Notification = mongoose.model('Notification', notificationSchema)

/** Types a user has chosen not to receive. */
const preferenceSchema = new Schema({ userId: { type: String, required: true, unique: true }, muted: { type: [String], default: [] } })
export const Preference = mongoose.model('NotificationPreference', preferenceSchema)

export type NotificationDoc = InstanceType<typeof Notification>

/** API shape: matches what the web client has always received. */
export const toJSON = (n: NotificationDoc) => ({
    id: String(n._id),
    userId: n.userId,
    type: n.type,
    title: n.title,
    body: n.body,
    link: n.link ?? null,
    data: n.data ?? null,
    readAt: n.readAt,
    createdAt: (n as unknown as { createdAt: Date }).createdAt,
})
