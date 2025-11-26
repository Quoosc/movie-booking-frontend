// src/app/(admin)/snacks/page.jsx
import { useEffect, useState } from "react";
// TODO: implement theo spec v2.4
// import { getAdminSnacks } from "@/api/admin/snackService";

export default function AdminSnacksPage() {
  const [snacks, setSnacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const fetchSnacks = async () => {
      try {
        setLoading(true);
        setErr("");

        // TODO: gọi API thật
        // const res = await getAdminSnacks();
        // const list = Array.isArray(res?.data) ? res.data : res;
        // setSnacks(list ?? []);

        const mock = [
          {
            snackId: "1",
            name: "Combo 1 Bắp + 1 Nước",
            price: 79000,
            category: "COMBO",
            cinemaName: "Tất cả rạp",
            isActive: true,
          },
          {
            snackId: "2",
            name: "Pepsi (Lớn)",
            price: 35000,
            category: "DRINK",
            cinemaName: "CinesVerse Quận 1",
            isActive: true,
          },
        ];
        setSnacks(mock);
      } catch (e) {
        console.error(e);
        setErr("Không thể tải danh sách bắp nước.");
      } finally {
        setLoading(false);
      }
    };

    fetchSnacks();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.4em] uppercase text-cyan-400/70 mb-2">
            ADMIN • SNACKS
          </p>
          <h1 className="text-3xl md:text-4xl font-black tracking-[0.12em] uppercase">
            <span className="bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              QUẢN LÝ BẮP NƯỚC
            </span>
          </h1>
          <p className="mt-3 text-sm text-white/60 max-w-2xl">
            Cấu hình menu bắp nước cho từng rạp hoặc toàn hệ thống theo DB v2.4.
          </p>
        </div>

        <button className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-400 px-5 py-3 text-sm font-bold text-black shadow-lg shadow-emerald-500/30 hover:scale-[1.02] transition-transform">
          <span className="text-lg">＋</span>
          Thêm sản phẩm
        </button>
      </div>

      {/* List */}
      <div className="rounded-3xl bg-gradient-to-br from-[#1a0033]/80 via-[#0f001f] to-black/90 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-white/60 text-sm">
            Đang tải danh sách bắp nước...
          </div>
        ) : err ? (
          <div className="py-16 text-center text-red-400 text-sm">{err}</div>
        ) : snacks.length === 0 ? (
          <div className="py-16 text-center text-white/60 text-sm">
            Chưa có sản phẩm bắp nước nào.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-white/50 border-b border-white/10">
                  <th className="px-6 py-3 text-left font-medium">Tên</th>
                  <th className="px-4 py-3 text-left font-medium">Danh mục</th>
                  <th className="px-4 py-3 text-left font-medium">Rạp áp dụng</th>
                  <th className="px-4 py-3 text-left font-medium">Giá</th>
                  <th className="px-4 py-3 text-left font-medium">Trạng thái</th>
                  <th className="px-4 py-3 text-right font-medium">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {snacks.map((s) => (
                  <tr
                    key={s.snackId}
                    className="border-b border-white/5 hover:bg-white/5/10 transition-colors"
                  >
                    <td className="px-6 py-4 text-white font-semibold">
                      {s.name}
                    </td>
                    <td className="px-4 py-4 text-white/80">
                      {s.category || "—"}
                    </td>
                    <td className="px-4 py-4 text-white/80">
                      {s.cinemaName || "Tất cả rạp"}
                    </td>
                    <td className="px-4 py-4 text-emerald-300 font-bold">
                      {s.price?.toLocaleString("vi-VN")}₫
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${
                          s.isActive
                            ? "bg-emerald-400/10 text-emerald-300 border-emerald-400/40"
                            : "bg-slate-400/10 text-slate-300 border-slate-400/40"
                        }`}
                      >
                        {s.isActive ? "Đang bán" : "Ngưng bán"}
                      </span>
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
