import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import { logger } from './config/logger';
import { errorHandler } from './middleware/errorHandler';
import fileRoutes from './routes/file.routes';

dotenv.config();

const app: Application = express();
const PORT = process.env.FILE_SERVICE_PORT || 4003;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

// Routes
app.use('/api/v1/files', fileRoutes);

app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'file-service',
        uptime: process.uptime(),
    });
});

// Error handler
app.use(errorHandler);

const server = app.listen(PORT, () => {
    logger.info(`📁 File Service running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
});

export default app;
