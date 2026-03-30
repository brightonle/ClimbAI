import { Circle, Text, Group } from 'react-konva'
import type { Hold, HoldRole } from '../types'
import { toCanvasCoords } from '../utils/boardCoords'

const HOLD_TYPE_COLORS: Record<string, string> = {
  jug: '#22c55e',
  crimp: '#3b82f6',
  sloper: '#a855f7',
  pinch: '#f97316',
  foot: '#6b7280',
}

function holdColor(hold: Hold, role?: HoldRole): string {
  switch (role) {
    case 'start':  return '#22c55e'  // green
    case 'middle': return '#3b82f6'  // blue
    case 'foot':   return '#f97316'  // orange
    case 'finish': return '#f59e0b'  // amber
    default: return HOLD_TYPE_COLORS[hold.hold_type?.toLowerCase() ?? ''] ?? '#94a3b8'
  }
}

interface HoldMarkerProps {
  hold: Hold
  canvasWidth: number
  canvasHeight: number
  selected: boolean
  sequencePosition?: number
  role?: HoldRole
  heatIntensity?: number   // 0–1 for heatmap mode
  onClick: (hold: Hold) => void
}

export default function HoldMarker({
  hold, canvasWidth, canvasHeight, selected, sequencePosition,
  role, heatIntensity, onClick,
}: HoldMarkerProps) {
  const { cx, cy } = toCanvasCoords(hold.x, hold.y, canvasWidth, canvasHeight)
  const maxRadius = Math.max(5, canvasWidth * 0.008)

  let radius: number
  let fill: string
  if (heatIntensity != null) {
    // All holds are red; radius grows from 25% → 100% of maxRadius based on intensity
    radius = maxRadius * (0.25 + 0.75 * heatIntensity)
    fill = '#ef4444'
  } else {
    radius = maxRadius
    fill = holdColor(hold, role)
  }

  return (
    <Group onClick={() => onClick(hold)} onTap={() => onClick(hold)}>
      <Circle
        x={cx}
        y={cy}
        radius={radius}
        fill={fill}
        opacity={role != null || heatIntensity != null ? 0.95 : 0.55}
        stroke={role != null ? '#fff' : 'transparent'}
        strokeWidth={1.5}
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
