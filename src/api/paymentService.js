// src/api/paymentService.js
import { apiFetch } from "./fetchConfig";

/**
 * Gọi /payments/order/capture để hoàn tất giao dịch
 * Body theo spec:
 * {
 *   "transactionId": "PayPal order ID hoặc Momo requestId",
 *   "paymentMethod": "PAYPAL" | "MOMO"
 * }
 */
export async function capturePayment({ transactionId, paymentMethod }) {
  if (!transactionId || !paymentMethod) {
    throw new Error("transactionId và paymentMethod là bắt buộc");
  }

  const method = String(paymentMethod).toUpperCase(); // PAYPAL | MOMO

  const json = await apiFetch("/payments/order/capture", {
    method: "POST",
    body: JSON.stringify({
      transactionId,
      paymentMethod: method,
    }),
  });


  return json;
}











































