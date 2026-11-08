import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FullScreenSpinner } from './ui/Spinner'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  if (loading) return <FullScreenSpinner />
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}
