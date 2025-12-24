// src/app/(admin)/rooms/page.jsx
import { useEffect, useMemo, useState } from "react";
import WarningModal from "@/components/shared/WarningModal";
import { AdminCinemaService } from "@/api/adminservice";
import { toast } from "react-toastify";

const EMPTY_FORM = {
  cinemaId: "",
  roomType: "",
  roomNumber: "",
};

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [cinemas, setCinemas] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error] = useState(null);

  const [search, setSearch] = useState("");
  const [cinemaFilter, setCinemaFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

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

  // ====== LOAD DATA ======
  const fetchData = async () => {
    try {
      setLoading(true);
const [roomsRes, cinemasRes] = await Promise.all([
        AdminCinemaService.getRooms(), // rooms API
        AdminCinemaService.getCinemas?.(),
      ]);

      const unwrap = (res) =>
        Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];

      setRooms(unwrap(roomsRes));
      setCinemas(unwrap(cinemasRes));
    } catch (err) {
      console.error("AdminRooms fetchData error:", err);
      const msg = err?.message || "Không tải được danh sách phòng chiếu.";
toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // map cinemaId -> cinema
  const cinemaMap = useMemo(() => {
    const map = {};
    cinemas.forEach((c) => {
      map[c.cinemaId || c.id] = c;
    });
    return map;
  }, [cinemas]);

  const roomTypeOptions = useMemo(() => {
    const set = new Set();
    rooms.forEach((r) => {
      if (r.roomType) set.add(r.roomType);
    });
    return Array.from(set);
  }, [rooms]);

  // ====== MODAL HANDLERS ======
  const openCreateModal = () => {
    setEditingRoom(null);
    setForm(EMPTY_FORM);
setIsModalOpen(true);
  };

  const openEditModal = (room) => {
    setEditingRoom(room);
    setForm({
      cinemaId: room.cinemaId || "",
      roomType: room.roomType || "",
      roomNumber: room.roomNumber ?? "",
    });
setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setIsModalOpen(false);
    setEditingRoom(null);
    setForm(EMPTY_FORM);
  };

  const handleFormChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // ====== SAVE / DELETE ======
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.cinemaId && !editingRoom) {
      const msg = "Vui lòng chọn rạp cho phòng chiếu.";
toast.error(msg);
      return;
    }
    if (!form.roomType.trim()) {
      const msg = "Vui lòng nhập loại phòng (STANDARD, IMAX...)";
toast.error(msg);
      return;
    }
    if (!form.roomNumber || Number(form.roomNumber) <= 0) {
      const msg = "Số phòng phải là số nguyên dương.";
toast.error(msg);
      return;
    }

    const payload = {
      cinemaId: form.cinemaId || editingRoom?.cinemaId,
      roomType: form.roomType.trim(),
      roomNumber: Number(form.roomNumber),
    };

    try {
      setSaving(true);
if (editingRoom) {
        const roomId = editingRoom.roomId;
        const updated = await AdminCinemaService.updateRoom(roomId, payload);
        const updatedRoom = updated?.data ?? updated ?? payload;

        setRooms((prev) =>
          prev.map((r) =>
            r.roomId === roomId ? { ...r, ...updatedRoom } : r
          )
        );

        toast.success("Cập nhật phòng chiếu thành công.");
      } else {
        const created = await AdminCinemaService.createRoom(payload);
        const createdRoom = created?.data ?? created ?? payload;

        setRooms((prev) => [createdRoom, ...prev]);
        toast.success("Thêm phòng chiếu mới thành công.");
      }

      closeModal();
    } catch (err) {
      console.error("Save room error:", err);
      const msg = err?.message || "Lưu thông tin phòng chiếu thất bại.";
toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (room) => {
    const roomId = room.roomId;
    if (!roomId) return;

    const cinema = cinemaMap[room.cinemaId];
    const cinemaName = cinema?.name || cinema?.cinemaName || "Rạp";

    const confirmDelete = async () => {
      try {
        setDeletingId(roomId);
await AdminCinemaService.deleteRoom(roomId);

        setRooms((prev) => prev.filter((r) => r.roomId !== roomId));
        toast.success("Xóa phòng chiếu thành công.");
      } catch (err) {
        console.error("Delete room error:", err);
        const msg = err?.message || "Xóa phòng chiếu thất bại.";
toast.error(msg);
      } finally {
        setDeletingId(null);
        closeWarning();
      }
    };

    showWarning(
      `Bạn chắc chắn muốn xóa phòng ${room.roomNumber} (${room.roomType}) của ${cinemaName}?`,
      "Lưu ý!",
      confirmDelete
    );
  };

  // ====== DERIVED DATA ======
  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      const cinema = cinemaMap[r.cinemaId] || {};
      const q = search.trim().toLowerCase();

      if (q) {
        const haystack = `${cinema.name || cinema.cinemaName || ""} ${
          cinema.code || cinema.cinemaCode || ""
        } ${r.roomType || ""} ${r.roomNumber || ""}`
          .toString()
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      if (cinemaFilter !== "ALL" && r.cinemaId !== cinemaFilter) return false;

      if (typeFilter !== "ALL") {
        if ((r.roomType || "").toUpperCase() !== typeFilter.toUpperCase())
          return false;
      }

      return true;
    });
  }, [rooms, cinemaMap, search, cinemaFilter, typeFilter]);

  const stats = useMemo(() => {
    const total = rooms.length;
    const uniqueCinemas = new Set(rooms.map((r) => r.cinemaId)).size;
    const imaxCount = rooms.filter(
      (r) => (r.roomType || "").toUpperCase() === "IMAX"
    ).length;

    return { total, uniqueCinemas, imaxCount };
  }, [rooms]);

  // ====== RENDER ======
  return (
    <div
      className={`space-y-8 lg:space-y-10 ${
        isModalOpen ? "h-screen overflow-hidden" : ""
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
          ADMIN • ROOMS
        </p>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-[0.16em] uppercase">
          <span className="bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Quản lý phòng chiếu
          </span>
        </h1>
        <p className="text-xs md:text-sm text-white/60 max-w-2xl">
          Thêm mới, chỉnh sửa và quản lý phòng chiếu cho từng rạp trong CinesVerse.
        </p>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          label="Tổng số phòng"
          value={stats.total}
          gradient="from-cyan-400/80 via-cyan-500/70 to-emerald-400/80"
        />
        <StatCard
          label="Số rạp có phòng"
          value={stats.uniqueCinemas}
          gradient="from-violet-500/80 via-fuchsia-500/80 to-pink-400/80"
        />
        <StatCard
          label="Số phòng IMAX"
          value={stats.imaxCount}
          gradient="from-amber-400/80 via-orange-500/80 to-rose-400/80"
        />
      </section>

      {/* Filters + actions */}
      <section className="relative rounded-3xl bg-gradient-to-br from-[#160033]/85 via-[#090019]/95 to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/15 via-transparent to-cyan-500/20 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400" />

        <div className="relative p-4 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_auto] gap-4 items-end">
            {/* LEFT: Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Search */}
              <div>
                <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                  Tìm kiếm
                </label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm theo rạp, mã rạp, loại phòng, số phòng..."
                  className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                />
              </div>

              {/* Filter by cinema */}
              <div>
                <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                  Rạp chiếu
                </label>
                <select
                  value={cinemaFilter}
                  onChange={(e) => setCinemaFilter(e.target.value)}
                  className="cv-select-dark w-full rounded-full bg-gradient-to-r from-[#1b0b3a] via-[#14002b] to-[#050012]
                    border border-cyan-400/60 px-4 py-2.5 text-xs md:text-sm font-semibold text-white
                    shadow-[0_0_0_1px_rgba(15,23,42,0.9)]
                    focus:outline-none focus:ring-2 focus:ring-cyan-400/70 focus:border-transparent
                    transition-all"
                >
                  <option value="ALL">Tất cả rạp</option>
                  {cinemas.map((c) => (
                    <option key={c.cinemaId || c.id} value={c.cinemaId || c.id}>
                      {c.name || c.cinemaName || "Rạp"}{" "}
                      {(c.code || c.cinemaCode) &&
                        `(${c.code || c.cinemaCode})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter by room type */}
              <div>
                <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                  Loại phòng
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="cv-select-dark w-full rounded-full bg-gradient-to-r from-[#1b0b3a] via-[#14002b] to-[#050012]
                    border border-cyan-400/60 px-4 py-2.5 text-xs md:text-sm font-semibold text-white
                    shadow-[0_0_0_1px_rgba(15,23,42,0.9)]
                    focus:outline-none focus:ring-2 focus:ring-cyan-400/70 focus:border-transparent
                    transition-all"
                >
                  <option value="ALL">Tất cả</option>
                  {roomTypeOptions.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* RIGHT: Actions */}
            <div className="flex flex-col sm:flex-row gap-2 lg:justify-end">
              <button
                type="button"
                onClick={fetchData}
                disabled={loading}
                className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-[11px] font-semibold tracking-[0.16em] uppercase bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-400 text-black shadow-lg shadow-purple-500/40 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {loading ? "Đang tải..." : "Làm mới"}
              </button>

              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-[11px] font-semibold tracking-[0.16em] uppercase bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-400 text-black shadow-lg shadow-purple-500/40 hover:brightness-110 transition-all"
              >
                + Thêm phòng
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Error Alert only */}
      {error && (
        <section className="space-y-3">
          <div className="rounded-2xl border border-red-500/60 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        </section>
      )}

      {/* Table */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a0033]/90 via-[#0b001f] to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-600/15 via-transparent to-cyan-500/15 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400" />

        <div className="relative p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm md:text-base font-extrabold tracking-[0.2em] uppercase text-white/80">
              Danh sách phòng chiếu
            </h2>
            <p className="text-[11px] text-white/40">
              Hiển thị{" "}
              <span className="font-semibold">{filteredRooms.length}</span> /{" "}
              <span className="font-semibold">{rooms.length}</span> phòng
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-[0.18em] text-white/60 border-b border-white/10">
                  <th className="py-3 pr-4 text-left">Phòng</th>
                  <th className="py-3 px-4 text-left hidden md:table-cell">
                    Rạp chiếu
                  </th>
                  <th className="py-3 px-4 text-left hidden lg:table-cell">
                    Thông tin
                  </th>
                  <th className="py-3 pl-4 pr-2 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-8 text-center text-white/60 text-sm"
                    >
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : filteredRooms.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-8 text-center text-white/60 text-sm"
                    >
                      Không tìm thấy phòng nào khớp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredRooms.map((r) => {
                    const cinema = cinemaMap[r.cinemaId] || {};
                    const cinemaName =
                      cinema.name || cinema.cinemaName || "Không rõ rạp";
                    const cinemaCode = cinema.code || cinema.cinemaCode || "—";

                    return (
                      <tr
                        key={r.roomId}
                        className="border-b border-white/5 hover:bg-white/5/10"
                      >
                        {/* Room */}
                        <td className="py-3 pr-4 align-top">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-violet-400 via-fuchsia-500 to-emerald-400 p-[1px] flex-shrink-0">
                              <div className="h-full w-full rounded-2xl bg-[#050012] flex items-center justify-center text-xs font-bold text-white">
                                {r.roomNumber ?? "?"}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-white">
                                Phòng {r.roomNumber ?? "N/A"}
                              </div>
                              <div className="text-[11px] text-white/60 mt-0.5">
                                Loại:{" "}
                                <span className="font-semibold">
                                  {r.roomType || "N/A"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Cinema */}
                        <td className="py-3 px-4 align-top hidden md:table-cell">
                          <div className="text-xs text-white/80 line-clamp-1">
                            {cinemaName}
                          </div>
                          <div className="text-[11px] text-white/50 mt-0.5">
                            Mã rạp:{" "}
                            <span className="font-mono text-[10px]">
                              {cinemaCode}
                            </span>
                          </div>
                        </td>

                        {/* Info */}
                        <td className="py-3 px-4 align-top hidden lg:table-cell">
                          <div className="text-[11px] text-white/70">
                            ID phòng:{" "}
                            <span className="font-mono text-[10px]">
                              {r.roomId?.slice(0, 8)}…
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 pl-4 pr-2 align-top">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(r)}
                              className="rounded-2xl px-3 py-2 text-[11px] font-semibold tracking-[0.14em] uppercase border border-white/30 bg-white/5 text-white hover:bg-white/15 transition-all"
                            >
                              Sửa
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(r)}
                              disabled={deletingId === r.roomId}
                              className="rounded-2xl px-3 py-2 text-[11px] font-semibold tracking-[0.14em] uppercase border border-red-500/60 bg-red-500/10 text-red-100 hover:bg-red-500/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                            >
                              {deletingId === r.roomId ? "Đang xóa..." : "Xóa"}
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

      {/* Modal */}
      {isModalOpen && (
        <RoomModal
          isEdit={!!editingRoom}
          cinemas={cinemas}
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

function RoomModal({
  isEdit,
  cinemas,
  form,
  saving,
  onChange,
  onClose,
  onSubmit,
}) {
  return (
    <div
      className="
        fixed inset-0 z-40
        flex items-start justify-center
        px-4
        bg-black/70 backdrop-blur-sm
        overflow-y-auto
      "
    >
      {/* overlay */}
      <div className="absolute inset-0" onClick={onClose} />
      {/* content */}
      <div
        className="
          relative z-50
          w-full max-w-lg
          mt-24 mb-10
          rounded-3xl bg-gradient-to-br from-[#1a0033]/95 via-[#0b001f] to-black/95
          border border-white/15 shadow-2xl overflow-hidden
        "
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-600/15 via-transparent to-cyan-500/20 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400" />

        <div className="relative p-6 md:p-8 max-h-[80vh] overflow-y-auto">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-cyan-400/70 mb-1">
                {isEdit ? "CHỈNH SỬA PHÒNG" : "THÊM PHÒNG MỚI"}
              </p>
              <h2 className="text-xl md:text-2xl font-black tracking-[0.16em] uppercase bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-300 bg-clip-text text-transparent">
                Thông tin phòng chiếu
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-full bg-white/5 hover:bg-white/10 border border-white/20 w-8 h-8 flex items-center justify-center text-white/70 text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              ✕
            </button>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {!isEdit && (
              <div>
                <label className="block text-[11px] font-semibold text-white/70 mb-1.5 uppercase tracking-[0.16em]">
                  Rạp chiếu *
                </label>
                <select
                  value={form.cinemaId}
                  onChange={onChange("cinemaId")}
                  className="cv-select-dark w-full rounded-full bg-gradient-to-r from-[#1b0b3a] via-[#14002b] to-[#050012]
                    border border-cyan-400/60 px-4 py-2.5 text-xs md:text-sm font-semibold text-white
                    shadow-[0_0_0_1px_rgba(15,23,42,0.9)]
                    focus:outline-none focus:ring-2 focus:ring-cyan-400/70 focus:border-transparent
                    transition-all"
                >
                  <option value="">Chọn rạp...</option>
                  {cinemas.map((c) => (
                    <option key={c.cinemaId || c.id} value={c.cinemaId || c.id}>
                      {c.name || c.cinemaName || "Rạp"}{" "}
                      {(c.code || c.cinemaCode) &&
                        `(${c.code || c.cinemaCode})`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-white/70 mb-1.5 uppercase tracking-[0.16em]">
                  Loại phòng *
                </label>
                <input
                  type="text"
                  value={form.roomType}
                  onChange={onChange("roomType")}
                  className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                  placeholder="STANDARD, IMAX, 4DX..."
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-white/70 mb-1.5 uppercase tracking-[0.16em]">
                  Số phòng *
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.roomNumber}
                  onChange={onChange("roomNumber")}
                  className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                  placeholder="1, 2, 3..."
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="flex-1 rounded-2xl border border-white/20 bg-white/5 py-3.5 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400 py-3.5 font-black text-sm text-black shadow-xl shadow-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/70 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {saving
                  ? isEdit
                    ? "Đang lưu..."
                    : "Đang tạo..."
                  : isEdit
                  ? "Lưu thay đổi"
                  : "Tạo phòng"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
