'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { GitBranch, Play, Clock, CheckCircle, XCircle, AlertTriangle, Settings, Download } from 'lucide-react';

interface Pipeline {
  id: string;
  name: string;
  status: 'running' | 'success' | 'failed' | 'pending';
  branch: string;
  commit: string;
  author: string;
  duration: string;
  triggeredAt: Date;
  stages: Stage[];
}

interface Stage {
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  duration?: string;
}

export default function CICDDashboard() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([
    {
      id: '1',
      name: 'Frontend Build',
      status: 'running',
      branch: 'main',
      commit: 'abc123',
      author: 'Alice Johnson',
      duration: '3m 45s',
      triggeredAt: new Date(),
      stages: [
        { name: 'Install', status: 'success', duration: '1m 20s' },
        { name: 'Lint', status: 'success', duration: '0m 45s' },
        { name: 'Test', status: 'running' },
        { name: 'Build', status: 'pending' },
        { name: 'Deploy', status: 'pending' }
      ]
    },
    {
      id: '2',
      name: 'Backend API',
      status: 'success',
      branch: 'develop',
      commit: 'def456',
      author: 'Bob Smith',
      duration: '5m 12s',
      triggeredAt: new Date(Date.now() - 3600000),
      stages: [
        { name: 'Install', status: 'success', duration: '1m 30s' },
        { name: 'Lint', status: 'success', duration: '0m 50s' },
        { name: 'Test', status: 'success', duration: '2m 10s' },
        { name: 'Build', status: 'success', duration: '1m 02s' },
        { name: 'Deploy', status: 'success', duration: '0m 40s' }
      ]
    },
    {
      id: '3',
      name: 'E2E Tests',
      status: 'failed',
      branch: 'feature/auth',
      commit: 'ghi789',
      author: 'Carol Davis',
      duration: '8m 30s',
      triggeredAt: new Date(Date.now() - 7200000),
      stages: [
        { name: 'Install', status: 'success', duration: '1m 25s' },
        { name: 'Lint', status: 'success', duration: '0m 48s' },
        { name: 'Test', status: 'failed', duration: '6m 17s' },
        { name: 'Build', status: 'pending' },
        { name: 'Deploy', status: 'pending' }
      ]
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'running': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'pending': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return null;
    }
  };

  const triggerPipeline = (pipelineId: string) => {
    setPipelines(pipelines.map(p => 
      p.id === pipelineId ? { ...p, status: 'running' as const, triggeredAt: new Date() } : p
    ));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <GitBranch />
          CI/CD Dashboard
        </h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
          <Button>
            <Play className="w-4 h-4 mr-2" />
            New Pipeline
          </Button>
        </div>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Total Pipelines</p>
          <p className="text-2xl font-bold">{pipelines.length}</p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Running</p>
          <p className="text-2xl font-bold text-blue-500">
            {pipelines.filter(p => p.status === 'running').length}
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Success Rate</p>
          <p className="text-2xl font-bold text-green-500">
            {((pipelines.filter(p => p.status === 'success').length / pipelines.length) * 100).toFixed(0)}%
          </p>
        </div>
        <div className="border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Avg Duration</p>
          <p className="text-2xl font-bold">5m 42s</p>
        </div>
      </div>

      {/* Pipelines List */}
      <div className="space-y-4">
        {pipelines.map(pipeline => (
          <div key={pipeline.id} className="border rounded-lg bg-background p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                {getStatusIcon(pipeline.status)}
                <div>
                  <h3 className="font-semibold">{pipeline.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <GitBranch className="w-3 h-3" />
                    <span>{pipeline.branch}</span>
                    <span>•</span>
                    <span className="font-mono">{pipeline.commit}</span>
                    <span>•</span>
                    <span>{pipeline.author}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{pipeline.duration}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Triggered</p>
                  <p className="font-medium">{pipeline.triggeredAt.toLocaleTimeString()}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => triggerPipeline(pipeline.id)}>
                  <Play className="w-4 h-4 mr-2" />
                  Rerun
                </Button>
                <Button variant="ghost" size="sm">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Pipeline Stages */}
            <div className="flex items-center gap-2">
              {pipeline.stages.map((stage, index) => (
                <React.Fragment key={stage.name}>
                  <div className="flex items-center gap-2 px-3 py-2 rounded border">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(stage.status)}`} />
                    <span className="text-sm font-medium">{stage.name}</span>
                    {stage.duration && <span className="text-xs text-muted-foreground">{stage.duration}</span>}
                  </div>
                  {index < pipeline.stages.length - 1 && (
                    <div className="w-8 h-0.5 bg-muted" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        <Button variant="outline" className="h-16 flex-col gap-2">
          <GitBranch className="w-5 h-5" />
          <span className="text-sm">Create Branch</span>
        </Button>
        <Button variant="outline" className="h-16 flex-col gap-2">
          <Settings className="w-5 h-5" />
          <span className="text-sm">Pipeline Settings</span>
        </Button>
        <Button variant="outline" className="h-16 flex-col gap-2">
          <Download className="w-5 h-5" />
          <span className="text-sm">Export Logs</span>
        </Button>
      </div>
    </div>
  );
}
