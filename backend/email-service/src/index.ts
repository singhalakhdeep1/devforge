import express from 'express';
import { Queue, Worker } from 'bullmq';
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
import { logger } from './config/logger';

dotenv.config();

const app = express();
const PORT = process.env.EMAIL_SERVICE_PORT || 4003;

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

// BullMQ setup
const emailQueue = new Queue('email', {
    connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
    },
});

// Email worker
const emailWorker = new Worker('email', async (job) => {
    const { to, subject, html, template, data } = job.data;

    logger.info(`Processing email job ${job.id} for ${to}`);

    try {
        const msg = {
            to,
            from: process.env.EMAIL_FROM || 'noreply@devhub.com',
            subject,
            html: html || generateTemplate(template, data),
        };

        if (process.env.SENDGRID_API_KEY) {
            await sgMail.send(msg);
            logger.info(`Email sent successfully to ${to}`);
        } else {
            logger.warn(`Email not sent (no API key): ${to}`);
        }

        return { success: true };
    } catch (error) {
        logger.error(`Failed to send email: ${error}`);
        throw error;
    }
}, {
    connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
    },
    concurrency: 5,
});

// Template generator
const generateTemplate = (template: string, data: any): string => {
    const templates: Record<string, string> = {
        WELCOME: `
      <h1>Welcome to DevHub, ${data.name}!</h1>
      <p>Thank you for joining our platform.</p>
    `,
        PASSWORD_RESET: `
      <h1>Password Reset Request</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${data.resetLink}">Reset Password</a>
    `,
        EMAIL_VERIFICATION: `
      <h1>Verify Your Email</h1>
      <p>Click the link below to verify your email:</p>
      <a href="${data.verifyLink}">Verify Email</a>
    `,
    };

    return templates[template] || '<p>Email content</p>';
};

// Middleware
app.use(express.json());

// Routes
app.post('/api/v1/email/send', async (req, res) => {
    try {
        const job = await emailQueue.add('send-email', req.body);
        res.json({ success: true, jobId: job.id });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to queue email' });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'email-service' });
});

app.listen(PORT, () => {
    logger.info(`📧 Email Service running on port ${PORT}`);
});

export default app;
