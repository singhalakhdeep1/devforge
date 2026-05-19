import { EventEmitter } from 'events';
import { metricsCollector } from './metrics-collector';
import nodemailer from 'nodemailer';

interface AlertRule {
    id: string;
    name: string;
    condition: string;
    threshold: number;
    duration: number; // in seconds
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    enabled: boolean;
    actions: AlertAction[];
}

interface AlertAction {
    type: 'email' | 'webhook' | 'slack';
    config: any;
}

interface Alert {
    id: string;
    ruleId: string;
    ruleName: string;
    severity: string;
    message: string;
    value: number;
    threshold: number;
    triggeredAt: Date;
    resolved: boolean;
    resolvedAt?: Date;
    silencedUntil?: Date;
}

class AlertManager extends EventEmitter {
    private rules: Map<string, AlertRule> = new Map();
    private activeAlerts: Map<string, Alert> = new Map();
    private monitoringInterval: NodeJS.Timeout | null = null;
    private emailTransporter: any;

    constructor() {
        super();
        this.initializeEmailTransporter();
        this.loadDefaultRules();
    }

    private initializeEmailTransporter() {
        this.emailTransporter = nodemailer.createTransporter({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    private loadDefaultRules() {
        // CPU usage alert
        this.addRule({
            id: 'cpu-high',
            name: 'High CPU Usage',
            condition: 'cpu.usage > threshold',
            threshold: 80,
            duration: 300, // 5 minutes
            severity: 'HIGH',
            enabled: true,
            actions: [
                { type: 'email', config: { to: process.env.ALERT_EMAIL } }
            ]
        });

        // Memory usage alert
        this.addRule({
            id: 'memory-high',
            name: 'High Memory Usage',
            condition: 'memory.usagePercent > threshold',
            threshold: 85,
            duration: 300,
            severity: 'HIGH',
            enabled: true,
            actions: [
                { type: 'email', config: { to: process.env.ALERT_EMAIL } }
            ]
        });

        // Disk usage alert
        this.addRule({
            id: 'disk-high',
            name: 'High Disk Usage',
            condition: 'disk.usagePercent > threshold',
            threshold: 90,
            duration: 600, // 10 minutes
            severity: 'CRITICAL',
            enabled: true,
            actions: [
                { type: 'email', config: { to: process.env.ALERT_EMAIL } }
            ]
        });

        // Database connection pool exhaustion
        this.addRule({
            id: 'db-pool-exhausted',
            name: 'Database Connection Pool Exhausted',
            condition: 'database.connections.idle < threshold',
            threshold: 2,
            duration: 60,
            severity: 'CRITICAL',
            enabled: true,
            actions: [
                { type: 'email', config: { to: process.env.ALERT_EMAIL } }
            ]
        });

        // High error rate
        this.addRule({
            id: 'high-error-rate',
            name: 'High Error Rate',
            condition: 'errors.rate > threshold',
            threshold: 50, // 50 errors per minute
            duration: 120,
            severity: 'HIGH',
            enabled: true,
            actions: [
                { type: 'email', config: { to: process.env.ALERT_EMAIL } }
            ]
        });

        // Low cache hit rate
        this.addRule({
            id: 'low-cache-hit-rate',
            name: 'Low Cache Hit Rate',
            condition: 'cache.hitRate < threshold',
            threshold: 60,
            duration: 600,
            severity: 'MEDIUM',
            enabled: true,
            actions: [
                { type: 'email', config: { to: process.env.ALERT_EMAIL } }
            ]
        });

        // Service down
        this.addRule({
            id: 'service-down',
            name: 'Service Down',
            condition: 'service.healthy == false',
            threshold: 1,
            duration: 30,
            severity: 'CRITICAL',
            enabled: true,
            actions: [
                { type: 'email', config: { to: process.env.ALERT_EMAIL } }
            ]
        });
    }

    startMonitoring(intervalMs: number = 60000) {
        this.monitoringInterval = setInterval(() => {
            this.checkAlerts();
        }, intervalMs);

        console.log(`Alert monitoring started (interval: ${intervalMs}ms)`);
    }

    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
    }

    private async checkAlerts() {
        try {
            const [systemMetrics, dbMetrics, cacheMetrics, appMetrics] = await Promise.all([
                metricsCollector.getSystemMetrics(),
                metricsCollector.getDatabaseMetrics(),
                metricsCollector.getCacheMetrics(),
                metricsCollector.getApplicationMetrics()
            ]);

            for (const [ruleId, rule] of this.rules.entries()) {
                if (!rule.enabled) continue;

                const shouldAlert = this.evaluateRule(rule, {
                    system: systemMetrics,
                    database: dbMetrics,
                    cache: cacheMetrics,
                    application: appMetrics
                });

                if (shouldAlert.triggered) {
                    await this.triggerAlert(rule, shouldAlert.value);
                } else {
                    // Resolve alert if it exists
                    const existingAlert = this.activeAlerts.get(ruleId);
                    if (existingAlert && !existingAlert.resolved) {
                        await this.resolveAlert(existingAlert.id);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to check alerts:', error);
        }
    }

    private evaluateRule(rule: AlertRule, metrics: any): { triggered: boolean; value: number } {
        // Simple condition evaluation
        // In production, use a proper expression evaluator
        const { condition, threshold } = rule;

        try {
            if (condition.includes('cpu.usage')) {
                const value = parseFloat(metrics.system.cpu.usage);
                return { triggered: value > threshold, value };
            }

            if (condition.includes('memory.usagePercent')) {
                const value = parseFloat(metrics.system.memory.usagePercent);
                return { triggered: value > threshold, value };
            }

            if (condition.includes('database.connections.idle')) {
                const value = metrics.database?.connections?.idle || 0;
                return { triggered: value < threshold, value };
            }

            if (condition.includes('cache.hitRate')) {
                const value = parseFloat(metrics.cache?.hitRate || '100');
                return { triggered: value < threshold, value };
            }

            return { triggered: false, value: 0 };
        } catch (error) {
            console.error(`Failed to evaluate rule ${rule.id}:`, error);
            return { triggered: false, value: 0 };
        }
    }

    private async triggerAlert(rule: AlertRule, value: number) {
        const existingAlert = this.activeAlerts.get(rule.id);

        // Check if alert is silenced
        if (existingAlert?.silencedUntil && existingAlert.silencedUntil > new Date()) {
            return;
        }

        // Don't retrigger if already active
        if (existingAlert && !existingAlert.resolved) {
            return;
        }

        const alert: Alert = {
            id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            ruleId: rule.id,
            ruleName: rule.name,
            severity: rule.severity,
            message: `${rule.name}: Value ${value.toFixed(2)} exceeded threshold ${rule.threshold}`,
            value,
            threshold: rule.threshold,
            triggeredAt: new Date(),
            resolved: false
        };

        this.activeAlerts.set(rule.id, alert);
        this.emit('alert', alert);

        // Execute actions
        for (const action of rule.actions) {
            await this.executeAction(action, alert);
        }

        console.log(`Alert triggered: ${alert.message}`);
    }

    private async resolveAlert(alertId: string) {
        for (const [ruleId, alert] of this.activeAlerts.entries()) {
            if (alert.id === alertId) {
                alert.resolved = true;
                alert.resolvedAt = new Date();
                this.emit('resolved', alert);
                console.log(`Alert resolved: ${alert.message}`);
                break;
            }
        }
    }

    private async executeAction(action: AlertAction, alert: Alert) {
        switch (action.type) {
            case 'email':
                await this.sendEmailAlert(action.config, alert);
                break;
            case 'webhook':
                await this.sendWebhookAlert(action.config, alert);
                break;
            case 'slack':
                await this.sendSlackAlert(action.config, alert);
                break;
        }
    }

    private async sendEmailAlert(config: any, alert: Alert) {
        try {
            await this.emailTransporter.sendMail({
                from: process.env.ALERT_FROM_EMAIL,
                to: config.to,
                subject: `[${alert.severity}] ${alert.ruleName}`,
                html: `
          <h2>Alert: ${alert.ruleName}</h2>
          <p><strong>Severity:</strong> ${alert.severity}</p>
          <p><strong>Message:</strong> ${alert.message}</p>
          <p><strong>Value:</strong> ${alert.value.toFixed(2)}</p>
          <p><strong>Threshold:</strong> ${alert.threshold}</p>
          <p><strong>Triggered At:</strong> ${alert.triggeredAt.toISOString()}</p>
        `
            });
        } catch (error) {
            console.error('Failed to send email alert:', error);
        }
    }

    private async sendWebhookAlert(config: any, alert: Alert) {
        try {
            const response = await fetch(config.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(alert)
            });

            if (!response.ok) {
                throw new Error(`Webhook failed: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Failed to send webhook alert:', error);
        }
    }

    private async sendSlackAlert(config: any, alert: Alert) {
        try {
            const color = {
                LOW: '#36a64f',
                MEDIUM: '#ff9900',
                HIGH: '#ff0000',
                CRITICAL: '#8b0000'
            }[alert.severity];

            await fetch(config.webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    attachments: [{
                        color,
                        title: alert.ruleName,
                        text: alert.message,
                        fields: [
                            { title: 'Severity', value: alert.severity, short: true },
                            { title: 'Value', value: alert.value.toFixed(2), short: true },
                            { title: 'Threshold', value: alert.threshold.toString(), short: true },
                            { title: 'Time', value: alert.triggeredAt.toISOString(), short: true }
                        ]
                    }]
                })
            });
        } catch (error) {
            console.error('Failed to send Slack alert:', error);
        }
    }

    addRule(rule: AlertRule): string {
        this.rules.set(rule.id, rule);
        return rule.id;
    }

    removeRule(ruleId: string) {
        this.rules.delete(ruleId);
    }

    getRule(ruleId: string): AlertRule | undefined {
        return this.rules.get(ruleId);
    }

    getAllRules(): AlertRule[] {
        return Array.from(this.rules.values());
    }

    getActiveAlerts(): Alert[] {
        return Array.from(this.activeAlerts.values()).filter(a => !a.resolved);
    }

    silenceAlert(alertId: string, durationMs: number) {
        for (const alert of this.activeAlerts.values()) {
            if (alert.id === alertId) {
                alert.silencedUntil = new Date(Date.now() + durationMs);
                break;
            }
        }
    }
}

export const alertManager = new AlertManager();
