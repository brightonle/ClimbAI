import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from '../services/authService'

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/routes', label: 'Routes' },
  { to: '/routes/new', label: '+ New Route' },
  { to: '/profile', label: 'Profile' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const logout = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.clear()
      navigate('/login')
    },
  })

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-3 flex items-center gap-6">
        <span className="text-brand-500 font-bold text-xl tracking-tight">ClimbAI</span>
        <div className="flex gap-4 flex-1">
          {navLinks.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm font-medium px-3 py-1.5 rounded transition-colors ${
                pathname === l.to
                  ? 'bg-brand-600 text-white'
                  : 'text-gray-400 hover:text-gray-100'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <button
          onClick={() => logout.mutate()}
          className="text-sm text-gray-400 hover:text-gray-100 transition-colors"
        >
          Log out
        </button>
      </nav>
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
