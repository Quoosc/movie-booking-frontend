import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  capturePayment,
  getPaymentStatus,
} from "@/api/paymentService";

const MOMO_POLL_ATTEMPTS = 15;
const MOMO_POLL_INTERVAL_MS = 1000;

function unwrapResponse(response) {
  const wrapper = response || {};
  return {
    wrapper,
    data: wrapper.data || wrapper,
  };
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForMomoIpn(transactionId, isCancelled) {
  for (let attempt = 0; attempt < MOMO_POLL_ATTEMPTS; attempt += 1) {
    if (isCancelled()) return null;

    const response = await getPaymentStatus({
      transactionId,
      paymentMethod: "MOMO",
    });
    const { wrapper, data } = unwrapResponse(response);

    if (wrapper.code && wrapper.code !== 200) {
      throw new Error(wrapper.message || "Không kiểm tra được trạng thái MoMo.");
    }

    const paymentStatus = String(
      data.status || data.paymentStatus || ""
    ).toUpperCase();
    const bookingStatus = String(data.bookingStatus || "").toUpperCase();

    if (
      paymentStatus === "SUCCESS" ||
      paymentStatus === "COMPLETED" ||
      bookingStatus === "CONFIRMED"
    ) {
      return data;
    }

    if (["FAILED", "CANCELLED", "REFUNDED"].includes(paymentStatus)) {
      throw new Error(
        data.errorMessage || "Giao dịch MoMo không thành công."
      );
    }

    if (attempt < MOMO_POLL_ATTEMPTS - 1) {
      await wait(MOMO_POLL_INTERVAL_MS);
    }
  }

  throw new Error(
    "MoMo đang xử lý giao dịch. Vui lòng không thanh toán lại và kiểm tra lịch sử đặt vé sau ít phút."
  );
}

export default function PaymentCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const paypalToken = searchParams.get("token");
      const momoOrCommonId =
        searchParams.get("orderId") ||
        searchParams.get("requestId") ||
        searchParams.get("transactionId") ||
        searchParams.get("txnRef");
      const transactionId = paypalToken || momoOrCommonId;

      let paymentMethod = String(
        searchParams.get("method") ||
          searchParams.get("paymentMethod") ||
          searchParams.get("pm") ||
          ""
      ).toUpperCase();

      if (!paymentMethod) {
        paymentMethod = paypalToken ? "PAYPAL" : momoOrCommonId ? "MOMO" : "";
      }

      const bookingIdFromQuery =
        searchParams.get("bookingId") || searchParams.get("booking_id");

      if (!transactionId || !["PAYPAL", "MOMO"].includes(paymentMethod)) {
        setStatus("error");
        setMessage(
          "Thông tin thanh toán không hợp lệ hoặc đã hết hạn. Vui lòng quay lại và tạo giao dịch mới."
        );
        return;
      }

      try {
        setStatus("loading");
        setMessage(
          paymentMethod === "MOMO"
            ? "Đang chờ MoMo xác nhận giao dịch an toàn..."
            : "Đang xác nhận giao dịch với PayPal..."
        );

        const rawResult =
          paymentMethod === "MOMO"
            ? await waitForMomoIpn(transactionId, () => cancelled)
            : await capturePayment({ transactionId, paymentMethod });

        if (cancelled || !rawResult) return;

        const { wrapper, data } = unwrapResponse(rawResult);
        if (wrapper.code && wrapper.code !== 200) {
          throw new Error(wrapper.message || "Thanh toán không thành công.");
        }

        const bookingId =
          data.bookingId || data.booking_id || bookingIdFromQuery || null;
        if (!bookingId) {
          throw new Error(
            "Thanh toán đã được xử lý nhưng không tìm thấy mã đặt vé. Vui lòng liên hệ hỗ trợ."
          );
        }

        setStatus("success");
        setMessage("Thanh toán thành công! Đang mở thông tin vé...");

        navigate(
          `/checkout-success?bookingId=${encodeURIComponent(
            bookingId
          )}&method=${paymentMethod}`,
          { replace: true }
        );
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setMessage(
          err?.message ||
            "Có lỗi xảy ra khi xác nhận thanh toán. Vui lòng thử lại sau."
        );
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050018] text-white px-4">
      <div className="max-w-md w-full bg-black/60 border border-white/10 rounded-3xl px-6 py-8 text-center shadow-[0_18px_60px_rgba(0,0,0,0.9)]">
        <h1 className="text-lg font-extrabold tracking-[0.2em] mb-4">
          THANH TOÁN
        </h1>

        {status === "loading" && (
          <>
            <p className="text-sm text-white/80 mb-2">
              Đang xử lý kết quả thanh toán...
            </p>
            <p className="text-xs text-white/50 whitespace-pre-line">
              {message}
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <p className="text-sm text-emerald-400 mb-2">
              Thanh toán thành công!
            </p>
            <p className="text-xs text-white/60 whitespace-pre-line">
              {message}
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <p className="text-sm text-red-400 mb-3">
              Có lỗi xảy ra khi xử lý thanh toán.
            </p>
            <p className="text-xs text-white/60 mb-4 whitespace-pre-line">
              {message}
            </p>
            <button
              onClick={() => navigate("/", { replace: true })}
              className="inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-2 text-xs font-semibold uppercase tracking-[0.18em] hover:bg-white hover:text-black transition"
            >
              Về trang chủ
            </button>
          </>
        )}
      </div>
    </div>
  );
}
