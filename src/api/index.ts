import { apiClient } from './client';
import { User } from '@/types';

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<{ token: string; user: User }>('/auth/login', { email, password }),

  signup: (email: string, password: string, name: string) =>
    apiClient.post<{ token: string; user: User }>('/auth/signup', {
      email,
      password,
      name,
    }),

  logout: () => apiClient.post('/auth/logout'),

  getCurrentUser: () => apiClient.get<User>('/auth/me'),

  refreshToken: () => apiClient.post<{ token: string }>('/auth/refresh'),
};

export const userApi = {
  getProfile: () => apiClient.get<User>('/users/profile'),

  updateProfile: (data: Partial<User>) => apiClient.put<User>('/users/profile', data),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiClient.post('/users/change-password', { currentPassword, newPassword }),
};
