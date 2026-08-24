import { Notification, INotification } from '../models/notification.model';
import { logger } from '../config/logger';
import { kafkaConsumer } from '@devhub/kafka-service';
import { createClient } from 'redis';

const redis = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
redis.connect().catch(console.error);

export class NotificationService {
    private retryCount = new Map<string, number>();
    private readonly MAX_RETRIES = 3;

    /**
     * Create a new notification
     */
    async create(notificationData: Partial<INotification>): Promise<INotification> {
        try {
            const notification = new Notification(notificationData);
            await notification.save();
            logger.info(`Notification created for user ${notificationData.userId}`);

            // Send real-time notification via Socket.io
            this.sendRealTimeNotification(notification);

            return notification;
        } catch (error) {
            logger.error('Error creating notification:', error);
            throw error;
        }
    }

    /**
     * Send real-time notification via Socket.io
     */
    private sendRealTimeNotification(notification: INotification) {
        // TODO: Implement Socket.io push to client
        logger.info(`Real-time notification sent to user ${notification.userId}`);
    }

    /**
     * Process Kafka message for notification
     */
    async processKafkaMessage(message: any) {
        const { topic, value } = message;
        const messageId = `${topic}-${message.partition}-${message.offset}`;

        try {
            switch (topic) {
                case 'user.created':
                    await this.handleUserCreated(value);
                    break;
                case 'task.assigned':
                    await this.handleTaskAssigned(value);
                    break;
                case 'deploy.failed':
                    await this.handleDeployFailed(value);
                    break;
                default:
                    logger.warn(`Unknown topic: ${topic}`);
            }
            
            // Reset retry count on success
            this.retryCount.delete(messageId);
        } catch (error) {
            logger.error(`Error processing message ${messageId}:`, error);
            
            // Increment retry count
            const retries = (this.retryCount.get(messageId) || 0) + 1;
            this.retryCount.set(messageId, retries);
            
            // Dead-letter: if processing fails 3x, store in failed_notifications
            if (retries >= this.MAX_RETRIES) {
                await this.storeFailedNotification(message, error);
                this.retryCount.delete(messageId);
            }
        }
    }

    /**
     * Handle user.created event
     */
    private async handleUserCreated(data: any) {
        await this.create({
            userId: data.userId,
            type: 'welcome',
            title: 'Welcome to DevForge!',
            message: 'Your account has been created successfully.',
            priority: 'low',
        });
        
        // TODO: Send welcome email
        logger.info(`Welcome notification sent to user ${data.userId}`);
    }

    /**
     * Handle task.assigned event
     */
    private async handleTaskAssigned(data: any) {
        await this.create({
            userId: data.assigneeId,
            type: 'task_assigned',
            title: 'New Task Assigned',
            message: `You have been assigned to task: ${data.taskTitle}`,
            priority: 'medium',
            metadata: { taskId: data.taskId, boardId: data.boardId },
        });
        
        // Push in-app notification
        this.sendRealTimeNotification({
            userId: data.assigneeId,
            type: 'task_assigned',
            data,
        });
    }

    /**
     * Handle deploy.failed event
     */
    private async handleDeployFailed(data: any) {
        await this.create({
            userId: data.userId,
            type: 'deploy_failed',
            title: 'Deployment Failed',
            message: `Deployment failed for ${data.service}: ${data.error}`,
            priority: 'high',
            metadata: { service: data.service, error: data.error },
        });
        
        // Push high-priority alert
        this.sendRealTimeNotification({
            userId: data.userId,
            type: 'deploy_failed',
            data,
        });
    }

    /**
     * Store failed notification in dead-letter queue
     */
    private async storeFailedNotification(message: any, error: any) {
        try {
            await Notification.create({
                userId: 'system',
                type: 'failed_notification',
                title: 'Failed Notification Processing',
                message: `Failed to process message from topic ${message.topic}`,
                priority: 'high',
                metadata: {
                    originalMessage: message.value,
                    error: error.message,
                    topic: message.topic,
                    partition: message.partition,
                    offset: message.offset,
                },
            });
            logger.error(`Stored failed notification for message ${message.topic}:${message.offset}`);
        } catch (storeError) {
            logger.error('Failed to store dead-letter notification:', storeError);
        }
    }

    /**
     * Start Kafka consumer for notification topics
     */
    async startKafkaConsumer() {
        await kafkaConsumer.connect();
        await kafkaConsumer.subscribe(['user.created', 'task.assigned', 'deploy.failed']);
        
        await kafkaConsumer.consumeEachMessage(async (message) => {
            await this.processKafkaMessage(message);
        });
        
        logger.info('Kafka consumer started for notification service');
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
