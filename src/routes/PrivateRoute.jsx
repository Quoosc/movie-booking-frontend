import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthContext } from '../context/AuthContext.jsx'

export default function PrivateRoute() {
  const { user } = useAuthContext()
  const loc = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: loc }} />
  return <Outlet />
}