'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'

interface ServiceStatus {
  name: string
  status: 'healthy' | 'unhealthy' | 'degraded'
  uptime: number
  lastCheck: string
}

interface Project {
  id: string
  name: string
  description: string
  language: string
  lastUpdated: string
  collaborators: string[]
}

interface DashboardApiData {
  services: ServiceStatus[]
  projects: Project[]
  recentActivity: { action: string; resource: string; timestamp: string }[]
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

async function getDashboardData(token?: string): Promise<DashboardApiData> {
  const res = await fetch(`${API_BASE}/api/dashboard`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardApiData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Token would typically come from an auth context/cookie
    const token = typeof window !== 'undefined' ? localStorage.getItem('devforge_token') ?? undefined : undefined
    getDashboardData(token)
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const services = data?.services ?? []
  const projects = data?.projects ?? []
  const activity = data?.recentActivity ?? []

  const healthyServices = services.filter(s => s.status === 'healthy').length
  const degradedServices = services.filter(s => s.status === 'degraded').length
  const unhealthyServices = services.filter(s => s.status === 'unhealthy').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              DevForge
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/editor" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 font-medium">Editor</Link>
              <Link href="/kanban" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 font-medium">Kanban</Link>
              <Link href="/traces" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 font-medium">Traces</Link>
              <Link href="/notifications" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 font-medium">Notifications</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Overview of your DevForge platform</p>

        {loading && <div className="text-center py-12 text-muted-foreground">Loading dashboard…</div>}
        {error && <div className="text-center py-12 text-red-500">Failed to load dashboard: {error}</div>}

        {!loading && !error && (
          <>
            {/* Service Status Summary Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Services</CardDescription>
                  <CardTitle className="text-3xl">{services.length}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-green-600">Healthy</CardDescription>
                  <CardTitle className="text-3xl text-green-600">{healthyServices}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-yellow-600">Degraded</CardDescription>
                  <CardTitle className="text-3xl text-yellow-600">{degradedServices}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-red-600">Unhealthy</CardDescription>
                  <CardTitle className="text-3xl text-red-600">{unhealthyServices}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Service Status Panel */}
                <Card>
                  <CardHeader>
                    <CardTitle>Service Status</CardTitle>
                    <CardDescription>Real-time service health monitoring</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {services.map(service => (
                        <div
                          key={service.name}
                          className="flex items-center justify-between p-4 rounded-lg border bg-white dark:bg-gray-800"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              service.status === 'healthy' ? 'bg-green-500' :
                              service.status === 'degraded' ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`} />
                            <div>
                              <h3 className="font-semibold">{service.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                Uptime: {service.uptime}% • Last check: {service.lastCheck}
                              </p>
                            </div>
                          </div>
                          <Badge variant={
                            service.status === 'healthy' ? 'default' :
                            service.status === 'degraded' ? 'secondary' :
                            'destructive'
                          }>
                            {service.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Projects Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle>Projects</CardTitle>
                    <CardDescription>Your active projects</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {projects.map(project => (
                        <div
                          key={project.id}
                          className="flex items-center gap-4 p-4 rounded-lg border bg-white dark:bg-gray-800 hover:border-indigo-300 transition-colors cursor-pointer"
                        >
                          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
                            <span className="text-xl">📁</span>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{project.name}</h3>
                            <p className="text-sm text-muted-foreground">{project.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{project.language}</Badge>
                              <span className="text-xs text-muted-foreground">Updated {project.lastUpdated}</span>
                            </div>
                          </div>
                          <div className="flex -space-x-2">
                            {project.collaborators.map((collab, idx) => (
                              <div
                                key={idx}
                                className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-white dark:border-gray-800"
                              >
                                {collab}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card>
                  <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { href: '/editor', icon: '✏️', label: 'Open Editor' },
                        { href: '/kanban', icon: '📋', label: 'View Kanban Board' },
                        { href: '/traces', icon: '🔍', label: 'View Traces' },
                        { href: '/notifications', icon: '🔔', label: 'Notifications' },
                      ].map(({ href, icon, label }) => (
                        <Link key={href} href={href}>
                          <div className="flex items-center gap-3 p-3 rounded-lg border bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                            <span className="text-xl">{icon}</span>
                            <span className="font-medium">{label}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader><CardTitle>Recent Activity</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activity.map((item, idx) => (
                        <div key={idx} className="border-l-2 border-indigo-200 pl-4">
                          <p className="font-medium">{item.action}</p>
                          <p className="text-sm text-muted-foreground">{item.resource}</p>
                          <p className="text-xs text-muted-foreground mt-1">{item.timestamp}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}