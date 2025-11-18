// src/api/movieService.js

// 👉 Sau này bật khi có backend thật:
// import { apiFetch, USE_MOCK } from "./fetchConfig";
import { getShowtimesByMovie } from "./showtimeService";


const USE_MOCK = true;

const MOCK_MOVIES = [
  // ================== SHOWING (8 phim) ==================
  {
    movie_id: "1",
    title: "CỤC VÀNG CỦA NGOẠI (T13)",
    genre: "Hài, Gia đình",
    duration: 110,
    minimum_age: 13,
    poster_url: "/public/movies/cuc-vang-cua-ngoai-poster.jpg",
    banner_url: "/public/movies/cuc-vang-cua-ngoai-poster.jpg",
    description:
      "Câu chuyện ấm áp, hài hước về tình cảm gia đình khi 'cục vàng' bất đắc dĩ về sống cùng ngoại.",
    trailer_url: "https://www.youtube.com/watch?v=_cj77qa_wMc",
    status: "SHOWING",
    language: "Việt",
    release_date: "2025-10-01",
    director: "Nguyễn Văn A",
    cast: "Diễn viên A, Diễn viên B",
    rating_avg: 4.2,
  },
  {
    movie_id: "2",
    title: "QUÁI THÚ VÔ HÌNH: VÙNG ĐẤT CHẾT CHÓC (T16)",
    genre: "Kinh dị",
    duration: 105,
    minimum_age: 16,
    poster_url: "/public/movies/quai-thu-vo-hinh.jpg",
    banner_url: "/public/movies/quai-thu-vo-hinh.jpg",
    description:
      "Sinh vật vô hình gieo rắc kinh hoàng trong khu rừng cấm, nơi không ai sống sót trở về.",
    trailer_url: "https://www.youtube.com/watch?v=quai-thu-vo-hinh",
    status: "SHOWING",
    language: "Anh - Phụ đề Việt",
    release_date: "2025-10-05",
    director: "John Horror",
    cast: "Actor X, Actor Y",
    rating_avg: 4.6,
  },
  {
    movie_id: "3",
    title: "GODZILLA MINUS ONE (T13)",
    genre: "Hành động, Thảm hoạ",
    duration: 124,
    minimum_age: 13,
    poster_url: "/public/movies/godzilla.jpg",
    banner_url: "/public/movies/godzilla.jpg",
    description:
      "Nhật Bản sau chiến tranh lại phải đối mặt với thảm hoạ Godzilla trong tuyệt vọng.",
    trailer_url: "https://www.youtube.com/watch?v=godzilla-minus-one",
    status: "SHOWING",
    language: "Nhật - Phụ đề Việt",
    release_date: "2025-09-20",
    director: "Takashi Yamazaki",
    cast: "Ryunosuke Kamiki, Minami Hamabe",
    rating_avg: 4.8,
  },
  {
    movie_id: "4",
    title: "TRÁI TIM QUÈ QUẶT (T18)",
    genre: "Tâm lý, Tình cảm",
    duration: 98,
    minimum_age: 18,
    poster_url: "/public/movies/trai-tim-que-quat-poster.jpg",
    banner_url: "/public/movies/trai-tim-que-quat-poster.jpg",
    description:
      "Một chuyện tình méo mó, gai góc và ám ảnh giữa hai con người đầy tổn thương.",
    trailer_url: "https://www.youtube.com/watch?v=trai-tim-que-quat",
    status: "SHOWING",
    language: "Việt",
    release_date: "2025-09-28",
    director: "Trần Nghĩa",
    cast: "Diễn viên C, Diễn viên D",
    rating_avg: 4.1,
  },
  {
    movie_id: "5",
    title: "BADLANDS: CƠ HỘI CUỐI CÙNG (T16)",
    genre: "Hành động",
    duration: 115,
    minimum_age: 16,
    poster_url: "/public/movies/chet_choc.jpg",
    banner_url: "/public/movies/chet_choc.jpg",
    description:
      "Một đặc vụ hết thời có cơ hội cuối cùng để cứu chuộc bản thân qua nhiệm vụ bất khả thi.",
    trailer_url: "https://www.youtube.com/watch?v=badlands",
    status: "SHOWING",
    language: "Anh - Phụ đề Việt",
    release_date: "2025-10-10",
    director: "Michael Bay-lite",
    cast: "Ngôi sao 1, Ngôi sao 2",
    rating_avg: 3.9,
  },
  {
    movie_id: "6",
    title: "ANH HÙNG CUỐI CÙNG (T13)",
    genre: "Hành động, Phiêu lưu",
    duration: 120,
    minimum_age: 13,
    poster_url: "/public/movies/base64-17550626259371965999958.jpg",
    banner_url: "/public/movies/base64-17550626259371965999958.jpg",
    description:
      "Hành trình trở thành anh hùng của cậu bé yếu đuối giữa thế giới đầy hiểm nguy.",
    trailer_url: "https://www.youtube.com/watch?v=anh-hung-cuoi-cung",
    status: "SHOWING",
    language: "Anh - Phụ đề Việt",
    release_date: "2025-10-15",
    director: "Hero Director",
    cast: "Hero Boy, Mentor Man",
    rating_avg: 4.0,
  },
  {
    movie_id: "7",
    title: "KẺ SĂN BÓNG ĐÊM (T18)",
    genre: "Kinh dị, Giật gân",
    duration: 102,
    minimum_age: 18,
    poster_url: "/public/movies/300x450_16.jpg",
    banner_url: "/public/movies/300x450_16.jpg",
    description:
      "Kẻ sát nhân ẩn mình trong đêm tối, săn lùng những linh hồn lạc lối tại thành phố tội lỗi.",
    trailer_url: "https://www.youtube.com/watch?v=ke-san-bong-dem",
    status: "SHOWING",
    language: "Anh - Phụ đề Việt",
    release_date: "2025-10-18",
    director: "Dark Night",
    cast: "Actor Noir",
    rating_avg: 4.2,
  },
  {
    movie_id: "8",
    title: "ĐÊM ĐEN THÀNH PHỐ (T16)",
    genre: "Hành động, Tội phạm",
    duration: 110,
    minimum_age: 16,
    poster_url: "/public/movies/11265_103_100002.jpg",
    banner_url: "/public/movies/11265_103_100002.jpg",
    description:
      "Một thanh tra trẻ lao vào thế giới ngầm để tìm ra sự thật về vụ mất tích bí ẩn.",
    trailer_url: "https://www.youtube.com/watch?v=dem-den-thanh-pho",
    status: "SHOWING",
    language: "Việt",
    release_date: "2025-10-20",
    director: "Nguyễn Đen",
    cast: "Diễn viên E, Diễn viên F",
    rating_avg: 4.0,
  },

  // ================== UPCOMING (6 phim) ==================
  {
    movie_id: "9",
    title: "NHÀ MA XÓ (T18)",
    genre: "Kinh dị",
    duration: 102,
    minimum_age: 18,
    poster_url: "/public/movies/nha-ma-xo.jpg",
    banner_url: "/public/movies/nha-ma-xo.jpg",
    description: "Căn nhà bỏ hoang cùng những bí mật u ám chưa được giải mã.",
    trailer_url: "",
    status: "UPCOMING",
    language: "Việt",
    release_date: "2025-11-01",
    director: "Ghost Director",
    cast: "Ma Nữ, Nạn Nhân",
    rating_avg: null,
  },
  {
    movie_id: "10",
    title: "TÌNH NGƯỜI DUYÊN MA 2025 (T13)",
    genre: "Hài, Tình cảm",
    duration: 108,
    minimum_age: 13,
    poster_url: "/public/movies/tinh-nguoi-duyen-ma-2025.jpg",
    banner_url: "/public/movies/tinh-nguoi-duyen-ma-2025.jpg",
    description:
      "Phiên bản mới của câu chuyện tình người - duyên ma kinh điển.",
    trailer_url: "",
    status: "UPCOMING",
    language: "Thái - Phụ đề Việt",
    release_date: "2025-11-10",
    director: "Thai Director",
    cast: "Ma Nam, Chàng Trai",
    rating_avg: null,
  },
  {
    movie_id: "11",
    title: "HÀNH TINH DIỆT VONG (T13)",
    genre: "Khoa học viễn tưởng",
    duration: 118,
    minimum_age: 13,
    poster_url: "/public/movies/gemini-1080x1920_1641976136159.jpg",
    banner_url: "/public/movies/gemini-1080x1920_1641976136159.jpg",
    description: "Cuộc chiến sinh tồn khi trái đất đứng trước bờ vực hủy diệt.",
    trailer_url: "",
    status: "UPCOMING",
    language: "Anh - Phụ đề Việt",
    release_date: "2025-12-01",
    director: "Sci-fi Guy",
    cast: "Phi hành gia, AI",
    rating_avg: null,
  },
  {
    movie_id: "12",
    title: "MIDNIGHT SPECIAL (T16)",
    genre: "Giật gân, Bí ẩn",
    duration: 104,
    minimum_age: 16,
    poster_url:
      "/public/movies/1_5d10adc4-7517-442c-a3c6-0894cbf9e1e9_spo_600x.jpg",
    banner_url:
      "/public/movies/1_5d10adc4-7517-442c-a3c6-0894cbf9e1e9_spo_600x.jpg",
    description:
      "Cậu bé mang năng lực đặc biệt và chuyến chạy trốn trong đêm đầy bí ẩn.",
    trailer_url: "",
    status: "UPCOMING",
    language: "Anh - Phụ đề Việt",
    release_date: "2025-12-10",
    director: "Mystery Man",
    cast: "Kid, Dad",
    rating_avg: null,
  },
  {
    movie_id: "13",
    title: "TÌNH NGƯỜI DUYÊN MA 2 (T13)",
    genre: "Hài, Tình cảm",
    duration: 112,
    minimum_age: 13,
    poster_url: "/public/movies/tinh-nguoi-duyen-ma-2025.jpg",
    banner_url: "/public/movies/tinh-nguoi-duyen-ma-2025.jpg",
    description: "Phần tiếp theo của chuyện tình người và hồn ma đầy nước mắt.",
    trailer_url: "",
    status: "UPCOMING",
    language: "Thái - Phụ đề Việt",
    release_date: "2026-01-05",
    director: "Thai Director 2",
    cast: "Dàn cast cũ",
    rating_avg: null,
  },
  {
    movie_id: "14",
    title: "THẾ GIỚI KHÔNG NGỦ (T16)",
    genre: "Hành động, Viễn tưởng",
    duration: 111,
    minimum_age: 16,
    poster_url: "/public/movies/dn.jpg",
    banner_url: "/public/movies/dn.jpg",
    description:
      "Một thế giới tương lai nơi con người không còn ngủ và hậu quả kéo theo.",
    trailer_url: "",
    status: "UPCOMING",
    language: "Anh - Phụ đề Việt",
    release_date: "2026-02-01",
    director: "Cyber Director",
    cast: "Runner, Hacker",
    rating_avg: null,
  },
];

/* ======================= HELPERS ======================= */

// src/api/movieService.js

function mapMovie(m) {
  return {
    // Ưu tiên camelCase (BE mới), fallback snake_case (mock cũ)
    id: m.movieId || m.movie_id || m.id,
    title: m.title,
    posterUrl: m.posterUrl || m.poster_url,
    bannerUrl:
      m.bannerUrl ||
      m.banner_url ||
      m.posterUrl ||
      m.poster_url,
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
    posterCloudinaryId: m.posterCloudinaryId || m.poster_cloudinary_id,
  };
}


/* ==================== PUBLIC SERVICES ==================== */

/** GET /movies */
export async function getAllMovies() {
  if (USE_MOCK) {
    return MOCK_MOVIES.map(mapMovie);
  }

  // const res = await apiFetch("/movies");
  // return (res.data || res).map(mapMovie);
}

/** GET /movies?status=SHOWING */
export async function getShowingMovies() {
  if (USE_MOCK) {
    return MOCK_MOVIES.filter((m) => m.status === "SHOWING").map(mapMovie);
  }

  // const res = await apiFetch("/movies?status=SHOWING");
  // return (res.data || res).map(mapMovie);
}

/** GET /movies?status=UPCOMING */
export async function getUpcomingMovies() {
  if (USE_MOCK) {
    return MOCK_MOVIES.filter((m) => m.status === "UPCOMING").map(mapMovie);
  }

  // const res = await apiFetch("/movies?status=UPCOMING");
  // return (res.data || res).map(mapMovie);
}

/** GET /movies/{id} */
export async function getMovieById(id) {
  if (USE_MOCK) {
    const found = MOCK_MOVIES.find((m) => String(m.movie_id) === String(id));
    return found ? mapMovie(found) : null;
  }

  // const res = await apiFetch(`/movies/${id}`);
  // return mapMovie(res.data || res);
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
