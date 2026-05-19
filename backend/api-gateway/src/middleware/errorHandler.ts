import { Request, Response, NextFunction } from 'express';
import { AppError } from '@devhub/shared';
import { logger } from '../config/logger';

export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let statusCode = 500;
    let message = 'Internal Server Error';
    let isOperational = false;

    // Handle custom AppError
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
        isOperational = err.isOperational;
    }

    // Log error
    const errorLog = {
        correlationId: req.headers['x-correlation-id'],
        method: req.method,
        path: req.path,
        statusCode,
        message: err.message,
        stack: err.stack,
    };

    if (statusCode >= 500) {
        logger.error('Server Error:', errorLog);
    } else {
        logger.warn('Client Error:', errorLog);
    }

    // Send error response
    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
        correlationId: req.headers['x-correlation-id'],
    });
};
