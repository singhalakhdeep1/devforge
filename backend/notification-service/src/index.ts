import express, { Application } from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import { logger } from './config/logger';
import { errorHandler } from './middleware/errorHandler';
import notificationRoutes from './routes/notification.routes';

dotenv.config();

const app: Application = express();
const PORT = process.env.NOTIFICATION_SERVICE_PORT || 4002;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/notifications', notificationRoutes);

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'notification-service',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    });
});

// Error handler
app.use(errorHandler);

// MongoDB connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/devhub');
        logger.info('📦 MongoDB connected successfully');
    } catch (error) {
        logger.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Start server
const startServer = async () => {
    await connectDB();

    const server = app.listen(PORT, () => {
        logger.info(`🔔 Notification Service running on port ${PORT}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
        logger.info('SIGTERM received, shutting down gracefully');
        server.close(async () => {
            await mongoose.connection.close();
            logger.info('MongoDB connection closed');
            process.exit(0);
        });
    });
};

startServer();

export default app;
