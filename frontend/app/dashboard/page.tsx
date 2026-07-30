'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Progress } from '../../components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar'

interface EnrolledCourse {
  id: number
  title: string
  instructor: string
  progress: number
  totalLessons: number
  completedLessons: number
  thumbnail: string
}

const mockEnrolledCourses: EnrolledCourse[] = [
  {
    id: 1,
    title: 'Complete React Developer',
    instructor: 'John Smith',
    progress: 65,
    totalLessons: 45,
    completedLessons: 29,
    thumbnail: ''
  },
  {
    id: 2,
    title: 'Node.js Masterclass',
    instructor: 'Sarah Johnson',
    progress: 30,
    totalLessons: 38,
    completedLessons: 11,
    thumbnail: ''
  },
  {
    id: 3,
    title: 'TypeScript Fundamentals',
    instructor: 'Mike Wilson',
    progress: 100,
    totalLessons: 28,
    completedLessons: 28,
    thumbnail: ''
  }
]

const mockRecentActivity = [
  { id: 1, action: 'Completed lesson', course: 'React Hooks', time: '2 hours ago' },
  { id: 2, action: 'Started module', course: 'Advanced React', time: '5 hours ago' },
  { id: 3, action: 'Submitted quiz', course: 'React Fundamentals', time: '1 day ago' },
  { id: 4, action: 'Enrolled in course', course: 'Node.js Masterclass', time: '2 days ago' },
]

export default function DashboardPage() {
  const totalCourses = mockEnrolledCourses.length
  const completedCourses = mockEnrolledCourses.filter(c => c.progress === 100).length
  const inProgressCourses = totalCourses - completedCourses
  const totalProgress = Math.round(
    mockEnrolledCourses.reduce((acc, course) => acc + course.progress, 0) / totalCourses
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              DevForge
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/courses" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600">
                Browse Courses
              </Link>
              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Welcome back, John! 👋
        </h1>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Enrolled Courses</CardDescription>
              <CardTitle className="text-3xl">{totalCourses}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>In Progress</CardDescription>
              <CardTitle className="text-3xl">{inProgressCourses}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Completed</CardDescription>
              <CardTitle className="text-3xl">{completedCourses}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Progress</CardDescription>
              <CardTitle className="text-3xl">{totalProgress}%</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Continue Learning */}
            <Card>
              <CardHeader>
                <CardTitle>Continue Learning</CardTitle>
                <CardDescription>Pick up where you left off</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockEnrolledCourses
                    .filter(course => course.progress < 100)
                    .map(course => (
                      <div
                        key={course.id}
                        className="flex items-center gap-4 p-4 rounded-lg border bg-white dark:bg-gray-800"
                      >
                        <div className="w-32 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">📚</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{course.title}</h3>
                          <p className="text-sm text-muted-foreground">{course.instructor}</p>
                          <div className="mt-2">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                              <span>{course.progress}%</span>
                            </div>
                            <Progress value={course.progress} />
                          </div>
                        </div>
                        <Link href={`/courses/${course.id}`}>
                          <Button>Continue</Button>
                        </Link>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* All Enrolled Courses */}
            <Card>
              <CardHeader>
                <CardTitle>My Courses</CardTitle>
                <CardDescription>All your enrolled courses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockEnrolledCourses.map(course => (
                    <div
                      key={course.id}
                      className="flex items-center gap-4 p-4 rounded-lg border bg-white dark:bg-gray-800"
                    >
                      <div className="w-24 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <span className="text-xl">📚</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{course.title}</h3>
                        <p className="text-sm text-muted-foreground">{course.instructor}</p>
                        <div className="mt-1">
                          <Badge variant={course.progress === 100 ? 'default' : 'secondary'}>
                            {course.progress === 100 ? 'Completed' : 'In Progress'}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-indigo-600">{course.progress}%</div>
                        <Progress value={course.progress} className="w-24 mt-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentActivity.map(activity => (
                    <div key={activity.id} className="border-l-2 border-indigo-200 pl-4">
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">{activity.course}</p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>Your latest badges</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-lg p-2">🏆 First Course</Badge>
                  <Badge variant="secondary" className="text-lg p-2">⭐ Top Learner</Badge>
                  <Badge variant="secondary" className="text-lg p-2">🔥 7 Day Streak</Badge>
                  <Badge variant="outline" className="text-lg p-2">🎯 Quiz Master</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}