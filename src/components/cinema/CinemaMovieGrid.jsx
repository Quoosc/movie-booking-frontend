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
  const isPricing = activeTab === "pricing";

  const priceRows = [
    { label: "Ghế thường 2D", weekday: "75.000đ", weekend: "90.000đ" },
    { label: "Ghế VIP 2D", weekday: "95.000đ", weekend: "115.000đ" },
    { label: "Ghế đôi 2D", weekday: "190.000đ", weekend: "230.000đ" },
    { label: "Suất 3D", weekday: "110.000đ", weekend: "135.000đ" },
  ];

  useEffect(() => {
    if (isSpecial || isPricing) {
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
  }, [cinema?.id, activeTab, isSpecial, isPricing]);

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
      ) : isPricing ? (
        <div className="rounded-2xl border border-white/15 bg-[#0b1638]/70 overflow-hidden shadow-[0_16px_50px_rgba(0,0,0,0.7)]">
          <div className="px-5 md:px-8 py-5 border-b border-white/10 bg-gradient-to-r from-[#2d2558] via-[#122a56] to-[#20427a]">
            <h2 className="text-xl md:text-2xl font-extrabold uppercase text-white tracking-[0.03em]">
              Bảng giá vé tham khảo
            </h2>
            <p className="text-xs md:text-sm text-white/75 mt-1">
              Áp dụng tại {cinema?.shortName || cinema?.name}. Giá có thể thay
              đổi theo thời điểm và chương trình ưu đãi.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px]">
              <thead className="bg-white/[0.04]">
                <tr>
                  <th className="text-left px-5 md:px-8 py-4 text-xs uppercase tracking-[0.18em] text-white/70">
                    Loại vé
                  </th>
                  <th className="text-left px-5 md:px-8 py-4 text-xs uppercase tracking-[0.18em] text-white/70">
                    Thứ 2 - Thứ 6
                  </th>
                  <th className="text-left px-5 md:px-8 py-4 text-xs uppercase tracking-[0.18em] text-white/70">
                    Thứ 7 - Chủ nhật
                  </th>
                </tr>
              </thead>
              <tbody>
                {priceRows.map((row) => (
                  <tr key={row.label} className="border-t border-white/8">
                    <td className="px-5 md:px-8 py-4 text-sm md:text-base font-semibold text-white">
                      {row.label}
                    </td>
                    <td className="px-5 md:px-8 py-4 text-sm md:text-base text-white/90">
                      {row.weekday}
                    </td>
                    <td className="px-5 md:px-8 py-4 text-sm md:text-base text-white/90">
                      {row.weekend}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
