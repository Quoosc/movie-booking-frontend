// src/app/(public)/checkout-success/CheckoutSuccessPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import HomeButton from "@/components/shared/Buttons/HomeButton";
import { getBookingById } from "@/api/bookingService";
import { useAuth } from "@/context/AuthContext";

import QRCode from "react-qr-code";

function formatShowtime(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);

  const time = d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const weekday = d.toLocaleDateString("vi-VN", { weekday: "long" });
  const date = d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return `${time} ${weekday}, ${date}`;
}

function buildSeatList(seats = []) {
  if (!seats.length) return "";
  return seats
    .map((s) => `${s.rowLabel}${String(s.seatNumber).padStart(2, "0")}`)
    .join(", ");
}

function buildSeatTypeLabel(seats = []) {
  if (!seats.length) return "";
  const types = Array.from(new Set(seats.map((s) => s.seatType)));
  if (types.length === 1) {
    const t = types[0];
    if (t === "VIP") return "Ghế VIP";
    if (t === "COUPLE") return "Ghế đôi";
    return "Ghế Standard";
  }
  return "Nhiều loại ghế";
}

function calcSnackLineTotal(snack = {}) {
  const quantity = Number(snack.quantity ?? snack.qty ?? 0);
  if (Number.isFinite(snack.totalPrice)) return snack.totalPrice;
  const unitPrice = Number(
    snack.unitPrice ?? snack.price ?? snack.snack?.price ?? 0
  );
  const safeQty = Number.isFinite(quantity) ? quantity : 0;
  const safeUnit = Number.isFinite(unitPrice) ? unitPrice : 0;
  return safeQty * safeUnit;
}

export default function CheckoutSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { user } = useAuth();
  const isMemberUser = user?.role === "USER"; // chỉ member mới có lịch sử

  // ✅ Lấy bookingId từ nhiều nguồn
  const bookingFromState = location.state?.booking;
  const bookingIdFromState = 
    location.state?.bookingId || 
    bookingFromState?.bookingId || 
    bookingFromState?.id;
  const bookingIdFromQuery = searchParams.get("bookingId");
  const bookingId = bookingIdFromState || bookingIdFromQuery;

  const methodFromState = location.state?.paymentMethod;
  const methodFromQuery = searchParams.get("method");
  const paymentMethod = (
    methodFromState ||
    methodFromQuery ||
    ""
  ).toUpperCase();

  // ✅ Lưu qrPayload từ state (nếu có)
  const qrPayloadFromState = bookingFromState?.qrPayload;

  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bookingId) {
      setError("Thiếu mã đặt vé (bookingId).");
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    (async () => {
      try {
        setIsLoading(true);
        console.log("🔍 [CheckoutSuccess] Gọi API getBookingById:", bookingId);
        const data = await getBookingById(bookingId);
        console.log("✅ [CheckoutSuccess] Booking từ API:", data);
        
        if (isMounted) {
          // ✅ Merge qrPayload từ state nếu API không trả về
          const finalBooking = {
            ...data,
            qrPayload: data.qrPayload || qrPayloadFromState || ""
          };
          setBooking(finalBooking);
        }
      } catch (err) {
        console.error("❌ [CheckoutSuccess] Lỗi API:", err);
        if (isMounted) {
          setError(err.message || "Không tải được thông tin vé.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [bookingId, qrPayloadFromState]);

  const formattedShowtime = useMemo(() => {
    const iso = booking?.showtimeStartTime || booking?.startTime;
    return booking ? formatShowtime(iso) : "";
  }, [booking]);

  const seatList = useMemo(
    () => (booking ? buildSeatList(booking.seats) : ""),
    [booking]
  );

  const seatTypeLabel = useMemo(
    () => (booking ? buildSeatTypeLabel(booking.seats) : ""),
    [booking]
  );

  const ticketCount = booking?.seats?.length || 0;
  const snacks = useMemo(
    () => booking?.snacks || booking?.bookingSnacks || [],
    [booking]
  );
  const hasSnacks = Array.isArray(snacks) && snacks.length > 0;
  const snackTotal = useMemo(
    () =>
      hasSnacks
        ? snacks.reduce((sum, sn) => sum + calcSnackLineTotal(sn), 0)
        : 0,
    [hasSnacks, snacks]
  );

  const headerPaymentText =
    paymentMethod === "MOMO"
      ? "BẰNG MOMO"
      : paymentMethod === "PAYPAL"
      ? "BẰNG PAYPAL"
      : "";

  const posterUrl =
    location.state?.movie?.posterUrl ||
    booking?.PosterUrl ||
    booking?.posterUrl ||
    "https://via.placeholder.com/300x450?text=Movie";

  // ✅ NEW: qrPayload từ BE
  const qrPayload = booking?.qrPayload || "";

  const bookingCode = (booking?.bookingId || booking?.id || bookingId || "")
    .slice(0, 8)
    .toUpperCase();

  return (
    <div
      className="min-h-screen flex flex-col bg-gradient-to-b from-[#050018] via-[#050018]/98 to-[#050018]/94
 text-white relative overflow-hidden"
    >
      {/* Glow background */}
      <div className="pointer-events-none absolute -top-32 -left-24 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-10 h-96 w-96 rounded-full bg-indigo-500/25 blur-3xl" />

      <Navbar />

      <main className="flex-1 pt-6 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <h1 className="text-center text-2xl md:text-3xl font-extrabold tracking-[0.18em] mb-4 uppercase">
            CHÚC MỪNG BẠN ĐÃ THANH TOÁN{" "}
            {headerPaymentText && (
              <span className="bg-gradient-to-r from-fuchsia-400 via-pink-300 to-amber-300 bg-clip-text text-transparent">
                {headerPaymentText}
              </span>
            )}
          </h1>
          <p className="text-center text-xs md:text-sm text-white/70 mb-6">
            Vé đã được xác nhận. Vui lòng kiểm tra thông tin bên dưới trước khi
            tới rạp.
          </p>

          {/* Stepper */}
          <div className="flex justify-center mb-8">
            <ol className="flex items-center gap-8 md:gap-12 text-xs md:text-sm font-semibold uppercase tracking-[0.18em]">
              <li className="flex items-center gap-2 opacity-60">
                <span className="w-8 h-8 rounded-full border border-white/50 flex items-center justify-center text-[11px] md:text-xs">
                  1
                </span>
                <span className="hidden sm:inline">Thông tin khách hàng</span>
                <span className="inline sm:hidden">Khách hàng</span>
              </li>
              <li className="flex items-center gap-2 opacity-60">
                <span className="w-8 h-8 rounded-full border border-white/50 flex items-center justify-center text-[11px] md:text-xs">
                  2
                </span>
                <span className="hidden sm:inline">Thanh toán</span>
                <span className="inline sm:hidden">Thanh toán</span>
              </li>
              <li className="flex items-center gap-2 text-fuchsia-300">
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-400 via-purple-400 to-amber-300 text-black flex items-center justify-center text-[11px] md:text-xs shadow-[0_0_18px_rgba(244,114,182,0.8)]">
                  3
                </span>
                <span className="hidden sm:inline">Thông tin vé phim</span>
                <span className="inline sm:hidden">Vé phim</span>
              </li>
            </ol>
          </div>

          {/* Loading / Error */}
          {isLoading && (
            <p className="text-center text-sm md:text-base text-white/80">
              Đang tải thông tin vé, vui lòng đợi…
            </p>
          )}

          {!isLoading && error && (
            <div className="max-w-xl mx-auto bg-red-500/15 border border-red-400/50 rounded-3xl px-5 py-4 text-center text-sm md:text-base shadow-[0_18px_50px_rgba(0,0,0,0.65)]">
              <p className="font-medium mb-2">{error}</p>
              <button
                onClick={() => navigate("/")}
                className="mt-2 inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-2 text-xs md:text-sm font-semibold uppercase tracking-[0.18em] hover:bg-white hover:text-black transition"
              >
                Về trang chủ
              </button>
            </div>
          )}

          {/* ======= SECTION ĐƯỢC LÀM ĐẸP LẠI Ở ĐÂY ======= */}
          {!isLoading && !error && booking && (
            <section className="mt-6">
              {/* CARD LỚN: GRADIENT NHƯ YÊU CẦU */}
              <div className="max-w-4xl mx-auto rounded-[28px] bg-gradient-to-b from-[#050018] via-[#050018]/95 to-[#050018]/90 border border-white/20 shadow-[0_24px_80px_rgba(0,0,0,0.9)] overflow-hidden">
                {/* TOP: POSTER + QR trên nền trắng */}
                <div className="flex flex-col md:flex-row bg-white">
                  {/* Poster */}
                  <div className="md:w-1/2">
                    <img
                      src={posterUrl}
                      alt={booking.movieTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="md:w-1/2 flex items-center justify-center p-4 md:p-6">
                    <div className="w-full h-full flex items-center justify-center">
                      {/* tăng khung QR lên to bự */}
                      <div className="w-64 md:w-80 lg:w-96 aspect-square bg-white flex items-center justify-center rounded-2xl shadow-lg">
                        {qrPayload ? (
                          <div className="w-full h-full p-3 md:p-4">
                            <QRCode
                              value={qrPayload}
                              style={{ height: "100%", width: "100%" }}
                            />
                          </div>
                        ) : (
                          <div className="w-[90%] h-[90%] border-4 border-black/80 border-dashed flex items-center justify-center text-sm font-semibold text-black/70 text-center px-2">
                            QR CODE
                            <br />
                            (chưa có qrPayload)
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* BOTTOM: THANH INFO DÙNG GRADIENT TÍM ĐẬM NHƯ YÊU CẦU */}
                <div className="bg-gradient-to-b from-[#791dce] via-[#050018]/95 to-[#050038]/90 px-4 py-4 md:px-6 md:py-5 text-xs md:text-sm text-[#fff59d]">
                  {/* Tên phim */}
                  <p className="font-bold text-sm md:text-base text-white uppercase mb-1">
                    {booking.movieTitle}
                  </p>

                  {booking.movieDescription && (
                    <p className="mb-2 leading-snug">
                      {booking.movieDescription}
                    </p>
                  )}

                  <p className="mb-3 text-[#fff59d]">{booking.cinemaName}</p>

                  <div className="grid grid-cols-[auto,1fr] gap-x-8 gap-y-1.5">
                    <span className="font-semibold text-white">Mã đặt vé</span>
                    <span>{bookingCode}</span>

                    <span className="font-semibold text-white">Thời gian</span>
                    <span>{formattedShowtime}</span>

                    <span className="font-semibold text-white">
                      Phòng chiếu
                    </span>
                    <span>{booking.roomName}</span>

                    <span className="font-semibold text-white">Số vé</span>
                    <span>{ticketCount}</span>

                    <span className="font-semibold text-white">Loại ghế</span>
                    <span>{seatTypeLabel}</span>

                    <span className="font-semibold text-white">Số ghế</span>
                    <span>{seatList}</span>
                  </div>

                  {hasSnacks && (
                    <div className="mt-4 rounded-2xl bg-white/10 border border-white/15 px-3 py-3 md:px-4 md:py-4">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <p className="font-semibold text-white">
                          Bắp nước / Combo
                        </p>
                        <span className="text-sm font-semibold text-amber-200">
                          {snackTotal.toLocaleString("vi-VN")}₫
                        </span>
                      </div>
                      <div className="space-y-2">
                        {snacks.map((snack, idx) => {
                          const qty = snack.quantity ?? snack.qty ?? 0;
                          const lineTotal = calcSnackLineTotal(snack);
                          return (
                            <div
                              key={
                                snack.snackId ||
                                snack.bookingSnackId ||
                                snack.id ||
                                idx
                              }
                              className="flex items-center justify-between gap-3 rounded-xl bg-black/20 border border-white/10 px-3 py-2"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {snack.imageUrl && (
                                  <img
                                    src={snack.imageUrl}
                                    alt={
                                      snack.name || snack.snackName || "Snack"
                                    }
                                    className="w-10 h-10 rounded-lg object-cover"
                                  />
                                )}
                                <div className="min-w-0">
                                  <p className="font-semibold text-sm md:text-base leading-tight truncate">
                                    {snack.name ||
                                      snack.snackName ||
                                      "Bắp nước"}
                                  </p>
                                  <p className="text-[11px] text-white/70">
                                    SL: {qty}
                                  </p>
                                </div>
                              </div>
                              <span className="text-sm md:text-base font-semibold text-amber-200 whitespace-nowrap">
                                {lineTotal.toLocaleString("vi-VN")}₫
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-semibold text-white">Tổng tiền</span>
                    <span className="font-extrabold text-[18px] md:text-[20px] text-yellow-300">
                      {booking.finalPrice?.toLocaleString("vi-VN")}₫
                    </span>
                    {booking.discountValue > 0 && (
                      <span className="text-[11px] md:text-xs">
                        (Đã giảm{" "}
                        <span className="font-semibold text-emerald-200">
                          {booking.discountValue?.toLocaleString("vi-VN")}₫
                        </span>{" "}
                        từ{" "}
                        <span className="line-through text-yellow-200/70">
                          {booking.totalPrice?.toLocaleString("vi-VN")}₫
                        </span>
                        )
                      </span>
                    )}
                  </div>

                  {booking.bookedAt && (
                    <p className="mt-2 text-[11px] md:text-xs text-yellow-100/80 italic">
                      Thời điểm đặt:{" "}
                      {new Date(booking.bookedAt).toLocaleString("vi-VN")}
                    </p>
                  )}
                </div>
              </div>

              {/* Nút điều hướng bên dưới card */}
              <div className="mt-7 flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4">
                <HomeButton />
                {isMemberUser && (
                  <button
                    onClick={() => navigate("/account/account-history")}
                    className="inline-flex items-center justify-center rounded-full border border-white/40 px-7 py-2.5 text-xs md:text-sm font-semibold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
                  >
                    Xem lịch sử đặt vé
                  </button>
                )}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

// // src/app/(public)/checkout-success/page.jsx
// //spring
// import { useEffect, useMemo, useState } from "react";
// import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

// import Navbar from "@/components/common/Navbar";
// import Footer from "@/components/common/Footer";
// import HomeButton from "@/components/shared/Buttons/HomeButton";
// import { useAuth } from "@/context/AuthContext";

// import { capturePayment } from "@/api/paymentService";
// import QRCode from "react-qr-code";

// function formatShowtime(isoString) {
//   if (!isoString) return "";
//   const d = new Date(isoString);

//   const time = d.toLocaleTimeString("vi-VN", {
//     hour: "2-digit",
//     minute: "2-digit",
//   });

//   const weekday = d.toLocaleDateString("vi-VN", { weekday: "long" });
//   const date = d.toLocaleDateString("vi-VN", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//   });

//   return `${time} ${weekday}, ${date}`;
// }

// function buildSeatList(seats = []) {
//   if (!seats.length) return "";
//   return seats
//     .map((s) => `${s.rowLabel}${String(s.seatNumber).padStart(2, "0")}`)
//     .join(", ");
// }

// function buildSeatTypeLabel(seats = []) {
//   if (!seats.length) return "";
//   const types = Array.from(new Set(seats.map((s) => s.seatType)));
//   if (types.length === 1) {
//     const t = types[0];
//     if (t === "VIP") return "Ghế VIP";
//     if (t === "COUPLE") return "Ghế đôi";
//     return "Ghế Standard";
//   }
//   return "Nhiều loại ghế";
// }

// function calcSnackLineTotal(snack = {}) {
//   const quantity = Number(snack.quantity ?? snack.qty ?? 0);
//   if (Number.isFinite(snack.totalPrice)) return snack.totalPrice;
//   const unitPrice = Number(
//     snack.unitPrice ?? snack.price ?? snack.snack?.price ?? 0
//   );
//   const safeQty = Number.isFinite(quantity) ? quantity : 0;
//   const safeUnit = Number.isFinite(unitPrice) ? unitPrice : 0;
//   return safeQty * safeUnit;
// }

// export default function CheckoutSuccessPage() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();

//   const { user } = useAuth();
//   const isMemberUser = user?.role === "USER";

//   // ✅ ưu tiên booking từ state (đến từ PaymentCallbackPage)
//   const bookingFromState = location.state?.booking || null;

//   // ✅ fallback nếu user F5 mất state → gọi lại capture bằng query
//   const transactionId =
//     searchParams.get("transactionId") ||
//     searchParams.get("orderId") ||
//     searchParams.get("token") ||
//     searchParams.get("requestId") ||
//     searchParams.get("txnRef");

//   const paymentMethod =
//     String(
//       location.state?.paymentMethod ||
//         searchParams.get("paymentMethod") ||
//         searchParams.get("method") ||
//         ""
//     ).toUpperCase() || "";

//   const [booking, setBooking] = useState(bookingFromState);
//   const [isLoading, setIsLoading] = useState(!bookingFromState);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     // Nếu đã có booking từ state thì khỏi gọi API
//     if (bookingFromState) return;

//     // Nếu không có booking state thì cần query để capture lại
//     if (!transactionId || !paymentMethod) {
//       setError("Thiếu thông tin thanh toán (transactionId/paymentMethod).");
//       setIsLoading(false);
//       return;
//     }

//     let mounted = true;

//     (async () => {
//       try {
//         setIsLoading(true);
//         setError("");

//         const res = await capturePayment({ transactionId, paymentMethod });

//         const wrapper = res || {};
//         const data = wrapper.data || wrapper;

//         if (wrapper.code && wrapper.code !== 200) {
//           // Nếu BE trả 409 vì đã capture rồi → báo user quay lịch sử
//           if (wrapper.code === 409) {
//             throw new Error(
//               wrapper.message ||
//                 "Giao dịch đã được xử lý trước đó. Vui lòng kiểm tra lịch sử đặt vé."
//             );
//           }
//           throw new Error(wrapper.message || "Không tải được thông tin vé.");
//         }

//         if (mounted) setBooking(data);
//       } catch (err) {
//         if (mounted) setError(err?.message || "Không tải được thông tin vé.");
//       } finally {
//         if (mounted) setIsLoading(false);
//       }
//     })();

//     return () => {
//       mounted = false;
//     };
//   }, [bookingFromState, transactionId, paymentMethod]);

//   const formattedShowtime = useMemo(() => {
//     const iso = booking?.showtimeStartTime || booking?.startTime;
//     return booking ? formatShowtime(iso) : "";
//   }, [booking]);

//   const seatList = useMemo(
//     () => (booking ? buildSeatList(booking.seats) : ""),
//     [booking]
//   );

//   const seatTypeLabel = useMemo(
//     () => (booking ? buildSeatTypeLabel(booking.seats) : ""),
//     [booking]
//   );

//   const ticketCount = booking?.seats?.length || 0;

//   const snacks = useMemo(
//     () => booking?.snacks || booking?.bookingSnacks || [],
//     [booking]
//   );

//   const hasSnacks = Array.isArray(snacks) && snacks.length > 0;

//   const snackTotal = useMemo(
//     () =>
//       hasSnacks
//         ? snacks.reduce((sum, sn) => sum + calcSnackLineTotal(sn), 0)
//         : 0,
//     [hasSnacks, snacks]
//   );

//   const headerPaymentText =
//     paymentMethod === "MOMO"
//       ? "BẰNG MOMO"
//       : paymentMethod === "PAYPAL"
//       ? "BẰNG PAYPAL"
//       : "";

//   const posterUrl =
//     booking?.posterUrl ||
//     booking?.PosterUrl ||
//     location.state?.movie?.posterUrl ||
//     "https://via.placeholder.com/300x450?text=Movie";

//   const qrPayload = booking?.qrPayload || "";

//   const bookingCode = (booking?.bookingId || booking?.id || "")
//     .slice(0, 8)
//     .toUpperCase();

//   return (
//     <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#050018] via-[#050018]/98 to-[#050018]/94 text-white relative overflow-hidden">
//       <div className="pointer-events-none absolute -top-32 -left-24 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />
//       <div className="pointer-events-none absolute -bottom-40 -right-10 h-96 w-96 rounded-full bg-indigo-500/25 blur-3xl" />

//       <Navbar />

//       <main className="flex-1 pt-6 pb-16">
//         <div className="max-w-6xl mx-auto px-4">
//           <h1 className="text-center text-2xl md:text-3xl font-extrabold tracking-[0.18em] mb-4 uppercase">
//             CHÚC MỪNG BẠN ĐÃ THANH TOÁN{" "}
//             {headerPaymentText && (
//               <span className="bg-gradient-to-r from-fuchsia-400 via-pink-300 to-amber-300 bg-clip-text text-transparent">
//                 {headerPaymentText}
//               </span>
//             )}
//           </h1>

//           <p className="text-center text-xs md:text-sm text-white/70 mb-6">
//             Vé đã được xác nhận. Vui lòng kiểm tra thông tin bên dưới trước khi
//             tới rạp.
//           </p>

//           <div className="flex justify-center mb-8">
//             <ol className="flex items-center gap-8 md:gap-12 text-xs md:text-sm font-semibold uppercase tracking-[0.18em]">
//               <li className="flex items-center gap-2 opacity-60">
//                 <span className="w-8 h-8 rounded-full border border-white/50 flex items-center justify-center text-[11px] md:text-xs">
//                   1
//                 </span>
//                 <span className="hidden sm:inline">Thông tin khách hàng</span>
//                 <span className="inline sm:hidden">Khách hàng</span>
//               </li>
//               <li className="flex items-center gap-2 opacity-60">
//                 <span className="w-8 h-8 rounded-full border border-white/50 flex items-center justify-center text-[11px] md:text-xs">
//                   2
//                 </span>
//                 <span className="hidden sm:inline">Thanh toán</span>
//                 <span className="inline sm:hidden">Thanh toán</span>
//               </li>
//               <li className="flex items-center gap-2 text-fuchsia-300">
//                 <span className="w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-400 via-purple-400 to-amber-300 text-black flex items-center justify-center text-[11px] md:text-xs shadow-[0_0_18px_rgba(244,114,182,0.8)]">
//                   3
//                 </span>
//                 <span className="hidden sm:inline">Thông tin vé phim</span>
//                 <span className="inline sm:hidden">Vé phim</span>
//               </li>
//             </ol>
//           </div>

//           {isLoading && (
//             <p className="text-center text-sm md:text-base text-white/80">
//               Đang tải thông tin vé, vui lòng đợi…
//             </p>
//           )}

//           {!isLoading && error && (
//             <div className="max-w-xl mx-auto bg-red-500/15 border border-red-400/50 rounded-3xl px-5 py-4 text-center text-sm md:text-base shadow-[0_18px_50px_rgba(0,0,0,0.65)]">
//               <p className="font-medium mb-2">{error}</p>
//               <button
//                 onClick={() => navigate("/", { replace: true })}
//                 className="mt-2 inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-2 text-xs md:text-sm font-semibold uppercase tracking-[0.18em] hover:bg-white hover:text-black transition"
//               >
//                 Về trang chủ
//               </button>
//             </div>
//           )}

//           {!isLoading && !error && booking && (
//             <section className="mt-6">
//               <div className="max-w-4xl mx-auto rounded-[28px] bg-gradient-to-b from-[#050018] via-[#050018]/95 to-[#050018]/90 border border-white/20 shadow-[0_24px_80px_rgba(0,0,0,0.9)] overflow-hidden">
//                 <div className="flex flex-col md:flex-row bg-white">
//                   <div className="md:w-1/2">
//                     <img
//                       src={posterUrl}
//                       alt={booking.movieTitle}
//                       className="w-full h-full object-cover"
//                     />
//                   </div>

//                   <div className="md:w-1/2 flex items-center justify-center p-4 md:p-6">
//                     <div className="w-full h-full flex items-center justify-center">
//                       <div className="w-64 md:w-80 lg:w-96 aspect-square bg-white flex items-center justify-center rounded-2xl shadow-lg">
//                         {qrPayload ? (
//                           <div className="w-full h-full p-3 md:p-4">
//                             <QRCode
//                               value={qrPayload}
//                               style={{ height: "100%", width: "100%" }}
//                             />
//                           </div>
//                         ) : (
//                           <div className="w-[90%] h-[90%] border-4 border-black/80 border-dashed flex items-center justify-center text-sm font-semibold text-black/70 text-center px-2">
//                             QR CODE
//                             <br />
//                             (chưa có qrPayload)
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="bg-gradient-to-b from-[#791dce] via-[#050018]/95 to-[#050038]/90 px-4 py-4 md:px-6 md:py-5 text-xs md:text-sm text-[#fff59d]">
//                   <p className="font-bold text-sm md:text-base text-white uppercase mb-1">
//                     {booking.movieTitle}
//                   </p>

//                   <p className="mb-3 text-[#fff59d]">{booking.cinemaName}</p>

//                   <div className="grid grid-cols-[auto,1fr] gap-x-8 gap-y-1.5">
//                     <span className="font-semibold text-white">Mã đặt vé</span>
//                     <span>{bookingCode || "—"}</span>

//                     <span className="font-semibold text-white">Thời gian</span>
//                     <span>{formattedShowtime || "—"}</span>

//                     <span className="font-semibold text-white">Phòng chiếu</span>
//                     <span>{booking.roomName || "—"}</span>

//                     <span className="font-semibold text-white">Số vé</span>
//                     <span>{ticketCount}</span>

//                     <span className="font-semibold text-white">Loại ghế</span>
//                     <span>{seatTypeLabel || "—"}</span>

//                     <span className="font-semibold text-white">Số ghế</span>
//                     <span>{seatList || "—"}</span>
//                   </div>

//                   {hasSnacks && (
//                     <div className="mt-4 rounded-2xl bg-white/10 border border-white/15 px-3 py-3 md:px-4 md:py-4">
//                       <div className="flex items-center justify-between gap-2 mb-2">
//                         <p className="font-semibold text-white">
//                           Bắp nước / Combo
//                         </p>
//                         <span className="text-sm font-semibold text-amber-200">
//                           {snackTotal.toLocaleString("vi-VN")}₫
//                         </span>
//                       </div>

//                       <div className="space-y-2">
//                         {snacks.map((snack, idx) => {
//                           const qty = snack.quantity ?? snack.qty ?? 0;
//                           const lineTotal = calcSnackLineTotal(snack);
//                           return (
//                             <div
//                               key={snack.snackId || snack.id || idx}
//                               className="flex items-center justify-between gap-3 rounded-xl bg-black/20 border border-white/10 px-3 py-2"
//                             >
//                               <div className="flex items-center gap-3 min-w-0">
//                                 {snack.imageUrl && (
//                                   <img
//                                     src={snack.imageUrl}
//                                     alt={snack.name || "Snack"}
//                                     className="w-10 h-10 rounded-lg object-cover"
//                                   />
//                                 )}
//                                 <div className="min-w-0">
//                                   <p className="font-semibold text-sm md:text-base leading-tight truncate">
//                                     {snack.name || "Bắp nước"}
//                                   </p>
//                                   <p className="text-[11px] text-white/70">
//                                     SL: {qty}
//                                   </p>
//                                 </div>
//                               </div>
//                               <span className="text-sm md:text-base font-semibold text-amber-200 whitespace-nowrap">
//                                 {lineTotal.toLocaleString("vi-VN")}₫
//                               </span>
//                             </div>
//                           );
//                         })}
//                       </div>
//                     </div>
//                   )}

//                   <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
//                     <span className="font-semibold text-white">Tổng tiền</span>
//                     <span className="font-extrabold text-[18px] md:text-[20px] text-yellow-300">
//                       {Number(booking.finalPrice ?? booking.totalPrice ?? 0).toLocaleString(
//                         "vi-VN"
//                       )}
//                       ₫
//                     </span>

//                     {Number(booking.discountValue || 0) > 0 && (
//                       <span className="text-[11px] md:text-xs">
//                         (Đã giảm{" "}
//                         <span className="font-semibold text-emerald-200">
//                           {Number(booking.discountValue || 0).toLocaleString("vi-VN")}₫
//                         </span>{" "}
//                         từ{" "}
//                         <span className="line-through text-yellow-200/70">
//                           {Number(booking.totalPrice || 0).toLocaleString("vi-VN")}₫
//                         </span>
//                         )
//                       </span>
//                     )}
//                   </div>

//                   {booking.bookedAt && (
//                     <p className="mt-2 text-[11px] md:text-xs text-yellow-100/80 italic">
//                       Thời điểm đặt:{" "}
//                       {new Date(booking.bookedAt).toLocaleString("vi-VN")}
//                     </p>
//                   )}
//                 </div>
//               </div>

//               <div className="mt-7 flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4">
//                 <HomeButton />
//                 {isMemberUser && (
//                   <button
//                     onClick={() => navigate("/account/account-history")}
//                     className="inline-flex items-center justify-center rounded-full border border-white/40 px-7 py-2.5 text-xs md:text-sm font-semibold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
//                   >
//                     Xem lịch sử đặt vé
//                   </button>
//                 )}
//               </div>
//             </section>
//           )}
//         </div>
//       </main>

//       <Footer />
//     </div>
//   );
// }
