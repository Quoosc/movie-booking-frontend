// src/app/(admin)/seats/page.jsx
import { useEffect, useMemo, useState } from "react";
import { AdminCinemaService } from "@/api/adminservice";
import { toast } from "react-toastify";
const SEAT_TYPES = ["NORMAL", "VIP", "COUPLE"];

// Helper parse "A,B,C" → ["A","B","C"]
const parseRowList = (str = "") =>
  String(str)
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);

export default function AdminSeatsPage() {
  const [cinemas, setCinemas] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [seats, setSeats] = useState([]);

  const toastErr = (err, fallback) => toast.error(err?.message || fallback);
  const toastOk = (msg) => toast.success(msg);

  const [selectedCinemaId, setSelectedCinemaId] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [selectedSeatIdForDetail, setSelectedSeatIdForDetail] = useState(null);

  const [loadingInit, setLoadingInit] = useState(true);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [creatingSeat, setCreatingSeat] = useState(false);
  const [generatingSeats, setGeneratingSeats] = useState(false);
  const [savingSeatId, setSavingSeatId] = useState(null);
  const [deletingSeatId, setDeletingSeatId] = useState(null);

  const [previewingLayout, setPreviewingLayout] = useState(false);
  const [previewLayout, setPreviewLayout] = useState([]); // sơ đồ ghế preview

  const [focusedSeatId, setFocusedSeatId] = useState(null); // ghế đang chọn để edit

  const [error] = useState(null);
  const [success, setSuccess] = useState(null);

  const [search, setSearch] = useState("");

  // Warning modal (custom confirm like movie detail)
  const [warning, setWarning] = useState({
    open: false,
    title: "Lưu ý!",
    message: "",
    onConfirm: null,
  });
  const showWarning = (message, title = "Lưu ý!", onConfirm = null) => {
    setWarning({ open: true, title, message, onConfirm });
  };
  const closeWarning = () =>
    setWarning((prev) => ({ ...prev, open: false, onConfirm: null }));

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
      const msg =
        err?.message ||
        "Không tải được danh sách rạp và phòng chiếu. Vui lòng thử lại.";
toast.error(msg);
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
    const roomsForCinema = rooms.filter((r) => r.cinemaId === selectedCinemaId);
    if (roomsForCinema.length > 0) {
      if (
        !selectedRoomId ||
        !roomsForCinema.some((r) => r.roomId === selectedRoomId)
      ) {
        setSelectedRoomId(roomsForCinema[0].roomId);
      }
    } else {
      setSelectedRoomId("");
      setSeats([]);
      setSeatDrafts({});
      setPreviewLayout([]);
      setRowLabelsPreview([]);
      setFocusedSeatId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCinemaId, rooms]);

  // ================== LOAD SEATS THEO ROOM ==================

  const loadSeatsByRoom = async (roomId) => {
    if (!roomId) {
      setSeats([]);
      setSeatDrafts({});
      setPreviewLayout([]);
      setRowLabelsPreview([]);
      setFocusedSeatId(null);
      return;
    }

    try {
      setLoadingSeats(true);
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
      setPreviewLayout([]);
      setRowLabelsPreview([]);
      setFocusedSeatId(null);
    } catch (err) {
      console.error("Load seats error:", err);
      const msg = err?.message || "Không tải được danh sách ghế cho phòng này.";
toast.error(msg);
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
setSuccess(null);

    if (!selectedRoomId) {
return;
    }

    const rowLabel = createForm.rowLabel.trim().toUpperCase();
    const seatNumber = Number(createForm.seatNumber);
    const seatType = createForm.seatType;

    if (!rowLabel || Number.isNaN(seatNumber) || seatNumber <= 0) {
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
      toast.success("Thêm ghế mới thành công.");

      setCreateForm({ rowLabel: "", seatNumber: "", seatType: "NORMAL" });
      await loadSeatsByRoom(selectedRoomId);
    } catch (err) {
      console.error("Create seat error:", err);
      const msg = err?.message || "Thêm ghế thất bại.";
toast.error(msg);
    } finally {
      setCreatingSeat(false);
    }
  };

  // ---- Preview sơ đồ ghế (dùng rows + seatsPerRow + vipRows/coupleRows) ----
  const handlePreviewSeatLayout = async () => {
setSuccess(null);

    const rowsNum = Number(generateForm.rows);
    const seatsPerRowNum = Number(generateForm.seatsPerRow);

    if (!rowsNum || rowsNum <= 0 || !seatsPerRowNum || seatsPerRowNum <= 0) {
return;
    }

    try {
      setPreviewingLayout(true);

      const res = await AdminCinemaService.getSeatRowLabels(rowsNum);
      console.log("Row labels response:", res);

      let labels;

      // 1) BE trả thẳng array: ["A","B",...]
      if (Array.isArray(res)) {
        labels = res;
      }
      // 2) BE trả { labels: [...] }
      else if (Array.isArray(res.labels)) {
        labels = res.labels;
      }
      // 3) Case hiện tại: { totalRows, rowLabels: [...] }
      else if (Array.isArray(res.rowLabels)) {
        labels = res.rowLabels;
      }
      // 4) Nếu sau này bạn bọc thêm { data: { ... } }
      else if (res.data) {
        if (Array.isArray(res.data.labels)) labels = res.data.labels;
        else if (Array.isArray(res.data.rowLabels)) labels = res.data.rowLabels;
      }

      if (!Array.isArray(labels) || labels.length === 0) {
        throw new Error("API không trả về nhãn hàng ghế hợp lệ.");
      }

      setRowLabelsPreview(labels);

      const vipRows = parseRowList(generateForm.vipRows);
      const coupleRows = parseRowList(generateForm.coupleRows);
      const vipSet = new Set(vipRows);
      const coupleSet = new Set(coupleRows);

      const preview = [];

      labels.forEach((rowLabel) => {
        for (let i = 1; i <= seatsPerRowNum; i++) {
          let type = "NORMAL";
          if (coupleSet.has(rowLabel)) type = "COUPLE";
          else if (vipSet.has(rowLabel)) type = "VIP";

          preview.push({
            seat_id: `preview-${rowLabel}-${i}`,
            row: rowLabel,
            number: i,
            type,
            status: "AVAILABLE",
          });
        }
      });

      setPreviewLayout(preview);
      setFocusedSeatId(null);

      toast.success(
        "Preview sơ đồ ghế thành công."
      );
    } catch (err) {
      console.error("Preview seat layout error:", err);
      const msg =
        err?.message || "Không preview được sơ đồ ghế. Vui lòng thử lại.";
toast.error(msg);
      setPreviewLayout([]);
    } finally {
      setPreviewingLayout(false);
    }
  };

  // ---- Generate sơ đồ ghế (ghi xuống DB) ----
  const handleGenerateSeats = async (e) => {
    e.preventDefault();
setSuccess(null);

    if (!selectedRoomId) {
return;
    }

    const rowsNum = Number(generateForm.rows);
    const seatsPerRowNum = Number(generateForm.seatsPerRow);

    if (!rowsNum || rowsNum <= 0 || !seatsPerRowNum || seatsPerRowNum <= 0) {
return;
    }

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

      toast.success(
        `Đã sinh sơ đồ ghế thành công. Tổng số ghế tạo: ${total || "N/A"}.`
      );

      setPreviewLayout([]);
      setRowLabelsPreview([]);
      setFocusedSeatId(null);

      await loadSeatsByRoom(selectedRoomId);
    } catch (err) {
      console.error("Generate seats error:", err);
      const msg = err?.message || "Sinh sơ đồ ghế thất bại.";
toast.error(msg);
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
return;
    }

    try {
      setSavingSeatId(seatId);
setSuccess(null);

      const payload = { rowLabel, seatNumber, seatType };
      const updated = await AdminCinemaService.updateSeat(seatId, payload);

      setSeats((prev) => prev.map((s) => (s.seatId === seatId ? updated : s)));

      setSeatDrafts((prev) => ({
        ...prev,
        [seatId]: {
          rowLabel: updated.rowLabel || rowLabel,
          seatNumber: updated.seatNumber ?? seatNumber,
          seatType: updated.seatType || seatType,
        },
      }));

      toast.success("Cập nhật ghế thành công.");
    } catch (err) {
      console.error("Update seat error:", err);
      const msg = err?.message || "Cập nhật ghế thất bại.";
toast.error(msg);
    } finally {
      setSavingSeatId(null);
    }
  };

  // ---- Xóa ghế ----
  const handleDeleteSeat = async (seatId) => {
    showWarning("Bạn chắc chắn muốn xóa ghế này?", "Xác nhận xoá", async () => {
      try {
        setDeletingSeatId(seatId);
setSuccess(null);

        await AdminCinemaService.deleteSeat(seatId);

        // Nếu BE cho xóa được thì remove ở FE
        setSeats((prev) => prev.filter((s) => s.seatId !== seatId));
        toast.success("Xóa ghế thành công.");
      } catch (err) {
        console.error("Delete seat error:", err);
        const msg = err?.message || "";

        if (
          msg.includes("Cannot delete seat that is being used in showtimes")
        ) {
          const friendly =
            "Không thể xoá ghế này vì đang được sử dụng trong các suất chiếu.\n" +
            "Bạn phải xoá / chỉnh sửa các suất chiếu đang dùng ghế này trước (hoặc chỉ sửa thông tin ghế, không xoá).";
toast.error("Không thể xoá: ghế đang được dùng trong suất chiếu.");
        } else {
          const fallback = msg || "Xóa ghế thất bại.";
toast.error(fallback);
        }
      } finally {
        setDeletingSeatId(null);
        closeWarning();
      }
    });
  };

  // Khi click một ghế trên sơ đồ (chỉ cho layout thật, không phải preview)
  const handleSelectSeatFromLayout = (seat) => {
    if (!seat) return;
    if (previewLayout.length > 0) return; // preview mode: chỉ xem, không edit

    setFocusedSeatId((prev) => (prev === seat.seat_id ? null : seat.seat_id));
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

  const selectedSeat =
    seats.find((s) => s.seatId === selectedSeatIdForDetail) || null;

  const selectedSeatDraft = selectedSeat
    ? seatDrafts[selectedSeat.seatId] || {
        rowLabel: selectedSeat.rowLabel || "",
        seatNumber: selectedSeat.seatNumber ?? "",
        seatType: selectedSeat.seatType || "NORMAL",
      }
    : null;

  const currentCinema = cinemas.find((c) => c.cinemaId === selectedCinemaId);
  const currentRoom = rooms.find((r) => r.roomId === selectedRoomId);

  // Sơ đồ hiển thị (ưu tiên previewLayout, nếu không thì layout thật từ DB)
  const layoutByRow = useMemo(() => {
    const sourceSeats =
      previewLayout.length > 0
        ? previewLayout
        : seats.map((s) => ({
            seat_id: s.seatId,
            row: s.rowLabel,
            number: s.seatNumber,
            type: s.seatType || "NORMAL",
            status: "AVAILABLE",
          }));

    if (!sourceSeats || sourceSeats.length === 0) return [];

    const map = {};
    sourceSeats.forEach((s) => {
      if (!s.row) return;
      if (!map[s.row]) map[s.row] = [];
      map[s.row].push(s);
    });
    Object.values(map).forEach((rowSeats) =>
      rowSeats.sort((a, b) => (a.number || 0) - (b.number || 0))
    );
    return Object.entries(map).sort(([a], [b]) => (a > b ? 1 : -1));
  }, [previewLayout, seats]);

  const handleClickSeatOnLayout = (seat) => {
    const seatId = seat.seatId || seat.seat_id;
    if (!seatId) return;

    setSelectedSeatIdForDetail(seatId);

    // đảm bảo seatDrafts có entry cho ghế này để chỉnh sửa
    setSeatDrafts((prev) => {
      if (prev[seatId]) return prev;
      const original = seats.find((s) => s.seatId === seatId) || {};
      return {
        ...prev,
        [seatId]: {
          rowLabel: original.rowLabel || "",
          seatNumber: original.seatNumber ?? "",
          seatType: original.seatType || "NORMAL",
        },
      };
    });
  };

  const handleSeatClickFromLayout = (seat) => {
    if (!seat) return;
    // Nếu đang ở chế độ preview layout thì không cho chỉnh
    if (previewLayout.length > 0) return;

    const seatId = seat.seatId || seat.seat_id;
    if (!seatId) return;

    // Cập nhật panel "Chi tiết ghế" phía trên
    handleClickSeatOnLayout(seat);

    // Đồng bộ với SeatInspector (panel bên phải) nếu vẫn dùng
    setFocusedSeatId(seatId);
  };

  const matchedSeatIds = useMemo(
    () => filteredSeats.map((s) => s.seatId),
    [filteredSeats]
  );

  // Khi search chỉ còn đúng 1 ghế → auto focus nó
  useEffect(() => {
    if (!search.trim()) return;
    if (previewLayout.length > 0) return;
    if (filteredSeats.length === 1) {
      setFocusedSeatId(filteredSeats[0].seatId);
    }
  }, [search, filteredSeats, previewLayout.length]);

  // ================== RENDER ==================

  return (
    <div className="space-y-8 lg:space-y-10">
      {warning.open && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-[90%] max-w-md rounded-3xl bg-gradient-to-r from-[#4f46e5] via-[#7b5cff] to-[#ec4899] p-[1px] shadow-[0_30px_80px_rgba(0,0,0,0.95)]">
            <div className="rounded-3xl bg-[#050018]/95 px-6 py-6 text-center">
              <h3 className="text-[13px] sm:text-[14px] font-extrabold tracking-[0.28em] text-white uppercase mb-2">
                {warning.title}
              </h3>
              <p className="text-xs sm:text-[13px] text-white/80 mb-6 leading-relaxed">
                {warning.message}
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={closeWarning}
                  className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-[11px] sm:text-[12px] font-extrabold tracking-[0.2em] uppercase border border-white/20 text-white bg-white/5 hover:bg-white/10 transition-all"
                >
                  Hủy
                </button>
                {typeof warning.onConfirm === "function" && (
                  <button
                    onClick={warning.onConfirm}
                    className="inline-flex items-center justify-center px-8 py-2.5 rounded-full text-[11px] sm:text-[12px] font-extrabold tracking-[0.2em] uppercase bg-gradient-to-r from-[#ffe700] to-[#facc15] text-black shadow-[0_0_18px_rgba(255,231,0,0.95)] hover:brightness-110 transition-all"
                  >
                    Xác nhận
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
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

        <div className="relative p-4 md:p-6 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cinema select */}
            <div>
              <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                Rạp chiếu
              </label>
              <select
                value={selectedCinemaId}
                onChange={handleChangeCinema}
                className="cv-select-dark w-full rounded-full bg-gradient-to-r from-[#1b0b3a] via-[#14002b] to-[#050012]
               border border-cyan-400/60 px-4 py-2.5 text-xs md:text-sm font-semibold text-white
               shadow-[0_0_0_1px_rgba(15,23,42,0.9)]
               focus:outline-none focus:ring-2 focus:ring-cyan-400/70 focus:border-transparent
               transition-all"
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
                className="cv-select-dark w-full rounded-full bg-gradient-to-r from-[#1b0b3a] via-[#14002b] to-[#050012]
               border border-cyan-400/60 px-4 py-2.5 text-xs md:text-sm font-semibold text-white
               shadow-[0_0_0_1px_rgba(15,23,42,0.9)]
               focus:outline-none focus:ring-2 focus:ring-cyan-400/70 focus:border-transparent
               transition-all"
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
            className="inline-flex ml-2.5 items-center justify-center rounded-2xl px-4 py-2.5 text-xs font-semibold tracking-[0.16em] uppercase bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-400 text-black shadow-lg shadow-purple-500/40 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all md:self-center"
          >
            {loadingSeats ? "Đang tải ghế..." : "Làm mới ghế"}
          </button>
        </div>
      </section>

      {/* Stats */}
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
              Tự động tạo toàn bộ sơ đồ ghế cho phòng đã chọn. Chọn hàng VIP /
              COUPLE theo nhãn chữ cái, preview bằng sơ đồ trực quan trước khi
              lưu.
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
                    placeholder="VD: D,E,F"
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
                  onClick={handlePreviewSeatLayout}
                  disabled={previewingLayout}
                  className="rounded-2xl px-4 py-2 text-[11px] font-semibold tracking-[0.14em] uppercase border border-white/25 bg-white/5 text-white hover:bg-white/10 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  {previewingLayout ? "Đang preview..." : "Preview sơ đồ ghế"}
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
                    className="cv-select-dark w-full rounded-full bg-gradient-to-r from-[#1b0b3a] via-[#14002b] to-[#050012]
               border border-cyan-400/60 px-3 py-2.5 text-xs md:text-sm font-semibold text-white
               shadow-[0_0_0_1px_rgba(15,23,42,0.9)]
               focus:outline-none focus:ring-2 focus:ring-cyan-400/70 focus:border-transparent
               transition-all"
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
      {/* Chi tiết ghế – thay thế cho phần tìm kiếm ghế */}
      <section className="relative rounded-3xl bg-gradient-to-br from-[#160033]/85 via-[#090019]/95 to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/15 via-transparent to-cyan-500/20 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400" />

        <div className="relative p-4 md:p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold text-white/60 mb-1 uppercase tracking-[0.18em]">
                Chi tiết ghế
              </p>
              <p className="text-[11px] text-white/50 max-w-xl">
                Chọn một ghế bất kỳ trong sơ đồ bên dưới để xem và chỉnh sửa.
                Sau khi bấm{" "}
                <span className="font-semibold text-emerald-300">LƯU</span>, dữ
                liệu sẽ cập nhật cho phòng chiếu hiện tại.
              </p>
            </div>

            {selectedSeat && (
              <div className="hidden md:inline-flex items-center px-3 py-1 rounded-full bg-white/5 border border-white/15 text-[10px] text-white/75">
                <span className="mr-1 opacity-70">ID:</span>
                <span className="font-mono">
                  {selectedSeat.seatId?.slice(0, 8)}…
                </span>
              </div>
            )}
          </div>

          {!selectedSeat ? (
            <div className="rounded-2xl border border-dashed border-white/20 bg-black/30 px-4 py-3 text-[12px] text-white/60">
              Chưa có ghế nào được chọn. Hãy click vào một ghế trong sơ đồ bên
              dưới để chỉnh sửa.
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4 items-end">
              {/* Hàng */}
              <div>
                <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                  Hàng
                </label>
                <input
                  type="text"
                  value={selectedSeatDraft.rowLabel}
                  onChange={(e) =>
                    handleSeatDraftChange(
                      selectedSeat.seatId,
                      "rowLabel",
                      e.target.value
                    )
                  }
                  className="w-full rounded-2xl bg-white/5 border border-white/15 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                />
              </div>

              {/* Số ghế */}
              <div>
                <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                  Số ghế
                </label>
                <input
                  type="number"
                  min={1}
                  value={selectedSeatDraft.seatNumber}
                  onChange={(e) =>
                    handleSeatDraftChange(
                      selectedSeat.seatId,
                      "seatNumber",
                      e.target.value
                    )
                  }
                  className="w-full rounded-2xl bg-white/5 border border-white/15 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
                />
              </div>

              {/* Loại ghế */}
              <div>
                <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                  Loại ghế
                </label>
                <select
                  value={selectedSeatDraft.seatType}
                  onChange={(e) =>
                    handleSeatDraftChange(
                      selectedSeat.seatId,
                      "seatType",
                      e.target.value
                    )
                  }
                  className="cv-select-dark w-full rounded-full bg-gradient-to-r from-[#1b0b3a] via-[#14002b] to-[#050012]
               border border-cyan-400/60 px-3 py-2.5 text-xs md:text-sm font-semibold text-white
               shadow-[0_0_0_1px_rgba(15,23,42,0.9)]
               focus:outline-none focus:ring-2 focus:ring-cyan-400/70 focus:border-transparent
               transition-all"
                >
                  {SEAT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Info nhỏ (ID + Room) */}
              <div className="col-span-3 md:col-span-1 text-[11px] text-white/60 space-y-1">
                <div>
                  <span className="opacity-70 mr-1">ID:</span>
                  <span className="font-mono text-[10px]">
                    {selectedSeat.seatId?.slice(0, 12)}…
                  </span>
                </div>
                <div>
                  <span className="opacity-70 mr-1">Room:</span>
                  <span className="font-mono text-[10px]">
                    {selectedSeat.roomId?.slice(0, 12)}…
                  </span>
                </div>
              </div>

              {/* Nút hành động */}
              <div className="col-span-3 md:col-span-1 flex gap-2 justify-end md:justify-start">
                <button
                  type="button"
                  onClick={() => handleSaveSeat(selectedSeat.seatId)}
                  disabled={savingSeatId === selectedSeat.seatId}
                  className="flex-1 rounded-2xl px-3 py-2 text-[11px] font-semibold tracking-[0.14em] uppercase bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400 text-black shadow-md shadow-purple-500/40 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  {savingSeatId === selectedSeat.seatId ? "Đang lưu..." : "Lưu"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteSeat(selectedSeat.seatId)}
                  disabled={deletingSeatId === selectedSeat.seatId}
                  className="flex-1 rounded-2xl px-3 py-2 text-[11px] font-semibold tracking-[0.14em] uppercase border border-red-500/60 bg-red-500/10 text-red-100 hover:bg-red-500/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  {deletingSeatId === selectedSeat.seatId
                    ? "Đang xóa..."
                    : "Xóa"}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Seat layout + inspector */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a0033]/90 via-[#0b001f] to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-600/15 via-transparent to-cyan-500/15 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400" />

        <div className="relative p-4 md:p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm md:text-base font-extrabold tracking-[0.2em] uppercase text-white/80">
              Sơ đồ ghế
            </h2>
            <span className="text-[11px] text-white/45">
              {currentRoom
                ? `Phòng ${currentRoom.roomNumber ?? ""} • ${
                    currentRoom.roomType || "STANDARD"
                  }`
                : "Chưa chọn phòng"}
            </span>
          </div>

          <div className="mt-2 flex flex-col items-center">
            <AdminSeatLayout
              layoutByRow={layoutByRow}
              previewMode={previewLayout.length > 0}
              activeSeatId={selectedSeatIdForDetail}
              matchedSeatIds={matchedSeatIds}
              onSelectSeat={handleSeatClickFromLayout}
            />

            {previewLayout.length > 0 && (
              <p className="mt-3 text-[11px] text-amber-200/80 text-center max-w-md">
                Đây là <span className="font-semibold">sơ đồ preview</span>{" "}
                (chưa lưu DB). Hãy điều chỉnh Hàng VIP / COUPLE nếu cần, sau đó
                bấm <span className="font-semibold">"Sinh sơ đồ ghế"</span> để
                tạo thật trong phòng chiếu.
              </p>
            )}
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

function AdminSeatLayout({
  layoutByRow,
  previewMode,
  activeSeatId,
  matchedSeatIds = [],
  onSelectSeat,
}) {
  const hasSeats = layoutByRow && layoutByRow.length > 0;
  const matchedSet = new Set(matchedSeatIds);

  if (!hasSeats) {
    return (
      <div className="w-full max-w-[960px] mx-auto py-10 text-center text-sm text-white/60">
        Chưa có sơ đồ ghế cho phòng này.
      </div>
    );
  }

  const handleSeatClick = (seat) => {
    if (previewMode) return; // preview chỉ xem, không cho chọn
    if (!onSelectSeat) return;
    onSelectSeat(seat);
  };

  return (
    <div className="w-full max-w-[960px] mx-auto">
      {/* Màn hình */}
      <div className="text-center mb-6">
        <div className="mx-auto flex justify-center w-full">
          <div className="relative w-full max-w-[960px]">
            <img
              src="https://cinestar.com.vn/assets/images/img-screen.png"
              alt="Screen"
              className="w-full mx-auto pointer-events-none select-none"
            />
          </div>
        </div>
        <p className="mt-4 text-[11px] md:text-xs text-white/70 tracking-[0.25em] uppercase">
          Màn hình
        </p>
      </div>

      {/* Các hàng ghế */}
      <div className="flex flex-col items-center gap-2 text-[9px] sm:text-[10px]">
        {layoutByRow.map(([rowName, seats]) => {
          if (!seats || seats.length === 0) return null;

          return (
            <div key={rowName} className="flex items-center gap-2">
              {/* Ký tự hàng */}
              <span className="w-4 text-right text-white/60">{rowName}</span>

              <div className="flex gap-1.5">
                {seats.map((seat) => {
                  const seatId = seat.seatId || seat.seat_id;
                  if (!seatId) return null;

                  const isCoupleSeat =
                    (seat.type || "").toUpperCase() === "COUPLE";

                  const isActive = activeSeatId && activeSeatId === seatId;
                  const isMatched = matchedSet.has(seatId);

                  // Ghế COUPLE: rộng hơn, giống FE MovieDetailPage
                  const sizeClasses = isCoupleSeat
                    ? "h-7 sm:h-8 px-4 sm:px-5 rounded-[6px]"
                    : "w-7 h-7 sm:w-8 sm:h-8 rounded-[4px]";

                  const stateClass = previewMode
                    ? "bg-white border-white/60 text-black opacity-75"
                    : isActive
                    ? "bg-[#facc15] border-[#facc15] text-black font-bold shadow-[0_0_10px_rgba(250,204,21,0.9)]"
                    : isMatched
                    ? "bg-white border-cyan-300 text-black shadow-[0_0_8px_rgba(34,211,238,0.7)]"
                    : "bg-white border-white/80 text-black hover:bg-slate-100";

                  const label = isCoupleSeat
                    ? `${rowName}${seat.number}` // ví dụ J1, J2...
                    : seat.number;

                  return (
                    <button
                      key={seatId}
                      onClick={() => handleSeatClick(seat)}
                      className={`
                        ${sizeClasses}
                        text-[9px] sm:text-[10px]
                        flex items-center justify-center
                        border transition-all
                        ${stateClass}
                      `}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-5 flex flex-wrap justify-center gap-6 text-[9px] sm:text-[10px] text-white/75">
        <SeatLegend
          colorClass="bg-white border border-white/80"
          label="Ghế thường / trống"
        />
        <SeatLegend
          colorClass="bg-[#facc15] border border-[#facc15]"
          label="Ghế đang chọn"
        />
        <SeatLegend
          colorClass="bg-white border border-cyan-300"
          label="Ghế khớp tìm kiếm"
        />
        <SeatLegend
          imageSrc="https://cinestar.com.vn/assets/images/seat-couple-w.svg"
          label="Ghế đôi (COUPLE)"
        />
      </div>
    </div>
  );
}

function SeatLegend({ colorClass, label, imageSrc }) {
  return (
    <div className="flex items-center gap-2">
      {imageSrc ? (
        <img src={imageSrc} alt={label} className="w-7 h-7 object-contain" />
      ) : (
        <span className={`inline-block w-4 h-4 rounded-[4px] ${colorClass}`} />
      )}
      <span className="text-white/80">{label}</span>
    </div>
  );
}

function SeatInspector({
  disabled,
  seat,
  draft,
  onChangeField,
  onSave,
  onDelete,
  saving,
  deleting,
}) {
  const isSaving = saving && seat && saving === seat.seatId;
  const isDeleting = deleting && seat && deleting === seat.seatId;

  return (
    <div className="relative rounded-3xl bg-gradient-to-br from-black/70 via-[#050018] to-[#050018] border border-white/10 p-4 md:p-5 space-y-4">
      <h3 className="text-xs md:text-sm font-extrabold tracking-[0.22em] uppercase text-white/75">
        Chi tiết ghế
      </h3>

      {disabled ? (
        <p className="text-[11px] text-white/55">
          {!seat
            ? "Chọn một ghế từ sơ đồ hoặc tìm kiếm để chỉnh sửa."
            : "Hiện tại đang ở chế độ preview hoặc chưa có sơ đồ ghế thật. Hãy sinh sơ đồ ghế trước khi chỉnh sửa."}
        </p>
      ) : !seat ? (
        <p className="text-[11px] text-white/55">
          Chọn một ghế từ sơ đồ hoặc dùng ô tìm kiếm để focus ghế cần chỉnh.
        </p>
      ) : (
        <>
          <div className="space-y-3 text-[11px]">
            <div>
              <label className="block text-[10px] font-semibold text-white/60 mb-1 uppercase tracking-[0.18em]">
                Hàng
              </label>
              <input
                type="text"
                value={draft?.rowLabel || ""}
                onChange={(e) => onChangeField("rowLabel", e.target.value)}
                className="w-full rounded-2xl bg-white/5 border border-white/15 px-3 py-2 text-xs text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-white/60 mb-1 uppercase tracking-[0.18em]">
                Số ghế
              </label>
              <input
                type="number"
                min={1}
                value={draft?.seatNumber ?? ""}
                onChange={(e) => onChangeField("seatNumber", e.target.value)}
                className="w-full rounded-2xl bg-white/5 border border-white/15 px-3 py-2 text-xs text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-white/60 mb-1 uppercase tracking-[0.18em]">
                Loại ghế
              </label>
              <select
                value={draft?.seatType || "NORMAL"}
                onChange={(e) => onChangeField("seatType", e.target.value)}
                className="cv-select-dark w-full rounded-full bg-gradient-to-r from-[#1b0b3a] via-[#14002b] to-[#050012]
               border border-cyan-400/60 px-3 py-2 text-xs md:text-sm font-semibold text-white
               shadow-[0_0_0_1px_rgba(15,23,42,0.9)]
               focus:outline-none focus:ring-2 focus:ring-cyan-400/70 focus:border-transparent
               transition-all"
              >
                {SEAT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onSave}
              disabled={isSaving}
              className="flex-1 rounded-2xl px-3 py-2 text-[11px] font-semibold tracking-[0.16em] uppercase bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400 text-black shadow-md shadow-purple-500/40 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {isSaving ? "Đang lưu..." : "Lưu"}
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={isDeleting}
              className="flex-1 rounded-2xl px-3 py-2 text-[11px] font-semibold tracking-[0.16em] uppercase border border-red-500/60 bg-red-500/10 text-red-100 hover:bg-red-500/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {isDeleting ? "Đang xóa..." : "Xóa ghế"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
