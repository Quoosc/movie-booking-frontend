import { Navigate, Outlet } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext.jsx'
import { ROLES } from '../utils/constants.js'

export default function AdminRoute() {
  const { user } = useAuthContext()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== ROLES.ADMIN) return <Navigate to="/403" replace />
  return <Outlet />
}