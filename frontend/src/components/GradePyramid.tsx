import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import type { GradeStat } from '../types'
import { getGradeColor } from '../utils/gradeColors'

interface Props {
  data: GradeStat[]
}

function sortGrades(grades: GradeStat[]) {
  return [...grades].sort((a, b) => {
    const numA = parseInt(a.grade.replace(/[^\d]/g, '') || '0')
    const numB = parseInt(b.grade.replace(/[^\d]/g, '') || '0')
    return numA - numB
  })
}

const ATTEMPTS_W = 36
const SENDS_W = 22
const RADIUS = 4

// Single custom shape draws both bars centered on the same x
function OverlappedBar(props: any) {
  const { x, y, width, height, grade, sends, attempts } = props
  if (!height || height <= 0) return null

  const color = getGradeColor(grade)
  const cx = x + width / 2

  const attX = cx - ATTEMPTS_W / 2
  const sendsH = attempts > 0 ? Math.round((height * sends) / attempts) : 0
  const sendsY = y + height - sendsH
  const sendX = cx - SENDS_W / 2

  return (
    <g>
      <rect x={attX} y={y} width={ATTEMPTS_W} height={height}
        fill={color} fillOpacity={0.25} rx={RADIUS} ry={RADIUS} />
      {sendsH > 0 && (
        <rect x={sendX} y={sendsY} width={SENDS_W} height={sendsH}
          fill={color} fillOpacity={1} rx={RADIUS} ry={RADIUS} />
      )}
    </g>
  )
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const { attempts, sends } = payload[0].payload
  const rate = attempts > 0 ? ((sends / attempts) * 100).toFixed(1) : '0.0'
  const color = getGradeColor(label)
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm text-xs">
      <p className="font-bold mb-1" style={{ color }}>{label}</p>
      <p className="text-gray-600">Attempts: <span className="font-medium text-gray-900">{attempts}</span></p>
      <p className="text-gray-600">Sends: <span className="font-medium text-gray-900">{sends}</span></p>
      <p className="text-gray-600">Send Rate: <span className="font-medium text-gray-900">{rate}%</span></p>
    </div>
  )
}

export default function GradePyramid({ data }: Props) {
  const sorted = sortGrades(data)

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4">
      <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Grade Pyramid</h2>
      {sorted.length === 0 ? (
        <p className="text-gray-400 text-sm text-center py-6">No data yet — log some attempts!</p>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={sorted}
            barCategoryGap="8%"
            margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="grade" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
            <Bar dataKey="attempts" shape={<OverlappedBar />} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
