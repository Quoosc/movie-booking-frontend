// src/app/(admin)/showtimes/page.jsx
import { useEffect, useState } from "react";
// TODO: implement theo spec v2.4
// import { getAdminShowtimes } from "@/api/admin/showtimeService";

export default function AdminShowtimesPage() {
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const fetchShowtimes = async () => {
      try {
        setLoading(true);
        setErr("");

        // TODO: gọi API thật
        // const res = await getAdminShowtimes();
        // const list = Array.isArray(res?.data) ? res.data : res;
        // setShowtimes(list ?? []);

        const mock = [
          {
            showtimeId: "1",
            movieTitle: "AVENGERS: ENDGAME",
            cinemaName: "CinesVerse Quận 1",
            roomName: "Room 1",
            startTime: "2025-11-26T19:30:00",
          },
          {
            showtimeId: "2",
            movieTitle: "SPIRITED AWAY",
            cinemaName: "CinesVerse Thủ Đức",
            roomName: "Room 3",
            startTime: "2025-11-27T14:00:00",
          },
        ];
        setShowtimes(mock);
      } catch (e) {
        console.error(e);
        setErr("Không thể tải danh sách suất chiếu.");
      } finally {
        setLoading(false);
      }
    };

    fetchShowtimes();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.4em] uppercase text-cyan-400/70 mb-2">
            ADMIN • SHOWTIMES
          </p>
          <h1 className="text-3xl md:text-4xl font-black tracking-[0.12em] uppercase">
            <span className="bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              QUẢN LÝ SUẤT CHIẾU
            </span>
          </h1>
          <p className="mt-3 text-sm text-white/60 max-w-2xl">
            Tạo suất chiếu, gắn phim, phòng chiếu và cấu hình loại vé theo API v2.4.
          </p>
        </div>

        <button className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-400 px-5 py-3 text-sm font-bold text-black shadow-lg shadow-emerald-500/30 hover:scale-[1.02] transition-transform">
          <span className="text-lg">＋</span>
          Thêm suất chiếu
        </button>
      </div>

      {/* List */}
      <div className="rounded-3xl bg-gradient-to-br from-[#1a0033]/80 via-[#0f001f] to-black/90 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-white/60 text-sm">
            Đang tải danh sách suất chiếu...
          </div>
        ) : err ? (
          <div className="py-16 text-center text-red-400 text-sm">{err}</div>
        ) : showtimes.length === 0 ? (
          <div className="py-16 text-center text-white/60 text-sm">
            Chưa có suất chiếu nào.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-white/50 border-b border-white/10">
                  <th className="px-6 py-3 text-left font-medium">Phim</th>
                  <th className="px-4 py-3 text-left font-medium">Rạp</th>
                  <th className="px-4 py-3 text-left font-medium">Phòng</th>
                  <th className="px-4 py-3 text-left font-medium">Suất chiếu</th>
                  <th className="px-4 py-3 text-right font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {showtimes.map((s) => {
                  const start = s.startTime
                    ? new Date(s.startTime)
                    : null;

                  return (
                    <tr
                      key={s.showtimeId}
                      className="border-b border-white/5 hover:bg-white/5/10 transition-colors"
                    >
                      <td className="px-6 py-4 text-white font-semibold">
                        {s.movieTitle}
                      </td>
                      <td className="px-4 py-4 text-white/80">
                        {s.cinemaName}
                      </td>
                      <td className="px-4 py-4 text-white/80">
                        {s.roomName}
                      </td>
                      <td className="px-4 py-4 text-white/80">
                        {start
                          ? start.toLocaleString("vi-VN", {
                              weekday: "short",
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "—"}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="inline-flex gap-2">
                          <button className="rounded-xl bg-white/5 border border-white/15 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10">
                            Sửa
                          </button>
                          <button className="rounded-xl bg-red-500/10 border border-red-500/40 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/20">
                            Huỷ / Ẩn
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
