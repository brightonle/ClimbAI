import api from './api'
import type { Attempt, AttemptStats } from '../types'

interface AttemptCreatePayload {
  route_id: number
  success: boolean
  notes?: string
  duration_seconds?: number
}

export const attemptsService = {
  list: () => api.get<Attempt[]>('/attempts').then((r) => r.data),

  log: (data: AttemptCreatePayload) => api.post<Attempt>('/attempts', data).then((r) => r.data),

  stats: () => api.get<AttemptStats>('/attempts/stats').then((r) => r.data),
}
