import { Navigate } from 'react-router-dom'
import { useAuth } from './useAuth'

export const AuthGuard = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}
