// src/api/ticketTypeService.js

// Hiện tại FE đang mock, nhưng chuẩn bị sẵn phần gọi BE thật
//import { apiFetch } from "./fetchConfig";

// hoặc import USE_MOCK từ fetchConfig)
const USE_MOCK = true;

// --- MOCK cho ticket-types (camelCase giống BE) ---
const MOCK_TICKET_TYPES = [
  { ticketTypeId: "adult", label: "NGƯỜI LỚN",          price: 69000 },
  { ticketTypeId: "student", label: "HSSV/U22-GV",      price: 49000 },
  { ticketTypeId: "senior", label: "NGƯỜI CAO TUỔI",    price: 55000 },
  { ticketTypeId: "member", label: "GIÁ VÉ THÀNH VIÊN", price: 45000 },
  { ticketTypeId: "double", label: "GHẾ ĐÔI (2 NGƯỜI)", price: 128000 },
];

// Map BE → format FE đang dùng trong UI: { id, label, price }
function mapTicketTypeFromApi(api) {
  if (!api) return null;

  return {
    // Ưu tiên camelCase mới, fallback id khác nếu sau này đổi
    id: api.ticketTypeId || api.id || api.ticket_type_id,
    label: api.label,
    price: api.price,
  };
}

/**
 * FE gọi:
 *   getTicketTypes()  // base pricing (mock hoặc /ticket-types)
 *   getTicketTypes({ showtimeId, userId }) // dynamic pricing theo suất chiếu
 *
 * BE spec:
 *   GET /ticket-types
 *   GET /ticket-types?showtimeId={id}&userId={optional}
 *   Response:
 *   {
 *     "code": 200,
 *     "data": [
 *       { "ticketTypeId": "...", "label": "...", "price": 12345 }
 *     ]
 *   }
 */
export async function getTicketTypes({ showtimeId, userId } = {}) {
  // ===== MOCK MODE: dùng cho hiện tại =====
  if (USE_MOCK) {
    return MOCK_TICKET_TYPES.map(mapTicketTypeFromApi).filter(Boolean);
  }

  // ===== REAL API MODE: bật khi BE sẵn sàng =====
  // let url = "/ticket-types";
  // const params = new URLSearchParams();

  // // dynamic pricing theo suất chiếu + user
  // if (showtimeId) params.append("showtimeId", showtimeId);
  // if (userId) params.append("userId", userId);

  // const query = params.toString();
  // if (query) {
  //   url += `?${query}`;
  // }

  // const res = await apiFetch(url);

  // // BE trả { code, data } → ưu tiên res.data
  // const raw = res?.data ?? res;

  // return (Array.isArray(raw) ? raw : [])
  //   .map(mapTicketTypeFromApi)
  //   .filter(Boolean);
}
