// src/api/promotionService.js
import { apiFetch } from "./fetchConfig";

/**
 * Lấy danh sách promotion đang còn hiệu lực
 * API: GET /promotions?filter=valid
 * Response kiểu:
 * {
 *   code: 200,
 *   data: [ { promotionId, code, name, ... }, ... ]
 * }
 */
export async function getValidPromotions() {
  const res = await apiFetch("/promotions?filter=valid");
  // apiFetch đã parse JSON → res = { code, message?, data } hoặc trực tiếp []
  return res.data || res;
}

/**
 * Validate 1 promotion code, trả về shape chuẩn:
 * { valid: boolean, promotion?: {...}, message?: string }
 *
 * API: GET /promotions/code/{code}
 * Response kiểu:
 * {
 *   code: 200,
 *   data: { promotionId, code, name, ... }
 * }
 */
export async function validatePromotion(code /* bookingId optional sau này */) {
  const trimmed = code?.trim();
  if (!trimmed) {
    return { valid: false, message: "Vui lòng nhập mã khuyến mãi." };
  }

  try {
    const res = await apiFetch(
      `/promotions/code/${encodeURIComponent(trimmed)}`
    );
    const data = res.data || res; // 1 object promotion

    return {
      valid: true,
      promotion: data,
    };
  } catch (err) {
    console.error("validatePromotion error", err);
    return {
      valid: false,
      message: "Mã khuyến mãi không hợp lệ hoặc đã hết hạn.",
    };
  }
}












































// src/api/promotionService.js   sử dụng để mock
// import { apiFetch, USE_MOCK } from "./fetchConfig";

// export async function getValidPromotions() {
//   if (USE_MOCK) {
//     // Mock vài mã để test UI
//     return [
//       {
//         promotionId: "mock-1",
//         code: "CTEN45",
//         name: "C'Ten: 45k phim 2D",
//         description: "Xem phim trước 10h sáng và sau 10h tối",
//         discountType: "PERCENTAGE",
//         discountValue: 10,
//       },
//       {
//         promotionId: "mock-2",
//         code: "CMEMBER45",
//         name: "C'Member: 45k phim 2D",
//         description: "Thành viên Cinestar vào ngày thứ 4 hàng tuần",
//         discountType: "PERCENT",
//         discountValue: 15,
//       },
//       {
//         promotionId: "mock-3",
//         code: "CMONDAY45",
//         name: "C'Monday: 45k phim 2D",
//         description: "Các suất chiếu vào ngày thứ 2 hằng tuần",
//         discountType: "PERCENT",
//         discountValue: 20,
//       },
//     ];
//   }

//   const res = await apiFetch("/promotions?filter=valid");
//   return res.data || res;
// }

// /**
//  * Validate 1 promotion code, trả về shape chuẩn:
//  * { valid: boolean, promotion?: {...}, message?: string }
//  */
// export async function validatePromotion(code /* bookingId optional */) {
//   const trimmed = code?.trim();
//   if (!trimmed) {
//     return { valid: false, message: "Vui lòng nhập mã khuyến mãi." };
//   }

//   if (USE_MOCK) {
//     const list = await getValidPromotions();
//     const promo = list.find(
//       (p) => p.code.toUpperCase() === trimmed.toUpperCase()
//     );
//     if (!promo) {
//       return { valid: false, message: "Mã không hợp lệ (mock)." };
//     }
//     return { valid: true, promotion: promo };
//   }

//   try {
//     const res = await apiFetch(`/promotions/code/${encodeURIComponent(trimmed)}`);
//     const data = res.data || res;
//     return {
//       valid: true,
//       promotion: data,
//     };
//   } catch (err) {
//     console.error("validatePromotion error", err);
//     return {
//       valid: false,
//       message: "Mã khuyến mãi không hợp lệ hoặc đã hết hạn.",
//     };
//   }
// }
