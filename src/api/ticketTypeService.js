// src/api/ticketTypeService.js

const USE_MOCK = true;

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

function mapTicketTypeFromApi(api) {
  if (!api) return null;

  const code =
    (api.code || api.ticketTypeId || api.id || api.ticket_type_id || "")
      .toString()
      .toLowerCase();

  return {
    // FE logic: vẫn dùng t.id === "member" / "double" ok
    id: code,
    code,
    ticketTypeId: api.ticketTypeId || null, //uuid
    label: api.label,
    price: api.price,
  };
}

export async function getTicketTypes({ showtimeId, userId } = {}) {
  if (USE_MOCK) {
    return MOCK_TICKET_TYPES.map(mapTicketTypeFromApi).filter(Boolean);
  }

  // REAL API (khi bật):
  // let url = "/ticket-types";
  // const params = new URLSearchParams();
  // if (showtimeId) params.append("showtimeId", showtimeId);
  // if (userId) params.append("userId", userId);
  // const query = params.toString();
  // if (query) url += `?${query}`;
  //
  // const res = await apiFetch(url);
  // const raw = res?.data ?? res;
  // return (Array.isArray(raw) ? raw : [])
  //   .map(mapTicketTypeFromApi)
  //   .filter(Boolean);
}
