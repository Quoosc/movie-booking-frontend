// src/routes/AdminRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function AdminRoute({ children }) {
  const { currentUser } = useAuth() || {};
  const location = useLocation();

  const role = currentUser?.role || currentUser?.userRole;

  if (!currentUser) {
    return (
      <Navigate to="/auth/login" replace state={{ from: location.pathname }} />
    );
  }

  if (role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return children;
}
