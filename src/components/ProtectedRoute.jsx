import { Navigate, useLocation } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'

export default function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser } = useAppContext()
  const location = useLocation()

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    const fallback = currentUser.role === 'ngo'
      ? '/dashboard/ngo'
      : currentUser.role === 'admin'
        ? '/dashboard/admin'
        : '/dashboard/donor'

    return <Navigate to={fallback} replace />
  }

  return children
}
