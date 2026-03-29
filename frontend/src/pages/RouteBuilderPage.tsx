import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import KilterBoardCanvas from '../components/KilterBoardCanvas'
import RouteSequencePanel from '../components/RouteSequencePanel'
import { routesService } from '../services/routesService'
import type { Hold, SelectedHold } from '../types'

const GRADES = ['V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8', 'V9', 'V10', 'V11', 'V12+']

const schema = z.object({
  name: z.string().min(1, 'Route name required'),
  difficulty_grade: z.string().optional(),
  wall_angle: z.coerce.number().optional(),
  description: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function RouteBuilderPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedHolds, setSelectedHolds] = useState<SelectedHold[]>([])

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const createRoute = useMutation({
    mutationFn: routesService.create,
    onSuccess: (route) => {
      queryClient.invalidateQueries({ queryKey: ['routes'] })
      navigate(`/routes/${route.id}`)
    },
  })

  function handleHoldClick(hold: Hold) {
    setSelectedHolds((prev) => {
      const exists = prev.find((s) => s.hold.id === hold.id)
      if (exists) {
        // Deselect and re-number
        const next = prev.filter((s) => s.hold.id !== hold.id)
        return next.map((s, i) => ({ ...s, position: i + 1 }))
      }
      return [...prev, { hold, position: prev.length + 1, foot_restriction: false }]
    })
  }

  function handleRemove(holdId: number) {
    setSelectedHolds((prev) => {
      const next = prev.filter((s) => s.hold.id !== holdId)
      return next.map((s, i) => ({ ...s, position: i + 1 }))
    })
  }

  function onSubmit(data: FormData) {
    if (selectedHolds.length < 2) {
      alert('Select at least 2 holds to create a route')
      return
    }
    createRoute.mutate({
      ...data,
      holds: selectedHolds.map((s) => ({
        hold_id: s.hold.id,
        position_in_route: s.position,
        foot_restriction: s.foot_restriction,
      })),
    })
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-100 mb-6">New Route</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas */}
        <div className="lg:col-span-2">
          <p className="text-sm text-gray-400 mb-2">
            <span className="inline-block w-3 h-3 rounded-full bg-brand-500 mr-1" />Start
            <span className="inline-block w-3 h-3 rounded-full bg-amber-500 mx-1 ml-3" />Finish
            <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mx-1 ml-3" />Selected
          </p>
          <KilterBoardCanvas selectedHolds={selectedHolds} onHoldClick={handleHoldClick} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-xl p-4">
            <h2 className="text-sm font-semibold text-gray-300 mb-3 uppercase tracking-wide">Sequence</h2>
            <RouteSequencePanel
              selectedHolds={selectedHolds}
              onRemove={handleRemove}
              onClear={() => setSelectedHolds([])}
            />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-900 rounded-xl p-4 space-y-4">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Route Details</h2>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Name *</label>
              <input {...register('name')} className="input w-full" placeholder="My awesome route" />
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Grade</label>
              <select {...register('difficulty_grade')} className="input w-full">
                <option value="">— select —</option>
                {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Wall angle (°)</label>
              <input {...register('wall_angle')} type="number" className="input w-full" placeholder="40" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Description</label>
              <textarea {...register('description')} className="input w-full" rows={2} />
            </div>
            <button
              type="submit"
              disabled={createRoute.isPending || selectedHolds.length < 2}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createRoute.isPending ? 'Saving…' : 'Save Route'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
