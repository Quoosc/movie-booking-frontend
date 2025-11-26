// src/app/(admin)/cinemas/page.jsx
import { useEffect, useMemo, useState } from "react";
import { AdminCinemaService } from "@/api/adminservice";

const STATUS_FILTERS = ["ALL", "ACTIVE", "INACTIVE"];

const EMPTY_FORM = {
  code: "",
  name: "",
  address: "",
  city: "",
  district: "",
  hotline: "",
  description: "",
  isActive: true,
};

export default function AdminCinemasPage() {
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCinema, setEditingCinema] = useState(null); // null = create
  const [form, setForm] = useState(EMPTY_FORM);

  // =============== API ===============

  const fetchCinemas = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const data = await AdminCinemaService.getCinemas();
      const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setCinemas(list);
    } catch (err) {
      console.error("Fetch cinemas error:", err);
      setError(err?.message || "Không tải được danh sách rạp.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCinemas();
  }, []);

  // =============== FORM / MODAL ===============

  const openCreateModal = () => {
    setEditingCinema(null);
    setForm(EMPTY_FORM);
    setError(null);
    setSuccess(null);
    setModalOpen(true);
  };

  const openEditModal = (cinema) => {
    setEditingCinema(cinema);
    setForm({
      code: cinema.code || cinema.cinemaCode || "",
      name: cinema.name || cinema.cinemaName || "",
      address: cinema.address || "",
      city: cinema.city || "",
      district: cinema.district || "",
      hotline: cinema.hotline || cinema.phone || "",
      description: cinema.description || "",
      isActive: cinema.isActive ?? cinema.active ?? true,
    });
    setError(null);
    setSuccess(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingCinema(null);
    setForm(EMPTY_FORM);
  };

  const handleFormChange = (field) => (e) => {
    const value =
      field === "isActive" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError("Vui lòng nhập tên rạp.");
      setSuccess(null);
      return;
    }
    if (!form.code.trim()) {
      setError("Vui lòng nhập mã rạp (code).");
      setSuccess(null);
      return;
    }

    const payload = {
      code: form.code.trim(),
      name: form.name.trim(),
      address: form.address.trim() || null,
      city: form.city.trim() || null,
      district: form.district.trim() || null,
      hotline: form.hotline.trim() || null,
      description: form.description.trim() || null,
      isActive: !!form.isActive,
    };

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      if (editingCinema) {
        const id = editingCinema.cinemaId || editingCinema.id;
        const updated = await AdminCinemaService.updateCinema(id, payload);

        setCinemas((prev) =>
          prev.map((c) =>
            (c.cinemaId || c.id) === id ? { ...c, ...(updated || {}) } : c
          )
        );
        setSuccess("Cập nhật rạp thành công.");
      } else {
        const created = await AdminCinemaService.createCinema(payload);
        setCinemas((prev) => [created || payload, ...prev]);
        setSuccess("Thêm rạp mới thành công.");
      }

      closeModal();
    } catch (err) {
      console.error("Save cinema error:", err);
      setError(err?.message || "Lưu thông tin rạp thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cinema) => {
    const id = cinema.cinemaId || cinema.id;
    if (!id) return;

    if (
      !window.confirm(
        `Bạn chắc chắn muốn xóa rạp "${cinema.name || cinema.cinemaName || ""}"?`
      )
    )
      return;

    try {
      setDeletingId(id);
      setError(null);
      setSuccess(null);

      await AdminCinemaService.deleteCinema(id);

      setCinemas((prev) => prev.filter((c) => (c.cinemaId || c.id) !== id));
      setSuccess("Xóa rạp thành công.");
    } catch (err) {
      console.error("Delete cinema error:", err);
      setError(err?.message || "Xóa rạp thất bại.");
    } finally {
      setDeletingId(null);
    }
  };

  // =============== DERIVED DATA ===============

  const filteredCinemas = useMemo(() => {
    return cinemas.filter((c) => {
      const name = c.name || c.cinemaName || "";
      const code = c.code || c.cinemaCode || "";
      const address = c.address || "";
      const city = c.city || "";
      const district = c.district || "";
      const hotline = c.hotline || c.phone || "";
      const isActive = c.isActive ?? c.active ?? true;

      const q = search.trim().toLowerCase();
      if (q) {
        const haystack = `${name} ${code} ${address} ${city} ${district} ${hotline}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      if (statusFilter === "ACTIVE" && !isActive) return false;
      if (statusFilter === "INACTIVE" && isActive) return false;

      return true;
    });
  }, [cinemas, search, statusFilter]);

  const stats = useMemo(() => {
    const total = cinemas.length;
    let active = 0;
    let inactive = 0;

    cinemas.forEach((c) => {
      const isActive = c.isActive ?? c.active ?? true;
      if (isActive) active++;
      else inactive++;
    });

    return { total, active, inactive };
  }, [cinemas]);

  // =============== RENDER ===============

  return (
    <div className="space-y-8 lg:space-y-10">
      {/* Header */}
      <header className="space-y-3">
        <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-cyan-400/70">
          ADMIN • CINEMAS
        </p>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-[0.16em] uppercase">
          <span className="bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Quản lý rạp chiếu
          </span>
        </h1>
        <p className="text-xs md:text-sm text-white/60 max-w-2xl">
          Quản lý danh sách rạp CinesVerse: thêm, chỉnh sửa thông tin và trạng
          thái hoạt động.
        </p>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          label="Tổng số rạp"
          value={stats.total}
          gradient="from-cyan-400/80 via-cyan-500/70 to-emerald-400/80"
        />
        <StatCard
          label="Đang hoạt động"
          value={stats.active}
          gradient="from-emerald-400/80 via-teal-400/80 to-cyan-400/80"
        />
        <StatCard
          label="Tạm ngưng"
          value={stats.inactive}
          gradient="from-amber-400/80 via-orange-500/80 to-rose-400/80"
        />
      </section>

      {/* Filters + Actions */}
      <section className="relative rounded-3xl bg-gradient-to-br from-[#160033]/85 via-[#090019]/95 to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/15 via-transparent to-cyan-500/20 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400" />

        <div className="relative p-4 md:p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                Tìm kiếm
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên, mã rạp, địa chỉ..."
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
                className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
              >
                <option value="ALL">Tất cả</option>
                <option value="ACTIVE">Đang hoạt động</option>
                <option value="INACTIVE">Tạm ngưng</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={fetchCinemas}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-[11px] font-semibold tracking-[0.16em] uppercase bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-400 text-black shadow-lg shadow-purple-500/40 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Đang tải..." : "Làm mới"}
            </button>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-[11px] font-semibold tracking-[0.16em] uppercase border border-emerald-400/70 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20 transition-all"
            >
              + Thêm rạp
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
              Danh sách rạp chiếu
            </h2>
            <p className="text-[11px] text-white/40">
              Hiển thị{" "}
              <span className="font-semibold">
                {filteredCinemas.length}
              </span>{" "}
              / <span className="font-semibold">{cinemas.length}</span> rạp
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-[0.18em] text-white/60 border-b border-white/10">
                  <th className="py-3 pr-4 text-left">Rạp</th>
                  <th className="py-3 px-4 text-left hidden md:table-cell">
                    Địa chỉ
                  </th>
                  <th className="py-3 px-4 text-left hidden lg:table-cell">
                    Liên hệ
                  </th>
                  <th className="py-3 px-4 text-left">Trạng thái</th>
                  <th className="py-3 pl-4 pr-2 text-right">Thao tác</th>
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
                ) : filteredCinemas.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-white/60 text-sm"
                    >
                      Không tìm thấy rạp nào khớp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredCinemas.map((c) => {
                    const id = c.cinemaId || c.id;
                    const name = c.name || c.cinemaName || "Không rõ tên";
                    const code = c.code || c.cinemaCode || "—";
                    const address = c.address || "";
                    const city = c.city || "";
                    const district = c.district || "";
                    const hotline = c.hotline || c.phone || "";
                    const isActive = c.isActive ?? c.active ?? true;

                    return (
                      <tr
                        key={id}
                        className="border-b border-white/5 hover:bg-white/5/10"
                      >
                        {/* Cinema */}
                        <td className="py-3 pr-4 align-top">
                          <div className="flex items-start gap-3">
                            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-violet-400 via-fuchsia-500 to-emerald-400 p-[1px] flex-shrink-0">
                              <div className="h-full w-full rounded-2xl bg-[#050012] flex items-center justify-center text-xs font-bold">
                                {name.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-white line-clamp-1">
                                {name}
                              </div>
                              <div className="text-[11px] text-white/50 mt-0.5">
                                Mã rạp:{" "}
                                <span className="font-mono text-[10px]">
                                  {code}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Address */}
                        <td className="py-3 px-4 align-top hidden md:table-cell">
                          <div className="text-xs text-white/80 line-clamp-2">
                            {address || (
                              <span className="text-white/40">
                                Chưa cập nhật
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-white/60 mt-0.5">
                            {district && city
                              ? `${district}, ${city}`
                              : city || district || ""}
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="py-3 px-4 align-top hidden lg:table-cell">
                          <div className="text-xs text-white/80">
                            {hotline || (
                              <span className="text-white/40">
                                Chưa có hotline
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 align-top">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${
                              isActive
                                ? "bg-emerald-500/10 text-emerald-200 border border-emerald-500/40"
                                : "bg-red-500/10 text-red-200 border border-red-500/40"
                            }`}
                          >
                            <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5 bg-current" />
                            {isActive ? "Đang hoạt động" : "Tạm ngưng"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 pl-4 pr-2 align-top">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(c)}
                              className="rounded-2xl px-3 py-2 text-[11px] font-semibold tracking-[0.14em] uppercase border border-white/30 bg-white/5 text-white hover:bg-white/15 transition-all"
                            >
                              Sửa
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(c)}
                              disabled={deletingId === id}
                              className="rounded-2xl px-3 py-2 text-[11px] font-semibold tracking-[0.14em] uppercase border border-red-500/60 bg-red-500/10 text-red-100 hover:bg-red-500/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                            >
                              {deletingId === id ? "Đang xóa..." : "Xóa"}
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

      {/* Modal Create / Edit */}
      {modalOpen && (
        <CinemaModal
          isEdit={!!editingCinema}
          form={form}
          saving={saving}
          onChange={handleFormChange}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
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

function CinemaModal({ isEdit, form, saving, onChange, onClose, onSubmit }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
      {/* overlay */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* content */}
      <div className="relative z-50 w-full max-w-xl rounded-3xl bg-gradient-to-br from-[#1a0033]/95 via-[#0b001f] to-black/95 border border-white/15 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-600/15 via-transparent to-cyan-500/20 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400" />

        <div className="relative p-6 md:p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-base md:text-lg font-extrabold tracking-[0.2em] uppercase bg-gradient-to-r from-cyan-300 to-pink-300 bg-clip-text text-transparent">
                {isEdit ? "Chỉnh sửa rạp chiếu" : "Thêm rạp chiếu mới"}
              </h3>
              <p className="mt-2 text-xs text-white/60">
                {isEdit
                  ? "Cập nhật thông tin chi tiết cho rạp."
                  : "Nhập thông tin cho rạp mới trong hệ thống."}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="ml-4 rounded-full bg-white/5 hover:bg-white/15 border border-white/20 p-1.5 text-white/70 hover:text-white transition-all"
            >
              ✕
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-[1.1fr,0.9fr] gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-white/70 mb-1.5 uppercase tracking-[0.16em]">
                  Tên rạp *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={onChange("name")}
                  className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                  placeholder="CinesVerse Vincom Center..."
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-white/70 mb-1.5 uppercase tracking-[0.16em]">
                  Mã rạp (code) *
                </label>
                <input
                  type="text"
                  value={form.code}
                  onChange={onChange("code")}
                  className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                  placeholder="CNS_VINCOM_Q1"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-white/70 mb-1.5 uppercase tracking-[0.16em]">
                Địa chỉ
              </label>
              <input
                type="text"
                value={form.address}
                onChange={onChange("address")}
                className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                placeholder="Số nhà, đường, khu vực..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-white/70 mb-1.5 uppercase tracking-[0.16em]">
                  Quận / Huyện
                </label>
                <input
                  type="text"
                  value={form.district}
                  onChange={onChange("district")}
                  className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                  placeholder="Quận 1, Quận 7..."
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-white/70 mb-1.5 uppercase tracking-[0.16em]">
                  Thành phố
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={onChange("city")}
                  className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                  placeholder="TP. Hồ Chí Minh..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-white/70 mb-1.5 uppercase tracking-[0.16em]">
                  Hotline
                </label>
                <input
                  type="text"
                  value={form.hotline}
                  onChange={onChange("hotline")}
                  className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                  placeholder="1900 xxxx..."
                />
              </div>
              <div className="flex items-end">
                <label className="inline-flex items-center gap-2 text-xs text-white/80">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={onChange("isActive")}
                    className="h-4 w-4 rounded border-white/40 bg-white/5"
                  />
                  <span>Đang hoạt động</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-white/70 mb-1.5 uppercase tracking-[0.16em]">
                Mô tả
              </label>
              <textarea
                rows={3}
                value={form.description}
                onChange={onChange("description")}
                className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all resize-none"
                placeholder="Mô tả ngắn về rạp, tiện ích, vị trí..."
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="flex-1 rounded-2xl border border-white/20 bg-white/5 py-3 text-xs font-semibold tracking-[0.16em] uppercase text-white hover:bg-white/10 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400 py-3 text-xs font-black tracking-[0.16em] uppercase text-black shadow-xl shadow-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/70 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {saving
                  ? isEdit
                    ? "Đang lưu..."
                    : "Đang tạo..."
                  : isEdit
                  ? "Lưu thay đổi"
                  : "Tạo rạp mới"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
