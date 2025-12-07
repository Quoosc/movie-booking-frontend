// src/api/ticketTypeService.js
import { apiFetch } from "./fetchConfig";

const FALLBACK_TICKET_TYPES = [
  {
    id: "adult",
    ticketTypeId: "adult",
    code: "adult",
    label: "NGƯỜI LỚN",
    price: 69000,
  },
  {
    id: "student",
    ticketTypeId: "student",
    code: "student",
    label: "HSSV/U22-GV",
    price: 49000,
  },
  {
    id: "senior",
    ticketTypeId: "senior",
    code: "senior",
    label: "NGƯỜI CAO TUỔI",
    price: 55000,
  },
  {
    id: "member",
    ticketTypeId: "member",
    code: "member",
    label: "GIÁ VÉ THÀNH VIÊN",
    price: 45000,
  },
  {
    id: "double",
    ticketTypeId: "double",
    code: "double",
    label: "GHẾ ĐÔI (2 NGƯỜI)",
    price: 128000,
  },
];

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

// ⚠️ Dùng đúng spec mới: GET /ticket-types?showtimeId=&userId=
export async function getTicketTypes({ showtimeId, userId } = {}) {
  const params = new URLSearchParams();
  if (showtimeId) params.append("showtimeId", showtimeId);
  if (userId) params.append("userId", userId);

  const query = params.toString();
  const res = await apiFetch(`/ticket-types${query ? `?${query}` : ""}`);

  const wrapper = res || {};
  const list = wrapper.data || wrapper;

  let mapped =
    Array.isArray(list) && list.length > 0
      ? list.map(mapTicketTypeFromApi).filter(Boolean)
      : [];

  if (!mapped.length) {
    console.warn("ticket-types empty, dùng FALLBACK_TICKET_TYPES");
    mapped = FALLBACK_TICKET_TYPES;
  }

  return mapped;
}
