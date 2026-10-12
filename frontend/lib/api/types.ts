export type Role = 'STUDENT' | 'INSTRUCTOR' | 'ADMIN'
export type Level = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
export type LessonType = 'ARTICLE' | 'VIDEO' | 'QUIZ' | 'EXERCISE'

export interface User {
  id: string
  email: string
  name: string
  avatar: string | null
  role: Role
  bio: string | null
  location: string | null
  skills: string[]
  githubUrl: string | null
  linkedinUrl: string | null
  portfolioUrl: string | null
  isVerified: boolean
  createdAt: string
}

export interface CourseSummary {
  id: number
  title: string
  description: string
  category: string
  level: Level
  price: number
  published: boolean
  thumbnailUrl: string | null
  instructor: { id: string; name: string; avatar: string | null }
  students: number
  lessonCount: number
  totalMinutes: number
  rating: number
  ratingCount: number
  createdAt: string
}

export interface Paged<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface OutlineLesson {
  id: number
  title: string
  type: LessonType
  durationMin: number
  position?: number
}

export interface OutlineModule {
  id: number
  title: string
  position?: number
  lessons: OutlineLesson[]
}

export interface Progress {
  totalLessons: number
  completedLessons: number
  percent: number
  completedLessonIds: number[]
  nextLessonId: number | null
}

export interface CourseDetail extends Omit<CourseSummary, 'instructor'> {
  instructor: { id: string; name: string; avatar: string | null; bio: string | null }
  modules: OutlineModule[]
  isOwner: boolean
  enrollment: { enrolled: boolean; completed: boolean; progress?: Progress }
}

export interface Review {
  id: number
  rating: number
  comment: string
  createdAt: string
  user: { id: string; name: string; avatar: string | null }
}

export interface LearnOutline {
  id: number
  title: string
  preview: boolean
  modules: OutlineModule[]
  progress: Progress
}

export interface QuizQuestionPublic {
  id: number
  question: string
  options: string[]
}

export interface LessonView {
  id: number
  title: string
  type: LessonType
  content: string
  videoUrl: string | null
  durationMin: number
  module: { id: number; title: string; courseId: number }
  questions: QuizQuestionPublic[]
  completed: boolean
  lastAttempt: { score: number; passed: boolean; submittedAt: string } | null
  passPercent: number
  prevLessonId: number | null
  nextLessonId: number | null
}

export interface QuizResult {
  score: number
  passed: boolean
  passPercent: number
  correctAnswers: number
  totalQuestions: number
  review: { questionId: number; selected: number; correct: boolean; correctAnswer: number; explanation: string | null }[]
  progress: (Progress & { certificateId: string | null }) | null
}

export interface MyCourse {
  courseId: number
  title: string
  category: string
  level: Level
  instructor: { id: string; name: string }
  enrolledAt: string
  lastAccessAt: string
  completedAt: string | null
  progress: number
  completedLessons: number
  totalLessons: number
  nextLessonId: number | null
}

export interface Dashboard {
  stats: {
    enrolledCourses: number
    completedCourses: number
    lessonsCompleted: number
    hoursLearned: number
    streak: number
    certificates: number
  }
  courses: {
    id: number
    title: string
    category: string
    instructor: string
    progress: number
    completedLessons: number
    totalLessons: number
    nextLessonId: number | null
    lastAccessed: string
    completed: boolean
  }[]
  activity: { action: string; course: string; courseId: number; timestamp: string }[]
}

export interface Author {
  id: string
  name: string
  avatar: string | null
  role: Role
}

export interface DiscussionAnswer {
  id: number
  content: string
  accepted: boolean
  upvotes: number
  voted: boolean
  createdAt: string
  user: Author
}

export interface Discussion {
  id: number
  courseId: number
  lessonId: number | null
  title: string
  content: string
  createdAt: string
  user: Author
  lesson: { id: number; title: string } | null
  answers: DiscussionAnswer[]
}

export interface AppNotification {
  id: number
  type: string
  title: string
  body: string
  link: string | null
  readAt: string | null
  createdAt: string
}

export interface Certificate {
  id: string
  issuedAt: string
  studentName: string
  courseId: number
  courseTitle: string
  instructorName: string
}

export interface Snippet {
  id: number
  title: string
  code: string
  language: string
  description: string
  createdAt: string
  updatedAt: string
}

export interface ExecuteResult {
  output: string
  stderr: string
  exitCode: number | null
  success: boolean
  timedOut: boolean
  executionTimeMs: number
  runtime: string
}

// ----- Instructor studio -----
export interface EditorQuestion {
  id?: number
  question: string
  options: string[]
  correctAnswer: number
  explanation?: string | null
}

export interface EditorLesson {
  id: number
  moduleId: number
  title: string
  type: LessonType
  content: string
  videoUrl: string | null
  durationMin: number
  position: number
  questions: EditorQuestion[]
}

export interface EditorModule {
  id: number
  title: string
  position: number
  lessons: EditorLesson[]
}

export interface EditorCourse {
  id: number
  title: string
  description: string
  category: string
  level: Level
  price: number
  published: boolean
  thumbnailUrl: string | null
  modules: EditorModule[]
}

export interface InstructorCourse {
  id: number
  title: string
  category: string
  level: Level
  price: number
  published: boolean
  lessonCount: number
  students: number
  completions: number
  revenue: number
  rating: number
  ratingCount: number
  updatedAt: string
}

export interface StudentRow {
  user: { id: string; name: string; email: string; avatar: string | null }
  enrolledAt: string
  completedAt: string | null
  progress: number
}
