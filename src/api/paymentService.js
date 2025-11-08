// src/api/paymentService.js
import { apiFetch, USE_MOCK } from "./fetchConfig";

export async function createPayment(bookingId, method) {
  if (USE_MOCK) {
    return {
      payment_id: "mock-payment",
      booking_id: bookingId,
      status: "PENDING",
      payment_url: "#",
    };
  }
  const res = await apiFetch("/payments", {
    method: "POST",
    body: JSON.stringify({ bookingId, method }),
  });
  return res.data || res;
}
