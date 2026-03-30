// Native Kilter coordinate system for 16×12 board
// product_size_id=28: edge_left=-24, edge_right=168, edge_bottom=0, edge_top=156
// Image is 1477×1200px — holds map exactly to image boundaries

export const CANVAS_ASPECT_RATIO = 1477 / 1200  // landscape

const KILTER_X_MIN = -24
const KILTER_X_RANGE = 192   // 168 − (−24)
const KILTER_Y_RANGE = 156   // edge_top − edge_bottom

export function toCanvasCoords(
  x: number,
  y: number,
  canvasWidth: number,
  canvasHeight: number
): { cx: number; cy: number } {
  const cx = (x - KILTER_X_MIN) / KILTER_X_RANGE * canvasWidth
  const cy = (1 - y / KILTER_Y_RANGE) * canvasHeight
  return { cx, cy }
}
