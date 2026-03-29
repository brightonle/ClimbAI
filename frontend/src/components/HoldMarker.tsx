import { Circle, Text, Group } from 'react-konva'
import type { Hold } from '../types'

// Kilter board uses a 144x144 unit grid
export const BOARD_UNITS = 144

interface HoldMarkerProps {
  hold: Hold
  canvasSize: number
  selected: boolean
  sequencePosition?: number   // 1-based position in route
  isStart?: boolean
  isFinish?: boolean
  onClick: (hold: Hold) => void
}

function holdColor(selected: boolean, isStart: boolean, isFinish: boolean): string {
  if (isStart) return '#22c55e'    // green
  if (isFinish) return '#f59e0b'   // amber
  if (selected) return '#3b82f6'   // blue
  return '#4b5563'                 // gray
}

export default function HoldMarker({
  hold, canvasSize, selected, sequencePosition, isStart = false, isFinish = false, onClick,
}: HoldMarkerProps) {
  const scale = canvasSize / BOARD_UNITS
  const cx = hold.x * scale
  // Kilter board origin is bottom-left; canvas origin is top-left → flip y
  const cy = (BOARD_UNITS - hold.y) * scale
  const radius = Math.max(4, scale * 1.2)

  const fill = holdColor(selected, isStart, isFinish)

  return (
    <Group onClick={() => onClick(hold)} onTap={() => onClick(hold)} style={{ cursor: 'pointer' }}>
      <Circle
        x={cx}
        y={cy}
        radius={radius}
        fill={fill}
        opacity={selected ? 1 : 0.5}
        stroke={selected ? '#fff' : 'transparent'}
        strokeWidth={1}
      />
      {sequencePosition != null && (
        <Text
          x={cx - radius}
          y={cy - radius}
          width={radius * 2}
          height={radius * 2}
          text={String(sequencePosition)}
          fontSize={Math.max(8, radius * 0.9)}
          fill="#fff"
          align="center"
          verticalAlign="middle"
          listening={false}
        />
      )}
    </Group>
  )
}
