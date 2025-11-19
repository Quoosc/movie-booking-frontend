// src/api/bookingService.js
// Toàn bộ logic mock + chuẩn bị cho API thật

// Khi nối BE thật thì chỉ cần:
// import { apiFetch, USE_MOCK } from "./fetchConfig";

// TẠM THỜI: booking vẫn luôn dùng mock (không gọi BE)
const USE_MOCK = true;

/* ======================================================
 *  MOCK SEAT LAYOUT
 *  - Sinh layout ghế giống rạp thật
 *  - Dùng cho getSeatLayout khi USE_MOCK = true
 * ==================================================== */

const MOCK_SEATS = {};

// - 10 hàng: A → J
// - Hàng A–C: NORMAL
// - Hàng D–I: VIP
// - Hàng J: COUPLE (5 ghế đôi = 10 chỗ)
function genMockSeats(showtimeId) {
  const rows = "ABCDEFGHIJ".split("");
  const seats = [];

  rows.forEach((row, rIndex) => {
    const isLastRow = rIndex === rows.length - 1; // hàng J

    // 🔹 HÀNG GHẾ ĐÔI (J): xử lý theo CẶP
    if (isLastRow) {
      const count = 10; // 10 chỗ = 5 cặp
      const type = "COUPLE";
      const basePrice = 200000;

      // cặp: (1-2), (3-4), (5-6), (7-8), (9-10)
      for (let i = 1; i <= count; i += 2) {
        // random 1 lần cho CẢ CẶP
        const pairBooked = Math.random() < 0.08;
        const pairLocked = !pairBooked && Math.random() < 0.08; // mock ghế bị giữ

        [0, 1].forEach((offset) => {
          const number = i + offset;
          const id = `${showtimeId}-${row}${number}`;

          seats.push({
            seat_id: id,
            row, // "J"
            number, // 1..10
            type, // "COUPLE"
            status: pairBooked
              ? "BOOKED"
              : pairLocked
              ? "LOCKED"
              : "AVAILABLE",
            price: basePrice,
          });
        });
      }

      return;
    }

    // 🔹 CÁC HÀNG CÒN LẠI: NORMAL / VIP như cũ
    const count = 14;

    for (let i = 1; i <= count; i++) {
      const id = `${showtimeId}-${row}${i}`;

      let type;
      if (rIndex <= 2) {
        type = "NORMAL"; // 3 hàng đầu
      } else {
        type = "VIP"; // các hàng giữa
      }

      const basePrice = type === "VIP" ? 120000 : 90000;
      const isBooked = Math.random() < 0.08;
      const isLocked = !isBooked && Math.random() < 0.08;

      seats.push({
        seat_id: id,
        row, // "A".."I"
        number: i, // 1..14
        type, // "NORMAL" | "VIP"
        status: isBooked ? "BOOKED" : isLocked ? "LOCKED" : "AVAILABLE",
        price: basePrice,
      });
    }
  });

  return seats;
}

/* ======================================================
 *  MAP SEAT BE → FE
 *  BE:  GET /seats/layout?showtime_id=UUID
 *       data[]: {
 *         seatId, row, number, type, status, price
 *       }
 *
 *  FE dùng: { seat_id, row, number, type, status, price }
 * ==================================================== */

function mapSeatFromApi(seat) {
  if (!seat) return null;
  return {
    seat_id: seat.seatId || seat.seat_id || seat.id,
    row: seat.row || seat.rowLabel,
    number:
      typeof seat.number === "number" ? seat.number : seat.seatNumber ?? 0,
    type: seat.type || seat.seatType, // NORMAL | VIP | COUPLE
    status: seat.status, // AVAILABLE | BOOKED | LOCKED
    price:
      typeof seat.price === "number"
        ? seat.price
        : typeof seat.basePrice === "number"
        ? seat.basePrice
        : 0,
  };
}

/**
 * Lấy sơ đồ ghế theo showtime
 * FE luôn dùng format:
 *   { seat_id, row, number, type, status, price }
 */
export async function getSeatLayout(showtimeId) {
  if (USE_MOCK) {
    // Nếu chưa có layout cho showtime này thì sinh mới
    if (!MOCK_SEATS[showtimeId]) {
      MOCK_SEATS[showtimeId] = genMockSeats(showtimeId);
    }
    return MOCK_SEATS[showtimeId];
  }

  // 🚀 API thật sau này (đã chuẩn theo BE mới):
  //
  // const res = await apiFetch(`/seats/layout?showtime_id=${showtimeId}`);
  // const data = res.data || res;
  // return (Array.isArray(data) ? data : [])
  //   .map(mapSeatFromApi)
  //   .filter(Boolean);
}

/* ======================================================
 *  MOCK SNACKS — CHUẨN THEO API /cinemas/snacks
 * ==================================================== */
/**
 * BE đã chốt 100%:
 * GET /cinemas/snacks?cinemaId=UUID
 * → mỗi item:
 * {
 *   "snackId": "UUID",
 *   "cinemaId": "UUID",
 *   "name": "Popcorn Cheese",
 *   "description": "Large cheese popcorn",
 *   "price": 45000,
 *   "type": "FOOD",
 *   "imageUrl": "https://...snacks/popcorn.jpg",
 *   "imageCloudinaryId": "snacks/popcorn"
 * }
 */

const BASE_SNACKS_API = [
  // ===== COMBO 2 NGĂN =====
  {
    snackId: "cb_bear_house",
    cinemaId: null,
    name: "COMBO NHÀ GẤU",
    description: "Combo bắp nước chủ đề nhà gấu",
    price: 249000,
    type: "FOOD",
    imageUrl:
      "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/PICCONNEW/CNS037_COMBO_NHA_GAU.png?rand=1723084117",
    imageCloudinaryId: "snacks/combo_nha_gau",
  },
  {
    snackId: "cb_bear_couple",
    cinemaId: null,
    name: "COMBO GẤU COUPLE",
    description: "Combo dành cho couple",
    price: 119000,
    type: "FOOD",
    imageUrl:
      "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/PICCONNEW/CNS036_COMBO_CO_GAU.png?rand=1723084117",
    imageCloudinaryId: "snacks/combo_gau_couple",
  },
  {
    snackId: "cb_bear_single",
    cinemaId: null,
    name: "COMBO GẤU",
    description: "Combo gấu cho một người",
    price: 99000,
    type: "FOOD",
    imageUrl:
      "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/PICCONNEW/CNS035_COMBO_GAU.png?rand=1723084117",
    imageCloudinaryId: "snacks/combo_gau",
  },

  // ===== BẮP RANG BÔNG =====
  {
    snackId: "pop_cheese",
    cinemaId: null,
    name: "BẮP PHÔ MAI 60OZ",
    description: "Bắp phô mai size lớn",
    price: 60000,
    type: "FOOD",
    imageUrl:
      "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/HCM/CSV/HANGBANONLINE/B_p_Ph_mai.png?rand=1751515931",
    imageCloudinaryId: "snacks/pop_cheese",
  },
  {
    snackId: "pop_sweet",
    cinemaId: null,
    name: "BẮP NGỌT 60OZ",
    description: "Bắp ngọt size lớn",
    price: 54000,
    type: "FOOD",
    imageUrl:
      "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/HCM/CSV/HANGBANONLINE/B_P_NG_T_60OZ.png?rand=1751515931",
    imageCloudinaryId: "snacks/pop_sweet",
  },
  {
    snackId: "pop_mix2",
    cinemaId: null,
    name: "BẮP 2 NGĂN PHÔ MAI + CARAMEL",
    description: "Combo bắp 2 ngăn phô mai + caramel",
    price: 71000,
    type: "FOOD",
    imageUrl:
      "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/HCM/CSV/HANGBANONLINE/B_P_2_NG_N_V_PH_MAI_CARAMEL.png?rand=1751960162",
    imageCloudinaryId: "snacks/pop_mix2",
  },
  {
    snackId: "pop_caramel",
    cinemaId: null,
    name: "BẮP CARAMEL 60OZ",
    description: "Bắp caramel size lớn",
    price: 60000,
    type: "FOOD",
    imageUrl:
      "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/HCM/CSV/HANGBANONLINE/B_P_CARAMEL_60OZ.png?rand=1751515931",
    imageCloudinaryId: "snacks/pop_caramel",
  },

  // ===== NƯỚC NGỌT (LY) =====
  {
    snackId: "drink_fanta",
    cinemaId: null,
    name: "FANTA 32OZ",
    description: "Nước ngọt Fanta 32oz",
    price: 37000,
    type: "DRINK",
    imageUrl:
      "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/HinhQuayconnew/fanta.jpg?rand=1719572506",
    imageCloudinaryId: "snacks/drink_fanta",
  },
  {
    snackId: "drink_sprite",
    cinemaId: null,
    name: "SPRITE 32OZ",
    description: "Nước ngọt Sprite 32oz",
    price: 37000,
    type: "DRINK",
    imageUrl:
      "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/HinhQuayconnew/sprite.png?rand=1719572953",
    imageCloudinaryId: "snacks/drink_sprite",
  },
  {
    snackId: "drink_coke",
    cinemaId: null,
    name: "COKE 32OZ",
    description: "Nước ngọt Coke 32oz",
    price: 37000,
    type: "DRINK",
    imageUrl:
      "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/HinhQuayconnew/COKE-ZERO.png?rand=1719573157",
    imageCloudinaryId: "snacks/drink_coke",
  },

  // ===== NƯỚC ĐÓNG CHAI =====
  {
    snackId: "bottle_teppy",
    cinemaId: null,
    name: "NƯỚC CAM TEPPY 320ML",
    description: "Nước cam Teppy 320ml",
    price: 28000,
    type: "DRINK",
    imageUrl:
      "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/HinhQuayconnew/TEPPY.png?rand=1719572506",
    imageCloudinaryId: "snacks/bottle_teppy",
  },
  {
    snackId: "bottle_nutri",
    cinemaId: null,
    name: "NƯỚC TRÁI CÂY NUTRIBOOST 390ML",
    description: "Nutriboost 390ml",
    price: 28000,
    type: "DRINK",
    imageUrl:
      "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/HinhQuayconnew/NUTRI.png?rand=1719572506",
    imageCloudinaryId: "snacks/bottle_nutri",
  },
  {
    snackId: "bottle_dasani",
    cinemaId: null,
    name: "NƯỚC SUỐI DASANI 500ML",
    description: "Nước suối Dasani 500ml",
    price: 16000,
    type: "DRINK",
    imageUrl:
      "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/HinhQuayconnew/dasani.png?rand=1719572623",
    imageCloudinaryId: "snacks/bottle_dasani",
  },

  // ===== SNACKS - KẸO =====
  {
    snackId: "snack_thai",
    cinemaId: null,
    name: "SNACK THÁI",
    description: "Snack que Thái",
    price: 25000,
    type: "FOOD",
    imageUrl:
      "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/HinhQuayconnew/snack-que-thai.png?rand=1718957425",
    imageCloudinaryId: "snacks/snack_thai",
  },

  // ===== POCA / CHIP =====
  {
    snackId: "poca_lays",
    cinemaId: null,
    name: "KHOAI TÂY LAYS STAX 100G",
    description: "Khoai tây Lays Stax 100g",
    price: 59000,
    type: "FOOD",
    imageUrl:
      "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/HinhQuayconnew/laystax.png?rand=1719632844",
    imageCloudinaryId: "snacks/poca_lays",
  },
  {
    snackId: "poca_wavy",
    cinemaId: null,
    name: "POCA WAVY 54GR",
    description: "Poca Wavy 54g",
    price: 25000,
    type: "FOOD",
    imageUrl:
      "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/HinhQuayconnew/lays-vi-bo_1_.png?rand=1719632844",
    imageCloudinaryId: "snacks/poca_wavy",
  },
  {
    snackId: "poca_partyz",
    cinemaId: null,
    name: "SNACK PARTYZ 30-35GR",
    description: "Snack Partyz",
    price: 20000,
    type: "FOOD",
    imageUrl:
      "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/HinhQuayconnew/poca-partyz.png?rand=1719633509",
    imageCloudinaryId: "snacks/poca_partyz",
  },

  // ===== COMBO ĐẶC BIỆT =====
  {
    snackId: "combo_solo",
    cinemaId: null,
    name: "COMBO SOLO",
    description: "Combo 1 người xem phim",
    price: 89000,
    type: "FOOD",
    imageUrl:
      "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/PICCONNEW/CNS032_COMBO_SOLO.png?rand=1723084117",
    imageCloudinaryId: "snacks/combo_solo",
  },
  {
    snackId: "combo_couple",
    cinemaId: null,
    name: "COMBO COUPLE",
    description: "Combo cho cặp đôi",
    price: 109000,
    type: "FOOD",
    imageUrl:
      "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/PICCONNEW/CNS033_COMBO_COUPLE.png?rand=1723084117",
    imageCloudinaryId: "snacks/combo_couple",
  },
  {
    snackId: "combo_party",
    cinemaId: null,
    name: "COMBO PARTY",
    description: "Combo cho nhóm bạn",
    price: 139000,
    type: "FOOD",
    imageUrl:
      "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/pictures/PICCONNEW/CNS034_COMBO_PARTY.png?rand=1723084117",
    imageCloudinaryId: "snacks/combo_party",
  },
  {
    snackId: "combo_u22",
    cinemaId: null,
    name: "COMBO U22",
    description: "Combo ưu đãi cho U22",
    price: 89000,
    type: "FOOD",
    imageUrl:
      "https://api-website.cinestar.com.vn/media/.thumbswysiwyg/HCM/CSV/HANGBANONLINE/combo-u22.jpg?rand=1758704032",
    imageCloudinaryId: "snacks/combo_u22",
  },
];

// Map tên → category để UI group (không phụ thuộc BE phải có field category)
const SNACK_CATEGORY_BY_NAME = {
  "COMBO NHÀ GẤU": "COMBO 2 NGĂN",
  "COMBO GẤU COUPLE": "COMBO 2 NGĂN",
  "COMBO GẤU": "COMBO 2 NGĂN",

  "BẮP PHÔ MAI 60OZ": "BẮP RANG BÔNG",
  "BẮP NGỌT 60OZ": "BẮP RANG BÔNG",
  "BẮP 2 NGĂN PHÔ MAI + CARAMEL": "BẮP RANG BÔNG",
  "BẮP CARAMEL 60OZ": "BẮP RANG BÔNG",

  "FANTA 32OZ": "NƯỚC NGỌT",
  "SPRITE 32OZ": "NƯỚC NGỌT",
  "COKE 32OZ": "NƯỚC NGỌT",

  "NƯỚC CAM TEPPY 320ML": "NƯỚC ĐÓNG CHAI",
  "NƯỚC TRÁI CÂY NUTRIBOOST 390ML": "NƯỚC ĐÓNG CHAI",
  "NƯỚC SUỐI DASANI 500ML": "NƯỚC ĐÓNG CHAI",

  "SNACK THÁI": "SNACKS - KẸO",

  "KHOAI TÂY LAYS STAX 100G": "POCA",
  "POCA WAVY 54GR": "POCA",
  "SNACK PARTYZ 30-35GR": "POCA",

  "COMBO SOLO": "COMBO",
  "COMBO COUPLE": "COMBO",
  "COMBO PARTY": "COMBO",
  "COMBO U22": "COMBO",
};

/**
 * Map từ format BE → format FE đang xài trong UI:
 * FE dùng:
 *   snack.snack_id
 *   snack.image_url
 *   snack.category
 */
function mapSnackFromApiToUi(apiSnack) {
  if (!apiSnack) return null;
  const upperName = (apiSnack.name || "").toUpperCase().trim();

  const category =
    SNACK_CATEGORY_BY_NAME[upperName] ||
    (apiSnack.type === "DRINK"
      ? "NƯỚC NGỌT"
      : apiSnack.type === "FOOD"
      ? "ĐỒ ĂN"
      : "KHÁC");

  return {
    snack_id: apiSnack.snackId,
    cinema_id: apiSnack.cinemaId,
    name: apiSnack.name,
    description: apiSnack.description,
    price: apiSnack.price,
    type: apiSnack.type,
    image_url: apiSnack.imageUrl,
    image_cloudinary_id: apiSnack.imageCloudinaryId,
    category,
  };
}

/**
 * Lấy snack theo rạp
 * UI gọi:
 *   const snacks = await getSnacksByCinema(activeShowtime.cinemaId);
 * Trả về list đã map sang format FE.
 */
export async function getSnacksByCinema(cinemaId) {
  if (USE_MOCK) {
    const apiSnacks = BASE_SNACKS_API.map((s) => ({
      ...s,
      cinemaId: cinemaId || s.cinemaId || "mock-cinema",
    }));

    return apiSnacks.map(mapSnackFromApiToUi).filter(Boolean);
  }

  // 🚀 REAL API
  // const res = await apiFetch(`/cinemas/snacks?cinemaId=${cinemaId}`);
  // const data = res.data || res;
  //
  // return (Array.isArray(data) ? data : [])
  //   .map(mapSnackFromApiToUi)
  //   .filter(Boolean);
}


/* ======================================================
 *  HOLD / RELEASE SEATS (V1 - dùng ở MovieDetailPage)
 *  - Có thể giữ lại cho UI, nhưng API thật nên ưu tiên lockSeats ở Checkout
 * ==================================================== */

/**
 * Giữ ghế tạm thời (v1 – dùng ở màn MovieDetailPage nếu cần)
 *
 * FE đang gọi:
 *   holdSeats(showtimeId, seatIds, HOLD_SECONDS)
 */
export async function holdSeats(
  showtimeId,
  seatIds,
  holdSeconds = 300,
  userId = null
) {
  if (USE_MOCK) {
    const expiresAt = new Date(
      Date.now() + holdSeconds * 1000
    ).toISOString();

    return {
      code: 201,
      message: "Seats locked (mock, v1)",
      data: {
        lockId: `mock-hold-${Date.now()}`,
        status: "LOCKED",
        showtimeId,
        seats: (seatIds || []).map((id) => ({ seatId: id })),
        totalPrice: 0,
        expiresAt,
        remainingSeconds: holdSeconds,
        message: `Seats locked for ${holdSeconds} seconds (mock v1)`,
      },
    };
  }

  // 🚀 Nếu muốn dùng API thật cho v1:
  // return apiFetch("/bookings/lock", {
  //   method: "POST",
  //   body: JSON.stringify({
  //     showtimeId,
  //     userId,
  //     seatIds,
  //     holdSeconds,
  //   }),
  // });
}

/**
 * Release ghế (huỷ lock v1)
 *
 * FE hiện đang gọi:
 *   releaseSeats(showtimeId, seatIds)
 *
 * Trong mock mình vẫn giữ signature này cho đỡ sửa code,
 * nhưng API thật sẽ bỏ qua seatIds và dùng showtimeId + userId.
 */
export async function releaseSeats(showtimeId, seatIds, userId = null) {
  if (USE_MOCK) {
    return { code: 200, message: "Seats released (mock v1)" };
  }

  // 🚀 API thật ( /bookings/lock/release):
  //
  // return apiFetch(
  //   `/bookings/lock/release?showtimeId=${showtimeId}&userId=${userId}`,
  //   {
  //     method: "DELETE",
  //   }
  // );
}

/* ======================================================
 *  PREVIEW PRICE
 *  PHÙ HỢP API MỚI:
 *
 *  POST   /bookings/price-preview
 * ==================================================== */

/**
 * Preview giá vé + bắp nước
 *
 * FE hiện tại đang gọi:
 * previewPrice({
 *   showtimeId,
 *   seatIds,
 *   ticketTypes, // MovieDetailPage: [{ id, label, price, quantity }]
 *                // Checkout (REAL): [{ ticketTypeId, quantity }]
 *   snacks: [{ snack_id | snackId, quantity, price? }],
 *   promotionCode,
 *   userId,
 * })
 */

export async function previewPrice({
  showtimeId,
  seatIds = [],
  ticketTypes = [],
  snacks = [],
  promotionCode = null,
  userId = null,
}) {
  if (USE_MOCK) {
    // MOCK: tính theo price trong payload (MovieDetailPage)
    const ticketTotal = ticketTypes.reduce(
      (sum, t) => sum + (t.price || 0) * (t.quantity || 0),
      0
    );

    const snackTotal = (snacks || []).reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
      0
    );

    const subtotal = ticketTotal + snackTotal;
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

  // 🚀 API thật
// return apiFetch("/bookings/price-preview", {
// return apiFetch("/bookings/price-preview", {
//   method: "POST",
//   body: JSON.stringify({
//     showtimeId,
//     seatIds,
//     ticketTypes: ticketTypes.map((t) => ({
//       ticketTypeId: t.ticketTypeId || t.id,
//       quantity: t.quantity,
//     })),
//     snacks: snacks.map((s) => ({
//       snackId: s.snackId || s.snack_id,
//       quantity: s.quantity,
//     })),
//     promotionCode,
//     userId,
//   }),
// });
}

/* ======================================================
 *  SEAT LOCK CHO CHECKOUT (Flow chính v2)
 *  - FE gọi /bookings/lock khi VÀO trang Checkout
 * ==================================================== */

/**
 * Dùng trong Checkout:
 *   const res = await lockSeats({
 *     showtimeId,
 *     seatIds: selectedSeats.map(s => s.seat_id),
 *     userId: currentUser?.userId || null,
 *   });
 */
export async function lockSeats({
  showtimeId,
  seatIds = [],
  holdSeconds = 600, // mặc định 10 phút
  userId = null,
}) {
  if (!showtimeId || !Array.isArray(seatIds) || seatIds.length === 0) {
    throw new Error("lockSeats: thiếu showtimeId hoặc seatIds");
  }

  if (USE_MOCK) {
    const now = Date.now();
    const expiresAt = new Date(now + holdSeconds * 1000).toISOString();

    return {
      code: 201,
      message: "Seats locked successfully (mock)",
      data: {
        lockId: `mock-lock-${now}`,
        status: "LOCKED",
        showtimeId,
        seats: seatIds.map((id) => ({ seatId: id })),
        expiresAt,
        remainingSeconds: holdSeconds,
        userId,
      },
    };
  }

  // 🚀 BE thật
  // return apiFetch("/bookings/lock", {
  //   method: "POST",
  //   body: JSON.stringify({
  //     showtimeId,
  //     userId,
  //     seatIds,
  //     holdSeconds, // nếu BE cần
  //   }),
  // });
}

/* ======================================================
 *  TẠO BOOKING (Flow mới: từ lockId)
 *  - Dùng ở Checkout Step 2 trước khi tạo lệnh thanh toán
 * ==================================================== */

/**
 * createBooking:
 *  Flow mới (chuẩn BE):
 *   - FE gửi lockId (đã tạo bởi /bookings/lock)
 *   - BE dùng SeatLocks → tạo Booking PENDING_PAYMENT
 *
 *  FE sẽ gọi:
 *    createBooking({ lockId, userId, promotionCode })
 *
 *  Để tránh bể code cũ, hàm vẫn chấp nhận:
 *    createBooking({ showtimeId, seatIds, snacks, ... })
 *  → dùng mock OK, khi lên BE thật thì chỉ dùng lockId.
 */
export async function createBooking(payload = {}) {
  const {
    lockId = null,
    userId = null,
    showtimeId = null, // legacy
    seatIds = [], // legacy
    snacks = [], // legacy
    promotionCode = null,
  } = payload;

  if (!lockId && (!showtimeId || seatIds.length === 0)) {
    throw new Error(
      "createBooking: cần lockId (flow mới) hoặc showtimeId + seatIds (legacy mock)"
    );
  }

  if (USE_MOCK) {
    const now = Date.now();
    const bookingId = `mock-booking-${now}`;

    return {
      code: 201,
      message: "Booking created (mock)",
      data: {
        booking_id: bookingId,
        lock_id: lockId,
        user_id: userId,
        showtime_id: showtimeId,
        seat_ids: seatIds,
        snacks: snacks.map((s) => ({
          snack_id: s.snack_id,
          quantity: s.quantity,
        })),
        promotion_code: promotionCode,
        status: "PENDING_PAYMENT",
        finalPrice: null,
        created_at: new Date().toISOString(),
      },
    };
  }

  // 🚀 BE thật – FLOW CHÍNH: tạo booking từ lockId
  //
  // return apiFetch("/bookings/confirm", {
  //   method: "POST",
  //   body: JSON.stringify({
  //     lockId,
  //     userId,
  //     promotionCode,
  //   }),
  // });
}

/* ======================================================
 *  TẠO PHIÊN THANH TOÁN (OPTIONAL)
 *  - Bạn có thể dùng createPaymentOrder là đủ
 * ==================================================== */

export async function createPaymentSession({
  bookingId,
  amount,
  method, // "MOMO" | "PAYPAL"
  returnUrl,
  cancelUrl,
}) {
  if (!bookingId || !amount || !method) {
    throw new Error("createPaymentSession: thiếu bookingId/amount/method");
  }

  if (USE_MOCK) {
    const now = Date.now();
    return {
      code: 200,
      message: "Payment session created (mock)",
      data: {
        paymentId: `mock-payment-${now}`,
        paymentUrl: "/mock-payment-success", // hoặc "#" cho đỡ redirect
        method,
        amount,
      },
    };
  }

  // 🚀 BE thật – điều chỉnh URL theo spec Payment thực tế của bạn.
  // Ví dụ nếu bạn có:
  //   POST /payments/checkout
  //
  // return apiFetch("/payments/checkout", {
  //   method: "POST",
  //   body: JSON.stringify({
  //     bookingId,
  //     amount,
  //     method,
  //     returnUrl,
  //     cancelUrl,
  //   }),
  // });
}

/* ======================================================
 *  TẠO LỆNH THANH TOÁN (PAYMENT ORDER)
 *  API: POST /payments/order
 *  Body:
 *    {
 *      "bookingId": "booking-7777-aaaa-3333",
 *      "method": "PAYPAL" | "MOMO",
 *      "amount": 270000.00
 *    }
 *  Response:
 *    {
 *      "code": 200,
 *      "message": "Payment order created",
 *      "data": {
 *        "paymentId": "uuid",
 *        "orderId": "string (gateway order ID)",
 *        "txnRef": "string (Momo only)",
 *        "paymentUrl": "string (redirect URL for user)"
 *      }
 *    }
 * ==================================================== */

export async function createPaymentOrder({ bookingId, method, amount }) {
  if (!bookingId || !method || !amount) {
    throw new Error(
      "createPaymentOrder: bookingId, method, amount là bắt buộc"
    );
  }

  if (USE_MOCK) {
    const now = Date.now();

    return {
      code: 200,
      message: "Payment order created (mock)",
      data: {
        paymentId: `mock-payment-${now}`,
        orderId: `MOCK-ORDER-${now}`,
        txnRef: method === "MOMO" ? `MOCK-TXN-${now}` : null,
        // mock URL, bạn có thể tạo một route /mock-payment-success nếu thích
        paymentUrl: "/mock-payment-success",
      },
    };
  }

  // 🚀 BE thật – dùng đúng spec bạn đưa ra
  // return apiFetch("/payments/order", {
  //   method: "POST",
  //   body: JSON.stringify({
  //     bookingId,
  //     method, // "PAYPAL" | "MOMO"
  //     amount,
  //   }),
  // });
}
