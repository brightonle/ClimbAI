import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { routesService } from '../services/routesService'
import { gradeBadgeStyle } from '../utils/gradeColors'

export default function RoutesListPage() {
  const queryClient = useQueryClient()
  const { data: routes = [], isLoading } = useQuery({
    queryKey: ['routes'],
    queryFn: routesService.list,
  })

  const del = useMutation({
    mutationFn: routesService.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['routes'] }),
  })

  if (isLoading) {
    return <div className="text-gray-500 text-center py-12">Loading routes…</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Routes</h1>
        <Link to="/routes/new" className="btn-primary">+ New Route</Link>
      </div>

      {routes.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg mb-2">No routes yet</p>
          <Link to="/routes/new" className="text-brand-600 hover:underline">Create your first route →</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {routes.map((route) => (
            <div
              key={route.id}
              className="bg-white border border-gray-200 shadow-sm rounded-xl px-5 py-4 flex items-center gap-4"
            >
              <div className="flex-1 min-w-0">
                <Link
                  to={`/routes/${route.id}`}
                  className="text-gray-900 font-medium hover:text-brand-600 transition-colors truncate block"
                >
                  {route.name}
                </Link>
                <div className="flex gap-3 mt-1 text-xs text-gray-500 items-center">
                  {route.difficulty_grade && (
                    <span
                      className="px-2 py-0.5 rounded font-mono"
                      style={gradeBadgeStyle(route.difficulty_grade)}
                    >
                      {route.difficulty_grade}
                    </span>
                  )}
                  {route.wall_angle != null && <span>{route.wall_angle}°</span>}
                  <span>{new Date(route.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/routes/${route.id}`}
                  className="text-xs text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5 bg-gray-100 rounded-lg"
                >
                  View
                </Link>
                <button
                  onClick={() => {
                    if (confirm('Delete this route?')) del.mutate(route.id)
                  }}
                  className="text-xs text-red-500 hover:text-red-600 transition-colors px-3 py-1.5 bg-gray-100 rounded-lg"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
