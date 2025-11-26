import AdminLayout from "@/layouts/AdminLayout";

export default function AdminDashboardPage() {
  return (
    <AdminLayout
      tag="ADMIN DASHBOARD"
      title="TỔNG QUAN HỆ THỐNG"
      subtitle="Theo dõi nhanh doanh thu, suất chiếu và hoạt động đặt vé."
    >
      {/* TODO: sau này gắn chart + số liệu thật từ reportService */}
      <section className="grid gap-6 md:grid-cols-3">
        {/* thẻ thống kê nhỏ */}
        <div className="rounded-3xl bg-gradient-to-br from-violet-600/30 via-fuchsia-600/20 to-emerald-600/30 border border-white/20 p-6 shadow-2xl">
          <p className="text-xs text-white/60 mb-2 font-semibold uppercase tracking-[0.2em]">
            DOANH THU HÔM NAY
          </p>
          <p className="text-3xl font-black text-emerald-300">
            0₫{/* gọi API thật sau */}
          </p>
          <p className="text-xs text-white/50 mt-2">
            Tổng thanh toán thành công trong ngày.
          </p>
        </div>

        <div className="rounded-3xl bg-white/5 border border-white/10 p-6 shadow-xl">
          <p className="text-xs text-white/60 mb-2 font-semibold uppercase tracking-[0.2em]">
            SUẤT CHIẾU HÔM NAY
          </p>
          <p className="text-3xl font-black text-cyan-300">0</p>
          <p className="text-xs text-white/50 mt-2">
            Tổng số suất chiếu đang mở bán.
          </p>
        </div>

        <div className="rounded-3xl bg-white/5 border border-white/10 p-6 shadow-xl">
          <p className="text-xs text-white/60 mb-2 font-semibold uppercase tracking-[0.2em]">
            VÉ ĐÃ BÁN
          </p>
          <p className="text-3xl font-black text-pink-300">0</p>
          <p className="text-xs text-white/50 mt-2">
            Tổng số ghế đã được đặt hôm nay.
          </p>
        </div>
      </section>

      {/* chỗ này sau làm thêm chart, top phim, top rạp,... */}
      <section className="rounded-3xl bg-white/5 border border-white/10 p-6 md:p-8 shadow-2xl">
        <h2 className="text-lg md:text-xl font-black mb-4">
          Hoạt động gần đây
        </h2>
        <p className="text-sm text-white/60">
          Sau này sẽ hiển thị danh sách các booking / payment mới nhất, hoặc top
          phim đang hot.
        </p>
      </section>
    </AdminLayout>
  );
}
