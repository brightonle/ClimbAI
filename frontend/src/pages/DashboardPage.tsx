import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts'
import { attemptsService } from '../services/attemptsService'
import GradePyramid from '../components/GradePyramid'
import ProgressChart from '../components/ProgressChart'
import { getGradeColor } from '../utils/gradeColors'
import type { AttemptStats } from '../types'

function gradeToNum(g: string): number {
  const n = parseInt(g.replace(/[^\d]/g, ''))
  return isNaN(n) ? 0 : n
}

function avg(nums: number[]): number {
  return nums.length ? nums.reduce((s, n) => s + n, 0) / nums.length : 0
}

function computeKpis(stats: AttemptStats) {
  const weeks = stats.success_rate_over_time
  const sparkN = weeks.slice(-10)

  // Total Sends
  const totalSends = stats.total_sends
  const recentSends = weeks.slice(-4).reduce((s, w) => s + Math.round(w.rate * w.attempts), 0)
  const priorSends = weeks.slice(-8, -4).reduce((s, w) => s + Math.round(w.rate * w.attempts), 0)
  const sendsPct = priorSends > 0 ? Math.round(((recentSends - priorSends) / priorSends) * 100) : null
  const sendsSparkline = sparkN.map((w) => ({ v: Math.round(w.rate * w.attempts) }))

  // Avg Grade
  const totalSendsAll = stats.grade_pyramid.reduce((s, g) => s + g.sends, 0)
  const weightedGrade = stats.grade_pyramid.reduce((s, g) => s + gradeToNum(g.grade) * g.sends, 0)
  const avgGradeNum = totalSendsAll > 0 ? weightedGrade / totalSendsAll : 0
  const avgGradeLabel = `V${avgGradeNum.toFixed(1)}`
  const avgGradeSparkline = sparkN.map((w) => ({ v: +(w.rate * 12).toFixed(2) }))

  // Hardest Send
  const gradesWithSends = stats.grade_pyramid
    .filter((g) => g.sends > 0)
    .sort((a, b) => gradeToNum(b.grade) - gradeToNum(a.grade))
  const hardestGrade = gradesWithSends[0]?.grade ?? '—'
  const hardestSparkline = stats.grade_pyramid
    .filter((g) => g.sends > 0)
    .sort((a, b) => gradeToNum(a.grade) - gradeToNum(b.grade))
    .map((g) => ({ v: g.sends }))

  // Send Rate
  const sendRate = stats.total_attempts > 0
    ? Math.round((stats.total_sends / stats.total_attempts) * 100)
    : 0
  const recentRate = avg(weeks.slice(-4).map((w) => w.rate * 100))
  const priorRate = avg(weeks.slice(-8, -4).map((w) => w.rate * 100))
  const rateDiff = weeks.length >= 2 ? Math.round(recentRate - priorRate) : null
  const rateSparkline = sparkN.map((w) => ({ v: Math.round(w.rate * 100) }))

  return {
    totalSends, sendsPct, sendsSparkline,
    avgGradeLabel, avgGradeNum, avgGradeSparkline,
    hardestGrade, hardestSparkline,
    sendRate, rateDiff, rateSparkline,
  }
}

function Sparkline({ data, color }: { data: { v: number }[]; color: string }) {
  if (data.length < 2) return <div className="h-10" />
  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={data} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
        <defs>
          <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.25} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#sg-${color.replace('#', '')})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

interface KpiCardProps {
  label: string
  value: string | number
  trend: React.ReactNode
  sparkline: { v: number }[]
  color: string
}

function KpiCard({ label, value, trend, sparkline, color }: KpiCardProps) {
  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-3 flex flex-col gap-1" style={{ borderTop: `3px solid ${color}` }}>
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        <span className="text-xs font-medium" style={{ color }}>{trend}</span>
      </div>
      <Sparkline data={sparkline} color={color} />
    </div>
  )
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['attempt-stats'],
    queryFn: attemptsService.stats,
  })

  const kpis = stats && stats.total_attempts > 0 ? computeKpis(stats) : null

  const gradePieData = stats?.grade_pyramid
    .filter((g) => g.sends > 0)
    .sort((a, b) => gradeToNum(a.grade) - gradeToNum(b.grade))
    .map((g) => ({ name: g.grade, value: g.sends })) ?? []

  return (
    <div className="max-w-5xl mx-auto space-y-3">
{isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading stats…</div>
      ) : !stats || stats.total_attempts === 0 ? (
        <div className="text-center py-16 bg-gray-50 border border-gray-200 rounded-xl">
          <p className="text-gray-500 text-lg mb-2">No data yet</p>
          <p className="text-gray-400 text-sm mb-4">Create a route and log some attempts to see your analytics</p>
          <Link to="/routes/new" className="btn-primary">Create your first route</Link>
        </div>
      ) : kpis && (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KpiCard
              label="Total Sends"
              value={kpis.totalSends}
              trend={kpis.sendsPct !== null ? `${kpis.sendsPct >= 0 ? '+' : ''}${kpis.sendsPct}% this month` : 'all time'}
              sparkline={kpis.sendsSparkline}
              color="#5fae4b"
            />
            <KpiCard
              label="Avg Grade"
              value={kpis.avgGradeLabel}
              trend="sends avg"
              sparkline={kpis.avgGradeSparkline}
              color="#6eb4b7"
            />
            <KpiCard
              label="Hardest Send"
              value={kpis.hardestGrade}
              trend="your peak"
              sparkline={kpis.hardestSparkline}
              color="#fadb64"
            />
            <KpiCard
              label="Send Rate"
              value={`${kpis.sendRate}%`}
              trend={kpis.rateDiff !== null ? `${kpis.rateDiff >= 0 ? '+' : ''}${kpis.rateDiff} pts` : 'overall'}
              sparkline={kpis.rateSparkline}
              color="#f01a1c"
            />
          </div>

          {/* Row 1: Grade Pyramid | Weekly Send Rate */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <GradePyramid data={stats.grade_pyramid} />
            <ProgressChart data={stats.success_rate_over_time} />
          </div>

          {/* Row 2: Top Routes | Sends by Grade pie */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {stats.top_routes.length > 0 && (
              <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4">
                <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-3">Top Routes</h2>
                <div className="space-y-3">
                  {stats.top_routes.slice(0, 6).map((r) => (
                    <div key={r.route_id} className="flex items-center gap-3">
                      <Link
                        to={`/routes/${r.route_id}`}
                        className="flex-1 text-sm text-gray-700 hover:text-brand-600 transition-colors truncate"
                      >
                        {r.route_name}
                      </Link>
                      <span className="text-xs text-gray-400">{r.attempts} tries</span>
                      <span className="text-xs text-brand-600 w-12 text-right">{r.sends} sends</span>
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
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

            {gradePieData.length > 0 && (
              <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4">
                <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Sends by Grade</h2>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={gradePieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={40}>
                      {gradePieData.map((entry) => (
                        <Cell key={entry.name} fill={getGradeColor(entry.name)} fillOpacity={0.85} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8 }}
                      labelStyle={{ color: '#111827', fontWeight: 600 }}
                      formatter={(v: number, name: string) => [v, name]}
                    />
                    <Legend wrapperStyle={{ fontSize: 11, color: '#6b7280' }} iconType="circle" iconSize={8} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}

    </div>
  )
}
