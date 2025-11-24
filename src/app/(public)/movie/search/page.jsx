// src/app/(public)/movie/search/page.jsx
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import HomeButton from "@/components/shared/Buttons/HomeButton";
import MovieCard from "@/components/movies/MovieCard";

import {
  searchMoviesByTitle,
  filterMoviesByStatus,
  filterMoviesByGenre,
  getAllMovies,
} from "@/api/movieService";

const STATUS_OPTIONS = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "SHOWING", label: "Đang chiếu" },
  { value: "UPCOMING", label: "Sắp chiếu" },
];

export default function MovieSearchPage() {
  const [searchParams] = useSearchParams();
  const q = (searchParams.get("q") || "").trim();

  const [status, setStatus] = useState("ALL");
  const [genre, setGenre] = useState("ALL");
  const [genresOptions, setGenresOptions] = useState([]);

  const [baseMovies, setBaseMovies] = useState([]); //tập kết quả gốc
  const [movies, setMovies] = useState([]); // sau khi filter FE

  const [loading, setLoading] = useState(false);

  /* ================== LẤY LIST GENRE ================== */
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const all = await getAllMovies();
        const set = new Set();
        all.forEach((m) => {
          if (m.genre) {
            m.genre.split(",").forEach((g) => {
              const trimmed = g.trim();
              if (trimmed) set.add(trimmed);
            });
          }
        });
        setGenresOptions(Array.from(set));
      } catch (err) {
        console.error("Failed to load genres", err);
      }
    };

    fetchGenres();
  }, []);

  /* ================== BƯỚC 1: LẤY baseMovies (GỌI API) ==================
     - Có keyword q:       dùng /movies/search/title
     - Không có keyword:
        + status != ALL, genre = ALL  -> /movies/filter/status
        + status = ALL, genre != ALL  -> /movies/filter/genre
        + cả 2 != ALL                 -> giao 2 tập (status ∩ genre)
        + cả 2 = ALL                  -> getAllMovies
  ===================================================================== */
  useEffect(() => {
    const fetchBaseMovies = async () => {
      setLoading(true);
      try {
        const hasKeyword = !!q;

        if (hasKeyword) {
          // 🔍 Có từ khóa -> ưu tiên search theo title
          const list = await searchMoviesByTitle(q);
          setBaseMovies(list);
          return;
        }

        // 🔍 Không có keyword -> dùng API filter
        if (status !== "ALL" && genre === "ALL") {
          // chỉ lọc theo trạng thái
          const list = await filterMoviesByStatus(status);
          setBaseMovies(list);
        } else if (status === "ALL" && genre !== "ALL") {
          // chỉ lọc theo thể loại
          const list = await filterMoviesByGenre(genre);
          setBaseMovies(list);
        } else if (status !== "ALL" && genre !== "ALL") {
          // kết hợp cả status + genre -> giao 2 tập
          const [byStatus, byGenre] = await Promise.all([
            filterMoviesByStatus(status),
            filterMoviesByGenre(genre),
          ]);
          const byStatusMap = new Map(byStatus.map((m) => [m.id, m]));
          const intersection = byGenre.filter((m) => byStatusMap.has(m.id));
          setBaseMovies(intersection);
        } else {
          // không keyword, không filter -> lấy hết
          const list = await getAllMovies();
          setBaseMovies(list);
        }
      } catch (err) {
        console.error("Failed to fetch base movies", err);
        setBaseMovies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBaseMovies();
  }, [q, status, genre]);

  /* ================== BƯỚC 2: LỌC FE TRÊN baseMovies ==================
     - Luôn chạy khi: baseMovies đổi, hoặc status/genre đổi
     - Với case có keyword:
        + API chỉ search theo title
        + status / genre được áp dụng Ở ĐÂY (FE)
     - Với case không keyword:
        + baseMovies đã được filter 1 lần bằng API, bước này chỉ "confirm"
          lại filter cho thống nhất (không ảnh hưởng đúng sai).
  ====================================================================== */
  useEffect(() => {
    let result = [...baseMovies];

    if (status !== "ALL") {
      result = result.filter((m) => (m.status || "").toUpperCase() === status);
    }

    if (genre !== "ALL") {
      const target = genre.toLowerCase();
      result = result.filter((m) =>
        (m.genre || "").toLowerCase().includes(target)
      );
    }

    setMovies(result);
  }, [baseMovies, status, genre]);

  const resultLabel = q
    ? `Kết quả cho từ khóa: "${q}"`
    : "Tất cả phim trong hệ thống";

  return (
    <div
      className="
        min-h-screen flex flex-col
        bg-gradient-to-b from-[#050018] via-[#080023] to-[#050018]
        text-white relative overflow-hidden
      "
    >
      {/* neon background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-[8%] w-[520px] h-[520px] bg-[radial-gradient(circle_at_center,#7b5cff55,transparent)] blur-[110px]" />
        <div className="absolute top-[28%] right-[12%] w-[420px] h-[420px] bg-[radial-gradient(circle_at_center,#43e1ff40,transparent)] blur-[110px]" />
        <div className="absolute bottom-[-60px] left-1/3 w-[640px] h-[320px] bg-[radial-gradient(circle_at_center,#ff7af640,transparent)] blur-[130px]" />
      </div>

      <Navbar />

      <main className="relative z-10 flex-1 pb-10">
        {/* Header + filter bar */}
        <section className="max-w-7xl mx-auto px-4 pt-10">
          <div className="flex items-center justify-between gap-3">
            <HomeButton />
            <h1
              className="
    flex-1 text-center
    text-2xl md:text-3xl lg:text-4xl
    font-extrabold uppercase
    tracking-[0.15em]
    bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6]
    bg-clip-text text-transparent
    drop-shadow-[0_0_18px_rgba(123,92,255,0.7)]
  "
            >
              <span className="block">KẾT QUẢ TÌM KIẾM PHIM</span>
            </h1>
            <div className="hidden sm:block w-24" />
          </div>

          {/* ROW 2: bên trái là text kết quả, bên phải là filter */}
          <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-xs md:text-sm text-white/70">
              {resultLabel} •{" "}
              <span className="text-[#FFE700] font-semibold">
                {loading ? "Đang tải..." : `${movies.length} phim`}
              </span>
            </p>

            <div className="flex flex-wrap items-center gap-3 justify-start md:justify-end">
              {/* Filter trạng thái */}
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="
          w-full sm:w-48 px-3 py-2 rounded-xl text-xs md:text-sm
          bg-[#05001A]/80 border border-[#7b5cff33]
          text-[#E4E7FF] shadow-[0_0_0_1px_rgba(123,92,255,0.25)]
          focus:outline-none focus:ring-2 focus:ring-[#7b5cff] focus:border-[#7b5cff]
          transition
        "
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    className="bg-[#050018]"
                  >
                    {opt.label}
                  </option>
                ))}
              </select>

              {/* Filter thể loại */}
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="
          w-full sm:w-52 px-3 py-2 rounded-xl text-xs md:text-sm
          bg-[#05001A]/80 border border-[#7b5cff33]
          text-[#E4E7FF] shadow-[0_0_0_1px_rgba(123,92,255,0.25)]
          focus:outline-none focus:ring-2 focus:ring-[#7b5cff] focus:border-[#7b5cff]
          transition
        "
              >
                <option value="ALL" className="bg-[#050018]">
                  Tất cả thể loại
                </option>
                {genresOptions.map((g) => (
                  <option key={g} value={g} className="bg-[#050018]">
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Grid kết quả */}
        <section className="max-w-7xl mx-auto px-4 mt-8">
          {loading ? (
            <p className="text-center text-sm text-white/70">
              Đang tìm kiếm phim...
            </p>
          ) : movies.length === 0 ? (
            <p className="text-center text-sm text-white/70">
              Không tìm thấy phim nào phù hợp. Thử từ khóa khác hoặc thay đổi bộ
              lọc.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
              {movies.map((m) => (
                <MovieCard key={m.id} m={m} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
