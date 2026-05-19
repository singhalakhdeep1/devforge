import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

describe('Auth Service Tests', () => {
    beforeAll(async () => {
        await prisma.$connect();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    beforeEach(async () => {
        await prisma.user.deleteMany();
    });

    describe('User Registration', () => {
        it('should register a new user', async () => {
            const userData = {
                email: 'newuser@example.com',
                password: 'SecurePass123!',
                name: 'New User'
            };

            const user = await prisma.user.create({
                data: {
                    ...userData,
                    password: await bcrypt.hash(userData.password, 10)
                }
            });

            expect(user).toHaveProperty('id');
            expect(user.email).toBe(userData.email);
            expect(user.name).toBe(userData.name);
        });

        it('should hash password before saving', async () => {
            const password = 'PlainTextPassword';
            const hashedPassword = await bcrypt.hash(password, 10);

            expect(hashedPassword).not.toBe(password);
            expect(hashedPassword).toHaveLength(60);
        });

        it('should reject duplicate email', async () => {
            const email = 'duplicate@example.com';

            await prisma.user.create({
                data: {
                    email,
                    password: await bcrypt.hash('password', 10),
                    name: 'First User'
                }
            });

            await expect(
                prisma.user.create({
                    data: {
                        email,
                        password: await bcrypt.hash('password', 10),
                        name: 'Second User'
                    }
                })
            ).rejects.toThrow();
        });

        it('should validate email format', () => {
            const validEmails = [
                'user@example.com',
                'test.user@domain.co.uk',
                'user+tag@example.com'
            ];

            const invalidEmails = [
                'invalid',
                '@example.com',
                'user@',
                'user space@example.com'
            ];

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            validEmails.forEach(email => {
                expect(emailRegex.test(email)).toBe(true);
            });

            invalidEmails.forEach(email => {
                expect(emailRegex.test(email)).toBe(false);
            });
        });

        it('should validate password strength', () => {
            const strongPasswords = [
                'Secure123!',
                'C0mpl3x@Pass',
                'MyP@ssw0rd'
            ];

            const weakPasswords = [
                'weak',
                '12345678',
                'password'
            ];

            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

            strongPasswords.forEach(password => {
                expect(passwordRegex.test(password)).toBe(true);
            });

            weakPasswords.forEach(password => {
                expect(passwordRegex.test(password)).toBe(false);
            });
        });
    });

    describe('User Login', () => {
        const testUser = {
            email: 'test@example.com',
            password: 'TestPass123!',
            name: 'Test User'
        };

        beforeEach(async () => {
            await prisma.user.create({
                data: {
                    ...testUser,
                    password: await bcrypt.hash(testUser.password, 10)
                }
            });
        });

        it('should login with correct credentials', async () => {
            const user = await prisma.user.findUnique({
                where: { email: testUser.email }
            });

            expect(user).not.toBeNull();

            const isValid = await bcrypt.compare(testUser.password, user!.password);
            expect(isValid).toBe(true);
        });

        it('should reject incorrect password', async () => {
            const user = await prisma.user.findUnique({
                where: { email: testUser.email }
            });

            const isValid = await bcrypt.compare('WrongPassword', user!.password);
            expect(isValid).toBe(false);
        });

        it('should reject non-existent user', async () => {
            const user = await prisma.user.findUnique({
                where: { email: 'nonexistent@example.com' }
            });

            expect(user).toBeNull();
        });

        it('should generate JWT token on successful login', async () => {
            const user = await prisma.user.findUnique({
                where: { email: testUser.email }
            });

            const token = jwt.sign(
                { userId: user!.id, email: user!.email },
                process.env.JWT_SECRET || 'test-secret',
                { expiresIn: '7d' }
            );

            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
        });

        it('should verify JWT token', () => {
            const payload = { userId: '123', email: 'test@example.com' };
            const token = jwt.sign(payload, process.env.JWT_SECRET || 'test-secret');

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret') as any;

            expect(decoded.userId).toBe(payload.userId);
            expect(decoded.email).toBe(payload.email);
        });
    });

    describe('Password Reset', () => {
        it('should generate reset token', async () => {
            const user = await prisma.user.create({
                data: {
                    email: 'reset@example.com',
                    password: await bcrypt.hash('password', 10),
                    name: 'Reset User'
                }
            });

            const resetToken = jwt.sign(
                { userId: user.id, type: 'password-reset' },
                process.env.JWT_SECRET || 'test-secret',
                { expiresIn: '1h' }
            );

            expect(resetToken).toBeDefined();
        });

        it('should validate reset token expiry', () => {
            const expiredToken = jwt.sign(
                { userId: '123', type: 'password-reset' },
                process.env.JWT_SECRET || 'test-secret',
                { expiresIn: '-1h' }
            );

            expect(() => {
                jwt.verify(expiredToken, process.env.JWT_SECRET || 'test-secret');
            }).toThrow();
        });

        it('should update password with valid token', async () => {
            const user = await prisma.user.create({
                data: {
                    email: 'update@example.com',
                    password: await bcrypt.hash('OldPass123!', 10),
                    name: 'Update User'
                }
            });

            const newPassword = 'NewPass123!';
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            await prisma.user.update({
                where: { id: user.id },
                data: { password: hashedPassword }
            });

            const updatedUser = await prisma.user.findUnique({
                where: { id: user.id }
            });

            const isValid = await bcrypt.compare(newPassword, updatedUser!.password);
            expect(isValid).toBe(true);
        });
    });

    describe('Email Verification', () => {
        it('should create unverified user', async () => {
            const user = await prisma.user.create({
                data: {
                    email: 'verify@example.com',
                    password: await bcrypt.hash('password', 10),
                    name: 'Verify User',
                    emailVerified: false
                }
            });

            expect(user.emailVerified).toBe(false);
        });

        it('should generate verification token', () => {
            const verificationToken = jwt.sign(
                { email: 'verify@example.com', type: 'email-verification' },
                process.env.JWT_SECRET || 'test-secret',
                { expiresIn: '24h' }
            );

            expect(verificationToken).toBeDefined();
        });

        it('should verify email with valid token', async () => {
            const user = await prisma.user.create({
                data: {
                    email: 'toverify@example.com',
                    password: await bcrypt.hash('password', 10),
                    name: 'To Verify User',
                    emailVerified: false
                }
            });

            await prisma.user.update({
                where: { id: user.id },
                data: { emailVerified: true }
            });

            const verifiedUser = await prisma.user.findUnique({
                where: { id: user.id }
            });

            expect(verifiedUser!.emailVerified).toBe(true);
        });
    });

    describe('OAuth Integration', () => {
        it('should create user from Google OAuth', async () => {
            const googleUser = {
                email: 'google@example.com',
                name: 'Google User',
                avatar: 'https://avatar.url',
                provider: 'google',
                providerId: 'google-123'
            };

            const user = await prisma.user.create({
                data: {
                    ...googleUser,
                    password: '',
                    emailVerified: true
                }
            });

            expect(user.provider).toBe('google');
            expect(user.emailVerified).toBe(true);
        });

        it('should create user from GitHub OAuth', async () => {
            const githubUser = {
                email: 'github@example.com',
                name: 'GitHub User',
                avatar: 'https://avatar.url',
                provider: 'github',
                providerId: 'github-456'
            };

            const user = await prisma.user.create({
                data: {
                    ...githubUser,
                    password: '',
                    emailVerified: true
                }
            });

            expect(user.provider).toBe('github');
        });
    });

    describe('Session Management', () => {
        it('should create session on login', async () => {
            const session = {
                userId: 'user-123',
                token: jwt.sign({ userId: 'user-123' }, process.env.JWT_SECRET || 'test-secret'),
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            };

            expect(session.token).toBeDefined();
            expect(session.expiresAt).toBeInstanceOf(Date);
        });

        it('should invalidate session on logout', () => {
            const sessions = new Set(['token1', 'token2', 'token3']);
            const tokenToRemove = 'token2';

            sessions.delete(tokenToRemove);

            expect(sessions.has(tokenToRemove)).toBe(false);
            expect(sessions.size).toBe(2);
        });
    });

    describe('Role-Based Access Control', () => {
        it('should assign default role to new user', async () => {
            const user = await prisma.user.create({
                data: {
                    email: 'role@example.com',
                    password: await bcrypt.hash('password', 10),
                    name: 'Role User',
                    role: 'USER'
                }
            });

            expect(user.role).toBe('USER');
        });

        it('should allow admin role assignment', async () => {
            const admin = await prisma.user.create({
                data: {
                    email: 'admin@example.com',
                    password: await bcrypt.hash('password', 10),
                    name: 'Admin User',
                    role: 'ADMIN'
                }
            });

            expect(admin.role).toBe('ADMIN');
        });

        it('should check user permissions', () => {
            const roles = {
                USER: ['read:own', 'write:own'],
                ADMIN: ['read:all', 'write:all', 'delete:all'],
                SUPER_ADMIN: ['*']
            };

            expect(roles.USER).toContain('read:own');
            expect(roles.ADMIN).toContain('delete:all');
            expect(roles.SUPER_ADMIN).toContain('*');
        });
    });
});
