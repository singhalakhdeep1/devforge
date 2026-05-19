import express from 'express';
import { auditService } from './audit.service';
import { authMiddleware } from '../auth-service/auth.middleware';
import { requireAdmin } from '../auth-service/rbac.middleware';

const router = express.Router();

// Get audit logs (admin only)
router.get('/logs', authMiddleware, requireAdmin, async (req, res) => {
    try {
        const filters = {
            userId: req.query.userId as string,
            action: req.query.action as string,
            resource: req.query.resource as string,
            status: req.query.status as 'SUCCESS' | 'FAILURE',
            startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
            endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
            page: req.query.page ? parseInt(req.query.page as string) : 1,
            pageSize: req.query.pageSize ? parseInt(req.query.pageSize as string) : 50
        };

        const result = await auditService.getLogs(filters);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get user activity summary
router.get('/activity/:userId', authMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        const days = req.query.days ? parseInt(req.query.days as string) : 30;

        // Users can only view their own activity unless admin
        if ((req as any).user.id !== userId && (req as any).user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const summary = await auditService.getActivitySummary(userId, days);
        res.json(summary);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get security events (admin only)
router.get('/security-events', authMiddleware, requireAdmin, async (req, res) => {
    try {
        const filters = {
            severity: req.query.severity as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
            startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
            endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined
        };

        const events = await auditService.getSecurityEvents(filters);
        res.json(events);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Export logs (admin only)
router.get('/export', authMiddleware, requireAdmin, async (req, res) => {
    try {
        const format = req.query.format as 'csv' | 'json' || 'csv';
        const filters = {
            userId: req.query.userId as string,
            action: req.query.action as string,
            resource: req.query.resource as string,
            status: req.query.status as 'SUCCESS' | 'FAILURE',
            startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
            endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined
        };

        const data = await auditService.exportLogs(filters, format);

        res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=audit-logs-${Date.now()}.${format}`);
        res.send(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
