import { Routes, Route, Navigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { authService } from './services/authService'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import RouteBuilderPage from './pages/RouteBuilderPage'
import RoutesListPage from './pages/RoutesListPage'
import RouteDetailPage from './pages/RouteDetailPage'
import ProfilePage from './pages/ProfilePage'
import Layout from './components/Layout'

function App() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: authService.me,
    retry: false,
  })

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/routes" element={<RoutesListPage />} />
        <Route path="/routes/new" element={<RouteBuilderPage />} />
        <Route path="/routes/:id" element={<RouteDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
