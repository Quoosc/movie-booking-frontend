// src/layouts/AdminTopbar.jsx
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function AdminTopbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth() || {};

  const handleLogout = async () => {
    try {
      if (typeof logout === "function") {
        await logout();
      }
    } catch (e) {
      console.error("Admin logout error", e);
    } finally {
      navigate("/auth/login");
    }
  };

  const handleBackToSite = () => {
    // về trang chủ FE khách
    navigate("/");
  };

  const isDashboard = location.pathname === "/admin";

  return (
    <header className="relative z-20 border-b border-white/10 bg-black/40 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
        {/* logo + env */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-2 group"
          >
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-emerald-400 flex items-center justify-center text-lg font-black shadow-lg shadow-purple-500/40 group-hover:scale-105 transition-transform">
              CV
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold tracking-[0.28em] text-cyan-300/70 uppercase">
                CinesVerse
              </p>
              <p className="text-xs font-semibold text-white/80">
                Admin Panel {isDashboard ? "" : "· " + location.pathname}
              </p>
            </div>
          </button>

          <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-full bg-white/5 border border-white/15 text-[10px] font-semibold tracking-wide text-white/70">
            ENV: <span className="ml-1 text-emerald-300">LOCAL · v2.4 API</span>
          </span>
        </div>

        {/* actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBackToSite}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl border border-white/20 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white/80 transition-all"
          >
            <span>Về trang khách</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-red-600/80 to-rose-600/80 hover:from-red-500 hover:to-rose-500 text-xs font-bold text-white shadow-lg shadow-red-500/30 transition-all"
          >
            <svg
              className="w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                clipRule="evenodd"
              />
            </svg>
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </header>
  );
}
