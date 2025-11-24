// src/api/movieService.js

// 👉 Sau này bật khi có backend thật:
// import { apiFetch, USE_MOCK } from "./fetchConfig";
import { getShowtimesByMovie } from "./showtimeService";
const CLOUDINARY_BASE_URL = import.meta.env.VITE_CLOUDINARY_BASE_URL || "";

const USE_MOCK = true;

const MOCK_MOVIES = [
  {
    movie_id: "1",
    title: "CỤC VÀNG CỦA TÔI (T13)",
    genre: "Hài, Gia đình",
    duration: 110,
    minimum_age: 13,
    poster_url:
      "https://scontent.fsgn5-10.fna.fbcdn.net/v/t1.15752-9/582262336_3271145863038912_7032492895580728179_n.jpg?stp=dst-jpg_s2048x2048_tt6&_nc_cat=107&ccb=1-7&_nc_sid=9f807c&_nc_ohc=YJEobKjfTW0Q7kNvwGNuxQ8&_nc_oc=AdkF-nvd6VVM1GI0CJjfGJeWs2Aak51Tl4SzUBO38Eeb-KuzAzXFpU5zqC_dOIjJIgs&_nc_zt=23&_nc_ht=scontent.fsgn5-10.fna&oh=03_Q7cD3wGb83n3mnT0hWzoO95JJv7R-B7DGkx4N9dwpNZ_s77PKQ&oe=694687A1",
    banner_url: "/public/movies/cuc-vang-cua-ngoai-poster.jpg",
    posterCloudinaryId: "movies/cuc_vang_cua_ngoai_poster",
    description:
      "Câu chuyện ấm áp, hài hước về tình cảm gia đình khi 'cục vàng' bất đắc dĩ về sống cùng ngoại.",
    trailer_url: "https://www.youtube.com/watch?v=_cj77qa_wMc",
    status: "SHOWING",
    language: "Việt",
    director: "Nguyễn Văn A",
    cast: "Diễn viên A, Diễn viên B",
    rating_avg: 4.2,
  },
  {
    movie_id: "2",
    title: "VÌ SAO ĐƯA EM TỚI",
    genre: "Kinh dị",
    duration: 105,
    minimum_age: 16,
    poster_url:
      "https://scontent.fsgn5-5.fna.fbcdn.net/v/t1.15752-9/582228216_1534144324441816_7296489216345483207_n.jpg?stp=dst-jpg_s2048x2048_tt6&_nc_cat=100&ccb=1-7&_nc_sid=9f807c&_nc_ohc=9fyozd2SbFIQ7kNvwGawE27&_nc_oc=AdmTBD8iRnL5AnFhgQD8oPZnVztVDc5vpoA71osq3h0wQk4LqXjE13HWS_bWfSKFSJw&_nc_zt=23&_nc_ht=scontent.fsgn5-5.fna&oh=03_Q7cD3wESplByRMz8p6kyBSo6xwiuJdml8aEPXmx6LCW6chhV0A&oe=6946A0EB",
    banner_url: "/public/movies/quai-thu-vo-hinh.jpg",
    posterCloudinaryId: "movies/quai_thu_vo_hinh",
    description:
      "Sinh vật vô hình gieo rắc kinh hoàng trong khu rừng cấm, nơi không ai sống sót trở về.",
    trailer_url: "https://www.youtube.com/watch?v=quai-thu-vo-hinh",
    status: "SHOWING",
    language: "Anh - Phụ đề Việt",
    director: "John Horror",
    cast: "Actor X, Actor Y",
    rating_avg: 4.6,
  },
  {
    movie_id: "3",
    title: "YÊU EM TỪ CÁI NHÌN ĐẦU TIÊN",
    genre: "Hành động, Thảm họa",
    duration: 124,
    minimum_age: 13,
    poster_url:
      "https://scontent.fsgn5-11.fna.fbcdn.net/v/t1.15752-9/582516822_1221489803376136_7539095796292573020_n.jpg?stp=dst-jpg_s2048x2048_tt6&_nc_cat=111&ccb=1-7&_nc_sid=9f807c&_nc_ohc=pq3A_mLJ2J4Q7kNvwGSgGuT&_nc_oc=Adn39smCaZp4A2p2z_3CYyORyDSg9vAhUS22WGizd8pbMnx2tf-Z53Cj7i1sPPYvHbk&_nc_zt=23&_nc_ht=scontent.fsgn5-11.fna&oh=03_Q7cD3wGFa763bauFix-WzVfS5AFD18z5QPlNiJFmi2M-gbZaeQ&oe=694682EE",
    banner_url: "/public/movies/godzilla.jpg",
    posterCloudinaryId: "movies/godzilla_minus_one",
    description:
      "Nhật Bản sau chiến tranh lại phải đối mặt với thảm họa Godzilla trong tuyệt vọng.",
    trailer_url: "https://www.youtube.com/watch?v=godzilla-minus-one",
    status: "SHOWING",
    language: "Nhật - Phụ đề Việt",
    director: "Takashi Yamazaki",
    cast: "Ryunosuke Kamiki, Minami Hamabe",
    rating_avg: 4.8,
  },
  {
    movie_id: "4",
    title: "TRÁI TIM NÀY DÀNH CHO EM ",
    genre: "Tâm lý, Tình cảm",
    duration: 98,
    minimum_age: 18,
    poster_url:
      "https://scontent.fsgn5-9.fna.fbcdn.net/v/t1.15752-9/566652044_2366659927123295_7669307562518199857_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=9f807c&_nc_ohc=Q6l0Dvl_P30Q7kNvwGD3U7j&_nc_oc=AdkPvKB3IwgfR84RcgwyBPmiqqJ7-55MsZleKq-b2bHk2ci4lpxHYQTU0lTPbEljJB8&_nc_zt=23&_nc_ht=scontent.fsgn5-9.fna&oh=03_Q7cD3wFP9ppAlaicFHDjXlZf0S18mElJX83gU3oCxD1VRKt1Dw&oe=6946A26C",
    banner_url: "/public/movies/trai-tim-que-quat-poster.jpg",
    posterCloudinaryId: "movies/trai_tim_que_quat",
    description:
      "Một chuyện tình méo mó, gai góc và ám ảnh giữa hai con người đầy tổn thương.",
    trailer_url: "https://www.youtube.com/watch?v=trai-tim-que-quat",
    status: "SHOWING",
    language: "Việt",
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
    posterCloudinaryId: "movies/badlands_co_hoi_cuoi_cung",
    description:
      "Một đặc vụ hết thời có cơ hội cuối cùng để cứu chuộc bản thân qua nhiệm vụ bất khả thi.",
    trailer_url: "https://www.youtube.com/watch?v=badlands",
    status: "SHOWING",
    language: "Anh - Phụ đề Việt",
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
    posterCloudinaryId: "movies/anh_hung_cuoi_cung",
    description:
      "Hành trình trở thành anh hùng của cậu bé yếu đuối giữa thế giới đầy hiểm nguy.",
    trailer_url: "https://www.youtube.com/watch?v=anh-hung-cuoi-cung",
    status: "SHOWING",
    language: "Anh - Phụ đề Việt",
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
    posterCloudinaryId: "movies/ke_san_bong_dem",
    description:
      "Kẻ sát nhân ẩn mình trong đêm tối, săn lùng những linh hồn lạc lối tại thành phố tội lỗi.",
    trailer_url: "https://www.youtube.com/watch?v=ke-san-bong-dem",
    status: "SHOWING",
    language: "Anh - Phụ đề Việt",
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
    posterCloudinaryId: "movies/dem_den_thanh_pho",
    description:
      "Một thanh tra trẻ lao vào thế giới ngầm để tìm ra sự thật về vụ mất tích bí ẩn.",
    trailer_url: "https://www.youtube.com/watch?v=dem-den-thanh-pho",
    status: "SHOWING",
    language: "Việt",
    director: "Nguyễn Đen",
    cast: "Diễn viên E, Diễn viên F",
    rating_avg: 4.0,
  },
  // ================== UPCOMING ==================
  {
    movie_id: "9",
    title: "NHÀ MA XÓ (T18)",
    genre: "Kinh dị",
    duration: 102,
    minimum_age: 18,
    poster_url: "/public/movies/nha-ma-xo.jpg",
    banner_url: "/public/movies/nha-ma-xo.jpg",
    posterCloudinaryId: "movies/nha_ma_xo",
    description: "Căn nhà bỏ hoang cùng những bí mật u ám chưa được giải mã.",
    trailer_url: "",
    status: "UPCOMING",
    language: "Việt",
    director: "Lê Bảo Trung",
    cast: "Mạc Văn Khoa, Khả Như, NSƯT Hữu Châu",
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
    posterCloudinaryId: "movies/tinh_nguoi_duyen_ma_2025",
    description:
      "Phiên bản mới của câu chuyện tình người - duyên ma kinh điển.",
    trailer_url: "",
    status: "UPCOMING",
    language: "Thái - Phụ đề Việt",
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
    posterCloudinaryId: "movies/hanh_tinh_diet_vong",
    description: "Cuộc chiến sinh tồn khi trái đất đứng trước bờ vực hủy diệt.",
    trailer_url: "",
    status: "UPCOMING",
    language: "Anh - Phụ đề Việt",
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
    posterCloudinaryId: "movies/midnight_special",
    description:
      "Cậu bé mang năng lực đặc biệt và chuyến chạy trốn trong đêm đầy bí ẩn.",
    trailer_url: "",
    status: "UPCOMING",
    language: "Anh - Phụ đề Việt",
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
    posterCloudinaryId: "movies/tinh_nguoi_duyen_ma_2",
    description: "Phần tiếp theo của chuyện tình người và hồn ma đầy nước mắt.",
    trailer_url: "",
    status: "UPCOMING",
    language: "Thái - Phụ đề Việt",
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
    posterCloudinaryId: "movies/the_gioi_khong_ngu",
    description:
      "Một thế giới tương lai nơi con người không còn ngủ và hậu quả kéo theo.",
    trailer_url: "",
    status: "UPCOMING",
    language: "Anh - Phụ đề Việt",
    director: "Cyber Director",
    cast: "Runner, Hacker",
    rating_avg: null,
  },
];

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

  // const res = await apiFetch(
  //   `/movies/search/title?title=${encodeURIComponent(keyword)}`
  // );
  // return (res.data || res).map(mapMovie);
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

  // const res = await apiFetch(
  //   `/movies/filter/status?status=${encodeURIComponent(normalized)}`
  // );
  // return (res.data || res).map(mapMovie);
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

  // const res = await apiFetch(
  //   `/movies/filter/genre?genre=${encodeURIComponent(keyword)}`
  // );
  // return (res.data || res).map(mapMovie);
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

// 👉 với MOCK: map rạp -> danh sách movieId đang chiếu
// (đã derive từ MOCK_SHOWTIMES_BY_MOVIE trong showtimeService)
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
      const idsForCinema = new Set(
        MOCK_CINEMA_MOVIES_SHOWING[cinemaId] || []
      );

      const list = MOCK_MOVIES.filter((m) => {
        const idStr = String(m.movie_id || m.movieId || m.id);
        const matchCinema = idsForCinema.has(idStr);
        const matchStatus =
          (m.status || "").toUpperCase() === "SHOWING";
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

  // 🚀 BE thật:
  // const res = await apiFetch(
  //   `/cinemas/${cinemaId}/movies?status=${encodeURIComponent(normalizedStatus)}`
  // );
  // const data = res.data || res;
  // return (data || []).map(mapMovie);
}


