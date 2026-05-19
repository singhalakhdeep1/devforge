import axios from 'axios';
import { createClient } from 'redis';
import prisma from '../lib/prisma';

interface ServiceHealth {
    name: string;
    healthy: boolean;
    responseTime: number;
    lastCheck: Date;
    error?: string;
}

class HealthCheck {
    private services = [
        { name: 'API Gateway', url: 'http://localhost:3000/health' },
        { name: 'Auth Service', url: 'http://localhost:3001/health' },
        { name: 'Email Service', url: 'http://localhost:3002/health' },
        { name: 'WebSocket', url: 'http://localhost:3003/health' },
        { name: 'Notification Service', url: 'http://localhost:3004/health' },
        { name: 'File Service', url: 'http://localhost:3005/health' },
        { name: 'Analytics Service', url: 'http://localhost:3006/health' },
        { name: 'Search Service', url: 'http://localhost:3007/health' },
        { name: 'Video Service', url: 'http://localhost:3008/health' },
        { name: 'Editor Service', url: 'http://localhost:3009/health' },
        { name: 'Payment Service', url: 'http://localhost:3010/health' },
        { name: 'Kanban Service', url: 'http://localhost:3011/health' },
        { name: 'GraphQL API', url: 'http://localhost:3012/health' }
    ];

    async checkAll(): Promise<{ status: string; services: ServiceHealth[] }> {
        const results = await Promise.all(
            this.services.map(service => this.checkService(service.name))
        );

        const allHealthy = results.every(r => r.healthy);
        const status = allHealthy ? 'healthy' : 'unhealthy';

        return { status, services: results };
    }

    async checkService(serviceName: string): Promise<ServiceHealth> {
        const service = this.services.find(s => s.name === serviceName);
        if (!service) {
            return {
                name: serviceName,
                healthy: false,
                responseTime: 0,
                lastCheck: new Date(),
                error: 'Service not found'
            };
        }

        const start = Date.now();
        try {
            await axios.get(service.url, { timeout: 5000 });
            const responseTime = Date.now() - start;

            return {
                name: serviceName,
                healthy: true,
                responseTime,
                lastCheck: new Date()
            };
        } catch (error: any) {
            return {
                name: serviceName,
                healthy: false,
                responseTime: Date.now() - start,
                lastCheck: new Date(),
                error: error.message
            };
        }
    }

    async checkDatabase(): Promise<{ healthy: boolean; latency: number; error?: string }> {
        const start = Date.now();
        try {
            await prisma.$queryRaw`SELECT 1`;
            return {
                healthy: true,
                latency: Date.now() - start
            };
        } catch (error: any) {
            return {
                healthy: false,
                latency: Date.now() - start,
                error: error.message
            };
        }
    }

    async checkRedis(): Promise<{ healthy: boolean; latency: number; error?: string }> {
        const client = createClient({ url: process.env.REDIS_URL });
        const start = Date.now();

        try {
            await client.connect();
            await client.ping();
            await client.disconnect();

            return {
                healthy: true,
                latency: Date.now() - start
            };
        } catch (error: any) {
            return {
                healthy: false,
                latency: Date.now() - start,
                error: error.message
            };
        }
    }

    async checkElasticsearch(): Promise<{ healthy: boolean; latency: number; error?: string }> {
        const start = Date.now();
        try {
            const response = await axios.get(`${process.env.ELASTICSEARCH_URL}/_cluster/health`, {
                timeout: 5000
            });

            return {
                healthy: response.data.status !== 'red',
                latency: Date.now() - start
            };
        } catch (error: any) {
            return {
                healthy: false,
                latency: Date.now() - start,
                error: error.message
            };
        }
    }
}

export const healthCheck = new HealthCheck();
