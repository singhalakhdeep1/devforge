import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '@devhub/shared';

interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
        role: string;
    };
}

export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            throw new AppError(401, 'Authentication required');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
        };

        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            next(new AppError(401, 'Invalid token'));
        } else if (error instanceof jwt.TokenExpiredError) {
            next(new AppError(401, 'Token expired'));
        } else {
            next(error);
        }
    }
};

export const authorize = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError(401, 'Authentication required'));
        }

        if (!roles.includes(req.user.role)) {
            return next(new AppError(403, 'Insufficient permissions'));
        }

        next();
    };
};
