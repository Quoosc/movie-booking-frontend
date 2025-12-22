// src/app/(admin)/orders/page.jsx
import { useEffect, useMemo, useState } from "react";
import WarningModal from "@/components/shared/WarningModal";
import { AdminOrderService } from "@/api/adminservice";
import { toast } from "react-toastify";

const PAYMENT_STATUS_OPTIONS = [
  "PENDING",
  "SUCCESS",
  "FAILED",
  "REFUND_PENDING",
  "REFUNDED",
  "REFUND_FAILED",
];

const PAYMENT_METHOD_OPTIONS = ["MOMO", "PAYPAL"];

export default function AdminOrdersPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  // filters
  const [bookingIdFilter, setBookingIdFilter] = useState("");
  const [userIdFilter, setUserIdFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  // refund modal
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [refundPayment, setRefundPayment] = useState(null);
  const [refundReason, setRefundReason] = useState("");
  const [refundSubmitting, setRefundSubmitting] = useState(false);

  // Shared warning modal for confirm steps
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

  // booking detail modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [bookingDetail, setBookingDetail] = useState(null);

  const modalOpen = refundModalOpen || detailModalOpen || warning.open;

  // ================= API =================

  const buildSearchParams = () => {
    const filters = {};
    if (bookingIdFilter.trim()) filters.bookingId = bookingIdFilter.trim();
    if (userIdFilter.trim()) filters.userId = userIdFilter.trim();
    if (statusFilter !== "ALL") filters.status = statusFilter;
    if (methodFilter !== "ALL") filters.method = methodFilter;
    if (startDateFilter) filters.startDate = startDateFilter;
    if (endDateFilter) filters.endDate = endDateFilter;
    return filters;
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);

      const filters = buildSearchParams();
      const data = await AdminOrderService.searchPayments(filters);
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setPayments(list);
    } catch (err) {
      console.error("searchPayments error:", err);
      toast.error(
        err?.message || "Không tải được danh sách đơn hàng / thanh toán."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResetFilters = () => {
    setBookingIdFilter("");
    setUserIdFilter("");
    setStatusFilter("ALL");
    setMethodFilter("ALL");
    setStartDateFilter("");
    setEndDateFilter("");
    toast.info("Đã xóa bộ lọc.");
  };

  // ===== Booking detail =====

  const openDetailModal = async (payment) => {
    if (!payment?.bookingId) {
      toast.error("Payment này không gắn với bookingId.");
      return;
    }
    setSelectedPayment(payment);
    setDetailModalOpen(true);
    setBookingDetail(null);
    setDetailLoading(true);

    try {
      const res = await AdminOrderService.getBookingById(payment.bookingId);
      const detail = res?.data || res || null;
      setBookingDetail(detail);
    } catch (err) {
      console.error("getBookingById error:", err);
      toast.error(err?.message || "Không tải được chi tiết booking.");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedPayment(null);
    setBookingDetail(null);
  };

  // ===== Refund flow =====

  const openRefundModal = (payment) => {
    setRefundPayment(payment);
    setRefundReason("");
    setRefundModalOpen(true);
  };

  const closeRefundModal = () => {
    if (refundSubmitting) return;
    setRefundModalOpen(false);
    setRefundPayment(null);
    setRefundReason("");
  };

  const handleSubmitRefund = async (e) => {
    e.preventDefault();
    if (!refundPayment?.paymentId) return;

    if (!refundReason.trim()) {
      toast.error("Vui lòng nhập lý do hoàn tiền.");
      return;
    }

    const confirmRefund = async () => {
      try {
        setRefundSubmitting(true);

        await AdminOrderService.requestRefund(
          refundPayment.paymentId,
          refundReason.trim()
        );

        toast.success("Đã gửi yêu cầu hoàn tiền (REFUND) cho giao dịch này.");

        setPayments((prev) =>
          prev.map((p) =>
            p.paymentId === refundPayment.paymentId
              ? { ...p, status: "REFUND_PENDING" }
              : p
          )
        );

        closeRefundModal();
      } catch (err) {
        console.error("requestRefund error:", err);
        toast.error(err?.message || "Gửi yêu cầu hoàn tiền thất bại.");
      } finally {
        setRefundSubmitting(false);
        closeWarning();
      }
    };

    showWarning(
      "Xác nhận gửi yêu cầu hoàn tiền cho giao dịch này?",
      "Lưu ý!",
      confirmRefund
    );
  };

  // ================= DERIVED DATA =================

  const stats = useMemo(() => {
    const total = payments.length;
    let success = 0,
      pending = 0,
      refunded = 0,
      failed = 0;

    payments.forEach((p) => {
      const st = (p.status || "").toUpperCase();
      if (st === "SUCCESS") success++;
      else if (st === "PENDING") pending++;
      else if (st === "REFUNDED") refunded++;
      else if (st === "FAILED" || st === "REFUND_FAILED") failed++;
    });

    return { total, success, pending, refunded, failed };
  }, [payments]);

  const filteredPayments = useMemo(() => payments, [payments]);

  // ================= HELPERS =================

  const displayAmount = (p) => {
    const raw = p.amount ?? p.totalAmount ?? p.finalAmount ?? p.payAmount ?? 0;
    return Number(raw).toLocaleString("vi-VN") + " đ";
  };

  const displayMethod = (p) => p.method || p.paymentMethod || "";

  const displayStatus = (p) => (p.status || "").toUpperCase();

  const displayDateTime = (iso) => {
    if (!iso || iso === "null" || iso === "undefined") return null;
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleString("vi-VN");
  };

  const canRefund = (p) => displayStatus(p) === "SUCCESS";

  // ================= RENDER =================

  return (
    <div
      className={`space-y-8 lg:space-y-10 ${
        modalOpen ? "h-screen overflow-hidden" : ""
      }`}
    >
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
          ADMIN • ORDERS
        </p>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-[0.16em] uppercase">
          <span className="bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Quản lý đơn hàng
          </span>
        </h1>
        <p className="text-xs md:text-sm text-white/60 max-w-2xl">
          Tra cứu payments, xem chi tiết booking và gửi yêu cầu hoàn tiền cho
          các giao dịch của hệ thống CinesVerse.
        </p>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          label="Tổng giao dịch"
          value={stats.total}
          gradient="from-cyan-400/80 via-cyan-500/70 to-emerald-400/80"
        />
        <StatCard
          label="Thành công"
          value={stats.success}
          gradient="from-emerald-400/80 via-teal-400/80 to-cyan-400/80"
        />
        <StatCard
          label="Đang xử lý"
          value={stats.pending}
          gradient="from-amber-400/80 via-yellow-500/80 to-orange-400/80"
        />
        <StatCard
          label="Đã hoàn tiền"
          value={stats.refunded}
          gradient="from-violet-500/80 via-fuchsia-500/80 to-pink-400/80"
        />
        <StatCard
          label="Thất bại"
          value={stats.failed}
          gradient="from-red-500/80 via-rose-500/80 to-orange-500/80"
        />
      </section>

      {/* Filters */}
      <section className="relative rounded-3xl bg-gradient-to-br from-[#160033]/85 via-[#090019]/95 to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/15 via-transparent to-cyan-500/20 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400" />

        <div className="relative p-4 md:p-6 space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                Booking ID
              </label>
              <input
                type="text"
                value={bookingIdFilter}
                onChange={(e) => setBookingIdFilter(e.target.value)}
                placeholder="Nhập bookingId..."
                className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                  Trạng thái
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="cv-select-dark w-full rounded-full bg-gradient-to-r from-[#1b0b3a] via-[#14002b] to-[#050012]
                  border border-cyan-400/60 px-3 py-2.5 text-sm font-semibold text-white
                  shadow-[0_0_0_1px_rgba(15,23,42,0.9)]
                  focus:outline-none focus:ring-2 focus:ring-cyan-400/70 focus:border-transparent
                  transition-all"
                >
                  <option value="ALL">Tất cả</option>
                  {PAYMENT_STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                  Phương thức
                </label>
                <select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value)}
                  className="cv-select-dark w-full rounded-full bg-gradient-to-r from-[#1b0b3a] via-[#14002b] to-[#050012]
                  border border-cyan-400/60 px-3 py-2.5 text-sm font-semibold text-white
                  shadow-[0_0_0_1px_rgba(15,23,42,0.9)]
                  focus:outline-none focus:ring-2 focus:ring-cyan-400/70 focus:border-transparent
                  transition-all"
                >
                  <option value="ALL">Tất cả</option>
                  {PAYMENT_METHOD_OPTIONS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-[2fr,auto] gap-4 md:items-end">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                  Từ ngày
                </label>
                <input
                  type="datetime-local"
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                  className="w-full rounded-2xl bg-white/5 border border-white/15 px-3 py-2.5 text-sm text-white focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                  Đến ngày
                </label>
                <input
                  type="datetime-local"
                  value={endDateFilter}
                  onChange={(e) => setEndDateFilter(e.target.value)}
                  className="w-full rounded-2xl bg-white/5 border border-white/15 px-3 py-2.5 text-sm text-white focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                type="button"
                onClick={handleResetFilters}
                disabled={loading}
                className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-xs font-semibold tracking-[0.16em] uppercase bg-white/5 border border-white/20 text-white hover:bg-white/10 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                Xóa bộ lọc
              </button>
              <button
                type="button"
                onClick={fetchPayments}
                disabled={loading}
                className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-xs font-semibold tracking-[0.16em] uppercase bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-400 text-black shadow-lg shadow-purple-500/40 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {loading ? "Đang tìm..." : "Tìm kiếm"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a0033]/90 via-[#0b001f] to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-600/15 via-transparent to-cyan-500/15 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400" />

        <div className="relative p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm md:text-base font-extrabold tracking-[0.2em] uppercase text-white/80">
              Danh sách giao dịch
            </h2>
            <p className="text-[11px] text-white/40">
              Hiển thị{" "}
              <span className="font-semibold">{filteredPayments.length}</span>{" "}
              giao dịch
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-[0.18em] text-white/60 border-b border-white/10">
                  <th className="py-3 pr-4 text-left">Payment</th>
                  <th className="py-3 px-4 text-left hidden md:table-cell">
                    Booking / User
                  </th>
                  <th className="py-3 px-4 text-left">Trạng thái</th>
                  <th className="py-3 pl-4 pr-2 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-white/60">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-white/60">
                      Không tìm thấy giao dịch nào khớp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p) => {
                    const status = displayStatus(p);
                    const method = displayMethod(p);
                    const amount = displayAmount(p);
                    return (
                      <tr
                        key={p.paymentId}
                        className="border-b border-white/5 hover:bg-white/5/10"
                      >
                        {/* Payment info */}
                        <td className="py-3 pr-4 align-top">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-white">
                                {amount}
                              </span>
                              <MethodBadge method={method} />
                            </div>
                            <div className="text-[11px] text-white/60 font-mono">
                              PID:{" "}
                              <span className="text-white/80">
                                {p.paymentId?.slice(0, 8)}…
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Booking/User */}
                        <td className="py-3 px-4 align-top hidden md:table-cell">
                          {p.bookingId && (
                            <div className="text-[11px] text-white/70 font-mono break-all">
                              Booking:{" "}
                              <span className="text-white/90">
                                {p.bookingId}
                              </span>
                            </div>
                          )}
                          {p.userId && (
                            <div className="text-[11px] text-white/60 mt-0.5 font-mono break-all">
                              User:{" "}
                              <span className="text-white/80">{p.userId}</span>
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 align-top">
                          <StatusBadge status={status} />
                        </td>

                        {/* Actions */}
                        <td className="py-3 pl-4 pr-2 align-top">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openDetailModal(p)}
                              className="rounded-2xl px-3 py-2 text-[11px] font-semibold tracking-[0.14em] uppercase bg-white/5 border border-white/20 text-white hover:bg-white/10 transition-all"
                            >
                              Chi tiết
                            </button>

                            <button
                              type="button"
                              onClick={() => openRefundModal(p)}
                              disabled={!canRefund(p)}
                              className="rounded-2xl px-3 py-2 text-[11px] font-semibold tracking-[0.14em] uppercase border border-amber-400/60 bg-amber-500/10 text-amber-100 hover:bg-amber-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                              Hoàn tiền
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Refund Modal */}
      {refundModalOpen && (
        <RefundModal
          payment={refundPayment}
          reason={refundReason}
          setReason={setRefundReason}
          onClose={closeRefundModal}
          onSubmit={handleSubmitRefund}
          submitting={refundSubmitting}
          displayAmount={displayAmount}
          displayMethod={displayMethod}
        />
      )}

      {/* Booking Detail Modal */}
      {detailModalOpen && (
        <BookingDetailModal
          onClose={closeDetailModal}
          payment={selectedPayment}
          booking={bookingDetail}
          loading={detailLoading}
          displayAmount={displayAmount}
          displayMethod={displayMethod}
          displayDateTime={displayDateTime}
        />
      )}
    </div>
  );
}

/* ================= SUB COMPONENTS ================= */

function StatCard({ label, value, gradient }) {
  return (
    <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#12002b]/90 via-[#090017] to-black/95 backdrop-blur-xl shadow-xl">
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20 pointer-events-none`}
      />
      <div className="absolute -top-6 -right-10 w-24 h-24 rounded-full bg-white/5 blur-2xl" />
      <div className="relative px-4 py-4 md:px-5 md:py-5">
        <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-white/60">
          {label}
        </p>
        <p className="mt-2 text-xl md:text-2xl font-black text-white">
          {value}
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  let label = status || "UNKNOWN";
  let cls =
    "bg-white/5 border border-white/20 text-white text-[11px] px-2.5 py-1 rounded-2xl inline-flex items-center gap-1";

  if (status === "SUCCESS") {
    label = "Thành công";
    cls =
      "bg-emerald-500/10 border border-emerald-400/60 text-emerald-100 text-[11px] px-2.5 py-1 rounded-2xl inline-flex items-center gap-1";
  } else if (status === "PENDING") {
    label = "Đang xử lý";
    cls =
      "bg-amber-500/10 border border-amber-400/60 text-amber-100 text-[11px] px-2.5 py-1 rounded-2xl inline-flex items-center gap-1";
  } else if (status === "FAILED") {
    label = "Thất bại";
    cls =
      "bg-red-500/10 border border-red-400/60 text-red-100 text-[11px] px-2.5 py-1 rounded-2xl inline-flex items-center gap-1";
  } else if (status === "REFUND_PENDING") {
    label = "Chờ hoàn tiền";
    cls =
      "bg-amber-500/10 border border-amber-300/60 text-amber-100 text-[11px] px-2.5 py-1 rounded-2xl inline-flex items-center gap-1";
  } else if (status === "REFUNDED") {
    label = "Đã hoàn tiền";
    cls =
      "bg-cyan-500/10 border border-cyan-400/60 text-cyan-100 text-[11px] px-2.5 py-1 rounded-2xl inline-flex items-center gap-1";
  } else if (status === "REFUND_FAILED") {
    label = "Hoàn tiền thất bại";
    cls =
      "bg-red-500/10 border border-red-400/60 text-red-100 text-[11px] px-2.5 py-1 rounded-2xl inline-flex items-center gap-1";
  }

  return (
    <span className={cls}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

function MethodBadge({ method }) {
  const m = (method || "").toUpperCase();
  let label = m || "UNKNOWN";
  let cls =
    "text-[10px] px-2 py-1 rounded-2xl border border-white/20 bg-white/5 text-white";

  if (m === "MOMO") {
    label = "MOMO";
    cls =
      "text-[10px] px-2 py-1 rounded-2xl border border-pink-400/70 bg-pink-500/10 text-pink-100";
  } else if (m === "PAYPAL") {
    label = "PAYPAL";
    cls =
      "text-[10px] px-2 py-1 rounded-2xl border border-cyan-400/70 bg-cyan-500/10 text-cyan-100";
  }

  return <span className={cls}>{label}</span>;
}

/**
 * ✅ FIX: modal canh "trên" giống Movies page
 * - items-start thay vì items-center
 * - container có max-h + overflow-y-auto để tự scroll nội dung khi dài
 */
function RefundModal({
  payment,
  reason,
  setReason,
  onClose,
  onSubmit,
  submitting,
  displayAmount,
  displayMethod,
}) {
  if (!payment) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 py-8 bg-black/70 backdrop-blur-xl overflow-y-auto">
      <div className="relative w-full max-w-md rounded-3xl overflow-hidden bg-gradient-to-br from-[#160033]/95 via-[#080017] to-black border border-white/15 shadow-[0_0_50px_rgba(123,66,255,0.6)]">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-transparent to-cyan-500/20 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-amber-400 via-pink-400 to-red-400" />

        <div className="relative p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-amber-300/80 mb-1">
                HOÀN TIỀN GIAO DỊCH
              </p>
              <h2 className="text-lg font-black tracking-[0.16em] uppercase bg-gradient-to-r from-amber-300 via-pink-400 to-red-300 bg-clip-text text-transparent">
                {payment.paymentId?.slice(0, 12)}…
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-white/5 hover:bg-white/10 border border-white/20 w-8 h-8 flex items-center justify-center text-white/70 text-sm transition-all"
            >
              ✕
            </button>
          </div>

          <div className="text-xs text-white/70 space-y-1">
            <div>
              Số tiền:{" "}
              <span className="font-semibold text-amber-200">
                {displayAmount(payment)}
              </span>
            </div>
            {displayMethod(payment) && (
              <div>
                Phương thức:{" "}
                <span className="font-semibold">{displayMethod(payment)}</span>
              </div>
            )}
            {payment.bookingId && (
              <div className="font-mono text-[11px] text-white/60">
                Booking: {payment.bookingId.slice(0, 12)}…
              </div>
            )}
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-white/70 mb-2 uppercase tracking-[0.18em]">
                Lý do hoàn tiền *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/40 focus:bg-white/10 transition-all resize-none"
                placeholder="Ví dụ: thanh toán trùng, khách hủy suất, lỗi hệ thống..."
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex-1 rounded-2xl border border-white/20 bg-white/5 py-3 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-2xl bg-gradient-to-r from-amber-400 via-pink-500 to-red-500 py-3 font-black text-sm text-black shadow-xl shadow-red-500/40 hover:shadow-2xl hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? "Đang gửi yêu cầu..." : "Gửi yêu cầu hoàn tiền"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/**
 * ✅ FIX: modal canh "trên" giống Movies page
 * - items-start thay vì items-center
 * - overlay cho phép scroll nếu nội dung quá dài
 * - container tự scroll nội dung
 */
function BookingDetailModal({
  onClose,
  payment,
  booking,
  loading,
  displayAmount,
  displayMethod,
  displayDateTime,
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 py-8 bg-black/70 backdrop-blur-xl overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl overflow-hidden bg-gradient-to-br from-[#160033]/95 via-[#080017] to-black border border-white/15 shadow-[0_0_60px_rgba(123,66,255,0.7)]">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-transparent to-cyan-500/20 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400" />

        <div className="relative p-6 md:p-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-cyan-300/80 mb-1">
                CHI TIẾT BOOKING
              </p>
              <h2 className="text-lg md:text-xl font-black tracking-[0.16em] uppercase bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-300 bg-clip-text text-transparent">
                {payment?.bookingId?.slice(0, 16) || "Booking"}
              </h2>
              <p className="text-[11px] text-white/60 mt-1">
                Payment:{" "}
                <span className="font-mono text-white/80">
                  {payment?.paymentId?.slice(0, 16)}…
                </span>{" "}
                • {displayAmount(payment || {})} •{" "}
                {displayMethod(payment || {})}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-white/5 hover:bg-white/10 border border-white/20 w-8 h-8 flex items-center justify-center text-white/70 text-sm transition-all"
            >
              ✕
            </button>
          </div>

          {loading ? (
            <div className="py-10 text-center text-white/70 text-sm">
              Đang tải chi tiết booking...
            </div>
          ) : !booking ? (
            <div className="py-10 text-center text-white/70 text-sm">
              Không tìm thấy thông tin booking.
            </div>
          ) : (
            <div className="space-y-5">
              {/* Movie + Showtime */}
              <section className="rounded-2xl border border-white/10 bg-white/5/5 p-4 md:p-5">
                <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-white/70 mb-3">
                  Suất chiếu
                </h3>
                <div className="space-y-2 text-xs text-white/80">
                  {(booking.movie?.title || booking.movieTitle) && (
                    <div className="font-semibold text-white text-sm">
                      {booking.movie?.title || booking.movieTitle}
                    </div>
                  )}
                  {(booking.cinema?.name || booking.cinemaName) && (
                    <div className="text-white/70">
                      Rạp:{" "}
                      <span className="font-semibold">
                        {booking.cinema?.name || booking.cinemaName}
                      </span>
                    </div>
                  )}
                  {(booking.room?.roomNumber ||
                    booking.roomNumber ||
                    booking.roomName) && (
                    <div className="text-white/70">
                      Phòng:{" "}
                      <span className="font-semibold">
                        {booking.room?.roomNumber ||
                          booking.roomNumber ||
                          booking.roomName}
                      </span>
                    </div>
                  )}
                  {displayDateTime(
                    booking.showtime?.startTime ||
                      booking.showtimeStartTime ||
                      booking.showtimeTime
                  ) && (
                    <div className="text-white/70">
                      Thời gian:{" "}
                      <span className="font-semibold">
                        {displayDateTime(
                          booking.showtime?.startTime ||
                            booking.showtimeStartTime ||
                            booking.showtimeTime
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </section>

              {/* Seats & snacks */}
              <section className="grid md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5/5 p-4 md:p-5">
                  <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-white/70 mb-3">
                    Ghế
                  </h3>
                  {Array.isArray(booking.seats) && booking.seats.length > 0 ? (
                    <ul className="flex flex-wrap gap-2 text-xs">
                      {booking.seats.map((s) => (
                        <li
                          key={s.bookingSeatId || `${s.row}${s.number}`}
                          className="px-2.5 py-1 rounded-xl border border-cyan-400/60 bg-cyan-500/10 text-cyan-100 font-mono"
                        >
                          {s.rowLabel || s.row}
                          {s.seatNumber || s.number}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-white/50">
                      Không có dữ liệu ghế.
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5/5 p-4 md:p-5">
                  <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-white/70 mb-3">
                    Bắp nước
                  </h3>
                  {Array.isArray(booking.snacks) &&
                  booking.snacks.length > 0 ? (
                    <ul className="space-y-1 text-xs text-white/80">
                      {booking.snacks.map((sn) => (
                        <li
                          key={sn.bookingSnackId || sn.snackId}
                          className="flex justify-between gap-3"
                        >
                          <span className="line-clamp-1">
                            {sn.snackName || sn.name}
                          </span>
                          <span className="font-mono text-white/70">
                            x{sn.quantity}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-white/50">
                      Không có bắp nước trong booking này.
                    </p>
                  )}
                </div>
              </section>

              {/* Customer */}
              {(booking.customerName ||
                booking.user?.username ||
                booking.customerEmail ||
                booking.user?.email ||
                booking.customerPhone ||
                booking.user?.phoneNumber) && (
                <section className="rounded-2xl border border-white/10 bg-white/5/5 p-4 md:p-5">
                  <h3 className="text-xs font-semibold tracking-[0.2em] uppercase text-white/70 mb-3">
                    Thông tin khách hàng
                  </h3>
                  <div className="grid md:grid-cols-3 gap-3 text-xs text-white/80">
                    {(booking.customerName || booking.user?.username) && (
                      <div>
                        <div className="text-white/60">Tên</div>
                        <div className="font-semibold">
                          {booking.customerName || booking.user?.username}
                        </div>
                      </div>
                    )}
                    {(booking.customerEmail || booking.user?.email) && (
                      <div>
                        <div className="text-white/60">Email</div>
                        <div className="font-mono text-[11px]">
                          {booking.customerEmail || booking.user?.email}
                        </div>
                      </div>
                    )}
                    {(booking.customerPhone || booking.user?.phoneNumber) && (
                      <div>
                        <div className="text-white/60">Số điện thoại</div>
                        <div className="font-mono text-[11px]">
                          {booking.customerPhone || booking.user?.phoneNumber}
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
