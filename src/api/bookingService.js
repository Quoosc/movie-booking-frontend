// src/api/bookingService.js
import { apiFetch } from "./fetchConfig";
const USE_MOCK = false;

function mapSeatFromApi(seat) {
  if (!seat) return null;

  const showtimeSeatId =
    seat.showtimeSeatId ||
    seat.showtime_seat_id ||
    seat.showtimeSeatID ||
    seat.id; // fallback

  return {
    // ID FE dùng để gửi lên API lock/preview
    seat_id: showtimeSeatId || seat.seatId || seat.seat_id || seat.id,

    // Lưu thêm cho rõ nghĩa
    showtimeSeatId,

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

  const res = await apiFetch(`/seats/layout?showtime_id=${showtimeId}`);
  const data = res.data || res;
  return (Array.isArray(data) ? data : []).map(mapSeatFromApi).filter(Boolean);
}

function getOrCreateGuestSessionId() {
  const KEY = "cv_guest_session_id";
  try {
    let id = localStorage.getItem(KEY);
    if (!id) {
      if (typeof crypto !== "undefined" && crypto.randomUUID) {
        id = crypto.randomUUID();
      } else {
        // fallback UUID v4
        id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
          const r = (Math.random() * 16) | 0;
          const v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        });
      }
      localStorage.setItem(KEY, id);
    }
    return id;
  } catch (e) {
    console.warn("Cannot access localStorage for guest session id", e);
    return null;
  }
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

  // REAL API
  const res = await apiFetch(`/cinemas/snacks?cinemaId=${cinemaId}`);
  const data = res.data || res;

  return (Array.isArray(data) ? data : [])
    .map(mapSnackFromApiToUi)
    .filter(Boolean);
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
export async function holdSeats(showtimeId, seatIds = [], holdSeconds = 300) {
  const seats = (seatIds || []).map((id) => ({
    showtimeSeatId: id,
    ticketTypeId: null,
  }));

  return lockSeats({ showtimeId, seats, holdSeconds });
}

/**
 * Release ghế (huỷ lock)
 *
 * FE gọi:
 *   await releaseSeats(showtimeId)
 *
 * BE: DELETE /seat-locks/showtime/{showtimeId}
 * - Không cần gửi userId/seatIds, BE tự check lock owner.
 */
export async function releaseSeats(showtimeId) {
  if (!showtimeId) {
    throw new Error("releaseSeats: thiếu showtimeId");
  }

  const sessionId = getOrCreateGuestSessionId();

  await apiFetch(`/seat-locks/showtime/${showtimeId}`, {
    method: "DELETE",
    headers: sessionId ? { "X-Session-Id": sessionId } : undefined,
  });

  return { message: "Seats released" };
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
  lockId,
  snacks = [],
  promotionCode = null,
}) {
  if (USE_MOCK) {
    const snackTotal = (snacks || []).reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
      0
    );

    const subtotal = snackTotal;
    const discount = 0;
    const total = subtotal - discount;

    return {
      code: 200,
      data: {
        subtotal,
        discount,
        total,
        breakdown: {
          snacks: snackTotal,
        },
      },
    };
  }

  const sessionId = getOrCreateGuestSessionId();

  return apiFetch("/bookings/price-preview", {
    method: "POST",
    headers: sessionId ? { "X-Session-Id": sessionId } : undefined,
    body: JSON.stringify({
      lockId,
      promotionCode,
      snacks: (snacks || []).map((s) => ({
        snackId: s.snackId || s.snack_id,
        quantity: s.quantity,
      })),
    }),
  });
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
// Dùng cho flow checkout v2: gửi kèm ticketTypeId cho từng ghế
export async function lockSeats({
  showtimeId,
  seats = [],
  holdSeconds = 600, // mock dùng, BE thật không quan tâm
}) {
  if (!showtimeId || !Array.isArray(seats) || seats.length === 0) {
    throw new Error("lockSeats: thiếu showtimeId hoặc seats");
  }

  // 👇 tạo / lấy session id cho guest (member có JWT thì BE sẽ bỏ qua header này)
  const sessionId = getOrCreateGuestSessionId();

  if (USE_MOCK) {
    const now = Date.now();
    const expiresAt = new Date(now + holdSeconds * 1000).toISOString();

    return {
      lockId: `mock-lock-${now}`,
      status: "LOCKED",
      showtimeId,
      seats: seats.map((s) => ({
        showtimeSeatId: s.showtimeSeatId || s.seat_id || s.seatId,
        ticketTypeId: s.ticketTypeId || null,
      })),
      expiresAt,
      remainingSeconds: holdSeconds,
    };
  }

  const seatsPayload = seats.map((s) => ({
    showtimeSeatId: s.showtimeSeatId || s.seat_id || s.seatId || s.id,
    ticketTypeId: s.ticketTypeId, // đã map ở CheckoutPage
  }));

  const res = await apiFetch("/seat-locks", {
    method: "POST",
    headers: sessionId
      ? {
          "X-Session-Id": sessionId, // 👈 quan trọng
        }
      : undefined,
    body: JSON.stringify({
      showtimeId,
      seats: seatsPayload,
    }),
  });

  return res;
}

export async function releaseSeatLocksByShowtime(showtimeId) {
  if (!showtimeId) return;
  return apiFetch(`/seat-locks/showtime/${showtimeId}`, {
    method: "DELETE",
  });
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
    promotionCode = null,

    // NEW: chuẩn Swagger
    snackCombos = null,
    guestInfo = null,

    // LEGACY (mock + flow cũ)
    showtimeId = null,
    seatIds = [],
    snacks = [],
  } = payload;

  if (!lockId && (!showtimeId || seatIds.length === 0)) {
    throw new Error(
      "createBooking: cần lockId (flow mới) hoặc showtimeId + seatIds (legacy mock)"
    );
  }

  if (USE_MOCK) {
    // ... giữ nguyên mock
    return {
      // ...
    };
  }

  const finalSnackCombos =
    Array.isArray(snackCombos) && snackCombos.length > 0
      ? snackCombos
      : Array.isArray(snacks)
      ? snacks.map((s) => ({
          snackId: s.snackId || s.snack_id,
          quantity: s.quantity,
        }))
      : [];

  const body = {
    lockId,
    promotionCode: promotionCode || null,
  };

  if (finalSnackCombos.length > 0) {
    body.snackCombos = finalSnackCombos;
  }

  if (guestInfo) {
    body.guestInfo = {
      email: guestInfo.email,
      username: guestInfo.username,
      phoneNumber: guestInfo.phoneNumber,
    };
  }

  // THÊM SESSION ID CHO GUEST
  const sessionId = getOrCreateGuestSessionId();

  return apiFetch("/bookings/confirm", {
    method: "POST",
    headers: sessionId ? { "X-Session-Id": sessionId } : undefined,
    body: JSON.stringify(body),
  });
}

/* ======================================================
 *  TẠO PHIÊN THANH TOÁN (OPTIONAL)
 *  - Bạn có thể dùng createPaymentOrder là đủ
 * ==================================================== */

// export async function createPaymentSession({
//   bookingId,
//   amount,
//   method, // "PAYPAL" | "MOMO"
//   returnUrl,
//   cancelUrl,
// }) {
//   if (!bookingId || !amount || !method) {
//     throw new Error("createPaymentSession: thiếu bookingId/amount/method");
//   }

//   const normalizedMethod = String(method).toUpperCase();

//   const res = await apiFetch("/payments/order", {
//     method: "POST",
//     body: JSON.stringify({
//       bookingId,
//       paymentMethod: normalizedMethod,
//       amount,
//       returnUrl,
//       cancelUrl,
//     }),
//   });

//   return res;
// }

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

export async function createPaymentOrder({
  bookingId,
  paymentMethod,
  method,
  amount,
}) {
  const rawMethod = paymentMethod || method;

  if (!bookingId || !rawMethod || amount == null) {
    throw new Error(
      "createPaymentOrder: bookingId, paymentMethod/method, amount là bắt buộc"
    );
  }

  const normalizedMethod = String(rawMethod).toUpperCase();

  const res = await apiFetch("/payments/order", {
    method: "POST",
    body: JSON.stringify({
      bookingId,
      paymentMethod: normalizedMethod, //  đúng key theo Swagger
      amount,
    }),
  });

  return res;
}

export async function getBookingById(bookingId) {
  if (!bookingId) {
    throw new Error("getBookingById: bookingId là bắt buộc");
  }

  const res = await apiFetch(`/bookings/${bookingId}`);
  const raw = res.data || res;
  return raw.data || raw; 
}

export async function getBookingDetail(bookingId) {
  // dùng chung logic
  return getBookingById(bookingId);
}

/**
 * GET /bookings/my-bookings
 * - Chỉ dành cho member (role USER)
 * - Dùng trong (protected)/account-history
 */
export async function getMyBookings() {
  if (USE_MOCK) {
    // Tạm thời: dùng mock cho UI History
    return MOCK_MY_BOOKINGS;
  }

  const res = await apiFetch("/bookings/my-bookings");
  const raw = res.data || res;
  const list = raw.data || raw;
  return Array.isArray(list) ? list : [];
}
