import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { attemptsService } from '../services/attemptsService'

interface Props {
  routeId: number
}

export default function AttemptLogger({ routeId }: Props) {
  const queryClient = useQueryClient()
  const [success, setSuccess] = useState<boolean | null>(null)
  const [notes, setNotes] = useState('')
  const [duration, setDuration] = useState('')
  const [saved, setSaved] = useState(false)

  const log = useMutation({
    mutationFn: attemptsService.log,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attempts'] })
      queryClient.invalidateQueries({ queryKey: ['attempt-stats'] })
      setSaved(true)
      setSuccess(null)
      setNotes('')
      setDuration('')
      setTimeout(() => setSaved(false), 2000)
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (success === null) return
    log.mutate({
      route_id: routeId,
      success,
      notes: notes || undefined,
      duration_seconds: duration ? parseInt(duration) : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 space-y-4">
      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Log Attempt</h3>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setSuccess(true)}
          className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors border ${
            success === true
              ? 'bg-brand-600 border-brand-600 text-white'
              : 'border-gray-300 text-gray-600 hover:border-brand-600 hover:text-brand-600'
          }`}
        >
          Send ✓
        </button>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className={`flex-1 py-2 rounded-lg font-medium text-sm transition-colors border ${
            success === false
              ? 'bg-red-600 border-red-600 text-white'
              : 'border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-500'
          }`}
        >
          Fell ✗
        </button>
      </div>
      <div>
        <label className="block text-xs text-gray-600 mb-1">Duration (seconds)</label>
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="input w-full"
          placeholder="e.g. 45"
        />
      </div>
      <div>
        <label className="block text-xs text-gray-600 mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="input w-full"
          rows={2}
          placeholder="Beta, crux thoughts…"
        />
      </div>
      {saved && <p className="text-brand-600 text-sm">Attempt logged!</p>}
      <button
        type="submit"
        disabled={success === null || log.isPending}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {log.isPending ? 'Saving…' : 'Log Attempt'}
      </button>
    </form>
  )
}
