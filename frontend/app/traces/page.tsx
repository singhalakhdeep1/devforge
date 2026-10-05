'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'

interface Trace {
  id: string
  service: string
  operation: string
  duration: number
  status: 'success' | 'error'
  timestamp: string
}

const mockTraces: Trace[] = [
  { id: '1', service: 'auth-service', operation: 'POST /api/v1/auth/login', duration: 45, status: 'success', timestamp: '2s ago' },
  { id: '2', service: 'kanban-service', operation: 'GET /api/kanban/boards/123', duration: 120, status: 'success', timestamp: '5s ago' },
  { id: '3', service: 'notification-service', operation: 'POST /api/v1/notifications', duration: 32, status: 'success', timestamp: '8s ago' },
  { id: '4', service: 'editor-service', operation: 'WS /editor/connect', duration: 89, status: 'error', timestamp: '12s ago' },
  { id: '5', service: 'api-gateway', operation: 'GET /api/v1/health', duration: 15, status: 'success', timestamp: '15s ago' },
  { id: '6', service: 'auth-service', operation: 'POST /api/v1/auth/refresh', duration: 28, status: 'success', timestamp: '20s ago' },
  { id: '7', service: 'kanban-service', operation: 'POST /api/kanban/tasks', duration: 156, status: 'success', timestamp: '25s ago' },
  { id: '8', service: 'notification-service', operation: 'Kafka consumer', duration: 67, status: 'success', timestamp: '30s ago' },
]

export default function TracesPage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Distributed Traces</h1>
            <div className="flex items-center gap-4">
              <select className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm">
                <option>Last 5 minutes</option>
                <option>Last 15 minutes</option>
                <option>Last 1 hour</option>
                <option>Last 24 hours</option>
              </select>
              <select className="bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm">
                <option>All Services</option>
                <option>auth-service</option>
                <option>kanban-service</option>
                <option>notification-service</option>
                <option>editor-service</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Traces</CardDescription>
              <CardTitle className="text-3xl">{mockTraces.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-green-600">Success Rate</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {Math.round((mockTraces.filter(t => t.status === 'success').length / mockTraces.length) * 100)}%
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Avg Duration</CardDescription>
              <CardTitle className="text-3xl">
                {Math.round(mockTraces.reduce((acc, t) => acc + t.duration, 0) / mockTraces.length)}ms
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-red-600">Errors</CardDescription>
              <CardTitle className="text-3xl text-red-600">
                {mockTraces.filter(t => t.status === 'error').length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Traces Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Traces</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Trace ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Service</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Operation</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Duration</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTraces.map(trace => (
                    <tr key={trace.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                      <td className="py-3 px-4 text-sm font-mono text-indigo-600">{trace.id}</td>
                      <td className="py-3 px-4 text-sm">
                        <Badge variant="outline">{trace.service}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm font-mono">{trace.operation}</td>
                      <td className="py-3 px-4 text-sm">{trace.duration}ms</td>
                      <td className="py-3 px-4">
                        <Badge variant={trace.status === 'success' ? 'default' : 'destructive'}>
                          {trace.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">{trace.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Service Breakdown */}
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Service Latency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['auth-service', 'kanban-service', 'notification-service', 'editor-service', 'api-gateway'].map(service => {
                  const serviceTraces = mockTraces.filter(t => t.service === service)
                  const avgDuration = serviceTraces.length > 0 
                    ? Math.round(serviceTraces.reduce((acc, t) => acc + t.duration, 0) / serviceTraces.length)
                    : 0
                  return (
                    <div key={service} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{service}</span>
                      <div className="flex items-center gap-4">
                        <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full" 
                            style={{ width: `${Math.min(avgDuration / 2, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{avgDuration}ms</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Error Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['editor-service', 'api-gateway', 'kanban-service'].map(service => {
                  const errorCount = mockTraces.filter(t => t.service === service && t.status === 'error').length
                  const totalCount = mockTraces.filter(t => t.service === service).length
                  const errorRate = totalCount > 0 ? Math.round((errorCount / totalCount) * 100) : 0
                  return (
                    <div key={service} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{service}</span>
                      <div className="flex items-center gap-4">
                        <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-red-500 h-2 rounded-full" 
                            style={{ width: `${errorRate}%` }}
                          />
                        </div>
                        <span className="text-sm text-red-600">{errorRate}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
