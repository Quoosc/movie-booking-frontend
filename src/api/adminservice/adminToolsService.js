// src/api/adminservice/adminToolsService.js
import { apiFetch } from "../fetchConfig";

const buildQuery = (params = {}) => {
  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null && value !== ""
  );
  if (!entries.length) return "";
  const qs = new URLSearchParams(entries).toString();
  return `?${qs}`;
};

/* ===================== SEAT LOCKS (TOOLS / DEBUG) ===================== */

/**
 * Lock seats cho 1 showtime:
 * {
 *   showtimeId,
 *   seats: [{ showtimeSeatId, ticketTypeId }]
 * }
 * FE phải gửi token (user) hoặc X-Session-Id (guest) ở header -> apiFetch lo phần này
 */
export async function createSeatLock(payload) {
  const res = await apiFetch("/seat-locks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
return res.data || res; // LockSeatsResponse
}

/**
 * Xem availability + lock info cho showtime
 * Optional: truyền session id (guest) hoặc dùng JWT để BE trả thêm sessionLockInfo
 */
export async function getSeatLockAvailability(showtimeId) {
  const res = await apiFetch(
    `/seat-locks/availability/showtime/${showtimeId}`
  );
return res.data || res; // SeatAvailabilityResponse
}

/** Giải phóng mọi lock của 1 showtime (trước timeout) */
export async function releaseSeatLocks(showtimeId) {
  const res = await apiFetch(`/seat-locks/showtime/${showtimeId}`, {
    method: "DELETE",
  });
return res.data || res;
}

/* ===================== CHECKOUT PRICE PREVIEW (TOOLS) ===================== */

/**
 * Preview giá (trước khi checkout)
 * body theo spec /bookings/price-preview
 */
export async function previewBookingPrice(payload) {
  const res = await apiFetch("/bookings/price-preview", {
    method: "POST",
    body: JSON.stringify(payload),
  });
return res.data || res; // sẽ là BookingPricePreviewResponse (theo design)
}

/* ===================== PROMOTIONS ===================== */

export async function createPromotion(payload) {
  const res = await apiFetch("/promotions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
return res.data || res;
}

export async function updatePromotion(promotionId, payload) {
  const res = await apiFetch(`/promotions/${promotionId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
return res.data || res;
}

export async function deactivatePromotion(promotionId) {
  const res = await apiFetch(`/promotions/${promotionId}/deactivate`, {
    method: "PATCH",
  });
return res.data || res;
}

export async function deletePromotion(promotionId) {
  const res = await apiFetch(`/promotions/${promotionId}`, {
    method: "DELETE",
  });
return true;
}

export async function getPromotionById(promotionId) {
  const res = await apiFetch(`/promotions/${promotionId}`);
return res.data || res;
}

export async function getPromotionByCode(code) {
  const res = await apiFetch(`/promotions/code/${code}`);
return res.data || res;
}

/**
 * Lấy danh sách promotions:
 * - filter = undefined  -> all
 * - filter = "active"   -> chỉ active
 * - filter = "valid"    -> active + trong date range
 */
export async function getPromotions(filter) {
  const res = await apiFetch(`/promotions${buildQuery({ filter })}`);
return res.data || res;
}

export async function getActivePromotions() {
  const res = await apiFetch("/promotions/active");
return res.data || res;
}

export async function getValidPromotions() {
  const res = await apiFetch("/promotions/valid");
return res.data || res;
}
