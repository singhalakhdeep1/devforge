import os from 'os';
import prisma from '../lib/prisma';
import { createClient } from 'redis';
import {
    activeConnections,
    databaseConnectionPool,
    cacheHitRate,
    queueSize,
    userSessionsActive
} from './prometheus';

class MetricsCollector {
    private collectionInterval: NodeJS.Timeout | null = null;
    private cacheStats = { hits: 0, misses: 0 };

    startCollection(intervalMs: number = 15000) {
        this.collectionInterval = setInterval(() => {
            this.collectMetrics();
        }, intervalMs);

        console.log(`Metrics collection started (interval: ${intervalMs}ms)`);
    }

    stopCollection() {
        if (this.collectionInterval) {
            clearInterval(this.collectionInterval);
            this.collectionInterval = null;
        }
    }

    private async collectMetrics() {
        try {
            await Promise.all([
                this.collectSystemMetrics(),
                this.collectDatabaseMetrics(),
                this.collectCacheMetrics(),
                this.collectApplicationMetrics()
            ]);
        } catch (error) {
            console.error('Failed to collect metrics:', error);
        }
    }

    async getSystemMetrics() {
        const cpus = os.cpus();
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;

        // Calculate CPU usage
        let totalIdle = 0;
        let totalTick = 0;
        cpus.forEach(cpu => {
            for (const type in cpu.times) {
                totalTick += cpu.times[type as keyof typeof cpu.times];
            }
            totalIdle += cpu.times.idle;
        });

        const cpuUsage = 100 - (100 * totalIdle / totalTick);

        return {
            cpu: {
                usage: cpuUsage.toFixed(2),
                cores: cpus.length,
                model: cpus[0].model
            },
            memory: {
                total: totalMem,
                used: usedMem,
                free: freeMem,
                usagePercent: ((usedMem / totalMem) * 100).toFixed(2)
            },
            uptime: os.uptime(),
            platform: os.platform(),
            hostname: os.hostname(),
            loadAverage: os.loadavg()
        };
    }

    async collectSystemMetrics() {
        const metrics = await this.getSystemMetrics();

        // Update Prometheus metrics
        activeConnections.set({ type: 'http' }, 0); // Will be updated by actual connections

        return metrics;
    }

    async getDatabaseMetrics() {
        try {
            // Get database size
            const dbSizeResult = await prisma.$queryRaw<Array<{ size: bigint }>>`
        SELECT pg_database_size(current_database()) as size
      `;
            const dbSize = Number(dbSizeResult[0].size);

            // Get connection stats
            const connectionStats = await prisma.$queryRaw<Array<{
                total: number;
                active: number;
                idle: number;
            }>>`
        SELECT 
          count(*) as total,
          count(*) FILTER (WHERE state = 'active') as active,
          count(*) FILTER (WHERE state = 'idle') as idle
        FROM pg_stat_activity
        WHERE datname = current_database()
      `;

            // Get table sizes
            const tableSizes = await prisma.$queryRaw<Array<{
                tablename: string;
                size: bigint;
            }>>`
        SELECT 
          tablename,
          pg_total_relation_size(schemaname||'.'||tablename) as size
        FROM pg_tables
        WHERE schemaname = 'public'
        ORDER BY size DESC
        LIMIT 10
      `;

            // Get query stats
            const queryStats = await prisma.$queryRaw<Array<{
                calls: bigint;
                total_time: number;
                mean_time: number;
            }>>`
        SELECT 
          sum(calls) as calls,
          sum(total_exec_time) as total_time,
          avg(mean_exec_time) as mean_time
        FROM pg_stat_statements
      `;

            return {
                size: dbSize,
                connections: connectionStats[0],
                tables: tableSizes.map(t => ({
                    name: t.tablename,
                    size: Number(t.size)
                })),
                queries: {
                    total: Number(queryStats[0]?.calls || 0),
                    totalTime: queryStats[0]?.total_time || 0,
                    avgTime: queryStats[0]?.mean_time || 0
                }
            };
        } catch (error) {
            console.error('Failed to get database metrics:', error);
            return null;
        }
    }

    async collectDatabaseMetrics() {
        const metrics = await this.getDatabaseMetrics();

        if (metrics) {
            databaseConnectionPool.set(
                { status: 'active' },
                metrics.connections.active
            );
            databaseConnectionPool.set(
                { status: 'idle' },
                metrics.connections.idle
            );
        }

        return metrics;
    }

    async getCacheMetrics() {
        const client = createClient({ url: process.env.REDIS_URL });

        try {
            await client.connect();

            const info = await client.info('stats');
            const lines = info.split('\r\n');
            const stats: Record<string, string> = {};

            lines.forEach(line => {
                const [key, value] = line.split(':');
                if (key && value) {
                    stats[key] = value;
                }
            });

            await client.disconnect();

            const hits = parseInt(stats.keyspace_hits || '0');
            const misses = parseInt(stats.keyspace_misses || '0');
            const hitRate = hits + misses > 0 ? (hits / (hits + misses)) * 100 : 0;

            return {
                hits,
                misses,
                hitRate: hitRate.toFixed(2),
                evictedKeys: parseInt(stats.evicted_keys || '0'),
                usedMemory: stats.used_memory,
                connectedClients: parseInt(stats.connected_clients || '0'),
                blockedClients: parseInt(stats.blocked_clients || '0')
            };
        } catch (error) {
            console.error('Failed to get cache metrics:', error);
            return null;
        }
    }

    async collectCacheMetrics() {
        const metrics = await this.getCacheMetrics();

        if (metrics) {
            cacheHitRate.set({ cache_name: 'redis' }, parseFloat(metrics.hitRate));
        }

        return metrics;
    }

    async getApplicationMetrics() {
        try {
            // Get user stats
            const [totalUsers, activeUsers, onlineUsers] = await Promise.all([
                prisma.user.count(),
                prisma.user.count({
                    where: {
                        lastActiveAt: {
                            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                        }
                    }
                }),
                prisma.session.count({
                    where: {
                        expiresAt: { gt: new Date() }
                    }
                })
            ]);

            // Get task stats
            const [totalTasks, completedTasks, inProgressTasks, overdueTasks] = await Promise.all([
                prisma.task.count(),
                prisma.task.count({ where: { status: 'DONE' } }),
                prisma.task.count({ where: { status: 'IN_PROGRESS' } }),
                prisma.task.count({
                    where: {
                        dueDate: { lt: new Date() },
                        status: { not: 'DONE' }
                    }
                })
            ]);

            // Get board stats
            const totalBoards = await prisma.board.count();

            // Get notification stats
            const [totalNotifications, unreadNotifications] = await Promise.all([
                prisma.notification.count(),
                prisma.notification.count({ where: { read: false } })
            ]);

            // Get file stats
            const fileStats = await prisma.file.aggregate({
                _sum: { size: true },
                _count: true
            });

            // Get payment stats (last 30 days)
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            const [recentPayments, revenue] = await Promise.all([
                prisma.payment.count({
                    where: { createdAt: { gte: thirtyDaysAgo } }
                }),
                prisma.payment.aggregate({
                    where: {
                        createdAt: { gte: thirtyDaysAgo },
                        status: 'SUCCEEDED'
                    },
                    _sum: { amount: true }
                })
            ]);

            return {
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    online: onlineUsers
                },
                tasks: {
                    total: totalTasks,
                    completed: completedTasks,
                    inProgress: inProgressTasks,
                    overdue: overdueTasks,
                    completionRate: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(2) : '0'
                },
                boards: {
                    total: totalBoards
                },
                notifications: {
                    total: totalNotifications,
                    unread: unreadNotifications
                },
                files: {
                    total: fileStats._count,
                    totalSize: fileStats._sum.size || 0,
                    averageSize: fileStats._count > 0 ? (fileStats._sum.size || 0) / fileStats._count : 0
                },
                payments: {
                    last30Days: recentPayments,
                    revenue: revenue._sum.amount || 0
                }
            };
        } catch (error) {
            console.error('Failed to get application metrics:', error);
            return null;
        }
    }

    async collectApplicationMetrics() {
        const metrics = await this.getApplicationMetrics();

        if (metrics) {
            userSessionsActive.set(metrics.users.online);
        }

        return metrics;
    }

    recordCustomMetric(name: string, value: number, labels: Record<string, string> = {}) {
        // Record custom metric
        console.log(`Custom metric recorded: ${name} = ${value}`, labels);
    }

    trackCacheHit() {
        this.cacheStats.hits++;
    }

    trackCacheMiss() {
        this.cacheStats.misses++;
    }
}

export const metricsCollector = new MetricsCollector();
