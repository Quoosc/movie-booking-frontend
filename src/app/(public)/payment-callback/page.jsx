// src/app/(public)/payment-callback/page.jsx

import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { capturePayment } from "@/api/paymentService";

/*
 * - User thanh toán xong ở cổng (PayPal / Momo)
 * - Gateway redirect → FE: /payment-callback?... (tùy gateway)
 * - FE gọi POST /payments/order/capture (capturePayment)
 * - BE:
 *    + xác nhận giao dịch với gateway
 *    + cập nhật Payments + Bookings
 *    + trả về { code: 200, data: { bookingId, ... } }
 * - FE → redirect sang /checkout-success?bookingId=...&method=...
 */

export default function PaymentCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading"); // loading | error | success
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const paypalToken = searchParams.get("token");
      const payerId =
        searchParams.get("PayerID") ||
        searchParams.get("payerId") ||
        searchParams.get("payerID");

      // Momo / common: requestId/orderId/transactionId...
      const momoOrCommonId =
        searchParams.get("transactionId") ||
        searchParams.get("requestId") ||
        searchParams.get("orderId") ||
        searchParams.get("txnRef");

      // 1) transactionId ưu tiên PayPal token, fallback momo/common
      const transactionId = paypalToken || momoOrCommonId;

      // 2) method: ưu tiên query param, nếu thiếu thì tự suy ra
      let methodParam = (
        searchParams.get("method") ||
        searchParams.get("paymentMethod") ||
        searchParams.get("pm") ||
        ""
      ).toUpperCase();

      if (!methodParam) {
        if (paypalToken && payerId) methodParam = "PAYPAL";
        else if (momoOrCommonId) methodParam = "MOMO";
      }

      const bookingIdFromQuery =
        searchParams.get("bookingId") || searchParams.get("booking_id");

      console.log("[PaymentCallback] params =", {
        transactionId,
        methodParam,
        bookingIdFromQuery,
        paypalToken,
        payerId,
        momoOrCommonId,
      });

      if (!transactionId || !methodParam) {
        setStatus("error");
        setMessage(
          "Thông tin thanh toán không hợp lệ hoặc đã hết hạn.\n" +
            "Thiếu token/requestId hoặc thiếu method.\n" +
            "Vui lòng quay lại và thử thanh toán lại từ đầu."
        );
        return;
      }

      try {
        setStatus("loading");
        setMessage("Đang xác nhận thanh toán với cổng thanh toán...");

        const res = await capturePayment({
          transactionId,
          paymentMethod: methodParam, // "PAYPAL" | "MOMO"
        });

        if (cancelled) return;

        const wrapper = res || {};
        const data = wrapper.data || wrapper;
        if (wrapper.code && wrapper.code !== 200) {
          if (wrapper.code === 409) {
            setStatus("error");
            setMessage(
              wrapper.message ||
                "Giao dịch này đã được xử lý trước đó.\nVui lòng kiểm tra lại lịch sử đặt vé."
            );
          } else {
            setStatus("error");
            setMessage(
              wrapper.message ||
                "Thanh toán không thành công.\nVui lòng thử lại hoặc chọn phương thức khác."
            );
          }
          return;
        }

        const bookingId =
          data.bookingId || data.booking_id || bookingIdFromQuery || null;

        if (!bookingId) {
          setStatus("error");
          setMessage(
            "Thanh toán có vẻ đã thành công nhưng không tìm thấy thông tin vé.\n" +
              "Vui lòng liên hệ hỗ trợ hoặc kiểm tra lịch sử đặt vé."
          );
          return;
        }

        // Thành công → nhảy sang trang CheckoutSuccess
        setStatus("success");
        setMessage("Thanh toán thành công! Đang chuyển tới trang thông tin vé...");

        setTimeout(() => {
          navigate(`/checkout-success?bookingId=${bookingId}&method=${methodParam}`, {
            replace: true,
          });
        }, 1200);
      } catch (err) {
        console.error("[PaymentCallback] capturePayment error:", err);
        if (cancelled) return;

        setStatus("error");
        setMessage(
          "Có lỗi xảy ra khi xác nhận thanh toán với cổng thanh toán.\n" +
            "Vui lòng thử lại sau."
        );
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [searchParams, navigate]);

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
            {message && (
              <p className="text-xs text-white/50 whitespace-pre-line">
                {message}
              </p>
            )}
          </>
        )}

        {status === "success" && (
          <>
            <p className="text-sm text-emerald-400 mb-2">
              Thanh toán thành công!
            </p>
            {message && (
              <p className="text-xs text-white/60 whitespace-pre-line">
                {message}
              </p>
            )}
          </>
        )}

        {status === "error" && (
          <>
            <p className="text-sm text-red-400 mb-3">
              Có lỗi xảy ra khi xử lý thanh toán.
            </p>
            {message && (
              <p className="text-xs text-white/60 mb-4 whitespace-pre-line">
                {message}
              </p>
            )}
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























// BẢN DƯỚI SÀI MOCK
// import { useEffect, useState } from "react";
// import { useNavigate, useSearchParams } from "react-router-dom";

// export default function PaymentCallbackPage() {
//   const [searchParams] = useSearchParams();
//   const navigate = useNavigate();

//   const [status, setStatus] = useState("loading"); // loading | success | error
//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     const transactionId = searchParams.get("transactionId");
//     const method = (searchParams.get("method") || "").toUpperCase();
//     const bookingId = searchParams.get("bookingId");
//     const isMock = searchParams.get("mock") === "1";

//     console.log("[PaymentCallback] params = ", {
//       transactionId,
//       method,
//       bookingId,
//       isMock,
//     });

//     // ❌ Không redirect về home khi thiếu param, chỉ báo lỗi cho dễ debug
//     if (!transactionId || !method || !bookingId) {
//       setStatus("error");
//       setMessage(
//         "Thiếu transactionId / method / bookingId trên URL. Kiểm tra lại paymentUrl."
//       );
//       return;
//     }

//     let cancelled = false;

//     (async () => {
//       try {
//         // 🔹 MOCK FLOW
//         if (isMock) {
//           setStatus("loading");
//           setMessage("Đang xử lý thanh toán (MOCK)...");

//           await new Promise((r) => setTimeout(r, 800));
//           if (cancelled) return;

//           setStatus("success");
//           setMessage(
//             "Thanh toán MOCK thành công, chuẩn bị chuyển sang trang vé..."
//           );

//           setTimeout(() => {
//             if (cancelled) return;
//             navigate(
//               `/checkout-success?bookingId=${bookingId}&method=${method}`,
//               { replace: true }
//             );
//           }, 800);

//           return;
//         }

//       } catch (err) {
//         console.error("[PaymentCallback] error", err);
//         setStatus("error");
//         setMessage("Có lỗi khi xử lý kết quả thanh toán.");
//       }
//     })();

//     return () => {
//       cancelled = true;
//     };
//   }, [searchParams, navigate]);

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-[#050018] text-white px-4">
//       <div className="max-w-md w-full bg-black/60 border border-white/10 rounded-3xl px-6 py-8 text-center shadow-[0_18px_60px_rgba(0,0,0,0.9)]">
//         <h1 className="text-lg font-extrabold tracking-[0.2em] mb-4">
//           THANH TOÁN
//         </h1>

//         {status === "loading" && (
//           <>
//             <p className="text-sm text-white/80 mb-2">
//               Đang xử lý kết quả thanh toán...
//             </p>
//             {message && (
//               <p className="text-xs text-white/50 whitespace-pre-line">
//                 {message}
//               </p>
//             )}
//           </>
//         )}

//         {status === "success" && (
//           <>
//             <p className="text-sm text-emerald-400 mb-2">
//               Thanh toán thành công!
//             </p>
//             {message && (
//               <p className="text-xs text-white/60 whitespace-pre-line">
//                 {message}
//               </p>
//             )}
//           </>
//         )}

//         {status === "error" && (
//           <>
//             <p className="text-sm text-red-400 mb-3">
//               Có lỗi xảy ra khi xử lý thanh toán.
//             </p>
//             {message && (
//               <p className="text-xs text-white/60 mb-4 whitespace-pre-line">
//                 {message}
//               </p>
//             )}
//             <button
//               onClick={() => navigate("/", { replace: true })}
//               className="inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-2 text-xs font-semibold uppercase tracking-[0.18em] hover:bg-white hover:text-black transition"
//             >
//               Về trang chủ
//             </button>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }
