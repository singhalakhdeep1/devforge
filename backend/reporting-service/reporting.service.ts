import prisma from '../lib/prisma';
import { createCanvas } from 'canvas';
import Chart from 'chart.js/auto';
import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { createWriteStream } from 'fs';

interface ReportConfig {
    type: 'user' | 'task' | 'project' | 'financial' | 'performance';
    format: 'pdf' | 'excel' | 'csv' | 'json';
    dateRange: {
        start: Date;
        end: Date;
    };
    filters?: Record<string, any>;
    groupBy?: string;
    includeCharts?: boolean;
}

class ReportingService {
    async generateReport(config: ReportConfig): Promise<string> {
        const data = await this.fetchReportData(config);

        switch (config.format) {
            case 'pdf':
                return await this.generatePDFReport(data, config);
            case 'excel':
                return await this.generateExcelReport(data, config);
            case 'csv':
                return await this.generateCSVReport(data, config);
            case 'json':
                return JSON.stringify(data, null, 2);
            default:
                throw new Error(`Unsupported format: ${config.format}`);
        }
    }

    private async fetchReportData(config: ReportConfig) {
        switch (config.type) {
            case 'user':
                return await this.fetchUserReport(config);
            case 'task':
                return await this.fetchTaskReport(config);
            case 'project':
                return await this.fetchProjectReport(config);
            case 'financial':
                return await this.fetchFinancialReport(config);
            case 'performance':
                return await this.fetchPerformanceReport(config);
            default:
                throw new Error(`Unsupported report type: ${config.type}`);
        }
    }

    private async fetchUserReport(config: ReportConfig) {
        const { start, end } = config.dateRange;

        const [totalUsers, newUsers, activeUsers, topContributors, userActivity] = await Promise.all([
            // Total users
            prisma.user.count({
                where: {
                    createdAt: { gte: start, lte: end }
                }
            }),

            // New users by day
            prisma.$queryRaw<Array<{ date: Date; count: number }>>`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM "User"
        WHERE created_at BETWEEN ${start} AND ${end}
        GROUP BY DATE(created_at)
        ORDER BY date
      `,

            // Active users
            prisma.user.count({
                where: {
                    lastActiveAt: { gte: start, lte: end }
                }
            }),

            // Top contributors
            prisma.$queryRaw<Array<{
                userId: string;
                name: string;
                taskCount: number;
                commentCount: number;
            }>>`
        SELECT 
          u.id as "userId",
          u.name,
          COUNT(DISTINCT t.id) as "taskCount",
          COUNT(DISTINCT c.id) as "commentCount"
        FROM "User" u
        LEFT JOIN "Task" t ON t.assignee_id = u.id
        LEFT JOIN "Comment" c ON c.user_id = u.id
        WHERE t.created_at BETWEEN ${start} AND ${end}
          OR c.created_at BETWEEN ${start} AND ${end}
        GROUP BY u.id, u.name
        ORDER BY "taskCount" + "commentCount" DESC
        LIMIT 10
      `,

            // User activity by hour
            prisma.$queryRaw<Array<{ hour: number; count: number }>>`
        SELECT 
          EXTRACT(HOUR FROM created_at) as hour,
          COUNT(*) as count
        FROM "AuditLog"
        WHERE timestamp BETWEEN ${start} AND ${end}
        GROUP BY hour
        ORDER BY hour
      `
        ]);

        return {
            summary: {
                totalUsers,
                newUsers: newUsers.length,
                activeUsers,
                activeRate: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(2) : '0'
            },
            newUsersTrend: newUsers,
            topContributors,
            activityByHour: userActivity
        };
    }

    private async fetchTaskReport(config: ReportConfig) {
        const { start, end } = config.dateRange;

        const [taskStats, tasksByStatus, tasksByPriority, taskCompletionTrend, avgCompletionTime] = await Promise.all([
            // Overall stats
            prisma.task.groupBy({
                by: ['status'],
                where: {
                    createdAt: { gte: start, lte: end }
                },
                _count: true
            }),

            // Tasks by status
            prisma.task.groupBy({
                by: ['status'],
                _count: true,
                where: {
                    createdAt: { gte: start, lte: end }
                }
            }),

            // Tasks by priority
            prisma.task.groupBy({
                by: ['priority'],
                _count: true,
                where: {
                    createdAt: { gte: start, lte: end }
                }
            }),

            // Task completion trend
            prisma.$queryRaw<Array<{ date: Date; completed: number }>>`
        SELECT DATE(updated_at) as date, COUNT(*) as completed
        FROM "Task"
        WHERE status = 'DONE'
          AND updated_at BETWEEN ${start} AND ${end}
        GROUP BY DATE(updated_at)
        ORDER BY date
      `,

            // Average completion time
            prisma.$queryRaw<Array<{ avgDays: number }>>`
        SELECT AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 86400) as "avgDays"
        FROM "Task"
        WHERE status = 'DONE'
          AND updated_at BETWEEN ${start} AND ${end}
      `
        ]);

        const totalTasks = taskStats.reduce((sum, s) => sum + s._count, 0);
        const completedTasks = taskStats.find(s => s.status === 'DONE')?._count || 0;

        return {
            summary: {
                total: totalTasks,
                completed: completedTasks,
                completionRate: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(2) : '0',
                avgCompletionDays: avgCompletionTime[0]?.avgDays?.toFixed(1) || '0'
            },
            byStatus: tasksByStatus,
            byPriority: tasksByPriority,
            completionTrend: taskCompletionTrend
        };
    }

    private async fetchProjectReport(config: ReportConfig) {
        const { start, end } = config.dateRange;

        const [totalBoards, activeBoards, sprintStats, velocityTrend, burndownData] = await Promise.all([
            // Total boards
            prisma.board.count({
                where: {
                    createdAt: { gte: start, lte: end }
                }
            }),

            // Active boards
            prisma.board.count({
                where: {
                    updatedAt: { gte: start, lte: end }
                }
            }),

            // Sprint statistics
            prisma.sprint.groupBy({
                by: ['status'],
                _count: true,
                _avg: {
                    velocity: true
                },
                where: {
                    startDate: { gte: start, lte: end }
                }
            }),

            // Velocity trend
            prisma.$queryRaw<Array<{ sprintName: string; velocity: number }>>`
        SELECT name as "sprintName", velocity
        FROM "Sprint"
        WHERE start_date BETWEEN ${start} AND ${end}
          AND status = 'COMPLETED'
        ORDER BY start_date
      `,

            // Burndown data
            prisma.$queryRaw<Array<{ date: Date; remaining: number }>>`
        SELECT 
          DATE(created_at) as date,
          SUM(CASE WHEN status != 'DONE' THEN story_points ELSE 0 END) as remaining
        FROM "Task"
        WHERE created_at BETWEEN ${start} AND ${end}
        GROUP BY DATE(created_at)
        ORDER BY date
      `
        ]);

        return {
            summary: {
                totalBoards,
                activeBoards,
                totalSprints: sprintStats.reduce((sum, s) => sum + s._count, 0),
                avgVelocity: sprintStats.reduce((sum, s) => sum + (s._avg.velocity || 0), 0) / sprintStats.length || 0
            },
            sprintStats,
            velocityTrend,
            burndownData
        };
    }

    private async fetchFinancialReport(config: ReportConfig) {
        const { start, end } = config.dateRange;

        const [paymentStats, revenueByDay, topCustomers, subscriptionStats] = await Promise.all([
            // Payment statistics
            prisma.payment.groupBy({
                by: ['status'],
                _count: true,
                _sum: {
                    amount: true
                },
                where: {
                    createdAt: { gte: start, lte: end }
                }
            }),

            // Revenue by day
            prisma.$queryRaw<Array<{ date: Date; revenue: number }>>`
        SELECT 
          DATE(created_at) as date,
          SUM(amount) as revenue
        FROM "Payment"
        WHERE status = 'SUCCEEDED'
          AND created_at BETWEEN ${start} AND ${end}
        GROUP BY DATE(created_at)
        ORDER BY date
      `,

            // Top customers by revenue
            prisma.$queryRaw<Array<{
                userId: string;
                userName: string;
                totalSpent: number;
                transactionCount: number;
            }>>`
        SELECT 
          u.id as "userId",
          u.name as "userName",
          SUM(p.amount) as "totalSpent",
          COUNT(p.id) as "transactionCount"
        FROM "User" u
        JOIN "Payment" p ON p.user_id = u.id
        WHERE p.status = 'SUCCEEDED'
          AND p.created_at BETWEEN ${start} AND ${end}
        GROUP BY u.id, u.name
        ORDER BY "totalSpent" DESC
        LIMIT 10
      `,

            // Subscription statistics
            prisma.subscription.groupBy({
                by: ['status', 'plan'],
                _count: true,
                where: {
                    createdAt: { gte: start, lte: end }
                }
            })
        ]);

        const totalRevenue = paymentStats
            .filter(s => s.status === 'SUCCEEDED')
            .reduce((sum, s) => sum + (s._sum.amount || 0), 0);

        const totalTransactions = paymentStats.reduce((sum, s) => sum + s._count, 0);

        return {
            summary: {
                totalRevenue,
                totalTransactions,
                avgTransactionValue: totalTransactions > 0 ? totalRevenue / totalTransactions : 0,
                successRate: totalTransactions > 0
                    ? ((paymentStats.find(s => s.status === 'SUCCEEDED')?._count || 0) / totalTransactions * 100).toFixed(2)
                    : '0'
            },
            paymentStats,
            revenueByDay,
            topCustomers,
            subscriptionStats
        };
    }

    private async fetchPerformanceReport(config: ReportConfig) {
        const { start, end } = config.dateRange;

        // Fetch from audit logs and metrics
        const [apiResponseTimes, errorRates, topEndpoints, slowQueries] = await Promise.all([
            // API response times
            prisma.$queryRaw<Array<{ endpoint: string; avgTime: number; count: number }>>`
        SELECT 
          resource as endpoint,
          AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) * 1000) as "avgTime",
          COUNT(*) as count
        FROM "AuditLog"
        WHERE action LIKE 'GET_%'
          AND timestamp BETWEEN ${start} AND ${end}
        GROUP BY resource
        ORDER BY "avgTime" DESC
        LIMIT 20
      `,

            // Error rates
            prisma.$queryRaw<Array<{ date: Date; errors: number; total: number }>>`
        SELECT 
          DATE(timestamp) as date,
          COUNT(*) FILTER (WHERE status = 'FAILURE') as errors,
          COUNT(*) as total
        FROM "AuditLog"
        WHERE timestamp BETWEEN ${start} AND ${end}
        GROUP BY DATE(timestamp)
        ORDER BY date
      `,

            // Top endpoints by traffic
            prisma.$queryRaw<Array<{ endpoint: string; count: number }>>`
        SELECT 
          resource as endpoint,
          COUNT(*) as count
        FROM "AuditLog"
        WHERE timestamp BETWEEN ${start} AND ${end}
        GROUP BY resource
        ORDER BY count DESC
        LIMIT 10
      `,

            // Slow queries (mock data - would come from database monitoring)
            Promise.resolve([
                { query: 'SELECT * FROM Task WHERE...', avgTime: 1250, count: 450 },
                { query: 'SELECT * FROM User JOIN...', avgTime: 980, count: 320 }
            ])
        ]);

        return {
            summary: {
                avgResponseTime: apiResponseTimes.reduce((sum, e) => sum + e.avgTime, 0) / apiResponseTimes.length || 0,
                totalRequests: apiResponseTimes.reduce((sum, e) => sum + e.count, 0),
                avgErrorRate: errorRates.reduce((sum, e) => sum + (e.errors / e.total * 100), 0) / errorRates.length || 0
            },
            apiResponseTimes,
            errorRates,
            topEndpoints,
            slowQueries
        };
    }

    private async generatePDFReport(data: any, config: ReportConfig): Promise<string> {
        const filename = `report-${config.type}-${Date.now()}.pdf`;
        const filepath = `./reports/${filename}`;

        const doc = new PDFDocument();
        doc.pipe(createWriteStream(filepath));

        // Title
        doc.fontSize(24).text(`${config.type.toUpperCase()} Report`, { align: 'center' });
        doc.moveDown();

        // Date range
        doc.fontSize(12).text(`Period: ${config.dateRange.start.toDateString()} - ${config.dateRange.end.toDateString()}`);
        doc.moveDown();

        // Summary
        doc.fontSize(18).text('Summary');
        doc.fontSize(12);
        Object.entries(data.summary || {}).forEach(([key, value]) => {
            doc.text(`${key}: ${value}`);
        });
        doc.moveDown();

        // Data tables
        if (data.byStatus) {
            doc.fontSize(18).text('By Status');
            doc.fontSize(12);
            data.byStatus.forEach((item: any) => {
                doc.text(`${item.status}: ${item._count}`);
            });
            doc.moveDown();
        }

        if (data.byPriority) {
            doc.fontSize(18).text('By Priority');
            doc.fontSize(12);
            data.byPriority.forEach((item: any) => {
                doc.text(`${item.priority}: ${item._count}`);
            });
            doc.moveDown();
        }

        doc.end();

        return filepath;
    }

    private async generateExcelReport(data: any, config: ReportConfig): Promise<string> {
        const filename = `report-${config.type}-${Date.now()}.xlsx`;
        const filepath = `./reports/${filename}`;

        const workbook = new ExcelJS.Workbook();

        // Summary sheet
        const summarySheet = workbook.addWorksheet('Summary');
        summarySheet.columns = [
            { header: 'Metric', key: 'metric', width: 30 },
            { header: 'Value', key: 'value', width: 20 }
        ];

        Object.entries(data.summary || {}).forEach(([key, value]) => {
            summarySheet.addRow({ metric: key, value });
        });

        // Data sheets
        if (data.byStatus) {
            const statusSheet = workbook.addWorksheet('By Status');
            statusSheet.columns = [
                { header: 'Status', key: 'status', width: 20 },
                { header: 'Count', key: 'count', width: 15 }
            ];
            data.byStatus.forEach((item: any) => {
                statusSheet.addRow({ status: item.status, count: item._count });
            });
        }

        if (data.topContributors) {
            const contributorsSheet = workbook.addWorksheet('Top Contributors');
            contributorsSheet.columns = [
                { header: 'Name', key: 'name', width: 25 },
                { header: 'Tasks', key: 'tasks', width: 15 },
                { header: 'Comments', key: 'comments', width: 15 }
            ];
            data.topContributors.forEach((item: any) => {
                contributorsSheet.addRow({
                    name: item.name,
                    tasks: item.taskCount,
                    comments: item.commentCount
                });
            });
        }

        await workbook.xlsx.writeFile(filepath);
        return filepath;
    }

    private async generateCSVReport(data: any, config: ReportConfig): Promise<string> {
        const rows: string[] = [];

        // Add summary
        rows.push('Summary');
        rows.push('Metric,Value');
        Object.entries(data.summary || {}).forEach(([key, value]) => {
            rows.push(`${key},${value}`);
        });
        rows.push('');

        // Add data sections
        if (data.byStatus) {
            rows.push('By Status');
            rows.push('Status,Count');
            data.byStatus.forEach((item: any) => {
                rows.push(`${item.status},${item._count}`);
            });
            rows.push('');
        }

        return rows.join('\n');
    }

    async scheduleReport(config: ReportConfig, schedule: string, recipients: string[]) {
        // Schedule recurring reports using cron
        // Implementation would use node-cron
        console.log(`Scheduled report: ${config.type}, ${schedule}, recipients: ${recipients.join(', ')}`);
    }
}

export const reportingService = new ReportingService();
