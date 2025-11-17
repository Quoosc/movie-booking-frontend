// src/api/showtimeService.js
import { apiFetch, USE_MOCK } from "./fetchConfig";

// Helper: format ISO -> "HH:mm"
function formatTimeToHHMM(isoString) {
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Mapper từ API => format FE đang dùng trong ShowtimeSection:
 *
 * FE expect:
 * {
 *   cinemaId,
 *   cinemaName,
 *   address,
 *   showtimes: [
 *     {
 *       showtimeId,
 *       startTime,   // "19:30"
 *       format,      // "2D"
 *       room,        // "Phòng 2"
 *       basePrice,   // 90000
 *     }
 *   ]
 * }
 */
function mapShowtimeGroupFromApi(group) {
  return {
    cinemaId: group.cinema_id,
    cinemaName: group.cinema_name,
    address: group.address || "",
    showtimes: (group.showtimes || []).map((s) => ({
      showtimeId: s.showtime_id,
      startTime: formatTimeToHHMM(s.start_time),
      format: s.format,
      room: s.room_name || s.room || "",
      basePrice: s.base_price ?? s.price ?? null,
    })),
  };
}

/**
 * MOCK structure để bạn test:
 * const MOCK_SHOWTIMES_BY_MOVIE = {
 *   [movieId]: {
 *     [date]: [ { cinemaId, cinemaName, address, showtimes: [...] } ]
 *   }
 * }
 */
const MOCK_SHOWTIMES_BY_MOVIE = {
  // "movie-demo-id": {
  //   "2025-11-10": [
  //     {
  //       cinemaId: "c1",
  //       cinemaName: "Cinestar Quốc Thanh",
  //       address: "271 Nguyễn Trãi, Q.1, TP.HCM",
  //       showtimes: [
  //         {
  //           showtimeId: "st1",
  //           startTime: "19:30",
  //           format: "2D",
  //           room: "Phòng 2",
  //           basePrice: 90000,
  //         },
  //       ],
  //     },
  //   ],
  // },
};

/**
 * Trang chi tiết phim:
 * GET /movies/{id}/showtimes?date=YYYY-MM-DD
 */
export async function getShowtimesByMovie(movieId, date) {
  if (USE_MOCK) {
    return (MOCK_SHOWTIMES_BY_MOVIE[movieId]?.[date] || []);
  }

  const res = await apiFetch(`/movies/${movieId}/showtimes?date=${date}`);
  const data = res.data || res;
  return (data || []).map(mapShowtimeGroupFromApi);
}

/**
 * Tạm thời FE **không cần** getShowtimeDetail riêng.
 * Nếu sau này bạn thêm public API kiểu GET /showtimes/{id} thì hãy
 * mở hàm này ra và map tương tự.
 */
export async function getShowtimeDetail(id) {
  if (USE_MOCK) {
    // nếu bạn muốn test thì tự lấy từ MOCK_SHOWTIMES_BY_MOVIE
    return null;
  }

  // TODO: nếu sau này bạn có GET /showtimes/{id} public
  // const res = await apiFetch(`/showtimes/${id}`);
  // return res.data || res;
  return null;
}
