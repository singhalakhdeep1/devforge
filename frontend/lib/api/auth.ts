import apiClient from './client'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  user: {
    id: string
    name: string
    email: string
    role: string
  }
}

// Backend wraps payloads as { success, data }.
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<{ data: AuthResponse }>('/auth/login', credentials)
    return response.data.data
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<{ data: AuthResponse }>('/auth/register', data)
    return response.data.data
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
  },

  refreshToken: async (): Promise<{ accessToken: string }> => {
    const response = await apiClient.post<{ data: { accessToken: string } }>('/auth/refresh')
    return response.data.data
  },

  getMe: async () => {
    const response = await apiClient.get('/auth/me')
    return response.data
  },

  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post('/auth/forgot-password', { email })
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    await apiClient.post(`/auth/reset-password/${token}`, { password })
  },

  verifyEmail: async (token: string): Promise<void> => {
    await apiClient.get(`/auth/verify/${token}`)
  },
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
  return message || fallback
}
