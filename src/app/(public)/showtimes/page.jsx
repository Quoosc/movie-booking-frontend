import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCalendar, FiClock, FiMapPin, FiSearch, FiUsers } from "react-icons/fi";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { getAllCinemas } from "@/api/cinemaService";
import {
  getShowtimeSearchOptions,
  searchShowtimes,
} from "@/api/showtimeService";

function getLocalDateValue(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function formatMoney(value) {
  if (value === null || value === undefined) return "Đang cập nhật";
  return `${Number(value).toLocaleString("vi-VN")}đ`;
}

function formatTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

const initialFilters = {
  q: "",
  date: getLocalDateValue(),
  from: "",
  to: "",
  city: "",
  cinemaId: "",
  format: "",
  minSeats: "",
  page: 1,
  perPage: 50,
};

export default function ShowtimesPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState(initialFilters);
  const [cinemas, setCinemas] = useState([]);
  const [options, setOptions] = useState({ formats: [], cities: [] });
  const [result, setResult] = useState({ items: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([getAllCinemas(), getShowtimeSearchOptions()])
      .then(([cinemaList, filterOptions]) => {
        if (!active) return;
        setCinemas(cinemaList || []);
        setOptions(filterOptions);
      })
      .catch(() => {
        if (active) setOptions({ formats: [], cities: [] });
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const data = await searchShowtimes(filters);
        if (active) setResult(data);
      } catch (requestError) {
        if (active) {
          setResult({ items: [], pagination: {} });
          setError(requestError?.message || "Không thể tải lịch chiếu lúc này.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }, filters.q ? 300 : 0);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [filters]);

  const visibleCinemas = useMemo(() => {
    if (!filters.city) return cinemas;
    return cinemas.filter((cinema) => cinema.city === filters.city);
  }, [cinemas, filters.city]);

  const movieGroups = useMemo(() => {
    const groups = new Map();
    result.items.forEach((item) => {
      const movieId = item.movie?.movieId;
      if (!groups.has(movieId)) {
        groups.set(movieId, { movie: item.movie, cinemas: new Map() });
      }
      const group = groups.get(movieId);
      const cinemaId = item.cinema?.cinemaId;
      if (!group.cinemas.has(cinemaId)) {
        group.cinemas.set(cinemaId, {
          cinema: item.cinema,
          showtimes: [],
        });
      }
      group.cinemas.get(cinemaId).showtimes.push(item);
    });
    return Array.from(groups.values()).map((group) => ({
      ...group,
      cinemas: Array.from(group.cinemas.values()),
    }));
  }, [result.items]);

  const updateFilter = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value, page: 1 }));
  };

  const resetFilters = () => setFilters(initialFilters);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#050024] via-[#0b0630] to-[#020015] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[12%] h-[70vh] w-[150vw] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,#7b5cff70,transparent_48%)] opacity-80 blur-[110px] md:w-[110vw]" />
        <div className="absolute right-[-12rem] top-[36%] h-[28rem] w-[28rem] rounded-full bg-[#43e1ff]/10 blur-[120px]" />
        <div className="absolute bottom-[5%] left-[-10rem] h-[26rem] w-[26rem] rounded-full bg-[#ff7af6]/10 blur-[120px]" />
      </div>
      <Navbar />

      <main className="relative z-10 max-w-7xl mx-auto px-4 py-8 md:py-12">
        <section className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#9ca3ff]">
            Chọn nhanh, xem ngay
          </p>
          <h1 className="mt-2 inline-block bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6] bg-clip-text text-3xl font-black text-transparent drop-shadow-[0_0_26px_rgba(123,92,255,0.75)] md:text-5xl">
            Lịch chiếu phim
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-[#e5e7ff]/70 md:text-base">
            Tìm tất cả suất chiếu theo phim, khu vực, rạp, khung giờ và định dạng
            trong một màn hình.
          </p>
        </section>

        <section className="rounded-3xl border border-[#7b5cff]/25 bg-[#0b0a26]/80 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur-xl md:p-6">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <label className="relative lg:col-span-2">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3ff]/80" />
              <input
                value={filters.q}
                onChange={(event) => updateFilter("q", event.target.value)}
                placeholder="Tên phim, tên rạp hoặc địa chỉ"
                className="w-full rounded-xl border border-white/12 bg-[#050018]/90 py-3 pl-11 pr-4 text-sm text-[#e5e7ff] outline-none transition placeholder:text-[#9ca3ff]/55 focus:border-[#7b5cff] focus:ring-1 focus:ring-[#7b5cff]/70"
              />
            </label>

            <label className="relative">
              <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3ff]/80" />
              <input
                type="date"
                min={getLocalDateValue()}
                value={filters.date}
                onChange={(event) => updateFilter("date", event.target.value)}
                className="w-full rounded-xl border border-white/12 bg-[#050018]/90 py-3 pl-11 pr-4 text-sm text-[#e5e7ff] outline-none transition focus:border-[#7b5cff] focus:ring-1 focus:ring-[#7b5cff]/70 [color-scheme:dark]"
              />
            </label>

            <label className="relative">
              <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3ff]/80" />
              <select
                value={filters.city}
                onChange={(event) => {
                  setFilters((current) => ({
                    ...current,
                    city: event.target.value,
                    cinemaId: "",
                    page: 1,
                  }));
                }}
                className="w-full appearance-none rounded-xl border border-white/12 bg-[#050018]/90 py-3 pl-11 pr-4 text-sm text-[#e5e7ff] outline-none transition focus:border-[#7b5cff] focus:ring-1 focus:ring-[#7b5cff]/70"
              >
                <option value="">Tất cả khu vực</option>
                {options.cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </label>

            <select
              value={filters.cinemaId}
              onChange={(event) => updateFilter("cinemaId", event.target.value)}
              className="rounded-xl border border-white/12 bg-[#050018]/90 px-4 py-3 text-sm text-[#e5e7ff] outline-none transition focus:border-[#7b5cff] focus:ring-1 focus:ring-[#7b5cff]/70"
            >
              <option value="">Tất cả rạp</option>
              {visibleCinemas.map((cinema) => (
                <option key={cinema.id} value={cinema.id}>{cinema.name}</option>
              ))}
            </select>

            <select
              value={filters.format}
              onChange={(event) => updateFilter("format", event.target.value)}
              className="rounded-xl border border-white/12 bg-[#050018]/90 px-4 py-3 text-sm text-[#e5e7ff] outline-none transition focus:border-[#7b5cff] focus:ring-1 focus:ring-[#7b5cff]/70"
            >
              <option value="">Mọi định dạng</option>
              {options.formats.map((format) => (
                <option key={format} value={format}>{format}</option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-3">
              <label className="relative">
                <FiClock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3ff]/80" />
                <input
                  type="time"
                  value={filters.from}
                  onChange={(event) => updateFilter("from", event.target.value)}
                  aria-label="Từ giờ"
                  className="w-full rounded-xl border border-white/12 bg-[#050018]/90 py-3 pl-9 pr-2 text-sm text-[#e5e7ff] outline-none transition focus:border-[#7b5cff] focus:ring-1 focus:ring-[#7b5cff]/70 [color-scheme:dark]"
                />
              </label>
              <input
                type="time"
                value={filters.to}
                onChange={(event) => updateFilter("to", event.target.value)}
                aria-label="Đến giờ"
                className="w-full rounded-xl border border-white/12 bg-[#050018]/90 px-3 py-3 text-sm text-[#e5e7ff] outline-none transition focus:border-[#7b5cff] focus:ring-1 focus:ring-[#7b5cff]/70 [color-scheme:dark]"
              />
            </div>

            <label className="relative">
              <FiUsers className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3ff]/80" />
              <select
                value={filters.minSeats}
                onChange={(event) => updateFilter("minSeats", event.target.value)}
                className="w-full appearance-none rounded-xl border border-white/12 bg-[#050018]/90 py-3 pl-11 pr-3 text-sm text-[#e5e7ff] outline-none transition focus:border-[#7b5cff] focus:ring-1 focus:ring-[#7b5cff]/70"
              >
                <option value="">Không lọc số ghế</option>
                <option value="2">Còn ít nhất 2 ghế</option>
                <option value="4">Còn ít nhất 4 ghế</option>
                <option value="6">Còn ít nhất 6 ghế</option>
              </select>
            </label>
          </div>

          <div className="mt-4 flex items-center justify-between gap-4 text-sm">
            <span className="text-[#e5e7ff]/55">
              {loading ? "Đang tìm suất phù hợp..." : `${result.pagination?.total || 0} suất chiếu`}
            </span>
            <button onClick={resetFilters} className="font-semibold text-[#43e1ff] transition hover:text-[#ff7af6]">
              Xóa bộ lọc
            </button>
          </div>
        </section>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-400/25 bg-red-500/10 px-5 py-4 text-sm text-red-200">
            {error}
          </div>
        )}

        <section className="mt-7 space-y-5">
          {!loading && !error && movieGroups.length === 0 && (
            <div className="rounded-3xl border border-dashed border-white/15 py-16 text-center text-white/60">
              Không có suất chiếu phù hợp. Hãy đổi ngày hoặc nới bộ lọc.
            </div>
          )}

          {movieGroups.map(({ movie, cinemas: cinemaGroups }) => (
            <article key={movie.movieId} className="overflow-hidden rounded-3xl border border-white/12 bg-[#0b0a26]/85 shadow-[0_18px_55px_rgba(0,0,0,0.45)] backdrop-blur-md transition hover:border-[#7b5cff]/45">
              <div className="grid md:grid-cols-[180px_1fr]">
                <button
                  onClick={() => navigate(`/movie/${movie.movieId}?date=${filters.date}`)}
                  className="group relative h-64 md:h-full min-h-[260px] overflow-hidden bg-white/5"
                >
                  {movie.posterUrl ? (
                    <img src={movie.posterUrl} alt={movie.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  ) : (
                    <span className="flex h-full items-center justify-center text-sm text-white/40">Chưa có poster</span>
                  )}
                </button>

                <div className="p-5 md:p-7">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <button onClick={() => navigate(`/movie/${movie.movieId}?date=${filters.date}`)} className="bg-gradient-to-r from-[#e5e7ff] via-white to-[#b8bfff] bg-clip-text text-left text-xl font-black text-transparent transition hover:from-[#43e1ff] hover:via-[#7b5cff] hover:to-[#ff7af6] md:text-2xl">
                        {movie.title}
                      </button>
                      <p className="mt-2 text-sm text-white/55">
                        {[movie.genre, movie.duration ? `${movie.duration} phút` : "", movie.language].filter(Boolean).join(" • ")}
                      </p>
                    </div>
                    {movie.minimumAge && (
                      <span className="rounded-lg border border-amber-300/35 bg-amber-300/10 px-2.5 py-1 text-xs font-black text-amber-200">
                        T{movie.minimumAge}
                      </span>
                    )}
                  </div>

                  <div className="mt-6 space-y-5">
                    {cinemaGroups.map(({ cinema, showtimes }) => (
                      <div key={cinema.cinemaId} className="border-t border-white/10 pt-5 first:border-0 first:pt-0">
                        <div className="mb-3">
                          <h2 className="font-bold text-white">{cinema.name}</h2>
                          <p className="mt-1 text-xs text-white/45">{[cinema.address, cinema.district, cinema.city].filter(Boolean).join(", ")}</p>
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                          {showtimes.map((showtime) => (
                            <button
                              key={showtime.showtimeId}
                              onClick={() => navigate(`/movie/${movie.movieId}?date=${filters.date}&showtimeId=${showtime.showtimeId}`)}
                              className="min-w-[108px] rounded-xl border border-[#7b5cff]/40 bg-[#050018]/85 px-3 py-2.5 text-left shadow-[0_0_16px_rgba(123,92,255,0.12)] transition hover:-translate-y-0.5 hover:border-[#43e1ff] hover:bg-[#7b5cff]/20 hover:shadow-[0_0_20px_rgba(123,92,255,0.35)]"
                            >
                              <span className="block text-base font-black">{formatTime(showtime.startTime)}</span>
                              <span className="mt-0.5 block text-[11px] text-white/55">{showtime.format} · {formatMoney(showtime.minimumPrice)}</span>
                              <span className="mt-0.5 block text-[10px] text-emerald-300/80">Còn {showtime.availableSeats} ghế</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
