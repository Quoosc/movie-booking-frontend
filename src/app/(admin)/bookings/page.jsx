// src/app/(admin)/bookings/page.jsx
export default function AdminBookingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold tracking-[0.4em] uppercase text-cyan-400/70 mb-2">
          ADMIN • BOOKINGS
        </p>
        <h1 className="text-3xl md:text-4xl font-black tracking-[0.12em] uppercase">
          <span className="bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            QUẢN LÝ ĐẶT VÉ
          </span>
        </h1>
        <p className="mt-3 text-sm text-white/60 max-w-2xl">
          Theo dõi booking, trạng thái ghế, thanh toán, hoàn tiền theo schema v2.4
          (Bookings, Payments, Refunds, SeatLocks...).
        </p>
      </div>

      <div className="rounded-3xl bg-gradient-to-br from-[#1a0033]/80 via-[#0f001f] to-black/90 border border-white/10 backdrop-blur-xl shadow-2xl px-6 py-8 text-sm text-white/70">
        TODO: Bảng booking (mã, user/guest, phim, suất chiếu, tổng tiền, status)
        + filter theo ngày / rạp / trạng thái.
      </div>
    </div>
  );
}
