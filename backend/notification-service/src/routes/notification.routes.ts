import { Router, Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';

const router = Router();
const notificationService = new NotificationService();

// GET /api/v1/notifications - Get user notifications
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.headers['x-user-id'] as string;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const unreadOnly = req.query.unreadOnly === 'true';

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User ID required',
            });
        }

        const result = await notificationService.getByUserId(userId, page, limit, unreadOnly);

        res.json({
            success: true,
            data: result.notifications,
            pagination: result.pagination,
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/v1/notifications - Create notification
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const notification = await notificationService.create(req.body);

        res.status(201).json({
            success: true,
            data: notification,
            message: 'Notification created successfully',
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/v1/notifications/unread-count - Get unread count
router.get('/unread-count', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.headers['x-user-id'] as string;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User ID required',
            });
        }

        const count = await notificationService.getUnreadCount(userId);

        res.json({
            success: true,
            data: { count },
        });
    } catch (error) {
        next(error);
    }
});

// PATCH /api/v1/notifications/:id/read - Mark as read
router.patch('/:id/read', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = req.headers['x-user-id'] as string;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User ID required',
            });
        }

        const notification = await notificationService.markAsRead(id, userId);

        if (!notification) {
            return res.status(404).json({
                success: false,
                error: 'Notification not found',
            });
        }

        res.json({
            success: true,
            data: notification,
            message: 'Notification marked as read',
        });
    } catch (error) {
        next(error);
    }
});

// PATCH /api/v1/notifications/read-all - Mark all as read
router.patch('/read-all', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.headers['x-user-id'] as string;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User ID required',
            });
        }

        const count = await notificationService.markAllAsRead(userId);

        res.json({
            success: true,
            data: { count },
            message: `${count} notifications marked as read`,
        });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/v1/notifications/:id - Delete notification
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = req.headers['x-user-id'] as string;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User ID required',
            });
        }

        const deleted = await notificationService.delete(id, userId);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                error: 'Notification not found',
            });
        }

        res.json({
            success: true,
            message: 'Notification deleted successfully',
        });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/v1/notifications - Delete all notifications
router.delete('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.headers['x-user-id'] as string;

        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'User ID required',
            });
        }

        const count = await notificationService.deleteAll(userId);

        res.json({
            success: true,
            data: { count },
            message: `${count} notifications deleted`,
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/v1/notifications/bulk - Notify multiple users
router.post('/bulk', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userIds, ...notificationData } = req.body;

        if (!Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'userIds array is required',
            });
        }

        const notifications = await notificationService.notifyUsers(userIds, notificationData);

        res.status(201).json({
            success: true,
            data: notifications,
            message: `${notifications.length} notifications created`,
        });
    } catch (error) {
        next(error);
    }
});

export default router;
