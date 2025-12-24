// src/app/(admin)/promotions/page.jsx
import { useEffect, useMemo, useState } from "react";
import WarningModal from "@/components/shared/WarningModal";
import { AdminToolsService } from "@/api/adminservice";
import { toast } from "react-toastify";

const DISCOUNT_TYPES = [
  { value: "PERCENTAGE", label: "Phần trăm (%)" },
  { value: "FIXED_AMOUNT", label: "Số tiền cố định" },
];

const FILTER_OPTIONS = [
  { value: "ALL", label: "Tất cả" },
  { value: "ACTIVE", label: "Đang active" },
  { value: "VALID", label: "Đang hợp lệ" },
];

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);

  const [error] = useState(null);
  const [success, setSuccess] = useState(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  // form / modal
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null); // null = create
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState(getEmptyForm());

  const [processingId, setProcessingId] = useState(null); // deactivate / delete

  // Shared warning modal
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

  // ===== Helpers =====
  function getEmptyForm() {
    return {
      code: "",
      name: "",
      description: "",
      discountType: "PERCENTAGE",
      discountValue: "",
      startDate: "",
      endDate: "",
      usageLimit: "",
      perUserLimit: "",
      isActive: true,
    };
  }

  const parseDate = (value) => {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  };

  const formatDateTime = (value) => {
    if (!value) return "—";
    const s = String(value);

    const d = new Date(s);
    if (isNaN(d.getTime())) return "—";

    const opts = { dateStyle: "short", timeStyle: "short" };
    if (s.endsWith("Z")) {
      return new Intl.DateTimeFormat("vi-VN", {
        ...opts,
        timeZone: "UTC",
      }).format(d);
    }
    return new Intl.DateTimeFormat("vi-VN", opts).format(d);
  };

  const toInputDateTime = (value) => {
  if (!value) return "";
  const s = String(value).trim();
  const m = s.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})(?::\d{2}(?:\.\d+)?)?$/);
  if (m) return `${m[1]}T${m[2]}`;

  const d = new Date(s);
  if (isNaN(d.getTime())) return "";

  const pad = (n) => String(n).padStart(2, "0");
  const useUTC = s.endsWith("Z");
  const yyyy = useUTC ? d.getUTCFullYear() : d.getFullYear();
  const MM = pad((useUTC ? d.getUTCMonth() : d.getMonth()) + 1);
  const dd = pad(useUTC ? d.getUTCDate() : d.getDate());
  const hh = pad(useUTC ? d.getUTCHours() : d.getHours());
  const mm = pad(useUTC ? d.getUTCMinutes() : d.getMinutes());

  return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
};


  const getStatus = (p) => {
    if (!p?.isActive) return "INACTIVE";
    const now = new Date();
    const start = parseDate(p.startDate);
    const end = parseDate(p.endDate);

    if (end && end < now) return "EXPIRED";
    if (start && start > now) return "UPCOMING";
    return "VALID"; // active + trong date range
  };

  const getStatusLabel = (p) => {
    const s = getStatus(p);
    switch (s) {
      case "VALID":
        return "Đang áp dụng";
      case "UPCOMING":
        return "Sắp diễn ra";
      case "EXPIRED":
        return "Hết hạn";
      case "INACTIVE":
        return "Đã tắt";
      default:
        return s;
    }
  };

  const getStatusClass = (p) => {
    const s = getStatus(p);
    switch (s) {
      case "VALID":
        return "bg-emerald-500/10 text-emerald-200 border-emerald-400/40";
      case "UPCOMING":
        return "bg-cyan-500/10 text-cyan-200 border-cyan-400/40";
      case "EXPIRED":
        return "bg-amber-500/10 text-amber-200 border-amber-400/40";
      case "INACTIVE":
      default:
        return "bg-white/5 text-white/60 border-white/20";
    }
  };

  // ===== Fetch =====
  const fetchPromotions = async (filterValue = filter) => {
    try {
      setFetching(true);
setSuccess(null);

      const apiFilter =
        filterValue === "ALL" ? undefined : filterValue.toLowerCase();

      const data = await AdminToolsService.getPromotions(apiFilter);
      const list = Array.isArray(data) ? data : [];
      setPromotions(list);
    } catch (err) {
      console.error("Fetch promotions error:", err);
      const msg = err?.message || "Không tải được danh sách khuyến mãi.";
toast.error(msg);
    } finally {
      setLoading(false);
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchPromotions("ALL");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchPromotions(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // ===== Derived =====
  const filteredPromotions = useMemo(() => {
    const q = search.trim().toLowerCase();
    return promotions.filter((p) => {
      if (q) {
        const haystack = `${p.code || ""} ${p.name || ""} ${
          p.description || ""
        }`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [promotions, search]);

  const stats = useMemo(() => {
    const total = promotions.length;
    let active = 0;
    let valid = 0;
    let expired = 0;

    const now = new Date();

    promotions.forEach((p) => {
      const status = getStatus(p);
      if (p.isActive) active++;
      if (status === "VALID") valid++;
      if (status === "EXPIRED") expired++;
    });

    return { total, active, valid, expired };
  }, [promotions]);

  // ===== Form handlers =====
  const openCreate = () => {
    setEditing(null);
    setForm(getEmptyForm());
    setShowForm(true);
setSuccess(null);
  };

  const openEdit = (promo) => {
    setEditing(promo);
    setForm({
      code: promo.code || "",
      name: promo.name || "",
      description: promo.description || "",
      discountType: promo.discountType || "PERCENTAGE",
      discountValue:
        promo.discountValue !== undefined && promo.discountValue !== null
          ? String(promo.discountValue)
          : "",
      startDate: toInputDateTime(promo.startDate),
      endDate: toInputDateTime(promo.endDate),
      usageLimit:
        promo.usageLimit !== undefined && promo.usageLimit !== null
          ? String(promo.usageLimit)
          : "",
      perUserLimit:
        promo.perUserLimit !== undefined && promo.perUserLimit !== null
          ? String(promo.perUserLimit)
          : "",
      isActive: promo.isActive ?? true,
    });
    setShowForm(true);
setSuccess(null);
  };

  const closeForm = () => {
    if (saving) return;
    setShowForm(false);
    setEditing(null);
  };

  const handleChange = (field) => (e) => {
    const value =
      field === "isActive" ? e.target.checked : e.target.value ?? "";
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const buildPayload = () => {
    return {
      code: form.code.trim(),
      name: form.name.trim(),
      description: form.description.trim(),
      discountType: form.discountType,
      discountValue: form.discountValue
        ? Number(form.discountValue)
        : undefined,
      startDate: form.startDate || null,
      endDate: form.endDate || null,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      perUserLimit: form.perUserLimit ? Number(form.perUserLimit) : null,
      isActive: !!form.isActive,
    };
  };

  const validateForm = () => {
    if (!form.code.trim()) {
      return "Vui lòng nhập mã khuyến mãi.";
    }
    if (!form.name.trim()) {
      return "Vui lòng nhập tên chương trình.";
    }
    if (!form.discountType) {
      return "Vui lòng chọn loại giảm giá.";
    }
    const v = Number(form.discountValue);
    if (!form.discountValue || isNaN(v) || v <= 0) {
      return "Giá trị giảm phải > 0.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
setSuccess(null);

    const msg = validateForm();
    if (msg) {
toast.error(msg);
      return;
    }

    try {
      setSaving(true);
      const payload = buildPayload();

      if (editing) {
        await AdminToolsService.updatePromotion(editing.promotionId, payload);
        setSuccess("Cập nhật khuyến mãi thành công.");
        toast.success("Cập nhật khuyến mãi thành công.");
      } else {
        await AdminToolsService.createPromotion(payload);
        setSuccess("Tạo khuyến mãi mới thành công.");
        toast.success("Tạo khuyến mãi mới thành công.");
      }

      await fetchPromotions(filter);
      setShowForm(false);
      setEditing(null);
    } catch (err) {
      console.error("Save promotion error:", err);
      const msg =
        err?.message ||
        "Lưu khuyến mãi thất bại. Vui lòng kiểm tra dữ liệu và thử lại.";
toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (promo) => {
    const confirmDeactivate = async () => {
      try {
        setProcessingId(promo.promotionId);
setSuccess(null);

        await AdminToolsService.deactivatePromotion(promo.promotionId);
        setSuccess("Đã tắt khuyến mãi.");
        toast.success("Đã tắt khuyến mãi.");
        await fetchPromotions(filter);
      } catch (err) {
        console.error("Deactivate promotion error:", err);
        const msg = err?.message || "Tắt khuyến mãi thất bại.";
toast.error(msg);
      } finally {
        setProcessingId(null);
        closeWarning();
      }
    };

    showWarning(`Tắt khuyến mãi "${promo.code}"?`, "Lưu ý!", confirmDeactivate);
  };

  const handleDelete = async (promo) => {
    const confirmDelete = async () => {
      try {
        setProcessingId(promo.promotionId);
setSuccess(null);

        await AdminToolsService.deletePromotion(promo.promotionId);
        setSuccess("Xóa khuyến mãi thành công.");
        toast.success("Xóa khuyến mãi thành công.");
        await fetchPromotions(filter);
      } catch (err) {
        console.error("Delete promotion error:", err);
        const msg = err?.message || "Xóa khuyến mãi thất bại.";
toast.error(msg);
      } finally {
        setProcessingId(null);
        closeWarning();
      }
    };

    showWarning(
      `Bạn chắc chắn muốn xóa vĩnh viễn khuyến mãi "${promo.code}"?`,
      "Lưu ý!",
      confirmDelete
    );
  };

  // ===== Render =====
  return (
    <div
      className={`space-y-8 lg:space-y-10 ${
        showForm ? "h-screen overflow-hidden" : ""
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
          ADMIN • PROMOTIONS
        </p>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-[0.16em] uppercase">
          <span className="bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Khuyến mãi & mã giảm giá
          </span>
        </h1>
        <p className="text-xs md:text-sm text-white/60 max-w-2xl">
          Quản lý các chương trình khuyến mãi, mã giảm giá áp dụng trên hệ thống
          CinesVerse.
        </p>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Tổng chương trình"
          value={stats.total}
          gradient="from-cyan-400/80 via-cyan-500/70 to-emerald-400/80"
        />
        <StatCard
          label="Đang active"
          value={stats.active}
          gradient="from-violet-500/80 via-fuchsia-500/80 to-pink-400/80"
        />
        <StatCard
          label="Đang hợp lệ"
          value={stats.valid}
          gradient="from-emerald-400/80 via-teal-400/80 to-cyan-400/80"
        />
        <StatCard
          label="Đã hết hạn"
          value={stats.expired}
          gradient="from-amber-400/80 via-orange-500/80 to-rose-400/80"
        />
      </section>

      {/* Filters */}
      <section className="relative rounded-3xl bg-gradient-to-br from-[#160033]/85 via-[#090019]/95 to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/15 via-transparent to-cyan-500/20 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400" />

        <div className="relative p-4 md:p-6 flex flex-col md:flex-row gap-4 md:items-end justify-between">
          <div className="flex-1 flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                Tìm kiếm
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo mã, tên, mô tả..."
                className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
              />
            </div>

            <div className="w-full sm:w-48">
              <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                Lọc theo trạng thái
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="cv-select-dark w-full rounded-full bg-gradient-to-r from-[#1b0b3a] via-[#14002b] to-[#050012]
                border border-cyan-400/60 px-4 py-2.5 text-sm font-semibold text-white
                shadow-[0_0_0_1px_rgba(15,23,42,0.9)]
                focus:outline-none focus:ring-2 focus:ring-cyan-400/70 focus:border-transparent
                transition-all"
              >
                {FILTER_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:self-end">
            <button
              type="button"
              onClick={() => fetchPromotions(filter)}
              disabled={fetching}
              className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-xs font-semibold tracking-[0.16em] uppercase bg-white/5 border border-white/20 text-white hover:bg-white/10 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {fetching ? "Đang tải..." : "Làm mới"}
            </button>

            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-xs font-semibold tracking-[0.16em] uppercase bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-400 text-black shadow-lg shadow-purple-500/40 hover:brightness-110 transition-all"
            >
              + Thêm khuyến mãi
            </button>
          </div>
        </div>
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

      {/* Table */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a0033]/90 via-[#0b001f] to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-600/15 via-transparent to-cyan-500/15 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400" />

        <div className="relative p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm md:text-base font-extrabold tracking-[0.2em] uppercase text-white/80">
              Danh sách khuyến mãi
            </h2>
            <p className="text-[11px] text-white/40">
              Hiển thị{" "}
              <span className="font-semibold">{filteredPromotions.length}</span>{" "}
              / <span className="font-semibold">{promotions.length}</span>{" "}
              promotions
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-[0.18em] text-white/60 border-b border-white/10">
                  <th className="py-3 pr-4 text-left">Mã / Tên</th>
                  <th className="py-3 px-4 text-left hidden md:table-cell">
                    Thời gian
                  </th>
                  <th className="py-3 px-4 text-left hidden lg:table-cell">
                    Hạn mức
                  </th>
                  <th className="py-3 px-4 text-left">Giảm giá</th>
                  <th className="py-3 px-4 text-left">Trạng thái</th>
                  <th className="py-3 pl-4 pr-2 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-8 text-center text-white/60 text-sm"
                    >
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : filteredPromotions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-8 text-center text-white/60 text-sm"
                    >
                      Không có khuyến mãi nào khớp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredPromotions.map((p) => {
                    const statusLabel = getStatusLabel(p);
                    const statusClass = getStatusClass(p);
                    const isProcessing = processingId === p.promotionId;

                    const discountLabel =
                      p.discountType === "PERCENTAGE"
                        ? `${p.discountValue ?? 0}%`
                        : `${(p.discountValue ?? 0).toLocaleString("vi-VN")} đ`;

                    return (
                      <tr
                        key={p.promotionId}
                        className="border-b border-white/5 hover:bg-white/5/10"
                      >
                        {/* Code / Name */}
                        <td className="py-3 pr-4 align-top">
                          <div className="flex flex-col gap-1">
                            <div className="inline-flex items-center gap-2">
                              <span className="px-2 py-1 rounded-md bg-white/10 text-[11px] font-mono text-cyan-200">
                                {p.code}
                              </span>
                              {p.isActive && (
                                <span className="px-2 py-[3px] rounded-full bg-emerald-500/15 text-[10px] font-semibold text-emerald-200 border border-emerald-400/40">
                                  Active
                                </span>
                              )}
                            </div>
                            <div className="text-xs font-semibold text-white line-clamp-1">
                              {p.name || "Chưa đặt tên"}
                            </div>
                            {p.description && (
                              <div className="text-[11px] text-white/60 line-clamp-2">
                                {p.description}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Time */}
                        <td className="py-3 px-4 align-top hidden md:table-cell">
                          <div className="text-[11px] text-white/60">
                            <span className="text-white/40">Từ: </span>
                            {formatDateTime(p.startDate)}
                          </div>
                          <div className="text-[11px] text-white/60 mt-1">
                            <span className="text-white/40">Đến: </span>
                            {formatDateTime(p.endDate)}
                          </div>
                        </td>

                        {/* Limits */}
                        <td className="py-3 px-4 align-top hidden lg:table-cell">
                          <div className="text-[11px] text-white/60">
                            Tổng lượt:{" "}
                            <span className="font-semibold text-white">
                              {p.usageLimit ?? "Không giới hạn"}
                            </span>
                          </div>
                          <div className="text-[11px] text-white/60 mt-1">
                            / người dùng:{" "}
                            <span className="font-semibold text-white">
                              {p.perUserLimit ?? "Không giới hạn"}
                            </span>
                          </div>
                        </td>

                        {/* Discount */}
                        <td className="py-3 px-4 align-top">
                          <div className="text-xs font-semibold text-white">
                            {discountLabel}
                          </div>
                          <div className="text-[11px] text-white/60 mt-1">
                            {p.discountType === "PERCENTAGE"
                              ? "Giảm theo phần trăm"
                              : "Giảm theo số tiền"}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 align-top">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusClass}`}
                          >
                            {statusLabel}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 pl-4 pr-2 align-top">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(p)}
                              className="rounded-2xl px-3 py-2 text-[11px] font-semibold tracking-[0.14em] uppercase bg-white/5 border border-white/20 text-white hover:bg-white/10 transition-all"
                            >
                              Sửa
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(p)}
                              disabled={isProcessing}
                              className="rounded-2xl px-3 py-2 text-[11px] font-semibold tracking-[0.14em] uppercase border border-red-500/60 bg-red-500/10 text-red-100 hover:bg-red-500/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                            >
                              {isProcessing ? "Đang xử lý..." : "Xóa"}
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

      {/* Modal create / edit */}
      {showForm && (
        <div className="fixed inset-0 z-40 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-10">
          <div className="relative w-full max-w-2xl mx-4 rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a0033]/95 via-[#0b001f] to-black/98 border border-white/10 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-600/15 via-transparent to-cyan-500/20 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400" />
            <div className="relative p-6 md:p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-lg md:text-xl font-black tracking-[0.2em] uppercase bg-gradient-to-r from-cyan-300 to-pink-300 bg-clip-text text-transparent">
                    {editing ? "Chỉnh sửa khuyến mãi" : "Thêm khuyến mãi mới"}
                  </h2>
                  <p className="mt-2 text-xs text-white/60">
                    Điền đầy đủ thông tin chương trình. Bạn có thể thay đổi
                    trạng thái Active bất kỳ lúc nào.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeForm}
                  className="ml-4 text-white/60 hover:text-white text-xl leading-none"
                  disabled={saving}
                >
                  ×
                </button>
              </div>

              {error && (
                <div className="mb-4 rounded-2xl border border-red-500/60 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-white/70 mb-2 uppercase tracking-[0.18em]">
                      Mã khuyến mãi
                    </label>
                    <input
                      type="text"
                      value={form.code}
                      onChange={handleChange("code")}
                      placeholder="WINTER2024"
                      className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-white/70 mb-2 uppercase tracking-[0.18em]">
                      Tên chương trình
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={handleChange("name")}
                      placeholder="Winter Sale 2024"
                      className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-white/70 mb-2 uppercase tracking-[0.18em]">
                    Mô tả
                  </label>
                  <textarea
                    value={form.description}
                    onChange={handleChange("description")}
                    rows={3}
                    placeholder="Special discount for winter season..."
                    className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                  />
                </div>

                <div className="grid md:grid-cols-[1.2fr,0.8fr] gap-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-white/70 mb-2 uppercase tracking-[0.18em]">
                        Loại giảm
                      </label>
                      <select
                        value={form.discountType}
                        onChange={handleChange("discountType")}
                        className="cv-select-dark w-full rounded-full bg-gradient-to-r from-[#1b0b3a] via-[#14002b] to-[#050012]
                        border border-cyan-400/60 px-4 py-3 text-sm font-semibold text-white
                        shadow-[0_0_0_1px_rgba(15,23,42,0.9)]
                        focus:outline-none focus:ring-2 focus:ring-cyan-400/70 focus:border-transparent
                        transition-all"
                      >
                        {DISCOUNT_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-white/70 mb-2 uppercase tracking-[0.18em]">
                        Giá trị giảm
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.discountValue}
                        onChange={handleChange("discountValue")}
                        placeholder="15"
                        className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                      />
                      <p className="mt-1 text-[11px] text-white/50">
                        Nếu là phần trăm: 15 = 15%. Nếu là số tiền: 20000 =
                        20.000đ
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                        Trạng thái
                      </p>
                      <p className="mt-1 text-xs text-white/60">
                        Nếu tắt, mã sẽ không áp dụng kể cả còn trong thời gian.
                      </p>
                    </div>
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <span className="text-xs text-white/70">Inactive</span>
                      <div className="relative inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={form.isActive}
                          onChange={handleChange("isActive")}
                          className="sr-only"
                        />
                        <div
                          className={`w-10 h-5 rounded-full border transition-colors duration-300 ${
                            form.isActive
                              ? "bg-emerald-400 border-emerald-300"
                              : "bg-white/10 border-white/40"
                          }`}
                        />
                        <div
                          className={`absolute left-[3px] w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                            form.isActive ? "translate-x-5" : ""
                          }`}
                        />
                      </div>
                      <span className="text-xs text-emerald-300 font-semibold">
                        Active
                      </span>
                    </label>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-white/70 mb-2 uppercase tracking-[0.18em]">
                      Bắt đầu
                    </label>
                    <input
                      type="datetime-local"
                      value={form.startDate}
                      onChange={handleChange("startDate")}
                      className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-white/70 mb-2 uppercase tracking-[0.18em]">
                      Kết thúc
                    </label>
                    <input
                      type="datetime-local"
                      value={form.endDate}
                      onChange={handleChange("endDate")}
                      className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-white/70 mb-2 uppercase tracking-[0.18em]">
                      Tổng lượt sử dụng (usageLimit)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.usageLimit}
                      onChange={handleChange("usageLimit")}
                      placeholder="1000"
                      className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                    />
                    <p className="mt-1 text-[11px] text-white/50">
                      Để trống = không giới hạn.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-white/70 mb-2 uppercase tracking-[0.18em]">
                      Lượt / 1 user (perUserLimit)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.perUserLimit}
                      onChange={handleChange("perUserLimit")}
                      placeholder="2"
                      className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                    />
                    <p className="mt-1 text-[11px] text-white/50">
                      Để trống = không giới hạn mỗi user.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeForm}
                    disabled={saving}
                    className="flex-1 rounded-2xl border border-white/20 bg-white/5 py-3.5 font-bold text-white hover:bg-white/10 hover:border-white/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400 py-3.5 font-black text-black shadow-xl shadow-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/70 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  >
                    {saving
                      ? "Đang lưu..."
                      : editing
                      ? "Lưu thay đổi"
                      : "Tạo khuyến mãi"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
