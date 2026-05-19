import { Notification, INotification } from '../models/notification.model';
import { logger } from '../config/logger';

export class NotificationService {
    /**
     * Create a new notification
     */
    async create(notificationData: Partial<INotification>): Promise<INotification> {
        try {
            const notification = new Notification(notificationData);
            await notification.save();
            logger.info(`Notification created for user ${notificationData.userId}`);

            // TODO: Send real-time notification via WebSocket
            // this.sendRealTimeNotification(notification);

            return notification;
        } catch (error) {
            logger.error('Error creating notification:', error);
            throw error;
        }
    }

    /**
     * Get all notifications for a user
     */
    async getByUserId(
        userId: string,
        page: number = 1,
        limit: number = 20,
        unreadOnly: boolean = false
    ) {
        try {
            const skip = (page - 1) * limit;
            const query: any = { userId };

            if (unreadOnly) {
                query.read = false;
            }

            const [notifications, total] = await Promise.all([
                Notification.find(query)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .lean(),
                Notification.countDocuments(query),
            ]);

            return {
                notifications,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            };
        } catch (error) {
            logger.error('Error fetching notifications:', error);
            throw error;
        }
    }

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId: string, userId: string): Promise<INotification | null> {
        try {
            const notification = await Notification.findOneAndUpdate(
                { _id: notificationId, userId },
                { read: true },
                { new: true }
            );

            if (notification) {
                logger.info(`Notification ${notificationId} marked as read`);
            }

            return notification;
        } catch (error) {
            logger.error('Error marking notification as read:', error);
            throw error;
        }
    }

    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(userId: string): Promise<number> {
        try {
            const result = await Notification.updateMany(
                { userId, read: false },
                { read: true }
            );

            logger.info(`Marked ${result.modifiedCount} notifications as read for user ${userId}`);
            return result.modifiedCount;
        } catch (error) {
            logger.error('Error marking all notifications as read:', error);
            throw error;
        }
    }

    /**
     * Delete a notification
     */
    async delete(notificationId: string, userId: string): Promise<boolean> {
        try {
            const result = await Notification.deleteOne({ _id: notificationId, userId });
            return result.deletedCount > 0;
        } catch (error) {
            logger.error('Error deleting notification:', error);
            throw error;
        }
    }

    /**
     * Delete all notifications for a user
     */
    async deleteAll(userId: string): Promise<number> {
        try {
            const result = await Notification.deleteMany({ userId });
            logger.info(`Deleted ${result.deletedCount} notifications for user ${userId}`);
            return result.deletedCount;
        } catch (error) {
            logger.error('Error deleting all notifications:', error);
            throw error;
        }
    }

    /**
     * Get unread count for a user
     */
    async getUnreadCount(userId: string): Promise<number> {
        try {
            return await Notification.countDocuments({ userId, read: false });
        } catch (error) {
            logger.error('Error getting unread count:', error);
            throw error;
        }
    }

    /**
     * Bulk create notifications
     */
    async bulkCreate(notifications: Partial<INotification>[]): Promise<INotification[]> {
        try {
            const created = await Notification.insertMany(notifications);
            logger.info(`Bulk created ${created.length} notifications`);
            return created;
        } catch (error) {
            logger.error('Error bulk creating notifications:', error);
            throw error;
        }
    }

    /**
     * Send notification to multiple users
     */
    async notifyUsers(
        userIds: string[],
        notificationData: Omit<Partial<INotification>, 'userId'>
    ): Promise<INotification[]> {
        const notifications = userIds.map(userId => ({
            ...notificationData,
            userId,
        }));

        return this.bulkCreate(notifications as Partial<INotification>[]);
    }
}
