import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { attemptsService } from '../services/attemptsService'
import { authService } from '../services/authService'
import GradePyramid from '../components/GradePyramid'
import ProgressChart from '../components/ProgressChart'

export default function DashboardPage() {
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: authService.me })
  const { data: stats, isLoading } = useQuery({
    queryKey: ['attempt-stats'],
    queryFn: attemptsService.stats,
  })

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">
            Hey, {user?.username} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Your climbing analytics</p>
        </div>
        <Link to="/routes/new" className="btn-primary">+ New Route</Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading stats…</div>
      ) : !stats || stats.total_attempts === 0 ? (
        <div className="text-center py-16 bg-gray-900 rounded-xl">
          <p className="text-gray-400 text-lg mb-2">No data yet</p>
          <p className="text-gray-600 text-sm mb-4">Create a route and log some attempts to see your analytics</p>
          <Link to="/routes/new" className="btn-primary">Create your first route</Link>
        </div>
      ) : (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total Attempts', value: stats.total_attempts, color: 'text-gray-100' },
              { label: 'Total Sends', value: stats.total_sends, color: 'text-brand-500' },
              {
                label: 'Send Rate',
                value: stats.total_attempts ? `${Math.round((stats.total_sends / stats.total_attempts) * 100)}%` : '—',
                color: 'text-blue-400',
              },
              { label: 'Active Routes', value: stats.top_routes.length, color: 'text-amber-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-gray-900 rounded-xl p-4 text-center">
                <div className={`text-3xl font-bold ${color}`}>{value}</div>
                <div className="text-xs text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GradePyramid data={stats.grade_pyramid} />
            <ProgressChart data={stats.success_rate_over_time} />
          </div>

          {/* Top routes table */}
          {stats.top_routes.length > 0 && (
            <div className="bg-gray-900 rounded-xl p-5">
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">Top Routes</h2>
              <div className="space-y-2">
                {stats.top_routes.map((r) => (
                  <div key={r.route_id} className="flex items-center gap-3">
                    <Link
                      to={`/routes/${r.route_id}`}
                      className="flex-1 text-sm text-gray-300 hover:text-brand-400 transition-colors truncate"
                    >
                      {r.route_name}
                    </Link>
                    <span className="text-xs text-gray-500">{r.attempts} tries</span>
                    <span className="text-xs text-brand-500">{r.sends} sends</span>
                    <div className="w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full"
                        style={{ width: `${r.attempts ? (r.sends / r.attempts) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
