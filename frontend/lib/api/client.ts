import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// The refresh token lives in an httpOnly cookie; the backend returns { data: { accessToken } }.
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const isAuthCall = typeof originalRequest?.url === 'string' && originalRequest.url.startsWith('/auth/')

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthCall) {
      originalRequest._retry = true
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true })
        const accessToken: string = response.data.data.accessToken
        const { user, setAuth } = useAuthStore.getState()
        if (user) setAuth(user, accessToken)
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        useAuthStore.getState().logout()
        if (typeof window !== 'undefined') window.location.href = '/login'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
