// // src/app/(public)/payment-callback/page.jsx

// import { useEffect, useState } from "react";
// import { useLocation, useNavigate } from "react-router-dom";

// import Navbar from "@/components/common/Navbar";
// import Footer from "@/components/common/Footer";
// import { capturePayment } from "@/api/paymentService";

// export default function PaymentCallbackPage() {
//   const location = useLocation();
//   const navigate = useNavigate();

//   const [status, setStatus] = useState("processing"); // "processing" | "error"
//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     const handleCallback = async () => {
//       const search = new URLSearchParams(location.search);

//       // ƯU TIÊN: backend nên redirect về với ?transactionId=...&method=PAYPAL/MOMO
//       let transactionId =
//         search.get("transactionId") ||
//         search.get("token") || // PayPal thường trả token
//         search.get("requestId") ||
//         search.get("orderId");

//       let methodParam =
//         (search.get("method") || search.get("paymentMethod") || "").toUpperCase();

//       let paymentMethod =
//         methodParam === "MOMO"
//           ? "MOMO"
//           : methodParam === "PAYPAL"
//           ? "PAYPAL"
//           : null;

//       if (!transactionId || !paymentMethod) {
//         setStatus("error");
//         setMessage(
//           "Thông tin thanh toán không hợp lệ hoặc đã hết hạn.\nVui lòng thử thanh toán lại từ đầu."
//         );
//         return;
//       }

//       try {
//         const res = await capturePayment({
//           transactionId,
//           paymentMethod,
//         });

//         const wrapper = res || {};
//         const data = wrapper.data || wrapper;

//         // Lỗi có code khác 200
//         if (wrapper.code && wrapper.code !== 200) {
//           if (wrapper.code === 409) {
//             // Payment already processed
//             setStatus("error");
//             setMessage(
//               wrapper.message ||
//                 "Giao dịch này đã được xử lý trước đó. Vui lòng kiểm tra lịch sử đặt vé."
//             );
//           } else {
//             setStatus("error");
//             setMessage(
//               wrapper.message ||
//                 "Thanh toán không thành công. Vui lòng thử lại hoặc chọn phương thức khác."
//             );
//           }
//           return;
//         }

//         const bookingId = data.bookingId || data.booking_id || null;

//         if (!bookingId) {
//           setStatus("error");
//           setMessage(
//             "Thanh toán có vẻ đã thành công nhưng không tìm thấy thông tin vé.\nVui lòng liên hệ hỗ trợ hoặc kiểm tra lịch sử đặt vé."
//           );
//           return;
//         }

//         navigate(`/checkout/success?bookingId=${bookingId}`, { replace: true });
//       } catch (err) {
//         console.error("capturePayment error:", err);
//         setStatus("error");
//         setMessage(
//           "Có lỗi xảy ra khi xác nhận thanh toán với cổng thanh toán.\nVui lòng thử lại sau."
//         );
//       }
//     };

//     handleCallback();
//   }, [location.search, navigate]);

//   // UI – đang xử lý / lỗi (success sẽ redirect đi luôn)
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-[#050018] text-white px-4">
    //   <div className="max-w-md w-full bg-black/60 border border-white/10 rounded-3xl px-6 py-8 text-center shadow-[0_18px_60px_rgba(0,0,0,0.9)]">
    //     <h1 className="text-lg font-extrabold tracking-[0.2em] mb-4">
    //       THANH TOÁN
    //     </h1>

    //     {status === "loading" && (
    //       <>
    //         <p className="text-sm text-white/80 mb-2">
    //           Đang xử lý kết quả thanh toán...
    //         </p>
    //         <p className="text-xs text-white/50">{message}</p>
    //       </>
    //     )}

    //     {status === "success" && (
    //       <>
    //         <p className="text-sm text-emerald-400 mb-2">
    //           Thanh toán thành công!
    //         </p>
    //         <p className="text-xs text-white/60">{message}</p>
    //       </>
    //     )}

    //     {status === "error" && (
    //       <>
    //         <p className="text-sm text-red-400 mb-3">
    //           Có lỗi xảy ra khi xử lý thanh toán.
    //         </p>
    //         <p className="text-xs text-white/60 mb-4">{message}</p>
    //         <button
    //           onClick={() => navigate("/", { replace: true })}
    //           className="inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-2 text-xs font-semibold uppercase tracking-[0.18em] hover:bg-white hover:text-black transition"
    //         >
    //           Về trang chủ
    //         </button>
    //       </>
    //     )}
    //   </div>
    // </div>
//       </main>

//       <Footer />
//     </div>
//   );
// }



// BẢN DƯỚI SÀI MOCK
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function PaymentCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const transactionId = searchParams.get("transactionId");
    const method = (searchParams.get("method") || "").toUpperCase();
    const bookingId = searchParams.get("bookingId");
    const isMock = searchParams.get("mock") === "1";

    console.log("[PaymentCallback] params = ", {
      transactionId,
      method,
      bookingId,
      isMock,
    });

    // ❌ Không redirect về home khi thiếu param, chỉ báo lỗi cho dễ debug
    if (!transactionId || !method || !bookingId) {
      setStatus("error");
      setMessage(
        "Thiếu transactionId / method / bookingId trên URL. Kiểm tra lại paymentUrl."
      );
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        // 🔹 MOCK FLOW
        if (isMock) {
          setStatus("loading");
          setMessage("Đang xử lý thanh toán (MOCK)...");

          await new Promise((r) => setTimeout(r, 800));
          if (cancelled) return;

          setStatus("success");
          setMessage(
            "Thanh toán MOCK thành công, chuẩn bị chuyển sang trang vé..."
          );

          setTimeout(() => {
            if (cancelled) return;
            navigate(
              `/checkout-success?bookingId=${bookingId}&method=${method}`,
              { replace: true }
            );
          }, 800);

          return;
        }

        // 🔹 REAL FLOW (sau này nối BE thật)
        // const res = await capturePayment({ transactionId, paymentMethod: method });
        // if (res.code === 200) {
        //   navigate(
        //     `/checkout-success?bookingId=${bookingId}&method=${method}`,
        //     { replace: true }
        //   );
        // } else {
        //   setStatus("error");
        //   setMessage(res.message || "Xử lý thanh toán thất bại.");
        // }

      } catch (err) {
        console.error("[PaymentCallback] error", err);
        setStatus("error");
        setMessage("Có lỗi khi xử lý kết quả thanh toán.");
      }
    })();

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
