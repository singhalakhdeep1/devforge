import mongoose, { Schema, Document } from 'mongoose';

export interface IAnalyticsEvent extends Document {
    userId?: string;
    sessionId: string;
    eventType: string;
    eventName: string;
    properties: Record<string, any>;
    timestamp: Date;
    userAgent?: string;
    ipAddress?: string;
    country?: string;
    city?: string;
    device?: string;
    browser?: string;
    os?: string;
    referrer?: string;
    path?: string;
}

const AnalyticsEventSchema = new Schema<IAnalyticsEvent>({
    userId: {
        type: String,
        index: true,
    },
    sessionId: {
        type: String,
        required: true,
        index: true,
    },
    eventType: {
        type: String,
        required: true,
        enum: ['pageview', 'click', 'form_submit', 'api_call', 'error', 'custom'],
        index: true,
    },
    eventName: {
        type: String,
        required: true,
        index: true,
    },
    properties: {
        type: Schema.Types.Mixed,
        default: {},
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true,
    },
    userAgent: String,
    ipAddress: String,
    country: String,
    city: String,
    device: String,
    browser: String,
    os: String,
    referrer: String,
    path: String,
}, {
    timestamps: true,
});

// Compound indexes for common queries
AnalyticsEventSchema.index({ userId: 1, timestamp: -1 });
AnalyticsEventSchema.index({ eventType: 1, timestamp: -1 });
AnalyticsEventSchema.index({ eventName: 1, timestamp: -1 });

export const AnalyticsEvent = mongoose.model<IAnalyticsEvent>('AnalyticsEvent', AnalyticsEventSchema);
