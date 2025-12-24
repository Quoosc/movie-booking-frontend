// src/app/(public)/movie/[id]/page.jsx

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";

import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import HomeButton from "@/components/shared/Buttons/HomeButton";
import { getTicketTypes } from "@/api/ticketTypeService";
import { getMovieById, getMovieShowtimesByDate } from "@/api/movieService";

import { getSeatLayout, getSnacksByCinema } from "@/api/bookingService";

const DAYS = 7;

// mock
// const DEFAULT_TICKET_TYPES = [
//   {
//     id: "adult",
//     code: "adult",
//     ticketTypeId: null,
//     label: "NGƯỜI LỚN",
//     price: 69000,
//   },
//   {
//     id: "student",
//     code: "student",
//     ticketTypeId: null,
//     label: "HSSV/U22-GV",
//     price: 49000,
//   },
//   {
//     id: "senior",
//     code: "senior",
//     ticketTypeId: null,
//     label: "NGƯỜI CAO TUỔI",
//     price: 55000,
//   },
//   {
//     id: "member",
//     code: "member",
//     ticketTypeId: null,
//     label: "GIÁ VÉ THÀNH VIÊN",
//     price: 45000,
//   },
//   {
//     id: "double",
//     code: "double",
//     ticketTypeId: null,
//     label: "GHẾ ĐÔI (2 NGƯỜI)",
//     price: 128000,
//   },
// ];

export default function MovieDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { user } = useAuth();
  const isAuthenticated = !!user; // true nếu đã đăng nhập, false nếu guest thường

  const [movie, setMovie] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [showtimes, setShowtimes] = useState([]);
  const [loadingMovie, setLoadingMovie] = useState(true);
  const [loadingShowtimes, setLoadingShowtimes] = useState(true);

  // Booking state
  const [activeShowtime, setActiveShowtime] = useState(null); // { showtimeId, cinemaId, ... }
  const [seatLayout, setSeatLayout] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]); // [{ seat_id, row, number, price }]

  const [ticketTypes, setTicketTypes] = useState([]);

  const [snacks, setSnacks] = useState([]);
  const [selectedSnacks, setSelectedSnacks] = useState({}); // { snack_id: { ...snack, quantity } }
  const [priceSummary, setPriceSummary] = useState({
    subtotal: 0,
    discount: 0,
    total: 0,
  });

  const [warning, setWarning] = useState({
    open: false,
    title: "Lưu ý!",
    message: "",
  });

  const showWarning = (message, title = "Lưu ý!") => {
    setWarning({
      open: true,
      title,
      message,
    });
  };

  const closeWarning = () => {
    setWarning((prev) => ({ ...prev, open: false }));
  };

  /* ===== LOAD MOVIE ===== */
  useEffect(() => {
    const fetchMovie = async () => {
      setLoadingMovie(true);
      const data = await getMovieById(id);
      setMovie(data || null);
      setLoadingMovie(false);
    };
    fetchMovie();
  }, [id]);

  /* ===== LOAD TICKET TYPES (MỖI SUẤT CHIẾU 1 BẢNG GIÁ – DÙNG API MỚI) ===== */
  useEffect(() => {
    // Chưa chọn suất chiếu thì reset về default
    // if (!activeShowtime?.showtimeId) {
    //   setTicketTypes(DEFAULT_TICKET_TYPES.map((t) => ({ ...t, quantity: 0 })));
    //   return;
    // }

    const fetchTicketTypesPerShowtime = async () => {
      try {
        const data = await getTicketTypes({
          showtimeId: activeShowtime.showtimeId,
          userId: user?.userId || null,
        });

        // data đã được mapTicketType() trong ticketTypeService rồi
        const list =
          Array.isArray(data) && data.length > 0 ? data : DEFAULT_TICKET_TYPES;

        setTicketTypes(list.map((t) => ({ ...t, quantity: 0 })));
      } catch (err) {
        console.error("getTicketTypes error, dùng DEFAULT_TICKET_TYPES", err);
        setTicketTypes(
          DEFAULT_TICKET_TYPES.map((t) => ({ ...t, quantity: 0 }))
        );
      }
    };

    fetchTicketTypesPerShowtime();
  }, [activeShowtime?.showtimeId, user?.id]);

  /* ===== LOAD SHOWTIMES THEO NGÀY ===== */
  useEffect(() => {
    if (!id) return;
    const fetchShowtimes = async () => {
      setLoadingShowtimes(true);
      const data = await getMovieShowtimesByDate(id, selectedDate);
      // format: [{ cinemaId, cinemaName, address, showtimes: [{ showtimeId, startTime, format, room, price }] }]
      setShowtimes(data || []);
      setLoadingShowtimes(false);
      resetBookingState(); // đổi ngày => reset
    };
    fetchShowtimes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, selectedDate]);

  /* ===== TÍNH TIỀN DỰA TRÊN LOẠI VÉ + BẮP NƯỚC (MOCK) ===== */
  useEffect(() => {
    if (!activeShowtime) {
      setPriceSummary({ subtotal: 0, discount: 0, total: 0 });
      return;
    }

    const ticketTotal = ticketTypes.reduce(
      (sum, t) => sum + (t.price || 0) * (t.quantity || 0),
      0
    );

    const snackTotal = Object.values(selectedSnacks).reduce(
      (sum, s) => sum + (s.price || 0) * (s.quantity || 0),
      0
    );

    const subtotal = ticketTotal + snackTotal;
    const discount = 0; // MovieDetailPage chỉ tạm tính, chưa áp dụng khuyến mãi
    const total = subtotal - discount;

    setPriceSummary({ subtotal, discount, total });
  }, [activeShowtime, ticketTypes, selectedSnacks]);

  /* ===== SEAT LAYOUT THEO ROW ===== */
  const layoutByRow = useMemo(() => {
    const map = {};
    seatLayout.forEach((s) => {
      if (!map[s.row]) map[s.row] = [];
      map[s.row].push(s);
    });
    Object.values(map).forEach((row) =>
      row.sort((a, b) => a.number - b.number)
    );
    return Object.entries(map).sort(([a], [b]) => (a > b ? 1 : -1));
  }, [seatLayout]);

  /* ===== TICKET / SEAT LOGIC ===== */
  // Tổng SỐ CHỖ (seat slot) được phép chọn từ loại vé
  // - Vé thường: 1 chỗ
  // - GHẾ ĐÔI (double): 2 chỗ
  const totalTickets = useMemo(() => {
    return ticketTypes.reduce((sum, t) => {
      const factor = isCoupleTicketType(t) ? 2 : 1;
      return sum + (t.quantity || 0) * factor;
    }, 0);
  }, [ticketTypes]);

  // Số CHỖ ĐƠN (NORMAL/VIP) được phép chọn
  const singleSeatCapacity = useMemo(() => {
    return ticketTypes
      .filter((t) => !isCoupleTicketType(t))
      .reduce((sum, t) => sum + (t.quantity || 0), 0);
  }, [ticketTypes]);

  // Số GHẾ ĐÔI được phép chọn (1 vé double = 1 ghế COUPLE = 2 slot)
  const coupleSeatCapacity = useMemo(() => {
    const doubleTicket = ticketTypes.find((t) => isCoupleTicketType(t));
    return doubleTicket?.quantity || 0;
  }, [ticketTypes]);

  const isSelectedSeat = (seatId) =>
    selectedSeats.some((s) => s.seat_id === seatId);

  const resetBookingState = () => {
    setActiveShowtime(null);
    setSeatLayout([]);
    setSelectedSeats([]);

    // Reset quantity về 0 nhưng giữ nguyên danh sách loại vé đã load từ API
    setTicketTypes((prev) => prev.map((t) => ({ ...t, quantity: 0 })));

    setSnacks([]);
    setSelectedSnacks({});
  };

  const handleSelectShowtime = async (cinema, s) => {
    // chọn suất mới → reset rồi set lại
    resetBookingState();

    const showtime = {
      showtimeId: s.showtimeId,
      cinemaId: cinema.cinemaId,
      cinemaName: cinema.cinemaName,
      address: cinema.address,
      startTime: s.startTime,
      format: s.format,
      room: s.room,
      price: s.price,
    };
    setActiveShowtime(showtime);

    const [seats, snacksData] = await Promise.all([
      getSeatLayout(s.showtimeId),
      getSnacksByCinema(cinema.cinemaId),
    ]);

    setSeatLayout(seats || []);
    setSnacks(snacksData || []);
  };

  const handleChangeTicket = (ticketId, delta) => {
    // Guest thường không được dùng GIÁ VÉ THÀNH VIÊN
    if (ticketId === "member" && !isAuthenticated && delta > 0) {
      showWarning(
        "Giá vé thành viên chỉ dành cho khách đã đăng nhập. Vui lòng đăng nhập hoặc đăng ký để sử dụng."
      );
      return;
    }

    setTicketTypes((prev) => {
      // Tính state mới nếu user bấm +/- cho 1 loại vé
      const next = prev.map((t) =>
        t.id === ticketId
          ? { ...t, quantity: Math.max(0, t.quantity + delta) }
          : t
      );

      // Sức chứa mới (tính theo "slot")
      const newTotalSeats = next.reduce((sum, t) => {
        const factor = isCoupleTicketType(t) ? 2 : 1;
        return sum + (t.quantity || 0) * factor;
      }, 0);

      const newSingleCapacity = next
        .filter((t) => !isCoupleTicketType(t))
        .reduce((sum, t) => sum + (t.quantity || 0), 0);

      const newCoupleCapacity =
        next.find((t) => isCoupleTicketType(t))?.quantity || 0;

      // Đang chọn bao nhiêu ghế đơn / ghế đôi / tổng slot
      const currentSingles = countSelectedSingles(selectedSeats);
      const currentCoupleSeats = countSelectedCoupleSeats(selectedSeats);
      const currentSeatSlots = countSeatSlots(selectedSeats);

      // Nếu giảm vé làm "sức chứa" < số ghế đang chọn → KHÔNG cho giảm
      if (
        newTotalSeats < currentSeatSlots ||
        newSingleCapacity < currentSingles ||
        newCoupleCapacity < currentCoupleSeats
      ) {
        showWarning(
          "Không thể giảm số vé vì số ghế đã chọn nhiều hơn. Vui lòng bỏ bớt ghế trước."
        );
        return prev; // giữ nguyên ticketTypes cũ
      }

      // Nếu về 0 vé thì clear luôn ghế đang chọn
      if (newTotalSeats === 0 && selectedSeats.length > 0) {
        setSelectedSeats([]);
      }

      return next;
    });
  };

  // Ghế đơn (NORMAL/VIP)
  function countSelectedSingles(seats) {
    return seats.filter((s) => s.type !== "COUPLE").length;
  }

  // Số GHẾ ĐÔI đang chọn (mỗi seat COUPLE = 1 ghế đôi)
  function countSelectedCoupleSeats(seats) {
    return seats.filter((s) => s.type === "COUPLE").length;
  }

  // Tổng SỐ CHỖ (slot) dùng để so với totalTickets
  // - Ghế thường = 1 chỗ
  // - Ghế đôi = 2 chỗ
  function countSeatSlots(seats) {
    return seats.reduce((sum, s) => sum + (s.type === "COUPLE" ? 2 : 1), 0);
  }

  // chọn ghế
  const handleToggleSeat = async (seat) => {
    if (!activeShowtime) return;
    if (seat.status === "BOOKED" || seat.status === "LOCKED") return;

    // Bắt buộc chọn vé trước
    if (totalTickets === 0) {
      showWarning("Vui lòng chọn số lượng vé trước khi chọn ghế.");
      return;
    }

    // ===== GHẾ ĐÔI (COUPLE) =====
    if (seat.type === "COUPLE") {
      // Phải có vé GHẾ ĐÔI
      const doubleTicket = ticketTypes.find((t) => isCoupleTicketType(t));
      const doubleQty = doubleTicket?.quantity || 0;

      if (doubleQty === 0) {
        showWarning(
          "Ghế này là GHẾ ĐÔI. Vui lòng chọn ít nhất 1 vé 'GHẾ ĐÔI (2 NGƯỜI)' trước."
        );
        return;
      }

      const already = isSelectedSeat(seat.seat_id);

      // 👉 BỎ CHỌN GHẾ ĐÔI
      if (already) {
        const newSelected = selectedSeats.filter(
          (s) => s.seat_id !== seat.seat_id
        );

        const violates = violatesSeatGapRuleForRow(
          seatLayout,
          newSelected,
          seat.row
        );
        if (violates) {
          showWarning(
            "Không thể bỏ ghế này vì sẽ để lại 1 ghế trống lẻ giữa các ghế. Vui lòng chọn lại."
          );
          return;
        }

        setSelectedSeats(newSelected);
        return;
      }

      // 👉 CHỌN GHẾ ĐÔI MỚI
      const currentCoupleSeats = countSelectedCoupleSeats(selectedSeats);
      if (currentCoupleSeats + 1 > doubleQty) {
        showWarning(
          "Số ghế đôi không được vượt quá số vé 'GHẾ ĐÔI (2 NGƯỜI)' đã chọn."
        );
        return;
      }

      const newSelected = [...selectedSeats, seat];

      // Check tổng SỐ CHỖ (1 ghế đôi = 2 slot)
      const newSeatSlots = countSeatSlots(newSelected);
      if (newSeatSlots > totalTickets) {
        showWarning(
          "Số chỗ ngồi (tính cả ghế đôi) không được vượt quá số vé đã chọn."
        );
        return;
      }

      const violates = violatesSeatGapRuleForRow(
        seatLayout,
        newSelected,
        seat.row
      );
      if (violates) {
        showWarning(
          "Không được để lại 1 ghế trống lẻ giữa các ghế đã chọn. Vui lòng chọn lại."
        );
        return;
      }

      setSelectedSeats(newSelected);
      return;
    }

    // ===== GHẾ THƯỜNG (NORMAL / VIP) =====
    const already = isSelectedSeat(seat.seat_id);

    if (already) {
      // BỎ CHỌN GHẾ THƯỜNG
      const newSelected = selectedSeats.filter(
        (s) => s.seat_id !== seat.seat_id
      );

      setSelectedSeats(newSelected);
    } else {
      const currentSingles = countSelectedSingles(selectedSeats);
      if (currentSingles + 1 > singleSeatCapacity) {
        showWarning(
          "Số ghế đơn (NORMAL/VIP) không được vượt quá tổng vé đơn đã chọn (NGƯỜI LỚN / HSSV / THÀNH VIÊN / ...)."
        );
        return;
      }

      const newSelected = [
        ...selectedSeats,
        {
          ...seat,
          // price: seat.price || activeShowtime.price || 0,
        },
      ];

      // Không cho vượt quá tổng SỐ CHỖ từ mọi loại vé
      const newSeatSlots = countSeatSlots(newSelected);
      if (newSeatSlots > totalTickets) {
        showWarning("Số ghế không được vượt quá số chỗ từ loại vé đã chọn.");
        return;
      }

      setSelectedSeats(newSelected);
    }
  };

  const handleChangeSnack = (snack, delta) => {
    setSelectedSnacks((prev) => {
      const current = prev[snack.snack_id] || { ...snack, quantity: 0 };
      const quantity = Math.max(0, current.quantity + delta);

      if (quantity === 0) {
        const clone = { ...prev };
        delete clone[snack.snack_id];
        return clone;
      }

      return {
        ...prev,
        [snack.snack_id]: { ...snack, quantity },
      };
    });
  };

  // ✅ BẢN REAL – CHUẨN FLOW CUỐI (RECOMMENDED DÙNG)
  // - Không gọi API ở đây
  // - Chỉ navigate sang /checkout
  const handleProceedBooking = () => {
    if (!activeShowtime) return;

    if (totalTickets === 0) {
      showWarning("Vui lòng chọn vé.");
      return;
    }

    if (selectedSeats.length === 0) {
      showWarning("Vui lòng chọn ghế.");
      return;
    }

    const cinemaPayload = {
      id:
        activeShowtime.cinemaId ||
        activeShowtime.cinema_id ||
        activeShowtime.cinema?.id ||
        null,
      name:
        activeShowtime.cinemaName ||
        activeShowtime.cinema_name ||
        activeShowtime.cinema?.name ||
        "",
      address:
        activeShowtime.address ||
        activeShowtime.cinemaAddress ||
        activeShowtime.cinema_address ||
        activeShowtime.cinema?.address ||
        "",
      room:
        activeShowtime.room ||
        activeShowtime.roomName ||
        activeShowtime.room_name ||
        "",
    };

    navigate("/checkout", {
      state: {
        showtimeId: activeShowtime.showtimeId || activeShowtime.id,
        cinema: cinemaPayload,
        movie,
        seats: selectedSeats,
        ticketTypes,
        snacks: selectedSnacks, // dạng object { snack_id: {...} } – CheckoutPage đang Object.values()
        priceSummary,
        // lock: không gửi, CheckoutPage tự lockSeats khi mount
      },
    });
  };

  /* ===== NOT FOUND ===== */
  if (!movie && !loadingMovie) {
    return (
      <div className="min-h-screen bg-[#050018] text-white">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-24 text-center">
          <p className="text-lg">Không tìm thấy phim.</p>
        </div>
        <Footer />
      </div>
    );
  }

  /* ===== RENDER MAIN ===== */

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#050018] via-[#080023] to-[#050018] text-white overflow-hidden">
      {/* glow background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-[8%] w-[520px] h-[520px] bg-[radial-gradient(circle_at_center,#7b5cff55,transparent)] blur-[110px]" />
        <div className="absolute top-[28%] right-[12%] w-[420px] h-[420px] bg-[radial-gradient(circle_at_center,#43e1ff40,transparent)] blur-[110px]" />
        <div className="absolute bottom-[-60px] left-1/3 w-[640px] h-[320px] bg-[radial-gradient(circle_at_center,#ff7af640,transparent)] blur-[130px]" />
      </div>

      <Navbar />

      <main className="relative z-10 pb-4 md:pb-6">
        {/* Back home */}
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <HomeButton />
        </div>

        {/* HERO: Poster + info */}
        <HeroSection movie={movie} />

        {/* LỊCH CHIẾU */}
        <ShowtimeSection
          showtimes={showtimes}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          loadingShowtimes={loadingShowtimes}
          activeShowtime={activeShowtime}
          onSelectShowtime={handleSelectShowtime}
        />

        {/* BOOKING PANEL */}
        {activeShowtime && (
          <BookingPanel
            activeShowtime={activeShowtime}
            ticketTypes={ticketTypes}
            onChangeTicket={handleChangeTicket}
            layoutByRow={layoutByRow}
            onToggleSeat={handleToggleSeat}
            isSelectedSeat={isSelectedSeat}
            snacks={snacks}
            selectedSnacks={selectedSnacks}
            onChangeSnack={handleChangeSnack}
            isAuthenticated={isAuthenticated}
          />
        )}

        {/* BOTTOM BAR: sticky, nằm TRONG main, phía trên Footer */}
        {activeShowtime && (
          <div className="sticky bottom-0 inset-x-0 z-30 bg-[#040015]/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-18px_45px_rgba(0,0,0,0.95)]">
            <div className="max-w-6xl mx-auto px-4 py-3 md:py-3.5 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] md:text-[12px]">
              {/* Info suất + ghế */}
              <div className="flex flex-col md:flex-row md:items-center gap-1.5 md:gap-4 w-full md:w-auto text-white/85">
                {/* Tiêu đề + tag nhỏ */}
                <div className="flex items-center gap-2 min-w-0">
                  {/* Nếu sau này có format 2D/3D/IMAX thì thay cứng "2D" bằng activeShowtime.format */}
                  <span className="px-2 py-0.5 rounded-md bg-[#7b5cff] text-[9px] uppercase tracking-[0.18em] text-white/95">
                    {activeShowtime.format || "2D"}
                  </span>
                  <span className="font-semibold text-[#ffe700] text-[12px] md:text-[13px] truncate">
                    {movie?.title}
                  </span>
                </div>

                {/* Thông tin rạp + giờ + ghế */}
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] md:text-[11px] text-white/70">
                  <span className="truncate">
                    {activeShowtime.cinemaName} • {activeShowtime.room}
                  </span>
                  <span className="truncate">
                    Suất: {activeShowtime.startTime}
                  </span>
                  <span className="truncate">
                    Ghế:{" "}
                    {selectedSeats.length
                      ? selectedSeats
                          .map((s) => `${s.row}${s.number}`)
                          .join(", ")
                      : "Chưa chọn"}
                  </span>
                </div>
              </div>

              {/* Tổng tiền + Button */}
              <div className="flex items-center gap-5 w-full md:w-auto justify-between md:justify-end">
                <div className="text-right">
                  <p className="text-[10px] md:text-[11px] text-white/60 uppercase tracking-[0.18em]">
                    Tạm tính
                  </p>
                  <p className="text-[#ffe700] font-extrabold text-[20px] md:text-[22px] leading-none">
                    {priceSummary.total.toLocaleString()}đ
                  </p>
                </div>

                <button
                  onClick={handleProceedBooking}
                  disabled={totalTickets === 0 || selectedSeats.length === 0}
                  className="px-6 md:px-8 py-3 rounded-2xl text-[12px] md:text-[14px] font-extrabold uppercase tracking-[0.2em]
                    bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6]
                    text-white shadow-[0_0_22px_rgba(123,92,255,0.95)]
                    hover:shadow-[0_0_34px_rgba(123,92,255,1)]
                    hover:brightness-110 hover:-translate-y-[1px]
                    active:translate-y-0 transition-all
                    disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ĐẶT VÉ NGAY
                </button>
              </div>
            </div>
          </div>
        )}

        {/* POPUP CẢNH BÁO THAY alert() */}
        {warning.open && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="w-[90%] max-w-md rounded-3xl bg-gradient-to-r from-[#4f46e5] via-[#7b5cff] to-[#ec4899] p-[1px] shadow-[0_30px_80px_rgba(0,0,0,0.95)]">
              <div className="rounded-3xl bg-[#050018]/95 px-6 py-6 text-center">
                <h3 className="text-[13px] sm:text-[14px] font-extrabold tracking-[0.28em] text-white uppercase mb-2">
                  {warning.title}
                </h3>
                <p className="text-xs sm:text-[13px] text-white/80 mb-6 leading-relaxed">
                  {warning.message}
                </p>
                <button
                  onClick={closeWarning}
                  className="inline-flex items-center justify-center px-10 py-2.5 rounded-full
                     text-[11px] sm:text-[12px] font-extrabold tracking-[0.2em] uppercase
                     bg-gradient-to-r from-[#ffe700] to-[#facc15] text-black
                     shadow-[0_0_18px_rgba(255,231,0,0.95)]
                     hover:brightness-110 hover:-translate-y-[1px]
                     active:translate-y-0 transition-all"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

/* ========= SUB COMPONENTS ========= */

function HeroSection({ movie }) {
  return (
    <section className="max-w-6xl mx-auto px-4 pt-6 pb-10 flex flex-col lg:flex-row gap-8 lg:gap-10 items-center lg:items-start">
      {/* Poster, tỷ lệ 2:3 */}
      <div className="relative w-[260px] sm:w-[300px] lg:w-[340px] aspect-[2/3] flex-shrink-0">
        <div className="absolute inset-0 rounded-3xl overflow-hidden border border-white/16 shadow-[0_24px_70px_rgba(0,0,0,0.9)] bg-black/40">
          {movie?.posterUrl ? (
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/40 text-xs">
              No Poster
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 max-w-3xl">
        {/* Sub heading */}
        <p className="text-[11px] sm:text-xs tracking-[0.22em] text-[#9ca3ff] uppercase">
          Movie Detail • CinesVerse
        </p>

        {/* Title */}
        <h1 className="mt-3 mb-5 py-1 text-3xl sm:text-4xl md:text-[40px] lg:text-[44px] font-extrabold leading-tight bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6] bg-clip-text text-transparent drop-shadow-[0_0_26px_rgba(123,92,255,0.9)]">
          {movie?.title || "..."}
        </h1>

        {/* Meta tags */}
        <div className="mt-4 flex flex-wrap gap-2 text-[11px] sm:text-xs text-[#e5e7ff]/90">
          {movie?.minimumAge && (
            <span className="px-2 py-0.5 rounded-md bg-[#ff4b4b] text-white text-[10px] font-bold">
              T{movie.minimumAge}
            </span>
          )}
          {movie?.genre && (
            <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/10">
              {movie.genre}
            </span>
          )}
          {movie?.duration && (
            <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/10">
              {movie.duration} phút
            </span>
          )}
          {movie?.language && (
            <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/10">
              {movie.language}
            </span>
          )}
          {movie?.releaseDate && (
            <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/10">
              Khởi chiếu: {movie.releaseDate}
            </span>
          )}
        </div>

        {/* Description */}
        {movie?.description && (
          <p className="mt-4 text-sm sm:text-[15px] text-[#e5e7ff]/90 leading-relaxed md:leading-relaxed">
            {movie.description}
          </p>
        )}

        {/* Director / Cast cards */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[12px] sm:text-[13px] text-[#e5e7ff]/90">
          {movie?.director && (
            <div className="bg-white/4 border border-white/10 rounded-2xl p-3">
              <p className="text-white/60 text-[10px] uppercase tracking-wide mb-1">
                Đạo diễn
              </p>
              <p>{movie.director}</p>
            </div>
          )}
          {movie?.cast && (
            <div className="bg-white/4 border border-white/10 rounded-2xl p-3">
              <p className="text-white/60 text-[10px] uppercase tracking-wide mb-1">
                Diễn viên
              </p>
              <p>{movie.cast}</p>
            </div>
          )}
        </div>

        {/* Trailer button */}
        {movie?.trailerUrl && (
          <div className="mt-6">
            <button
              onClick={() => window.open(movie.trailerUrl, "_blank")}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl text-[12px] sm:text-[13px] font-semibold text:white bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6] shadow-[0_0_24px_rgba(123,92,255,0.9)] hover:shadow-[0_0_34px_rgba(123,92,255,1)] hover:scale-[1.03] active:scale-100 transition-all"
            >
              🎬 XEM TRAILER
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function ShowtimeSection({
  showtimes,
  selectedDate,
  setSelectedDate,
  loadingShowtimes,
  activeShowtime,
  onSelectShowtime,
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-12 mt-8">
      {/* TIÊU ĐỀ */}
      <h2 className="text-center text-lg md:text-2xl font-extrabold text-[#e5e7ff] mb-6 tracking-[0.24em]">
        LỊCH CHIẾU THEO RẠP
      </h2>

      {/* CHỌN NGÀY */}
      <div className="flex justify-center gap-3 overflow-x-auto pb-3 mb-8 scrollbar-hide">
        {Array.from({ length: DAYS }).map((_, idx) => {
          const d = getDateByOffset(idx);
          const isActive = d.value === selectedDate;
          return (
            <button
              key={d.value}
              onClick={() => setSelectedDate(d.value)}
              className={`px-4 py-2.5 rounded-3xl text-[11px] md:text-xs border transition-all min-w-[86px] text-center
                ${
                  isActive
                    ? "bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6] text-white border-transparent shadow-[0_0_18px_rgba(123,92,255,0.95)]"
                    : "bg-white/5 border-white/12 text-[#cbd5ff]/90 hover:bg-white/10"
                }
              `}
            >
              <div className="font-semibold mb-0.5">{d.label}</div>
              <div className="text-[10px] opacity-80">{d.display}</div>
            </button>
          );
        })}
      </div>

      {/* NỘI DUNG LỊCH CHIẾU */}
      {loadingShowtimes ? (
        <p className="text-center text-sm text-white/70">
          Đang tải lịch chiếu...
        </p>
      ) : showtimes.length === 0 ? (
        <p className="text-center text-sm text:white/60">
          Hiện chưa có lịch chiếu cho ngày này.
        </p>
      ) : (
        <div className="space-y-5">
          {showtimes.map((c) => (
            <div
              key={c.cinemaId}
              className="
                rounded-[24px]
                bg-white/6 border border-white/12 backdrop-blur-md
                px-4 py-4 md:px-6 md:py-5
                shadow-[0_22px_70px_rgba(0,0,0,0.9)]
              "
            >
              {/* Tên rạp + địa chỉ */}
              <div className="mb-4">
                <p className="text-sm md:text-base font-semibold text:white">
                  {c.cinemaName}
                </p>
                <p className="text-[11px] md:text-xs text:white/60 mt-0.5">
                  {c.address}
                </p>
              </div>

              {/* CÁC SUẤT CHIẾU */}
              <div className="flex flex-wrap gap-2.5 md:gap-3">
                {c.showtimes.map((s) => {
                  const isActive = activeShowtime?.showtimeId === s.showtimeId;
                  return (
                    <button
                      key={s.showtimeId}
                      onClick={() => onSelectShowtime(c, s)}
                      className={`
                        px-4 py-2 md:px-5 md:py-2.5
                        rounded-xl border transition-all
                        text-xs md:text-sm font-semibold
                        flex items-center gap-1.5
                        ${
                          isActive
                            ? "bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6] text:white border-transparent shadow-[0_0_16px_rgba(123,92,255,0.9)]"
                            : "bg-[#020617] border-[#7b5cff66] text-[#e5e7ff] hover:bg-[#7b5cff33] hover:shadow-[0_0_14px_rgba(123,92,255,0.75)]"
                        }
                      `}
                    >
                      <span className="text-sm md:text-base font-bold">
                        {s.startTime}
                      </span>
                      <span className="text-[10px] md:text-[11px] opacity-85">
                        {s.format} • {s.room}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function BookingPanel({
  activeShowtime,
  ticketTypes,
  onChangeTicket,
  layoutByRow,
  onToggleSeat,
  isSelectedSeat,
  snacks,
  selectedSnacks,
  onChangeSnack,
  isAuthenticated,
}) {
  return (
    <section className="max-w-6xl mx-auto px-4 pb-24 space-y-10">
      {/* CHỌN LOẠI VÉ */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <h3 className="text-center text-xl md:text-2xl font-extrabold tracking-[0.24em] mb-8 text-white">
          CHỌN LOẠI VÉ
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 text-[11px]">
          {ticketTypes.map((t) => {
            const isMemberTicket = isMemberTicketType(t);
            const isDisabledMember = isMemberTicket && !isAuthenticated;

            return (
              <div
                key={t.id}
                className={`
        relative flex flex-col items-center justify-between
        rounded-2xl px-4 py-4
        bg-[#0b0a26]/70
        border border-white/10
        shadow-[0_8px_20px_rgba(0,0,0,0.7)]
        hover:bg-[#18163d]/90
        hover:border-[#7b5cff]
        hover:shadow-[0_0_20px_rgba(123,92,255,0.45)]
        hover:scale-[1.03]
        transition-all duration-300
        ${
          t.quantity > 0
            ? "ring-1 ring-[#ffe700] shadow-[0_0_24px_rgba(255,231,0,0.5)]"
            : ""
        }
        ${isDisabledMember ? "opacity-50 cursor-not-allowed" : ""}
      `}
              >
                <div className="text-[10px] text-white/50 mb-1 tracking-[0.1em] uppercase">
                  Loại vé
                </div>

                <div className="text-[13px] font-semibold text-white text-center leading-snug px-1 min-h-[34px] flex items-center justify-center">
                  {t.label}
                </div>

                <div className="mt-1 text-[#ffe700] font-semibold text-[12px]">
                  {t.price.toLocaleString()} VND
                </div>

                {/* Nếu là vé member và guest thường → hiện hint nhỏ */}
                {isDisabledMember && (
                  <p className="mt-1 text-[10px] text-amber-200/80 text-center">
                    Chỉ dành cho khách đã đăng nhập
                  </p>
                )}

                <div className="mt-3 flex items-center justify:center gap-2">
                  <button
                    onClick={() => onChangeTicket(t.id, -1)}
                    disabled={isDisabledMember}
                    className={`
            w-6 h-6 flex items-center justify-center
            rounded-md border border-white/35
            text-[11px] text-white/85
            hover:bg-white/15
            transition-all
            ${isDisabledMember ? "opacity-50 cursor-not-allowed" : ""}
          `}
                  >
                    −
                  </button>

                  <span className="min-w-[22px] text-center text-[11px] text-white">
                    {t.quantity}
                  </span>

                  <button
                    onClick={() => onChangeTicket(t.id, 1)}
                    disabled={isDisabledMember}
                    className={`
            w-6 h-6 flex items-center justify-center
            rounded-md
            bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6]
            text-[11px] text-white
            shadow-[0_0_10px_rgba(123,92,255,0.8)]
            hover:shadow-[0_0_16px_rgba(123,92,255,1)]
            transition-all
            ${isDisabledMember ? "opacity-50 cursor-not-allowed" : ""}
          `}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CHỌN GHẾ – phỏng theo Cinestar */}
      <div className="pt-4">
        {/* Heading + màn hình */}
        <div className="text-center mb-6">
          <h3
            className="
    text-center
    text-[22px] sm:text-[24px] md:text-[26px]
    font-extrabold
    tracking-[0.30em]
    uppercase
    text-white
    mb-6
  "
          >
            CHỌN GHẾ - {activeShowtime.room || "RẠP"}
          </h3>

          {/* Thanh màn hình cong (ảnh Cinestar) */}
          <div className="mx-auto flex justify-center w-full">
            <div className="relative w-full max-w-[960px]">
              <img
                src="https://cinestar.com.vn/assets/images/img-screen.png"
                alt="Screen"
                className="w-full mx-auto pointer-events-none select-none"
              />
              <p
                className="
    mt-6
    text-[16px] sm:text-sm md:text-base
    text-white/70
    tracking-[0.25em]
    uppercase
  "
              >
                Màn hình
              </p>
            </div>
          </div>
        </div>

        {/* KHUNG GHẾ */}
        <div className="mx-auto w-full max-w-[960px]">
          <div className="flex flex-col items-center gap-2 text-[9px] sm:text-[10px]">
            {layoutByRow.map(([row, seats]) => (
              <div key={row} className="flex items-center gap-2">
                {/* Ký tự hàng A, B, C... */}
                <span className="w-4 text-right text-white/60">{row}</span>

                <div className="flex gap-1.5">
                  {seats.map((seat) => {
                    const isCoupleSeat = seat.type === "COUPLE";
                    const selected = isSelectedSeat(seat.seat_id);
                    const booked = seat.status === "BOOKED";
                    const locked = seat.status === "LOCKED";

                    // Ghế couple: rộng hơn, nhìn giống ghế đôi
                    const sizeClasses = isCoupleSeat
                      ? "h-7 sm:h-8 px-4 sm:px-5 rounded-[6px]"
                      : "w-7 h-7 sm:w-8 sm:h-8 rounded-[4px]";

                    const label = isCoupleSeat
                      ? `${seat.row}${seat.number}`
                      : seat.number;

                    return (
                      <button
                        key={seat.seat_id}
                        onClick={() => onToggleSeat(seat)}
                        disabled={booked || locked}
                        className={`
              ${sizeClasses}
              text-[9px] sm:text-[10px]
              flex items-center justify-center
              border transition-all
              ${
                booked
                  ? "bg-slate-800 border border-slate-700 text-slate-400 cursor-not-allowed"
                  : locked
                  ? "bg-slate-500 border border-slate-500 text-slate-200 cursor-not-allowed"
                  : selected
                  ? "bg-[#facc15] border border-[#facc15] text-black font-bold shadow-[0_0_10px_rgba(250,204,21,0.9)]"
                  : "bg-white border border-white/80 text-black hover:bg-slate-100"
              }
            `}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Legend dưới giống Cinestar */}
        <div className="mt-5 flex flex-wrap justify-center gap-6 text-[9px] sm:text-[10px] text-white/75">
          {/* Ghế thường / trống */}
          <Legend
            color="bg-white border border-white/80"
            label="Ghế thường / trống"
          />

          {/* Ghế đôi (2 người) – dùng icon SVG */}
          <Legend
            imageSrc="https://cinestar.com.vn/assets/images/seat-couple-w.svg"
            label="Ghế đôi (2 người)"
          />

          {/* Ghế đang chọn */}
          <Legend
            color="bg-[#facc15] border border-[#facc15]"
            label="Ghế đang chọn"
          />

          {/* Ghế đang được chọn bởi người khác */}
          <Legend
            color="bg-slate-500 border border-slate-500 text-slate-200 cursor-not-allowed"
            label="Ghế đang được giữ"
          />

          {/* Ghế đã đặt */}
          <Legend
            color="bg-slate-800 border border-slate-700"
            label="Ghế đã đặt"
          />
        </div>
      </div>

      {/* 🎬 CHỌN BẮP NƯỚC */}
      <section className="max-w-6xl mx-auto px-4 pb-24 mt-16 md:mt-20 lg:mt-24">
        <h3 className="text-center text-2xl md:text-3xl font-extrabold tracking-[0.24em] mb-10 text-white">
          CHỌN BẮP NƯỚC
        </h3>

        {snacks.length === 0 ? (
          <p className="text-center text-sm md:text-base text-white/50">
            Hiện chưa có dữ liệu bắp nước.
          </p>
        ) : (
          <div className="space-y-12">
            {Object.entries(
              snacks.reduce((acc, s) => {
                const cat = s.category || "KHÁC";
                if (!acc[cat]) acc[cat] = [];
                acc[cat].push(s);
                return acc;
              }, {})
            ).map(([category, items]) => (
              <div key={category} className="flex flex-col items:center">
                {/* Tiêu đề nhóm */}
                <h4 className="mb-5 text-xs md:text-sm font-semibold text-[#ffdf7b] tracking-[0.22em] uppercase text-center">
                  {category}
                </h4>

                {/* Các item căn giữa – PHÓNG TO */}
                <div className="flex flex-wrap justify-center gap-5 md:gap-7">
                  {items.map((snack) => {
                    const selected = selectedSnacks[snack.snack_id];
                    const qty = selected?.quantity || 0;

                    return (
                      <div
                        key={snack.snack_id}
                        className={`
                    w-[160px] sm:w-[190px] lg:w-[210px]
                    flex flex-col items-center text-center
                    px-4 pt-4 pb-3
                    rounded-3xl
                    bg-[#0b0a26]/85Movie Detail
                    border border-white/12
                    shadow-[0_16px_40px_rgba(0,0,0,0.85)]
                    hover:bg-[#18163d]/95
                    hover:border-[#7b5cff]
                    hover:shadow-[0_0_30px_rgba(123,92,255,0.6)]
                    transition-all duration-300
                    ${
                      qty > 0
                        ? "ring-2 ring-[#ffe700] shadow-[0_0_32px_rgba(255,231,0,0.7)]"
                        : ""
                    }
                  `}
                      >
                        {/* Ảnh */}
                        {snack.image_url && (
                          <div className="w-full h-24 md:h-28 flex items-center justify-center mb-3">
                            <img
                              src={snack.image_url}
                              alt={snack.name}
                              className="max-h-full max-w-full object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.9)]"
                            />
                          </div>
                        )}

                        {/* Tên + giá */}
                        <p className="text-[11px] md:text-[12px] font-semibold text-white leading-snug line-clamp-2 min-h-[30px]">
                          {snack.name}
                        </p>
                        <p className="mt-1.5 text-[12px] md:text-[13px] font-semibold text-[#ffe700]">
                          {snack.price.toLocaleString()}đ
                        </p>

                        {/* Nút +/- */}
                        <div className="mt-3 flex items-center justify-center gap-2.5">
                          <button
                            onClick={() => onChangeSnack(snack, -1)}
                            className="
                        w-7 h-7 flex items-center justify-center
                        rounded-md border border-white/40
                        text-[12px] text-white/85
                        hover:bg-white/15
                        transition-all
                      "
                          >
                            −
                          </button>

                          <span className="min-w-[26px] text-center text-[12px] md:text-[13px] text-white">
                            {qty}
                          </span>

                          <button
                            onClick={() => onChangeSnack(snack, 1)}
                            className="
                        w-7 h-7 flex items-center justify-center
                        rounded-md
                        bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6]
                        text-[12px] text-white
                        shadow-[0_0_14px_rgba(123,92,255,0.9)]
                        hover:shadow-[0_0_20px_rgba(123,92,255,1)]
                        transition-all
                      "
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </section>
  );
}

/* ===== COMMON ===== */

function Legend({ color, label, imageSrc }) {
  return (
    <div className="flex items-center gap-2">
      {imageSrc ? (
        <img src={imageSrc} alt={label} className="w-7 h-7 object-contain" />
      ) : (
        <span className={`inline-block w-4 h-4 rounded-[4px] ${color}`} />
      )}
      <span className="text-white/80">{label}</span>
    </div>
  );
}

/* ===== HELPERS ===== */

// (Giờ không dùng nữa nhưng để lại nếu sau này cần)
// Tìm ghế partner cho ghế đôi: pattern 1-2, 3-4, 5-6, 7-8, 9-10
function findPartnerSeat(seatLayout, seat) {
  if (!seat || seat.type !== "COUPLE") return null;

  const partnerNumber =
    seat.number % 2 === 1 ? seat.number + 1 : seat.number - 1;

  return seatLayout.find(
    (s) => s.row === seat.row && s.number === partnerNumber
  );
}

// Đếm số "cụm 1 ghế trống lẻ" trong 1 hàng: A...A, R...R
function countLonelyA(statusArr) {
  const extended = ["R", ...statusArr, "R"];
  let countA = 0;
  let lonely = 0;

  for (let i = 0; i < extended.length; i++) {
    const c = extended[i];
    if (c === "A") {
      countA++;
    } else {
      if (countA === 1) {
        lonely++;
      }
      countA = 0;
    }
  }

  return lonely;
}

function violatesSeatGapRuleForRow(seatLayout, selectedSeats, rowName) {
  const rowSeats = seatLayout
    .filter((s) => s.row === rowName)
    .sort((a, b) => a.number - b.number);

  if (rowSeats.length === 0) return false;

  // Nếu là HÀNG GHẾ ĐÔI → KHÔNG áp dụng rule ghế lẻ
  const isCoupleRow = rowSeats.every((s) => s.type === "COUPLE");
  if (isCoupleRow) {
    return false;
  }

  // ===== HÀNG THƯỜNG / VIP =====
  const selectedIds = new Set(selectedSeats.map((s) => s.seat_id));

  // reserved[i] = true nếu ghế i đã bị chiếm (BOOKED hoặc đang chọn)
  const reserved = rowSeats.map(
    (seat) => seat.status === "BOOKED" || selectedIds.has(seat.seat_id)
  );

  const n = rowSeats.length;

  for (let i = 0; i < n; i++) {
    const isEmpty = !reserved[i];
    if (!isEmpty) continue;

    const leftReserved = i > 0 && reserved[i - 1];
    const rightReserved = i < n - 1 && reserved[i + 1];

    // Rule 1: 1 ghế trống kẹp giữa 2 ghế đã đặt
    if (leftReserved && rightReserved) return true;

    // Rule 2: 1 ghế trống ở mép, sát cụm ghế đã đặt
    if ((i === 0 && rightReserved) || (i === n - 1 && leftReserved)) {
      return true;
    }
  }

  return false;
}

// Helper: format local date -> "YYYY-MM-DD"
function formatDateLocalYYYYMMDD(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getToday() {
  const d = new Date();
  return formatDateLocalYYYYMMDD(d);
}

function getDateByOffset(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);

  const value = formatDateLocalYYYYMMDD(d); // 👈 dùng local, không ISO
  const weekday = d.toLocaleDateString("vi-VN", { weekday: "short" });
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");

  return {
    value,
    label: offset === 0 ? "HÔM NAY" : weekday.toUpperCase(),
    display: `${day}/${month}`,
  };
}

function isCoupleTicketType(t) {
  const code = t.code?.toLowerCase?.() || "";
  const id = t.id?.toLowerCase?.() || "";
  const label = t.label || "";

  return code === "double" || id === "double" || /ghế đôi|couple/i.test(label);
}

function isMemberTicketType(t) {
  const code = t.code?.toLowerCase?.() || "";
  const id = t.id?.toLowerCase?.() || "";
  const label = t.label || "";

  return code === "member" || id === "member" || /thành viên/i.test(label);
}

function formatTime(sec) {
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
