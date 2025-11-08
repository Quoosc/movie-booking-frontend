// src/api/movieService.js
// import { apiFetch } from "./fetchConfig"; // 👉 mở lại sau khi backend sẵn sàng

/**
 * MOCK MOVIES
 * - Dùng để test UI: carousel 4 phim/trang + XEM THÊM.
 * - 8 phim đang chiếu, 6 phim sắp chiếu, không trùng nhau.
 * - Sau khi API ok: xoá block này + bỏ comment phần fetch bên dưới.
 */
const MOCK_MOVIES = [
  // ==== SHOWING (8 phim) ====
  {
    movie_id: "1",
    title: "CỤC VÀNG CỦA NGOẠI (T13)",
    genre: "Hài, Gia đình",
    duration: 110,
    minimum_age: 13,
    poster_url: "/public/movies/cuc-vang-cua-ngoai-poster.jpg",
    trailer_url: "",
    status: "SHOWING",
    language: "Việt",
  },
  {
    movie_id: "2",
    title: "QUÁI THÚ VÔ HÌNH: VÙNG ĐẤT CHẾT CHÓC (T16)",
    genre: "Kinh dị",
    duration: 105,
    minimum_age: 16,
    poster_url: "/public/movies/quai-thu-vo-hinh.jpg",
    trailer_url: "",
    status: "SHOWING",
    language: "Anh - Phụ đề Việt",
  },
  {
    movie_id: "3",
    title: "GODZILLA MINUS ONE (T13)",
    genre: "Hành động, Thảm hoạ",
    duration: 124,
    minimum_age: 13,
    poster_url: "/public/movies/godzilla.jpg",
    trailer_url: "",
    status: "SHOWING",
    language: "Nhật - Phụ đề Việt",
  },
  {
    movie_id: "4",
    title: "TRÁI TIM QUÈ QUẶT (T18)",
    genre: "Tâm lý, Tình cảm",
    duration: 98,
    minimum_age: 18,
    poster_url: "/public/movies/trai-tim-que-quat-poster.jpg",
    trailer_url: "",
    status: "SHOWING",
    language: "Việt",
  },
  {
    movie_id: "5",
    title: "BADLANDS: CƠ HỘI CUỐI CÙNG (T16)",
    genre: "Hành động",
    duration: 115,
    minimum_age: 16,
    poster_url: "/public/movies/chet_choc.jpg",
    trailer_url: "",
    status: "SHOWING",
    language: "Anh - Phụ đề Việt",
  },
  {
    movie_id: "6",
    title: "ANH HÙNG CUỐI CÙNG (T13)",
    genre: "Hành động, Phiêu lưu",
    duration: 120,
    minimum_age: 13,
    poster_url: "/public/movies/base64-17550626259371965999958.jpg",
    trailer_url: "",	
    status: "SHOWING",
    language: "Anh - Phụ đề Việt",
  },
  {
    movie_id: "7",
    title: "KẺ SĂN BÓNG ĐÊM (T18)",
    genre: "Kinh dị, Giật gân",
    duration: 102,
    minimum_age: 18,
    poster_url: "/public/movies/300x450_16.jpg",
    trailer_url: "",
    status: "SHOWING",
    language: "Anh - Phụ đề Việt",
  },
  {
    movie_id: "8",
    title: "ĐÊM ĐEN THÀNH PHỐ (T16)",
    genre: "Hành động, Tội phạm",
    duration: 110,
    minimum_age: 16,
    poster_url: "/public/movies/11265_103_100002.jpg",
    trailer_url: "",
    status: "SHOWING",
    language: "Việt",
  },

  // ==== UPCOMING (6 phim) ====
  {
    movie_id: "9",
    title: "NHÀ MA XÓ (T18)",
    genre: "Kinh dị",
    duration: 102,
    minimum_age: 18,
    poster_url: "/public/movies/nha-ma-xo.jpg",
    trailer_url: "",
    status: "UPCOMING",
    language: "Việt",
  },
  {
    movie_id: "10",
    title: "TÌNH NGƯỜI DUYÊN MA 2025 (T13)",
    genre: "Hài, Tình cảm",
    duration: 108,
    minimum_age: 13,
    poster_url: "/public/movies/tinh-nguoi-duyen-ma-2025.jpg",
    trailer_url: "",
    status: "UPCOMING",
    language: "Thái - Phụ đề Việt",
  },
  {
    movie_id: "11",
    title: "HÀNH TINH DIỆT VONG (T13)",
    genre: "Khoa học viễn tưởng",
    duration: 118,
    minimum_age: 13,
    poster_url: "/public/movies/gemini-1080x1920_1641976136159.jpg",
    trailer_url: "",
    status: "UPCOMING",
    language: "Anh - Phụ đề Việt",
  },
  {
    movie_id: "12",
    title: "MIDNIGHT SPECIAL (T16)",
    genre: "Giật gân, Bí ẩn",
    duration: 104,
    minimum_age: 16,
    poster_url: "/public/movies/1_5d10adc4-7517-442c-a3c6-0894cbf9e1e9_spo_600x.jpg",
    trailer_url: "",
    status: "UPCOMING",
    language: "Anh - Phụ đề Việt",
  },
  {
    movie_id: "13",
   title: "TÌNH NGƯỜI DUYÊN MA 2 (T13)",
    genre: "Hài, Tình cảm",
    duration: 112,
    minimum_age: 13,
    poster_url: "/public/movies/tinh-nguoi-duyen-ma-2025.jpg",
    trailer_url: "",
    status: "UPCOMING",
    language: "Thái - Phụ đề Việt",
  },
  {
    movie_id: "14",
    title: "THẾ GIỚI KHÔNG NGỦ (T16)",
    genre: "Hành động, Viễn tưởng",
    duration: 111,
    minimum_age: 16,
    poster_url: "/public/movies/dn.jpg",
    trailer_url: "",
    status: "UPCOMING",
    language: "Anh - Phụ đề Việt",
  },
];

// Chuẩn hoá dữ liệu cho UI
function mapMovie(m) {
  return {
    id: m.movie_id || m.id,
    title: m.title,
    genre: m.genre,
    duration: m.duration,
    minimumAge: m.minimum_age ?? m.minimumAge,
    posterUrl: m.poster_url || m.posterUrl,
    trailerUrl: m.trailer_url || m.trailerUrl,
    status: m.status,
    language: m.language,
  };
}

/**
 * Lấy tất cả phim
 */
export async function getAllMovies() {
  // 👉 SAU NÀY MỞ LẠI:
  // const res = await apiFetch("/movies");
  // return (res.data || res).map(mapMovie);

  return MOCK_MOVIES.map(mapMovie);
}

/**
 * Lấy phim đang chiếu (8 phim mock)
 */
export async function getShowingMovies() {
  // 👉 SAU NÀY MỞ LẠI:
  // const res = await apiFetch("/movies?status=SHOWING");
  // return (res.data || res).map(mapMovie);

  return MOCK_MOVIES.filter((m) => m.status === "SHOWING").map(mapMovie);
}

/**
 * Lấy phim sắp chiếu (6 phim mock)
 */
export async function getUpcomingMovies() {
  // 👉 SAU NÀY MỞ LẠI:
  // const res = await apiFetch("/movies?status=UPCOMING");
  // return (res.data || res).map(mapMovie);

  return MOCK_MOVIES.filter((m) => m.status === "UPCOMING").map(mapMovie);
}

/**
 * Lấy chi tiết 1 phim theo id
 */
export async function getMovieById(id) {
  // 👉 SAU NÀY MỞ LẠI:
  // const res = await apiFetch(`/movies/${id}`);
  // return mapMovie(res.data || res);

  const found = MOCK_MOVIES.find((m) => String(m.movie_id) === String(id));
  return found ? mapMovie(found) : null;
}
