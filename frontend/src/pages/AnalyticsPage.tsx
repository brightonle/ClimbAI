import { useState } from 'react'
import KilterBoardCanvas from '../components/KilterBoardCanvas'

const GRADES = ['V0','V1','V2','V3','V4','V5','V6','V7','V8','V9','V10','V11','V12+']

export default function AnalyticsPage() {
  const [heatGrade, setHeatGrade] = useState<string>('')

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Hold Heatmap</h2>
            <p className="text-xs text-gray-500 mt-0.5">Most used holds across your routes</p>
          </div>
          <select
            value={heatGrade}
            onChange={(e) => setHeatGrade(e.target.value)}
            className="input text-xs py-1"
          >
            <option value="">All grades</option>
            {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <KilterBoardCanvas
          selectedHolds={[]}
          onHoldClick={() => {}}
          mode="heatmap"
          grade={heatGrade || undefined}
        />
      </div>
    </div>
  )
}
