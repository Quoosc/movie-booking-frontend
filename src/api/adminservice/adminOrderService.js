// src/api/adminservice/adminOrderService.js
import { apiFetch } from "../fetchConfig";

const buildQuery = (params = {}) => {
  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null && value !== ""
  );
  if (!entries.length) return "";
  const qs = new URLSearchParams(entries).toString();
  return `?${qs}`;
};

/* ===================== BOOKINGS (ADMIN VIEW) ===================== */

/** Chi tiết booking */
export async function getBookingById(bookingId) {
  const res = await apiFetch(`/bookings/${bookingId}`);
  return res.data || res; // trả BookingResponse trực tiếp
}

/** Cập nhật / lưu QR code URL cho booking */
export async function updateBookingQr(bookingId, qrCodeUrl) {
  const res = await apiFetch(`/bookings/${bookingId}/qr`, {
    method: "PATCH",
    body: JSON.stringify({ qrCodeUrl }),
  });
  return res.data || res; // trả BookingResponse trực tiếp
}

/* ===================== PAYMENTS & REFUNDS ===================== */

/**
 * Tìm kiếm payments:
 * filters: { bookingId, userId, status, method, startDate, endDate }
 */
export async function searchPayments(filters = {}) {
  const { bookingId, userId, status, method, startDate, endDate } = filters;
  const res = await apiFetch(
    `/payments/search${buildQuery({
      bookingId,
      userId,
      status,
      method,
      startDate,
      endDate,
    })}`
  );
  return res.data || res; //rả List<PaymentResponse>
}

/** Tạo payment order (trường hợp admin tạo lại giao dịch) */
export async function createPaymentOrder(payload) {
  const res = await apiFetch("/payments/order", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data || res; // InitiatePaymentResponse
}

/** Capture / confirm payment với gateway */
export async function capturePayment(payload) {
  const res = await apiFetch("/payments/order/capture", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data || res; //PaymentResponse
}

/** Request refund cho 1 payment */
export async function requestRefund(paymentId, reason) {
  const res = await apiFetch(`/payments/${paymentId}/refund`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
  return res.data || res; //PaymentResponse
}

/* ===================== MOMO IPN (DEV TOOL) ===================== */

export async function getMomoIpnTest() {
  const res = await apiFetch("/payments/momo/ipn");
  return res.data || res; // IpnResponse
}

export async function postMomoIpnTest(body) {
  const res = await apiFetch("/payments/momo/ipn", {
    method: "POST",
    body: JSON.stringify(body),
  });
  return res.data || res; // IpnResponse
}
