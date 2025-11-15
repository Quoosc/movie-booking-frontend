// src/api/bookingService.js

// 👉 Hiện tại FE đang mock hoàn toàn
const USE_MOCK = true;

/**
 * ================== MOCK SEAT LAYOUT ==================
 * key: showtimeId
 * data tương tự /seats/layout
 */

const MOCK_SEATS = {};

// Tạo layout ghế demo ~140 ghế (10 hàng x 14 ghế)
function genMockSeats(showtimeId) {
  const rows = "ABCDEFGHIJ".split(""); // 10 hàng A → J
  const seats = [];

  rows.forEach((row, rIndex) => {
    const count = 14; // 14 ghế / hàng ≈ 140 ghế
    for (let i = 1; i <= count; i++) {
      const id = `${showtimeId}-${row}${i}`;

      // Loại ghế chỉ để hiển thị UI, KHÔNG dùng để tính tiền nữa
      const type =
        rIndex >= 9
          ? "COUPLE" // hàng cuối giả làm ghế đôi
          : rIndex <= 2
          ? "NORMAL" // 3 hàng đầu thường
          : "VIP";

      // Giá trong seat chỉ còn là “tham khảo / fallback”, mock cho vui
      const basePrice =
        type === "VIP" ? 120000 : type === "COUPLE" ? 200000 : 90000;

      seats.push({
        seat_id: id,
        row, // dùng trong page.jsx: seat.row
        number: i, // dùng trong page.jsx: seat.number
        type, // NORMAL / VIP / COUPLE
        status: Math.random() < 0.08 ? "BOOKED" : "AVAILABLE", // 8% ghế đã đặt
        price: basePrice,
      });
    }
  });

  return seats;
}

/* ======================================================
 *  MOCK SNACKS — mô phỏng layout ngoài Cinestar
 * ==================================================== */

const BASE_SNACKS = [
  // ===== COMBO 2 NGĂN =====
  {
    snack_id: "cb_bear_house",
    name: "COMBO NHÀ GẤU",
    category: "COMBO 2 NGĂN",
    type: "combo",
    price: 249000,
    image_url:
      "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/PICCONNEW/CNS037_COMBO_NHA_GAU.png?rand=1723084117",
  },
  {
    snack_id: "cb_bear_couple",
    name: "COMBO GẤU COUPLE",
    category: "COMBO 2 NGĂN",
    type: "combo",
    price: 119000,
    image_url:
      "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/PICCONNEW/CNS036_COMBO_CO_GAU.png?rand=1723084117",
  },
  {
    snack_id: "cb_bear_single",
    name: "COMBO GẤU",
    category: "COMBO 2 NGĂN",
    type: "combo",
    price: 99000,
    image_url:
      "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/PICCONNEW/CNS035_COMBO_GAU.png?rand=1723084117",
  },

  // ===== BẮP RANG BƠNG =====
  {
    snack_id: "pop_cheese",
    name: "BẮP PHÔ MAI 60OZ",
    category: "BẮP RANG BƠNG",
    type: "popcorn",
    price: 60000,
    image_url:
      "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/HCM/CSV/HANGBANONLINE/B_p_Ph_mai.png?rand=1751515931",
  },
  {
    snack_id: "pop_sweet",
    name: "BẮP NGỌT 60OZ",
    category: "BẮP RANG BƠNG",
    type: "popcorn",
    price: 54000,
    image_url:
      "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/HCM/CSV/HANGBANONLINE/B_P_NG_T_60OZ.png?rand=1751515931",
  },
  {
    snack_id: "pop_mix2",
    name: "BẮP 2 NGĂN PHÔ MAI + CARAMEL",
    category: "BẮP RANG BƠNG",
    type: "popcorn",
    price: 71000,
    image_url:
      "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/HCM/CSV/HANGBANONLINE/B_P_2_NG_N_V_PH_MAI_CARAMEL.png?rand=1751960162",
  },
  {
    snack_id: "pop_caramel",
    name: "BẮP CARAMEL 60OZ",
    category: "BẮP RANG BƠNG",
    type: "popcorn",
    price: 60000,
    image_url:
      "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/HCM/CSV/HANGBANONLINE/B_P_CARAMEL_60OZ.png?rand=1751515931",
  },

  // ===== NƯỚC NGỌT (LY) =====
  {
    snack_id: "drink_fanta",
    name: "FANTA 32OZ",
    category: "NƯỚC NGỌT",
    type: "drink",
    price: 37000,
    image_url:
      "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/HinhQuayconnew/fanta.jpg?rand=1719572506",
  },
  {
    snack_id: "drink_sprite",
    name: "SPRITE 32OZ",
    category: "NƯỚC NGỌT",
    type: "drink",
    price: 37000,
    image_url:
      "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/HinhQuayconnew/sprite.png?rand=1719572953",
  },
  {
    snack_id: "drink_coke",
    name: "COKE 32OZ",
    category: "NƯỚC NGỌT",
    type: "drink",
    price: 37000,
    image_url:
      "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/HinhQuayconnew/COKE-ZERO.png?rand=1719573157",
  },

  // ===== NƯỚC ĐÓNG CHAI =====
  {
    snack_id: "bottle_teppy",
    name: "NƯỚC CAM TEPPY 320ML",
    category: "NƯỚC ĐÓNG CHAI",
    type: "drink",
    price: 28000,
    image_url:
      "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/HinhQuayconnew/TEPPY.png?rand=1719572506",
  },
  {
    snack_id: "bottle_nutri",
    name: "NƯỚC TRÁI CÂY NUTRIBOOST 390ML",
    category: "NƯỚC ĐÓNG CHAI",
    type: "drink",
    price: 28000,
    image_url:
      "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/HinhQuayconnew/NUTRI.png?rand=1719572506",
  },
  {
    snack_id: "bottle_dasani",
    name: "NƯỚC SUỐI DASANI 500ML",
    category: "NƯỚC ĐÓNG CHAI",
    type: "drink",
    price: 16000,
    image_url:
      "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/HinhQuayconnew/dasani.png?rand=1719572623",
  },

  // ===== SNACKS - KẸO =====
  {
    snack_id: "snack_thai",
    name: "SNACK THÁI",
    category: "SNACKS - KẸO",
    type: "snack",
    price: 25000,
    image_url:
      "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/HinhQuayconnew/snack-que-thai.png?rand=1718957425",
  },

  // ===== POCA / CHIP =====
  {
    snack_id: "poca_lays",
    name: "KHOAI TÂY LAYS STAX 100G",
    category: "POCA",
    type: "snack",
    price: 59000,
    image_url:
      "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/HinhQuayconnew/laystax.png?rand=1719632844",
  },
  {
    snack_id: "poca_wavy",
    name: "POCA WAVY 54GR",
    category: "POCA",
    type: "snack",
    price: 25000,
    image_url:
      "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/HinhQuayconnew/lays-vi-bo_1_.png?rand=1719632844",
  },
  {
    snack_id: "poca_partyz",
    name: "SNACK PARTYZ 30-35GR",
    category: "POCA",
    type: "snack",
    price: 20000,
    image_url:
      "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/HinhQuayconnew/poca-partyz.png?rand=1719633509",
  },

  // ===== COMBO ĐẶC BIỆT =====
  {
    snack_id: "combo_solo",
    name: "COMBO SOLO",
    category: "COMBO",
    type: "combo",
    price: 89000,
    image_url:
      "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/PICCONNEW/CNS032_COMBO_SOLO.png?rand=1723084117",
  },
  {
    snack_id: "combo_couple",
    name: "COMBO COUPLE",
    category: "COMBO",
    type: "combo",
    price: 109000,
    image_url:
      "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/PICCONNEW/CNS033_COMBO_COUPLE.png?rand=1723084117",
  },
  {
    snack_id: "combo_party",
    name: "COMBO PARTY",
    category: "COMBO",
    type: "combo",
    price: 139000,
    image_url:
      "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/PICCONNEW/CNS034_COMBO_PARTY.png?rand=1723084117",
  },
  {
    snack_id: "combo_u22",
    name: "COMBO U22",
    category: "COMBO",
    type: "combo",
    price: 89000,
    image_url:
      "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/HCM/CSV/HANGBANONLINE/combo-u22.jpg?rand=1758704032",
  },
];

// Mỗi rạp dùng chung list mock trên (cần thì tách riêng theo cinema_id)
const MOCK_SNACKS = {
  c1: BASE_SNACKS,
  c2: BASE_SNACKS,
  c3: BASE_SNACKS,
};

/* ================== PUBLIC APIS (MOCK) ================== */

// Lấy sơ đồ ghế theo showtime
export async function getSeatLayout(showtimeId) {
  if (USE_MOCK) {
    // Nếu chưa có layout cho showtime này thì gen mới
    if (!MOCK_SEATS[showtimeId]) {
      MOCK_SEATS[showtimeId] = genMockSeats(showtimeId);
    }
    return MOCK_SEATS[showtimeId];
  }

  // const res = await apiFetch(`/seats/layout?showtime_id=${showtimeId}`);
  // return res.data || res;
}

// Lấy snack theo rạp
export async function getSnacksByCinema(cinemaId) {
  if (USE_MOCK) {
    return MOCK_SNACKS[cinemaId] || BASE_SNACKS;
  }

  // const qs = new URLSearchParams({ cinema_id: cinemaId });
  // const res = await apiFetch(`/cinemas/snacks?${qs.toString()}`);
  // return res.data || res;
}

// Giữ ghế tạm thời
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

  // return apiFetch("/seats/hold", {
  //   method: "POST",
  //   body: {
  //     showtime_id: showtimeId,
  //     seat_ids: seatIds,
  //     hold_seconds: holdSeconds,
  //   },
  // });
}

// Release ghế
export async function releaseSeats(showtimeId, seatIds) {
  if (USE_MOCK) {
    return { code: 200, message: "Seats released (mock)" };
  }

  // return apiFetch("/seats/release", {
  //   method: "POST",
  //   body: {
  //     showtime_id: showtimeId,
  //     seat_ids: seatIds,
  //   },
  // });
}

/**
 * Preview giá vé + bắp nước
 *
 * FE hiện tại đang gọi:
 * previewPrice({
 *   showtimeId,
 *   ticketTypes, // [{ id, label, price, quantity }]
 *   snacks: [{ snack_id, quantity, price }],
 *   promotionCode, // optional
 *   userId,        // optional
 * })
 */
export async function previewPrice({
  showtimeId,
  ticketTypes = [],
  snacks = [],
  promotionCode = null,
  userId = null,
}) {
  if (USE_MOCK) {
    // 1. Tiền vé: lấy từ ticketTypes (KHÔNG lấy từ seat.price nữa)
    const ticketTotal = ticketTypes.reduce(
      (sum, t) => sum + (t.price || 0) * (t.quantity || 0),
      0
    );

    // 2. Tiền bắp nước
    const snackTotal = (snacks || []).reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
      0
    );

    const subtotal = ticketTotal + snackTotal;

    // 3. Giảm giá (mock: chưa áp promotion, cứ 0)
    const discount = 0;
    const total = subtotal - discount;

    return {
      code: 200,
      data: {
        subtotal,
        discount,
        total,
        breakdown: {
          tickets: ticketTotal,
          snacks: snackTotal,
        },
      },
    };
  }

  // 👉 Sau này BE xong:
  // return apiFetch("/bookings/price-preview", {
  //   method: "POST",
  //   body: {
  //     showtime_id: showtimeId,
  //     // seat_ids: [...], // nếu BE cần
  //     ticket_types: ticketTypes.map((t) => ({
  //       ticket_type_id: t.id,
  //       quantity: t.quantity,
  //     })),
  //     snacks: snacks.map((s) => ({
  //       snack_id: s.snack_id,
  //       quantity: s.quantity,
  //     })),
  //     promotion_code: promotionCode,
  //     user_id: userId,
  //   },
  // });
}
