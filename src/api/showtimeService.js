// src/api/showtimeService.js
import { apiFetch, USE_MOCK } from "./fetchConfig";

// mock tối giản
const MOCK_SHOWTIMES = [
  // bạn có thể thêm dữ liệu test nếu cần
];

export async function getShowtimesByMovie(movieId) {
  if (USE_MOCK) {
    return MOCK_SHOWTIMES.filter((s) => s.movie_id === movieId);
  }
  const res = await apiFetch(`/showtimes?movieId=${movieId}`);
  return res.data || res;
}

export async function getShowtimeDetail(id) {
  if (USE_MOCK) {
    return MOCK_SHOWTIMES.find((s) => s.showtime_id === id) || null;
  }
  const res = await apiFetch(`/showtimes/${id}`);
  return res.data || res;
}
