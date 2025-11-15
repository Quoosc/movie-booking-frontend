// src/api/ticketTypeService.js

// Sau này bạn có thể bật apiFetch giống các service khác
// import { apiFetch, USE_MOCK } from "./fetchConfig";

const USE_MOCK = true;

const MOCK_TICKET_TYPES = [
  {
    ticket_type_id: "adult",
    label: "NGƯỜI LỚN",
    description: "Vé người lớn từ 18 tuổi",
    price: 69000,
  },
  {
    ticket_type_id: "student",
    label: "HSSV/U22-GV",
    description: "Học sinh, sinh viên, U22, giáo viên",
    price: 49000,
  },
  {
    ticket_type_id: "senior",
    label: "NGƯỜI CAO TUỔI",
    description: "Khách từ 60 tuổi trở lên",
    price: 55000,
  },
  {
    ticket_type_id: "member",
    label: "GIÁ VÉ THÀNH VIÊN",
    description: "Giá ưu đãi cho thành viên CinesVerse",
    price: 45000,
  },
  {
    ticket_type_id: "double",
    label: "GHẾ ĐÔI (2 NGƯỜI)",
    description: "Ghế sofa đôi cho 2 người",
    price: 128000,
  },
];

function mapTicketType(t) {
  return {
    id: t.ticket_type_id,
    label: t.label,
    description: t.description || "",
    price: t.price,
  };
}

/**
 * GET /ticket-types
 * FE dùng để fill phần "CHỌN LOẠI VÉ"
 */
export async function getTicketTypes() {
  if (USE_MOCK) {
    return MOCK_TICKET_TYPES.map(mapTicketType);
  }

  // Khi có backend:
  // const res = await apiFetch("/ticket-types");
  // return (res.data || res).map(mapTicketType);
}
