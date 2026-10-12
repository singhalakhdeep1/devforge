import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '../store/authStore'
import type { User } from './types'

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
/** Origin that serves uploaded files (avatars), e.g. http://localhost:5000 */
export const FILES_URL = API_URL.replace(/\/api\/?$/, '')

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // sends the httpOnly refresh cookie
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// One refresh at a time: parallel 401s all wait for the same request, because the
// server rotates the refresh token and a second concurrent call would be treated as token theft.
let refreshing: Promise<string> | null = null

export function refreshSession(): Promise<string> {
  refreshing ??= axios
    .post<{ user: User; accessToken: string }>(`${API_URL}/auth/refresh`, {}, { withCredentials: true })
    .then(({ data }) => {
      useAuthStore.getState().setAuth(data.user, data.accessToken)
      return data.accessToken
    })
    .finally(() => {
      refreshing = null
    })
  return refreshing
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined
    const url = original?.url ?? ''
    const isAuthCall = url.startsWith('/auth/login') || url.startsWith('/auth/register') || url.startsWith('/auth/refresh')

    if (error.response?.status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true
      try {
        const token = await refreshSession()
        original.headers.Authorization = `Bearer ${token}`
        return apiClient(original)
      } catch {
        useAuthStore.getState().clear()
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`
        }
      }
    }
    return Promise.reject(error)
  }
)

/** Best human-readable message from an API failure. */
export function apiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: string } | undefined
    if (data?.error) return data.error
    if (!error.response) return 'Cannot reach the server. Check your connection and try again.'
  }
  return fallback
}

export default apiClient
