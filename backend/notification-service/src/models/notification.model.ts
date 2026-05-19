import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    userId: string;
    type: 'PROJECT_INVITE' | 'COMMENT' | 'MENTION' | 'LIKE' | 'FOLLOW' | 'SYSTEM' | 'PAYMENT';
    title: string;
    message: string;
    data?: any;
    read: boolean;
    link?: string;
    imageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>({
    userId: {
        type: String,
        required: true,
        index: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['PROJECT_INVITE', 'COMMENT', 'MENTION', 'LIKE', 'FOLLOW', 'SYSTEM', 'PAYMENT'],
    },
    title: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    data: {
        type: Schema.Types.Mixed,
    },
    read: {
        type: Boolean,
        default: false,
        index: true,
    },
    link: {
        type: String,
    },
    imageUrl: {
        type: String,
    },
}, {
    timestamps: true,
});

// Indexes for performance
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, read: 1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
