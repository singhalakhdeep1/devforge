import apiClient from './client'
import type {
  AppNotification,
  Certificate,
  CourseDetail,
  CourseSummary,
  Dashboard,
  Discussion,
  DiscussionAnswer,
  EditorCourse,
  EditorLesson,
  EditorModule,
  EditorQuestion,
  ExecuteResult,
  InstructorCourse,
  LearnOutline,
  LessonType,
  LessonView,
  Level,
  MyCourse,
  Paged,
  Progress,
  QuizResult,
  Review,
  Snippet,
  StudentRow,
  User,
} from './types'

export { default as apiClient } from './client'
export { apiErrorMessage } from './client'
export * from './types'

const get = async <T>(url: string, params?: object) => (await apiClient.get<T>(url, { params })).data
const post = async <T>(url: string, body?: object) => (await apiClient.post<T>(url, body)).data
const put = async <T>(url: string, body?: object) => (await apiClient.put<T>(url, body)).data
const del = async <T = { message: string }>(url: string, body?: object) => (await apiClient.delete<T>(url, { data: body })).data

// ---------- Auth ----------
export const authApi = {
  login: (body: { email: string; password: string }) => post<{ user: User; accessToken: string }>('/auth/login', body),
  register: (body: { name: string; email: string; password: string; role: 'STUDENT' | 'INSTRUCTOR' }) =>
    post<{ user: User; accessToken: string }>('/auth/register', body),
  logout: () => post('/auth/logout'),
  me: () => get<User>('/auth/me'),
  verify: (token: string) => post('/auth/verify', { token }),
  resendVerification: () => post('/auth/resend-verification'),
  forgotPassword: (email: string) => post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => post('/auth/reset-password', { token, password }),
}

// ---------- Users ----------
export interface ProfileInput {
  name: string
  bio: string
  location: string
  skills: string[]
  githubUrl: string
  linkedinUrl: string
  portfolioUrl: string
}
export const userApi = {
  profile: () => get<User>('/users/profile'),
  update: (body: Partial<ProfileInput>) => put<User>('/users/profile', body),
  uploadAvatar: async (file: File) => {
    const form = new FormData()
    form.append('avatar', file)
    return (await apiClient.post<{ avatar: string }>('/users/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } })).data
  },
  changePassword: (currentPassword: string, newPassword: string) => post('/users/change-password', { currentPassword, newPassword }),
  deleteAccount: (password: string) => del('/users/account', { password }),
}

// ---------- Catalog ----------
export interface CourseQuery {
  search?: string
  category?: string
  level?: Level | ''
  sort?: 'newest' | 'popular' | 'price_asc' | 'price_desc'
  page?: number
  pageSize?: number
}
export const courseApi = {
  list: (params: CourseQuery) => get<Paged<CourseSummary>>('/courses', { ...params, level: params.level || undefined }),
  categories: () => get<{ name: string; count: number }[]>('/courses/categories'),
  get: (id: number | string) => get<CourseDetail>(`/courses/${id}`),
  enroll: (id: number) => post<{ enrolled: boolean }>(`/courses/${id}/enroll`),
  leave: (id: number) => del(`/courses/${id}/enroll`),
  reviews: (id: number) => get<Review[]>(`/courses/${id}/reviews`),
  review: (id: number, rating: number, comment: string) => post(`/courses/${id}/reviews`, { rating, comment }),
}

// ---------- Learning ----------
export const learnApi = {
  myCourses: () => get<MyCourse[]>('/learn/my-courses'),
  outline: (courseId: number | string) => get<LearnOutline>(`/learn/courses/${courseId}`),
  lesson: (lessonId: number | string) => get<LessonView>(`/learn/lessons/${lessonId}`),
  complete: (lessonId: number) => post<Progress & { certificateId: string | null }>(`/learn/lessons/${lessonId}/complete`),
  uncomplete: (lessonId: number) => del(`/learn/lessons/${lessonId}/complete`),
  submitQuiz: (lessonId: number, answers: number[]) => post<QuizResult>(`/learn/lessons/${lessonId}/quiz`, { answers }),
}

export const dashboardApi = { get: () => get<Dashboard>('/dashboard') }

// ---------- Community ----------
export const discussionApi = {
  list: (courseId: number, lessonId?: number) => get<Discussion[]>(`/discussions/course/${courseId}`, { lessonId }),
  create: (body: { courseId: number; lessonId?: number; title: string; content: string }) => post<Discussion>('/discussions', body),
  answer: (id: number, content: string) => post<DiscussionAnswer>(`/discussions/${id}/answers`, { content }),
  vote: (answerId: number) => post<{ voted: boolean; upvotes: number }>(`/discussions/answers/${answerId}/vote`),
  accept: (answerId: number) => post<{ accepted: boolean }>(`/discussions/answers/${answerId}/accept`),
  remove: (id: number) => del(`/discussions/${id}`),
}

export const notificationApi = {
  list: () => get<{ items: AppNotification[]; unread: number }>('/notifications'),
  read: (id: number) => post(`/notifications/${id}/read`),
  readAll: () => post('/notifications/read-all'),
  remove: (id: number) => del(`/notifications/${id}`),
}

export const certificateApi = {
  mine: () => get<Certificate[]>('/certificates'),
  get: (id: string) => get<Certificate>(`/certificates/${id}`),
}

// ---------- Editor ----------
export const editorApi = {
  runtimes: () => get<{ serverExecution: boolean; languages: string[] }>('/editor/runtimes'),
  execute: (language: string, code: string, stdin = '') => post<ExecuteResult>('/editor/execute', { language, code, stdin }),
  snippets: () => get<Snippet[]>('/editor/snippets'),
  saveSnippet: (body: { title: string; code: string; language: string; description?: string }) => post<Snippet>('/editor/snippets', body),
  updateSnippet: (id: number, body: Partial<{ title: string; code: string; language: string; description: string }>) => put<Snippet>(`/editor/snippets/${id}`, body),
  deleteSnippet: (id: number) => del(`/editor/snippets/${id}`),
}

// ---------- Payments ----------
export const paymentApi = {
  checkout: (courseId: number) => post<{ url: string }>('/payments/checkout', { courseId }),
  confirm: (sessionId: string) => post<{ paid: boolean; courseId: number }>('/payments/confirm', { sessionId }),
}

// ---------- Instructor studio ----------
export interface CourseInput {
  title: string
  description: string
  category: string
  level: Level
  price: number
  thumbnailUrl?: string
}
export interface LessonInput {
  title: string
  type: LessonType
  content: string
  videoUrl: string
  durationMin: number
}
export const instructorApi = {
  courses: () => get<InstructorCourse[]>('/instructor/courses'),
  course: (id: number | string) => get<EditorCourse>(`/instructor/courses/${id}`),
  createCourse: (body: CourseInput) => post<EditorCourse>('/instructor/courses', body),
  updateCourse: (id: number, body: Partial<CourseInput>) => put<EditorCourse>(`/instructor/courses/${id}`, body),
  deleteCourse: (id: number) => del(`/instructor/courses/${id}`),
  publish: (id: number, published: boolean) => post<{ id: number; published: boolean }>(`/instructor/courses/${id}/publish`, { published }),
  students: (id: number) => get<StudentRow[]>(`/instructor/courses/${id}/students`),
  addModule: (courseId: number, title: string) => post<EditorModule>(`/instructor/courses/${courseId}/modules`, { title }),
  renameModule: (id: number, title: string) => put(`/instructor/modules/${id}`, { title }),
  deleteModule: (id: number) => del(`/instructor/modules/${id}`),
  addLesson: (moduleId: number, body: Partial<LessonInput>) => post<EditorLesson>(`/instructor/modules/${moduleId}/lessons`, body),
  updateLesson: (id: number, body: Partial<LessonInput>) => put<EditorLesson>(`/instructor/lessons/${id}`, body),
  deleteLesson: (id: number) => del(`/instructor/lessons/${id}`),
  saveQuestions: (lessonId: number, questions: EditorQuestion[]) => put<EditorQuestion[]>(`/instructor/lessons/${lessonId}/questions`, { questions }),
  saveOrder: (courseId: number, modules: { id: number; lessonIds: number[] }[]) => put(`/instructor/courses/${courseId}/order`, { modules }),
}
