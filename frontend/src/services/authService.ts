import api from './api'
import type { User } from '../types'

export const authService = {
  register: (data: { email: string; username: string; password: string }) =>
    api.post<User>('/auth/register', data).then((r) => r.data),

  login: (data: { username: string; password: string }) =>
    api.post<User>('/auth/login', data).then((r) => r.data),

  logout: () => api.post('/auth/logout'),

  me: () => api.get<User>('/auth/me').then((r) => r.data),
}
