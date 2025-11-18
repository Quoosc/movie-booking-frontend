// src/api/showtimeService.js
// import { apiFetch, USE_MOCK } from "./fetchConfig";

const USE_MOCK = true;

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
    cinemaId: group.cinemaId || group.cinema_id,
    cinemaName: group.cinemaName || group.cinema_name,
    address: group.address || "",
    showtimes: (group.showtimes || []).map((s) => ({
      showtimeId: s.showtimeId || s.showtime_id,
      startTime: formatTimeToHHMM(s.startTime || s.start_time),
      format: s.format,
      room: s.roomName || s.room_name || s.room || "",
      // giữ cả basePrice cho chỗ khác có thể dùng
      basePrice: s.basePrice ?? s.base_price ?? s.price ?? null,
      // thêm price cho FE nào expect price
      price: s.basePrice ?? s.base_price ?? s.price ?? null,
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
// MOCK structure:
// const MOCK_SHOWTIMES_BY_MOVIE = {
//   [movieId]: {
//     [date]: [ { cinemaId, cinemaName, address, showtimes: [...] } ]
//   }
// };
const MOCK_SHOWTIMES_BY_MOVIE = {
  "2": {
    "2025-11-18": [
      {
        cinemaId: "c1",
        cinemaName: "Cinestar Quốc Thanh (Q.1)",
        address: "271 Nguyễn Trãi, Q.1, TP.HCM",
        showtimes: [
          {
            showtimeId: "st1",
            startTime: "2025-11-10T13:00:00",
            format: "2D",
            roomName: "Rạp 1",
            basePrice: 90000,
          },
          {
            showtimeId: "st2",
            startTime: "2025-11-10T15:30:00",
            format: "2D",
            roomName: "Rạp 1",
            basePrice: 90000,
          },
          {
            showtimeId: "st3",
            startTime: "2025-11-10T18:00:00",
            format: "2D",
            roomName: "Rạp 3",
            basePrice: 90000,
          },
        ],
      },
      {
        cinemaId: "c2",
        cinemaName: "Cinestar Sinh Viên (Bình Dương)",
        address: "Khu phố sinh viên, Bình Dương",
        showtimes: [
          {
            showtimeId: "st4",
            startTime: "2025-11-10T20:30:00",
            format: "2D",
            roomName: "Rạp 5",
            basePrice: 90000,
          },
        ],
      },
    ],

    "2025-11-19": [
      {
        cinemaId: "c1",
        cinemaName: "Cinestar Quốc Thanh (Q.1)",
        address: "271 Nguyễn Trãi, Q.1, TP.HCM",
        showtimes: [
          {
            showtimeId: "st7",
            startTime: "2025-11-11T14:15:00",
            format: "2D",
            roomName: "Rạp 9",
            basePrice: 90000,
          },
          {
            showtimeId: "st8",
            startTime: "2025-11-11T17:00:00",
            format: "2D",
            roomName: "Rạp 2",
            basePrice: 90000,
          },
          {
            showtimeId: "st9",
            startTime: "2025-11-11T19:45:00",
            format: "2D",
            roomName: "Rạp 2",
            basePrice: 90000,
          },
        ],
      },
    ],
  },

  "1": {
    "2025-11-18": [
      {
        cinemaId: "c3",
        cinemaName: "Cinestar Huỳnh Tấn Phát (Q.7)",
        address: "Huỳnh Tấn Phát, Q.7, TP.HCM",
        showtimes: [
          {
            showtimeId: "st10",
            startTime: "2025-11-10T10:30:00",
            format: "2D",
            roomName: "Rạp 3",
            basePrice: 70000,
          },
          {
            showtimeId: "st11",
            startTime: "2025-11-10T13:15:00",
            format: "2D",
            roomName: "Rạp 3",
            basePrice: 70000,
          },
          {
            showtimeId: "st12",
            startTime: "2025-11-10T15:45:00",
            format: "2D",
            roomName: "Rạp 3",
            basePrice: 80000,
          },
        ],
      },
    ],
  },
};


/**
 * Trang chi tiết phim:
 * GET /movies/{id}/showtimes?date=YYYY-MM-DD
 */
export async function getShowtimesByMovie(movieId, date) {
  if (USE_MOCK) {
    const raw =
      MOCK_SHOWTIMES_BY_MOVIE[String(movieId)]?.[date] || [];
    // raw đang là kiểu API (camelCase) → vẫn map lại cho thống nhất
    return raw.map(mapShowtimeGroupFromApi);
  }

  // 🚀 API thật (future, đã chuẩn camelCase):
  // GET /movies/{id}/showtimes?date=YYYY-MM-DD
  // const res = await apiFetch(`/movies/${movieId}/showtimes?date=${date}`);
  // const data = res.data || res;
  // return (data || []).map(mapShowtimeGroupFromApi);
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
