'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'

interface Notification {
  id: string
  type: 'welcome' | 'task_assigned' | 'deploy_failed' | 'system'
  title: string
  message: string
  priority: 'low' | 'medium' | 'high'
  read: boolean
  timestamp: string
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'task_assigned',
    title: 'New Task Assigned',
    message: 'You have been assigned to task: Implement API rate limiting',
    priority: 'high',
    read: false,
    timestamp: '5 minutes ago'
  },
  {
    id: '2',
    type: 'deploy_failed',
    title: 'Deployment Failed',
    message: 'Deployment failed for editor-service: Connection timeout',
    priority: 'high',
    read: false,
    timestamp: '15 minutes ago'
  },
  {
    id: '3',
    type: 'welcome',
    title: 'Welcome to DevForge!',
    message: 'Your account has been created successfully',
    priority: 'low',
    read: true,
    timestamp: '2 hours ago'
  },
  {
    id: '4',
    type: 'task_assigned',
    title: 'Task Completed',
    message: 'Task "Auth service" has been marked as completed',
    priority: 'medium',
    read: true,
    timestamp: '3 hours ago'
  },
  {
    id: '5',
    type: 'system',
    title: 'System Maintenance',
    message: 'Scheduled maintenance in 24 hours',
    priority: 'medium',
    read: true,
    timestamp: '1 day ago'
  }
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [filter, setFilter] = useState<'all' | 'unread' | 'high'>('all')

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true
    if (filter === 'unread') return !n.read
    if (filter === 'high') return n.priority === 'high'
    return true
  })

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task_assigned': return '📋'
      case 'deploy_failed': return '❌'
      case 'welcome': return '🎉'
      case 'system': return '⚙️'
      default: return '📢'
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded text-sm ${
                    filter === 'all' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-3 py-1 rounded text-sm ${
                    filter === 'unread' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Unread ({notifications.filter(n => !n.read).length})
                </button>
                <button
                  onClick={() => setFilter('high')}
                  className={`px-3 py-1 rounded text-sm ${
                    filter === 'high' 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  High Priority
                </button>
              </div>
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
              >
                Mark All Read
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total</CardDescription>
              <CardTitle className="text-3xl">{notifications.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-indigo-600">Unread</CardDescription>
              <CardTitle className="text-3xl text-indigo-600">
                {notifications.filter(n => !n.read).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-red-600">High Priority</CardDescription>
              <CardTitle className="text-3xl text-red-600">
                {notifications.filter(n => n.priority === 'high').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Today</CardDescription>
              <CardTitle className="text-3xl">
                {notifications.filter(n => n.timestamp.includes('hour') || n.timestamp.includes('minute')).length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.map(notification => (
            <Card 
              key={notification.id} 
              className={`cursor-pointer hover:shadow-md transition-shadow ${
                !notification.read ? 'border-l-4 border-l-indigo-500' : ''
              }`}
              onClick={() => markAsRead(notification.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{getTypeIcon(notification.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={`font-semibold text-lg ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {notification.message}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant={notification.priority === 'high' ? 'destructive' : 'secondary'}>
                          {notification.priority}
                        </Badge>
                        <span className="text-xs text-gray-500">{notification.timestamp}</span>
                      </div>
                    </div>
                  </div>
                  {!notification.read && (
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(notification.priority)}`} />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredNotifications.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-4xl mb-4">📭</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No notifications
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {filter === 'unread' ? 'You have no unread notifications' : 'Your notification list is empty'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
