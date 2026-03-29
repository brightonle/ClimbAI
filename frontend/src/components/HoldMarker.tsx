import { Circle, Text, Group } from 'react-konva'
import type { Hold } from '../types'

// 16×12 Kilter Board — image is 1477×1200px
// Empirically calibrated from pixel analysis of kilter-hands.png:
//   23 columns detected (our CSV hand holds span inner 17: x=[1,33] odd)
//   20 rows detected    (our CSV hand holds span inner 18: y=[3,37] odd)
//   Full board CSV range: x=[-5..39] (step 2), y=[1..39] (step 2)
//   Detected column extents: 63px–1412px of 1477px width
//   Detected row extents:    26px–1182px of 1200px height
export const CANVAS_ASPECT_RATIO = 1477 / 1200  // landscape

// Image boundary fractions (hold grid within the full image)
const IMG_X_LEFT = 63 / 1477    // ~4.27% from left edge
const IMG_X_SPAN = 1349 / 1477  // (1412-63)/1477 — hold grid width fraction
const IMG_Y_TOP  = 26 / 1200    // ~2.17% from top edge
const IMG_Y_SPAN = 1174 / 1200  // (1200-26)/1200 — hold grid height fraction

// Full board extent in CSV coordinate units (step-2 grid)
const X_MIN = -5   // leftmost column (3 cols left of CSV x=1)
const X_MAX = 39   // rightmost column (3 cols right of CSV x=33)
const Y_MAX = 39   // top row (1 row above CSV y=37)
const Y_MIN = 1    // bottom row (maps to canvas bottom)

export function toCanvasCoords(
  x: number,
  y: number,
  canvasWidth: number,
  canvasHeight: number
): { cx: number; cy: number } {
  const cx = (IMG_X_LEFT + (x - X_MIN) / (X_MAX - X_MIN) * IMG_X_SPAN) * canvasWidth
  const cy = (IMG_Y_TOP  + (Y_MAX - y) / (Y_MAX - Y_MIN) * IMG_Y_SPAN) * canvasHeight
  return { cx, cy }
}

const HOLD_TYPE_COLORS: Record<string, string> = {
  jug: '#22c55e',
  crimp: '#3b82f6',
  sloper: '#a855f7',
  pinch: '#f97316',
  foot: '#6b7280',
}

function holdColor(hold: Hold, selected: boolean, isStart: boolean, isFinish: boolean): string {
  if (isStart) return '#22c55e'
  if (isFinish) return '#f59e0b'
  if (selected) return '#ffffff'
  return HOLD_TYPE_COLORS[hold.hold_type?.toLowerCase() ?? ''] ?? '#94a3b8'
}

interface HoldMarkerProps {
  hold: Hold
  canvasWidth: number
  canvasHeight: number
  selected: boolean
  sequencePosition?: number
  isStart?: boolean
  isFinish?: boolean
  heatIntensity?: number   // 0–1 for heatmap mode
  onClick: (hold: Hold) => void
}

export default function HoldMarker({
  hold, canvasWidth, canvasHeight, selected, sequencePosition,
  isStart = false, isFinish = false, heatIntensity, onClick,
}: HoldMarkerProps) {
  const { cx, cy } = toCanvasCoords(hold.x, hold.y, canvasWidth, canvasHeight)
  const radius = Math.max(5, canvasWidth * 0.008)

  let fill: string
  if (heatIntensity != null) {
    // blue (cold) → red (hot)
    const r = Math.round(heatIntensity * 220)
    const b = Math.round((1 - heatIntensity) * 220)
    fill = `rgb(${r},60,${b})`
  } else {
    fill = holdColor(hold, selected, isStart, isFinish)
  }

  return (
    <Group onClick={() => onClick(hold)} onTap={() => onClick(hold)}>
      <Circle
        x={cx}
        y={cy}
        radius={radius}
        fill={fill}
        opacity={selected || heatIntensity != null ? 0.95 : 0.55}
        stroke={selected ? '#fff' : 'transparent'}
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
