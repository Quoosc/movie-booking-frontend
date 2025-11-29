// src/api/adminservice/adminCinemaService.js
import { apiFetch } from "../fetchConfig";

// helper build query string
const buildQuery = (params = {}) => {
  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null && value !== ""
  );
  if (!entries.length) return "";
  const qs = new URLSearchParams(entries).toString();
  return `?${qs}`;
};

/* ===================== CINEMAS ===================== */

export async function getCinemas() {
  const res = await apiFetch("/cinemas");
  return res; // List<CinemaDataResponse>
}

export async function getCinemaById(cinemaId) {
  const res = await apiFetch(`/cinemas/${cinemaId}`);
  return res; // CinemaDataResponse
}

export async function createCinema(payload) {
  const res = await apiFetch("/cinemas", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res;
}

export async function updateCinema(cinemaId, payload) {
  const res = await apiFetch(`/cinemas/${cinemaId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return res;
}

export async function deleteCinema(cinemaId) {
  const res = await apiFetch(`/cinemas/${cinemaId}`, {
    method: "DELETE",
  });
  return res; // có thể là "OK" / empty, tùy apiFetch xử lý
}

/**
 * Lấy movie đang SHOWING / UPCOMING tại 1 cinema
 * status: "SHOWING" | "UPCOMING"
 */
export async function getMoviesByCinema(cinemaId, status) {
  const res = await apiFetch(
    `/cinemas/${cinemaId}/movies${buildQuery({ status })}`
  );
  return res; // List<MovieDataResponse>
}

/* ===================== ROOMS ===================== */

export async function getRooms() {
  const res = await apiFetch("/cinemas/rooms");
  return res; // List<RoomDataResponse>
}

export async function getRoomById(roomId) {
  const res = await apiFetch(`/cinemas/rooms/${roomId}`);
  return res; // RoomDataResponse
}

export async function createRoom(payload) {
  const res = await apiFetch("/cinemas/rooms", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res;
}

export async function updateRoom(roomId, payload) {
  const res = await apiFetch(`/cinemas/rooms/${roomId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return res;
}

export async function deleteRoom(roomId) {
  const res = await apiFetch(`/cinemas/rooms/${roomId}`, {
    method: "DELETE",
  });
  return res;
}

/* ===================== SNACKS ===================== */

export async function getSnacks() {
  const res = await apiFetch("/cinemas/snacks");
  return res; // List<SnackDataResponse>
}

export async function getSnackById(snackId) {
  const res = await apiFetch(`/cinemas/snacks/${snackId}`);
  return res;
}

export async function createSnack(payload) {
  const res = await apiFetch("/cinemas/snacks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res;
}

export async function updateSnack(snackId, payload) {
  const res = await apiFetch(`/cinemas/snacks/${snackId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return res;
}

export async function deleteSnack(snackId) {
  const res = await apiFetch(`/cinemas/snacks/${snackId}`, {
    method: "DELETE",
  });
  return res;
}

/* ===================== SEATS (ROOM LEVEL) ===================== */

export async function createSeat(payload) {
  const res = await apiFetch("/seats", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res;
}

/** Generate toàn bộ sơ đồ ghế cho 1 room */
export async function generateSeats(payload) {
  const res = await apiFetch("/seats/generate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res; // BulkSeatResponse
}

/** Preview nhãn hàng ghế (A, B, C, ...) */
export async function getSeatRowLabels(rows) {
  const res = await apiFetch(`/seats/row-labels${buildQuery({ rows })}`);
  return res; // RowLabelsResponse
}

export async function updateSeat(seatId, payload) {
  const res = await apiFetch(`/seats/${seatId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return res;
}

export async function deleteSeat(seatId) {
  const res = await apiFetch(`/seats/${seatId}`, {
    method: "DELETE",
  });
  return res;
}

export async function getSeatById(seatId) {
  const res = await apiFetch(`/seats/${seatId}`);
  return res;
}

export async function getAllSeats() {
  const res = await apiFetch("/seats");
  return res;
}

export async function getSeatsByRoom(roomId) {
  const res = await apiFetch(`/seats/room/${roomId}`);
  return res;
}

/** Layout seats cho 1 showtime (status AVAILABLE/LOCKED/BOOKED) */
export async function getSeatLayoutByShowtime(showtimeId) {
  const res = await apiFetch(
    `/seats/layout${buildQuery({ showtime_id: showtimeId })}`
  );
  return res; // List<SeatLayoutResponse> theo swagger
}
