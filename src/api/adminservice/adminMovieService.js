// src/api/adminservice/adminMovieService.js
import { apiFetch } from "../fetchConfig";

const buildQuery = (params = {}) => {
  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null && value !== ""
  );
  if (!entries.length) return "";
  const qs = new URLSearchParams(entries).toString();
  return `?${qs}`;
};

/* ===================== MOVIES ===================== */

export async function getMovies(filters = {}) {
  const { title, genre, status } = filters;
  const res = await apiFetch(`/movies${buildQuery({ title, genre, status })}`);
  return res.data || res;
}

export async function getMovieById(movieId) {
  const res = await apiFetch(`/movies/${movieId}`);
  return res.data || res;
}

export async function createMovie(payload) {
  const res = await apiFetch("/movies", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data || res;
}

export async function updateMovie(movieId, payload) {
  const res = await apiFetch(`/movies/${movieId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return res.data || res;
}

export async function deleteMovie(movieId) {
  const res = await apiFetch(`/movies/${movieId}`, {
    method: "DELETE",
  });
  return true;
}

/** Search theo title (gợi ý autocomplete) */
export async function searchMoviesByTitle(title) {
  const res = await apiFetch(`/movies/search/title${buildQuery({ title })}`);
  return res.data || res;
}

/** Filter theo status: SHOWING / UPCOMING */
export async function filterMoviesByStatus(status) {
  const res = await apiFetch(`/movies/filter/status${buildQuery({ status })}`);
  return res.data || res;
}

/** Filter theo genre */
export async function filterMoviesByGenre(genre) {
  const res = await apiFetch(`/movies/filter/genre${buildQuery({ genre })}`);
  return res.data || res;
}

/* ===================== SHOWTIMES ===================== */

export async function createShowtime(payload) {
  const res = await apiFetch("/showtimes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data || res;
}

export async function updateShowtime(showtimeId, payload) {
  const res = await apiFetch(`/showtimes/${showtimeId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return res.data || res;
}

export async function deleteShowtime(showtimeId) {
  const res = await apiFetch(`/showtimes/${showtimeId}`, {
    method: "DELETE",
  });
  return true;
}

export async function getShowtimeById(showtimeId) {
  const res = await apiFetch(`/showtimes/${showtimeId}`);
  return res.data || res;
}

export async function getAllShowtimes() {
  const res = await apiFetch("/showtimes");
  return res.data || res;
}

/** Lấy showtimes cho 1 movie (mọi ngày) */
export async function getShowtimesByMovie(movieId) {
  const res = await apiFetch(`/showtimes/movie/${movieId}`);
  return res.data || res;
}

/** Lấy upcoming showtimes cho 1 movie */
export async function getUpcomingShowtimesByMovie(movieId) {
  const res = await apiFetch(`/showtimes/movie/${movieId}/upcoming`);
  return res.data || res;
}

/** Lấy showtimes theo room */
export async function getShowtimesByRoom(roomId) {
  const res = await apiFetch(`/showtimes/room/${roomId}`);
  return res.data || res;
}

/** Lấy showtimes cho movie trong khoảng ngày */
export async function getShowtimesByMovieInRange(movieId, startDate, endDate) {
  const res = await apiFetch(
    `/showtimes/movie/${movieId}/date-range${buildQuery({
      startDate,
      endDate,
    })}`
  );
  return res.data || res;
}

/**
 * Public endpoint gom theo cinema cho movie + date (dùng cho FE booking)
 * date format: YYYY-MM-DD
 */
export async function getMovieShowtimesPublic(movieId, date) {
  const res = await apiFetch(
    `/movies/${movieId}/showtimes${buildQuery({ date })}`
  );
  return res.data || res;
}
