// src/app/(protected)/account/account-history/[bookingId]/page.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { useAuth } from "@/context/AuthContext";
import { getBookingDetail } from "@/api/bookingService";
import QRCode from "react-qr-code";

const STATUS_BADGES = {
  PENDING_PAYMENT: {
    label: "Chờ thanh toán",
    className: "bg-amber-400/10 text-amber-200 border-amber-400/40",
  },
  PENDING: {
    label: "Đang xử lý",
    className: "bg-amber-400/10 text-amber-200 border-amber-400/40",
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

const PAYMENT_BADGES = {
  SUCCESS: {
    label: "Thành công",
    className: "bg-emerald-400/10 text-emerald-300 border-emerald-400/40",
  },
  PENDING: {
    label: "Đang chờ",
    className: "bg-amber-400/10 text-amber-200 border-amber-400/40",
  },
  FAILED: {
    label: "Thất bại",
    className: "bg-red-400/10 text-red-300 border-red-400/40",
  },
  REFUND_PENDING: {
    label: "Đang hoàn",
    className: "bg-sky-400/10 text-sky-300 border-sky-400/40",
  },
  REFUNDED: {
    label: "Đã hoàn tiền",
    className: "bg-indigo-400/10 text-indigo-300 border-indigo-400/40",
  },
};

function formatCurrency(value) {
  if (value == null) return "--";
  const n = Number(value);
  if (!Number.isFinite(n)) return "--";
  return n.toLocaleString("vi-VN") + "₫";
}

export default function BookingDetailPage() {
  const { isAuthenticated, user, logout } = useAuth();
  const currentUser = user;
  const { bookingId } = useParams();
  const nav = useNavigate();
  const location = useLocation();
  const avatarUrl = currentUser?.avatarUrl || currentUser?.avatarURL;

  const displayName =
    currentUser?.username || currentUser?.email || "Thành viên";
  const tierName = currentUser?.membershipTier?.name || "Member";
  const discount = currentUser?.membershipTier?.discountValue || 0;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!bookingId) return;
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const data = await getBookingDetail(bookingId);
        setBooking(data);
      } catch (error) {
        console.error("getBookingDetail error:", error);
        setErr("Không tải được chi tiết vé. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [bookingId]);

  const {
    statusInfo,
    paymentInfo,
    hasSnacks,
    showtimeDateText,
    showtimeTimeText,
    ticketTotalCalc,
    snackTotalCalc,
    discountValueCalc,
    grandTotalCalc,
  } = useMemo(() => {
    if (!booking) {
      return {
        statusInfo: null,
        paymentInfo: null,
        hasSnacks: false,
        showtimeDateText: "",
        showtimeTimeText: "",
        ticketTotalCalc: 0,
        snackTotalCalc: 0,
        discountValueCalc: 0,
        grandTotalCalc: 0,
      };
    }

    const toNum = (v) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };

    const bookingStatus = booking.bookingStatus || booking.status;
    const status =
      STATUS_BADGES[bookingStatus] ||
      STATUS_BADGES[bookingStatus?.toUpperCase?.()] ||
      null;

    // ✅ FIX: ưu tiên payment.status từ BE mới
    const payStatusRaw = booking?.payment?.status || booking.paymentStatus;
    const payment =
      (payStatusRaw && PAYMENT_BADGES[payStatusRaw]) ||
      (payStatusRaw && PAYMENT_BADGES[payStatusRaw?.toUpperCase?.()]) ||
      null;

    const seatsArr = booking.seats || booking.bookingSeats || [];
    const snacksArr = booking.snacks || booking.bookingSnacks || [];
    const hasSnacks = Array.isArray(snacksArr) && snacksArr.length > 0;

    // ✅ Ticket total: ưu tiên field từ BE nếu có, không có thì tự sum seats
    const ticketTotalFromBE =
      booking.ticketTotal ?? booking.subtotal ?? booking.ticketSubtotal;
    const ticketTotalCalc =
      toNum(ticketTotalFromBE) ||
      seatsArr.reduce((sum, s) => sum + toNum(s.finalPrice ?? s.price), 0);

    // ✅ Snack total: ưu tiên field từ BE nếu có, không có thì tự sum snacks
    const snackTotalFromBE =
      booking.snackTotal ?? booking.snacksTotal ?? booking.snackSubtotal;
    const snackTotalCalc =
      toNum(snackTotalFromBE) ||
      snacksArr.reduce((sum, sn) => {
        const lineTotal =
          toNum(sn.totalPrice) ||
          toNum(sn.quantity) * toNum(sn.unitPrice ?? sn.price);
        return sum + lineTotal;
      }, 0);

    const discountValueCalc = toNum(booking.discountValue);

    // ✅ Grand total: ưu tiên finalPrice/totalPrice từ BE nếu có
    const grandTotalFromBE = booking.finalPrice ?? booking.totalPrice;
    const grandTotalCalc =
      toNum(grandTotalFromBE) ||
      Math.max(0, ticketTotalCalc + snackTotalCalc - discountValueCalc);

    let showtimeDateText = "";
    let showtimeTimeText = "";
    if (booking.showtimeStartTime) {
      const d = new Date(booking.showtimeStartTime);
      showtimeDateText = d.toLocaleDateString("vi-VN", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      showtimeTimeText = d.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return {
      statusInfo: status,
      paymentInfo: payment,
      hasSnacks,
      showtimeDateText,
      showtimeTimeText,
      ticketTotalCalc,
      snackTotalCalc,
      discountValueCalc,
      grandTotalCalc,
    };
  }, [booking]);

  const handleNavigate = (path) => {
    if (location.pathname === path) return;
    nav(path);
  };

  const handleLogoutClick = async () => {
    await logout();
    nav("/");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#050018] via-[#050018]/95 to-black text-white">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md text-center space-y-3">
            <h1 className="text-xl font-bold">Bạn chưa đăng nhập</h1>
            <p className="text-sm text-white/60">
              Hãy đăng nhập để xem chi tiết vé của bạn.
            </p>
            <button
              onClick={() => nav("/auth/login")}
              className="mt-3 inline-flex items-center justify-center rounded-2xl bg-white text-black text-xs font-semibold px-4 py-2 hover:bg-white/90"
            >
              Đăng nhập ngay
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ✅ QR payload từ BE
  const qrPayload = booking?.qrPayload || "";

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

      <main className="flex-1 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="mb-10 text-center md:text-left">
            <p className="text-xs font-bold tracking-[0.4em] uppercase text-cyan-400/70 mb-3">
              BOOKING DETAIL
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-[0.15em] uppercase">
              <span className="bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl">
                CHI TIẾT VÉ XEM PHIM
              </span>
            </h1>
            {booking && (
              <p className="mt-4 text-sm md:text-base text-white/60">
                Mã đặt chỗ:{" "}
                <span className="font-bold text-cyan-300">
                  {booking.bookingCode || booking.bookingId || bookingId}
                </span>
              </p>
            )}
          </div>

          <div className="grid lg:grid-cols-[280px,1fr] gap-8 items-start">
            {/* SIDEBAR ACCOUNT BOX */}
            <aside className="hidden lg:block top-28 h-fit rounded-3xl overflow-hidden bg-gradient-to-b from-[#14002f]/90 via-[#0b001f] to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-transparent to-emerald-600/20 pointer-events-none" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400" />

              <div className="relative p-6 pb-8">
                {/* User Card */}
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
                    {discount > 0 && (
                      <p className="text-[10px] text-white/70 mt-1">
                        Ưu đãi{" "}
                        <span className="text-emerald-400 font-bold">
                          {discount}%
                        </span>{" "}
                        trên vé
                      </p>
                    )}
                  </div>
                </div>

                {/* Navigation */}
                <nav className="space-y-3">
                  {[
                    {
                      label: "Thông tin khách hàng",
                      path: "/account/account-profile",
                    },
                    {
                      label: "Thành viên CinesVerse",
                      path: "/account/account-member",
                    },
                    {
                      label: "Lịch sử mua hàng",
                      path: "/account/account-history",
                    },
                    {
                      label: "Đổi mật khẩu",
                      path: "/account/account-password",
                    },
                  ].map((item) => {
                    const isActive = location.pathname.startsWith(item.path);
                    return (
                      <button
                        key={item.path}
                        onClick={() => handleNavigate(item.path)}
                        className={`w-full flex items-center gap-3.5 px-5 py-3.5 rounded-2xl text-left font-semibold text-sm tracking-wide transition-all duration-300 group relative overflow-hidden ${
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

                {/* Logout */}
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

            {/* MAIN BOOKING DETAIL */}
            <div className="space-y-8">
              {loading ? (
                <div className="flex items-center justify-center h-96">
                  <p className="text-lg text-white/60">
                    Đang tải chi tiết vé...
                  </p>
                </div>
              ) : err ? (
                <div className="text-center py-20">
                  <p className="text-red-400 text-lg">{err}</p>
                </div>
              ) : !booking ? (
                <div className="text-center py-32">
                  <p className="text-2xl font-bold text-white/60">
                    Không tìm thấy vé
                  </p>
                </div>
              ) : (
                <>
                  {/* Thông tin phim + trạng thái */}
                  <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a0033]/90 via-[#0f001f] to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/20 via-fuchsia-500/10 to-transparent" />
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400" />

                    <div className="relative p-8 md:p-10">
                      <div className="grid md:grid-cols-2 gap-8 items-start">
                        <div>
                          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                            {booking.movieTitle}
                          </h2>
                          <div className="space-y-3 text-sm">
                            <p className="text-white/80">
                              <span className="text-white/50">Rạp:</span>{" "}
                              <span className="font-bold">
                                {booking.cinemaName}
                              </span>
                            </p>
                            <p className="text-white/80">
                              <span className="text-white/50">Phòng:</span>{" "}
                              <span className="font-bold">
                                {booking.roomName}
                              </span>
                            </p>
                            <p className="text-white/80">
                              <span className="text-white/50">Suất chiếu:</span>{" "}
                              <span className="font-bold text-cyan-300">
                                {showtimeDateText} • {showtimeTimeText}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-4">
                          {statusInfo && (
                            <div
                              className={`rounded-2xl px-6 py-3 border text-sm font-bold ${statusInfo.className}`}
                            >
                              {statusInfo.label}
                            </div>
                          )}
                          {paymentInfo && (
                            <div
                              className={`rounded-2xl px-6 py-3 border text-sm font-bold ${paymentInfo.className}`}
                            >
                              Thanh toán: {paymentInfo.label}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* ✅ QR CODE SECTION */}
                  <section className="rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a0033]/90 via-[#0f001f] to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl">
                    <div className="p-8 md:p-10">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div>
                          <h3 className="text-xl md:text-2xl font-black">
                            <span className="bg-gradient-to-r from-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">
                              Vé điện tử / QR check-in
                            </span>
                          </h3>
                          <p className="mt-2 text-sm text-white/60">
                            Xuất trình QR này tại quầy để check-in nhanh.
                          </p>
                        </div>

                        <div className="w-full md:w-[420px]">
                          <div className="rounded-3xl bg-white p-4 md:p-5 shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
                            {qrPayload ? (
                              <div className="w-full aspect-square">
                                <QRCode
                                  value={qrPayload}
                                  style={{ width: "100%", height: "100%" }}
                                />
                              </div>
                            ) : (
                              <div className="w-full aspect-square border-4 border-black/70 border-dashed rounded-2xl flex items-center justify-center text-black/70 font-bold text-sm text-center px-3">
                                QR CODE
                                <br />
                                (chưa có qrPayload)
                              </div>
                            )}
                          </div>

                      
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Ghế + Tổng tiền */}
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Ghế */}
                    <section className="rounded-3xl bg-gradient-to-b from-white/5 via-white/2 to-transparent border border-white/10 backdrop-blur-xl shadow-2xl p-8">
                      <h3 className="text-xl font-black mb-6">
                        <span className="bg-gradient-to-r from-cyan-300 to-emerald-400 bg-clip-text text-transparent">
                          Ghế đã chọn
                        </span>
                      </h3>
                      <div className="space-y-4">
                        {(booking.seats || booking.bookingSeats || []).map(
                          (s, i) => {
                            const label =
                              s.seatLabel ||
                              `${s.rowLabel || s.row}${
                                s.seatNumber || s.number
                              }`;
                            const seatPrice = s.price ?? s.finalPrice;

                            return (
                              <div
                                key={i}
                                className="flex items-center justify-between rounded-2xl bg-white/5 border border-white/10 px-6 py-4"
                              >
                                <div>
                                  <p className="font-bold text-lg">{label}</p>
                                  <p className="text-xs text-white/60">
                                    {s.seatTypeLabel ||
                                      s.seatType ||
                                      "Ghế thường"}
                                  </p>
                                </div>
                                <p className="text-xl font-bold text-emerald-400">
                                  {seatPrice == null
                                    ? "--"
                                    : formatCurrency(seatPrice)}
                                </p>
                              </div>
                            );
                          }
                        )}
                      </div>
                    </section>

                    {/* Tổng tiền */}
                    <section className="rounded-3xl bg-gradient-to-b from-white/5 via-white/2 to-transparent border border-white/10 backdrop-blur-xl shadow-2xl p-8">
                      <h3 className="text-xl font-black mb-6">
                        <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                          Tổng thanh toán
                        </span>
                      </h3>
                      <div className="space-y-4 text-lg">
                        <div className="flex justify-between">
                          <span className="text-white/70">Tiền vé</span>
                          <span className="font-bold">
                            {formatCurrency(ticketTotalCalc)}
                          </span>
                        </div>

                        {hasSnacks && (
                          <div className="flex justify-between">
                            <span className="text-white/70">Bắp nước</span>
                            <span className="font-bold">
                              {formatCurrency(snackTotalCalc)}
                            </span>
                          </div>
                        )}

                        {discountValueCalc > 0 && (
                          <div className="flex justify-between text-emerald-400">
                            <span>Giảm giá</span>
                            <span className="font-bold">
                              -{formatCurrency(discountValueCalc)}
                            </span>
                          </div>
                        )}

                        <div className="pt-4 border-t border-white/20 flex justify-between text-2xl font-black">
                          <span>Tổng cộng</span>
                          <span className="text-emerald-400">
                            {formatCurrency(grandTotalCalc)}
                          </span>
                        </div>
                      </div>
                    </section>
                  </div>

                  {/* Bắp nước nếu có */}
                  {hasSnacks && (
                    <section className="rounded-3xl bg-gradient-to-b from-white/5 via-white/2 to-transparent border border-white/10 backdrop-blur-xl shadow-2xl p-8">
                      <h3 className="text-xl font-black mb-6">
                        <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                          Bắp nước đã đặt
                        </span>
                      </h3>
                      <div className="grid gap-4">
                        {(booking.snacks || booking.bookingSnacks || []).map(
                          (snack, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between rounded-2xl bg-white/5 border border-white/10 px-6 py-4"
                            >
                              <div>
                                <p className="font-bold">
                                  {snack.snackName || snack.name}
                                </p>
                                <p className="text-xs text-white/60">
                                  Số lượng: {snack.quantity}
                                </p>
                              </div>
                              <p className="text-xl font-bold text-orange-400">
                                {formatCurrency(
                                  (snack.quantity || 0) *
                                    (snack.unitPrice || snack.price || 0)
                                )}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </section>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
