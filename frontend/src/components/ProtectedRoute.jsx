import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user } = useAuth()

  // Not logged in at all
  if (!isAuthenticated) {
    return <Navigate to="/gov/login" replace />
  }

  // Wrong role — admin trying to access institution dashboard
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/gov/login" replace />
  }

  return children
}