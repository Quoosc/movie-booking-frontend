// src/app/(admin)/membership/page.jsx
import { useEffect, useMemo, useState } from "react";
import WarningModal from "@/components/shared/WarningModal";
import { AdminUserService } from "@/api/adminservice";
import { toast } from "react-toastify";

const DISCOUNT_TYPE_OPTIONS = [
  { value: "PERCENTAGE", label: "Phần trăm (%)" },
  { value: "FIXED_AMOUNT", label: "Số tiền (VND)" },
];

export default function AdminMembershipPage() {
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error] = useState(null);
  const [success, setSuccess] = useState(null);

  // filter + search
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // form / modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTier, setEditingTier] = useState(null);

  const [form, setForm] = useState({
    name: "",
    minPoints: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    description: "",
    isActive: true,
  });

  // Warning modal state (Seats-style)
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

  // ====== API ======

  const fetchTiers = async () => {
    try {
      setLoading(true);
setSuccess(null);

      // ✅ DÙNG AdminUserService.getMembershipTiers()
      const data = await AdminUserService.getMembershipTiers();
      const list = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data)
        ? data
        : [];

      setTiers(list);
    } catch (err) {
      console.error("getMembershipTiers error:", err);
      const msg =
        err?.message ||
        "Không tải được danh sách hạng thành viên (membership).";
toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTiers();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      minPoints: "",
      discountType: "PERCENTAGE",
      discountValue: "",
      description: "",
      isActive: true,
    });
    setEditingTier(null);
  };

  const openCreateForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEditForm = (tier) => {
    setEditingTier(tier);
    setForm({
      name: tier.name || "",
      minPoints: tier.minPoints ?? 0,
      discountType: tier.discountType || "PERCENTAGE",
      discountValue: tier.discountValue ?? 0,
      description: tier.description || "",
      isActive: !!tier.isActive,
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;
    setIsFormOpen(false);
    setTimeout(() => {
      resetForm();
    }, 200);
  };

  const handleFormChange = (field) => (e) => {
    const value =
      field === "isActive"
        ? e.target.checked
        : field === "minPoints" || field === "discountValue"
        ? Number(e.target.value || 0)
        : e.target.value;

    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      return "Vui lòng nhập tên hạng thành viên.";
    }
    if (form.minPoints < 0) {
      return "Điểm tối thiểu không được âm.";
    }
    if (form.discountValue < 0) {
      return "Giá trị giảm không được âm.";
    }
    if (!["PERCENTAGE", "FIXED_AMOUNT"].includes(form.discountType)) {
      return "Loại giảm giá không hợp lệ.";
    }
    if (form.discountType === "PERCENTAGE" && form.discountValue > 100) {
      return "Giảm giá theo phần trăm không nên vượt quá 100%.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
setSuccess(null);

    const validationError = validateForm();
    if (validationError) {
toast.error(validationError);
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: form.name.trim(),
        minPoints: form.minPoints,
        discountType: form.discountType,
        discountValue: form.discountValue,
        description: form.description.trim() || null,
        isActive: form.isActive,
      };

      if (editingTier) {
        // ✅ updateMembershipTier từ AdminUserService
        const updated = await AdminUserService.updateMembershipTier(
          editingTier.membershipTierId,
          payload
        );
        const updatedTier = updated?.data || updated;

        setTiers((prev) =>
          prev.map((t) =>
            t.membershipTierId === editingTier.membershipTierId
              ? { ...t, ...updatedTier }
              : t
          )
        );
        toast.success("Cập nhật hạng thành viên thành công.");
      } else {
        // ✅ createMembershipTier từ AdminUserService
        const created = await AdminUserService.createMembershipTier(payload);
        const createdTier = created?.data || created;
        setTiers((prev) => [...prev, createdTier]);
        toast.success("Tạo hạng thành viên mới thành công.");
      }

      setIsFormOpen(false);
      setTimeout(() => resetForm(), 200);
    } catch (err) {
      console.error("save membership tier error:", err);
      const msg =
        err?.message || "Lưu hạng thành viên thất bại. Vui lòng thử lại.";
toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTier = async (tier) => {
    const confirmDelete = async () => {
      try {
        setDeletingId(tier.membershipTierId);
setSuccess(null);

        await AdminUserService.deleteMembershipTier(tier.membershipTierId);

        setTiers((prev) =>
          prev.filter((t) => t.membershipTierId !== tier.membershipTierId)
        );
        toast.success("Xóa hạng thành viên thành công.");
      } catch (err) {
        console.error("delete membership tier error:", err);
        const msg = err?.message || "Xóa hạng thành viên thất bại.";
toast.error(msg);
      } finally {
        setDeletingId(null);
        closeWarning();
      }
    };

    showWarning(
      `Bạn chắc chắn muốn xóa hạng "${tier.name}"? Hành động này có thể ảnh hưởng tới tính toán loyalty.`,
      "Lưu ý!",
      confirmDelete
    );
  };

  // ====== DERIVED DATA ======

  const filteredTiers = useMemo(() => {
    return (tiers || []).filter((t) => {
      const q = search.trim().toLowerCase();
      if (q) {
        const haystack = `${t.name || ""} ${t.description || ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      if (statusFilter !== "ALL") {
        const isActive = !!t.isActive;
        if (statusFilter === "ACTIVE" && !isActive) return false;
        if (statusFilter === "INACTIVE" && isActive) return false;
      }

      return true;
    });
  }, [tiers, search, statusFilter]);

  const stats = useMemo(() => {
    const total = tiers.length;
    const activeCount = tiers.filter((t) => t.isActive).length;
    const maxDiscount = tiers.reduce((max, t) => {
      const v = t.discountValue ?? 0;
      return v > max ? v : max;
    }, 0);

    return { total, activeCount, maxDiscount };
  }, [tiers]);

  // ====== RENDER ======

  return (
    <div
      className={`space-y-8 lg:space-y-10 ${
        isFormOpen ? "h-screen overflow-hidden" : ""
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
          ADMIN • MEMBERSHIP
        </p>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-[0.16em] uppercase">
          <span className="bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Hạng thành viên & ưu đãi
          </span>
        </h1>
        <p className="text-xs md:text-sm text-white/60 max-w-2xl">
          Thiết lập các mốc điểm tích lũy, tỷ lệ giảm giá và trạng thái hạng
          thành viên. Hệ thống loyalty của CinesVerse sẽ dựa trên cấu hình này.
        </p>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Tổng số hạng"
          value={stats.total}
          gradient="from-cyan-400/80 via-cyan-500/70 to-emerald-400/80"
        />
        <StatCard
          label="Hạng đang active"
          value={stats.activeCount}
          gradient="from-emerald-400/80 via-teal-400/80 to-cyan-400/80"
        />
        <StatCard
          label="Giảm tối đa"
          value={
            stats.maxDiscount > 0 ? `${stats.maxDiscount.toFixed(1)}%/VND` : "—"
          }
          gradient="from-violet-500/80 via-fuchsia-500/80 to-pink-400/80"
        />
      </section>

      {/* Filter + Action */}
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
                placeholder="Tên hạng, mô tả..."
                className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
              />
            </div>

            <div className="w-full sm:w-48">
              <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                Trạng thái
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="cv-select-dark w-full rounded-full bg-gradient-to-r from-[#1b0b3a] via-[#14002b] to-[#050012]
               border border-cyan-400/60 px-4 py-2.5 text-xs md:text-sm font-semibold text-white
               shadow-[0_0_0_1px_rgba(15,23,42,0.9)]
               focus:outline-none focus:ring-2 focus:ring-cyan-400/70 focus:border-transparent
               transition-all"
              >
                <option value="ALL">Tất cả</option>
                <option value="ACTIVE">Đang active</option>
                <option value="INACTIVE">Đã tắt</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 justify-end md:self-end">
            <button
              type="button"
              onClick={fetchTiers}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-[11px] font-semibold tracking-[0.16em] uppercase bg-white/5 border border-white/20 text-white hover:bg-white/10 hover:border-white/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Đang tải..." : "Làm mới"}
            </button>

            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-[11px] font-semibold tracking-[0.16em] uppercase bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-400 text-black shadow-lg shadow-purple-500/40 hover:brightness-110 transition-all"
            >
              + Thêm hạng mới
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
              Danh sách hạng thành viên
            </h2>
            <p className="text-[11px] text-white/40">
              Hiển thị{" "}
              <span className="font-semibold">{filteredTiers.length}</span> /{" "}
              <span className="font-semibold">{tiers.length}</span> tiers
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-[0.18em] text-white/60 border-b border-white/10">
                  <th className="py-3 px-2 text-left">Hạng</th>
                  <th className="py-3 px-2 text-left">Điểm tối thiểu</th>
                  <th className="py-3 px-2 text-left">Ưu đãi</th>
                  <th className="py-3 px-2 text-left hidden md:table-cell">
                    Mô tả
                  </th>
                  <th className="py-3 px-2 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-white/60 text-sm"
                    >
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : filteredTiers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-white/60 text-sm"
                    >
                      Không có hạng nào khớp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredTiers.map((t) => (
                    <tr
                      key={t.membershipTierId}
                      className="border-b border-white/5 hover:bg-white/5"
                    >
                      {/* Name + status */}
                      <td className="py-3 px-2 align-top">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">
                              {t.name}
                            </span>
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                                t.isActive
                                  ? "bg-emerald-400/10 text-emerald-200 border-emerald-400/40"
                                  : "bg-slate-500/10 text-slate-200 border-slate-500/40"
                              }`}
                            >
                              {t.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                          <span className="text-[11px] text-white/45">
                            ID:{" "}
                            <span className="font-mono text-[10px]">
                              {t.membershipTierId?.slice(0, 8)}…
                            </span>
                          </span>
                        </div>
                      </td>

                      {/* Min points */}
                      <td className="py-3 px-2 align-top">
                        <div className="text-xs text-white/80">
                          {t.minPoints ?? 0} điểm
                        </div>
                      </td>

                      {/* Discount */}
                      <td className="py-3 px-2 align-top">
                        <div className="text-xs text-emerald-200 font-semibold">
                          {renderDiscountValue(t.discountType, t.discountValue)}
                        </div>
                        <div className="text-[11px] text-white/55 mt-0.5">
                          Áp dụng cho mọi booking đạt đủ điểm tier.
                        </div>
                      </td>

                      {/* Description */}
                      <td className="py-3 px-2 align-top hidden md:table-cell">
                        <div className="text-xs text-white/70 line-clamp-3">
                          {t.description || (
                            <span className="text-white/40">Chưa có mô tả</span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-2 align-top text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(t)}
                            className="rounded-2xl px-3 py-2 text-[11px] font-semibold tracking-[0.14em] uppercase bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400 text-black shadow-md shadow-purple-500/40 hover:brightness-110 transition-all"
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTier(t)}
                            disabled={deletingId === t.membershipTierId}
                            className="rounded-2xl px-3 py-2 text-[11px] font-semibold tracking-[0.14em] uppercase border border-red-500/60 bg-red-500/10 text-red-100 hover:bg-red-500/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                          >
                            {deletingId === t.membershipTierId
                              ? "Đang xóa..."
                              : "Xóa"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Modal / Drawer form */}
      {isFormOpen && (
        <div
          className="
      fixed inset-0 z-40
      flex items-start justify-center
      px-4
      bg-black/70 backdrop-blur-sm
      overflow-y-auto
    "
        >
          {/* overlay click để đóng */}
          <div className="absolute inset-0" onClick={closeForm} />

          <div
            className="
        relative z-50
        w-full md:max-w-lg lg:max-w-xl
        mt-24 mb-10        /* cách top / bottom một đoạn */
        rounded-3xl
        bg-gradient-to-br from-[#1a0033]/95 via-[#0b001f] to-black/95
        border border-white/10 shadow-2xl
      "
          >
            <div className="relative p-5 md:p-6">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400" />
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-sm md:text-base font-extrabold tracking-[0.2em] uppercase text-white/80">
                    {editingTier ? "Cập nhật hạng thành viên" : "Thêm hạng mới"}
                  </h2>
                  <p className="mt-1 text-[11px] text-white/60">
                    Thiết lập tên, mốc điểm và ưu đãi cho hạng thành viên.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-full w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/20 text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name + active */}
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 items-center">
                  <div>
                    <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                      Tên hạng
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={handleFormChange("name")}
                      placeholder="VD: Silver, Gold, Platinum..."
                      className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                    />
                  </div>
                  <div className="flex flex-col items-end justify-center">
                    <span className="text-[11px] text-white/60 mb-1">
                      Trạng thái
                    </span>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={handleFormChange("isActive")}
                        className="w-4 h-4 rounded border-white/40 bg-transparent text-violet-400 focus:ring-violet-400/40"
                      />
                      <span className="text-[11px] text-white/80 uppercase tracking-[0.12em]">
                        Active
                      </span>
                    </label>
                  </div>
                </div>

                {/* Min points */}
                <div>
                  <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                    Điểm tối thiểu
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Nhập số điểm tối thiểu..."
                    value={form.minPoints}
                    onChange={handleFormChange("minPoints")}
                    className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all appearance-none"
                  />
                  <p className="mt-1 text-[11px] text-white/50">
                    Khi tổng điểm loyalty của user ≥ mốc này, user sẽ được xếp
                    vào hạng tương ứng.
                  </p>
                </div>

                {/* Discount */}
                <div className="grid sm:grid-cols-[140px,minmax(0,1fr)] gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                      Loại ưu đãi
                    </label>
                    <select
                      value={form.discountType}
                      onChange={handleFormChange("discountType")}
                      className="w-full rounded-full bg-gradient-to-r from-[#1b0b3a] via-[#14002b] to-[#050012]
                      border border-cyan-400/60 px-3 py-2.5 text-xs font-semibold text-white
                      shadow-[0_0_0_1px_rgba(15,23,42,0.9)]
                      focus:outline-none focus:ring-2 focus:ring-cyan-400/70 focus:border-transparent
                      transition-all"
                    >
                      {DISCOUNT_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                      Giá trị ưu đãi
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Nhập giá trị ưu đãi..."
                      value={form.discountValue}
                      onChange={handleFormChange("discountValue")}
                      className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all appearance-none"
                    />
                    <p className="mt-1 text-[11px] text-white/50">
                      {form.discountType === "PERCENTAGE"
                        ? "Ví dụ: 5 = giảm 5% trên tổng vé/snack (theo rule BE)."
                        : "Ví dụ: 20000 = giảm 20.000đ trên tổng vé/snack (theo rule BE)."}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                    Mô tả / benefit
                  </label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={handleFormChange("description")}
                    placeholder="Đặc quyền, benefit của hạng này..."
                    className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeForm}
                    disabled={saving}
                    className="flex-1 rounded-2xl border border-white/20 bg-white/5 py-3.5 font-bold text-white hover:bg-white/10 hover:border-white/40 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
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
                      : editingTier
                      ? "Lưu thay đổi"
                      : "Tạo hạng mới"}
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

/* ===== sub components ===== */

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

function renderDiscountValue(type, value) {
  if (value == null) return "—";
  if (type === "PERCENTAGE") return `Giảm ${value}%`;
  if (type === "FIXED_AMOUNT")
    return `Giảm ${Number(value).toLocaleString("vi-VN")}đ`;
  return `${value}`;
}
