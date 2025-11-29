// src/api/ticketTypeService.js

import { apiFetch } from "./fetchConfig";

const USE_MOCK = false;

/**
 * MOCK – dùng để test UI, tương đương dữ liệu spec cũ
 */
const MOCK_TICKET_TYPES = [
  {
    ticketTypeId: "adult",   // mock: tạm dùng code làm ID
    code: "adult",
    label: "NGƯỜI LỚN",
    price: 69000,
  },
  {
    ticketTypeId: "student",
    code: "student",
    label: "HSSV/U22-GV",
    price: 49000,
  },
  {
    ticketTypeId: "senior",
    code: "senior",
    label: "NGƯỜI CAO TUỔI",
    price: 55000,
  },
  {
    ticketTypeId: "member",
    code: "member",
    label: "GIÁ VÉ THÀNH VIÊN",
    price: 45000,
  },
  {
    ticketTypeId: "double",
    code: "double",
    label: "GHẾ ĐÔI (2 NGƯỜI)",
    price: 128000,
  },
];

function mapTicketType(t) {
  return {
    // id dùng cho FE
    id: t.ticketTypeId || t.id,
    // giữ nguyên ticketTypeId để gửi lên price-preview / booking
    ticketTypeId: t.ticketTypeId || t.id,
    code: t.code,
    label: t.label,
    price: Number(t.price ?? 0),
  };
}

/**
 * GET /ticket-types
 *
 * - Nếu truyền showtimeId => giá đã tính theo suất chiếu (API mới v2.3)
 * - userId optional: dùng cho member sau này.
 *
 * Hiện tại:
 *   - MOCK: luôn trả MOCK_TICKET_TYPES (không phụ thuộc showtimeId)
 *   - BE thật: đọc theo spec mới { code, message, data: [...] }
 */
export async function getTicketTypes({ showtimeId, userId } = {}) {
  if (USE_MOCK) {
    // MOCK: luôn trả list cố định để test UI
    return MOCK_TICKET_TYPES.map(mapTicketType);
  }

  const params = new URLSearchParams();

  if (showtimeId) {
    params.set("showtimeId", showtimeId);
  }
  if (userId) {
    params.set("userId", userId);
  }

  const qs = params.toString();
  const res = await apiFetch(`/ticket-types${qs ? `?${qs}` : ""}`);

  // BE spec: { code, message, data: [...] }
  const raw = res.data || res;
  const list = raw.data || raw;

  return (list || []).map(mapTicketType);
}
