import api from './api'
import type { Hold } from '../types'

export const holdsService = {
  list: (params?: { board_type?: string; wall_id?: number }) =>
    api.get<Hold[]>('/holds', { params }).then((r) => r.data),

  nearest: (x: number, y: number, board_type = 'kilter') =>
    api.post<Hold>('/holds/nearest', { x, y, board_type }).then((r) => r.data),
}
