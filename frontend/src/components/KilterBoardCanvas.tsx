import { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Image as KonvaImage } from 'react-konva'
import { useQuery } from '@tanstack/react-query'
import { holdsService } from '../services/holdsService'
import HoldMarker, { CANVAS_ASPECT_RATIO } from './HoldMarker'
import type { Hold, SelectedHold } from '../types'

interface KilterBoardCanvasProps {
  selectedHolds: SelectedHold[]
  onHoldClick: (hold: Hold) => void
  mode?: 'builder' | 'heatmap'
}

function useImage(src: string): HTMLImageElement | null {
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  useEffect(() => {
    const i = new window.Image()
    i.src = src
    i.onload = () => setImg(i)
  }, [src])
  return img
}

export default function KilterBoardCanvas({
  selectedHolds,
  onHoldClick,
  mode = 'builder',
}: KilterBoardCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [canvasWidth, setCanvasWidth] = useState(600)

  // Landscape aspect ratio matches the 1477×1200 board images
  const canvasHeight = Math.round(canvasWidth / CANVAS_ASPECT_RATIO)

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      setCanvasWidth(Math.floor(entries[0].contentRect.width))
    })
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const feetImg = useImage('/kilter-feet.png')
  const handsImg = useImage('/kilter-hands.png')

  const { data: holds = [], isLoading } = useQuery({
    queryKey: ['holds', 'kilter'],
    queryFn: () => holdsService.list({ board_type: 'kilter' }),
  })

  const selectedIds = new Set(selectedHolds.map((s) => s.hold.id))

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: canvasHeight,
        background: '#0f172a',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      {isLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6b7280', fontSize: 14 }}>
          Loading holds…
        </div>
      ) : (
        <Stage width={canvasWidth} height={canvasHeight}>
          {/* Layer 1: foot holds image */}
          <Layer listening={false}>
            {feetImg && (
              <KonvaImage image={feetImg} x={0} y={0} width={canvasWidth} height={canvasHeight} opacity={0.9} />
            )}
          </Layer>

          {/* Layer 2: hand holds image */}
          <Layer listening={false}>
            {handsImg && (
              <KonvaImage image={handsImg} x={0} y={0} width={canvasWidth} height={canvasHeight} opacity={0.9} />
            )}
          </Layer>

          {/* Layer 3: interactive hold markers */}
          <Layer>
            {holds.map((hold) => {
              const sel = selectedHolds.find((s) => s.hold.id === hold.id)
              const idx = sel ? sel.position : undefined
              const isStart = idx === 1
              const isFinish = idx === selectedHolds.length && selectedHolds.length > 0

              return (
                <HoldMarker
                  key={hold.id}
                  hold={hold}
                  canvasWidth={canvasWidth}
                  canvasHeight={canvasHeight}
                  selected={selectedIds.has(hold.id)}
                  sequencePosition={idx}
                  isStart={isStart}
                  isFinish={isFinish}
                  onClick={mode === 'builder' ? onHoldClick : () => {}}
                />
              )
            })}
          </Layer>
        </Stage>
      )}
    </div>
  )
}
