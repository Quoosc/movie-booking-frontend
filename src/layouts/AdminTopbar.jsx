// src/layouts/AdminTopbar.jsx
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import { useMemo, useState } from "react";

export default function AdminTopbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user: currentUser, logout } = useAuth() || {};

  const isDashboard = location.pathname === "/admin";

  const displayName =
    currentUser?.username ||
    currentUser?.fullName ||
    currentUser?.name ||
    currentUser?.email ||
    "Admin";

  const roleLabel = currentUser?.role || currentUser?.userRole || "ADMIN";
  const avatarSrc = useMemo(() => {
    return (
      currentUser?.avatar_url ||
      currentUser?.avatarUrl ||
      currentUser?.avatar ||
      ""
    );
  }, [currentUser]);

  const [imgError, setImgError] = useState(false);

  const handleLogout = async () => {
    try {
      if (typeof logout === "function") {
        await logout();
      }
      toast.success("Đăng xuất thành công!");
    } catch (e) {
      console.error("Admin logout error", e);
    } finally {
      navigate("/auth/login", { replace: true });
    }
  };

  const handleBackToSite = () => navigate("/");

  return (
    <header className="relative z-20 border-b border-white/10 bg-gradient-to-r from-[#050018]/95 via-[#05001a]/90 to-[#050010]/95 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-emerald-400/60 via-fuchsia-400/60 to-cyan-400/60 opacity-80" />

      <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
        {/* LOGO + TITLE */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-3 group"
          >
            <div className="relative h-9 w-9 rounded-2xl overflow-hidden bg-gradient-to-br from-violet-500 via-fuchsia-500 to-emerald-400 p-[2px] shadow-[0_0_25px_rgba(168,85,247,0.65)] group-hover:scale-105 transition-transform">
              <div className="h-full w-full rounded-2xl bg-[#0b001f] overflow-hidden flex items-center justify-center">
                <img
                  src="/public/movies/—Pngtree—film festival logo popcorn and_4686389.png" 
                  alt="CineVerse"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            </div>

            <div className="text-left">
              <p className="text-[10px] font-bold tracking-[0.28em] text-cyan-300/80 uppercase">
                CinesVerse
              </p>
              <p className="text-xs font-semibold text-white/85">
                Admin Management{" "}
                {!isDashboard && (
                  <span className="text-[10px] text-white/55">
                    · {location.pathname.replace("/admin", "") || "/"}
                  </span>
                )}
              </p>
            </div>
          </button>

          <span className="hidden md:inline-flex items-center px-3 py-1 rounded-full bg-white/5 border border-white/12 text-[10px] font-semibold tracking-wide text-white/70 shadow-[0_0_18px_rgba(15,23,42,0.7)]">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400 mr-2 animate-pulse" />
            Bảng điều khiển bởi{" "}
            <span className="ml-1 text-emerald-300">{displayName}</span>
          </span>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-3">
          {/* Info user nhỏ (có ảnh) */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/5 border border-white/10 shadow-[0_0_16px_rgba(15,23,42,0.8)]">
            <div className="h-7 w-7 rounded-full overflow-hidden bg-gradient-to-br from-cyan-400 via-violet-500 to-pink-400 p-[1px]">
              <div className="h-full w-full rounded-full bg-[#0b001f] overflow-hidden flex items-center justify-center">
                {avatarSrc && !imgError ? (
                  <img
                    src={avatarSrc}
                    alt="Admin avatar"
                    className="h-full w-full object-cover"
                    onError={() => setImgError(true)}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-[11px] font-bold text-white">
                    {(displayName?.[0] || "A").toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            <div className="leading-tight">
              <p className="text-[11px] font-semibold text-white/90">
                {displayName}
              </p>
              <p className="text-[10px] uppercase tracking-[0.16em] text-emerald-300/80">
                {roleLabel}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleBackToSite}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl border border-white/15 bg-white/5/80 hover:bg-white/10 text-[11px] font-semibold text-white/85 tracking-wide transition-all shadow-[0_0_14px_rgba(15,23,42,0.9)]"
          >
            <svg className="w-4 h-4 opacity-80" viewBox="0 0 20 20" fill="none">
              <path
                d="M11.25 4.5L6.75 9l4.5 4.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 9h7"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Về trang khách</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-red-600/90 via-rose-600/90 to-orange-500/90 hover:from-red-500 hover:via-rose-500 hover:to-orange-400 text-[11px] font-bold text-white tracking-wide shadow-[0_0_22px_rgba(248,113,113,0.6)] transition-all"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                d="M11.25 4.5H6.5A2.5 2.5 0 0 0 4 7v6a2.5 2.5 0 0 0 2.5 2.5h4.75"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13.5 7.5L16 10l-2.5 2.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9.5 10H16"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </header>
  );
}
