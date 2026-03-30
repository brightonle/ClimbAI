export interface Hold {
  id: number
  wall_id: number | null
  board_type: string | null
  x: number
  y: number
  depth: string | null
  size: string | null
  hold_type: string | null
  function: string | null
  orientation: string | null
}

export interface Profile {
  id: number
  user_id: number
  gender: string | null
  height_cm: number | null
  weight_kg: number | null
  wingspan_cm: number | null
  ape_index: number | null
  num_pull_ups: number | null
  num_chin_ups: number | null
  num_push_ups: number | null
  climbing_style: string | null
  fav_disciplines: string[] | null
  fav_wall_types: string[] | null
}

export interface User {
  id: number
  email: string
  username: string
  is_active: boolean
  created_at: string
  profile: Profile | null
}

export interface RouteHold {
  id: number
  hold_id: number
  position_in_route: number
  foot_restriction: boolean
  hold: Hold
}

export interface Route {
  id: number
  user_id: number
  wall_id: number | null
  name: string
  difficulty_grade: string | null
  wall_angle: number | null
  description: string | null
  created_at: string
}

export interface RouteDetail extends Route {
  route_holds: RouteHold[]
}

export interface Attempt {
  id: number
  user_id: number
  route_id: number
  success: boolean
  notes: string | null
  duration_seconds: number | null
  attempted_at: string
}

export interface GradeStat {
  grade: string
  attempts: number
  sends: number
}

export interface WeeklyStat {
  week: string
  rate: number
  attempts: number
}

export interface TopRoute {
  route_id: number
  route_name: string
  attempts: number
  sends: number
}

export interface AttemptStats {
  grade_pyramid: GradeStat[]
  success_rate_over_time: WeeklyStat[]
  top_routes: TopRoute[]
  total_attempts: number
  total_sends: number
}

// Canvas hold with selection state
export type HoldRole = 'start' | 'middle' | 'foot' | 'finish'

export interface SelectedHold {
  hold: Hold
  position: number
  role: HoldRole
  foot_restriction: boolean
}
