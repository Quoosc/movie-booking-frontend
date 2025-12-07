// src/api/ticketTypeService.js
import { apiFetch } from "./fetchConfig";


function mapTicketTypeFromApi(t) {
  if (!t) return null;

  const ticketTypeId = t.ticketTypeId;
  const code = t.code || "";
  const label = t.label || code || "Vé xem phim";
  const price = typeof t.price === "number" ? t.price : 0;

  return {
    id: code ? code.toLowerCase() : ticketTypeId, // dùng cho UI
    ticketTypeId, // UUID dùng để gửi lại BE
    code,
    label,
    price,
    raw: t,
  };
}

export async function getTicketTypes({ showtimeId, userId } = {}) {
  const params = new URLSearchParams();
  if (showtimeId) params.append("showtimeId", showtimeId);
  if (userId) params.append("userId", userId);

  const query = params.toString();
  const res = await apiFetch(`/ticket-types${query ? `?${query}` : ""}`);

  const wrapper = res || {};
  const list = wrapper.data || wrapper;

  const mapped =
    Array.isArray(list) && list.length > 0
      ? list.map(mapTicketTypeFromApi).filter(Boolean)
      : [];

  if (!mapped.length) {
    console.error(
      "Không lấy được ticket type từ hệ thống."
    );
  }

  return mapped;
}

