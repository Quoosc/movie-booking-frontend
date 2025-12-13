// src/app/(public)/checkout/page.jsx

import { useEffect, useMemo, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getValidPromotions, validatePromotion } from "@/api/promotionService";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { useAuth } from "@/context/AuthContext";
import {
  lockSeats,
  previewPrice,
  createBooking,
  createPaymentOrder,
  releaseSeatLocksByShowtime,
} from "@/api/bookingService";

// Map từ mã UI sang enum PaymentMethod của BE (PAYPAL / MOMO)
function mapPaymentMethodForApi(method) {
  switch (method) {
    case "MOMO":
      return "MOMO";
    case "CARD_LOCAL":
      return "PAYPAL";
    // case "CARD_INTL":
    //   return "PAYPAL";
    default:
      return "MOMO";
  }
}

function formatTime(sec) {
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function validateCustomer(data) {
  const errors = {};

  const fullName = data.fullName?.trim() || "";
  const email = data.email?.trim() || "";
  const phone = data.phone?.trim() || "";

  if (!fullName) {
    errors.fullName = "Vui lòng nhập họ và tên.";
  } else if (fullName.length < 2) {
    errors.fullName = "Họ tên quá ngắn.";
  }

  if (!email) {
    errors.email = "Vui lòng nhập email.";
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.email = "Email không hợp lệ.";
    }
  }

  if (!phone) {
    errors.phone = "Vui lòng nhập số điện thoại.";
  } else {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 9 || digits.length > 11) {
      errors.phone = "Số điện thoại không hợp lệ.";
    }
  }

  return errors;
}

// Chuẩn hóa thông báo lỗi khóa ghế
function getSeatLockErrorMessage(err) {
  const raw =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    "";

  const lower = String(raw).toLowerCase();

  // Case 1: ghế đã bị người khác giữ / tranh chấp
  if (raw.includes("Unable to lock seats due to concurrent booking attempt")) {
    return (
      "Ghế bạn chọn vừa được người khác giữ chỗ hoặc đặt trước.\n" +
      "Vui lòng quay lại và chọn ghế khác."
    );
  }

  // Case 2: bạn đã có lock/đơn đang đặt cho suất chiếu này rồi (seat-lock)
  if (
    lower.includes("existing active lock") ||
    lower.includes("already have an active lock") ||
    lower.includes("active seat lock")
  ) {
    return (
      "Bạn đang có một lần giữ ghế/đơn đặt vé khác cho suất chiếu này.\n" +
      "Vui lòng hoàn tất hoặc hủy lần đặt trước rồi thử lại."
    );
  }

  // Case 3: BE rule - đã có booking đang xử lý/chờ thanh toán cho suất này
  if (lower.includes("active booking in progress for this showtime")) {
    return (
      "Bạn đang có một đơn đặt vé chưa hoàn tất cho suất chiếu này.\n" +
      "Vui lòng hoàn tất thanh toán hoặc chờ đơn cũ hết hiệu lực trước khi đặt lần mới."
    );
  }

  // Default: không rõ -> trả raw hoặc câu chung
  if (raw) {
    return raw;
  }

  return "Có lỗi xảy ra khi khóa ghế. Vui lòng thử lại hoặc chọn suất chiếu khác.";
}

function getUserDisplayName(user) {
  return (
    user?.fullName || // nếu BE có fullName
    user?.full_name || // case snake_case
    user?.name || // nếu trả về name
    user?.username ||
    "" // fallback cuối cùng
  );
}

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hasAutoJumped, setHasAutoJumped] = useState(false);
  const currentUser = user; // giữ lại tên currentUser cho đỡ phải sửa cả file
  const isMemberUser = currentUser?.role === "USER"; // kiểm tra có phải member không
  const state = location.state || {};
  const normalizedUserId = currentUser?.userId || currentUser?.id || null;
  const hasRequestedLockRef = useRef(false);

  const {
    showtimeId,
    cinema,
    movie,
    seats = [],
    ticketTypes = [],
    snacks = {},
    priceSummary = { subtotal: 0, discount: 0, total: 0 },
  } = state;

  /* ===== redirect nếu vào thẳng /checkout không có state ===== */
  useEffect(() => {
    if (!showtimeId || !seats || seats.length === 0 || !movie || !cinema) {
      navigate("/", { replace: true });
    }
  }, [showtimeId, seats, movie, cinema, navigate]);

  /* ===== STEP STATE ===== */
  const [step, setStep] = useState(1);

  /*==== NẾU LÀ MEMBER THÌ AUTO VÔ STEP 2 ====*/
  useEffect(() => {
    if (isMemberUser && step === 1 && !hasAutoJumped) {
      setStep(2);
      setHasAutoJumped(true);
    }
  }, [isMemberUser, step, hasAutoJumped]);

  /* ===== LOCK SEATS STATE ===== */
  const [lockInfo, setLockInfo] = useState(null);
  const [remainSeconds, setRemainSeconds] = useState(0);
  const [loadingLock, setLoadingLock] = useState(false);

  /* ===== WARNING POPUP (dùng chung) ===== */
  const [warning, setWarning] = useState({
    open: false,
    title: "Lưu ý!",
    message: "",
    buttonText: "OK",
    onConfirm: null,
  });

  const showWarning = (message, title = "Lưu ý!", options = {}) => {
    setWarning({
      open: true,
      title,
      message,
      buttonText: options.buttonText || "OK",
      // nếu caller truyền onConfirm thì dùng, còn không thì mặc định quay lại trang trước
      onConfirm:
        typeof options.onConfirm === "function"
          ? options.onConfirm
          : () => navigate(-1),
    });
  };

  const closeWarning = () => {
    if (warning.onConfirm) {
      warning.onConfirm();
    }
    setWarning((prev) => ({ ...prev, open: false, onConfirm: null }));
  };

  function getApiErrorMessage(err, fallback) {
    return (
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      fallback
    );
  }

  /* ===== TOAST NHỎ RIÊNG CHO PROMO (góc trên phải) ===== */
  const [promoToast, setPromoToast] = useState({
    open: false,
    message: "",
  });

  const showPromoToast = (message) => {
    setPromoToast({ open: true, message });
  };

  /* ===== CUSTOMER INFO (STEP 1) ===== */
  const [customer, setCustomer] = useState(() => ({
    fullName: getUserDisplayName(currentUser),
    email: currentUser?.email || "",
    phone: currentUser?.phoneNumber || currentUser?.phone || "",
  }));
  const [customerErrors, setCustomerErrors] = useState({});

  const handleChangeCustomer = (field, value) => {
    setCustomer((prev) => ({
      ...prev,
      [field]: value,
    }));
    setCustomerErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  };

  // user login/logout thì tự prefill
  useEffect(() => {
    if (!currentUser) return;

    setCustomer((prev) => ({
      ...prev,
      fullName: getUserDisplayName(currentUser) || prev.fullName,
      email: currentUser.email || prev.email,
      phone: currentUser.phoneNumber || currentUser.phone || prev.phone,
    }));
  }, [currentUser]);

  /* ===== PAYMENT (STEP 2) ===== */
  const [paymentMethod, setPaymentMethod] = useState(null); // "MOMO", "CARD_LOCAL", "CARD_INTL"
  const [submitting, setSubmitting] = useState(false);

  /* ===== PRICE SUMMARY & PROMOTION ===== */
  const [computedPriceSummary, setComputedPriceSummary] = useState(
    priceSummary || { subtotal: 0, discount: 0, total: 0 }
  );
  const [promotionCode, setPromotionCode] = useState("");
  const [appliedPromotion, setAppliedPromotion] = useState(null);
  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
  const [promotionList, setPromotionList] = useState([]);
  const [promotionLoading, setPromotionLoading] = useState(false);
  const [promotionError, setPromotionError] = useState("");

  // mở popup, fetch danh sách ưu đãi
  const handleOpenPromoModal = async () => {
    setIsPromotionModalOpen(true);
    setPromotionError("");

    if (promotionList.length === 0 && !promotionLoading) {
      try {
        setPromotionLoading(true);
        const list = await getValidPromotions();
        setPromotionList(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error("getValidPromotions error", err);
        setPromotionError(
          "Không tải được danh sách ưu đãi. Bạn vẫn có thể nhập mã tay."
        );
      } finally {
        setPromotionLoading(false);
      }
    }
  };

  // apply promotion: validate + previewPrice để update UI
  const handleApplyPromotion = async () => {
    const code = promotionCode.trim();
    if (!code) {
      setPromotionError("Vui lòng nhập mã khuyến mãi.");
      return;
    }

    setPromotionError("");
    setPromotionLoading(true);
    try {
      const res = await validatePromotion(code, normalizedUserId);

      if (!res?.valid) {
        setAppliedPromotion(null);
        setIsPromotionModalOpen(false);
        showPromoToast(res?.message || "Mã khuyến mãi không tồn tại.");
        return;
      }

      const promo = res.promotion || res;
      setAppliedPromotion(promo);
      setIsPromotionModalOpen(false);

      // ✅ Cập nhật lại giá hiển thị bằng previewPrice dùng lockId
      if (!lockInfo?.lockId) {
        // chưa có lock, báo 1 toast nhẹ thôi, không back
        showPromoToast("Không tìm thấy thông tin giữ ghế. Vui lòng thử lại.");
        return;
      }

      const snacksArray = Object.values(snacks || {});
      const snacksPayload = snacksArray
        .filter((s) => s.quantity > 0)
        .map((s) => ({
          snackId: s.snackId || s.snack_id,
          quantity: s.quantity,
        }));

      try {
        const previewRes = await previewPrice({
          lockId: lockInfo.lockId,
          promotionCode: code,
          snacks: snacksPayload,
        });

        const previewWrapper = previewRes || {};
        const previewData = previewWrapper.data || previewWrapper;

        if (!previewWrapper.code || previewWrapper.code === 200) {
          setComputedPriceSummary((prev) => ({
            subtotal:
              typeof previewData.subtotal === "number"
                ? previewData.subtotal
                : prev.subtotal ?? priceSummary.subtotal ?? 0,
            discount:
              typeof previewData.discount === "number"
                ? previewData.discount
                : typeof previewData.discountValue === "number"
                ? previewData.discountValue
                : prev.discount ?? 0,
            total:
              typeof previewData.total === "number"
                ? previewData.total
                : typeof previewData.finalPrice === "number"
                ? previewData.finalPrice
                : prev.total ?? priceSummary.total ?? 0,
          }));
        }
      } catch (err) {
        console.error("previewPrice with promotion failed", err);
        // Nếu fail thì vẫn giữ appliedPromotion, chỉ không update số tiền UI
      }
    } catch (err) {
      console.error("handleApplyPromotion error", err);
      setAppliedPromotion(null);
      setIsPromotionModalOpen(false);
      showPromoToast("Mã khuyến mãi không hợp lệ hoặc đã hết hạn.");
    } finally {
      setPromotionLoading(false);
    }
  };

  /* ===== LOCK SEATS KHI VÀO CHECKOUT ===== */
  useEffect(() => {
    if (!showtimeId || !seats || seats.length === 0) return;

    // 🔒 Chỉ cho phép gọi lockSeats đúng 1 lần trong 1 lifecycle
    if (hasRequestedLockRef.current) return;
    hasRequestedLockRef.current = true;

    // 1️⃣ build danh sách ticketTypeId theo quantity
    const flatTicketTypeIds = [];
    (ticketTypes || []).forEach((t) => {
      const id = t.ticketTypeId; // KHỚP spec: dùng ticketTypeId từ BE
      const qty = t.quantity || 0;
      if (!id || qty <= 0) return;
      for (let i = 0; i < qty; i++) {
        flatTicketTypeIds.push(id);
      }
    });

    // 2️⃣ validate: số vé phải bằng số ghế
    if (flatTicketTypeIds.length !== seats.length) {
      console.error("[Checkout] Mismatch seats vs ticketTypes", {
        seatCount: seats.length,
        ticketCount: flatTicketTypeIds.length,
        seats,
        ticketTypes,
      });

      showWarning(
        "Số lượng vé và số ghế không khớp.\nVui lòng quay lại màn chọn ghế và đặt lại.",
        "Lỗi đặt vé",
        {
          buttonText: "Quay lại chọn ghế",
          onConfirm: () => navigate(-1),
        }
      );
      return;
    }

    const doLock = async () => {
      try {
        setLoadingLock(true);

        const res = await lockSeats({
          showtimeId,
          seats: seats.map((s, index) => ({
            showtimeSeatId: s.showtimeSeatId || s.seat_id || s.seatId || s.id,
            ticketTypeId: flatTicketTypeIds[index],
          })),
        });

        const data = res.data || res;

        // ✅ ƯU TIÊN remainingSeconds, nếu không có thì dùng lockDurationMinutes, cuối cùng fallback 600s
        let seconds = 0;
        if (
          typeof data.remainingSeconds === "number" &&
          data.remainingSeconds > 0
        ) {
          seconds = data.remainingSeconds;
        } else if (
          typeof data.lockDurationMinutes === "number" &&
          data.lockDurationMinutes > 0
        ) {
          seconds = data.lockDurationMinutes * 60;
        } else {
          seconds = 600; // fallback 10 phút cho chắc
        }

        // Không dùng expiresAt cho timer để tránh lệch timezone
        setLockInfo({
          lockId: data.lockId,
          expiresAt: null,
        });

        setRemainSeconds(seconds);
      } catch (err) {
        console.error("lockSeats error", err);

        const raw =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "";

        const isExistingLock =
          /existing active lock|already have an active lock|active seat lock/i.test(
            String(raw)
          );

        const isActiveBookingError =
          /active booking in progress for this showtime/i.test(String(raw));

        // Nếu đang có seat-lock tồn tại → thử dọn bằng DELETE /seat-locks/showtime/{showtimeId}
        if (isExistingLock && showtimeId) {
          try {
            await releaseSeatLocksByShowtime(showtimeId);
            console.warn(
              "Released existing seat locks for showtime",
              showtimeId
            );
          } catch (e) {
            console.error("releaseSeatLocksByShowtime error", e);
          }
        }

        const msg = getSeatLockErrorMessage(err);

        // Nếu là member và BE báo đang có booking active → điều hướng tới lịch sử đặt vé
        if (isActiveBookingError && currentUser) {
          showWarning(msg, "Lỗi khóa ghế", {
            buttonText: "Xem lịch sử đặt vé",
            onConfirm: () => navigate("/account/history"),
          });
        } else {
          showWarning(msg, "Lỗi khóa ghế", {
            buttonText: "Quay lại chọn ghế",
            onConfirm: () => navigate(-1),
          });
        }
      } finally {
        setLoadingLock(false);
      }
    };

    doLock();
  }, [showtimeId, seats, ticketTypes, navigate, currentUser]);

  /* ===== COUNTDOWN TIMER ===== */
  useEffect(() => {
    // Chưa có lockId thì khỏi chạy timer
    if (!lockInfo?.lockId) return;

    const timerId = setInterval(() => {
      setRemainSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [lockInfo?.lockId]);

  // Nếu hết thời gian giữ ghế → cảnh báo + nút quay lại movieDetail
  useEffect(() => {
    if (remainSeconds === 0 && lockInfo) {
      showWarning(
        "Đã hết thời gian giữ ghế. Vui lòng quay lại chọn ghế.",
        "Hết thời gian giữ vé",
        {
          buttonText: "Quay lại chọn ghế",
          onConfirm: () => navigate(-1),
        }
      );
    }
  }, [remainSeconds, lockInfo, navigate]);

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
        ? seats
            .map(
              (s) =>
                `${s.rowLabel || s.row}${String(
                  s.seatNumber || s.number
                ).padStart(2, "0")}`
            )
            .join(", ")
        : "",
    [seats]
  );

  /* ===== HANDLERS STEP 1 ===== */

  const handleNextStep = () => {
    const errors = validateCustomer(customer);
    if (Object.keys(errors).length > 0) {
      setCustomerErrors(errors);
      showWarning("Vui lòng kiểm tra lại thông tin khách hàng.", "Lưu ý!", {
        onConfirm: () => {},
      });
      return;
    }

    if (remainSeconds <= 0) {
      showWarning(
        "Đã hết thời gian giữ ghế. Vui lòng quay lại chọn ghế.",
        "Hết thời gian giữ vé",
        {
          buttonText: "Quay lại chọn ghế",
          onConfirm: () => navigate(-1),
        }
      );
      return;
    }

    setStep(2);
  };

  /* ===== HANDLER STEP 2 (THANH TOÁN – REAL FLOW) ===== */
  const handleSubmitPayment = async () => {
    const promoCodeToUse =
      (promotionCode || appliedPromotion?.code || "").trim() || null;

    if (!paymentMethod) {
      showWarning("Vui lòng chọn phương thức thanh toán.", "Lưu ý!", {
        onConfirm: () => {},
      });
      return;
    }

    if (remainSeconds <= 0) {
      showWarning(
        "Hết thời gian giữ ghế. Vui lòng quay lại chọn ghế.",
        "Hết thời gian giữ vé",
        {
          buttonText: "Quay lại chọn ghế",
          onConfirm: () => navigate(-1),
        }
      );
      return;
    }

    if (!showtimeId || !seats?.length) {
      showWarning("Thiếu thông tin suất chiếu hoặc ghế. Vui lòng đặt lại.");
      return;
    }

    if (!lockInfo?.lockId) {
      showWarning("Không tìm thấy thông tin ghế. Vui lòng đặt lại ghế.", "Lỗi");
      return;
    }

    // đảm bảo info khách vẫn còn đủ (tránh user F5)
    const errors = validateCustomer(customer);
    if (Object.keys(errors).length > 0) {
      setCustomerErrors(errors);
      showWarning(
        "Thiếu thông tin khách hàng. Vui lòng kiểm tra lại Họ tên, Email và Số điện thoại.",
        "Lưu ý!",
        { onConfirm: () => {} }
      );
      setStep(1);
      return;
    }

    setSubmitting(true);

    try {
      const snacksArray = Object.values(snacks || {});
      const gatewayMethod = mapPaymentMethodForApi(paymentMethod);

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

      // 1️⃣ Tính tiền với /bookings/price-preview
      const previewRes = await previewPrice({
        lockId: lockInfo.lockId,
        promotionCode: promoCodeToUse,
        snacks: snacksPayload,
      });

      const previewWrapper = previewRes || {};
      const previewData = previewWrapper.data || previewWrapper;

      if (previewWrapper.code && previewWrapper.code !== 200) {
        showWarning(
          previewWrapper.message || "Không tính được giá vé. Vui lòng thử lại.",
          "Lỗi"
        );
        return;
      }

      const subtotal =
        typeof previewData.subtotal === "number"
          ? previewData.subtotal
          : priceSummary.subtotal;

      const discount =
        typeof previewData.discount === "number"
          ? previewData.discount
          : typeof previewData.discountValue === "number"
          ? previewData.discountValue
          : 0;

      const finalTotal =
        typeof previewData.total === "number"
          ? previewData.total
          : typeof previewData.finalPrice === "number"
          ? previewData.finalPrice
          : computedPriceSummary.total ?? priceSummary.total ?? 0;

      // Cập nhật lại tổng tiền trên UI cho khớp với BE
      setComputedPriceSummary({
        subtotal,
        discount,
        total: finalTotal,
      });

      // 2️ Xác nhận booking từ lockId: /bookings/confirm
      const bookingRes = await createBooking({
        lockId: lockInfo.lockId,
        promotionCode: promoCodeToUse,
        snackCombos: snacksPayload,
        guestInfo: currentUser
          ? null // member có JWT, BE tự đọc user -> guestInfo sẽ bị ignore
          : {
              email: customer.email,
              username: customer.fullName,
              phoneNumber: customer.phone,
            },
      });

      const bookingWrapper = bookingRes || {};
      const bookingData = bookingWrapper.data || bookingWrapper;

      if (
        bookingWrapper.code &&
        bookingWrapper.code !== 200 &&
        bookingWrapper.code !== 201
      ) {
        showWarning(
          bookingWrapper.message || "Không tạo được booking. Vui lòng thử lại.",
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

      // 3️⃣ Tạo lệnh thanh toán: /payments/order
      const paymentRes = await createPaymentOrder({
        bookingId,
        paymentMethod: gatewayMethod, // "PAYPAL" | "MOMO"
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
        showWarning("Không nhận được paymentUrl từ cổng thanh toán.", "Lỗi");
        return;
      }

      // Redirect sang trang thanh toán (PayPal / Momo)
      window.location.href = paymentUrl;
    } catch (err) {
      console.error("handleSubmitPayment (real) error", err);
      const msg = getApiErrorMessage(
        err,
        "Có lỗi xảy ra trong quá trình thanh toán."
      );
      showWarning(msg, "Lỗi");
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmitPayment =
    step === 2 &&
    !submitting &&
    remainSeconds > 0 &&
    !!paymentMethod &&
    seats?.length > 0;

  const handleBackToSeatSelection = async () => {
    try {
      // Thử release lock theo showtime hiện tại (best-effort)
      if (showtimeId) {
        await releaseSeatLocksByShowtime(showtimeId);
      }
    } catch (err) {
      console.error("releaseSeatLocksByShowtime error", err);
      // Không cần show lỗi, BE sẽ tự hết hạn sau một thời gian
    } finally {
      // Quay lại trang trước (MovieDetailPage với layout ghế)
      navigate(-1);
    }
  };

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
        {/* Heading + Step indicator */}
        <header className="mb-8 text-center md:text-left">
          <p className="text-[11px] sm:text-xs tracking-[0.22em] text-[#9ca3ff] uppercase mb-2">
            Checkout • CinesVerse
          </p>
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl md:text-[32px] font-extrabold bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6] bg-clip-text text-transparent drop-shadow-[0_0_26px_rgba(123,92,255,0.9)]">
              Trang thanh toán
            </h1>
          </div>

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
                errors={customerErrors}
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
                submitting={submitting}
                remainSeconds={remainSeconds}
                promotionCode={promotionCode}
                setPromotionCode={setPromotionCode}
                onOpenPromoModal={handleOpenPromoModal}
                appliedPromotion={appliedPromotion}
                promotionLoading={promotionLoading}
                canUsePromotion={isMemberUser}
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
            priceSummary={computedPriceSummary}
            remainSeconds={remainSeconds}
            loadingLock={loadingLock}
            seatLabel={seatLabel}
            appliedPromotion={appliedPromotion}
          />
        </section>
      </main>

      {/* POPUP WARNING CHUNG */}
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
                {warning.buttonText || "OK"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST PROMO */}
      {promoToast.open && (
        <div className="fixed top-6 right-4 z-[998]">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7c3aed] text-white text-xs shadow-lg">
            <span>⚠️</span>
            <span>{promoToast.message}</span>
            <button
              onClick={() => setPromoToast({ open: false, message: "" })}
              className="ml-2 text-white/80 hover:text-white text-[10px]"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* MODAL PROMO */}
      <PromoModal
        open={isPromotionModalOpen}
        onClose={() => setIsPromotionModalOpen(false)}
        promotions={promotionList}
        loading={promotionLoading}
        error={promotionError}
        code={promotionCode}
        onChangeCode={setPromotionCode}
        onSelectCode={(code) => setPromotionCode(code)}
        onApply={handleApplyPromotion}
      />

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
  errors,
  onChangeCustomer,
  onNext,
  loadingLock,
  remainSeconds,
}) {
  const disabled = loadingLock || remainSeconds <= 0;
  const baseInput =
    "w-full rounded-xl bg-[#020617] px-3 py-2 text-[12px] md:text-[13px] text-white outline-none transition-all";

  return (
    <div className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md p-5 md:p-6 shadow-[0_22px_70px_rgba(0,0,0,0.9)]">
      <h2 className="text-[13px] md:text-[14px] font-extrabold tracking-[0.24em] uppercase text-white mb-4">
        Bước 1 • Thông tin khách hàng
      </h2>

      <p className="text-[11px] md:text-xs text-white/70 mb-4">
        Vui lòng điền thông tin để nhận vé và thông báo qua email
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
            className={`${baseInput} border ${
              errors?.fullName
                ? "border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-400"
                : "border-white/10 focus:border-[#7b5cff] focus:ring-1 focus:ring-[#7b5cff]"
            }`}
            placeholder="Nhập họ tên của bạn"
          />
          {errors?.fullName && (
            <p className="mt-1 text-[11px] text-red-400">{errors.fullName}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 text-white/70 text-xs uppercase tracking-[0.15em]">
            Email
          </label>
          <input
            type="email"
            value={customer.email}
            onChange={(e) => onChangeCustomer("email", e.target.value)}
            className={`${baseInput} border ${
              errors?.email
                ? "border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-400"
                : "border-white/10 focus:border-[#7b5cff] focus:ring-1 focus:ring-[#7b5cff]"
            }`}
            placeholder="example@gmail.com"
          />
          {errors?.email && (
            <p className="mt-1 text-[11px] text-red-400">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 text-white/70 text-xs uppercase tracking-[0.15em]">
            Số điện thoại
          </label>
          <input
            type="tel"
            value={customer.phone}
            onChange={(e) => onChangeCustomer("phone", e.target.value)}
            className={`${baseInput} border ${
              errors?.phone
                ? "border-red-400 focus:border-red-400 focus:ring-1 focus:ring-red-400"
                : "border-white/10 focus:border-[#7b5cff] focus:ring-1 focus:ring-[#7b5cff]"
            }`}
            placeholder="Nhập số điện thoại"
          />
          {errors?.phone && (
            <p className="mt-1 text-[11px] text-red-400">{errors.phone}</p>
          )}
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
  submitting,
  remainSeconds,
  promotionCode,
  appliedPromotion,
  promotionLoading,
  onOpenPromoModal,
  canUsePromotion,
}) {
  const paymentOptions = [
    {
      id: "MOMO",
      label: "Thanh toán qua Momo",
      img: "https://cinestar.com.vn/assets/images/img-momo.png",
    },
    {
      id: "CARD_LOCAL",
      label: "Thanh toán qua PayPal",
      img: "https://cinestar.com.vn/assets/images/img-card.png",
    },
    // {
    //   id: "CARD_INTL",
    //   label: "Thanh toán qua thẻ quốc tế",
    //   img: "https://cinestar.com.vn/assets/images/img-card.png",
    // },
  ];

  return (
    <div className="rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md p-5 md:p-6 shadow-[0_22px_70px_rgba(0,0,0,0.9)]">
      <h2 className="text-[13px] md:text-[14px] font-extrabold tracking-[0.24em] uppercase text-white mb-4">
        Bước 2 • Thanh toán
      </h2>

      {/* Banner hết thời gian giữ ghế */}
      {remainSeconds <= 0 && (
        <div className="mb-3 rounded-2xl border border-red-500/60 bg-red-500/10 px-3 py-2 text-[11px] text-red-100">
          Thời gian giữ ghế đã hết. Vui lòng quay lại bước 1 hoặc đặt vé lại từ
          đầu.
        </div>
      )}

      {/* Danh sách phương thức thanh toán */}
      <div className="space-y-3 mb-5">
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

      {/* Block mã khuyến mãi */}
      {canUsePromotion && (
        <div className="mt-5 rounded-2xl border border-dashed border-white/20 bg-[#020617]/70 px-3 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[14px]">
            %
          </div>
          <div className="flex-1">
            <p className="text-[11px] md:text-[12px] font-semibold text-white">
              Mã khuyến mãi
            </p>
            {appliedPromotion ? (
              <p className="text-[10px] text-[#fbbf24]/90">
                Đã áp dụng:{" "}
                <span className="font-semibold">{appliedPromotion.code}</span> –{" "}
                {appliedPromotion.name}
              </p>
            ) : (
              <p className="text-[10px] text-white/60">
                Nếu có mã ưu đãi, hãy nhập tại đây. Mã sẽ được áp dụng khi tính
                tiền cuối cùng.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onOpenPromoModal}
            className="px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-[0.18em] border border-white/30 text-white/80 hover:bg-white/10"
            disabled={promotionLoading}
          >
            {promotionLoading
              ? "Đang tải..."
              : appliedPromotion || promotionCode
              ? "Đổi mã"
              : "Nhập mã"}
          </button>
        </div>
      )}
      {/* Nút back / thanh toán */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
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
          {submitting ? "Đang xử lý..." : "Thanh toán"}
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
  appliedPromotion,
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
                  key={t.id}
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
                  key={s.snack_id}
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

        {/* Khuyến mãi áp dụng */}
        {appliedPromotion && (
          <div className="mt-1 text-[10px] md:text-[11px] text-[#fbbf24]">
            Mã đã áp dụng:{" "}
            <span className="font-semibold">{appliedPromotion.code}</span> –{" "}
            {appliedPromotion.name}
          </div>
        )}
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
          <span className="text-[11px] md:text-[12px] text.white/80">
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

function PromoModal({
  open,
  onClose,
  promotions,
  loading,
  error,
  code,
  onChangeCode,
  onSelectCode,
  onApply,
}) {
  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onApply && onApply();
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[90%] max-w-lg rounded-3xl bg-gradient-to-r from-[#4f46e5] via-[#7b5cff] to-[#ec4899] p-[1px] shadow-[0_30px_80px_rgba(0,0,0,0.95)]">
        <div className="rounded-3xl bg-[#050018]/98 px-5 sm:px-6 py-5 sm:py-6 text-left">
          {/* HEADER */}
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h3 className="text-[13px] sm:text-[14px] font-extrabold tracking-[0.28em] text-white uppercase">
                MÃ KHUYẾN MÃI
              </h3>
              <p className="mt-2 text-[11px] sm:text-[12px] text-white/75">
                Nhập mã ưu đãi của bạn hoặc chọn nhanh từ danh sách mã hợp lệ mà
                hệ thống gợi ý.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white/70 hover:bg.white/10 text-sm"
            >
              ✕
            </button>
          </div>

          {/* FORM NHẬP MÃ */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block mb-1 text-[11px] uppercase tracking-[0.18em] text-white/60">
                Nhập mã khuyến mãi
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => onChangeCode(e.target.value.toUpperCase())}
                  placeholder="VD: WINTER2024"
                  className="flex-1 rounded-xl bg-[#020617] border border-white/15 px-3 py-2 text-[12px] sm:text-[13px] text-white outline-none focus:border-[#7b5cff] focus:ring-1 focus:ring-[#7b5cff] transition-all"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-[11px] sm:text-[12px] font-extrabold uppercase tracking-[0.18em]
                    bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6]
                    text-white shadow-[0_0_16px_rgba(123,92,255,0.9)]
                    hover:brightness-110 hover:-translate-y-[1px]
                    active:translate-y-0 transition-all"
                >
                  Áp dụng
                </button>
              </div>
            </div>

            {/* LIST MÃ GỢI Ý */}
            <div className="mt-3 max-h-52 overflow-y-auto rounded-2xl bg-white/3 border border-white/10 p-3 space-y-2">
              {loading ? (
                <p className="text-[11px] text-white/70">
                  Đang tải danh sách mã...
                </p>
              ) : error ? (
                <p className="text-[11px] text-red-300">{error}</p>
              ) : !promotions || promotions.length === 0 ? (
                <p className="text-[11px] text-white/60">
                  Hiện chưa có mã khuyến mãi khả dụng.
                </p>
              ) : (
                promotions.map((promo) => (
                  <button
                    key={promo.promotionId || promo.id || promo.code}
                    type="button"
                    onClick={() => {
                      onSelectCode(promo.code);
                    }}
                    className="w-full text-left rounded-2xl px-3 py-2.5 bg-black/25 border border-white/10 hover:border-[#ffe700aa] hover:bg.white/5 transition-all"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-[#ffe700] tracking-[0.18em] uppercase">
                        {promo.code}
                      </span>
                      <span className="text-[11px] text-[#a5b4fc]">
                        {promo.discountType === "PERCENTAGE"
                          ? `-${promo.discountValue}%`
                          : `-${
                              promo.discountValue?.toLocaleString?.() ||
                              promo.discountValue
                            }đ`}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-white/80">
                      {promo.name}
                    </p>
                    {promo.description && (
                      <p className="mt-0.5 text-[10px] text-white/55">
                        {promo.description}
                      </p>
                    )}
                  </button>
                ))
              )}
            </div>
          </form>

          {/* FOOTER NOTE */}
          <p className="mt-4 text-[10px] text-white/50">
            Lưu ý: Mỗi đơn chỉ áp dụng 1 mã khuyến mãi và sẽ được kiểm tra lại ở
            bước tính tiền cuối cùng.
          </p>
        </div>
      </div>
    </div>
  );
}
