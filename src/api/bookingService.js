// src/api/bookingService.js
import { apiFetch, USE_MOCK } from "./fetchConfig";

export async function createBooking(payload) {
  if (USE_MOCK) {
    return {
      booking_id: "mock-booking",
      status: "PENDING",
      ...payload,
    };
  }
  const res = await apiFetch("/bookings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data || res;
}

export async function getUserBookings() {
  if (USE_MOCK) {
    return []; // có thể mock thêm
  }
  const res = await apiFetch("/bookings/my");
  return res.data || res;
}
