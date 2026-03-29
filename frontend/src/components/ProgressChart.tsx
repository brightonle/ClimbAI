import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import type { WeeklyStat } from '../types'

interface Props {
  data: WeeklyStat[]
}

export default function ProgressChart({ data }: Props) {
  const formatted = data.map((d) => ({
    ...d,
    rate_pct: Math.round(d.rate * 100),
    label: d.week.replace('-W', ' W'),
  }))

  return (
    <div className="bg-gray-900 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-4">Weekly Send Rate</h2>
      {formatted.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">No data yet</p>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={formatted} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: 8 }}
              labelStyle={{ color: '#f3f4f6', fontWeight: 600 }}
              formatter={(v: number) => [`${v}%`, 'Send rate']}
            />
            <Line
              type="monotone"
              dataKey="rate_pct"
              stroke="#22c55e"
              strokeWidth={2}
              dot={{ fill: '#22c55e', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
