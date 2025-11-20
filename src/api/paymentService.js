// src/api/paymentService.js
import { apiFetch, USE_MOCK } from "./fetchConfig";

/**
 * Gọi /payments/order/capture để hoàn tất giao dịch
 * Body chuẩn theo spec:
 * {
 *   "transactionId": "PayPal order ID hoặc Momo requestId",
 *   "paymentMethod": "PAYPAL" | "MOMO"
 * }
 */
export async function capturePayment({ transactionId, paymentMethod }) {
  if (!transactionId || !paymentMethod) {
    throw new Error("transactionId và paymentMethod là bắt buộc");
  }

  if (USE_MOCK) {
    // Mock success để test flow FE
    console.log("[MOCK] capturePayment", { transactionId, paymentMethod });
    return {
      code: 200,
      message: "Payment completed successfully (mock)",
      data: {
        paymentId: "mock-payment-id",
        bookingId: "mock-booking-id",
        amount: 216000,
        currency: "VND",
        gatewayAmount: 8.64,
        gatewayCurrency: "USD",
        exchangeRate: 25000,
        status: "COMPLETED",
        method: paymentMethod,
        bookingStatus: "CONFIRMED",
        qrPayload: "MOCK_QR_PAYLOAD",
      },
    };
  }

  const res = await apiFetch("/payments/order/capture", {
    method: "POST",
    body: JSON.stringify({
      transactionId,
      paymentMethod,
    }),
  });

  return res;
}
