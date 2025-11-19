// src/app/(public)/checkout/page.jsx

import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import HomeButton from "@/components/shared/Buttons/HomeButton";
// import { useAuth } from "@/context/AuthContext";
import {
  lockSeats,
  previewPrice,
  createBooking,
  createPaymentOrder,
} from "@/api/bookingService";


//Map từ mã UI sang enum PaymentMethod của BE (PAYPAL / MOMO)
function mapPaymentMethodForApi(uiMethod) {
  switch (uiMethod) {
    case "MOMO":
      return "MOMO";
    case "CARD_LOCAL":
    case "CARD_INTL":
    default:
      return "PAYPAL";
  }
}

function formatTime(sec) {
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  // const { currentUser } = useAuth();
  const currentUser = null; // tạm thời mock, giống MovieDetailPage

  const state = location.state || {};

  //   const {
  //   movie,
  //   showtime,          // { showtimeId, cinemaName, room, startTime, ... }
  //   selectedSeats,     // [{ seat_id, row, number, type }]
  //   ticketTypesUsed,   // [{ id, label, price, quantity }]
  //   selectedSnacks,    // object { snack_id: { snack_id, name, price, quantity } }
  // } = location.state || {};
  const {
    showtimeId,
    cinema, // { id, name, address, room }
    movie,
    seats = [],
    ticketTypes = [],
    snacks = {}, // { snack_id: {..., quantity} }
    priceSummary = { subtotal: 0, discount: 0, total: 0 },
  } = state;

  /* ===== redirect nếu vào thẳng /checkout không có state ===== */
  useEffect(() => {
    if (!showtimeId || !seats || seats.length === 0 || !movie || !cinema) {
      navigate("/", { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ===== STEP STATE ===== */
  const [step, setStep] = useState(1);

  /* ===== LOCK SEATS STATE ===== */
  const [lockInfo, setLockInfo] = useState(null);
  const [remainSeconds, setRemainSeconds] = useState(0);
  const [loadingLock, setLoadingLock] = useState(false);

  /* ===== WARNING POPUP ===== */
  const [warning, setWarning] = useState({
    open: false,
    title: "Lưu ý!",
    message: "",
  });

  const showWarning = (message, title = "Lưu ý!") => {
    setWarning({
      open: true,
      title,
      message,
    });
  };

  const closeWarning = () => {
    setWarning((prev) => ({ ...prev, open: false }));
  };

  /* ===== CUSTOMER INFO (STEP 1) ===== */
  const [customer, setCustomer] = useState(() => ({
    fullName: currentUser?.fullName || "",
    email: currentUser?.email || "",
    phone: currentUser?.phoneNumber || "",
  }));

  const handleChangeCustomer = (field, value) => {
    setCustomer((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* ===== PAYMENT (STEP 2) ===== */
  const [paymentMethod, setPaymentMethod] = useState(null); // "MOMO", "CARD_LOCAL", "CARD_INTL"
  const [submitting, setSubmitting] = useState(false);

  /* ===== LOCK SEATS KHI VÀO CHECKOUT (mock) ===== */
  useEffect(() => {
    if (!showtimeId || !seats || seats.length === 0) return;

    let cancelled = false;

    const doLock = async () => {
      try {
        setLoadingLock(true);
        const res = await lockSeats({
          showtimeId,
          userId: currentUser?.userId || null,
          seatIds: seats.map((s) => s.seat_id),
        });

        const data = res.data || res;

        if (!cancelled) {
          const seconds = data.remainingSeconds ?? 600;
          setLockInfo({
            lockId: data.lockId,
            expiresAt: data.expiresAt,
          });
          setRemainSeconds(seconds);
        }
      } catch (err) {
        console.error("lockSeats error", err);
        if (!cancelled) {
          showWarning(
            "Có lỗi xảy ra khi khóa ghế. Vui lòng thử lại hoặc chọn suất khác.",
            "Lỗi khóa ghế"
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingLock(false);
        }
      }
    };

    doLock();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showtimeId]);

  /* ===== COUNTDOWN TIMER ===== */
  useEffect(() => {
    if (!lockInfo?.expiresAt) return;

    const timer = setInterval(() => {
      const diff = Math.max(
        0,
        Math.floor((new Date(lockInfo.expiresAt).getTime() - Date.now()) / 1000)
      );
      setRemainSeconds(diff);
    }, 1000);

    return () => clearInterval(timer);
  }, [lockInfo?.expiresAt]);

  // Nếu hết thời gian giữ ghế → cảnh báo
  useEffect(() => {
    if (remainSeconds === 0 && lockInfo) {
      showWarning(
        "Đã hết thời gian giữ ghế. Vui lòng quay lại chọn ghế.",
        "Hết thời gian giữ vé"
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remainSeconds]);

  /* ===== DERIVED SUMMARY ===== */
  const totalTickets = useMemo(
    () => ticketTypes.reduce((sum, t) => sum + (t.quantity || 0), 0),
    [ticketTypes]
  );

  const selectedTicketTypes = useMemo(
    () => ticketTypes.filter((t) => t.quantity > 0),
    [ticketTypes]
  );

  const snackList = useMemo(() => Object.values(snacks || {}), [snacks]);

  const seatLabel = useMemo(
    () =>
      seats && seats.length
        ? seats.map((s) => `${s.row}${s.number}`).join(", ")
        : "",
    [seats]
  );

  /* ===== HANDLERS STEP 1 ===== */
  const handleBackToMovie = () => {
    navigate(-1);
  };

  const handleNextStep = () => {
    if (
      !customer.fullName.trim() ||
      !customer.email.trim() ||
      !customer.phone.trim()
    ) {
      showWarning("Vui lòng nhập đầy đủ Họ tên, Email và Số điện thoại.");
      return;
    }
    if (remainSeconds <= 0) {
      showWarning("Đã hết thời gian giữ ghế. Vui lòng quay lại chọn ghế.");
      return;
    }
    setStep(2);
  };

    /* ===== HANDLER STEP 2 (THANH TOÁN) ===== */

  // ==============================
  // BẢN ĐANG DÙNG HIỆN TẠI: MOCK
  // ==============================
  const handleSubmitPayment = async () => {
    if (!paymentMethod) {
      showWarning("Vui lòng chọn phương thức thanh toán.");
      return;
    }

    if (remainSeconds <= 0) {
      showWarning("Hết thời gian giữ ghế. Vui lòng quay lại chọn ghế.");
      return;
    }

    if (!showtimeId || !seats?.length) {
      showWarning("Thiếu thông tin suất chiếu hoặc ghế. Vui lòng đặt lại.");
      return;
    }

    setSubmitting(true);

    try {
      const seatIds = seats.map((s) => s.seat_id || s.seatId);
      const snacksArray = Object.values(snacks || {});
      const gatewayMethod = mapPaymentMethodForApi(paymentMethod);

      // Payload ticketTypes cho MOCK previewPrice: có cả price
      const ticketTypesPayload = ticketTypes.map((t) => ({
        id: t.ticketTypeId || t.id,
        label: t.label,
        price: t.price,
        quantity: t.quantity,
      }));

      // Snacks cho MOCK previewPrice: có cả price
      const snacksPayload = snacksArray.map((s) => ({
        snack_id: s.snackId || s.snack_id,
        price: s.price,
        quantity: s.quantity,
      }));

      // 1️⃣ MOCK: gọi previewPrice để test lại tổng tiền trên FE
      const previewRes = await previewPrice({
        showtimeId,
        seatIds,
        ticketTypes: ticketTypesPayload,
        snacks: snacksPayload,
        promotionCode: null,
        userId: currentUser?.userId || null,
      });

      const previewWrapper = previewRes || {};
      const previewData = previewWrapper.data || previewWrapper;
      const finalTotal =
        typeof previewData.total === "number"
          ? previewData.total
          : priceSummary.total;

      // 2️⃣ MOCK: tạo booking (PENDING_PAYMENT) bằng spec cũ showtimeId + seatIds
      const bookingRes = await createBooking({
        userId: currentUser?.userId || null,
        showtimeId,
        seatIds,
        snacks: snacksArray.map((s) => ({
          snack_id: s.snackId || s.snack_id,
          quantity: s.quantity,
        })),
        promotionCode: null,
      });

      const bookingWrapper = bookingRes || {};
      const bookingData = bookingWrapper.data || bookingWrapper;
      const bookingId =
        bookingData.booking_id ||
        bookingData.bookingId ||
        bookingData.id ||
        "mock-booking-id";

      // 3️⃣ MOCK: tạo lệnh thanh toán (không redirect thật)
      const paymentRes = await createPaymentOrder({
        bookingId,
        method: gatewayMethod, // "MOMO" | "PAYPAL"
        amount: finalTotal,
      });

      const paymentWrapper = paymentRes || {};
      const paymentData = paymentWrapper.data || paymentWrapper;

      showWarning(
        `MOCK THANH TOÁN\n\nBooking ID: ${bookingId}\nPayment ID: ${
          paymentData.paymentId || "mock-payment"
        }\nOrder ID: ${paymentData.orderId || "MOCK-ORDER"}\nMethod: ${
          gatewayMethod
        }\nSố tiền: ${finalTotal.toLocaleString()}đ\n\nSau khi BE hoàn tất, bước này sẽ redirect sang paymentUrl.`,
        "Thông báo (MOCK)"
      );
    } catch (err) {
      console.error("handleSubmitPayment (mock) error", err);
      showWarning("Có lỗi xảy ra trong quá trình thanh toán (mock).", "Lỗi");
    } finally {
      setSubmitting(false);
    }
  };

  /*
  // ==========================================
  // BẢN THẬT KHI NỐI BE + DB (REAL API FLOW)
  // - Dùng lockId từ /bookings/lock
  // - /bookings/price-preview
  // - /bookings/confirm
  // - /payments/order
  // ==========================================
  const handleSubmitPayment = async () => {
    if (!paymentMethod) {
      showWarning("Vui lòng chọn phương thức thanh toán.");
      return;
    }

    if (remainSeconds <= 0) {
      showWarning("Hết thời gian giữ ghế. Vui lòng quay lại chọn ghế.");
      return;
    }

    if (!showtimeId || !seats?.length) {
      showWarning("Thiếu thông tin suất chiếu hoặc ghế. Vui lòng đặt lại.");
      return;
    }

    if (!lockInfo?.lockId) {
      showWarning(
        "Không tìm thấy thông tin khóa ghế (lockId). Vui lòng đặt lại ghế.",
        "Lỗi"
      );
      return;
    }

    setSubmitting(true);

    try {
      const seatIds = seats.map((s) => s.seat_id || s.seatId);
      const snacksArray = Object.values(snacks || {});
      const gatewayMethod = mapPaymentMethodForApi(paymentMethod);

      // ticketTypes dạng API (không cần price): { ticketTypeId, quantity }
      const ticketTypesPayload = ticketTypes
        .filter((t) => t.quantity > 0)
        .map((t) => ({
          ticketTypeId: t.ticketTypeId || t.id,
          quantity: t.quantity,
        }));

      const snacksPayload = snacksArray
        .filter((s) => s.quantity > 0)
        .map((s) => ({
          snackId: s.snackId || s.snack_id,
          quantity: s.quantity,
        }));

      // 1️⃣ Gọi /bookings/price-preview để BE tính finalTotal
      const previewRes = await previewPrice({
        showtimeId,
        seatIds,
        ticketTypes: ticketTypesPayload,
        snacks: snacksPayload,
        promotionCode: null, // TODO: gắn promotionCode từ UI mã khuyến mãi
        userId: currentUser?.userId || null,
      });

      const previewWrapper = previewRes || {};
      const previewData = previewWrapper.data || previewWrapper;

      if (previewWrapper.code && previewWrapper.code !== 200) {
        showWarning(
          previewWrapper.message ||
            "Không tính được giá vé. Vui lòng thử lại.",
          "Lỗi"
        );
        return;
      }

      const finalTotal =
        typeof previewData.total === "number"
          ? previewData.total
          : priceSummary.total;

      // 2️⃣ Tạo booking thật: POST /bookings/confirm (từ lockId)
      const bookingRes = await createBooking({
        lockId: lockInfo.lockId,
        userId: currentUser?.userId || null,
        promotionCode: null,
      });

      const bookingWrapper = bookingRes || {};
      const bookingData = bookingWrapper.data || bookingWrapper;

      if (
        bookingWrapper.code &&
        bookingWrapper.code !== 200 &&
        bookingWrapper.code !== 201
      ) {
        showWarning(
          bookingWrapper.message ||
            "Không tạo được booking. Vui lòng thử lại.",
          "Lỗi"
        );
        return;
      }

      const bookingId =
        bookingData.bookingId ||
        bookingData.booking_id ||
        bookingData.id ||
        null;

      if (!bookingId) {
        showWarning("Booking không hợp lệ. Vui lòng thử lại.", "Lỗi");
        return;
      }

      // 3️⃣ Tạo lệnh thanh toán: POST /payments/order
      const paymentRes = await createPaymentOrder({
        bookingId,
        method: gatewayMethod, // "PAYPAL" | "MOMO"
        amount: finalTotal,
      });

      const paymentWrapper = paymentRes || {};
      const paymentData = paymentWrapper.data || paymentWrapper;

      if (paymentWrapper.code && paymentWrapper.code !== 200) {
        showWarning(
          paymentWrapper.message ||
            "Không tạo được lệnh thanh toán. Vui lòng thử lại.",
          "Lỗi"
        );
        return;
      }

      const paymentUrl =
        paymentData.paymentUrl ||
        paymentData.redirectUrl ||
        paymentData.checkoutUrl ||
        null;

      if (!paymentUrl) {
        showWarning(
          "Không nhận được paymentUrl từ cổng thanh toán.",
          "Lỗi"
        );
        return;
      }

      // 4️⃣ Redirect sang trang thanh toán (PayPal / Momo)
      window.location.href = paymentUrl;
    } catch (err) {
      console.error("handleSubmitPayment (real) error", err);
      showWarning("Có lỗi xảy ra trong quá trình thanh toán.", "Lỗi");
    } finally {
      setSubmitting(false);
    }
  };
  */

  const canSubmitPayment = !!paymentMethod && remainSeconds > 0 && !submitting;


  /* ===== RENDER ===== */

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#050018] via-[#080023] to-[#050018] text-white overflow-hidden">
      {/* glow background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-[8%] w-[520px] h-[520px] bg-[radial-gradient(circle_at_center,#7b5cff55,transparent)] blur-[110px]" />
        <div className="absolute top-[28%] right-[12%] w-[420px] h-[420px] bg-[radial-gradient(circle_at_center,#43e1ff40,transparent)] blur-[110px]" />
        <div className="absolute bottom-[-60px] left-1/3 w-[640px] h-[320px] bg-[radial-gradient(circle_at_center,#ff7af640,transparent)] blur-[130px]" />
      </div>

      <Navbar />

      <main className="relative z-10 max-w-6xl mx-auto px-4 pb-12 pt-4">
        {/* Back home + back to movie */}
        <div className="flex items-center justify-between mb-4">
          <HomeButton />
          <button
            onClick={handleBackToMovie}
            className="inline-flex items-center gap-2 text-[11px] md:text-[12px] text-white/70 hover:text-white transition-colors"
          >
            <span className="inline-block w-5 h-5 rounded-full border border-white/40 flex items-center justify-center text-[10px]">
              ←
            </span>
            <span className="tracking-[0.16em] uppercase">
              Quay lại chọn ghế
            </span>
          </button>
        </div>

        {/* Heading + Step indicator */}
        <header className="mb-8 text-center md:text-left">
          <p className="text-[11px] sm:text-xs tracking-[0.22em] text-[#9ca3ff] uppercase mb-2">
            Checkout • CinesVerse
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-[32px] font-extrabold bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6] bg-clip-text text-transparent drop-shadow-[0_0_26px_rgba(123,92,255,0.9)]">
            Trang thanh toán
          </h1>

          {/* Process bar */}
          <ul className="mt-5 flex flex-wrap justify-center md:justify-start gap-4 md:gap-8 text-[11px] sm:text-[12px]">
            <StepItem
              stepNumber={1}
              label="Thông tin khách hàng"
              active={step >= 1}
            />
            <StepItem stepNumber={2} label="Thanh toán" active={step >= 2} />
            <StepItem stepNumber={3} label="Thông tin vé phim" active={false} />
          </ul>
        </header>

        {/* CONTENT: 2 CỘT */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-start">
          {/* LEFT: Step 1 / Step 2 */}
          <div className="space-y-4">
            {step === 1 ? (
              <Step1CustomerInfo
                customer={customer}
                onChangeCustomer={handleChangeCustomer}
                onNext={handleNextStep}
                loadingLock={loadingLock}
                remainSeconds={remainSeconds}
              />
            ) : (
              <Step2Payment
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                onBack={() => setStep(1)}
                onSubmit={handleSubmitPayment}
                canSubmit={canSubmitPayment}
              />
            )}
          </div>

          {/* RIGHT: Booking Summary */}
          <BookingSummary
            movie={movie}
            cinema={cinema}
            seats={seats}
            totalTickets={totalTickets}
            selectedTicketTypes={selectedTicketTypes}
            snackList={snackList}
            priceSummary={priceSummary}
            remainSeconds={remainSeconds}
            loadingLock={loadingLock}
            seatLabel={seatLabel}
          />
        </section>
      </main>

      {/* POPUP WARNING */}
      {warning.open && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-[90%] max-w-md rounded-3xl bg-gradient-to-r from-[#4f46e5] via-[#7b5cff] to-[#ec4899] p-[1px] shadow-[0_30px_80px_rgba(0,0,0,0.95)]">
            <div className="rounded-3xl bg-[#050018]/95 px-6 py-6 text-center">
              <h3 className="text-[13px] sm:text-[14px] font-extrabold tracking-[0.28em] text-white uppercase mb-2">
                {warning.title}
              </h3>
              <p className="text-xs sm:text-[13px] text-white/80 mb-6 leading-relaxed whitespace-pre-line">
                {warning.message}
              </p>
              <button
                onClick={closeWarning}
                className="inline-flex items-center justify-center px-10 py-2.5 rounded-full
                     text-[11px] sm:text-[12px] font-extrabold tracking-[0.2em] uppercase
                     bg-gradient-to-r from-[#ffe700] to-[#facc15] text-black
                     shadow-[0_0_18px_rgba(255,231,0,0.95)]
                     hover:brightness-110 hover:-translate-y-[1px]
                     active:translate-y-0 transition-all"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

/* ===== SUB COMPONENTS ===== */

function StepItem({ stepNumber, label, active }) {
  return (
    <li
      className={`flex items-center gap-2 ${
        active ? "opacity-100" : "opacity-40"
      }`}
    >
      <span
        className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold
        ${active ? "bg-white text-black" : "bg-white/10 text-white/70"}`}
      >
        {stepNumber}
      </span>
      <span className="text-white/80">{label}</span>
    </li>
  );
}

function Step1CustomerInfo({
  customer,
  onChangeCustomer,
  onNext,
  loadingLock,
  remainSeconds,
}) {
  const disabled = loadingLock || remainSeconds <= 0;

  return (
    <div className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md p-5 md:p-6 shadow-[0_22px_70px_rgba(0,0,0,0.9)]">
      <h2 className="text-[13px] md:text-[14px] font-extrabold tracking-[0.24em] uppercase text-white mb-4">
        Bước 1 • Thông tin khách hàng
      </h2>

      <p className="text-[11px] md:text-xs text-white/70 mb-4">
        Vui lòng điền thông tin để nhận vé và thông báo qua email / số điện
        thoại.
      </p>

      <div className="space-y-3 text-[12px] md:text-[13px]">
        <div>
          <label className="block mb-1 text-white/70 text-xs uppercase tracking-[0.15em]">
            Họ và tên
          </label>
          <input
            type="text"
            value={customer.fullName}
            onChange={(e) => onChangeCustomer("fullName", e.target.value)}
            className="w-full rounded-xl bg-[#020617] border border-white/10 px-3 py-2 text-[12px] md:text-[13px] text-white outline-none focus:border-[#7b5cff] focus:ring-1 focus:ring-[#7b5cff] transition-all"
            placeholder="Nhập họ tên của bạn"
          />
        </div>

        <div>
          <label className="block mb-1 text-white/70 text-xs uppercase tracking-[0.15em]">
            Email
          </label>
          <input
            type="email"
            value={customer.email}
            onChange={(e) => onChangeCustomer("email", e.target.value)}
            className="w-full rounded-xl bg-[#020617] border border-white/10 px-3 py-2 text-[12px] md:text-[13px] text-white outline-none focus:border-[#7b5cff] focus:ring-1 focus:ring-[#7b5cff] transition-all"
            placeholder="example@gmail.com"
          />
        </div>

        <div>
          <label className="block mb-1 text-white/70 text-xs uppercase tracking-[0.15em]">
            Số điện thoại
          </label>
          <input
            type="tel"
            value={customer.phone}
            onChange={(e) => onChangeCustomer("phone", e.target.value)}
            className="w-full rounded-xl bg-[#020617] border border-white/10 px-3 py-2 text-[12px] md:text-[13px] text-white outline-none focus:border-[#7b5cff] focus:ring-1 focus:ring-[#7b5cff] transition-all"
            placeholder="Nhập số điện thoại"
          />
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[11px] md:text-[12px] text-white/65">
          <span className="uppercase tracking-[0.16em]">
            Thời gian giữ ghế:
          </span>
          <span className="px-2 py-1 rounded-lg bg-[#020617] border border-white/10 font-mono text-[11px]">
            {loadingLock ? "••:••" : formatTime(remainSeconds)}
          </span>
        </div>

        <button
          onClick={onNext}
          disabled={disabled}
          className="px-5 md:px-6 py-2.5 rounded-2xl text-[11px] md:text-[12px] font-extrabold uppercase tracking-[0.2em]
             bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6]
             text-white shadow-[0_0_22px_rgba(123,92,255,0.95)]
             hover:shadow-[0_0_34px_rgba(123,92,255,1)]
             hover:brightness-110 hover:-translate-y-[1px]
             active:translate-y-0 transition-all
             disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Tiếp tục thanh toán
        </button>
      </div>
    </div>
  );
}

function Step2Payment({
  paymentMethod,
  setPaymentMethod,
  onBack,
  onSubmit,
  canSubmit,
}) {
  const paymentOptions = [
    {
      id: "MOMO",
      label: "Thanh toán qua Momo",
      img: "https://cinestar.com.vn/assets/images/img-momo.png",
    },
    {
      id: "CARD_LOCAL",
      label: "Thanh toán qua thẻ nội địa",
      img: "https://cinestar.com.vn/assets/images/img-card.png",
    },
    {
      id: "CARD_INTL",
      label: "Thanh toán qua thẻ quốc tế",
      img: "https://cinestar.com.vn/assets/images/img-card.png",
    },
  ];

  return (
    <div className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md p-5 md:p-6 shadow-[0_22px_70px_rgba(0,0,0,0.9)]">
      <h2 className="text-[13px] md:text-[14px] font-extrabold tracking-[0.24em] uppercase text-white mb-4">
        Bước 2 • Thanh toán
      </h2>

      <div className="space-y-3">
        {paymentOptions.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setPaymentMethod(opt.id)}
            className={`w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 border text-left
              ${
                paymentMethod === opt.id
                  ? "bg-[#18163d]/90 border-[#7b5cff] shadow-[0_0_20px_rgba(123,92,255,0.55)]"
                  : "bg-[#020617] border-white/12 hover:bg-white/5"
              }`}
          >
            <div className="w-10 h-10 rounded-xl bg-black/40 flex items-center justify-center overflow-hidden">
              <img
                src={opt.img}
                alt={opt.label}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <span className="text-[12px] md:text-[13px] text-white">
              {opt.label}
            </span>
          </button>
        ))}
      </div>

      {/* Block mã khuyến mãi (UI thôi, logic sẽ làm sau) */}
      <div className="mt-5 rounded-2xl border border-dashed border-white/20 bg-[#020617]/70 px-3 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[14px]">
          %
        </div>
        <div className="flex-1">
          <p className="text-[11px] md:text-[12px] font-semibold text-white">
            Mã khuyến mãi
          </p>
          <p className="text-[10px] text-white/60">
            Chức năng áp dụng ưu đãi sẽ gắn với Promotions sau.
          </p>
        </div>
        <button className="px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-[0.18em] border border-white/30 text-white/80">
          Nhập mã
        </button>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="w-full sm:w-auto px-4 py-2.5 rounded-2xl text-[11px] md:text-[12px] font-semibold uppercase tracking-[0.18em]
             border border-white/40 text-white/80 hover:bg-white/10 transition-all"
        >
          Quay lại bước 1
        </button>

        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className="w-full sm:w-auto px-6 py-2.5 rounded-2xl text-[11px] md:text-[12px] font-extrabold uppercase tracking-[0.2em]
             bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6]
             text-white shadow-[0_0_22px_rgba(123,92,255,0.95)]
             hover:shadow-[0_0_34px_rgba(123,92,255,1)]
             hover:brightness-110 hover:-translate-y-[1px]
             active:translate-y-0 transition-all
             disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Thanh toán
        </button>
      </div>
    </div>
  );
}

function BookingSummary({
  movie,
  cinema,
  seats,
  totalTickets,
  selectedTicketTypes,
  snackList,
  priceSummary,
  remainSeconds,
  loadingLock,
  seatLabel,
}) {
  return (
    <div className="rounded-3xl bg-[#020617]/90 border border-white/10 backdrop-blur-md p-5 md:p-6 shadow-[0_22px_70px_rgba(0,0,0,0.9)]">
      <h2 className="text-[13px] md:text-[14px] font-extrabold tracking-[0.24em] uppercase text-white mb-4">
        Thông tin đặt vé
      </h2>

      <div className="space-y-3 text-[11px] md:text-[12px] text-white/80">
        <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
          <div>
            <p className="text-[12px] md:text-[13px] font-semibold text-white">
              {movie?.title} {movie?.minimumAge ? `(T${movie.minimumAge})` : ""}
            </p>
            {movie?.description && (
              <p className="mt-1 text-[10px] text-white/60 line-clamp-2">
                {movie.description}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/60">
              Thời gian giữ vé
            </p>
            <span className="px-2 py-1 rounded-lg bg-[#020617] border border-white/10 font-mono text-[11px]">
              {loadingLock ? "••:••" : formatTime(remainSeconds)}
            </span>
          </div>
        </div>

        <InfoRow label="Rạp" value={cinema?.name} sub={cinema?.address} />

        <InfoRow label="Phòng chiếu" value={cinema?.room} />

        <InfoRow label="Số vé" value={totalTickets} />

        {selectedTicketTypes.length > 0 && (
          <div className="border-b border-white/10 pb-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/60 mb-1">
              Loại vé
            </p>
            <ul className="space-y-1">
              {selectedTicketTypes.map((t) => (
                <li
                  key={t.id || t.ticketTypeId}
                  className="flex items-center justify-between gap-2"
                >
                  <span>{t.label}</span>
                  <span className="text-white/70">
                    x{t.quantity} • {t.price.toLocaleString()}đ
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <InfoRow label="Số ghế" value={seatLabel || "—"} />

        {/* Bắp nước */}
        <div className="border-b border-white/10 pb-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/60 mb-1">
            Bắp nước
          </p>
          {snackList.length === 0 ? (
            <p className="text-white/50 text-[11px]">Chưa chọn bắp nước.</p>
          ) : (
            <ul className="space-y-1">
              {snackList.map((s) => (
                <li
                  key={s.snack_id || s.snackId}
                  className="flex items-center justify-between gap-2"
                >
                  <span className="truncate max-w-[160px]">{s.name}</span>
                  <span className="text-white/70">
                    x{s.quantity} • {s.price.toLocaleString()}đ
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Footer: Tổng tiền */}
      <div className="mt-4 pt-3 border-t border-white/10">
        <div className="flex items-center justify-between text-[11px] md:text-[12px] text-white/70">
          <span>Tạm tính</span>
          <span>{priceSummary.subtotal.toLocaleString()}đ</span>
        </div>
        {priceSummary.discount > 0 && (
          <div className="flex items-center justify-between text-[11px] md:text-[12px] text-[#4ade80]">
            <span>Giảm giá</span>
            <span>-{priceSummary.discount.toLocaleString()}đ</span>
          </div>
        )}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[11px] md:text-[12px] text-white/80">
            Số tiền cần thanh toán
          </span>
          <span className="text-[18px] md:text-[20px] font-extrabold text-[#facc15]">
            {priceSummary.total.toLocaleString()}đ
          </span>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, sub }) {
  return (
    <div className="border-b border-white/10 pb-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-white/60 mb-0.5">
        {label}
      </p>
      <p className="text-[12px] md:text-[13px] text-white">{value || "—"}</p>
      {sub && <p className="text-[10px] text-white/55 mt-0.5">{sub}</p>}
    </div>
  );
}
