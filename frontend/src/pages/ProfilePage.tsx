import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { authService } from '../services/authService'
import api from '../services/api'
import type { Profile } from '../types'

export default function ProfilePage() {
  const queryClient = useQueryClient()
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: authService.me })

  const { register, handleSubmit, formState: { isDirty } } = useForm<Partial<Profile>>({
    defaultValues: user?.profile ?? {},
  })

  const update = useMutation({
    mutationFn: (data: Partial<Profile>) =>
      api.put('/users/me/profile', data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  })

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>
      <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 mb-4">
        <p className="text-gray-600 text-sm">Username: <span className="text-gray-900">{user?.username}</span></p>
        <p className="text-gray-600 text-sm mt-1">Email: <span className="text-gray-900">{user?.email}</span></p>
      </div>
      <form onSubmit={handleSubmit((d) => update.mutate(d))} className="bg-white border border-gray-200 shadow-sm rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Physical Stats</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { name: 'height_cm', label: 'Height (cm)' },
            { name: 'weight_kg', label: 'Weight (kg)' },
            { name: 'wingspan_cm', label: 'Wingspan (cm)' },
            { name: 'ape_index', label: 'Ape Index' },
            { name: 'num_pull_ups', label: 'Pull-ups' },
            { name: 'num_push_ups', label: 'Push-ups' },
          ].map(({ name, label }) => (
            <div key={name}>
              <label className="block text-xs text-gray-600 mb-1">{label}</label>
              <input
                {...register(name as keyof Profile, { valueAsNumber: true })}
                type="number"
                className="input w-full"
              />
            </div>
          ))}
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1">Climbing Style</label>
          <select {...register('climbing_style')} className="input w-full">
            <option value="">— select —</option>
            {['slab', 'vertical', 'overhang', 'roof'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        {update.isSuccess && <p className="text-brand-600 text-sm">Saved!</p>}
        <button type="submit" disabled={!isDirty || update.isPending} className="btn-primary">
          {update.isPending ? 'Saving…' : 'Save Profile'}
        </button>
      </form>
    </div>
  )
}
