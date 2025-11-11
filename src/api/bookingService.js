// src/api/bookingService.js
// import { apiFetch, USE_MOCK } from "./fetchConfig";

const USE_MOCK = true;

/**
 * MOCK SEAT LAYOUT
 * key: showtimeId
 * data tương tự /seats/layout
 */
const MOCK_SEATS = {
  st1: genMockSeats("st1"),
  st2: genMockSeats("st2"),
  st3: genMockSeats("st3"),
  st4: genMockSeats("st4"),
  st5: genMockSeats("st5"),
  st6: genMockSeats("st6"),
};

// Tạo layout ghế demo
function genMockSeats(showtimeId) {
  const rows = "ABCDEFGHIJ".split("");
  const seats = [];

  rows.forEach((row, rIndex) => {
    const count = 14;
    for (let i = 1; i <= count; i++) {
      const id = `${showtimeId}-${row}${i}`;

      const type =
        rIndex >= 7
          ? "COUPLE" // 3 hàng cuối giả làm ghế đôi
          : rIndex <= 1
          ? "VIP"
          : "STANDARD";

      const basePrice =
        type === "VIP" ? 120000 : type === "COUPLE" ? 200000 : 90000;

      seats.push({
        seat_id: id,
        row,
        number: i,
        type,
        status: Math.random() < 0.08 ? "BOOKED" : "AVAILABLE",
        price: basePrice,
      });
    }
  });

  return seats;
}

/**
 * MOCK SNACKS — mô phỏng đúng layout trong UI:
 * - COMBO 2 NGĂN
 * - BẮP RANG BƠNG
 * - NƯỚC NGỌT / NƯỚC ĐÓNG CHAI
 * - SNACKS / KẸO / POCA
 * - COMBO SOLO / COUPLE / PARTY / U22
 */


/* ================== MOCK SNACKS ================== */

const BASE_SNACKS = [
  // ===== COMBO 2 NGĂN =====
  {
    snack_id: "cb_bear_house",
    name: "COMBO NHÀ GẤU",
    category: "COMBO 2 NGĂN",
    type: "combo",
    price: 249000,
    image_url: "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/PICCONNEW/CNS037_COMBO_NHA_GAU.png?rand=1723084117",
  },
  {
    snack_id: "cb_bear_couple",
    name: "COMBO GẤU COUPLE",
    category: "COMBO 2 NGĂN",
    type: "combo",
    price: 119000,
    image_url: "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/PICCONNEW/CNS036_COMBO_CO_GAU.png?rand=1723084117",
  },
  {
    snack_id: "cb_bear_single",
    name: "COMBO GẤU",
    category: "COMBO 2 NGĂN",
    type: "combo",
    price: 99000,
    image_url: "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/PICCONNEW/CNS035_COMBO_GAU.png?rand=1723084117",
  },

  // ===== BẮP RANG BƠNG =====
  {
    snack_id: "pop_cheese",
    name: "BẮP PHÔ MAI 60OZ",
    category: "BẮP RANG BƠNG",
    type: "popcorn",
    price: 60000,
    image_url: "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/HCM/CSV/HANGBANONLINE/B_p_Ph_mai.png?rand=1751515931",
  },
  {
    snack_id: "pop_sweet",
    name: "BẮP NGỌT 60OZ",
    category: "BẮP RANG BƠNG",
    type: "popcorn",
    price: 54000,
    image_url: "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/HCM/CSV/HANGBANONLINE/B_P_NG_T_60OZ.png?rand=1751515931",
  },
  {
    snack_id: "pop_mix2",
    name: "BẮP 2 NGĂN PHÔ MAI + CARAMEL",
    category: "BẮP RANG BƠNG",
    type: "popcorn",
    price: 71000,
    image_url: "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/HCM/CSV/HANGBANONLINE/B_P_2_NG_N_V_PH_MAI_CARAMEL.png?rand=1751960162",
  },
  {
    snack_id: "pop_caramel",
    name: "BẮP CARAMEL 60OZ",
    category: "BẮP RANG BƠNG",
    type: "popcorn",
    price: 60000,
    image_url: "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/HCM/CSV/HANGBANONLINE/B_P_CARAMEL_60OZ.png?rand=1751515931",
  },

  // ===== NƯỚC NGỌT (LY) =====
  {
    snack_id: "drink_fanta",
    name: "FANTA 32OZ",
    category: "NƯỚC NGỌT",
    type: "drink",
    price: 37000,
    image_url: "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/HinhQuayconnew/fanta.jpg?rand=1719572506",
  },
  {
    snack_id: "drink_sprite",
    name: "SPRITE 32OZ",
    category: "NƯỚC NGỌT",
    type: "drink",
    price: 37000,
    image_url: "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/HinhQuayconnew/sprite.png?rand=1719572953",
  },
  {
    snack_id: "drink_coke",
    name: "COKE 32OZ",
    category: "NƯỚC NGỌT",
    type: "drink",
    price: 37000,
    image_url: "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/HinhQuayconnew/COKE-ZERO.png?rand=1719573157",
  },

  // ===== NƯỚC ĐÓNG CHAI =====
  {
    snack_id: "bottle_teppy",
    name: "NƯỚC CAM TEPPY 320ML",
    category: "NƯỚC ĐÓNG CHAI",
    type: "drink",
    price: 28000,
    image_url: "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/HinhQuayconnew/TEPPY.png?rand=1719572506",
  },
  {
    snack_id: "bottle_nutri",
    name: "NƯỚC TRÁI CÂY NUTRIBOOST 390ML",
    category: "NƯỚC ĐÓNG CHAI",
    type: "drink",
    price: 28000,
    image_url: "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/HinhQuayconnew/NUTRI.png?rand=1719572506",
  },
  {
    snack_id: "bottle_dasani",
    name: "NƯỚC SUỐI DASANI 500ML",
    category: "NƯỚC ĐÓNG CHAI",
    type: "drink",
    price: 16000,
    image_url: "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/HinhQuayconnew/dasani.png?rand=1719572623",
  },

  // ===== SNACKS - KẸO =====
  {
    snack_id: "snack_thai",
    name: "SNACK THÁI",
    category: "SNACKS - KẸO",
    type: "snack",
    price: 25000,
    image_url: "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/HinhQuayconnew/snack-que-thai.png?rand=1718957425",
  },

  // ===== POCA / CHIP =====
  {
    snack_id: "poca_lays",
    name: "KHOAI TÂY LAYS STAX 100G",
    category: "POCA",
    type: "snack",
    price: 59000,
    image_url: "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/HinhQuayconnew/laystax.png?rand=1719632844",
  },
  {
    snack_id: "poca_wavy",
    name: "POCA WAVY 54GR",
    category: "POCA",
    type: "snack",
    price: 25000,
    image_url: "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/HinhQuayconnew/lays-vi-bo_1_.png?rand=1719632844",
  },
  {
    snack_id: "poca_partyz",
    name: "SNACK PARTYZ 30-35GR",
    category: "POCA",
    type: "snack",
    price: 20000,
    image_url: "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/HinhQuayconnew/poca-partyz.png?rand=1719633509",
  },

  // ===== COMBO ĐẶC BIỆT =====
  {
    snack_id: "combo_solo",
    name: "COMBO SOLO",
    category: "COMBO",
    type: "combo",
    price: 89000,
    image_url: "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/PICCONNEW/CNS032_COMBO_SOLO.png?rand=1723084117",
  },
  {
    snack_id: "combo_couple",
    name: "COMBO COUPLE",
    category: "COMBO",
    type: "combo",
    price: 109000,
    image_url: "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/PICCONNEW/CNS033_COMBO_COUPLE.png?rand=1723084117",
  },
  {
    snack_id: "combo_party",
    name: "COMBO PARTY",
    category: "COMBO",
    type: "combo",
    price: 139000,
    image_url: "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/PICCONNEW/CNS034_COMBO_PARTY.png?rand=1723084117",
  },
  {
    snack_id: "combo_u22",
    name: "COMBO U22",
    category: "COMBO",
    type: "combo",
    price: 89000,
    image_url: "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/HCM/CSV/HANGBANONLINE/combo-u22.jpg?rand=1758704032",
  },
];

// Mỗi rạp dùng chung list mock trên (cần thì tách riêng theo cinema_id)
const MOCK_SNACKS = {
  c1: BASE_SNACKS,
  c2: BASE_SNACKS,
  c3: BASE_SNACKS,
};


/* ================== PUBLIC APIS (MOCK) ================== */

export async function getSeatLayout(showtimeId) {
  if (USE_MOCK) {
    return MOCK_SEATS[showtimeId] || [];
  }
  // const res = await apiFetch(`/seats/layout?showtime_id=${showtimeId}`);
  // return res.data || res;
}

export async function getSnacksByCinema(cinemaId) {
  if (USE_MOCK) {
    return MOCK_SNACKS[cinemaId] || BASE_SNACKS;
  }
  // const qs = new URLSearchParams({ cinema_id: cinemaId });
  // const res = await apiFetch(`/snacks?${qs.toString()}`);
  // return res.data || res;
}

export async function holdSeats(showtimeId, seatIds, holdSeconds = 300) {
  if (USE_MOCK) {
    const expires_at = new Date(
      Date.now() + holdSeconds * 1000
    ).toISOString();
    return {
      code: 200,
      message: "Seats held (mock)",
      data: { expires_at },
    };
  }
  // return apiFetch("/seats/hold", { ... });
}

export async function releaseSeats(showtimeId, seatIds) {
  if (USE_MOCK) {
    return { code: 200, message: "Seats released (mock)" };
  }
  // return apiFetch("/seats/release", { ... });
}

export async function previewPrice({ showtimeId, seatIds, snacks }) {
  if (USE_MOCK) {
    const seats = (MOCK_SEATS[showtimeId] || []).filter((s) =>
      seatIds.includes(s.seat_id)
    );
    const seatTotal = seats.reduce(
      (sum, s) => sum + (s.price || 0),
      0
    );

    const snackTotal = (snacks || []).reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const subtotal = seatTotal + snackTotal;
    const discount = 0;
    const total = subtotal - discount;

    return {
      code: 200,
      data: { subtotal, discount, total },
    };
  }

  // return apiFetch("/bookings/price-preview", { ... });
}
