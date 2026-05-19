import { AnalyticsEvent, IAnalyticsEvent } from '../models/event.model';
import { logger } from '../config/logger';

export class AnalyticsService {
    /**
     * Track an analytics event
     */
    async trackEvent(eventData: Partial<IAnalyticsEvent>): Promise<IAnalyticsEvent> {
        try {
            const event = new AnalyticsEvent(eventData);
            await event.save();
            logger.info(`Event tracked: ${eventData.eventName}`);
            return event;
        } catch (error) {
            logger.error('Error tracking event:', error);
            throw error;
        }
    }

    /**
     * Get user statistics
     */
    async getUserStats(userId: string, startDate?: Date, endDate?: Date) {
        try {
            const query: any = { userId };
            if (startDate || endDate) {
                query.timestamp = {};
                if (startDate) query.timestamp.$gte = startDate;
                if (endDate) query.timestamp.$lte = endDate;
            }

            const [totalEvents, eventsByType, topEvents] = await Promise.all([
                AnalyticsEvent.countDocuments(query),
                AnalyticsEvent.aggregate([
                    { $match: query },
                    { $group: { _id: '$eventType', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                ]),
                AnalyticsEvent.aggregate([
                    { $match: query },
                    { $group: { _id: '$eventName', count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 10 },
                ]),
            ]);

            return {
                totalEvents,
                eventsByType,
                topEvents,
            };
        } catch (error) {
            logger.error('Error getting user stats:', error);
            throw error;
        }
    }

    /**
     * Get daily active users
     */
    async getDailyActiveUsers(startDate: Date, endDate: Date) {
        try {
            const result = await AnalyticsEvent.aggregate([
                {
                    $match: {
                        timestamp: { $gte: startDate, $lte: endDate },
                        userId: { $exists: true },
                    },
                },
                {
                    $group: {
                        _id: {
                            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
                        },
                        users: { $addToSet: '$userId' },
                    },
                },
                {
                    $project: {
                        date: '$_id.date',
                        count: { $size: '$users' },
                    },
                },
                { $sort: { date: 1 } },
            ]);

            return result;
        } catch (error) {
            logger.error('Error getting daily active users:', error);
            throw error;
        }
    }

    /**
     * Get page views
     */
    async getPageViews(startDate?: Date, endDate?: Date) {
        try {
            const query: any = { eventType: 'pageview' };
            if (startDate || endDate) {
                query.timestamp = {};
                if (startDate) query.timestamp.$gte = startDate;
                if (endDate) query.timestamp.$lte = endDate;
            }

            const result = await AnalyticsEvent.aggregate([
                { $match: query },
                { $group: { _id: '$path', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 20 },
            ]);

            return result;
        } catch (error) {
            logger.error('Error getting page views:', error);
            throw error;
        }
    }

    /**
     * Get browser statistics
     */
    async getBrowserStats(startDate?: Date, endDate?: Date) {
        try {
            const query: any = { browser: { $exists: true } };
            if (startDate || endDate) {
                query.timestamp = {};
                if (startDate) query.timestamp.$gte = startDate;
                if (endDate) query.timestamp.$lte = endDate;
            }

            const result = await AnalyticsEvent.aggregate([
                { $match: query },
                { $group: { _id: '$browser', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]);

            return result;
        } catch (error) {
            logger.error('Error getting browser stats:', error);
            throw error;
        }
    }

    /**
     * Get device statistics
     */
    async getDeviceStats(startDate?: Date, endDate?: Date) {
        try {
            const query: any = { device: { $exists: true } };
            if (startDate || endDate) {
                query.timestamp = {};
                if (startDate) query.timestamp.$gte = startDate;
                if (endDate) query.timestamp.$lte = endDate;
            }

            const result = await AnalyticsEvent.aggregate([
                { $match: query },
                { $group: { _id: '$device', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]);

            return result;
        } catch (error) {
            logger.error('Error getting device stats:', error);
            throw error;
        }
    }

    /**
     * Get geographic statistics
     */
    async getGeographicStats(startDate?: Date, endDate?: Date) {
        try {
            const query: any = { country: { $exists: true } };
            if (startDate || endDate) {
                query.timestamp = {};
                if (startDate) query.timestamp.$gte = startDate;
                if (endDate) query.timestamp.$lte = endDate;
            }

            const result = await AnalyticsEvent.aggregate([
                { $match: query },
                {
                    $group: {
                        _id: { country: '$country', city: '$city' },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { count: -1 } },
                { $limit: 50 },
            ]);

            return result;
        } catch (error) {
            logger.error('Error getting geographic stats:', error);
            throw error;
        }
    }

    /**
     * Get conversion funnel
     */
    async getConversionFunnel(steps: string[], startDate?: Date, endDate?: Date) {
        try {
            const query: any = { eventName: { $in: steps } };
            if (startDate || endDate) {
                query.timestamp = {};
                if (startDate) query.timestamp.$gte = startDate;
                if (endDate) query.timestamp.$lte = endDate;
            }

            const result = await AnalyticsEvent.aggregate([
                { $match: query },
                { $group: { _id: '$eventName', count: { $sum: 1 } } },
            ]);

            // Order results by funnel steps
            const orderedResult = steps.map((step) => {
                const found = result.find((r) => r._id === step);
                return {
                    step,
                    count: found ? found.count : 0,
                };
            });

            return orderedResult;
        } catch (error) {
            logger.error('Error getting conversion funnel:', error);
            throw error;
        }
    }

    /**
     * Get retention rate
     */
    async getRetentionRate(cohortDate: Date, days: number) {
        try {
            const cohortEnd = new Date(cohortDate);
            cohortEnd.setDate(cohortEnd.getDate() + 1);

            // Get users who signed up on cohort date
            const cohortUsers = await AnalyticsEvent.distinct('userId', {
                eventName: 'user_signup',
                timestamp: { $gte: cohortDate, $lt: cohortEnd },
            });

            const retentionData = [];

            for (let day = 0; day < days; day++) {
                const checkDate = new Date(cohortDate);
                checkDate.setDate(checkDate.getDate() + day);
                const nextDate = new Date(checkDate);
                nextDate.setDate(nextDate.getDate() + 1);

                const activeUsers = await AnalyticsEvent.distinct('userId', {
                    userId: { $in: cohortUsers },
                    timestamp: { $gte: checkDate, $lt: nextDate },
                });

                retentionData.push({
                    day,
                    cohortSize: cohortUsers.length,
                    activeUsers: activeUsers.length,
                    retentionRate: (activeUsers.length / cohortUsers.length) * 100,
                });
            }

            return retentionData;
        } catch (error) {
            logger.error('Error getting retention rate:', error);
            throw error;
        }
    }
}
