import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createClient } from 'redis';
import { IAuthTokens } from '@devhub/shared';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';

const redis = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
redis.connect().catch(console.error);

export class AuthService {
    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, SALT_ROUNDS);
    }

    async comparePassword(password: string, hash: string): Promise<boolean> {
        return bcrypt.compare(password, hash);
    }

    generateTokens(payload: any): IAuthTokens {
        const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
        return { accessToken, refreshToken };
    }

    verifyAccessToken(token: string): any {
        return jwt.verify(token, JWT_SECRET);
    }

    verifyRefreshToken(token: string): any {
        return jwt.verify(token, JWT_REFRESH_SECRET);
    }

    async register(userData: any) {
        const hashedPassword = await this.hashPassword(userData.password);
        // In production, save to database
        const user = {
            id: Math.random().toString(36).substring(7),
            email: userData.email,
            username: userData.username,
            role: 'USER',
            emailVerified: false,
        };

        // Generate verification token and send email
        const verificationToken = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
        console.log(`Verification email queued for ${user.email} with token ${verificationToken}`);

        return user;
    }

    async login(email: string, password: string) {
        // In production, fetch from database and verify
        const user = {
            userId: '123',
            email,
            role: 'USER',
        };

        const tokens = this.generateTokens(user);
        // Store refresh token in Redis
        await redis.set(`refresh:${user.userId}`, tokens.refreshToken, { EX: 7 * 24 * 60 * 60 });

        return { user, tokens };
    }

    async refreshTokens(refreshToken: string) {
        const payload = this.verifyRefreshToken(refreshToken);

        // Check if refresh token is blacklisted
        const isBlacklisted = await redis.get(`blacklist:${refreshToken}`);
        if (isBlacklisted) {
            throw new Error('Refresh token has been revoked');
        }

        // Generate new tokens
        const newTokens = this.generateTokens({
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
        });

        // Blacklist old refresh token
        await redis.set(`blacklist:${refreshToken}`, '1', { EX: 7 * 24 * 60 * 60 });
        // Store new refresh token
        await redis.set(`refresh:${payload.userId}`, newTokens.refreshToken, { EX: 7 * 24 * 60 * 60 });

        return newTokens;
    }

    async forgotPassword(email: string) {
        // In production, check if user exists
        const resetToken = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });

        // Store reset token in Redis with 1h TTL
        await redis.set(`reset:${email}`, resetToken, { EX: 60 * 60 });

        console.log(`Password reset email queued for ${email} with token ${resetToken}`);

        return { message: 'Password reset email sent' };
    }

    async resetPassword(token: string, newPassword: string) {
        const payload = jwt.verify(token, JWT_SECRET);
        const email = payload.email;

        // Verify token exists in Redis
        const storedToken = await redis.get(`reset:${email}`);
        if (storedToken !== token) {
            throw new Error('Invalid or expired reset token');
        }

        // Hash new password
        const hashedPassword = await this.hashPassword(newPassword);

        // In production, update user password in database

        // Delete reset token from Redis
        await redis.del(`reset:${email}`);

        return { message: 'Password reset successful' };
    }

    async verifyEmail(token: string) {
        const payload = jwt.verify(token, JWT_SECRET);
        const userId = payload.userId;

        // In production, mark user email as verified in database

        return { message: 'Email verified successfully' };
    }
}
