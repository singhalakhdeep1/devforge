import apiClient from './client'

export interface Course {
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
  thumbnail?: string
}

export interface CourseDetail extends Course {
  modules: Module[]
  whatYouLearn: string[]
  requirements: string[]
}

export interface Module {
  id: number
  title: string
  lessons: Lesson[]
}

export interface Lesson {
  id: number
  title: string
  duration: string
  type: 'video' | 'article' | 'quiz'
  content?: string
  videoUrl?: string
}

export const courseAPI = {
  getAll: async (params?: { category?: string; level?: string; search?: string }): Promise<Course[]> => {
    const response = await apiClient.get<Course[]>('/courses', { params })
    return response.data
  },

  getById: async (id: number): Promise<CourseDetail> => {
    const response = await apiClient.get<CourseDetail>(`/courses/${id}`)
    return response.data
  },

  enroll: async (courseId: number): Promise<void> => {
    await apiClient.post(`/courses/${courseId}/enroll`)
  },

  getEnrolled: async (): Promise<Course[]> => {
    const response = await apiClient.get<Course[]>('/courses/enrolled')
    return response.data
  },

  getProgress: async (courseId: number): Promise<{ progress: number; completedLessons: number }> => {
    const response = await apiClient.get(`/courses/${courseId}/progress`)
    return response.data
  },

  updateProgress: async (courseId: number, lessonId: number): Promise<void> => {
    await apiClient.post(`/courses/${courseId}/progress`, { lessonId })
  },
}