import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts'
import type { GradeStat } from '../types'

interface Props {
  data: GradeStat[]
}

// Sort grades numerically (V0, V1, …)
function sortGrades(grades: GradeStat[]) {
  return [...grades].sort((a, b) => {
    const numA = parseInt(a.grade.replace(/[^\d]/g, '') || '0')
    const numB = parseInt(b.grade.replace(/[^\d]/g, '') || '0')
    return numA - numB
  })
}

export default function GradePyramid({ data }: Props) {
  const sorted = sortGrades(data)

  return (
    <div className="bg-gray-900 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">Grade Pyramid</h2>
      {sorted.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">No data yet — log some attempts!</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={sorted} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            <XAxis dataKey="grade" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: 8 }}
              labelStyle={{ color: '#f3f4f6', fontWeight: 600 }}
              itemStyle={{ color: '#9ca3af' }}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
            <Bar dataKey="attempts" name="Attempts" fill="#374151" radius={[4, 4, 0, 0]} />
            <Bar dataKey="sends" name="Sends" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
