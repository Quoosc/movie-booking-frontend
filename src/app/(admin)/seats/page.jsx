// src/app/(admin)/seats/page.jsx
import { useEffect, useMemo, useState } from "react";
import { AdminCinemaService } from "@/api/adminservice";

const SEAT_TYPES = ["NORMAL", "VIP", "COUPLE"];

export default function AdminSeatsPage() {
  const [cinemas, setCinemas] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [seats, setSeats] = useState([]);

  const [selectedCinemaId, setSelectedCinemaId] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");

  const [loadingInit, setLoadingInit] = useState(true);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [creatingSeat, setCreatingSeat] = useState(false);
  const [generatingSeats, setGeneratingSeats] = useState(false);
  const [savingSeatId, setSavingSeatId] = useState(null);
  const [deletingSeatId, setDeletingSeatId] = useState(null);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [search, setSearch] = useState("");

  // Draft cho edit từng ghế
  const [seatDrafts, setSeatDrafts] = useState({}); // { seatId: { rowLabel, seatNumber, seatType } }

  // Form tạo ghế lẻ
  const [createForm, setCreateForm] = useState({
    rowLabel: "",
    seatNumber: "",
    seatType: "NORMAL",
  });

  // Form generate ghế
  const [generateForm, setGenerateForm] = useState({
    rows: "",
    seatsPerRow: "",
    vipRows: "",
    coupleRows: "",
  });
  const [rowLabelsPreview, setRowLabelsPreview] = useState([]);

  // ================== LOAD CINEMAS + ROOMS ==================

  const loadCinemasAndRooms = async () => {
    try {
      setLoadingInit(true);
      setError(null);
      setSuccess(null);

      const [cinemaData, roomData] = await Promise.all([
        AdminCinemaService.getCinemas(),
        AdminCinemaService.getRooms(),
      ]);

      const cinemaList = Array.isArray(cinemaData) ? cinemaData : [];
      const roomList = Array.isArray(roomData) ? roomData : [];

      setCinemas(cinemaList);
      setRooms(roomList);

      if (!selectedCinemaId && cinemaList.length > 0) {
        setSelectedCinemaId(cinemaList[0].cinemaId);
      }
    } catch (err) {
      console.error("Load cinemas/rooms error:", err);
      setError(
        err?.message ||
          "Không tải được danh sách rạp và phòng chiếu. Vui lòng thử lại."
      );
    } finally {
      setLoadingInit(false);
    }
  };

  useEffect(() => {
    loadCinemasAndRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Khi chọn cinema → auto chọn phòng đầu tiên thuộc cinema đó
  useEffect(() => {
    if (!selectedCinemaId || rooms.length === 0) return;
    const roomsForCinema = rooms.filter(
      (r) => r.cinemaId === selectedCinemaId
    );
    if (roomsForCinema.length > 0) {
      if (!selectedRoomId || !roomsForCinema.some((r) => r.roomId === selectedRoomId)) {
        setSelectedRoomId(roomsForCinema[0].roomId);
      }
    } else {
      setSelectedRoomId("");
      setSeats([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCinemaId, rooms]);

  // ================== LOAD SEATS THEO ROOM ==================

  const loadSeatsByRoom = async (roomId) => {
    if (!roomId) {
      setSeats([]);
      setSeatDrafts({});
      return;
    }

    try {
      setLoadingSeats(true);
      setError(null);
      setSuccess(null);

      const data = await AdminCinemaService.getSeatsByRoom(roomId);
      const list = Array.isArray(data) ? data : [];

      setSeats(list);

      const drafts = {};
      list.forEach((s) => {
        drafts[s.seatId] = {
          rowLabel: s.rowLabel || "",
          seatNumber: s.seatNumber ?? "",
          seatType: s.seatType || "NORMAL",
        };
      });
      setSeatDrafts(drafts);
    } catch (err) {
      console.error("Load seats error:", err);
      setError(
        err?.message || "Không tải được danh sách ghế cho phòng này."
      );
    } finally {
      setLoadingSeats(false);
    }
  };

  useEffect(() => {
    if (selectedRoomId) {
      loadSeatsByRoom(selectedRoomId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoomId]);

  // ================== HANDLERS: FORM & ACTIONS ==================

  const handleChangeCinema = (e) => {
    setSelectedCinemaId(e.target.value);
  };

  const handleChangeRoom = (e) => {
    setSelectedRoomId(e.target.value);
  };

  const handleCreateFormChange = (field) => (e) => {
    const value = e.target.value;
    setCreateForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerateFormChange = (field) => (e) => {
    const value = e.target.value;
    setGenerateForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSeatDraftChange = (seatId, field, value) => {
    setSeatDrafts((prev) => ({
      ...prev,
      [seatId]: {
        ...(prev[seatId] || {}),
        [field]: value,
      },
    }));
  };

  // ---- Tạo ghế lẻ ----
  const handleCreateSeat = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedRoomId) {
      setError("Vui lòng chọn phòng chiếu trước khi tạo ghế.");
      return;
    }

    const rowLabel = createForm.rowLabel.trim().toUpperCase();
    const seatNumber = Number(createForm.seatNumber);
    const seatType = createForm.seatType;

    if (!rowLabel || Number.isNaN(seatNumber) || seatNumber <= 0) {
      setError("Hàng ghế và số ghế không hợp lệ.");
      return;
    }

    try {
      setCreatingSeat(true);

      const payload = {
        roomId: selectedRoomId,
        rowLabel,
        seatNumber,
        seatType,
      };

      await AdminCinemaService.createSeat(payload);

      setSuccess("Thêm ghế mới thành công.");
      setCreateForm({ rowLabel: "", seatNumber: "", seatType: "NORMAL" });

      await loadSeatsByRoom(selectedRoomId);
    } catch (err) {
      console.error("Create seat error:", err);
      setError(err?.message || "Thêm ghế thất bại.");
    } finally {
      setCreatingSeat(false);
    }
  };

  // ---- Preview nhãn hàng ghế ----
  const handlePreviewRowLabels = async () => {
    setError(null);
    setSuccess(null);
    const rowsNum = Number(generateForm.rows);
    if (!rowsNum || rowsNum <= 0) {
      setError("Số hàng ghế phải lớn hơn 0 để preview nhãn.");
      return;
    }

    try {
      const res = await AdminCinemaService.getSeatRowLabels(rowsNum);
      setRowLabelsPreview(res?.labels || []);
    } catch (err) {
      console.error("Get row labels error:", err);
      setError(
        err?.message || "Không preview được nhãn hàng ghế. Vui lòng thử lại."
      );
    }
  };

  // ---- Generate sơ đồ ghế ----
  const handleGenerateSeats = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!selectedRoomId) {
      setError("Vui lòng chọn phòng chiếu để sinh sơ đồ ghế.");
      return;
    }

    const rowsNum = Number(generateForm.rows);
    const seatsPerRowNum = Number(generateForm.seatsPerRow);

    if (!rowsNum || rowsNum <= 0 || !seatsPerRowNum || seatsPerRowNum <= 0) {
      setError("Số hàng và số ghế mỗi hàng phải > 0.");
      return;
    }

    const parseRowList = (str) =>
      str
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter(Boolean);

    const vipRows = parseRowList(generateForm.vipRows);
    const coupleRows = parseRowList(generateForm.coupleRows);

    try {
      setGeneratingSeats(true);

      const payload = {
        roomId: selectedRoomId,
        rows: rowsNum,
        seatsPerRow: seatsPerRowNum,
        vipRows,
        coupleRows,
      };

      const result = await AdminCinemaService.generateSeats(payload);
      const total = result?.totalSeatsCreated ?? 0;

      setSuccess(
        `Đã sinh sơ đồ ghế thành công. Tổng số ghế tạo: ${total || "N/A"}.`
      );

      await loadSeatsByRoom(selectedRoomId);
    } catch (err) {
      console.error("Generate seats error:", err);
      setError(err?.message || "Sinh sơ đồ ghế thất bại.");
    } finally {
      setGeneratingSeats(false);
    }
  };

  // ---- Update ghế ----
  const handleSaveSeat = async (seatId) => {
    const draft = seatDrafts[seatId];
    if (!draft) return;

    const rowLabel = (draft.rowLabel || "").trim().toUpperCase();
    const seatNumber = Number(draft.seatNumber);
    const seatType = draft.seatType || "NORMAL";

    if (!rowLabel || Number.isNaN(seatNumber) || seatNumber <= 0) {
      setError("Hàng / số ghế không hợp lệ.");
      return;
    }

    try {
      setSavingSeatId(seatId);
      setError(null);
      setSuccess(null);

      const payload = { rowLabel, seatNumber, seatType };
      const updated = await AdminCinemaService.updateSeat(seatId, payload);

      setSeats((prev) =>
        prev.map((s) => (s.seatId === seatId ? updated : s))
      );

      setSeatDrafts((prev) => ({
        ...prev,
        [seatId]: {
          rowLabel: updated.rowLabel || rowLabel,
          seatNumber: updated.seatNumber ?? seatNumber,
          seatType: updated.seatType || seatType,
        },
      }));

      setSuccess("Cập nhật ghế thành công.");
    } catch (err) {
      console.error("Update seat error:", err);
      setError(err?.message || "Cập nhật ghế thất bại.");
    } finally {
      setSavingSeatId(null);
    }
  };

  // ---- Xóa ghế ----
  const handleDeleteSeat = async (seatId) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa ghế này?")) return;

    try {
      setDeletingSeatId(seatId);
      setError(null);
      setSuccess(null);

      await AdminCinemaService.deleteSeat(seatId);

      setSeats((prev) => prev.filter((s) => s.seatId !== seatId));

      setSeatDrafts((prev) => {
        const copy = { ...prev };
        delete copy[seatId];
        return copy;
      });

      setSuccess("Xóa ghế thành công.");
    } catch (err) {
      console.error("Delete seat error:", err);
      setError(err?.message || "Xóa ghế thất bại.");
    } finally {
      setDeletingSeatId(null);
    }
  };

  // ================== DERIVED ==================

  const roomsForCinema = useMemo(() => {
    if (!selectedCinemaId) return rooms;
    return rooms.filter((r) => r.cinemaId === selectedCinemaId);
  }, [rooms, selectedCinemaId]);

  const filteredSeats = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return seats;
    return seats.filter((s) => {
      const text = `${s.rowLabel || ""} ${s.seatNumber ?? ""} ${
        s.seatType || ""
      }`.toLowerCase();
      return text.includes(q);
    });
  }, [seats, search]);

  const stats = useMemo(() => {
    const total = seats.length;
    let normal = 0,
      vip = 0,
      couple = 0;
    seats.forEach((s) => {
      const t = (s.seatType || "NORMAL").toUpperCase();
      if (t === "VIP") vip++;
      else if (t === "COUPLE") couple++;
      else normal++;
    });
    return { total, normal, vip, couple };
  }, [seats]);

  const currentCinema = cinemas.find((c) => c.cinemaId === selectedCinemaId);
  const currentRoom = rooms.find((r) => r.roomId === selectedRoomId);

  // ================== RENDER ==================

  return (
    <div className="space-y-8 lg:space-y-10">
      {/* Header */}
      <header className="space-y-3">
        <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-cyan-400/70">
          ADMIN • SEATS
        </p>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-[0.16em] uppercase">
          <span className="bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Quản lý sơ đồ ghế
          </span>
        </h1>
        <p className="text-xs md:text-sm text-white/60 max-w-2xl">
          Cấu hình ghế cho từng phòng chiếu: sinh sơ đồ ghế, chỉnh sửa từng ghế
          và kiểm soát loại ghế (NORMAL / VIP / COUPLE).
        </p>
      </header>

      {/* Chọn rạp + phòng */}
      <section className="relative rounded-3xl bg-gradient-to-br from-[#160033]/85 via-[#090019]/95 to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/15 via-transparent to-cyan-500/20 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400" />

        <div className="relative p-4 md:p-6 space-y-4 md:space-y-0 md:flex md:items-end md:justify-between">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cinema select */}
            <div>
              <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                Rạp chiếu
              </label>
              <select
                value={selectedCinemaId}
                onChange={handleChangeCinema}
                className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
              >
                {cinemas.length === 0 && (
                  <option value="">Chưa có rạp nào</option>
                )}
                {cinemas.map((c) => (
                  <option key={c.cinemaId} value={c.cinemaId}>
                    {c.name || c.cinemaName || "Cinema"}{" "}
                    {c.city ? `• ${c.city}` : ""}
                  </option>
                ))}
              </select>
              {currentCinema && (
                <p className="mt-1 text-[11px] text-white/50 line-clamp-1">
                  {currentCinema.address ||
                    currentCinema.location ||
                    "Địa chỉ đang cập nhật"}
                </p>
              )}
            </div>

            {/* Room select */}
            <div>
              <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                Phòng chiếu
              </label>
              <select
                value={selectedRoomId}
                onChange={handleChangeRoom}
                className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
              >
                {roomsForCinema.length === 0 && (
                  <option value="">Chưa có phòng nào</option>
                )}
                {roomsForCinema.map((r) => (
                  <option key={r.roomId} value={r.roomId}>
                    Phòng {r.roomNumber ?? ""}{" "}
                    {r.roomType ? `• ${r.roomType}` : ""}
                  </option>
                ))}
              </select>
              {currentRoom && (
                <p className="mt-1 text-[11px] text-white/50 line-clamp-1">
                  Loại phòng:{" "}
                  <span className="font-semibold">
                    {currentRoom.roomType || "STANDARD"}
                  </span>
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (selectedRoomId) loadSeatsByRoom(selectedRoomId);
            }}
            disabled={loadingInit || loadingSeats || !selectedRoomId}
            className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-xs font-semibold tracking-[0.16em] uppercase bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-400 text-black shadow-lg shadow-purple-500/40 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {loadingSeats ? "Đang tải ghế..." : "Làm mới ghế"}
          </button>
        </div>
      </section>

      {/* Stats + search */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Tổng ghế"
          value={stats.total}
          gradient="from-cyan-400/80 via-cyan-500/70 to-emerald-400/80"
        />
        <StatCard
          label="NORMAL"
          value={stats.normal}
          gradient="from-slate-300/80 via-slate-200/80 to-slate-100/80"
        />
        <StatCard
          label="VIP"
          value={stats.vip}
          gradient="from-violet-500/80 via-fuchsia-500/80 to-pink-400/80"
        />
        <StatCard
          label="COUPLE"
          value={stats.couple}
          gradient="from-amber-400/80 via-orange-500/80 to-rose-400/80"
        />
      </section>

      {/* Alert messages */}
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

      {/* Generate + create seat forms */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Generate seats card */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a0033]/90 via-[#0b001f] to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-bl from-fuchsia-600/20 via-transparent to-emerald-600/20 pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-violet-500 via-pink-500 to-emerald-400" />

          <div className="relative p-5 md:p-6 space-y-5">
            <h2 className="text-sm md:text-base font-extrabold tracking-[0.2em] uppercase text-white/80">
              Sinh sơ đồ ghế
            </h2>
            <p className="text-xs text-white/60">
              Tự động tạo toàn bộ sơ đồ ghế cho phòng đã chọn. Có thể đánh dấu
              hàng VIP hoặc COUPLE bằng nhãn chữ cái (A,B,C...).
            </p>

            <form onSubmit={handleGenerateSeats} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                    Số hàng ghế
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={generateForm.rows}
                    onChange={handleGenerateFormChange("rows")}
                    className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                    placeholder="VD: 10"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                    Ghế mỗi hàng
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={generateForm.seatsPerRow}
                    onChange={handleGenerateFormChange("seatsPerRow")}
                    className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                    placeholder="VD: 14"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                    Hàng VIP
                  </label>
                  <input
                    type="text"
                    value={generateForm.vipRows}
                    onChange={handleGenerateFormChange("vipRows")}
                    className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                    placeholder="VD: A,B"
                  />
                  <p className="mt-1 text-[11px] text-white/45">
                    Nhập danh sách chữ cái, phân cách bằng dấu phẩy.
                  </p>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                    Hàng COUPLE
                  </label>
                  <input
                    type="text"
                    value={generateForm.coupleRows}
                    onChange={handleGenerateFormChange("coupleRows")}
                    className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                    placeholder="VD: J"
                  />
                </div>
              </div>

              {rowLabelsPreview.length > 0 && (
                <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3 text-[11px] text-white/80">
                  Hàng dự kiến:{" "}
                  <span className="font-mono">
                    {rowLabelsPreview.join(", ")}
                  </span>
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePreviewRowLabels}
                  disabled={generatingSeats}
                  className="rounded-2xl px-4 py-2 text-[11px] font-semibold tracking-[0.14em] uppercase border border-white/25 bg-white/5 text-white hover:bg-white/10 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  Preview nhãn hàng
                </button>
                <button
                  type="submit"
                  disabled={generatingSeats || !selectedRoomId}
                  className="rounded-2xl px-4 py-2 text-[11px] font-semibold tracking-[0.14em] uppercase bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400 text-black shadow-md shadow-purple-500/40 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  {generatingSeats ? "Đang sinh sơ đồ..." : "Sinh sơ đồ ghế"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Create single seat card */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a0030]/90 via-[#080019] to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-transparent to-violet-500/25 pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400" />

          <div className="relative p-5 md:p-6 space-y-5">
            <h2 className="text-sm md:text-base font-extrabold tracking-[0.2em] uppercase text-white/80">
              Thêm ghế lẻ
            </h2>
            <p className="text-xs text-white/60">
              Sử dụng khi cần thêm hoặc bổ sung một vài ghế riêng lẻ mà không
              cần sinh lại toàn bộ sơ đồ.
            </p>

            <form onSubmit={handleCreateSeat} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                    Hàng
                  </label>
                  <input
                    type="text"
                    value={createForm.rowLabel}
                    onChange={handleCreateFormChange("rowLabel")}
                    className="w-full rounded-2xl bg-white/5 border border-white/15 px-3 py-2.5 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                    placeholder="VD: A"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                    Số ghế
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={createForm.seatNumber}
                    onChange={handleCreateFormChange("seatNumber")}
                    className="w-full rounded-2xl bg-white/5 border border-white/15 px-3 py-2.5 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                    placeholder="VD: 7"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                    Loại ghế
                  </label>
                  <select
                    value={createForm.seatType}
                    onChange={handleCreateFormChange("seatType")}
                    className="w-full rounded-2xl bg-white/5 border border-white/15 px-3 py-2.5 text-sm text-white focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                  >
                    {SEAT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setCreateForm({
                      rowLabel: "",
                      seatNumber: "",
                      seatType: "NORMAL",
                    })
                  }
                  className="rounded-2xl px-4 py-2 text-[11px] font-semibold tracking-[0.14em] uppercase border border-white/25 bg-white/5 text-white hover:bg-white/10 transition-all"
                >
                  Nhập lại
                </button>
                <button
                  type="submit"
                  disabled={creatingSeat || !selectedRoomId}
                  className="rounded-2xl px-4 py-2 text-[11px] font-semibold tracking-[0.14em] uppercase bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-black shadow-md shadow-emerald-500/30 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  {creatingSeat ? "Đang thêm..." : "Thêm ghế"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Search */}
      <section className="relative rounded-3xl bg-gradient-to-br from-[#160033]/85 via-[#090019]/95 to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/15 via-transparent to-cyan-500/20 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400" />

        <div className="relative p-4 md:p-6 flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <div className="flex-1">
            <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
              Tìm kiếm ghế
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo hàng, số ghế, loại ghế..."
              className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
            />
          </div>
          <p className="text-[11px] text-white/50">
            Hiển thị{" "}
            <span className="font-semibold">{filteredSeats.length}</span> /{" "}
            <span className="font-semibold">{seats.length}</span> ghế
          </p>
        </div>
      </section>

      {/* Seats table */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a0033]/90 via-[#0b001f] to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-600/15 via-transparent to-cyan-500/15 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400" />

        <div className="relative p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm md:text-base font-extrabold tracking-[0.2em] uppercase text-white/80">
              Danh sách ghế
            </h2>
            <span className="text-[11px] text-white/45">
              {currentRoom
                ? `Phòng ${currentRoom.roomNumber ?? ""} • ${
                    currentRoom.roomType || "STANDARD"
                  }`
                : "Chưa chọn phòng"}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-[0.18em] text-white/60 border-b border-white/10">
                  <th className="py-3 px-3 text-left">Hàng</th>
                  <th className="py-3 px-3 text-left">Số ghế</th>
                  <th className="py-3 px-3 text-left">Loại ghế</th>
                  <th className="py-3 px-3 text-left hidden md:table-cell">
                    Thông tin
                  </th>
                  <th className="py-3 px-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loadingSeats || loadingInit ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-white/60 text-sm"
                    >
                      Đang tải dữ liệu ghế...
                    </td>
                  </tr>
                ) : filteredSeats.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-8 text-center text-white/60 text-sm"
                    >
                      Không có ghế nào khớp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredSeats
                    .slice()
                    .sort((a, b) => {
                      // sort theo rowLabel rồi seatNumber
                      const rA = (a.rowLabel || "").localeCompare(
                        b.rowLabel || ""
                      );
                      if (rA !== 0) return rA;
                      return (a.seatNumber ?? 0) - (b.seatNumber ?? 0);
                    })
                    .map((s) => {
                      const draft = seatDrafts[s.seatId] || {
                        rowLabel: s.rowLabel || "",
                        seatNumber: s.seatNumber ?? "",
                        seatType: s.seatType || "NORMAL",
                      };

                      return (
                        <tr
                          key={s.seatId}
                          className="border-b border-white/5 hover:bg-white/5/10"
                        >
                          {/* Row label */}
                          <td className="py-3 px-3 align-middle">
                            <input
                              type="text"
                              value={draft.rowLabel}
                              onChange={(e) =>
                                handleSeatDraftChange(
                                  s.seatId,
                                  "rowLabel",
                                  e.target.value
                                )
                              }
                              className="w-16 rounded-2xl bg-white/5 border border-white/15 px-3 py-1.5 text-xs text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                            />
                          </td>

                          {/* Seat number */}
                          <td className="py-3 px-3 align-middle">
                            <input
                              type="number"
                              min={1}
                              value={draft.seatNumber}
                              onChange={(e) =>
                                handleSeatDraftChange(
                                  s.seatId,
                                  "seatNumber",
                                  e.target.value
                                )
                              }
                              className="w-20 rounded-2xl bg-white/5 border border-white/15 px-3 py-1.5 text-xs text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                            />
                          </td>

                          {/* Seat type */}
                          <td className="py-3 px-3 align-middle">
                            <select
                              value={draft.seatType}
                              onChange={(e) =>
                                handleSeatDraftChange(
                                  s.seatId,
                                  "seatType",
                                  e.target.value
                                )
                              }
                              className="rounded-2xl bg-white/5 border border-white/15 px-3 py-1.5 text-xs text-white focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                            >
                              {SEAT_TYPES.map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Info */}
                          <td className="py-3 px-3 align-middle hidden md:table-cell">
                            <div className="text-[11px] text-white/70">
                              ID:{" "}
                              <span className="font-mono text-[10px]">
                                {s.seatId?.slice(0, 8)}…
                              </span>
                            </div>
                            <div className="text-[11px] text-white/45">
                              Room:{" "}
                              <span className="font-mono text-[10px]">
                                {s.roomId?.slice(0, 8)}…
                              </span>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-3 align-middle">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleSaveSeat(s.seatId)}
                                disabled={savingSeatId === s.seatId}
                                className="rounded-2xl px-3 py-1.5 text-[11px] font-semibold tracking-[0.14em] uppercase bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400 text-black shadow-md shadow-purple-500/40 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                              >
                                {savingSeatId === s.seatId
                                  ? "Đang lưu..."
                                  : "Lưu"}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSeat(s.seatId)}
                                disabled={deletingSeatId === s.seatId}
                                className="rounded-2xl px-3 py-1.5 text-[11px] font-semibold tracking-[0.14em] uppercase border border-red-500/60 bg-red-500/10 text-red-100 hover:bg-red-500/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                              >
                                {deletingSeatId === s.seatId
                                  ? "Đang xóa..."
                                  : "Xóa"}
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
