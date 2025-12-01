// src/app/(admin)/bookings/page.jsx
import { useMemo, useState } from "react";
import { AdminOrderService } from "@/api/adminservice";

const STATUS_COLORS = {
  PENDING: "bg-amber-400/10 text-amber-200 border-amber-400/40",
  PENDING_PAYMENT: "bg-amber-400/10 text-amber-200 border-amber-400/40",
  CONFIRMED: "bg-emerald-400/10 text-emerald-200 border-emerald-400/40",
  CANCELLED: "bg-red-500/10 text-red-200 border-red-500/40",
  EXPIRED: "bg-slate-500/10 text-slate-200 border-slate-500/40",
  REFUND_PENDING: "bg-sky-400/10 text-sky-200 border-sky-400/40",
  REFUNDED: "bg-emerald-400/10 text-emerald-200 border-emerald-400/40",
};

const PAYMENT_COLORS = {
  PENDING: "bg-amber-400/10 text-amber-200 border-amber-400/40",
  SUCCESS: "bg-emerald-400/10 text-emerald-200 border-emerald-400/40",
  FAILED: "bg-red-500/10 text-red-200 border-red-500/40",
  REFUND_PENDING: "bg-sky-400/10 text-sky-200 border-sky-400/40",
  REFUNDED: "bg-emerald-400/10 text-emerald-200 border-emerald-400/40",
  REFUND_FAILED: "bg-red-500/10 text-red-200 border-red-500/40",
};

export default function AdminBookingsPage() {
  const [searchId, setSearchId] = useState("");
  const [booking, setBooking] = useState(null);

  const [loading, setLoading] = useState(false);
  const [qrSaving, setQrSaving] = useState(false);
  const [qrDraft, setQrDraft] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // ==== handlers ====

  const handleSearch = async (e) => {
    e?.preventDefault();
    const id = searchId.trim();
    if (!id) return;

    setError(null);
    setSuccess(null);
    setBooking(null);

    try {
      setLoading(true);
      const res = await AdminOrderService.getBookingById(id);
      const data = res?.data ?? res ?? null;
      if (!data) {
        setError("Không tìm thấy dữ liệu booking.");
        return;
      }
      setBooking(data);
      setQrDraft(data.qrCodeUrl || "");
    } catch (err) {
      console.error("getBookingById error:", err);
      setError(
        err?.message || "Không tìm thấy booking. Vui lòng kiểm tra lại ID."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQr = async () => {
    if (!booking?.bookingId) return;

    try {
      setQrSaving(true);
      setError(null);
      setSuccess(null);

      const updated = await AdminOrderService.updateBookingQr(
        booking.bookingId,
        qrDraft.trim() || null
      );

      // merge lại state
      setBooking((prev) => ({
        ...(prev || {}),
        ...(updated || {}),
        qrCodeUrl: qrDraft.trim() || null,
      }));

      setSuccess("Cập nhật QR code cho booking thành công.");
    } catch (err) {
      console.error("updateBookingQr error:", err);
      setError(err?.message || "Cập nhật QR code thất bại.");
    } finally {
      setQrSaving(false);
    }
  };

  // ==== derived ====

  const moneySummary = useMemo(() => {
    if (!booking) return null;
    const subtotal = booking.subtotal ?? booking.totalAmount ?? 0;
    const discount = booking.discount ?? booking.totalDiscount ?? 0;
    const finalTotal =
      booking.total ?? booking.finalAmount ?? subtotal - discount;
    return { subtotal, discount, finalTotal };
  }, [booking]);

  const statusBadgeClass =
    STATUS_COLORS[(booking?.status || "").toUpperCase()] ||
    "bg-slate-500/10 text-slate-200 border-slate-500/40";

  const paymentBadgeClass =
    PAYMENT_COLORS[(booking?.paymentStatus || "").toUpperCase()] ||
    "bg-slate-500/10 text-slate-200 border-slate-500/40";

  const createdAt =
    booking?.createdAt && !Number.isNaN(Date.parse(booking.createdAt))
      ? new Date(booking.createdAt)
      : null;

  const showtimeStart =
    booking?.showtime?.startTime &&
    !Number.isNaN(Date.parse(booking.showtime.startTime))
      ? new Date(booking.showtime.startTime)
      : null;

  const customer =
    booking?.user || booking?.customer || booking?.guestInfo || booking?.guest;

  const seats = booking?.seats || booking?.bookingSeats || [];
  const snacks = booking?.snacks || booking?.bookingSnacks || [];

  const primaryPayment =
    booking?.payment ||
    (Array.isArray(booking?.payments) ? booking.payments[0] : null);

  // ==== render ====

  return (
    <div className="space-y-8 lg:space-y-10">
      {/* Header */}
      <header className="space-y-3">
        <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-cyan-400/70">
          ADMIN • BOOKINGS
        </p>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-[0.16em] uppercase">
          <span className="bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Tra cứu & quản lý Booking
          </span>
        </h1>
        <p className="text-xs md:text-sm text-white/60 max-w-2xl">
          Nhập mã booking để xem chi tiết ghế, bắp nước, trạng thái thanh toán
          và quản lý QR code check-in.
        </p>
      </header>

      {/* Search box */}
      <section className="relative rounded-3xl bg-gradient-to-br from-[#160033]/85 via-[#090019]/95 to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/15 via-transparent to-cyan-500/20 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400" />
        <form
          onSubmit={handleSearch}
          className="relative p-4 md:p-6 flex flex-col md:flex-row gap-4 md:items-end justify-between"
        >
          <div className="flex-1">
            <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
              Mã booking
            </label>
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Nhập bookingId (UUID)..."
              className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !searchId.trim()}
            className="inline-flex items-center justify-center rounded-2xl px-5 py-2.5 text-xs font-semibold tracking-[0.16em] uppercase bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-400 text-black shadow-lg shadow-purple-500/40 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all md:self-end"
          >
            {loading ? "Đang tìm..." : "Tìm booking"}
          </button>
        </form>
      </section>

      {/* Alerts */}
      {(error || success) && (
        <section className="space-y-3">
          {error && (
            <div className="rounded-2xl border border-red-500/60 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-2xl border border-emerald-500/60 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              {success}
            </div>
          )}
        </section>
      )}

      {/* Hint khi chưa có booking */}
      {!booking && !loading && !error && (
        <p className="text-xs md:text-sm text-white/50">
          • Hãy nhập mã booking phía trên để bắt đầu tra cứu.
        </p>
      )}

      {/* Nội dung chi tiết booking */}
      {!booking ? null : (
        <>
          {/* Summary cards */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              label="Trạng thái booking"
              value={booking.status || "UNKNOWN"}
              badgeClass={statusBadgeClass}
            />
            <SummaryCard
              label="Trạng thái thanh toán"
              value={
                booking.paymentStatus || primaryPayment?.status || "UNKNOWN"
              }
              badgeClass={paymentBadgeClass}
            />
            <SummaryCard
              label="Tổng tiền"
              value={
                moneySummary ? formatCurrency(moneySummary.finalTotal) : "—"
              }
              sub={
                moneySummary
                  ? `Gốc ${formatCurrency(
                      moneySummary.subtotal
                    )} • Giảm ${formatCurrency(moneySummary.discount)}`
                  : ""
              }
            />
            <SummaryCard
              label="Ngày tạo"
              value={
                createdAt
                  ? createdAt.toLocaleString("vi-VN")
                  : booking.createdAt || "—"
              }
              sub={booking.bookingId?.slice(0, 8) + "…"}
            />
          </section>

          {/* 3 cột: customer – showtime – QR */}
          <section className="grid lg:grid-cols-3 gap-6">
            {/* Customer info */}
            <Panel title="Thông tin khách / thành viên">
              {customer ? (
                <div className="space-y-2 text-xs text-white/80">
                  <InfoRow label="Tên">
                    {customer.username || customer.fullName || "—"}
                  </InfoRow>
                  <InfoRow label="Email">{customer.email || "—"}</InfoRow>
                  <InfoRow label="Số điện thoại">
                    {customer.phoneNumber || customer.phone || "—"}
                  </InfoRow>
                  {booking.membershipTier && (
                    <InfoRow label="Membership">
                      <span className="text-emerald-300 font-semibold">
                        {booking.membershipTier.name}{" "}
                      </span>
                      <span className="text-white/60">
                        ({booking.membershipTier.discountValue}
                        {booking.membershipTier.discountType === "PERCENT"
                          ? "%"
                          : "đ"}{" "}
                        off)
                      </span>
                    </InfoRow>
                  )}
                  {typeof booking.loyaltyPointsEarned === "number" && (
                    <InfoRow label="Điểm cộng thêm">
                      <span className="text-emerald-200 font-semibold">
                        {booking.loyaltyPointsEarned}
                      </span>
                    </InfoRow>
                  )}
                </div>
              ) : (
                <EmptyText />
              )}
            </Panel>

            {/* Showtime info */}
            <Panel title="Thông tin suất chiếu">
              {booking.showtime ? (
                <div className="space-y-2 text-xs text-white/80">
                  <InfoRow label="Phim">
                    {booking.showtime.movie?.title || "—"}
                  </InfoRow>
                  <InfoRow label="Rạp">
                    {booking.showtime.cinema?.name ||
                      booking.showtime.cinemaName ||
                      "—"}
                  </InfoRow>
                  <InfoRow label="Phòng">
                    {booking.showtime.room?.roomNumber ||
                      booking.showtime.roomNumber ||
                      "—"}
                  </InfoRow>
                  <InfoRow label="Định dạng">
                    {booking.showtime.format || "—"}
                  </InfoRow>
                  <InfoRow label="Giờ chiếu">
                    {showtimeStart
                      ? showtimeStart.toLocaleString("vi-VN")
                      : booking.showtime.startTime || "—"}
                  </InfoRow>
                </div>
              ) : (
                <EmptyText />
              )}
            </Panel>

            {/* QR code management */}
            <Panel title="QR check-in / vé điện tử">
              <div className="space-y-4 text-xs text-white/80">
                <p className="text-white/70">
                  Admin có thể dán URL ảnh QR (Cloudinary, S3, ...) để dùng cho
                  quầy check-in hoặc gửi lại cho khách.
                </p>

                <div className="space-y-2">
                  <label className="block text-[11px] font-semibold text-white/60 uppercase tracking-[0.18em]">
                    QR Code URL
                  </label>
                  <input
                    type="text"
                    value={qrDraft}
                    onChange={(e) => setQrDraft(e.target.value)}
                    placeholder="https://cdn.example.com/qr/booking-xxx.png"
                    className="w-full rounded-2xl bg-white/5 border border-white/15 px-3 py-2.5 text-xs text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                  />
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <span className="text-[11px] text-white/50">
                      Giá trị hiện tại:{" "}
                      {booking.qrCodeUrl ? (
                        <a
                          href={booking.qrCodeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-300 hover:text-cyan-200 underline underline-offset-2"
                        >
                          Mở QR
                        </a>
                      ) : (
                        <span className="text-white/40">chưa thiết lập</span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={handleSaveQr}
                      disabled={qrSaving}
                      className="rounded-2xl px-3 py-2 text-[11px] font-semibold tracking-[0.14em] uppercase bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400 text-black shadow-md shadow-purple-500/40 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                    >
                      {qrSaving ? "Đang lưu..." : "Lưu QR"}
                    </button>
                  </div>
                </div>
              </div>
            </Panel>
          </section>

          {/* Seats & Snacks */}
          <section className="grid lg:grid-cols-2 gap-6">
            {/* Seats list */}
            <Panel title="Ghế đã đặt">
              {seats.length === 0 ? (
                <EmptyText />
              ) : (
                <div className="overflow-x-auto -mx-2">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr className="text-[11px] uppercase tracking-[0.18em] text-white/60 border-b border-white/10">
                        <th className="py-2 px-2 text-left">Ghế</th>
                        <th className="py-2 px-2 text-left">Loại</th>
                        <th className="py-2 px-2 text-right">Giá</th>
                      </tr>
                    </thead>
                    <tbody>
                      {seats.map((s, idx) => {
                        const row = s.rowLabel || s.row || "?";
                        const num = s.seatNumber || s.number || s.seatNo || "?";
                        const type = s.seatType || s.type || "NORMAL";

                        const price =
                          s.price ??
                          s.finalPrice ??
                          s.priceBreakdown?.finalPrice ??
                          0;

                        return (
                          <tr
                            key={s.showtimeSeatId || s.seatId || idx}
                            className="border-b border-white/5"
                          >
                            <td className="py-2 px-2 whitespace-nowrap text-white">
                              {row}
                              {num}
                            </td>
                            <td className="py-2 px-2 text-white/70">
                              {type.toUpperCase()}
                            </td>
                            <td className="py-2 px-2 text-right text-emerald-200">
                              {formatCurrency(price)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Panel>

            {/* Snacks list */}
            <Panel title="Bắp nước / combo đi kèm">
              {snacks.length === 0 ? (
                <EmptyText />
              ) : (
                <div className="overflow-x-auto -mx-2">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr className="text-[11px] uppercase tracking-[0.18em] text-white/60 border-b border-white/10">
                        <th className="py-2 px-2 text-left">Sản phẩm</th>
                        <th className="py-2 px-2 text-right">SL</th>
                        <th className="py-2 px-2 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {snacks.map((sn, idx) => {
                        const name = sn.name || sn.snack?.name || "Không rõ";
                        const qty = sn.quantity ?? sn.qty ?? 1;
                        const unitPrice =
                          sn.price ?? sn.unitPrice ?? sn.snack?.price ?? 0;
                        const total = unitPrice * qty;
                        return (
                          <tr
                            key={sn.bookingSnackId || sn.snackId || idx}
                            className="border-b border-white/5"
                          >
                            <td className="py-2 px-2 text-white line-clamp-2">
                              {name}
                            </td>
                            <td className="py-2 px-2 text-right text-white/80">
                              {qty}
                            </td>
                            <td className="py-2 px-2 text-right text-emerald-200">
                              {formatCurrency(total)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Panel>
          </section>

          {/* Payment detail (đọc từ booking.payment / payments[0] nếu có) */}
          <section>
            <Panel title="Chi tiết thanh toán (primary)">
              {primaryPayment ? (
                <div className="grid md:grid-cols-2 gap-4 text-xs text-white/80">
                  <div className="space-y-2">
                    <InfoRow label="Payment ID">
                      {primaryPayment.paymentId || primaryPayment.id || "—"}
                    </InfoRow>
                    <InfoRow label="Gateway transaction">
                      {primaryPayment.transactionId ||
                        primaryPayment.momoTransId ||
                        primaryPayment.paypalOrderId ||
                        "—"}
                    </InfoRow>
                    <InfoRow label="Phương thức">
                      {primaryPayment.method ||
                        primaryPayment.paymentMethod ||
                        "—"}
                    </InfoRow>
                  </div>
                  <div className="space-y-2">
                    <InfoRow label="Trạng thái">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 border text-[11px] font-semibold uppercase ${
                          PAYMENT_COLORS[
                            (primaryPayment.status || "").toUpperCase()
                          ] ||
                          "bg-slate-500/10 text-slate-200 border-slate-500/40"
                        }`}
                      >
                        {primaryPayment.status || "UNKNOWN"}
                      </span>
                    </InfoRow>
                    <InfoRow label="Số tiền">
                      <span className="text-emerald-200 font-semibold">
                        {formatCurrency(
                          primaryPayment.amount ||
                            primaryPayment.totalAmount ||
                            moneySummary?.finalTotal ||
                            0
                        )}
                      </span>
                    </InfoRow>
                    {primaryPayment.paidAt && (
                      <InfoRow label="Thời gian thanh toán">
                        {new Date(primaryPayment.paidAt).toLocaleString(
                          "vi-VN"
                        )}
                      </InfoRow>
                    )}
                  </div>
                </div>
              ) : (
                <EmptyText text="Booking chưa có thông tin thanh toán (hoặc thanh toán thất bại / chưa khởi tạo)." />
              )}
            </Panel>
          </section>
        </>
      )}
    </div>
  );
}

/* ==== sub components ==== */

function SummaryCard({ label, value, sub, badgeClass }) {
  const content =
    badgeClass != null ? (
      <span
        className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${badgeClass}`}
      >
        {value}
      </span>
    ) : (
      <span className="text-xl md:text-2xl font-black text-white">{value}</span>
    );

  return (
    <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#12002b]/90 via-[#090017] to-black/95 backdrop-blur-xl shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 via-purple-500/15 to-pink-400/20 opacity-25 pointer-events-none" />
      <div className="absolute -top-6 -right-10 w-24 h-24 rounded-full bg-white/5 blur-2xl" />
      <div className="relative px-4 py-4 md:px-5 md:py-5 space-y-2">
        <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-white/60">
          {label}
        </p>
        {content}
        {sub && <p className="text-[11px] text-white/55 leading-snug">{sub}</p>}
      </div>
    </div>
  );
}

function Panel({ title, children }) {
  return (
    <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a0033]/90 via-[#0b001f] to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-600/15 via-transparent to-cyan-500/15 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400" />
      <div className="relative p-5 space-y-4">
        <h2 className="text-xs md:text-sm font-extrabold tracking-[0.2em] uppercase text-white/80">
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}

function InfoRow({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-[11px] text-white/50 uppercase tracking-[0.16em]">
        {label}
      </span>
      <span className="text-xs text-white/85 text-right">{children}</span>
    </div>
  );
}

function EmptyText({ text = "Không có dữ liệu." }) {
  return <p className="text-xs text-white/50 italic mt-1">{text}</p>;
}

function formatCurrency(value) {
  if (value == null || Number.isNaN(Number(value))) return "—";
  return Number(value).toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
  });
}
