import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
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
    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4">
      <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Weekly Send Rate</h2>
      {formatted.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-6">No data yet</p>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={formatted} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="sendRateGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8 }}
              labelStyle={{ color: '#111827', fontWeight: 600 }}
              formatter={(v: number) => [`${v}%`, 'Send rate']}
            />
            <Area
              type="monotone"
              dataKey="rate_pct"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#sendRateGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#22c55e', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
