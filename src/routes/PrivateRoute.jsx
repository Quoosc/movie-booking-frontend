// src/routes/PrivateRoute.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function PrivateRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Đang load profile từ cookie
  if (loading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center text-white">
        Đang tải...
      </div>
    );
  }

  // Chưa login -> chuyển tới /auth/login
  if (!isAuthenticated) {
    return (
      <Navigate to="/auth/login" replace state={{ from: location.pathname }} />
    );
  }

  // Đã login -> render các route con bên trong
  return <Outlet />;
}
