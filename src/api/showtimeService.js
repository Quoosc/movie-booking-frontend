// src/api/showtimeService.js
import { apiFetch } from "./fetchConfig";

const USE_MOCK =false;

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
  1: {
    "2025-11-27": [
      {
        cinemaId: "c1",
        cinemaName: "CinesVerse Quốc ProPlayer (Q.1)",
        address: "271 Nguyễn Trãi, Quận 1, TP.HCM",
        showtimes: [
          {
            showtimeId: "s101",
            startTime: "2025-11-24T09:30:00",
            format: "2D",
            roomName: "Rạp 1",
            basePrice: 75000,
          },
          {
            showtimeId: "s102",
            startTime: "2025-11-24T12:00:00",
            format: "2D",
            roomName: "Rạp 2",
            basePrice: 95000,
          },
          {
            showtimeId: "s103",
            startTime: "2025-11-24T14:45:00",
            format: "3D",
            roomName: "Rạp VIP",
            basePrice: 145000,
          },
          {
            showtimeId: "s104",
            startTime: "2025-11-24T17:30:00",
            format: "2D",
            roomName: "Rạp 3",
            basePrice: 105000,
          },
          {
            showtimeId: "s105",
            startTime: "2025-11-24T20:15:00",
            format: "2D",
            roomName: "Rạp 1",
            basePrice: 115000,
          },
        ],
      },
      {
        cinemaId: "c2",
        cinemaName: "CinesVerse Hai Bà Trưng (Q.3)",
        address: "135 Hai Bà Trưng, Quận 3, TP.HCM",
        showtimes: [
          {
            showtimeId: "s106",
            startTime: "2025-11-24T11:00:00",
            format: "2D",
            roomName: "Rạp 4",
            basePrice: 85000,
          },
          {
            showtimeId: "s107",
            startTime: "2025-11-24T16:30:00",
            format: "2D",
            roomName: "Rạp 5",
            basePrice: 95000,
          },
          {
            showtimeId: "s108",
            startTime: "2025-11-24T19:00:00",
            format: "3D",
            roomName: "Rạp 6",
            basePrice: 135000,
          },
        ],
      },
    ],
    "2025-11-28": [
      {
        cinemaId: "c3",
        cinemaName: "CinesVerse Huỳnh Tấn Phát (Q.7)",
        address: "126 Huỳnh Tấn Phát, Quận 7, TP.HCM",
        showtimes: [
          {
            showtimeId: "s109",
            startTime: "2025-11-25T10:15:00",
            format: "2D",
            roomName: "Rạp 1",
            basePrice: 70000,
          },
          {
            showtimeId: "s110",
            startTime: "2025-11-25T13:30:00",
            format: "2D",
            roomName: "Rạp 2",
            basePrice: 90000,
          },
          {
            showtimeId: "s111",
            startTime: "2025-11-25T18:45:00",
            format: "2D",
            roomName: "Rạp 3",
            basePrice: 100000,
          },
        ],
      },
    ],
    "2025-11-29": [
      {
        cinemaId: "c1",
        cinemaName: "CinesVerse Quốc ProPlayer (Q.1)",
        address: "271 Nguyễn Trãi, Quận 1, TP.HCM",
        showtimes: [
          {
            showtimeId: "s112",
            startTime: "2025-11-26T14:00:00",
            format: "2D",
            roomName: "Rạp 2",
            basePrice: 95000,
          },
          {
            showtimeId: "s113",
            startTime: "2025-11-26T20:30:00",
            format: "3D",
            roomName: "Rạp VIP",
            basePrice: 150000,
          },
        ],
      },
    ],
  },
  2: {
    "2025-11-27": [
      {
        cinemaId: "c1",
        cinemaName: "CinesVerse Quốc ProPlayer (Q.1)",
        address: "271 Nguyễn Trãi, Quận 1, TP.HCM",
        showtimes: [
          {
            showtimeId: "s201",
            startTime: "2025-11-24T10:30:00",
            format: "2D",
            roomName: "Rạp 5",
            basePrice: 65000,
          },
          {
            showtimeId: "s202",
            startTime: "2025-11-24T13:15:00",
            format: "2D",
            roomName: "Rạp 6",
            basePrice: 85000,
          },
          {
            showtimeId: "s203",
            startTime: "2025-11-24T16:00:00",
            format: "2D",
            roomName: "Rạp 7",
            basePrice: 95000,
          },
          {
            showtimeId: "s204",
            startTime: "2025-11-24T18:45:00",
            format: "2D",
            roomName: "Rạp 8",
            basePrice: 105000,
          },
          {
            showtimeId: "s205",
            startTime: "2025-11-24T21:30:00",
            format: "2D",
            roomName: "Rạp 5",
            basePrice: 95000,
          },
        ],
      },
      {
        cinemaId: "c4",
        cinemaName: "CinesVerse Bình Dương",
        address: "Khu đô thị mới, Thủ Dầu Một, Bình Dương",
        showtimes: [
          {
            showtimeId: "s206",
            startTime: "2025-11-24T12:00:00",
            format: "2D",
            roomName: "Rạp 1",
            basePrice: 75000,
          },
          {
            showtimeId: "s207",
            startTime: "2025-11-24T19:30:00",
            format: "2D",
            roomName: "Rạp 2",
            basePrice: 90000,
          },
        ],
      },
    ],
    "2025-11-28": [
      {
        cinemaId: "c2",
        cinemaName: "CinesVerse Hai Bà Trưng (Q.3)",
        address: "135 Hai Bà Trưng, Quận 3, TP.HCM",
        showtimes: [
          {
            showtimeId: "s208",
            startTime: "2025-11-25T11:45:00",
            format: "2D",
            roomName: "Rạp 3",
            basePrice: 80000,
          },
          {
            showtimeId: "s209",
            startTime: "2025-11-25T17:15:00",
            format: "2D",
            roomName: "Rạp 4",
            basePrice: 95000,
          },
        ],
      },
    ],
    "2025-11-29": [
      {
        cinemaId: "c1",
        cinemaName: "CinesVerse Quốc ProPlayer (Q.1)",
        address: "271 Nguyễn Trãi, Quận 1, TP.HCM",
        showtimes: [
          {
            showtimeId: "s210",
            startTime: "2025-11-27T15:00:00",
            format: "2D",
            roomName: "Rạp 1",
            basePrice: 95000,
          },
          {
            showtimeId: "s211",
            startTime: "2025-11-27T20:00:00",
            format: "2D",
            roomName: "Rạp VIP",
            basePrice: 130000,
          },
        ],
      },
    ],
  },
  3: {
    "2025-11-27": [
      {
        cinemaId: "c1",
        cinemaName: "CinesVerse Quốc ProPlayer (Q.1)",
        address: "271 Nguyễn Trãi, Quận 1, TP.HCM",
        showtimes: [
          {
            showtimeId: "s301",
            startTime: "2025-11-24T09:00:00",
            format: "2D",
            roomName: "Rạp 4",
            basePrice: 60000,
          },
          {
            showtimeId: "s302",
            startTime: "2025-11-24T11:30:00",
            format: "2D",
            roomName: "Rạp 5",
            basePrice: 70000,
          },
          {
            showtimeId: "s303",
            startTime: "2025-11-24T14:00:00",
            format: "2D",
            roomName: "Rạp 6",
            basePrice: 80000,
          },
          {
            showtimeId: "s304",
            startTime: "2025-11-24T16:30:00",
            format: "2D",
            roomName: "Rạp 7",
            basePrice: 80000,
          },
        ],
      },
      {
        cinemaId: "c3",
        cinemaName: "CinesVerse Huỳnh Tấn Phát (Q.7)",
        address: "126 Huỳnh Tấn Phát, Quận 7, TP.HCM",
        showtimes: [
          {
            showtimeId: "s305",
            startTime: "2025-11-24T10:00:00",
            format: "2D",
            roomName: "Rạp 1",
            basePrice: 55000,
          },
          {
            showtimeId: "s306",
            startTime: "2025-11-24T13:45:00",
            format: "2D",
            roomName: "Rạp 2",
            basePrice: 75000,
          },
        ],
      },
    ],
    "2025-11-28": [
      {
        cinemaId: "c2",
        cinemaName: "CinesVerse Hai Bà Trưng (Q.3)",
        address: "135 Hai Bà Trưng, Quận 3, TP.HCM",
        showtimes: [
          {
            showtimeId: "s307",
            startTime: "2025-11-26T10:30:00",
            format: "2D",
            roomName: "Rạp 3",
            basePrice: 70000,
          },
          {
            showtimeId: "s308",
            startTime: "2025-11-26T15:15:00",
            format: "2D",
            roomName: "Rạp 4",
            basePrice: 80000,
          },
        ],
      },
    ],
  },
  4: {
    "2025-11-27": [
      {
        cinemaId: "c1",
        cinemaName: "CinesVerse Quốc ProPlayer (Q.1)",
        address: "271 Nguyễn Trãi, Quận 1, TP.HCM",
        showtimes: [
          {
            showtimeId: "s401",
            startTime: "2025-11-24T11:00:00",
            format: "2D",
            roomName: "Rạp 8",
            basePrice: 85000,
          },
          {
            showtimeId: "s402",
            startTime: "2025-11-24T14:30:00",
            format: "2D",
            roomName: "Rạp 9",
            basePrice: 95000,
          },
          {
            showtimeId: "s403",
            startTime: "2025-11-24T17:15:00",
            format: "2D",
            roomName: "Rạp 10",
            basePrice: 105000,
          },
          {
            showtimeId: "s404",
            startTime: "2025-11-24T20:00:00",
            format: "2D",
            roomName: "Rạp VIP",
            basePrice: 140000,
          },
        ],
      },
      {
        cinemaId: "c4",
        cinemaName: "CinesVerse Bình Dương",
        address: "Khu đô thị mới, Thủ Dầu Một, Bình Dương",
        showtimes: [
          {
            showtimeId: "s405",
            startTime: "2025-11-24T13:00:00",
            format: "2D",
            roomName: "Rạp 3",
            basePrice: 75000,
          },
          {
            showtimeId: "s406",
            startTime: "2025-11-24T18:30:00",
            format: "2D",
            roomName: "Rạp 4",
            basePrice: 90000,
          },
        ],
      },
    ],
    "2025-11-28": [
      {
        cinemaId: "c3",
        cinemaName: "CinesVerse Huỳnh Tấn Phát (Q.7)",
        address: "126 Huỳnh Tấn Phát, Quận 7, TP.HCM",
        showtimes: [
          {
            showtimeId: "s407",
            startTime: "2025-11-25T12:30:00",
            format: "2D",
            roomName: "Rạp 5",
            basePrice: 80000,
          },
          {
            showtimeId: "s408",
            startTime: "2025-11-25T16:00:00",
            format: "2D",
            roomName: "Rạp 6",
            basePrice: 90000,
          },
          {
            showtimeId: "s409",
            startTime: "2025-11-25T19:30:00",
            format: "2D",
            roomName: "Rạp 7",
            basePrice: 95000,
          },
        ],
      },
    ],
    "2025-11-29": [
      {
        cinemaId: "c1",
        cinemaName: "CinesVerse Quốc ProPlayer (Q.1)",
        address: "271 Nguyễn Trãi, Quận 1, TP.HCM",
        showtimes: [
          {
            showtimeId: "s410",
            startTime: "2025-11-28T15:45:00",
            format: "2D",
            roomName: "Rạp 1",
            basePrice: 95000,
          },
          {
            showtimeId: "s411",
            startTime: "2025-11-28T21:00:00",
            format: "2D",
            roomName: "Rạp VIP",
            basePrice: 135000,
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
    const raw = MOCK_SHOWTIMES_BY_MOVIE[String(movieId)]?.[date] || [];
    return raw.map(mapShowtimeGroupFromApi);
  }

  // 🚀 API thật (future, đã chuẩn camelCase):
 //GET /movies/{id}/showtimes?date=YYYY-MM-DD
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
  const res = await apiFetch(`/showtimes/${id}`);
  return res.data || res;
  return null;
}
