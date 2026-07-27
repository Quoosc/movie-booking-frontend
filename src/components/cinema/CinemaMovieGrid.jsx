import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MovieCard from "@/components/movies/MovieCard";
import { getCinemaMovies } from "@/api/movieService";
import { searchShowtimes } from "@/api/showtimeService";

function localDateValue(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function makeDates() {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return {
      value: localDateValue(date),
      weekday: index === 0 ? "Hôm nay" : date.toLocaleDateString("vi-VN", { weekday: "short" }),
      day: date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
    };
  });
}

function timeLabel(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "--:--"
    : date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function money(value) {
  return value == null ? "Đang cập nhật" : `Từ ${Number(value).toLocaleString("vi-VN")}đ`;
}

function groupByMovie(showtimes) {
  const groups = new Map();
  showtimes.forEach((showtime) => {
    const id = showtime.movie?.movieId;
    if (!groups.has(id)) groups.set(id, { movie: showtime.movie, showtimes: [] });
    groups.get(id).showtimes.push(showtime);
  });
  return Array.from(groups.values());
}

export default function CinemaMovieGrid({ cinema, activeTab }) {
  const navigate = useNavigate();
  const dates = useMemo(makeDates, []);
  const [selectedDate, setSelectedDate] = useState(dates[0].value);
  const [movies, setMovies] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isUpcoming = activeTab === "upcoming";
  const isSpecial = activeTab === "special";
  const isPricing = activeTab === "pricing";

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!cinema?.id) return;
      setLoading(true);
      setError("");
      try {
        if (isUpcoming) {
          const list = await getCinemaMovies(cinema.id, "UPCOMING");
          if (active) {
            setMovies(list || []);
            setShowtimes([]);
          }
          return;
        }

        const result = await searchShowtimes({
          cinemaId: cinema.id,
          date: selectedDate,
          perPage: 100,
        });
        if (active) {
          setShowtimes(result.items || []);
          setMovies([]);
        }
      } catch (requestError) {
        if (active) {
          setMovies([]);
          setShowtimes([]);
          setError(requestError?.message || "Không thể tải dữ liệu rạp.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [cinema?.id, isUpcoming, selectedDate]);

  const specialShowtimes = useMemo(
    () => showtimes.filter((item) => !["2D", "STANDARD"].includes(String(item.format || "").toUpperCase())),
    [showtimes]
  );
  const visibleShowtimes = isSpecial ? specialShowtimes : showtimes;
  const movieGroups = useMemo(() => groupByMovie(visibleShowtimes), [visibleShowtimes]);

  const pricingRows = useMemo(() => {
    const formats = new Map();
    showtimes.forEach((item) => {
      const format = item.format || "Tiêu chuẩn";
      const price = Number(item.minimumPrice);
      if (!Number.isFinite(price)) return;
      if (!formats.has(format)) formats.set(format, []);
      formats.get(format).push(price);
    });
    return Array.from(formats.entries()).map(([format, prices]) => ({
      format,
      minimum: Math.min(...prices),
      maximum: Math.max(...prices),
    }));
  }, [showtimes]);

  const datePicker = !isUpcoming && (
    <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
      {dates.map((date) => (
        <button
          key={date.value}
          onClick={() => setSelectedDate(date.value)}
          className={`min-w-[92px] rounded-xl border px-3 py-2 text-center transition ${
            selectedDate === date.value
              ? "border-[#43e1ff] bg-[#43e1ff]/15 text-white"
              : "border-white/10 bg-white/[0.04] text-white/65 hover:border-white/25"
          }`}
        >
          <span className="block text-[11px] font-bold uppercase">{date.weekday}</span>
          <span className="mt-1 block text-sm font-black">{date.day}</span>
        </button>
      ))}
    </div>
  );

  return (
    <section className="max-w-7xl mx-auto px-4 mt-8 mb-12">
      {datePicker}

      {loading ? (
        <p className="py-14 text-center text-sm text-white/70">Đang tải dữ liệu tại rạp...</p>
      ) : error ? (
        <p className="rounded-2xl border border-red-400/25 bg-red-500/10 px-5 py-4 text-center text-sm text-red-200">{error}</p>
      ) : isUpcoming ? (
        movies.length === 0 ? (
          <EmptyState message="Hiện chưa có phim sắp chiếu tại rạp này." />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6">
            {movies.map((movie) => <MovieCard key={movie.id} m={movie} />)}
          </div>
        )
      ) : isPricing ? (
        pricingRows.length === 0 ? (
          <EmptyState message="Chưa có dữ liệu giá cho ngày đã chọn." />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/15 bg-[#0b1638]/70 shadow-[0_16px_50px_rgba(0,0,0,0.7)]">
            <div className="border-b border-white/10 bg-gradient-to-r from-[#2d2558] via-[#122a56] to-[#20427a] px-5 py-5 md:px-8">
              <h2 className="text-xl font-extrabold uppercase text-white md:text-2xl">Giá vé theo lịch chiếu</h2>
              <p className="mt-1 text-xs text-white/70 md:text-sm">
                Dữ liệu giá khởi điểm thực tế ngày {selectedDate.split("-").reverse().join("/")} tại {cinema?.name}.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px]">
                <thead className="bg-white/[0.04] text-left text-xs uppercase tracking-[0.15em] text-white/60">
                  <tr><th className="px-6 py-4">Định dạng</th><th className="px-6 py-4">Giá thấp nhất</th><th className="px-6 py-4">Khoảng giá</th></tr>
                </thead>
                <tbody>
                  {pricingRows.map((row) => (
                    <tr key={row.format} className="border-t border-white/10">
                      <td className="px-6 py-4 font-bold">{row.format}</td>
                      <td className="px-6 py-4 text-[#43e1ff]">{row.minimum.toLocaleString("vi-VN")}đ</td>
                      <td className="px-6 py-4 text-white/75">
                        {row.minimum === row.maximum
                          ? `${row.minimum.toLocaleString("vi-VN")}đ`
                          : `${row.minimum.toLocaleString("vi-VN")}đ – ${row.maximum.toLocaleString("vi-VN")}đ`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : movieGroups.length === 0 ? (
        <EmptyState message={isSpecial ? "Không có suất định dạng đặc biệt trong ngày đã chọn." : "Không có suất chiếu trong ngày đã chọn."} />
      ) : (
        <div className="space-y-5">
          {movieGroups.map(({ movie, showtimes: movieShowtimes }) => (
            <article key={movie.movieId} className="grid overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] sm:grid-cols-[130px_1fr]">
              <button onClick={() => navigate(`/movie/${movie.movieId}?date=${selectedDate}`)} className="h-52 bg-white/5 sm:h-full">
                {movie.posterUrl ? <img src={movie.posterUrl} alt={movie.title} className="h-full w-full object-cover" /> : null}
              </button>
              <div className="p-5">
                <button onClick={() => navigate(`/movie/${movie.movieId}?date=${selectedDate}`)} className="text-left text-xl font-black hover:text-[#43e1ff]">{movie.title}</button>
                <p className="mt-1 text-xs text-white/50">{[movie.genre, movie.duration ? `${movie.duration} phút` : ""].filter(Boolean).join(" • ")}</p>
                <div className="mt-5 flex flex-wrap gap-2.5">
                  {movieShowtimes.map((showtime) => (
                    <button
                      key={showtime.showtimeId}
                      onClick={() => navigate(`/movie/${movie.movieId}?date=${selectedDate}&showtimeId=${showtime.showtimeId}`)}
                      className="rounded-xl border border-[#7b5cff]/40 bg-[#7b5cff]/10 px-3.5 py-2 text-left transition hover:border-[#43e1ff] hover:bg-[#43e1ff]/10"
                    >
                      <span className="block font-black">{timeLabel(showtime.startTime)}</span>
                      <span className="block text-[11px] text-white/55">{showtime.format} · {money(showtime.minimumPrice)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function EmptyState({ message }) {
  return <div className="rounded-3xl border border-dashed border-white/15 px-6 py-14 text-center text-sm text-white/60">{message}</div>;
}
