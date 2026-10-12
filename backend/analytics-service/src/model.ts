import mongoose, { Schema } from 'mongoose'

const NINETY_DAYS = 90 * 24 * 3600

/** Raw events. They expire on their own after 90 days; the daily rollups below are kept. */
const eventSchema = new Schema(
    {
        userId: { type: String, index: true },
        sessionId: { type: String, required: true },
        eventType: { type: String, required: true, enum: ['pageview', 'click', 'form_submit', 'api_call', 'error', 'custom', 'domain'] },
        eventName: { type: String, required: true, maxlength: 80 },
        properties: { type: Schema.Types.Mixed, default: {} },
        timestamp: { type: Date, default: Date.now },
        path: { type: String, maxlength: 300 },
        referrer: { type: String, maxlength: 300 },
        device: String,
        browser: String,
        os: String,
        // domain events carry their bus event id so a redelivery is counted once
        eventKey: { type: String, unique: true, sparse: true },
        country: String, // taken from the browser's language region: approximate, there is no IP geolocation database
    },
    { versionKey: false }
)
eventSchema.index({ timestamp: 1 }, { expireAfterSeconds: NINETY_DAYS })
eventSchema.index({ eventName: 1, timestamp: -1 })
eventSchema.index({ eventType: 1, timestamp: -1 })
eventSchema.index({ sessionId: 1, timestamp: 1 })
eventSchema.index({ userId: 1, timestamp: -1 })
export const AnalyticsEvent = mongoose.model('AnalyticsEvent', eventSchema)

/** One document per UTC day, updated as events arrive and rebuilt nightly from the raw events. */
const dailySchema = new Schema(
    {
        day: { type: String, required: true, unique: true }, // YYYY-MM-DD
        pageviews: { type: Number, default: 0 },
        events: { type: Number, default: 0 },
        signups: { type: Number, default: 0 },
        enrollments: { type: Number, default: 0 },
        completions: { type: Number, default: 0 },
        lessonsCompleted: { type: Number, default: 0 },
        revenueCents: { type: Number, default: 0 },
        paths: { type: Map, of: Number, default: {} },
    },
    { versionKey: false }
)
export const Daily = mongoose.model('AnalyticsDaily', dailySchema)

/** When each user was first seen, for cohort retention. */
const firstSeenSchema = new Schema({ userId: { type: String, unique: true }, firstSeen: { type: Date, index: true } }, { versionKey: false })
export const FirstSeen = mongoose.model('AnalyticsFirstSeen', firstSeenSchema)

/** Per-course domain activity, for instructor insights (survives raw-event expiry). */
const courseDaySchema = new Schema(
    { courseId: { type: Number, required: true }, day: { type: String, required: true }, enrollments: { type: Number, default: 0 }, completions: { type: Number, default: 0 }, revenueCents: { type: Number, default: 0 } },
    { versionKey: false }
)
courseDaySchema.index({ courseId: 1, day: 1 }, { unique: true })
export const CourseDay = mongoose.model('AnalyticsCourseDay', courseDaySchema)

/** (day, user) pairs: the number of documents for a day is that day's active users. */
const activeSchema = new Schema({ day: { type: String, required: true }, userId: { type: String, required: true } }, { versionKey: false })
activeSchema.index({ day: 1, userId: 1 }, { unique: true })
export const DailyActive = mongoose.model('AnalyticsDailyActive', activeSchema)
