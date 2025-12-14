// src/app/(protected)/account/account-history/page.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { useAuth } from "@/context/AuthContext";
import { getMyBookings } from "@/api/bookingService";

const STATUS_BADGES = {
  PENDING_PAYMENT: {
    label: "Chờ thanh toán",
    className: "bg-amber-400/10 text-amber-300 border-amber-400/40",
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    className: "bg-emerald-400/10 text-emerald-300 border-emerald-400/40",
  },
  CANCELLED: {
    label: "Đã hủy",
    className: "bg-red-400/10 text-red-300 border-red-400/40",
  },
  EXPIRED: {
    label: "Hết hạn",
    className: "bg-slate-400/10 text-slate-200 border-slate-400/40",
  },
  REFUND_PENDING: {
    label: "Đang hoàn tiền",
    className: "bg-sky-400/10 text-sky-300 border-sky-400/40",
  },
  REFUNDED: {
    label: "Đã hoàn tiền",
    className: "bg-indigo-400/10 text-indigo-300 border-indigo-400/40",
  },
};

const FILTERS = [
  { id: "ALL", label: "Tất cả" },
  { id: "UPCOMING", label: "Sắp chiếu" },
  { id: "PAST", label: "Đã xem" },
];

export default function AccountHistoryPage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const nav = useNavigate();
  const location = useLocation();
  const avatarUrl = currentUser?.avatarUrl || currentUser?.avatarURL;

  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // sidebar items
  const sidebarItems = [
    {
      id: "profile",
      label: "Thông tin khách hàng",
      path: "/account/account-profile",
    },
    {
      id: "member",
      label: "Thành viên CinesVerse",
      path: "/account/account-member",
    },
    {
      id: "history",
      label: "Lịch sử mua hàng",
      path: "/account/account-history",
    },
  ];

  const displayName =
    currentUser?.username || currentUser?.email || "Thành viên";

  const tierName = currentUser?.membershipTier?.name || "Member";

  const handleNavigate = (path) => {
    if (location.pathname === path) return;
    navigate(path);
  };

  const handleLogoutClick = async () => {
    try {
      if (typeof logout === "function") {
        await logout();
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      navigate("/auth/login");
    }
  };

  // Load bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const data = await getMyBookings(); // trả mảng BookingHistoryResponse
        setBookings(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("getMyBookings error:", err);
        setError("Không tải được lịch sử đặt vé.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    if (!bookings.length) return [];

    const now = new Date();
    return bookings.filter((b) => {
      if (statusFilter === "ALL") return true;

      const showtimeDate = b.showtimeStartTime
        ? new Date(b.showtimeStartTime)
        : null;

      if (!showtimeDate) return true;

      if (statusFilter === "UPCOMING") {
        return showtimeDate >= now;
      }

      if (statusFilter === "PAST") {
        return showtimeDate < now;
      }

      return true;
    });
  }, [bookings, statusFilter]);

  return (
    <div
      className="
        min-h-screen
        bg-gradient-to-b
        from-[#050024] via-[#0b0630] to-[#020015]
        text-white
        relative overflow-hidden
      "
    >
      {/* nền neon nhẹ */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-[10%] w-[420px] h-[420px] bg-[radial-gradient(circle_at_center,#8a66ff70,transparent)] blur-[110px]" />
        <div className="absolute top-[35%] right-[12%] w-[380px] h-[380px] bg-[radial-gradient(circle_at_center,#55e5ff55,transparent)] blur-[110px]" />
        <div className="absolute bottom-[-40px] left-1/3 w-[520px] h-[260px] bg-[radial-gradient(circle_at_center,#ff92ff40,transparent)] blur-[120px]" />
      </div>
      <Navbar />

      <main className="flex-1 pt-16 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="mb-12 text-center md:text-left">
            <p className="text-xs font-bold tracking-[0.4em] uppercase text-cyan-400/70 mb-3">
              HISTORY
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-[0.15em] uppercase">
              <span className="bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl">
                LỊCH SỬ ĐẶT VÉ
              </span>
            </h1>
            <p className="mt-4 text-sm md:text-base text-white/60 max-w-3xl mx-auto md:mx-0">
              Xem lại toàn bộ hành trình điện ảnh của bạn tại CinesVerse.
            </p>
          </div>

          <div className="grid lg:grid-cols-[280px,1fr] gap-8 items-start">
            {/* Sidebar cố định – ĐỒNG BỘ 100% với profile & member */}
            <aside className="hidden lg:block sticky top-28 h-fit rounded-3xl overflow-hidden bg-gradient-to-b from-[#14002f]/90 via-[#0b001f] to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-transparent to-emerald-600/20 pointer-events-none" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400" />

              <div className="relative p-6 pb-8">
                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/10">
                  <div className="relative">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-400 via-fuchsia-500 to-emerald-400 p-[2px] shadow-lg shadow-purple-500/30">
                      <div className="h-full w-full rounded-2xl bg-[#0b001f] flex items-center justify-center overflow-hidden">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={displayName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl font-bold">
                            {displayName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#0b001f] flex items-center justify-center text-[10px] font-bold">
                      {tierName[0]}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-extrabold text-white tracking-wider line-clamp-1">
                      {displayName}
                    </h3>
                    <p className="text-xs text-emerald-300 font-medium mt-0.5">
                      {tierName.toUpperCase()} MEMBER
                    </p>
                  </div>
                </div>

                <nav className="space-y-3">
                  {sidebarItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigate(item.path)}
                        className={`w-full flex items-center gap-3.5 px-5 py-3.5 rounded-2xl text-left font-semibold text-sm tracking-wide transition-all duration-300 group relative overflow-hidden
                    ${
                      isActive
                        ? "bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400 text-black shadow-xl shadow-purple-500/50"
                        : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10"
                    }`}
                      >
                        <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                        <span className="relative z-10">{item.label}</span>
                        {isActive && (
                          <span className="ml-auto relative z-10">
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
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

                <div className="mt-10 pt-6 border-t border-white/10">
                  <button
                    onClick={handleLogoutClick}
                    className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-red-600/80 to-rose-600/80 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm tracking-wider shadow-lg shadow-red-500/30 transition-all duration-300 hover:scale-[1.02]"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Đăng xuất
                  </button>
                </div>
              </div>
            </aside>

            {/* Right Content – Đẹp như CinesVerse bản chính chủ */}
            <div className="space-y-8">
              {/* Filter Bar */}
              <div className="rounded-3xl bg-gradient-to-r from-white/5 via-white/3 to-transparent border border-white/10 backdrop-blur-xl p-5 shadow-2xl">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="inline-flex rounded-2xl bg-white/5 border border-white/10 p-1.5">
                    {FILTERS.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setStatusFilter(f.id)}
                        className={`rounded-2xl px-6 py-3 text-sm font-bold transition-all duration-300
                    ${
                      statusFilter === f.id
                        ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm">
                    <span className="inline-flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-2 border border-white/10">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      Tổng:{" "}
                      <span className="font-bold text-emerald-300">
                        {bookings.length}
                      </span>{" "}
                      vé
                    </span>
                    {statusFilter !== "ALL" && (
                      <span className="inline-flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-2 border border-white/10">
                        Đang lọc:{" "}
                        <span className="font-bold text-cyan-300">
                          {FILTERS.find((f) => f.id === statusFilter)?.label}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Booking List */}
              <div className="space-y-5">
                {loading ? (
                  <div className="flex items-center justify-center h-96">
                    <p className="text-lg text-white/60">
                      Đang tải lịch sử đặt vé...
                    </p>
                  </div>
                ) : error ? (
                  <div className="text-center py-20">
                    <p className="text-red-400 text-lg">{error}</p>
                  </div>
                ) : filteredBookings.length === 0 ? (
                  <div className="text-center py-32">
                    <p className="text-2xl font-bold text-white/60 mb-4">
                      Chưa có lịch sử đặt vé
                    </p>
                    <p className="text-white/40">
                      Hãy chọn một bộ phim và bắt đầu hành trình CinesVerse của
                      bạn ✨
                    </p>
                  </div>
                ) : (
                  filteredBookings.map((b) => {
                    const statusInfo = STATUS_BADGES[b.status] ||
                      STATUS_BADGES[b.bookingStatus] || {
                        label: b.status || "UNKNOWN",
                        className:
                          "bg-slate-500/10 text-slate-300 border-slate-400/40",
                      };

                    const seatLabels = (b.seats || [])
                      .map((s) => `${s.rowLabel || s.row}${s.seatNumber}`)
                      .join(", ");
                    const startDate = b.showtimeStartTime
                      ? new Date(b.showtimeStartTime)
                      : null;
                    const isPast =
                      startDate && startDate.getTime() < Date.now();

                    return (
                      <div
                        key={b.bookingId}
                        className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a0033]/80 via-[#0f001f] to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl hover:shadow-purple-500/30 transition-all duration-500"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-transparent to-emerald-600/10" />
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400" />

                        <div className="relative p-6 md:p-8 flex flex-col lg:flex-row gap-6">
                          {/* Poster */}
                          <div className="w-full lg:w-48 h-64 lg:h-auto rounded-2xl overflow-hidden shadow-2xl">
                            <img
                              src={b.posterUrl || "/placeholder-movie.jpg"}
                              alt={b.movieTitle}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 space-y-4">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="text-2xl font-black text-white">
                                  {b.movieTitle}
                                </h3>
                                <div className="flex items-center gap-3 mt-2">
                                  <span
                                    className={`rounded-full border px-4 py-1.5 text-xs font-bold ${statusInfo.className}`}
                                  >
                                    {statusInfo.label}
                                  </span>
                                  {isPast && (
                                    <span className="text-xs text-white/60 italic">
                                      Đã xem xong
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="text-right">
                                <p className="text-sm text-white/50">
                                  Tổng thanh toán
                                </p>
                                <p className="text-3xl font-black text-emerald-400">
                                  {(
                                    b.finalPrice ??
                                    b.totalPrice ??
                                    0
                                  ).toLocaleString("vi-VN")}
                                  ₫
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-white/50">Rạp</p>
                                <p className="font-bold text-white">
                                  {b.cinemaName}
                                </p>
                              </div>
                              <div>
                                <p className="text-white/50">Phòng</p>
                                <p className="font-bold text-white">
                                  {b.roomName}
                                </p>
                              </div>
                              <div>
                                <p className="text-white/50">Suất chiếu</p>
                                <p className="font-bold text-white">
                                  {startDate?.toLocaleString("vi-VN", {
                                    weekday: "short",
                                    day: "2-digit",
                                    month: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                              <div>
                                <p className="text-white/50">Ghế</p>
                                <p className="font-bold text-cyan-300">
                                  {seatLabels || "N/A"}
                                </p>
                              </div>
                            </div>

                            {b.discountValue > 0 && (
                              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-400/40 px-4 py-2">
                                <span className="text-emerald-300 font-bold">
                                  Đã giảm{" "}
                                  {b.discountValue.toLocaleString("vi-VN")}₫ từ
                                  hạng thành viên
                                </span>
                              </div>
                            )}

                            <div className="pt-4 flex justify-end">
                              <button
                                className="rounded-2xl bg-white/10 border border-white/20 px-6 py-3 font-bold text-sm hover:bg-white/20 transition-all"
                                onClick={() =>
                                  nav(`/account/account-history/${b.bookingId}`)
                                }
                              >
                                Xem chi tiết vé
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
