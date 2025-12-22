// src/layouts/AdminSidebar.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useMemo, useState } from "react";

const adminNavItems = [
  { id: "dashboard", label: "Tổng quan", path: "/admin" },
  { id: "movies", label: "Quản lý phim", path: "/admin/movies" },
  { id: "cinemas", label: "Rạp chiếu", path: "/admin/cinemas" },
  { id: "showtimes", label: "Suất chiếu", path: "/admin/showtimes" },
  { id: "seats", label: "Ghế & layout", path: "/admin/seats" },
  { id: "rooms", label: "Phòng chiếu", path: "/admin/rooms" },
  { id: "pricing", label: "Giá & ticket", path: "/admin/pricing" },
  { id: "promotions", label: "Khuyến mãi", path: "/admin/promotions" },
  { id: "membership", label: "Membership tiers", path: "/admin/membership" },
  { id: "users", label: "Người dùng", path: "/admin/users" },
  { id: "orders", label: "Đơn / thanh toán", path: "/admin/orders" },
  { id: "snacks", label: "Bắp nước", path: "/admin/snacks" },
  { id: "bookings", label: "Bookings / vé", path: "/admin/bookings" },
];

export default function AdminSidebar({ isMobile = false }) {
  const location = useLocation();
  const navigate = useNavigate();

  const { user: currentUser } = useAuth() || {};

  const displayName =
    currentUser?.username ||
    currentUser?.email ||
    "Admin CinesVerse";

  const avatarSrc = useMemo(() => {
    return (
      currentUser?.avatar_url ||
      currentUser?.avatarUrl ||
      currentUser?.avatar ||
      ""
    );
  }, [currentUser]);

  const [imgError, setImgError] = useState(false);

  const containerCls = `
    relative rounded-3xl overflow-hidden
    bg-gradient-to-b from-[#14002f]/90 via-[#0b001f] to-black/95
    border border-white/10 backdrop-blur-xl shadow-2xl
  `;

  return (
    <aside className={containerCls}>
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-transparent to-emerald-600/20 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400" />

      <div className="relative p-5 pb-7">
        {/* avatar admin */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
          <div className="relative">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-violet-400 via-fuchsia-500 to-emerald-400 p-[2px] shadow-lg shadow-purple-500/30">
              <div className="h-full w-full rounded-2xl bg-[#0b001f] flex items-center justify-center overflow-hidden">
                {avatarSrc && !imgError ? (
                  <img
                    src={avatarSrc}
                    alt="Admin avatar"
                    className="h-full w-full object-cover"
                    onError={() => setImgError(true)}
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-lg font-bold">
                    {(displayName?.[0] || "A").toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-emerald-500 border-2 border-[#0b001f] text-[9px] font-bold tracking-wide">
              ADMIN
            </div>
          </div>

          <div className="flex-1">
            <p className="text-xs font-semibold text-white/70 mb-0.5">
              Bảng điều khiển
            </p>
            <h3 className="text-sm font-extrabold text-white tracking-wide line-clamp-1">
              {displayName}
            </h3>
          </div>
        </div>

        {/* nav */}
        <nav className={isMobile ? "grid grid-cols-2 gap-2" : "space-y-2.5"}>
          {adminNavItems.map((item) => {
            const isActive =
              item.path === "/admin"
                ? location.pathname === "/admin"
                : location.pathname.startsWith(item.path);

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`relative group overflow-hidden w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold tracking-wide transition-all duration-300
                  ${
                    isActive
                      ? "bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400 text-black shadow-xl shadow-purple-500/50"
                      : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10"
                  }`}
              >
                <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                <span className="relative z-10 text-left">{item.label}</span>

                {isActive && (
                  <span className="relative z-10">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
