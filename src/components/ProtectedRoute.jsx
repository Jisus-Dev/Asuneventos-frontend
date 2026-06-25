import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ requiredRole }) {
  const { isAuthenticated, rol } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && rol !== requiredRole) {
    const redirectTo = rol === 'ROLE_ADMIN' ? '/admin/dashboard' : '/voluntario/agenda'
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}

export function GuestRoute() {
  const { isAuthenticated, rol } = useAuth()

  if (isAuthenticated) {
    const redirectTo = rol === 'ROLE_ADMIN' ? '/admin/dashboard' : '/voluntario/agenda'
    return <Navigate to={redirectTo} replace />
  }

  return <Outlet />
}
