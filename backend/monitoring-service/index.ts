import express from 'express';
import { prometheusMiddleware, register } from './prometheus';
import { healthCheck } from './health-check';
import { metricsCollector } from './metrics-collector';
import { alertManager } from './alert-manager';

const app = express();
const PORT = process.env.MONITORING_PORT || 9090;

app.use(express.json());

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

// Health check endpoints
app.get('/health', async (req, res) => {
    const health = await healthCheck.checkAll();
    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
});

app.get('/health/:service', async (req, res) => {
    const { service } = req.params;
    const health = await healthCheck.checkService(service);
    const statusCode = health.healthy ? 200 : 503;
    res.status(statusCode).json(health);
});

// System metrics
app.get('/metrics/system', async (req, res) => {
    const metrics = await metricsCollector.getSystemMetrics();
    res.json(metrics);
});

// Application metrics
app.get('/metrics/application', async (req, res) => {
    const metrics = await metricsCollector.getApplicationMetrics();
    res.json(metrics);
});

// Database metrics
app.get('/metrics/database', async (req, res) => {
    const metrics = await metricsCollector.getDatabaseMetrics();
    res.json(metrics);
});

// Custom metrics
app.post('/metrics/custom', async (req, res) => {
    const { name, value, labels } = req.body;
    metricsCollector.recordCustomMetric(name, value, labels);
    res.json({ success: true });
});

// Alerts
app.get('/alerts', async (req, res) => {
    const alerts = await alertManager.getActiveAlerts();
    res.json(alerts);
});

app.post('/alerts/rules', async (req, res) => {
    const rule = req.body;
    const id = await alertManager.addRule(rule);
    res.json({ id });
});

app.delete('/alerts/rules/:id', async (req, res) => {
    const { id } = req.params;
    await alertManager.removeRule(id);
    res.json({ success: true });
});

app.post('/alerts/silence/:id', async (req, res) => {
    const { id } = req.params;
    const { duration } = req.body;
    await alertManager.silenceAlert(id, duration);
    res.json({ success: true });
});

// Start server
app.listen(PORT, () => {
    console.log(`Monitoring service running on port ${PORT}`);

    // Start metrics collection
    metricsCollector.startCollection();

    // Start alert checking
    alertManager.startMonitoring();
});

export default app;
