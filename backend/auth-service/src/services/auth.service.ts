import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { IAuthTokens } from '@devhub/shared';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';

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
        return {
            id: Math.random().toString(36).substring(7),
            email: userData.email,
            username: userData.username,
            role: 'USER',
        };
    }

    async login(email: string, password: string) {
        // In production, fetch from database and verify
        const user = {
            userId: '123',
            email,
            role: 'USER',
        };

        const tokens = this.generateTokens(user);
        return { user, tokens };
    }

    async refreshTokens(refreshToken: string) {
        const payload = this.verifyRefreshToken(refreshToken);
        return this.generateTokens({
            userId: payload.userId,
            email: payload.email,
            role: payload.role,
        });
    }
}
