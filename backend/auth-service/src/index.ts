import express, { Application } from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import { logger } from './config/logger';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app: Application = express();
const PORT = process.env.AUTH_SERVICE_PORT || 4001;

// Middleware
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'auth-service' });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`🔐 Auth Service running on port ${PORT}`);
});

export default app;
