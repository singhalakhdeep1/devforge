import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

interface AuditLog {
    userId: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
    status: 'SUCCESS' | 'FAILURE';
    error?: string;
}

class AuditService {
    async log(auditLog: AuditLog): Promise<void> {
        try {
            await prisma.auditLog.create({
                data: {
                    userId: auditLog.userId,
                    action: auditLog.action,
                    resource: auditLog.resource,
                    resourceId: auditLog.resourceId,
                    details: auditLog.details,
                    ipAddress: auditLog.ipAddress,
                    userAgent: auditLog.userAgent,
                    status: auditLog.status,
                    error: auditLog.error,
                    timestamp: new Date()
                }
            });
        } catch (error) {
            console.error('Failed to create audit log:', error);
        }
    }

    async getLogs(filters: {
        userId?: string;
        action?: string;
        resource?: string;
        status?: 'SUCCESS' | 'FAILURE';
        startDate?: Date;
        endDate?: Date;
        page?: number;
        pageSize?: number;
    }) {
        const { page = 1, pageSize = 50, ...where } = filters;

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where: {
                    userId: where.userId,
                    action: where.action,
                    resource: where.resource,
                    status: where.status,
                    timestamp: {
                        gte: where.startDate,
                        lte: where.endDate
                    }
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                },
                orderBy: { timestamp: 'desc' },
                skip: (page - 1) * pageSize,
                take: pageSize
            }),
            prisma.auditLog.count({
                where: {
                    userId: where.userId,
                    action: where.action,
                    resource: where.resource,
                    status: where.status,
                    timestamp: {
                        gte: where.startDate,
                        lte: where.endDate
                    }
                }
            })
        ]);

        return {
            logs,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize)
        };
    }

    async getActivitySummary(userId: string, days: number = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const logs = await prisma.auditLog.findMany({
            where: {
                userId,
                timestamp: { gte: startDate }
            },
            orderBy: { timestamp: 'desc' }
        });

        // Group by action
        const actionSummary = logs.reduce((acc, log) => {
            acc[log.action] = (acc[log.action] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Group by resource
        const resourceSummary = logs.reduce((acc, log) => {
            acc[log.resource] = (acc[log.resource] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Group by date
        const dailyActivity = logs.reduce((acc, log) => {
            const date = log.timestamp.toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Success/failure ratio
        const successCount = logs.filter(l => l.status === 'SUCCESS').length;
        const failureCount = logs.filter(l => l.status === 'FAILURE').length;

        return {
            totalActions: logs.length,
            actionSummary,
            resourceSummary,
            dailyActivity,
            successRate: logs.length > 0 ? (successCount / logs.length) * 100 : 0,
            successCount,
            failureCount
        };
    }

    async getSecurityEvents(filters: {
        severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
        startDate?: Date;
        endDate?: Date;
    }) {
        // Security-sensitive actions
        const securityActions = [
            'LOGIN_FAILED',
            'PERMISSION_DENIED',
            'UNAUTHORIZED_ACCESS',
            'PASSWORD_RESET',
            'ROLE_CHANGED',
            'API_KEY_CREATED',
            'API_KEY_REVOKED'
        ];

        const logs = await prisma.auditLog.findMany({
            where: {
                action: { in: securityActions },
                timestamp: {
                    gte: filters.startDate,
                    lte: filters.endDate
                }
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { timestamp: 'desc' }
        });

        // Detect suspicious patterns
        const suspiciousPatterns = this.detectSuspiciousPatterns(logs);

        return {
            events: logs,
            suspiciousPatterns
        };
    }

    private detectSuspiciousPatterns(logs: any[]) {
        const patterns = [];

        // Multiple failed login attempts
        const failedLogins = logs.filter(l => l.action === 'LOGIN_FAILED');
        const failedLoginsByUser = failedLogins.reduce((acc, log) => {
            acc[log.userId] = (acc[log.userId] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        Object.entries(failedLoginsByUser).forEach(([userId, count]) => {
            if (count >= 5) {
                patterns.push({
                    type: 'MULTIPLE_FAILED_LOGINS',
                    severity: 'HIGH',
                    userId,
                    count,
                    message: `User ${userId} has ${count} failed login attempts`
                });
            }
        });

        // Unusual access patterns (access from multiple IPs in short time)
        const accessByUser = logs.reduce((acc, log) => {
            if (!acc[log.userId]) acc[log.userId] = [];
            acc[log.userId].push({ ip: log.ipAddress, timestamp: log.timestamp });
            return acc;
        }, {} as Record<string, Array<{ ip: string; timestamp: Date }>>);

        Object.entries(accessByUser).forEach(([userId, accesses]) => {
            const uniqueIPs = new Set(accesses.map(a => a.ip));
            if (uniqueIPs.size >= 3) {
                const timeSpan = new Date(Math.max(...accesses.map(a => a.timestamp.getTime()))).getTime() -
                    new Date(Math.min(...accesses.map(a => a.timestamp.getTime()))).getTime();

                if (timeSpan < 3600000) { // Within 1 hour
                    patterns.push({
                        type: 'MULTIPLE_IP_ACCESS',
                        severity: 'MEDIUM',
                        userId,
                        ipCount: uniqueIPs.size,
                        message: `User ${userId} accessed from ${uniqueIPs.size} different IPs within 1 hour`
                    });
                }
            }
        });

        return patterns;
    }

    async exportLogs(filters: any, format: 'csv' | 'json' = 'csv') {
        const { logs } = await this.getLogs({ ...filters, page: 1, pageSize: 10000 });

        if (format === 'json') {
            return JSON.stringify(logs, null, 2);
        }

        // CSV format
        const headers = ['Timestamp', 'User', 'Action', 'Resource', 'Status', 'IP Address'];
        const rows = logs.map(log => [
            log.timestamp.toISOString(),
            log.user.email,
            log.action,
            log.resource,
            log.status,
            log.ipAddress || ''
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
}

export const auditService = new AuditService();

// Middleware to automatically log requests
export function auditMiddleware(req: Request, res: Response, next: NextFunction) {
    const originalSend = res.send;

    res.send = function (data: any) {
        const userId = (req as any).user?.id;
        if (userId) {
            const action = `${req.method}_${req.path.split('/')[2]?.toUpperCase() || 'UNKNOWN'}`;
            const resource = req.path.split('/')[3] || 'UNKNOWN';

            auditService.log({
                userId,
                action,
                resource,
                resourceId: req.params.id,
                details: {
                    method: req.method,
                    path: req.path,
                    query: req.query,
                    body: req.body
                },
                ipAddress: req.ip,
                userAgent: req.get('user-agent'),
                status: res.statusCode < 400 ? 'SUCCESS' : 'FAILURE'
            });
        }

        return originalSend.call(this, data);
    };

    next();
}
