import { Router, Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service';

const router = Router();
const analyticsService = new AnalyticsService();

// POST /api/v1/analytics/track - Track event
router.post('/track', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const event = await analyticsService.trackEvent(req.body);

        res.status(201).json({
            success: true,
            data: event,
            message: 'Event tracked successfully',
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/v1/analytics/user/:userId - Get user stats
router.get('/user/:userId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;
        const { startDate, endDate } = req.query;

        const stats = await analyticsService.getUserStats(
            userId,
            startDate ? new Date(startDate as string) : undefined,
            endDate ? new Date(endDate as string) : undefined
        );

        res.json({
            success: true,
            data: stats,
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/v1/analytics/dau - Daily active users
router.get('/dau', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                error: 'startDate and endDate are required',
            });
        }

        const dau = await analyticsService.getDailyActiveUsers(
            new Date(startDate as string),
            new Date(endDate as string)
        );

        res.json({
            success: true,
            data: dau,
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/v1/analytics/pageviews - Page views
router.get('/pageviews', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { startDate, endDate } = req.query;

        const pageViews = await analyticsService.getPageViews(
            startDate ? new Date(startDate as string) : undefined,
            endDate ? new Date(endDate as string) : undefined
        );

        res.json({
            success: true,
            data: pageViews,
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/v1/analytics/browsers - Browser stats
router.get('/browsers', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { startDate, endDate } = req.query;

        const stats = await analyticsService.getBrowserStats(
            startDate ? new Date(startDate as string) : undefined,
            endDate ? new Date(endDate as string) : undefined
        );

        res.json({
            success: true,
            data: stats,
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/v1/analytics/devices - Device stats
router.get('/devices', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { startDate, endDate } = req.query;

        const stats = await analyticsService.getDeviceStats(
            startDate ? new Date(startDate as string) : undefined,
            endDate ? new Date(endDate as string) : undefined
        );

        res.json({
            success: true,
            data: stats,
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/v1/analytics/geographic - Geographic stats
router.get('/geographic', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { startDate, endDate } = req.query;

        const stats = await analyticsService.getGeographicStats(
            startDate ? new Date(startDate as string) : undefined,
            endDate ? new Date(endDate as string) : undefined
        );

        res.json({
            success: true,
            data: stats,
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/v1/analytics/funnel - Conversion funnel
router.post('/funnel', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { steps, startDate, endDate } = req.body;

        if (!Array.isArray(steps) || steps.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'steps array is required',
            });
        }

        const funnel = await analyticsService.getConversionFunnel(
            steps,
            startDate ? new Date(startDate) : undefined,
            endDate ? new Date(endDate) : undefined
        );

        res.json({
            success: true,
            data: funnel,
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/v1/analytics/retention - Retention rate
router.get('/retention', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cohortDate, days = 30 } = req.query;

        if (!cohortDate) {
            return res.status(400).json({
                success: false,
                error: 'cohortDate is required',
            });
        }

        const retention = await analyticsService.getRetentionRate(
            new Date(cohortDate as string),
            parseInt(days as string)
        );

        res.json({
            success: true,
            data: retention,
        });
    } catch (error) {
        next(error);
    }
});

export default router;
