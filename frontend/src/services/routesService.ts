import api from './api'
import type { Route, RouteDetail } from '../types'

interface HoldInSequence {
  hold_id: number
  position_in_route: number
  foot_restriction: boolean
}

interface RouteCreatePayload {
  name: string
  difficulty_grade?: string
  wall_angle?: number
  description?: string
  wall_id?: number
  holds: HoldInSequence[]
}

export const routesService = {
  list: () => api.get<Route[]>('/routes').then((r) => r.data),

  get: (id: number) => api.get<RouteDetail>(`/routes/${id}`).then((r) => r.data),

  create: (data: RouteCreatePayload) => api.post<RouteDetail>('/routes', data).then((r) => r.data),

  delete: (id: number) => api.delete(`/routes/${id}`),
}
