// src/api/adminservice/adminPricingService.js
import { apiFetch } from "../fetchConfig";

const buildQuery = (params = {}) => {
  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null && value !== ""
  );
  if (!entries.length) return "";
  const qs = new URLSearchParams(entries).toString();
  return `?${qs}`;
};

/* ===================== PRICE BASE ===================== */

export async function createPriceBase(payload) {
  const res = await apiFetch("/price-base", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res; // PriceBaseResponse
}

export async function updatePriceBase(id, payload) {
  const res = await apiFetch(`/price-base/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return res;
}

export async function deletePriceBase(id) {
  const res = await apiFetch(`/price-base/${id}`, { method: "DELETE" });
  return res;
}

export async function getPriceBaseById(id) {
  const res = await apiFetch(`/price-base/${id}`);
  return res;
}

export async function getPriceBases() {
  const res = await apiFetch("/price-base");
  return res; // List
}

export async function getActivePriceBase() {
  const res = await apiFetch("/price-base/active");
  return res;
}

/* ===================== PRICE MODIFIERS ===================== */

export async function createPriceModifier(payload) {
  const res = await apiFetch("/price-modifiers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res;
}

export async function updatePriceModifier(id, payload) {
  const res = await apiFetch(`/price-modifiers/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return res;
}

export async function deletePriceModifier(id) {
  const res = await apiFetch(`/price-modifiers/${id}`, {
    method: "DELETE",
  });
  return res;
}

export async function getPriceModifierById(id) {
  const res = await apiFetch(`/price-modifiers/${id}`);
  return res;
}

export async function getPriceModifiers() {
  const res = await apiFetch("/price-modifiers");
  return res;
}

export async function getActivePriceModifiers() {
  const res = await apiFetch("/price-modifiers/active");
  return res;
}

export async function getPriceModifiersByCondition(conditionType) {
  const res = await apiFetch(
    `/price-modifiers/by-condition${buildQuery({ conditionType })}`
  );
  return res;
}

/* ===================== TICKET TYPES ===================== */

/**
 * Public ticket types cho 1 showtime (đã tính giá)
 * showtimeId bắt buộc, userId optional
 */
export async function getPublicTicketTypes(showtimeId, userId) {
  const res = await apiFetch(
    `/ticket-types${buildQuery({ showtimeId, userId })}`
  );
  return res; // List<TicketTypeResponse>
}

/** Admin: lấy toàn bộ ticket types (kể cả inactive) */
export async function getAdminTicketTypes() {
  const res = await apiFetch("/ticket-types/admin");
  return res;
}

export async function createTicketType(payload) {
  const res = await apiFetch("/ticket-types", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res;
}

export async function updateTicketType(id, payload) {
  const res = await apiFetch(`/ticket-types/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return res;
}

export async function deleteTicketType(id) {
  const res = await apiFetch(`/ticket-types/${id}`, {
    method: "DELETE",
  });
  return res;
}

/* ========== SHOWTIME TICKET TYPES (gán ticket type cho showtime) ========== */

export async function getShowtimeTicketTypes(showtimeId) {
  const res = await apiFetch(`/showtimes/${showtimeId}/ticket-types`);
  return res; // { showtimeId, assignedTicketTypeIds: [...] }
}

/** Thay thế toàn bộ danh sách ticketTypeIds của showtime */
export async function replaceShowtimeTicketTypes(showtimeId, ticketTypeIds) {
  const res = await apiFetch(`/showtimes/${showtimeId}/ticket-types`, {
    method: "PUT",
    body: JSON.stringify({ ticketTypeIds }),
  });
  return res;
}

/** Gán thêm nhiều ticketTypeIds cho showtime */
export async function addShowtimeTicketTypes(showtimeId, ticketTypeIds) {
  const res = await apiFetch(`/showtimes/${showtimeId}/ticket-types`, {
    method: "POST",
    body: JSON.stringify({ ticketTypeIds }),
  });
  return res;
}

/** Gán 1 ticket type (dùng path param) */
export async function addShowtimeTicketType(showtimeId, ticketTypeId) {
  const res = await apiFetch(
    `/showtimes/${showtimeId}/ticket-types/${ticketTypeId}`,
    { method: "POST" }
  );
  return res;
}

/** Bỏ gán 1 ticket type khỏi showtime */
export async function removeShowtimeTicketType(showtimeId, ticketTypeId) {
  const res = await apiFetch(
    `/showtimes/${showtimeId}/ticket-types/${ticketTypeId}`,
    { method: "DELETE" }
  );
  return res;
}

/* ===================== SHOWTIME SEATS (GIÁ + TRẠNG THÁI) ===================== */

export async function getShowtimeSeatById(id) {
  const res = await apiFetch(`/showtime-seats/${id}`);
  return res;
}

export async function getShowtimeSeats(showtimeId) {
  const res = await apiFetch(`/showtime-seats/showtime/${showtimeId}`);
  return res;
}

export async function getAvailableShowtimeSeats(showtimeId) {
  const res = await apiFetch(
    `/showtime-seats/showtime/${showtimeId}/available`
  );
  return res;
}

/**
 * Cập nhật trạng thái hoặc giá cho 1 showtime seat
 * payload có thể chứa: { status, price }
 */
export async function updateShowtimeSeat(id, payload) {
  const res = await apiFetch(`/showtime-seats/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return res;
}

/** Reset 1 showtime seat về AVAILABLE + giá gốc */
export async function resetShowtimeSeat(id) {
  const res = await apiFetch(`/showtime-seats/${id}/reset`, {
    method: "PUT",
  });
  return res;
}

/** Recalculate giá cho toàn bộ seats của 1 showtime */
export async function recalculateShowtimeSeatPrices(showtimeId) {
  const res = await apiFetch(
    `/showtime-seats/showtime/${showtimeId}/recalculate-prices`,
    { method: "POST" }
  );
  return res;
}
