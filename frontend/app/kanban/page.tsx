'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'

interface Task {
  id: string
  title: string
  description: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  assignee: string
  labels: string[]
}

interface Column {
  id: string
  name: string
  tasks: Task[]
}

const mockColumns: Column[] = [
  {
    id: 'backlog',
    name: 'Backlog',
    tasks: [
      { id: '1', title: 'Add dark mode', description: 'Implement dark mode toggle', priority: 'LOW', assignee: 'JD', labels: ['UI'] },
      { id: '2', title: 'Mobile responsive', description: 'Fix mobile layout issues', priority: 'MEDIUM', assignee: 'SK', labels: ['UI', 'Mobile'] },
    ]
  },
  {
    id: 'todo',
    name: 'To Do',
    tasks: [
      { id: '3', title: 'API rate limiting', description: 'Implement rate limiting middleware', priority: 'HIGH', assignee: 'MR', labels: ['Backend', 'Security'] },
      { id: '4', title: 'User onboarding', description: 'Create onboarding flow', priority: 'MEDIUM', assignee: 'JD', labels: ['Feature'] },
    ]
  },
  {
    id: 'in-progress',
    name: 'In Progress',
    tasks: [
      { id: '5', title: 'WebSocket integration', description: 'Add real-time updates', priority: 'HIGH', assignee: 'SK', labels: ['Backend', 'Real-time'] },
    ]
  },
  {
    id: 'review',
    name: 'Review',
    tasks: [
      { id: '6', title: 'Payment flow', description: 'Stripe integration testing', priority: 'URGENT', assignee: 'MR', labels: ['Payment', 'Testing'] },
    ]
  },
  {
    id: 'done',
    name: 'Done',
    tasks: [
      { id: '7', title: 'Auth service', description: 'JWT authentication', priority: 'HIGH', assignee: 'JD', labels: ['Backend', 'Security'] },
      { id: '8', title: 'Dashboard UI', description: 'Main dashboard layout', priority: 'MEDIUM', assignee: 'SK', labels: ['UI'] },
    ]
  }
]

export default function KanbanPage() {
  const [columns, setColumns] = useState(mockColumns)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-500'
      case 'HIGH': return 'bg-orange-500'
      case 'MEDIUM': return 'bg-yellow-500'
      case 'LOW': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Kanban Board</h1>
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                + New Task
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm">
                  JD
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">John Doe</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Board */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map(column => (
            <div key={column.id} className="flex-shrink-0 w-80">
              <div className="bg-gray-200 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900 dark:text-white">{column.name}</h2>
                  <Badge variant="secondary">{column.tasks.length}</Badge>
                </div>
                <div className="space-y-3">
                  {column.tasks.map(task => (
                    <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-sm">{task.title}</CardTitle>
                          <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                          {task.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {task.labels.map(label => (
                            <Badge key={label} variant="outline" className="text-xs">
                              {label}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs">
                            {task.assignee}
                          </div>
                          <span className={`text-xs font-medium ${
                            task.priority === 'URGENT' ? 'text-red-600' :
                            task.priority === 'HIGH' ? 'text-orange-600' :
                            task.priority === 'MEDIUM' ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
