// src/app/(admin)/showtimes/page.jsx
import { useEffect, useMemo, useState } from "react";
import { AdminMovieService, AdminCinemaService } from "@/api/adminservice";

const STATUS_FILTERS = ["ALL", "UPCOMING", "PAST"];

export default function AdminShowtimesPage() {
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [rooms, setRooms] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [movieFilter, setMovieFilter] = useState("ALL");
  const [cinemaFilter, setCinemaFilter] = useState("ALL");
  const [roomFilter, setRoomFilter] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // modal form
  const [modalOpen, setModalOpen] = useState(false);
  const [editingShowtime, setEditingShowtime] = useState(null);
  const [form, setForm] = useState({
    movieId: "",
    cinemaId: "",
    roomId: "",
    format: "",
    startDateTime: "",
  });

  /* ===================== LOAD DATA ===================== */

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const [stRes, moviesRes, cinemasRes, roomsRes] = await Promise.all([
        AdminMovieService.getAllShowtimes(),
        AdminMovieService.getMovies({}),
        AdminCinemaService.getCinemas(),
        AdminCinemaService.getRooms(),
      ]);

      setShowtimes(Array.isArray(stRes) ? stRes : []);
      setMovies(Array.isArray(moviesRes) ? moviesRes : []);
      setCinemas(Array.isArray(cinemasRes) ? cinemasRes : []);
      setRooms(Array.isArray(roomsRes) ? roomsRes : []);
    } catch (err) {
      console.error("Load showtimes error:", err);
      setError(err?.message || "Không tải được danh sách suất chiếu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ===================== HELPERS ===================== */

  const cinemaMap = useMemo(() => {
    const map = {};
    cinemas.forEach((c) => {
      map[c.cinemaId] = c;
    });
    return map;
  }, [cinemas]);

  const roomMap = useMemo(() => {
    const map = {};
    rooms.forEach((r) => {
      map[r.roomId] = r;
    });
    return map;
  }, [rooms]);

  const movieMap = useMemo(() => {
    const map = {};
    movies.forEach((m) => {
      map[m.movieId] = m;
    });
    return map;
  }, [movies]);

  const formatDateTimeLabel = (isoString) => {
    if (!isoString) return "—";
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return isoString;

    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");

    const weekday = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][d.getDay()];

    return `${weekday}, ${dd}/${mm}/${yyyy} • ${hh}:${min}`;
  };

  const toDateTimeInputValue = (isoString) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return "";
    const pad = (n) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const min = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  const fromDateTimeInputToIso = (value) => {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString();
  };

  const isUpcoming = (isoString) => {
    if (!isoString) return false;
    const now = new Date();
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return false;
    return d.getTime() >= now.getTime();
  };

  /* ===================== FILTERED DATA ===================== */

  const filteredShowtimes = useMemo(() => {
    return showtimes.filter((st) => {
      const movie = st.movie || movieMap[st.movieId];
      const room = st.room || roomMap[st.roomId];
      const cinema = cinemaMap[room?.cinemaId];

      // Search by movie title
      const q = search.trim().toLowerCase();
      if (q) {
        const haystack = `${movie?.title || ""} ${movie?.genre || ""}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      // Filter by movie
      if (movieFilter !== "ALL") {
        if ((movie?.movieId || st.movieId) !== movieFilter) return false;
      }

      // Filter by cinema
      if (cinemaFilter !== "ALL") {
        if (!cinema || cinema.cinemaId !== cinemaFilter) return false;
      }

      // Filter by room
      if (roomFilter !== "ALL") {
        if (!room || room.roomId !== roomFilter) return false;
      }

      // Status filter: upcoming / past
      if (statusFilter !== "ALL") {
        const up = isUpcoming(st.startTime);
        if (statusFilter === "UPCOMING" && !up) return false;
        if (statusFilter === "PAST" && up) return false;
      }

      // Date range
      if (st.startTime) {
        const start = new Date(st.startTime);
        if (!Number.isNaN(start.getTime())) {
          if (dateFrom) {
            const from = new Date(`${dateFrom}T00:00:00`);
            if (start < from) return false;
          }
          if (dateTo) {
            const to = new Date(`${dateTo}T23:59:59`);
            if (start > to) return false;
          }
        }
      }

      return true;
    });
  }, [
    showtimes,
    search,
    movieFilter,
    cinemaFilter,
    roomFilter,
    statusFilter,
    dateFrom,
    dateTo,
    movieMap,
    roomMap,
    cinemaMap,
  ]);

  const stats = useMemo(() => {
    const total = showtimes.length;
    let upcoming = 0;
    let past = 0;

    showtimes.forEach((st) => {
      if (isUpcoming(st.startTime)) upcoming++;
      else past++;
    });

    return { total, upcoming, past };
  }, [showtimes]);

  /* ===================== FORM / MODAL ===================== */

  const openCreateModal = () => {
    setEditingShowtime(null);
    setForm({
      movieId: "",
      cinemaId: "",
      roomId: "",
      format: "",
      startDateTime: "",
    });
    setError(null);
    setSuccess(null);
    setModalOpen(true);
  };

  const openEditModal = (st) => {
    const movieId = st.movie?.movieId || st.movieId || "";
    const roomId = st.room?.roomId || st.roomId || "";
    const room = st.room || roomMap[roomId];
    const cinemaId = room?.cinemaId || "";

    setEditingShowtime(st);
    setForm({
      movieId,
      cinemaId,
      roomId,
      format: st.format || "",
      startDateTime: toDateTimeInputValue(st.startTime),
    });
    setError(null);
    setSuccess(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingShowtime(null);
  };

  const handleFormChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "cinemaId"
        ? { roomId: "" } // reset room nếu đổi cinema
        : {}),
    }));
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const { movieId, cinemaId, roomId, format, startDateTime } = form;

    if (!movieId || !roomId || !format || !startDateTime) {
      setError("Vui lòng nhập đầy đủ Movie, Cinema/Room, Format và Thời gian.");
      return;
    }

    const startTimeIso = fromDateTimeInputToIso(startDateTime);
    if (!startTimeIso) {
      setError("Thời gian suất chiếu không hợp lệ.");
      return;
    }

    const payload = {
      movieId,
      roomId,
      format,
      startTime: startTimeIso,
    };

    try {
      setSaving(true);

      if (editingShowtime) {
        await AdminMovieService.updateShowtime(editingShowtime.showtimeId, payload);
        setSuccess("Cập nhật suất chiếu thành công.");
      } else {
        await AdminMovieService.createShowtime(payload);
        setSuccess("Tạo suất chiếu mới thành công.");
      }

      await loadData();
      setModalOpen(false);
      setEditingShowtime(null);
    } catch (err) {
      console.error("Save showtime error:", err);
      setError(err?.message || "Lưu suất chiếu thất bại.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteShowtime = async (showtimeId) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa suất chiếu này?")) return;
    try {
      setDeletingId(showtimeId);
      setError(null);
      setSuccess(null);

      await AdminMovieService.deleteShowtime(showtimeId);
      setShowtimes((prev) => prev.filter((st) => st.showtimeId !== showtimeId));
      setSuccess("Xóa suất chiếu thành công.");
    } catch (err) {
      console.error("Delete showtime error:", err);
      setError(err?.message || "Xóa suất chiếu thất bại.");
    } finally {
      setDeletingId(null);
    }
  };

  /* ===================== OPTIONS ===================== */

  const filteredRoomsForCinema = useMemo(() => {
    if (cinemaFilter === "ALL" && !form.cinemaId) return rooms;
    const cid = form.cinemaId || cinemaFilter;
    if (!cid || cid === "ALL") return rooms;
    return rooms.filter((r) => r.cinemaId === cid);
  }, [rooms, cinemaFilter, form.cinemaId]);

  /* ===================== RENDER ===================== */

  return (
    <div className="space-y-8 lg:space-y-10">
      {/* Header */}
      <header className="space-y-3">
        <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-cyan-400/70">
          ADMIN • SHOWTIMES
        </p>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-[0.16em] uppercase">
          <span className="bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Quản lý suất chiếu
          </span>
        </h1>
        <p className="text-xs md:text-sm text-white/60 max-w-2xl">
          Tạo, chỉnh sửa và lọc danh sách suất chiếu cho toàn bộ rạp CinesVerse.
        </p>
      </header>

      {/* Stat cards */}
      <section className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          label="Tổng suất chiếu"
          value={stats.total}
          gradient="from-cyan-400/80 via-cyan-500/70 to-emerald-400/80"
        />
        <StatCard
          label="Upcoming"
          value={stats.upcoming}
          gradient="from-violet-500/80 via-fuchsia-500/80 to-pink-400/80"
        />
        <StatCard
          label="Đã chiếu"
          value={stats.past}
          gradient="from-amber-400/80 via-orange-500/80 to-rose-400/80"
        />
      </section>

      {/* Filters + toolbar */}
      <section className="relative rounded-3xl bg-gradient-to-br from-[#160033]/85 via-[#090019]/95 to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/15 via-transparent to-cyan-500/20 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400" />

        <div className="relative p-4 md:p-6 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* search */}
              <div>
                <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                  Tìm theo phim
                </label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nhập tên phim, thể loại..."
                  className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                />
              </div>

              {/* movie filter */}
              <div>
                <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                  Lọc theo phim
                </label>
                <select
                  value={movieFilter}
                  onChange={(e) => setMovieFilter(e.target.value)}
                  className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                >
                  <option value="ALL">Tất cả phim</option>
                  {movies.map((m) => (
                    <option key={m.movieId} value={m.movieId}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* status filter */}
              <div>
                <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                  Trạng thái
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                >
                  <option value="ALL">Tất cả</option>
                  <option value="UPCOMING">Upcoming</option>
                  <option value="PAST">Đã chiếu</option>
                </select>
              </div>
            </div>

            {/* buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={loadData}
                disabled={loading}
                className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-xs font-semibold tracking-[0.16em] uppercase bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-400 text-black shadow-lg shadow-purple-500/40 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {loading ? "Đang tải..." : "Làm mới"}
              </button>
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-xs font-semibold tracking-[0.16em] uppercase border border-emerald-400/70 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/20 transition-all"
              >
                + Thêm suất chiếu
              </button>
            </div>
          </div>

          {/* cinema / room / date range */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-white/10">
            <div>
              <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                Rạp chiếu
              </label>
              <select
                value={cinemaFilter}
                onChange={(e) => {
                  setCinemaFilter(e.target.value);
                  setRoomFilter("ALL");
                }}
                className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
              >
                <option value="ALL">Tất cả rạp</option>
                {cinemas.map((c) => (
                  <option key={c.cinemaId} value={c.cinemaId}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                Phòng chiếu
              </label>
              <select
                value={roomFilter}
                onChange={(e) => setRoomFilter(e.target.value)}
                className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
              >
                <option value="ALL">Tất cả phòng</option>
                {rooms
                  .filter((r) =>
                    cinemaFilter === "ALL" ? true : r.cinemaId === cinemaFilter
                  )
                  .map((r) => {
                    const cinema = cinemaMap[r.cinemaId];
                    return (
                      <option key={r.roomId} value={r.roomId}>
                        {cinema?.name ? `${cinema.name} • Phòng ${r.roomNumber}` : `Room ${r.roomNumber}`}
                      </option>
                    );
                  })}
              </select>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                  Từ ngày
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full rounded-2xl bg-white/5 border border-white/15 px-3 py-2.5 text-sm text-white focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                  Đến ngày
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full rounded-2xl bg-white/5 border border-white/15 px-3 py-2.5 text-sm text-white focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                />
              </div>
            </div>
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
              Danh sách suất chiếu
            </h2>
            <p className="text-[11px] text-white/40">
              Hiển thị{" "}
              <span className="font-semibold">{filteredShowtimes.length}</span> /{" "}
              <span className="font-semibold">{showtimes.length}</span> suất chiếu
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-[0.18em] text-white/60 border-b border-white/10">
                  <th className="py-3 pr-4 text-left">Phim</th>
                  <th className="py-3 px-4 text-left hidden md:table-cell">Rạp / Phòng</th>
                  <th className="py-3 px-4 text-left">Thời gian</th>
                  <th className="py-3 px-4 text-left hidden lg:table-cell">Format</th>
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
                ) : filteredShowtimes.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-white/60 text-sm"
                    >
                      Không tìm thấy suất chiếu nào khớp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredShowtimes.map((st) => {
                    const movie = st.movie || movieMap[st.movieId];
                    const room = st.room || roomMap[st.roomId];
                    const cinema = cinemaMap[room?.cinemaId];
                    const up = isUpcoming(st.startTime);

                    return (
                      <tr
                        key={st.showtimeId}
                        className="border-b border-white/5 hover:bg-white/5/10"
                      >
                        {/* Movie */}
                        <td className="py-3 pr-4 align-top">
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-7 rounded-md bg-white/5 overflow-hidden hidden sm:block">
                              {movie?.posterUrl ? (
                                <img
                                  src={movie.posterUrl}
                                  alt={movie.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-[10px] text-white/40">
                                  No poster
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-white line-clamp-2">
                                {movie?.title || "Không rõ phim"}
                              </div>
                              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                {movie?.status && (
                                  <span
                                    className={`inline-flex items-center px-2 py-[2px] rounded-full text-[10px] font-semibold border ${
                                      movie.status === "SHOWING"
                                        ? "bg-emerald-500/10 text-emerald-200 border-emerald-400/50"
                                        : "bg-amber-500/10 text-amber-200 border-amber-400/50"
                                    }`}
                                  >
                                    {movie.status}
                                  </span>
                                )}
                                {movie?.genre && (
                                  <span className="inline-flex px-2 py-[2px] rounded-full text-[10px] font-medium bg-white/5 text-white/60 border border-white/10">
                                    {movie.genre}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Cinema / Room */}
                        <td className="py-3 px-4 align-top hidden md:table-cell">
                          <div className="text-xs text-white/85">
                            {cinema?.name || "Không rõ rạp"}
                          </div>
                          <div className="text-[11px] text-white/60 mt-0.5">
                            {room
                              ? `Phòng ${room.roomNumber} • ${room.roomType || "Standard"}`
                              : "—"}
                          </div>
                        </td>

                        {/* Time */}
                        <td className="py-3 px-4 align-top">
                          <div className="text-xs text-white/90">
                            {formatDateTimeLabel(st.startTime)}
                          </div>
                          <div className="mt-1">
                            <span
                              className={`inline-flex items-center px-2 py-[2px] rounded-full text-[10px] font-semibold border ${
                                up
                                  ? "bg-emerald-500/10 text-emerald-200 border-emerald-400/50"
                                  : "bg-slate-500/10 text-slate-200 border-slate-400/50"
                              }`}
                            >
                              {up ? "UPCOMING" : "PAST"}
                            </span>
                          </div>
                        </td>

                        {/* Format */}
                        <td className="py-3 px-4 align-top hidden lg:table-cell">
                          <div className="text-xs text-white/85">
                            {st.format || "—"}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 pl-4 pr-2 align-top">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openEditModal(st)}
                              className="rounded-2xl px-3 py-2 text-[11px] font-semibold tracking-[0.14em] uppercase bg-white/5 border border-white/20 text-white hover:bg-white/10 transition-all"
                            >
                              Sửa
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteShowtime(st.showtimeId)}
                              disabled={deletingId === st.showtimeId}
                              className="rounded-2xl px-3 py-2 text-[11px] font-semibold tracking-[0.14em] uppercase border border-red-500/60 bg-red-500/10 text-red-100 hover:bg-red-500/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                            >
                              {deletingId === st.showtimeId ? "Đang xóa..." : "Xóa"}
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
      {modalOpen && (
        <ModalWrapper onClose={closeModal}>
          <div className="w-full max-w-xl rounded-3xl bg-gradient-to-br from-[#1a0033]/95 via-[#060013] to-black border border-white/15 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/25 via-transparent to-cyan-500/25 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400" />

            <div className="relative p-6 md:p-7">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-base md:text-lg font-black tracking-[0.18em] uppercase bg-gradient-to-r from-cyan-300 to-pink-300 bg-clip-text text-transparent">
                    {editingShowtime ? "Chỉnh sửa suất chiếu" : "Thêm suất chiếu mới"}
                  </h3>
                  <p className="mt-2 text-xs text-white/60 max-w-md">
                    Chọn phim, rạp, phòng và thời gian bắt đầu cho suất chiếu.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-white/60 hover:text-white hover:bg-white/10 rounded-full p-1.5 transition-all"
                >
                  ✕
                </button>
              </div>

              {error && (
                <div className="mb-4 rounded-2xl border border-red-500/60 bg-red-500/10 px-4 py-3 text-xs text-red-100">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmitForm} className="space-y-4">
                {/* movie */}
                <div>
                  <label className="block text-[11px] font-semibold text-white/70 mb-2 uppercase tracking-[0.18em]">
                    Phim
                  </label>
                  <select
                    value={form.movieId}
                    onChange={handleFormChange("movieId")}
                    className="w-full rounded-2xl bg-white/5 border border-white/20 px-4 py-2.5 text-sm text-white focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                  >
                    <option value="">Chọn phim...</option>
                    {movies.map((m) => (
                      <option key={m.movieId} value={m.movieId}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* cinema + room */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-white/70 mb-2 uppercase tracking-[0.18em]">
                      Rạp chiếu
                    </label>
                    <select
                      value={form.cinemaId}
                      onChange={handleFormChange("cinemaId")}
                      className="w-full rounded-2xl bg-white/5 border border-white/20 px-4 py-2.5 text-sm text-white focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                    >
                      <option value="">Chọn rạp...</option>
                      {cinemas.map((c) => (
                        <option key={c.cinemaId} value={c.cinemaId}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-white/70 mb-2 uppercase tracking-[0.18em]">
                      Phòng chiếu
                    </label>
                    <select
                      value={form.roomId}
                      onChange={handleFormChange("roomId")}
                      className="w-full rounded-2xl bg-white/5 border border-white/20 px-4 py-2.5 text-sm text-white focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                    >
                      <option value="">Chọn phòng...</option>
                      {filteredRoomsForCinema.map((r) => {
                        const cinema = cinemaMap[r.cinemaId];
                        return (
                          <option key={r.roomId} value={r.roomId}>
                            {cinema?.name ? `${cinema.name} • Phòng ${r.roomNumber}` : `Room ${r.roomNumber}`}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* format + datetime */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-white/70 mb-2 uppercase tracking-[0.18em]">
                      Format
                    </label>
                    <input
                      type="text"
                      value={form.format}
                      onChange={handleFormChange("format")}
                      placeholder="VD: 2D, 3D, IMAX..."
                      className="w-full rounded-2xl bg-white/5 border border-white/20 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-white/70 mb-2 uppercase tracking-[0.18em]">
                      Thời gian bắt đầu
                    </label>
                    <input
                      type="datetime-local"
                      value={form.startDateTime}
                      onChange={handleFormChange("startDateTime")}
                      className="w-full rounded-2xl bg-white/5 border border-white/20 px-4 py-2.5 text-sm text-white focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={saving}
                    className="rounded-2xl px-4 py-2.5 text-xs font-semibold tracking-[0.16em] uppercase border border-white/25 bg-white/5 text-white hover:bg-white/10 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-2xl px-5 py-2.5 text-xs font-semibold tracking-[0.16em] uppercase bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400 text-black shadow-lg shadow-purple-500/50 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  >
                    {saving
                      ? editingShowtime
                        ? "Đang lưu..."
                        : "Đang tạo..."
                      : editingShowtime
                      ? "Lưu thay đổi"
                      : "Tạo suất chiếu"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
}

/* ===================== SMALL COMPONENTS ===================== */

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

function ModalWrapper({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-[81] max-h-[90vh] w-full px-4 md:px-0 flex items-center justify-center">
        <div className="max-h-[90vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
