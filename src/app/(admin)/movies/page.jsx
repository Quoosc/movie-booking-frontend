// src/app/(admin)/movies/page.jsx
import { useEffect, useState } from "react";
// TODO: implement theo spec v2.4
// import { getAdminMovies } from "@/api/admin/movieService";

const STATUS_BADGES = {
  SHOWING: {
    label: "Đang chiếu",
    className: "bg-emerald-400/10 text-emerald-300 border-emerald-400/40",
  },
  UPCOMING: {
    label: "Sắp chiếu",
    className: "bg-cyan-400/10 text-cyan-300 border-cyan-400/40",
  },
};

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setErr("");

        // TODO: gọi API thật theo v2.4
        // const res = await getAdminMovies();
        // const list = Array.isArray(res?.data) ? res.data : res;
        // setMovies(list ?? []);

        // Tạm mock cho đẹp UI
        const mock = [
          {
            movieId: "1",
            title: "AVENGERS: ENDGAME",
            status: "SHOWING",
            durationMinutes: 180,
            ageRating: "16+",
            releaseDate: "2025-11-01",
            language: "Phụ đề",
          },
          {
            movieId: "2",
            title: "SPIRITED AWAY",
            status: "UPCOMING",
            durationMinutes: 125,
            ageRating: "P",
            releaseDate: "2025-12-05",
            language: "Lồng tiếng",
          },
        ];
        setMovies(mock);
      } catch (error) {
        console.error(error);
        setErr("Không thể tải danh sách phim.");
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const filteredMovies = movies.filter((m) => {
    const matchSearch =
      !search ||
      m.title?.toLowerCase().includes(search.toLowerCase()) ||
      m.originalTitle?.toLowerCase().includes(search.toLowerCase());

    const matchStatus =
      statusFilter === "ALL" || m.status === statusFilter;

    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.4em] uppercase text-cyan-400/70 mb-2">
            ADMIN • MOVIES
          </p>
          <h1 className="text-3xl md:text-4xl font-black tracking-[0.12em] uppercase">
            <span className="bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              QUẢN LÝ PHIM
            </span>
          </h1>
          <p className="mt-3 text-sm text-white/60 max-w-2xl">
            Tạo, chỉnh sửa và quản lý trạng thái phim theo chuẩn database & API v2.4.
          </p>
        </div>

        <button
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-400 px-5 py-3 text-sm font-bold text-black shadow-lg shadow-emerald-500/30 hover:scale-[1.02] transition-transform"
        >
          <span className="text-lg">＋</span>
          Thêm phim mới
        </button>
      </div>

      {/* Filter + Search */}
      <div className="rounded-3xl bg-gradient-to-r from-white/5 via-white/5 to-transparent border border-white/10 backdrop-blur-xl p-5 shadow-2xl">
        <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div className="inline-flex rounded-2xl bg-white/5 border border-white/10 p-1.5">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`rounded-2xl px-4 py-2 text-xs md:text-sm font-bold transition-all
                ${
                  statusFilter === "ALL"
                    ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setStatusFilter("SHOWING")}
              className={`rounded-2xl px-4 py-2 text-xs md:text-sm font-bold transition-all
                ${
                  statusFilter === "SHOWING"
                    ? "bg-gradient-to-r from-emerald-500 to-cyan-400 text-black shadow"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
            >
              Đang chiếu
            </button>
            <button
              onClick={() => setStatusFilter("UPCOMING")}
              className={`rounded-2xl px-4 py-2 text-xs md:text-sm font-bold transition-all
                ${
                  statusFilter === "UPCOMING"
                    ? "bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
            >
              Sắp chiếu
            </button>
          </div>

          <div className="flex-1 flex items-center gap-3">
            <div className="relative flex-1">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm phim theo tên / tên gốc..."
                className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/70"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-xs">
                ⌕
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-3xl bg-gradient-to-br from-[#1a0033]/80 via-[#0f001f] to-black/90 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-white/70">
            Tổng:{" "}
            <span className="font-bold text-emerald-300">
              {filteredMovies.length}
            </span>{" "}
            phim
          </p>
        </div>

        {loading ? (
          <div className="py-16 text-center text-white/60 text-sm">
            Đang tải danh sách phim...
          </div>
        ) : err ? (
          <div className="py-16 text-center text-red-400 text-sm">
            {err}
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="py-16 text-center text-white/60 text-sm">
            Chưa có phim nào phù hợp bộ lọc.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-white/50 border-b border-white/10">
                  <th className="px-6 py-3 text-left font-medium">Phim</th>
                  <th className="px-4 py-3 text-left font-medium">Trạng thái</th>
                  <th className="px-4 py-3 text-left font-medium">Thời lượng</th>
                  <th className="px-4 py-3 text-left font-medium">Giới hạn tuổi</th>
                  <th className="px-4 py-3 text-left font-medium">Ngày khởi chiếu</th>
                  <th className="px-4 py-3 text-left font-medium">Ngôn ngữ</th>
                  <th className="px-4 py-3 text-right font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovies.map((m) => {
                  const badge =
                    STATUS_BADGES[m.status] ||
                    {
                      label: m.status || "UNKNOWN",
                      className:
                        "bg-slate-400/10 text-slate-200 border-slate-400/40",
                    };

                  const releaseDate = m.releaseDate
                    ? new Date(m.releaseDate)
                    : null;

                  return (
                    <tr
                      key={m.movieId}
                      className="border-b border-white/5 hover:bg-white/5/10 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {m.posterUrl && (
                            <img
                              src={m.posterUrl}
                              alt={m.title}
                              className="h-14 w-10 rounded-lg object-cover border border-white/10"
                            />
                          )}
                          <div>
                            <p className="font-semibold text-white">
                              {m.title}
                            </p>
                            {m.originalTitle && (
                              <p className="text-xs text-white/50">
                                {m.originalTitle}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-white/80">
                        {m.durationMinutes ? `${m.durationMinutes} phút` : "—"}
                      </td>

                      <td className="px-4 py-4 text-white/80">
                        {m.ageRating || "—"}
                      </td>

                      <td className="px-4 py-4 text-white/80">
                        {releaseDate
                          ? releaseDate.toLocaleDateString("vi-VN")
                          : "—"}
                      </td>

                      <td className="px-4 py-4 text-white/80">
                        {m.language || "—"}
                      </td>

                      <td className="px-4 py-4 text-right">
                        <div className="inline-flex gap-2">
                          <button className="rounded-xl bg-white/5 border border-white/15 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10">
                            Sửa
                          </button>
                          <button className="rounded-xl bg-red-500/10 border border-red-500/40 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/20">
                            Ẩn / Xoá
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
