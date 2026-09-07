'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar'
import { getCourse, type CourseDetail } from '../../../lib/api'

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState('curriculum')
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [course, setCourse] = useState<CourseDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getCourse(params.id)
      .then(setCourse)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading course…</div>
  }
  if (error || !course) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">Failed to load course: {error}</div>
  }

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              DevForge
            </Link>
            <Link href="/courses" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600">
              Back to Courses
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Course Header */}
        <div className="mb-8">
          <Badge variant="secondary" className="mb-4">{course.category}</Badge>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{course.title}</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">{course.description}</p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center">⭐ {course.rating} rating</span>
            <span>👥 {course.students.toLocaleString()} students</span>
            <span>⏱️ {course.duration}</span>
            <Badge variant="outline">{course.level}</Badge>
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

            {activeTab === 'curriculum' && (
              <div className="space-y-4">
                {course.modules.map((module, moduleIndex) => (
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
                              <span className="text-sm text-muted-foreground">{lessonIndex + 1}.</span>
                              <span className="font-medium">{lesson.title}</span>
                              <Badge variant="outline" className="text-xs">{lesson.type}</Badge>
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
                  <CardHeader><CardTitle>What you&apos;ll learn</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {course.whatYouLearn.map((item, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-500">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Requirements</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {course.requirements.map((req, index) => (
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
                      <AvatarImage src={course.instructorAvatar} />
                      <AvatarFallback>{course.instructor.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold">{course.instructor}</h3>
                      <p className="text-muted-foreground">Senior Developer</p>
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
                <CardTitle className="text-3xl">${course.price}</CardTitle>
                <CardDescription>Lifetime access</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!isEnrolled ? (
                  <Button onClick={() => setIsEnrolled(true)} className="w-full" size="lg">
                    Enroll Now
                  </Button>
                ) : (
                  <Button className="w-full" size="lg" disabled>✓ Enrolled</Button>
                )}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lessons</span>
                    <span>{totalLessons}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Level</span>
                    <span>{course.level}</span>
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