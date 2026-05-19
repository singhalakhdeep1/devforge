import { Router } from 'express';
import twoFactorController from '../controllers/twoFactor.controller';
import { authenticateToken } from '../middleware/auth';
import { rateLimitMiddleware } from '../middleware/rateLimit';

const router = Router();

// Protected routes (require authentication)
router.post(
    '/2fa/setup',
    authenticateToken,
    twoFactorController.setup.bind(twoFactorController)
);

router.post(
    '/2fa/enable',
    authenticateToken,
    rateLimitMiddleware({ max: 5, windowMs: 15 * 60 * 1000 }), // 5 attempts per 15 minutes
    twoFactorController.enable.bind(twoFactorController)
);

router.post(
    '/2fa/disable',
    authenticateToken,
    rateLimitMiddleware({ max: 3, windowMs: 15 * 60 * 1000 }), // 3 attempts per 15 minutes
    twoFactorController.disable.bind(twoFactorController)
);

router.post(
    '/2fa/backup-codes',
    authenticateToken,
    rateLimitMiddleware({ max: 3, windowMs: 60 * 60 * 1000 }), // 3 attempts per hour
    twoFactorController.regenerateBackupCodes.bind(twoFactorController)
);

router.get(
    '/2fa/status',
    authenticateToken,
    twoFactorController.getStatus.bind(twoFactorController)
);

// Public route (during login)
router.post(
    '/2fa/verify',
    rateLimitMiddleware({ max: 10, windowMs: 15 * 60 * 1000 }), // 10 attempts per 15 minutes
    twoFactorController.verify.bind(twoFactorController)
);

export default router;
