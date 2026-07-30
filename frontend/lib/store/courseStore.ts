import { create } from 'zustand'

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
  thumbnail?: string
}

interface CourseState {
  courses: Course[]
  enrolledCourses: Course[]
  selectedCourse: Course | null
  isLoading: boolean
  error: string | null
  setCourses: (courses: Course[]) => void
  setEnrolledCourses: (courses: Course[]) => void
  setSelectedCourse: (course: Course | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useCourseStore = create<CourseState>((set) => ({
  courses: [],
  enrolledCourses: [],
  selectedCourse: null,
  isLoading: false,
  error: null,
  setCourses: (courses) => set({ courses }),
  setEnrolledCourses: (enrolledCourses) => set({ enrolledCourses }),
  setSelectedCourse: (selectedCourse) => set({ selectedCourse }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}))