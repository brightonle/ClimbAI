import type { SelectedHold } from '../types'

interface Props {
  selectedHolds: SelectedHold[]
  onRemove: (holdId: number) => void
  onClear: () => void
}

export default function RouteSequencePanel({ selectedHolds, onRemove, onClear }: Props) {
  if (selectedHolds.length === 0) {
    return (
      <div className="text-sm text-gray-500 text-center py-6">
        Click holds on the board to build your route
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-300">{selectedHolds.length} holds selected</span>
        <button onClick={onClear} className="text-xs text-red-400 hover:text-red-300 transition-colors">
          Clear all
        </button>
      </div>
      <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
        {selectedHolds.map((s, i) => (
          <div
            key={s.hold.id}
            className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2 text-sm"
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
              s.role === 'start' ? 'bg-green-600' :
              s.role === 'foot'  ? 'bg-orange-500' :
              s.role === 'finish'? 'bg-amber-500' :
                                   'bg-blue-600'
            }`}>
              {s.position}
            </span>
            <div className="flex-1 min-w-0">
              <span className="text-gray-200 capitalize">{s.role}</span>
              <span className="text-gray-500 ml-1 text-xs">({s.hold.hold_type || 'hold'})</span>
            </div>
            <span className="text-gray-500 text-xs">{s.hold.x.toFixed(0)},{s.hold.y.toFixed(0)}</span>
            <button
              onClick={() => onRemove(s.hold.id)}
              className="text-gray-500 hover:text-red-400 transition-colors ml-1"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
