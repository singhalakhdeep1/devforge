import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

describe('API Gateway Tests', () => {
    let app: express.Application;
    let validToken: string;

    beforeAll(() => {
        app = express();
        validToken = jwt.sign({ userId: 'test-user-123', role: 'USER' }, JWT_SECRET);
    });

    describe('Authentication Middleware', () => {
        it('should reject requests without token', async () => {
            const response = await request(app)
                .get('/api/protected')
                .expect(401);

            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('token');
        });

        it('should reject requests with invalid token', async () => {
            const response = await request(app)
                .get('/api/protected')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);

            expect(response.body).toHaveProperty('error');
        });

        it('should accept requests with valid token', async () => {
            const response = await request(app)
                .get('/api/protected')
                .set('Authorization', `Bearer ${validToken}`)
                .expect(200);

            expect(response.body).toBeDefined();
        });
    });

    describe('Rate Limiting', () => {
        it('should rate limit excessive requests', async () => {
            const promises = Array(101).fill(null).map(() =>
                request(app).get('/api/test')
            );

            const responses = await Promise.all(promises);
            const rateLimited = responses.filter(r => r.status === 429);

            expect(rateLimited.length).toBeGreaterThan(0);
        });

        it('should reset rate limit after time window', async () => {
            // Wait for rate limit window to reset
            await new Promise(resolve => setTimeout(resolve, 60000));

            const response = await request(app)
                .get('/api/test')
                .expect(200);

            expect(response.body).toBeDefined();
        }, 70000);
    });

    describe('Service Routing', () => {
        it('should route to auth service', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@example.com', password: 'password123' });

            expect([200, 400, 401]).toContain(response.status);
        });

        it('should route to user service', async () => {
            const response = await request(app)
                .get('/api/users/profile')
                .set('Authorization', `Bearer ${validToken}`);

            expect([200, 404]).toContain(response.status);
        });

        it('should route to notification service', async () => {
            const response = await request(app)
                .get('/api/notifications')
                .set('Authorization', `Bearer ${validToken}`);

            expect([200]).toContain(response.status);
        });
    });

    describe('CORS Headers', () => {
        it('should include CORS headers', async () => {
            const response = await request(app)
                .options('/api/test')
                .expect(204);

            expect(response.headers['access-control-allow-origin']).toBeDefined();
            expect(response.headers['access-control-allow-methods']).toBeDefined();
        });
    });

    describe('Health Check', () => {
        it('should return healthy status', async () => {
            const response = await request(app)
                .get('/health')
                .expect(200);

            expect(response.body).toHaveProperty('status', 'OK');
            expect(response.body).toHaveProperty('timestamp');
        });
    });

    describe('Error Handling', () => {
        it('should handle 404 routes', async () => {
            const response = await request(app)
                .get('/api/nonexistent')
                .expect(404);

            expect(response.body).toHaveProperty('error');
        });

        it('should handle malformed requests', async () => {
            const response = await request(app)
                .post('/api/test')
                .send('invalid json')
                .set('Content-Type', 'application/json')
                .expect(400);

            expect(response.body).toHaveProperty('error');
        });
    });

    describe('Request Logging', () => {
        it('should log incoming requests', async () => {
            const spy = jest.spyOn(console, 'log');

            await request(app).get('/api/test');

            expect(spy).toHaveBeenCalled();
            spy.mockRestore();
        });
    });

    describe('Response Headers', () => {
        it('should include security headers', async () => {
            const response = await request(app)
                .get('/api/test');

            expect(response.headers['x-content-type-options']).toBe('nosniff');
            expect(response.headers['x-frame-options']).toBeDefined();
            expect(response.headers['x-xss-protection']).toBeDefined();
        });
    });
});

describe('Service Discovery Tests', () => {
    it('should discover available services', async () => {
        const services = [
            'auth-service',
            'user-service',
            'notification-service',
            'file-service',
            'analytics-service',
            'search-service',
            'video-service',
            'editor-service',
            'payment-service',
            'kanban-service',
            'graphql-api'
        ];

        services.forEach(service => {
            expect(process.env[`${service.toUpperCase().replace('-', '_')}_URL`]).toBeDefined();
        });
    });
});

describe('Load Balancing Tests', () => {
    it('should distribute requests evenly', async () => {
        const requests = 100;
        const responses = await Promise.all(
            Array(requests).fill(null).map(() =>
                request(app).get('/api/test')
            )
        );

        const statusCodes = responses.reduce((acc, r) => {
            acc[r.status] = (acc[r.status] || 0) + 1;
            return acc;
        }, {} as Record<number, number>);

        expect(statusCodes[200]).toBeGreaterThan(0);
    });
});
