// src/api/movieService.js

import { apiFetch } from "./fetchConfig";
import { getShowtimesByMovie } from "./showtimeService";
const CLOUDINARY_BASE_URL = import.meta.env.VITE_CLOUDINARY_BASE_URL || "";

const USE_MOCK = false;


/* ======================= HELPERS ======================= */

// src/api/movieService.js

function mapMovie(m) {
  return {
    id: m.movieId || m.movie_id || m.id,
    title: m.title,
    posterUrl: buildPosterUrl(m), // luôn có giá trị hợp lý
    bannerUrl: m.bannerUrl || m.banner_url || buildPosterUrl(m), // nếu không có banner thì fallback poster
    description: m.description || "",
    genre: m.genre,
    language: m.language,
    duration: m.duration,
    minimumAge: m.minimumAge ?? m.minimum_age,
    releaseDate: m.releaseDate || m.release_date,
    director: m.director,
    cast: m.cast || m.actors,
    trailerUrl: m.trailerUrl || m.trailer_url,
    status: m.status,
    ratingAvg: m.ratingAvg ?? m.rating_avg ?? null,
    posterCloudinaryId: m.posterCloudinaryId || m.poster_cloudinary_id, // để màn admin dùng
  };
}

function buildPosterUrl(m) {
  // 1️⃣ Nếu BE đã trả posterUrl full → dùng luôn
  if (m.posterUrl || m.poster_url) {
    return m.posterUrl || m.poster_url;
  }

  // 2️⃣ Nếu chỉ có posterCloudinaryId → tự build URL từ base
  const cloudId = m.posterCloudinaryId || m.poster_cloudinary_id;
  if (CLOUDINARY_BASE_URL && cloudId) {
    return `${CLOUDINARY_BASE_URL}/${cloudId}`;
  }

  // 3️⃣ Fallback placeholder
  return "/public/movies/placeholder-poster.jpg";
}

/* ==================== PUBLIC SERVICES ==================== */

/** GET /movies */
export async function getAllMovies() {
  if (USE_MOCK) {
    return MOCK_MOVIES.map(mapMovie);
  }

  const res = await apiFetch("/movies");
  return (res.data || res).map(mapMovie);
}

/** GET /movies?status=SHOWING */
export async function getShowingMovies() {
  if (USE_MOCK) {
    return MOCK_MOVIES.filter((m) => m.status === "SHOWING").map(mapMovie);
  }

  const res = await apiFetch("/movies/filter/status?status=SHOWING");
  return (res.data || res).map(mapMovie);
}

/** GET /movies?status=UPCOMING */
export async function getUpcomingMovies() {
  if (USE_MOCK) {
    return MOCK_MOVIES.filter((m) => m.status === "UPCOMING").map(mapMovie);
  }

  const res = await apiFetch("/movies/filter/status?status=UPCOMING");
  return (res.data || res).map(mapMovie);
}

/** GET /movies/{id} */
export async function getMovieById(id) {
  if (USE_MOCK) {
    const found = MOCK_MOVIES.find((m) => String(m.movie_id) === String(id));
    return found ? mapMovie(found) : null;
  }

  const res = await apiFetch(`/movies/${id}`);
  return mapMovie(res.data || res);
}

/**
 * GET /movies/{id}/showtimes?date=YYYY-MM-DD
 *
 * FE dùng trực tiếp cho trang chi tiết phim:
 * - Input: movieId, date (YYYY-MM-DD)
 * - Output:
 *   [
 *     {
 *       cinemaId,
 *       cinemaName,
 *       address,
 *       showtimes: [
 *         { showtimeId, startTime, format, room, price }
 *       ]
 *     }
 *   ]
 */
export async function getMovieShowtimesByDate(movieId, date) {
  // Dù là MOCK hay BE thật, logic đều đi qua showtimeService
  return getShowtimesByMovie(movieId, date);
}

export const getShowtimesByMovieAndDate = getMovieShowtimesByDate;

// ==================== SEARCH / FILTER ====================

/**
 * TÌM KIẾM THEO TÊN
 * GET /movies/search/title?title=...
 */
export async function searchMoviesByTitle(title) {
  const keyword = (title || "").trim().toLowerCase();

  if (!keyword) {
    // Nếu không nhập từ khóa → trả tất cả phim
    return getAllMovies();
  }

  if (USE_MOCK) {
    return MOCK_MOVIES.filter((m) =>
      (m.title || "").toLowerCase().includes(keyword)
    ).map(mapMovie);
  }

  const res = await apiFetch(
    `/movies/search/title?title=${encodeURIComponent(keyword)}`
  );
  return (res.data || res).map(mapMovie);
}

/**
 * LỌC THEO TRẠNG THÁI
 * GET /movies/filter/status?status=SHOWING|UPCOMING
 */
export async function filterMoviesByStatus(status) {
  const normalized = (status || "").toUpperCase();

  if (!normalized) {
    return getAllMovies();
  }

  if (USE_MOCK) {
    return MOCK_MOVIES.filter(
      (m) => (m.status || "").toUpperCase() === normalized
    ).map(mapMovie);
  }

  const res = await apiFetch(
    `/movies/filter/status?status=${encodeURIComponent(normalized)}`
  );
  return (res.data || res).map(mapMovie);
}

/**
 * LỌC THEO THỂ LOẠI
 * GET /movies/filter/genre?genre=...
 *
 * Với MOCK:
 *  - so sánh 'contains' không phân biệt hoa thường
 *  - ví dụ genre="Hài" sẽ match "Hài, Gia đình"
 */
export async function filterMoviesByGenre(genre) {
  const keyword = (genre || "").trim().toLowerCase();

  if (!keyword) {
    return getAllMovies();
  }

  if (USE_MOCK) {
    return MOCK_MOVIES.filter((m) =>
      (m.genre || "").toLowerCase().includes(keyword)
    ).map(mapMovie);
  }

  const res = await apiFetch(
    `/movies/filter/genre?genre=${encodeURIComponent(keyword)}`
  );
  return (res.data || res).map(mapMovie);
}

// ==================== CINEMA MOVIES (NEW) ====================

/**
 * GET /cinemas/{cinemaId}/movies?status=SHOWING|UPCOMING
 *
 * BE response (spec v2.3):
 * [
 *   {
 *     "movieId": "uuid",
 *     "title": "...",
 *     "genre": "...",
 *     "description": "...",
 *     "duration": 120,
 *     "minimumAge": 13,
 *     "director": "Jane Doe",
 *     "actors": "Actor A, Actor B",
 *     "posterUrl": "...",
 *     "posterCloudinaryId": "...",
 *     "trailerUrl": "...",
 *     "status": "SHOWING",
 *     "language": "EN"
 *   }
 * ]
 */

const MOCK_CINEMA_MOVIES_SHOWING = {
  c1: ["1", "2", "3", "4"],
  c2: ["1", "2", "3"],
  c3: ["1", "3", "4"],
  c4: ["2", "4"],
};

export async function getCinemaMovies(cinemaId, status) {
  const normalizedStatus = (status || "SHOWING").toUpperCase();

  if (USE_MOCK) {
    // SHOWING: chỉ lấy các phim có thật suất chiếu tại rạp (dựa trên MOCK)
    if (normalizedStatus === "SHOWING") {
      const idsForCinema = new Set(MOCK_CINEMA_MOVIES_SHOWING[cinemaId] || []);

      const list = MOCK_MOVIES.filter((m) => {
        const idStr = String(m.movie_id || m.movieId || m.id);
        const matchCinema = idsForCinema.has(idStr);
        const matchStatus = (m.status || "").toUpperCase() === "SHOWING";
        return matchCinema && matchStatus;
      });

      return list.map(mapMovie);
    }

    // UPCOMING: hiện tại mock chưa có suất chiếu tương lai,
    // nên mình cho tất cả phim UPCOMING xuất hiện ở mọi rạp
    if (normalizedStatus === "UPCOMING") {
      return MOCK_MOVIES.filter(
        (m) => (m.status || "").toUpperCase() === "UPCOMING"
      ).map(mapMovie);
    }

    // fallback: nếu status linh tinh -> trả rỗng
    return [];
  }

  const res = await apiFetch(
    `/cinemas/${cinemaId}/movies?status=${encodeURIComponent(normalizedStatus)}`
  );
  const data = res.data || res;
  return (data || []).map(mapMovie);
}
