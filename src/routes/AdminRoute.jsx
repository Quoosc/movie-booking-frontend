// src/routes/AdminRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/utils/constants";

export default function AdminRoute() {
  const { currentUser } = useAuth() || {};
  if (!currentUser) return <Navigate to="/auth/login" replace />;
  if (currentUser.role !== ROLES.ADMIN) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}
