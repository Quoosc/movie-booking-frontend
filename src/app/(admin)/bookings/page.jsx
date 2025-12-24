// src/app/(admin)/bookings/page.jsx
import { useMemo, useState } from "react";
import WarningModal from "@/components/shared/WarningModal";
import { AdminOrderService } from "@/api/adminservice";
import { toast } from "react-toastify";
import QRCode from "react-qr-code";

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

  const [qrPayloadDraft, setQrPayloadDraft] = useState("");

  const [error] = useState(null);
  const [success, setSuccess] = useState(null);

  // Warning modal state
  const [warning, setWarning] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });
  const showWarning = (message, title = "Lưu ý!", onConfirm = null) => {
    setWarning({ open: true, title, message, onConfirm });
  };
  const closeWarning = () =>
    setWarning({ open: false, title: "", message: "", onConfirm: null });

  // ==== handlers ====

  const handleSearch = async (e) => {
    e?.preventDefault();
    const id = searchId.trim();
    if (!id) {
      toast.info("Nhập bookingId để tìm.");
      return;
    }
setSuccess(null);
    setBooking(null);

    try {
      setLoading(true);

      const res = await AdminOrderService.getBookingById(id);
      const data = res?.data ?? res ?? null;

      if (!data) {
        const msg = "Không tìm thấy dữ liệu booking.";
toast.error(msg);
        return;
      }

      setBooking(data);

      // BE: qrPayload
      setQrPayloadDraft(data.qrPayload ?? "");

      toast.success("Tải booking thành công.");
    } catch (err) {
      console.error("getBookingById error:", err);
      const msg =
        err?.message || "Không tìm thấy booking. Vui lòng kiểm tra lại ID.";
toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Payload 
  const handleApplyQrPayload = () => {
    const next = qrPayloadDraft.trim();
    if (!next) {
      toast.info("qrPayload đang trống.");
      return;
    }

    showWarning(
      "Áp dụng qrPayload để render QR ở màn hình này? (KHÔNG lưu về backend)",
      "Lưu ý!",
      () => {
        setBooking((prev) => ({
          ...(prev || {}),
          qrPayload: next,
        }));
        setSuccess("Đã áp dụng qrPayload để render QR (local).");
        toast.success("Đã render QR từ qrPayload.");
        closeWarning();
      }
    );
  };

  // ==== derived ====

  const moneySummary = useMemo(() => {
    if (!booking) return null;

    const subtotal = Number(booking.totalPrice ?? 0);
    const discount = Number(booking.discountValue ?? 0);
    const finalTotal = Number(
      booking.finalPrice ?? Math.max(0, subtotal - discount)
    );

    return { subtotal, discount, finalTotal };
  }, [booking]);

  const statusBadgeClass =
    STATUS_COLORS[(booking?.status || "").toUpperCase()] ||
    "bg-slate-500/10 text-slate-200 border-slate-500/40";

  const paymentBadgeClass =
    PAYMENT_COLORS[(booking?.payment?.status || "").toUpperCase()] ||
    "bg-slate-500/10 text-slate-200 border-slate-500/40";

  const bookedAt =
    booking?.bookedAt && !Number.isNaN(Date.parse(booking.bookedAt))
      ? new Date(booking.bookedAt)
      : null;

  const showtimeStart =
    booking?.showtimeStartTime &&
    !Number.isNaN(Date.parse(booking.showtimeStartTime))
      ? new Date(booking.showtimeStartTime)
      : null;

  const paymentExpiresAt =
    booking?.paymentExpiresAt &&
    !Number.isNaN(Date.parse(booking.paymentExpiresAt))
      ? new Date(booking.paymentExpiresAt)
      : null;

  const seats = Array.isArray(booking?.seats) ? booking.seats : [];
  const snacks = Array.isArray(booking?.snacks) ? booking.snacks : [];

  const customer = booking?.customer || null;
  const payment = booking?.payment || null;

  const qrPayload = booking?.qrPayload ?? "";

  // ==== render ====

  return (
    <div className="space-y-8 lg:space-y-10">
      {/* Shared warning modal */}
      <WarningModal
        open={warning.open}
        title={warning.title}
        message={warning.message}
        onCancel={closeWarning}
        onConfirm={warning.onConfirm}
      />

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
          Nhập mã booking để xem chi tiết ghế, bắp nước, thanh toán và quản lý
          QR code check-in.
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

      {/* Alerts (optional – vẫn giữ nếu bạn muốn) */}
      {(error || success) && (
        <section className="space-y-3">
          {error && (
            <div className="rounded-2xl border border-red-500/60 bg-red-500/10 px-4 py-3 text-sm text-red-100 break-words">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-2xl border border-emerald-500/60 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100 break-words">
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
              label="Thanh toán"
              value={payment?.status || "—"}
              badgeClass={payment?.status ? paymentBadgeClass : null}
              sub={payment?.method ? `Method: ${payment.method}` : ""}
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
              label="Booking ID"
              value={booking.bookingId || "—"}
              monoValue
              sub={
                bookedAt
                  ? `BookedAt: ${bookedAt.toLocaleString("vi-VN")}`
                  : booking.bookedAt
                  ? `BookedAt: ${booking.bookedAt}`
                  : ""
              }
            />
          </section>

          {/* 3 cột: customer – showtime – QR */}
          <section className="grid lg:grid-cols-3 gap-6">
            {/* Customer info */}
            <Panel title="Thông tin khách / thành viên">
              {!customer ? (
                <EmptyText text="Không có dữ liệu khách hàng." />
              ) : (
                <div className="space-y-2 text-xs text-white/80">
                  <InfoRow label="Loại">{customer.type || "—"}</InfoRow>
                  <InfoRow label="User ID">{customer.userId || "—"}</InfoRow>
                  <InfoRow label="Username">{customer.username || "—"}</InfoRow>
                  <InfoRow label="Họ tên">{customer.fullName || "—"}</InfoRow>
                  <InfoRow label="Email">{customer.email || "—"}</InfoRow>
                  <InfoRow label="SĐT">{customer.phoneNumber || "—"}</InfoRow>

                  {customer.membershipTier ? (
                    <InfoRow label="Membership">
                      <span className="text-emerald-300 font-semibold">
                        {customer.membershipTier.name}
                      </span>{" "}
                      <span className="text-white/60">
                        ({customer.membershipTier.discountValue}
                        {customer.membershipTier.discountType === "PERCENTAGE"
                          ? "%"
                          : "đ"}
                        )
                      </span>
                    </InfoRow>
                  ) : (
                    <InfoRow label="Membership">—</InfoRow>
                  )}
                </div>
              )}
            </Panel>

            {/* Showtime info */}
            <Panel title="Thông tin suất chiếu">
              <div className="space-y-2 text-xs text-white/80">
                <InfoRow label="Phim">{booking.movieTitle || "—"}</InfoRow>
                <InfoRow label="Rạp">{booking.cinemaName || "—"}</InfoRow>
                <InfoRow label="Phòng">{booking.roomName ?? "—"}</InfoRow>
                <InfoRow label="Format">{booking.format || "—"}</InfoRow>
                <InfoRow label="Giờ chiếu">
                  {showtimeStart
                    ? showtimeStart.toLocaleString("vi-VN")
                    : booking.showtimeStartTime || "—"}
                </InfoRow>

                {paymentExpiresAt && (
                  <InfoRow label="Hết hạn TT">
                    {paymentExpiresAt.toLocaleString("vi-VN")}
                  </InfoRow>
                )}

                {booking.posterUrl && (
                  <div className="pt-2">
                    <div className="text-[11px] text-white/50 uppercase tracking-[0.16em] mb-2">
                      Poster
                    </div>
                    <img
                      src={booking.posterUrl}
                      alt={booking.movieTitle || "poster"}
                      className="w-24 h-32 object-cover rounded-2xl border border-white/10"
                    />
                  </div>
                )}
              </div>
            </Panel>

            {/* QR code: render from qrPayload */}
            <Panel title="QR check-in / vé điện tử">
              <div className="space-y-4 text-xs text-white/80">
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1"></div>
                </div>

                {/* QR preview */}
                {!qrPayload ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5/5 p-4 text-white/60 text-xs">
                    Không có qrPayload để render QR.
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/5/5 p-4">
                    <div className="rounded-2xl bg-white p-3 shadow-lg">
                      <QRCode value={qrPayload} size={170} />
                    </div>
                  </div>
                )}
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
                        const row = s.rowLabel ?? "?";
                        const num = s.seatNumber ?? "?";
                        const type = (s.seatType ?? "NORMAL").toUpperCase();
                        const price = s.price ?? null;

                        return (
                          <tr
                            key={`${row}-${num}-${idx}`}
                            className="border-b border-white/5"
                          >
                            <td className="py-2 px-2 whitespace-nowrap text-white font-mono">
                              {row}
                              {num}
                            </td>
                            <td className="py-2 px-2 text-white/70">{type}</td>
                            <td className="py-2 px-2 text-right text-emerald-200">
                              {price == null ? "—" : formatCurrency(price)}
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
                        <th className="py-2 px-2 text-right">Đơn giá</th>
                      </tr>
                    </thead>
                    <tbody>
                      {snacks.map((sn, idx) => {
                        const name = sn.name || "Không rõ";
                        const qty = sn.quantity ?? 1;
                        const unitPrice = sn.unitPrice ?? null;

                        return (
                          <tr
                            key={sn.snackId || idx}
                            className="border-b border-white/5"
                          >
                            <td className="py-2 px-2 text-white break-words">
                              {name}
                            </td>
                            <td className="py-2 px-2 text-right text-white/80 font-mono">
                              {qty}
                            </td>
                            <td className="py-2 px-2 text-right text-emerald-200">
                              {unitPrice == null
                                ? "—"
                                : formatCurrency(unitPrice)}
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

          {/* Payment detail */}
          <section>
            <Panel title="Chi tiết thanh toán (primary)">
              {!payment ? (
                <EmptyText text="Booking chưa có thông tin thanh toán." />
              ) : (
                <div className="grid md:grid-cols-2 gap-4 text-xs text-white/80">
                  <div className="space-y-2">
                    <InfoRow label="Payment ID">
                      {payment.paymentId || "—"}
                    </InfoRow>
                    <InfoRow label="Transaction ID">
                      {payment.transactionId || "—"}
                    </InfoRow>
                    <InfoRow label="Method">{payment.method || "—"}</InfoRow>
                  </div>

                  <div className="space-y-2">
                    <InfoRow label="Status">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 border text-[11px] font-semibold uppercase ${
                          PAYMENT_COLORS[
                            (payment.status || "").toUpperCase()
                          ] ||
                          "bg-slate-500/10 text-slate-200 border-slate-500/40"
                        }`}
                      >
                        {payment.status || "UNKNOWN"}
                      </span>
                    </InfoRow>

                    <InfoRow label="Amount">
                      <span className="text-emerald-200 font-semibold">
                        {formatCurrency(payment.amount ?? 0)}
                      </span>
                    </InfoRow>

                    <InfoRow label="Paid At">
                      {payment.paidAt
                        ? new Date(payment.paidAt).toLocaleString("vi-VN")
                        : "—"}
                    </InfoRow>
                  </div>
                </div>
              )}
            </Panel>
          </section>
        </>
      )}
    </div>
  );
}

/* ==== sub components ==== */

function SummaryCard({ label, value, sub, badgeClass, monoValue = false }) {
  const content =
    badgeClass != null ? (
      <span
        className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${badgeClass}`}
      >
        {value}
      </span>
    ) : (
      <span
        className={`text-sm md:text-base font-black text-white break-all ${
          monoValue ? "font-mono" : ""
        }`}
      >
        {value}
      </span>
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
        {sub ? (
          <p className="text-[11px] text-white/55 leading-snug break-all">
            {sub}
          </p>
        ) : null}
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
      <span className="text-xs text-white/85 text-right break-all">
        {children}
      </span>
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
