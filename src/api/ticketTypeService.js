// src/api/ticketTypeService.js
// src/api/ticketTypeService.js

// Phase mock: chỉ dùng mock, chưa gọi BE thật
// Sau này nối BE thì bỏ comment USE_MOCK ở dưới và import từ fetchConfig
// import { apiFetch, USE_MOCK } from "./fetchConfig";
import { apiFetch } from "./fetchConfig";

// TẠM THỜI: luôn dùng mock ticket-types
const USE_MOCK = true;


// --- MOCK cho ticket-types (đã camelCase giống BE mới) ---
const MOCK_TICKET_TYPES = [
  { ticketTypeId: "adult", label: "NGƯỜI LỚN", price: 69000 },
  { ticketTypeId: "student", label: "HSSV/U22-GV", price: 49000 },
  { ticketTypeId: "senior", label: "NGƯỜI CAO TUỔI", price: 55000 },
  { ticketTypeId: "member", label: "GIÁ VÉ THÀNH VIÊN", price: 45000 },
  { ticketTypeId: "double", label: "GHẾ ĐÔI (2 NGƯỜI)", price: 128000 },
];

// Map BE → format FE đang dùng trong UI: { id, label, price }
function mapTicketTypeFromApi(api) {
  if (!api) return null;
  return {
    id: api.ticketTypeId || api.id, // API mới dùng ticketTypeId
    label: api.label,
    price: api.price,
  };
}

// FE gọi: getTicketTypes({ showtimeId, userId })
export async function getTicketTypes({ showtimeId, userId } = {}) {
  if (USE_MOCK) {
    return MOCK_TICKET_TYPES.map(mapTicketTypeFromApi).filter(Boolean);
  }
   //Khi nối BE thật, bỏ const USE_MOCK = true ở trên,
  //           bật lại import apiFetch + code này.
  // let url = "/ticket-types";
  // const params = new URLSearchParams();

  // // ✅ camelCase đúng theo API mới
  // if (showtimeId) params.append("showtimeId", showtimeId);
  // if (userId) params.append("userId", userId);

  // const query = params.toString();
  // if (query) {
  //   url += `?${query}`;
  // }

  // const res = await apiFetch(url);
  // const data = res.data || res;

  // return (Array.isArray(data) ? data : [])
  //   .map(mapTicketTypeFromApi)
  //   .filter(Boolean);
}
