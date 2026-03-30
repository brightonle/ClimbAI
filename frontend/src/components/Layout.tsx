import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from '../services/authService'

const navSections = [
  {
    label: 'MAIN',
    links: [
      { to: '/dashboard', label: 'Dashboard', icon: '▦' },
      { to: '/routes/new', label: 'Log Climb', icon: '+' },
      { to: '/routes', label: 'Routes', icon: '⊞' },
      { to: '/sessions', label: 'Sessions', icon: '◷' },
      { to: '/analytics', label: 'Analytics', icon: '↗' },
    ],
  },
  {
    label: 'PERSONAL',
    links: [
      { to: '/profile', label: 'Profile', icon: '◯' },
      { to: '/goals', label: 'Goals', icon: '◎' },
      { to: '/saved', label: 'Saved Routes', icon: '♡' },
    ],
  },
  {
    label: 'OTHER',
    links: [
      { to: '/settings', label: 'Settings', icon: '⚙' },
    ],
  },
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
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-72 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <span className="text-brand-600 font-bold text-4xl tracking-tight">ClimbAI</span>
          <div
            className="flex-shrink-0 h-9 w-9"
            style={{
              backgroundImage: 'url(/logo.png)',
              backgroundSize: '270%',
              backgroundPosition: '50% 48%',
              backgroundRepeat: 'no-repeat',
            }}
          />
        </div>

        {/* Nav sections */}
        <nav className="flex-1 px-3 py-2 space-y-4 overflow-y-auto">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-2 mb-1">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.links.map((l) => {
                  const active = pathname === l.to || (l.to !== '/dashboard' && pathname.startsWith(l.to) && l.to !== '/routes/new')
                  return (
                    <Link
                      key={l.to}
                      to={l.to}
                      className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm transition-colors ${
                        active
                          ? 'bg-brand-50 text-brand-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <span className="text-base leading-none w-4 text-center">{l.icon}</span>
                      {l.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Log out */}
        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={() => logout.mutate()}
            className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          >
            <span className="text-base leading-none w-4 text-center">↩</span>
            Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {children}
      </main>
    </div>
  )
}
