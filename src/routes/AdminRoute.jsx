// src/routes/AdminRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  // Đang load profile từ cookie
  if (loading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center text-white">
        Đang tải...
      </div>
    );
  }

  // Chưa đăng nhập -> đá về trang login
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/auth/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // Không phải ADMIN -> đá về trang chủ
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Đúng ADMIN -> render children (AdminLayout + routes con)
  return children;
}
