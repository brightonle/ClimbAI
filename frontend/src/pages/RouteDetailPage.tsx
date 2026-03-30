import { useQuery } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { routesService } from '../services/routesService'
import { attemptsService } from '../services/attemptsService'
import type { Route } from '../types'
import AttemptLogger from '../components/AttemptLogger'

export default function RouteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const routeId = Number(id)

  const { data: route, isLoading } = useQuery({
    queryKey: ['route', routeId],
    queryFn: () => routesService.get(routeId),
  })

  const { data: attempts = [] } = useQuery({
    queryKey: ['attempts'],
    queryFn: attemptsService.list,
  })

  const { data: similar = [] } = useQuery({
    queryKey: ['routes', routeId, 'similar'],
    queryFn: () => routesService.similar(routeId),
    enabled: !!routeId,
  })

  const routeAttempts = attempts.filter((a) => a.route_id === routeId)
  const sends = routeAttempts.filter((a) => a.success).length
  const sendRate = routeAttempts.length ? Math.round((sends / routeAttempts.length) * 100) : null

  if (isLoading) return <div className="text-gray-500 text-center py-12">Loading…</div>
  if (!route) return <div className="text-gray-500 text-center py-12">Route not found</div>

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/routes" className="text-gray-500 hover:text-gray-300 text-sm">← Routes</Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gray-900 rounded-xl p-5">
            <h1 className="text-2xl font-bold text-gray-100">{route.name}</h1>
            <div className="flex flex-wrap gap-3 mt-2">
              {route.difficulty_grade && (
                <span className="bg-gray-800 px-3 py-1 rounded-full font-mono text-sm text-brand-400">
                  {route.difficulty_grade}
                </span>
              )}
              {route.wall_angle != null && (
                <span className="bg-gray-800 px-3 py-1 rounded-full text-sm text-gray-400">
                  {route.wall_angle}°
                </span>
              )}
            </div>
            {route.description && (
              <p className="text-gray-400 text-sm mt-3">{route.description}</p>
            )}
          </div>

          {/* Attempt stats */}
          {routeAttempts.length > 0 && (
            <div className="bg-gray-900 rounded-xl p-5 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-100">{routeAttempts.length}</div>
                <div className="text-xs text-gray-500 mt-0.5">Attempts</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-brand-500">{sends}</div>
                <div className="text-xs text-gray-500 mt-0.5">Sends</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-100">{sendRate}%</div>
                <div className="text-xs text-gray-500 mt-0.5">Send rate</div>
              </div>
            </div>
          )}

          {/* Hold sequence */}
          <div className="bg-gray-900 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">
              Hold Sequence ({route.route_holds.length} holds)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {route.route_holds.map((rh) => (
                <div key={rh.id} className="bg-gray-800 rounded-lg px-3 py-2 flex items-center gap-2 text-sm">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
                    rh.position_in_route === 1 ? 'bg-brand-600' :
                    rh.position_in_route === route.route_holds.length ? 'bg-amber-600' : 'bg-blue-700'
                  }`}>
                    {rh.position_in_route}
                  </span>
                  <div className="min-w-0">
                    <div className="text-gray-300 truncate">{rh.hold.hold_type || 'Hold'}</div>
                    {rh.hold.function && (
                      <div className="text-gray-500 text-xs">{rh.hold.function}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Attempt history */}
          {routeAttempts.length > 0 && (
            <div className="bg-gray-900 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">History</h2>
              <div className="space-y-2">
                {routeAttempts.slice(0, 20).map((a) => (
                  <div key={a.id} className="flex items-center gap-3 text-sm">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${a.success ? 'bg-brand-500' : 'bg-red-500'}`} />
                    <span className={a.success ? 'text-brand-400' : 'text-red-400'}>
                      {a.success ? 'Send' : 'Fell'}
                    </span>
                    {a.duration_seconds && <span className="text-gray-500">{a.duration_seconds}s</span>}
                    {a.notes && <span className="text-gray-500 truncate">{a.notes}</span>}
                    <span className="text-gray-600 ml-auto flex-shrink-0">
                      {new Date(a.attempted_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <AttemptLogger routeId={routeId} />
          {similar.length > 0 && (
            <div className="bg-gray-900 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">
                Similar Routes
              </h2>
              <div className="space-y-2">
                {similar.map((r: Route) => (
                  <Link
                    key={r.id}
                    to={`/routes/${r.id}`}
                    className="flex items-center gap-3 bg-gray-800 rounded-lg px-3 py-2 hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-gray-100 text-sm font-medium flex-1 truncate">{r.name}</span>
                    {r.difficulty_grade && (
                      <span className="text-xs bg-gray-700 px-2 py-0.5 rounded font-mono text-brand-400 flex-shrink-0">
                        {r.difficulty_grade}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
