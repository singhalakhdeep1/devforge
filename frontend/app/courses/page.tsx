'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'

interface Course {
  id: number
  title: string
  description: string
  instructor: string
  rating: number
  students: number
  duration: string
  level: string
  price: number
  category: string
}

const mockCourses: Course[] = [
  {
    id: 1,
    title: 'Complete React Developer',
    description: 'Learn React from scratch and build production-ready applications',
    instructor: 'John Smith',
    rating: 4.8,
    students: 12500,
    duration: '40 hours',
    level: 'Beginner',
    price: 99,
    category: 'Frontend'
  },
  {
    id: 2,
    title: 'Node.js Masterclass',
    description: 'Build scalable backend applications with Node.js and Express',
    instructor: 'Sarah Johnson',
    rating: 4.9,
    students: 8700,
    duration: '35 hours',
    level: 'Intermediate',
    price: 89,
    category: 'Backend'
  },
  {
    id: 3,
    title: 'TypeScript Fundamentals',
    description: 'Master TypeScript and write type-safe JavaScript code',
    instructor: 'Mike Wilson',
    rating: 4.7,
    students: 6200,
    duration: '25 hours',
    level: 'Beginner',
    price: 79,
    category: 'Languages'
  },
  {
    id: 4,
    title: 'Advanced Database Design',
    description: 'Learn database architecture, optimization, and scaling',
    instructor: 'Emily Davis',
    rating: 4.8,
    students: 4500,
    duration: '30 hours',
    level: 'Advanced',
    price: 109,
    category: 'Database'
  },
  {
    id: 5,
    title: 'DevOps with Docker & Kubernetes',
    description: 'Containerize and orchestrate applications like a pro',
    instructor: 'Chris Brown',
    rating: 4.9,
    students: 7800,
    duration: '45 hours',
    level: 'Intermediate',
    price: 119,
    category: 'DevOps'
  },
  {
    id: 6,
    title: 'Full-Stack JavaScript',
    description: 'Build complete web applications from frontend to backend',
    instructor: 'Alex Turner',
    rating: 4.6,
    students: 15200,
    duration: '50 hours',
    level: 'Intermediate',
    price: 129,
    category: 'Full-Stack'
  }
]

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const categories = ['All', 'Frontend', 'Backend', 'Languages', 'Database', 'DevOps', 'Full-Stack']

  const filteredCourses = mockCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              DevForge
            </Link>
            <div className="flex gap-4">
              <Link href="/login" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600">
                Login
              </Link>
              <Link href="/signup" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Explore Courses</h1>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <Input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
          <div className="flex gap-2 flex-wrap">
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
                size="sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="secondary">{course.category}</Badge>
                  <Badge variant="outline">{course.level}</Badge>
                </div>
                <CardTitle className="text-xl">{course.title}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Instructor: {course.instructor}</span>
                    <span className="flex items-center">⭐ {course.rating}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>👥 {course.students.toLocaleString()} students</span>
                    <span>⏱️ {course.duration}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <div className="text-2xl font-bold text-indigo-600">${course.price}</div>
                <Link href={`/courses/${course.id}`}>
                  <Button>View Course</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No courses found matching your criteria.
          </div>
        )}
      </div>
    </div>
  )
}