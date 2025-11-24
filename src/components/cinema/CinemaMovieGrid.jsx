// src/components/cinema/CinemaMovieGrid.jsx
import { useEffect, useState } from "react";
import MovieCard from "@/components/movies/MovieCard";
import { getCinemaMovies } from "@/api/movieService";

/**
 * Lưu ý:
 * - MOCK hiện tại chưa phân phim theo rạp -> mọi rạp dùng chung list.
 * - Sau fetch API thật /cinemas/{id}/movies?status=...
 *   thì chỉ cần thay logic trong useEffect.
 */
export default function CinemaMovieGrid({ cinema, activeTab }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  const isSpecial = activeTab === "special";

  useEffect(() => {
    if (isSpecial) {
      setMovies([]);
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        if (!cinema?.id) {
          setMovies([]);
          return;
        }

        const status = activeTab === "upcoming" ? "UPCOMING" : "SHOWING";

        const list = await getCinemaMovies(cinema.id, status);

        setMovies(list || []);
      } catch (e) {
        console.error("Failed to load cinema movies", e);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [cinema?.id, activeTab, isSpecial]);

  return (
    <section className="max-w-7xl mx-auto px-4 mt-8 mb-12">
      {isSpecial ? (
        <div className="rounded-3xl border border-dashed border-[#FFE700]/60 bg-[#12001f]/60 px-6 py-10 text-center shadow-[0_16px_50px_rgba(0,0,0,0.85)]">
          <p className="text-xs uppercase tracking-[0.22em] text-[#FFE700]/80 mb-2">
            Coming Soon
          </p>
          <h2 className="text-xl md:text-2xl font-extrabold text-white mb-2">
            Suất chiếu đặc biệt đang được cập nhật
          </h2>
          <p className="text-sm text-white/70 max-w-xl mx-auto">
            CinesVerse sẽ sớm mang đến các suất chiếu sớm, suất fan screening và
            những buổi premiere đặc biệt tại rạp{" "}
            <span className="font-semibold text-[#FFE700]">
              {cinema?.shortName || cinema?.name}
            </span>
            .
          </p>
        </div>
      ) : loading ? (
        <p className="text-center text-sm text-white/70">
          Đang tải danh sách phim tại rạp...
        </p>
      ) : movies.length === 0 ? (
        <p className="text-center text-sm text-white/70">
          Hiện chưa có phim nào phù hợp tại rạp này.
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
          {movies.map((m) => (
            <MovieCard key={m.id} m={m} />
          ))}
        </div>
      )}
    </section>
  );
}
