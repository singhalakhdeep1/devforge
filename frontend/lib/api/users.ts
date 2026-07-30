import apiClient from './client'

export interface UserProfile {
  id: string
  name: string
  email: string
  bio?: string
  location?: string
  website?: string
  github?: string
  linkedin?: string
  skills: string[]
  avatar?: string
  createdAt: string
}

export interface UpdateProfileData {
  name?: string
  bio?: string
  location?: string
  website?: string
  github?: string
  linkedin?: string
  skills?: string[]
}

export const userAPI = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>('/users/profile')
    return response.data
  },

  updateProfile: async (data: UpdateProfileData): Promise<UserProfile> => {
    const response = await apiClient.put<UserProfile>('/users/profile', data)
    return response.data
  },

  uploadAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
    const formData = new FormData()
    formData.append('avatar', file)
    const response = await apiClient.post<{ avatarUrl: string }>('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await apiClient.post('/users/change-password', { oldPassword, newPassword })
  },

  deleteAccount: async (): Promise<void> => {
    await apiClient.delete('/users/account')
  },
}