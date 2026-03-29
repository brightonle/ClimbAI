import { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Rect } from 'react-konva'
import { useQuery } from '@tanstack/react-query'
import { holdsService } from '../services/holdsService'
import HoldMarker from './HoldMarker'
import type { Hold, SelectedHold } from '../types'

interface KilterBoardCanvasProps {
  selectedHolds: SelectedHold[]
  onHoldClick: (hold: Hold) => void
}

export default function KilterBoardCanvas({ selectedHolds, onHoldClick }: KilterBoardCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState(500)

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width
      setSize(Math.floor(w))
    })
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const { data: holds = [], isLoading } = useQuery({
    queryKey: ['holds', 'kilter'],
    queryFn: () => holdsService.list({ board_type: 'kilter' }),
  })

  const selectedIds = new Set(selectedHolds.map((s) => s.hold.id))

  return (
    <div ref={containerRef} className="w-full aspect-square bg-gray-900 rounded-lg overflow-hidden">
      {isLoading ? (
        <div className="flex h-full items-center justify-center text-gray-500 text-sm">
          Loading Kilter Board…
        </div>
      ) : (
        <Stage width={size} height={size}>
          <Layer>
            {/* Board background */}
            <Rect x={0} y={0} width={size} height={size} fill="#111827" />

            {holds.map((hold) => {
              const sel = selectedHolds.find((s) => s.hold.id === hold.id)
              const idx = sel ? sel.position : undefined
              const isStart = idx === 1
              const isFinish = idx === selectedHolds.length && selectedHolds.length > 0

              return (
                <HoldMarker
                  key={hold.id}
                  hold={hold}
                  canvasSize={size}
                  selected={selectedIds.has(hold.id)}
                  sequencePosition={idx}
                  isStart={isStart}
                  isFinish={isFinish}
                  onClick={onHoldClick}
                />
              )
            })}
          </Layer>
        </Stage>
      )}
    </div>
  )
}
