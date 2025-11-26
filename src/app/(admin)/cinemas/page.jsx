// src/app/(admin)/cinemas/page.jsx
import { useEffect, useState } from "react";
// TODO: implement theo spec v2.4
// import { getAdminCinemas } from "@/api/admin/cinemaService";

export default function AdminCinemasPage() {
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        setLoading(true);
        setErr("");

        // TODO: gọi API thật
        // const res = await getAdminCinemas();
        // const list = Array.isArray(res?.data) ? res.data : res;
        // setCinemas(list ?? []);

        const mock = [
          {
            cinemaId: "1",
            name: "CinesVerse Quận 1",
            city: "TP. HCM",
            address: "123 Lê Lợi, Q.1",
            totalRooms: 7,
          },
          {
            cinemaId: "2",
            name: "CinesVerse Thủ Đức",
            city: "TP. HCM",
            address: "456 Võ Văn Ngân, TP. Thủ Đức",
            totalRooms: 5,
          },
        ];
        setCinemas(mock);
      } catch (e) {
        console.error(e);
        setErr("Không thể tải danh sách rạp.");
      } finally {
        setLoading(false);
      }
    };

    fetchCinemas();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.4em] uppercase text-cyan-400/70 mb-2">
            ADMIN • CINEMAS
          </p>
          <h1 className="text-3xl md:text-4xl font-black tracking-[0.12em] uppercase">
            <span className="bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              QUẢN LÝ RẠP
            </span>
          </h1>
          <p className="mt-3 text-sm text-white/60 max-w-2xl">
            Quản lý hệ thống rạp, phòng chiếu và địa chỉ theo database v2.4.
          </p>
        </div>

        <button className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-400 px-5 py-3 text-sm font-bold text-black shadow-lg shadow-emerald-500/30 hover:scale-[1.02] transition-transform">
          <span className="text-lg">＋</span>
          Thêm rạp mới
        </button>
      </div>

      {/* List */}
      <div className="rounded-3xl bg-gradient-to-br from-[#1a0033]/80 via-[#0f001f] to-black/90 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-white/60 text-sm">
            Đang tải danh sách rạp...
          </div>
        ) : err ? (
          <div className="py-16 text-center text-red-400 text-sm">{err}</div>
        ) : cinemas.length === 0 ? (
          <div className="py-16 text-center text-white/60 text-sm">
            Chưa có rạp nào.
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {cinemas.map((c) => (
              <div
                key={c.cinemaId}
                className="px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:bg-white/5/10 transition-colors"
              >
                <div>
                  <h3 className="text-base md:text-lg font-bold text-white">
                    {c.name}
                  </h3>
                  <p className="text-xs text-white/60 mt-1">
                    {c.address}
                  </p>
                  <p className="text-xs text-cyan-300 mt-1">
                    {c.city}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-white/5 border border-white/15 px-4 py-1.5 text-xs text-white/70">
                    {c.totalRooms ?? 0} phòng chiếu
                  </span>
                  <button className="rounded-xl bg-white/5 border border-white/15 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10">
                    Quản lý phòng
                  </button>
                  <button className="rounded-xl bg-white/5 border border-white/15 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10">
                    Sửa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
