import express, { Application } from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { logger } from './config/logger';
import { errorHandler } from './middleware/errorHandler';
import analyticsRoutes from './routes/analytics.routes';

dotenv.config();

const app: Application = express();
const PORT = process.env.ANALYTICS_SERVICE_PORT || 4004;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/analytics', analyticsRoutes);

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'analytics-service',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    });
});

// Error handler
app.use(errorHandler);

// MongoDB connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/devhub');
        logger.info('📊 MongoDB connected successfully');
    } catch (error) {
        logger.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Scheduled jobs
const setupCronJobs = () => {
    // Daily aggregation at midnight
    cron.schedule('0 0 * * *', async () => {
        logger.info('Running daily analytics aggregation...');
        // Add aggregation logic here
    });

    // Weekly report on Sundays
    cron.schedule('0 0 * * 0', async () => {
        logger.info('Generating weekly analytics report...');
        // Add report generation logic here
    });
};

// Start server
const startServer = async () => {
    await connectDB();
    setupCronJobs();

    const server = app.listen(PORT, () => {
        logger.info(`📊 Analytics Service running on port ${PORT}`);
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
