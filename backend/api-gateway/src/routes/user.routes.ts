import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { AppError } from '@devhub/shared';

const router = Router();

// GET /api/v1/users/me - Get current user
router.get('/me', authenticate, async (req: any, res: Response, next: NextFunction) => {
    try {
        res.json({
            success: true,
            data: {
                userId: req.user.userId,
                email: req.user.email,
                role: req.user.role,
            },
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/v1/users - Get all users (admin only)
router.get('/', authenticate, authorize('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
    try {
        res.json({
            success: true,
            data: [],
            message: 'Users retrieved successfully',
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/v1/users/:id - Get user by ID
router.get('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        res.json({
            success: true,
            data: { id },
            message: 'User retrieved successfully',
        });
    } catch (error) {
        next(error);
    }
});

// PUT /api/v1/users/:id - Update user
router.put('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        res.json({
            success: true,
            data: { id, ...updateData },
            message: 'User updated successfully',
        });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/v1/users/:id - Delete user (admin only)
router.delete('/:id', authenticate, authorize('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        res.json({
            success: true,
            message: 'User deleted successfully',
        });
    } catch (error) {
        next(error);
    }
});

export default router;
