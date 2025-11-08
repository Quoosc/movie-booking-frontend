// src/api/promotionService.js
import { apiFetch, USE_MOCK } from "./fetchConfig";

export async function validatePromotion(code, bookingId) {
  if (USE_MOCK) {
    if (code === "CINE10") {
      return { valid: true, discountType: "PERCENT", discountValue: 10 };
    }
    return { valid: false, message: "Mã không hợp lệ (mock)" };
  }

  const res = await apiFetch("/promotions/validate", {
    method: "POST",
    body: JSON.stringify({ code, bookingId }),
  });
  return res.data || res;
}
