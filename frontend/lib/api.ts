/**
 * API client for DevForge frontend.
 * All data is fetched from the backend REST API — no hardcoded mock arrays.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

// ─── Courses ────────────────────────────────────────────────────────────────

export interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  rating: number;
  students: number;
  duration: string;
  level: string;
  price: number;
  category: string;
}

export interface CourseDetail extends Course {
  instructorAvatar: string;
  modules: CourseModule[];
  whatYouLearn: string[];
  requirements: string[];
}

export interface CourseModule {
  id: number;
  title: string;
  lessons: CourseLesson[];
}

export interface CourseLesson {
  id: number;
  title: string;
  duration: string;
  type: 'video' | 'article' | 'quiz';
}

export async function getCourses(params?: { category?: string; search?: string }): Promise<Course[]> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== 'All') query.set('category', params.category);
  if (params?.search) query.set('search', params.search);
  const qs = query.toString();
  return apiFetch<Course[]>(`/api/courses${qs ? `?${qs}` : ''}`);
}

export async function getCourse(id: number | string): Promise<CourseDetail> {
  return apiFetch<CourseDetail>(`/api/courses/${id}`);
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardStats {
  enrolledCourses: number;
  completedCourses: number;
  totalHoursLearned: number;
  streak: number;
}

export interface EnrolledCourse {
  id: number;
  title: string;
  progress: number;
  instructor: string;
  lastAccessed: string;
}

export interface DashboardData {
  stats: DashboardStats;
  enrolledCourses: EnrolledCourse[];
  recentActivity: { action: string; course: string; timestamp: string }[];
}

export async function getDashboard(token: string): Promise<DashboardData> {
  return apiFetch<DashboardData>('/api/dashboard', {
    headers: { Authorization: `Bearer ${token}` },
  });
}
