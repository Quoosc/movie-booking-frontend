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

/**
 * Read the persisted MoMo result after its signed IPN callback.
 * The browser redirect is not trusted as proof of payment.
 */
export async function getPaymentStatus({ transactionId, paymentMethod }) {
  if (!transactionId || !paymentMethod) {
    throw new Error("transactionId và paymentMethod là bắt buộc");
  }

  const query = new URLSearchParams({
    transactionId,
    paymentMethod: String(paymentMethod).toUpperCase(),
  });

  return apiFetch(`/payments/order/status?${query.toString()}`);
}











































