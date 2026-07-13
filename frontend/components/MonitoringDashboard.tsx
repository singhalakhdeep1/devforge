'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Activity, Cpu, HardDrive, MemoryStick, Network, AlertTriangle, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface Metric {
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  threshold?: number;
}

interface Service {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  latency: number;
  errorRate: number;
}

export default function MonitoringDashboard() {
  const [metrics, setMetrics] = useState<Metric[]>([
    { name: 'CPU Usage', value: 45, unit: '%', trend: 'up', threshold: 80 },
    { name: 'Memory', value: 62, unit: '%', trend: 'stable', threshold: 90 },
    { name: 'Disk', value: 78, unit: '%', trend: 'up', threshold: 85 },
    { name: 'Network', value: 120, unit: 'Mbps', trend: 'down' },
    { name: 'Requests', value: 1250, unit: '/min', trend: 'up' }
  ]);

  const [services, setServices] = useState<Service[]>([
    { name: 'API Gateway', status: 'healthy', uptime: 99.9, latency: 45, errorRate: 0.1 },
    { name: 'Auth Service', status: 'healthy', uptime: 99.8, latency: 32, errorRate: 0.05 },
    { name: 'Database', status: 'healthy', uptime: 99.95, latency: 12, errorRate: 0.01 },
    { name: 'Cache', status: 'degraded', uptime: 98.5, latency: 85, errorRate: 2.5 },
    { name: 'File Storage', status: 'healthy', uptime: 99.7, latency: 120, errorRate: 0.2 }
  ]);

  const [alerts, setAlerts] = useState([
    { id: '1', type: 'warning', message: 'Cache service latency above threshold', time: new Date() },
    { id: '2', type: 'info', message: 'Scheduled maintenance in 2 hours', time: new Date(Date.now() - 3600000) }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'down': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-green-500" />;
      case 'stable': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default: return null;
    }
  };

  const isMetricCritical = (metric: Metric) => {
    return metric.threshold && metric.value > metric.threshold;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Activity />
          Monitoring Dashboard
        </h1>
        <Button>
          Configure Alerts
        </Button>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map(alert => (
            <div key={alert.id} className={`p-4 rounded-lg flex items-center gap-3 ${
              alert.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' : 'bg-blue-50 border border-blue-200'
            }`}>
              <AlertTriangle className={`w-5 h-5 ${alert.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'}`} />
              <div className="flex-1">
                <p className="font-medium">{alert.message}</p>
                <p className="text-sm text-muted-foreground">{alert.time.toLocaleString()}</p>
              </div>
              <Button variant="ghost" size="sm">Dismiss</Button>
            </div>
          ))}
        </div>
      )}

      {/* System Metrics */}
      <div className="grid grid-cols-5 gap-4">
        {metrics.map(metric => (
          <div key={metric.name} className={`border rounded-lg p-4 ${isMetricCritical(metric) ? 'border-red-500 bg-red-50' : ''}`}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">{metric.name}</p>
              {getTrendIcon(metric.trend)}
            </div>
            <p className="text-2xl font-bold">
              {metric.value}{metric.unit}
            </p>
            {metric.threshold && (
              <p className="text-xs text-muted-foreground mt-1">
                Threshold: {metric.threshold}{metric.unit}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Services Status */}
      <div className="border rounded-lg bg-background p-4">
        <h2 className="font-semibold mb-4">Services Status</h2>
        <div className="space-y-3">
          {services.map(service => (
            <div key={service.name} className="flex items-center justify-between p-3 border rounded hover:bg-accent/50">
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(service.status)}`} />
                <div>
                  <p className="font-medium">{service.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">{service.status}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <p className="text-muted-foreground">Uptime</p>
                  <p className="font-medium">{service.uptime}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Latency</p>
                  <p className="font-medium">{service.latency}ms</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Error Rate</p>
                  <p className="font-medium">{service.errorRate}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resource Usage */}
      <div className="grid grid-cols-3 gap-4">
        <div className="border rounded-lg bg-background p-4">
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-5 h-5" />
            <h3 className="font-semibold">CPU</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Core 1</span>
              <span>42%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: '42%' }} />
            </div>
            <div className="flex justify-between text-sm">
              <span>Core 2</span>
              <span>48%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: '48%' }} />
            </div>
          </div>
        </div>

        <div className="border rounded-lg bg-background p-4">
          <div className="flex items-center gap-2 mb-4">
            <MemoryStick className="w-5 h-5" />
            <h3 className="font-semibold">Memory</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Used</span>
              <span>12.4 GB / 16 GB</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-purple-500" style={{ width: '78%' }} />
            </div>
            <div className="flex justify-between text-sm">
              <span>Cache</span>
              <span>2.1 GB</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-purple-300" style={{ width: '35%' }} />
            </div>
          </div>
        </div>

        <div className="border rounded-lg bg-background p-4">
          <div className="flex items-center gap-2 mb-4">
            <HardDrive className="w-5 h-5" />
            <h3 className="font-semibold">Disk</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Used</span>
              <span>312 GB / 400 GB</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-green-500" style={{ width: '78%' }} />
            </div>
            <div className="flex justify-between text-sm">
              <span>I/O</span>
              <span>125 MB/s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
