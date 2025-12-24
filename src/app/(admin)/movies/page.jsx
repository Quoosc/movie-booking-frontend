// src/app/(admin)/movies/page.jsx
import { useEffect, useMemo, useState } from "react";
import WarningModal from "@/components/shared/WarningModal";
import { AdminMovieService } from "@/api/adminservice";
import { uploadPoster } from "@/api/cloudinaryService";
import { toast } from "react-toastify";

const STATUS_OPTIONS = ["SHOWING", "UPCOMING"];

const EMPTY_FORM = {
  title: "",
  genre: "",
  description: "",
  duration: "",
  minimumAge: "",
  director: "",
  actors: "",
  posterUrl: "",
  posterCloudinaryId: "",
  trailerUrl: "",
  status: "UPCOMING",
  language: "",
};

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [uploadingPoster, setUploadingPoster] = useState(false);

  const [error] = useState(null);
  const [success, setSuccess] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // modal + form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  // Warning modal state (Seats-style)
  const [warning, setWarning] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });
  const [warningAnchor, setWarningAnchor] = useState(null);
  const showWarning = (message, title = "Lưu ý!", onConfirm = null, e) => {
    const nextAnchor =
      e && typeof e.clientX === "number" && typeof e.clientY === "number"
        ? { x: e.clientX, y: e.clientY }
        : null;
    setWarningAnchor(nextAnchor);
    setWarning({ open: true, title, message, onConfirm });
  };
  const closeWarning = () => {
    setWarningAnchor(null);
    setWarning({ open: false, title: "", message: "", onConfirm: null });
  };
  // ================= API =================

  const fetchMovies = async () => {
    try {
      setLoading(true);
setSuccess(null);

      // Gọi 2 API: SHOWING + UPCOMING rồi gộp lại
      const [showingRes, upcomingRes] = await Promise.all([
        AdminMovieService.filterMoviesByStatus("SHOWING"),
        AdminMovieService.filterMoviesByStatus("UPCOMING"),
      ]);

      const unwrap = (res) =>
        Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];

      const showingList = unwrap(showingRes);
      const upcomingList = unwrap(upcomingRes);

      const map = new Map();
      [...showingList, ...upcomingList].forEach((m) => {
        if (!m) return;
        if (m.movieId && !map.has(m.movieId)) {
          map.set(m.movieId, m);
        }
      });

      setMovies(Array.from(map.values()));
    } catch (err) {
      console.error("Fetch movies error:", err);
      const msg = err?.message || "Không tải được danh sách phim.";
toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingMovie(null);
    setForm(EMPTY_FORM);
setSuccess(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (movie) => {
    setEditingMovie(movie || null);
    setForm({
      title: movie?.title || "",
      genre: movie?.genre || "",
      description: movie?.description || "",
      duration: movie?.duration || "",
      minimumAge: movie?.minimumAge || "",
      director: movie?.director || "",
      actors: movie?.actors || "",
      posterUrl: movie?.posterUrl || "",
      posterCloudinaryId: movie?.posterCloudinaryId || "",
      trailerUrl: movie?.trailerUrl || "",
      status: movie?.status || "SHOWING",
      language: movie?.language || "",
    });
setSuccess(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (saving) return;
    setIsModalOpen(false);
  };

  const handleFormChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
setSuccess(null);

    // ===== Validate + toast like Promotions page =====
    if (!form.genre.trim()) {
      const msg = "Vui lòng nhập thể loại phim.";
toast.error(msg);
      return;
    }
    if (!form.description.trim()) {
      const msg = "Vui lòng nhập mô tả phim.";
toast.error(msg);
      return;
    }
    if (!form.director.trim()) {
      const msg = "Vui lòng nhập tên đạo diễn.";
toast.error(msg);
      return;
    }
    if (!form.actors.trim()) {
      const msg = "Vui lòng nhập danh sách diễn viên.";
toast.error(msg);
      return;
    }
    if (!form.trailerUrl.trim()) {
      const msg = "Vui lòng nhập Trailer URL.";
toast.error(msg);
      return;
    }
    if (!form.language.trim()) {
      const msg = "Vui lòng nhập ngôn ngữ.";
toast.error(msg);
      return;
    }

    // Payload
    const payload = {
      title: form.title.trim(),
      genre: form.genre.trim(),
      description: form.description.trim(),
      duration: Number(form.duration),
      minimumAge: form.minimumAge ? Number(form.minimumAge) : 0,
      director: form.director.trim(),
      actors: form.actors.trim(),
      posterUrl: form.posterUrl || null,
      posterCloudinaryId: form.posterCloudinaryId || null,
      trailerUrl: form.trailerUrl.trim(),
      status: form.status || "UPCOMING",
      language: form.language.trim(),
    };

    try {
      setSaving(true);

      if (editingMovie?.movieId) {
        // UPDATE
        const res = await AdminMovieService.updateMovie?.(
          editingMovie.movieId,
          payload
        );
        const updated = res?.data || res || payload;

        setMovies((prev) =>
          prev.map((m) =>
            m.movieId === editingMovie.movieId ? { ...m, ...updated } : m
          )
        );

        const msg = "Cập nhật thông tin phim thành công.";
        toast.success(msg);
      } else {
        // CREATE
        const res = await AdminMovieService.createMovie?.(payload);
        const created = res?.data || res || payload;
        setMovies((prev) => [created, ...prev]);

        const msg = "Thêm phim mới thành công.";
        toast.success(msg);
      }

      setIsModalOpen(false);
      setEditingMovie(null);
      setForm(EMPTY_FORM);
    } catch (err) {
      console.error("Save movie error:", err);
      const msg = err?.message || "Lưu thông tin phim thất bại.";
toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMovie = async (movieId, e) => {
    const confirmDelete = async () => {
      try {
        setDeletingId(movieId);
setSuccess(null);

        await AdminMovieService.deleteMovie?.(movieId);

        setMovies((prev) => prev.filter((m) => m.movieId !== movieId));

        const msg = "Xóa phim thành công.";
        toast.success(msg);
      } catch (err) {
        console.error("Delete movie error:", err);
        const msg = err?.message || "Xóa phim thất bại.";
toast.error(msg);
      } finally {
        setDeletingId(null);
        closeWarning();
      }
    };
    showWarning(
      "Bạn chắc chắn muốn xóa phim này?",
      "Lưu ý!",
      confirmDelete,
      e
    );
  };

  // ================= DERIVED DATA =================

  const filteredMovies = useMemo(() => {
    return movies.filter((m) => {
      const q = search.trim().toLowerCase();
      if (q) {
        const haystack = `${m.title || ""} ${m.genre || ""} ${
          m.language || ""
        }`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      if (statusFilter !== "ALL") {
        const st = (m.status || "").toUpperCase();
        if (st !== statusFilter) return false;
      }

      return true;
    });
  }, [movies, search, statusFilter]);

  const stats = useMemo(() => {
    const total = movies.length;
    let showing = 0,
      upcoming = 0;

    movies.forEach((m) => {
      const st = (m.status || "").toUpperCase();
      if (st === "SHOWING") showing++;
      else if (st === "UPCOMING") upcoming++;
    });

    return { total, showing, upcoming };
  }, [movies]);

  // ================= CLOUDINARY =================
  const handlePosterFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPoster(true);
      const { posterUrl, posterCloudinaryId } = await uploadPoster(file);

      setForm((prev) => ({
        ...prev,
        posterUrl,
        posterCloudinaryId,
      }));

      toast.success("Upload poster thành công!");
    } catch (err) {
      console.error("Upload poster error:", err);
      const msg = err?.message || "Upload poster thất bại.";
      toast.error(msg);
} finally {
      setUploadingPoster(false);
    }
  };

  // ================= RENDER =================

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
        anchor={warningAnchor}
      />

      {/* Header */}
      <header className="space-y-3">
        <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-cyan-400/70">
          ADMIN • MOVIES
        </p>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-[0.16em] uppercase">
          <span className="bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Quản lý phim
          </span>
        </h1>
        <p className="text-xs md:text-sm text-white/60 max-w-2xl">
          Thêm mới, chỉnh sửa và quản lý trạng thái phim đang chiếu / sắp chiếu
          trên CinesVerse.
        </p>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          label="Tổng số phim"
          value={stats.total}
          gradient="from-cyan-400/80 via-cyan-500/70 to-emerald-400/80"
        />
        <StatCard
          label="Đang chiếu (SHOWING)"
          value={stats.showing}
          gradient="from-violet-500/80 via-fuchsia-500/80 to-pink-400/80"
        />
        <StatCard
          label="Sắp chiếu (UPCOMING)"
          value={stats.upcoming}
          gradient="from-amber-400/80 via-orange-500/80 to-rose-400/80"
        />
      </section>

      {/* Bộ lọc + actions */}
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
                placeholder="Tìm theo tên phim, thể loại, ngôn ngữ..."
                className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
              />
            </div>

            <div className="w-full sm:w-52">
              <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                Lọc theo trạng thái
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
                <option value="SHOWING">Đang chiếu</option>
                <option value="UPCOMING">Sắp chiếu</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:self-end">
            <button
              type="button"
              onClick={fetchMovies}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-xs font-semibold tracking-[0.16em] uppercase bg-white/5 border border-white/20 text-white hover:bg-white/10 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Đang tải..." : "Làm mới"}
            </button>

            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-xs font-semibold tracking-[0.16em] uppercase bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-400 text-black shadow-lg shadow-purple-500/40 hover:brightness-110 transition-all"
            >
              + Thêm phim mới
            </button>
          </div>
        </div>
      </section>

      {/* Alert */}
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
              Danh sách phim
            </h2>
            <p className="text-[11px] text-white/40">
              Hiển thị{" "}
              <span className="font-semibold">{filteredMovies.length}</span> /{" "}
              <span className="font-semibold">{movies.length}</span> movies
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-[0.18em] text-white/60 border-b border-white/10">
                  <th className="py-3 pr-4 text-left">Phim</th>
                  <th className="py-3 px-4 text-left hidden md:table-cell">
                    Thông tin
                  </th>
                  <th className="py-3 px-4 text-left hidden lg:table-cell">
                    Trạng thái
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
                ) : filteredMovies.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-8 text-center text-white/60 text-sm"
                    >
                      Không tìm thấy phim nào khớp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredMovies.map((m) => {
                    const status = (m.status || "").toUpperCase();
                    return (
                      <tr
                        key={m.movieId}
                        className="border-b border-white/5 hover:bg-white/5/10"
                      >
                        {/* Movie basic */}
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-3">
                            {/* Poster / avatar */}
                            <div className="relative">
                              <div className="h-12 w-9 rounded-xl bg-gradient-to-br from-violet-400 via-fuchsia-500 to-emerald-400 p-[1px] overflow-hidden">
                                <div className="h-full w-full rounded-[10px] bg-[#050012] flex items-center justify-center text-[10px] font-bold text-white/70">
                                  {m.posterUrl ? (
                                    <img
                                      src={m.posterUrl}
                                      alt={m.title}
                                      className="h-full w-full object-cover rounded-[9px]"
                                    />
                                  ) : (
                                    "NO POSTER"
                                  )}
                                </div>
                              </div>
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-white line-clamp-2">
                                {m.title || "Chưa có tiêu đề"}
                              </div>
                              <div className="text-[11px] text-white/50 mt-0.5">
                                {m.genre || "Thể loại: N/A"}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Detail */}
                        <td className="py-3 px-4 align-top hidden md:table-cell">
                          <div className="text-[11px] text-white/70">
                            Thời lượng:{" "}
                            <span className="font-semibold">
                              {m.duration ? `${m.duration} phút` : "N/A"}
                            </span>
                          </div>
                          <div className="text-[11px] text-white/70 mt-0.5">
                            Độ tuổi:{" "}
                            <span className="font-semibold">
                              {m.minimumAge
                                ? `${m.minimumAge}+`
                                : "Không giới hạn"}
                            </span>
                          </div>
                          <div className="text-[11px] text-white/60 mt-0.5">
                            Ngôn ngữ:{" "}
                            <span className="font-semibold">
                              {m.language || "N/A"}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 align-top hidden lg:table-cell">
                          <StatusBadge status={status} />
                        </td>

                        {/* Actions */}
                        <td className="py-3 pl-4 pr-2 align-top">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(m)}
                              className="rounded-2xl px-3 py-2 text-[11px] font-semibold tracking-[0.14em] uppercase bg-white/5 border border-white/20 text-white hover:bg-white/10 transition-all"
                            >
                              Sửa
                            </button>

                            <button
                              type="button"
                              onClick={(e) => handleDeleteMovie(m.movieId, e)}
                              disabled={deletingId === m.movieId}
                              className="rounded-2xl px-3 py-2 text-[11px] font-semibold tracking-[0.14em] uppercase border border-red-500/60 bg-red-500/10 text-red-100 hover:bg-red-500/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                            >
                              {deletingId === m.movieId ? "Đang xóa..." : "Xóa"}
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

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <MovieModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          saving={saving}
          editingMovie={editingMovie}
          onPosterFileChange={handlePosterFileChange}
          uploadingPoster={uploadingPoster}
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

function StatusBadge({ status }) {
  let label = "Không rõ";
  let cls =
    "bg-white/5 border border-white/20 text-white text-[11px] px-2.5 py-1 rounded-2xl inline-flex items-center gap-1";

  if (status === "SHOWING") {
    label = "Đang chiếu";
    cls =
      "bg-emerald-500/10 border border-emerald-400/60 text-emerald-100 text-[11px] px-2.5 py-1 rounded-2xl inline-flex items-center gap-1";
  } else if (status === "UPCOMING") {
    label = "Sắp chiếu";
    cls =
      "bg-amber-500/10 border border-amber-400/60 text-amber-100 text-[11px] px-2.5 py-1 rounded-2xl inline-flex items-center gap-1";
  }

  return (
    <span className={cls}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

function MovieModal({
  isOpen,
  onClose,
  form,
  setForm,
  onSubmit,
  saving,
  editingMovie,
  onPosterFileChange,
  uploadingPoster,
}) {
  if (!isOpen) return null;

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const isEdit = Boolean(editingMovie?.movieId);

  return (
    <div
      className="
        fixed inset-0 z-[60]
        flex items-center justify-center
        px-4 py-8
        bg-black/70 backdrop-blur-xl
      "
    >
      <div
        className="
          relative w-full max-w-2xl
          rounded-3xl overflow-hidden
          bg-gradient-to-br from-[#160033]/95 via-[#080017] to-black
          border border-white/15
          shadow-[0_0_60px_rgba(123,66,255,0.6)]
          max-h-screen
        "
      >
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-transparent to-cyan-500/20 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400" />

        <div className="relative p-6 md:p-8 ">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-cyan-400/70 mb-1">
                {isEdit ? "CHỈNH SỬA PHIM" : "THÊM PHIM MỚI"}
              </p>
              <h2 className="text-xl md:text-2xl font-black tracking-[0.16em] uppercase bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-300 bg-clip-text text-transparent">
                {isEdit
                  ? editingMovie?.title || "Cập nhật phim"
                  : "Thông tin phim"}
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

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-white/70 mb-2 uppercase tracking-[0.18em]">
                  Tên phim *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={handleChange("title")}
                  className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                  placeholder="Tên phim..."
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-white/70 mb-2 uppercase tracking-[0.18em]">
                  Thể loại
                </label>
                <input
                  type="text"
                  value={form.genre}
                  onChange={handleChange("genre")}
                  className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                  placeholder="Ví dụ: Action, Drama..."
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-white/70 mb-2 uppercase tracking-[0.18em]">
                  Thời lượng (phút) *
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.duration}
                  onChange={handleChange("duration")}
                  className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                  placeholder="120"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-white/70 mb-2 uppercase tracking-[0.18em]">
                  Độ tuổi
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.minimumAge}
                  onChange={handleChange("minimumAge")}
                  className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                  placeholder="13, 16, 18..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-white/70 mb-2 uppercase tracking-[0.18em]">
                  Ngôn ngữ
                </label>
                <input
                  type="text"
                  value={form.language}
                  onChange={handleChange("language")}
                  className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                  placeholder="English, Tiếng Việt..."
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-white/70 mb-2 uppercase tracking-[0.18em]">
                  Đạo diễn
                </label>
                <input
                  type="text"
                  value={form.director}
                  onChange={handleChange("director")}
                  className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                  placeholder="Tên đạo diễn…"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-white/70 mb-2 uppercase tracking-[0.18em]">
                  Diễn viên
                </label>
                <input
                  type="text"
                  value={form.actors}
                  onChange={handleChange("actors")}
                  className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                  placeholder="Danh sách diễn viên chính…"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-white/70 mb-2 uppercase tracking-[0.18em]">
                  Trạng thái
                </label>
                <select
                  value={form.status}
                  onChange={handleChange("status")}
                  className="cv-select-dark w-full rounded-full bg-gradient-to-r from-[#1b0b3a] via-[#14002b] to-[#050012]
                  border border-cyan-400/60 px-4 py-3 text-sm font-semibold text-white
                  shadow-[0_0_0_1px_rgba(15,23,42,0.9)]
                  focus:outline-none focus:ring-2 focus:ring-cyan-400/70 focus:border-transparent
                  transition-all"
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st === "SHOWING" ? "Đang chiếu" : "Sắp chiếu"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-white/70 mb-2 uppercase tracking-[0.18em]">
                  Trailer URL
                </label>
                <input
                  type="text"
                  value={form.trailerUrl}
                  onChange={handleChange("trailerUrl")}
                  className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                  placeholder="https://youtube.com/..."
                />
              </div>
            </div>

            {/* Chọn file poster (Cloudinary) */}
            <div className="grid md:grid-cols-[2fr,1fr] gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-white/70 mb-2 uppercase tracking-[0.18em]">
                  Poster phim
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onPosterFileChange}
                  disabled={uploadingPoster || saving}
                  className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-3 text-sm text-white
                 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0
                 file:bg-violet-500/80 file:text-black file:font-semibold
                 hover:file:bg-violet-400
                 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                />
                {uploadingPoster && (
                  <p className="mt-2 text-xs text-cyan-300">
                    Đang upload poster
                  </p>
                )}
                {form.posterUrl && (
                  <p className="mt-2 text-xs text-white/60 break-all">
                    URL: <span className="text-cyan-300">{form.posterUrl}</span>
                  </p>
                )}
              </div>

              {/* Preview nhỏ cho vui */}
              <div className="flex items-end justify-center">
                <div className="h-32 w-24 rounded-2xl bg-white/5 border border-white/15 overflow-hidden flex items-center justify-center text-[10px] text-white/50">
                  {form.posterUrl ? (
                    <img
                      src={form.posterUrl}
                      alt={form.title || "Poster preview"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    "Chưa có poster"
                  )}
                </div>
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
                className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-3 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all resize-none"
                placeholder="Tóm tắt nội dung phim..."
              />
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
                  : "Tạo phim"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
