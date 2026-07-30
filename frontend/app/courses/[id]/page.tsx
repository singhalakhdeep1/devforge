'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Progress } from '../../../components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar'

interface Module {
  id: number
  title: string
  lessons: Lesson[]
}

interface Lesson {
  id: number
  title: string
  duration: string
  type: 'video' | 'article' | 'quiz'
}

interface CourseDetail {
  id: number
  title: string
  description: string
  instructor: string
  instructorAvatar: string
  rating: number
  students: number
  duration: string
  level: string
  price: number
  category: string
  modules: Module[]
  whatYouLearn: string[]
  requirements: string[]
}

const mockCourseDetail: CourseDetail = {
  id: 1,
  title: 'Complete React Developer',
  description: 'Master React from fundamentals to advanced concepts. Build production-ready applications with modern React practices including hooks, context, Redux, and more.',
  instructor: 'John Smith',
  instructorAvatar: '',
  rating: 4.8,
  students: 12500,
  duration: '40 hours',
  level: 'Beginner',
  price: 99,
  category: 'Frontend',
  modules: [
    {
      id: 1,
      title: 'Getting Started with React',
      lessons: [
        { id: 1, title: 'Introduction to React', duration: '15 min', type: 'video' },
        { id: 2, title: 'Setting Up Development Environment', duration: '20 min', type: 'video' },
        { id: 3, title: 'Your First React Component', duration: '25 min', type: 'video' },
      ]
    },
    {
      id: 2,
      title: 'React Fundamentals',
      lessons: [
        { id: 4, title: 'JSX and Components', duration: '30 min', type: 'video' },
        { id: 5, title: 'Props and State', duration: '35 min', type: 'video' },
        { id: 6, title: 'Event Handling', duration: '25 min', type: 'video' },
        { id: 7, title: 'Quiz: React Fundamentals', duration: '15 min', type: 'quiz' },
      ]
    },
    {
      id: 3,
      title: 'React Hooks',
      lessons: [
        { id: 8, title: 'Introduction to Hooks', duration: '20 min', type: 'video' },
        { id: 9, title: 'useState and useEffect', duration: '40 min', type: 'video' },
        { id: 10, title: 'Custom Hooks', duration: '30 min', type: 'video' },
      ]
    },
    {
      id: 4,
      title: 'Advanced React',
      lessons: [
        { id: 11, title: 'Context API', duration: '35 min', type: 'video' },
        { id: 12, title: 'React Router', duration: '40 min', type: 'video' },
        { id: 13, title: 'State Management with Redux', duration: '45 min', type: 'video' },
      ]
    }
  ],
  whatYouLearn: [
    'Build modern web applications with React',
    'Understand React hooks and their use cases',
    'Implement state management with Redux',
    'Create reusable components',
    'Deploy React applications to production',
    'Write clean and maintainable React code'
  ],
  requirements: [
    'Basic knowledge of HTML, CSS, and JavaScript',
    'Understanding of ES6+ features',
    'Familiarity with npm and command line'
  ]
}

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState('curriculum')
  const [isEnrolled, setIsEnrolled] = useState(false)

  const handleEnroll = () => {
    setIsEnrolled(true)
  }

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
              <Link href="/courses" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600">
                Back to Courses
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Course Header */}
        <div className="mb-8">
          <Badge variant="secondary" className="mb-4">{mockCourseDetail.category}</Badge>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {mockCourseDetail.title}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
            {mockCourseDetail.description}
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center">⭐ {mockCourseDetail.rating} rating</span>
            <span>👥 {mockCourseDetail.students.toLocaleString()} students</span>
            <span>⏱️ {mockCourseDetail.duration}</span>
            <Badge variant="outline">{mockCourseDetail.level}</Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="flex gap-2 border-b">
              {['curriculum', 'overview', 'instructor'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 font-medium capitalize ${
                    activeTab === tab
                      ? 'border-b-2 border-indigo-600 text-indigo-600'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'curriculum' && (
              <div className="space-y-4">
                {mockCourseDetail.modules.map((module, moduleIndex) => (
                  <Card key={module.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Module {moduleIndex + 1}: {module.title}
                      </CardTitle>
                      <CardDescription>{module.lessons.length} lessons</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-muted-foreground">
                                {lessonIndex + 1}.
                              </span>
                              <span className="font-medium">{lesson.title}</span>
                              <Badge variant="outline" className="text-xs">
                                {lesson.type}
                              </Badge>
                            </div>
                            <span className="text-sm text-muted-foreground">{lesson.duration}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {activeTab === 'overview' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>What you'll learn</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {mockCourseDetail.whatYouLearn.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-500">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {mockCourseDetail.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-indigo-500">•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'instructor' && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={mockCourseDetail.instructorAvatar} />
                      <AvatarFallback>{mockCourseDetail.instructor.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold">{mockCourseDetail.instructor}</h3>
                      <p className="text-muted-foreground">Senior React Developer</p>
                      <p className="mt-2 text-sm">
                        Expert React developer with 10+ years of experience building web applications.
                        Passionate about teaching and helping developers level up their skills.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-3xl">${mockCourseDetail.price}</CardTitle>
                <CardDescription>Lifetime access</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isEnrolled ? (
                  <Button onClick={handleEnroll} className="w-full" size="lg">
                    Enroll Now
                  </Button>
                ) : (
                  <Button className="w-full" size="lg" disabled>
                    ✓ Enrolled
                  </Button>
                )}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span>{mockCourseDetail.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lessons</span>
                    <span>{mockCourseDetail.modules.reduce((acc, m) => acc + m.lessons.length, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Level</span>
                    <span>{mockCourseDetail.level}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}