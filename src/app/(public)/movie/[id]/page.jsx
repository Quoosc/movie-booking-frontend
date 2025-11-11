// // src/app/(public)/movie/[id]/page.jsx
// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import Navbar from "@/components/common/Navbar";
// import Footer from "@/components/common/Footer";
// import { getMovieById, getMovieShowtimesByDate } from "@/api/movieService";
// import HomeButton from "@/components/shared/Buttons/HomeButton";

// const DAYS = 7;

// export default function MovieDetailPage() {
//   const { id } = useParams();
//   const [movie, setMovie] = useState(null);
//   const [selectedDate, setSelectedDate] = useState(getToday());
//   const [showtimes, setShowtimes] = useState([]);
//   const [loadingMovie, setLoadingMovie] = useState(true);
//   const [loadingShowtimes, setLoadingShowtimes] = useState(true);

//   useEffect(() => {
//     const fetchMovie = async () => {
//       setLoadingMovie(true);
//       const data = await getMovieById(id);
//       setMovie(data);
//       setLoadingMovie(false);
//     };
//     fetchMovie();
//   }, [id]);

//   useEffect(() => {
//     if (!id) return;
//     const fetchShowtimes = async () => {
//       setLoadingShowtimes(true);
//       const data = await getMovieShowtimesByDate(id, selectedDate);
//       setShowtimes(data || []);
//       setLoadingShowtimes(false);
//     };
//     fetchShowtimes();
//   }, [id, selectedDate]);

//   if (!movie && !loadingMovie) {
//     return (
//       <div className="min-h-screen bg-[#050018] text-white">
//         <Navbar />
//         <div className="max-w-5xl mx-auto px-4 py-24 text-center text-lg">
//           <p>Không tìm thấy phim.</p>
//         </div>
//         <Footer />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-[#050018] via-[#080023] to-[#050018] text-white relative overflow-hidden">
//       {/* Neon Background */}
//       <div className="pointer-events-none absolute inset-0">
//         <div className="absolute -top-40 left-[8%] w-[550px] h-[550px] bg-[radial-gradient(circle_at_center,#7b5cff55,transparent)] blur-[130px]" />
//         <div className="absolute top-[28%] right-[12%] w-[480px] h-[480px] bg-[radial-gradient(circle_at_center,#43e1ff40,transparent)] blur-[130px]" />
//         <div className="absolute bottom-[-60px] left-1/3 w-[700px] h-[360px] bg-[radial-gradient(circle_at_center,#ff7af640,transparent)] blur-[160px]" />
//       </div>

//       <Navbar />

//       <main className="relative z-10">
//         {/* Nút Home */}
//         <div className="max-w-7xl mx-auto px-6 pt-6">
//           <HomeButton />
//         </div>

//         {/* ===== Movie Info Section ===== */}
//         <section className="max-w-7xl mx-auto px-6 pt-10 pb-14 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16">
//           {/* Poster */}
//           <div className="w-[280px] sm:w-[320px] lg:w-[360px] rounded-3xl overflow-hidden border border-white/20 shadow-[0_20px_80px_rgba(123,92,255,0.25)] hover:scale-105 transition-transform duration-500">
//             {movie?.posterUrl && (
//               <img
//                 src={movie.posterUrl}
//                 alt={movie.title}
//                 className="w-full h-full object-cover"
//               />
//             )}
//           </div>

//           {/* Thông tin phim */}
//           <div className="flex-1 max-w-2xl text-center lg:text-left">
//             <p className="text-[12px] tracking-[0.25em] text-[#9ca3ff] uppercase">
//               Movie Detail • CinesVerse
//             </p>

//             <h1
//               className="mt-3 text-3xl sm:text-4xl md:text-5xl font-extrabold leading-snug tracking-wide
//               bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6] bg-clip-text text-transparent
//               drop-shadow-[0_0_25px_rgba(123,92,255,0.8)]"
//             >
//               {movie?.title || "..."}
//             </h1>

//             {/* Tags */}
//             <div className="mt-6 flex flex-wrap justify-center lg:justify-start gap-3 text-sm text-[#cbd5ff]/90">
//               {movie?.minimumAge && (
//                 <span className="px-2 py-1 rounded-md bg-[#ff4b4b] text-white text-xs font-bold shadow-[0_0_10px_rgba(255,75,75,0.6)]">
//                   T{movie.minimumAge}
//                 </span>
//               )}
//               {movie?.genre && (
//                 <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
//                   {movie.genre}
//                 </span>
//               )}
//               {movie?.duration && (
//                 <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
//                   {movie.duration} phút
//                 </span>
//               )}
//               {movie?.language && (
//                 <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
//                   {movie.language}
//                 </span>
//               )}
//             </div>

//             {/* Mô tả */}
//             <p className="mt-6 text-[15px] text-[#e5e7ff]/85 leading-relaxed max-w-xl mx-auto lg:mx-0">
//               {movie?.description}
//             </p>

//             {/* Director & Cast */}
//             <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg mx-auto lg:mx-0 text-[14px] text-[#d5d8ff]/90">
//               {movie?.director && (
//                 <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-all">
//                   <p className="text-white/60 text-[11px] uppercase tracking-widest mb-1">
//                     Đạo diễn
//                   </p>
//                   <p className="font-medium text-white">{movie.director}</p>
//                 </div>
//               )}
//               {movie?.cast && (
//                 <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm hover:bg-white/10 transition-all">
//                   <p className="text-white/60 text-[11px] uppercase tracking-widest mb-1">
//                     Diễn viên
//                   </p>
//                   <p className="font-medium text-white">{movie.cast}</p>
//                 </div>
//               )}
//             </div>

//             {/* Trailer Button */}
//             {movie?.trailerUrl && (
//               <div className="mt-8">
//                 <button
//                   onClick={() => window.open(movie.trailerUrl, "_blank")}
//                   className="px-8 py-3 rounded-2xl text-[14px] font-semibold text-white
//                     bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6]
//                     shadow-[0_0_25px_rgba(123,92,255,0.8)]
//                     hover:shadow-[0_0_40px_rgba(123,92,255,1)]
//                     hover:scale-[1.03] active:scale-100 transition-all"
//                 >
//                   🎬 XEM TRAILER
//                 </button>
//               </div>
//             )}
//           </div>
//         </section>

//         {/* ===== Showtime Section ===== */}
//         <section className="max-w-5xl mx-auto px-6 pb-20 text-center">
//           <h2 className="text-lg md:text-xl font-semibold text-[#e5e7ff] mb-6 tracking-wider">
//             🎟️ LỊCH CHIẾU
//           </h2>

//           {/* Date selector */}
//           <div className="flex justify-center gap-3 overflow-x-auto pb-3 mb-8 scrollbar-hide">
//             {Array.from({ length: DAYS }).map((_, idx) => {
//               const d = getDateByOffset(idx);
//               const isActive = d.value === selectedDate;
//               return (
//                 <button
//                   key={d.value}
//                   onClick={() => setSelectedDate(d.value)}
//                   className={`px-4 py-2.5 rounded-2xl text-[12px] border transition-all ${
//                     isActive
//                       ? "bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6] text-white border-transparent shadow-[0_0_14px_rgba(123,92,255,0.9)]"
//                       : "bg-white/5 border-white/10 text-[#cbd5ff]/80 hover:bg-white/10"
//                   }`}
//                 >
//                   <div className="font-semibold">{d.label}</div>
//                   <div className="text-[10px] opacity-75">{d.display}</div>
//                 </button>
//               );
//             })}
//           </div>

//           {/* Showtime list */}
//           <div className="max-w-3xl mx-auto">
//             {loadingShowtimes ? (
//               <p className="text-sm text-white/70">Đang tải lịch chiếu...</p>
//             ) : showtimes.length === 0 ? (
//               <p className="text-sm text-white/60">
//                 Hiện chưa có lịch chiếu cho ngày này.
//               </p>
//             ) : (
//               <div className="space-y-6">
//                 {showtimes.map((c) => (
//                   <div
//                     key={c.cinemaId}
//                     className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.05)] text-left"
//                   >
//                     <p className="text-[15px] font-semibold text-white mb-1">
//                       {c.cinemaName}
//                     </p>
//                     <p className="text-[12px] text-white/60 mb-3">
//                       {c.address}
//                     </p>

//                     <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
//                       {c.showtimes.map((s) => (
//                         <button
//                           key={s.showtimeId}
//                           className="px-4 py-2 rounded-xl bg-[#050018] border border-[#7b5cff66] text-[12px] text-[#e5e7ff] hover:bg-[#7b5cff33] hover:shadow-[0_0_12px_rgba(123,92,255,0.7)] transition-all"
//                         >
//                           <span className="font-semibold mr-1">
//                             {s.startTime}
//                           </span>
//                           <span className="text-[10px] opacity-75">
//                             {s.format} • {s.room}
//                           </span>
//                           <span className="ml-2 text-[#ffe700] font-semibold">
//                             {s.price.toLocaleString()}đ
//                           </span>
//                         </button>
//                       ))}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </section>
//       </main>

//       <Footer />
//     </div>
//   );
// }

// /* ===== Helpers ===== */
// function getToday() {
//   return new Date().toISOString().slice(0, 10);
// }

// function getDateByOffset(offset) {
//   const d = new Date();
//   d.setDate(d.getDate() + offset);

//   const value = d.toISOString().slice(0, 10);
//   const weekday = d.toLocaleDateString("vi-VN", { weekday: "short" });
//   const day = String(d.getDate()).padStart(2, "0");
//   const month = String(d.getMonth() + 1).padStart(2, "0");

//   return {
//     value,
//     label: offset === 0 ? "HÔM NAY" : weekday.toUpperCase(),
//     display: `${day}/${month}`,
//   };
// }
// src/app/(public)/movie/[id]/page.jsx

// src/app/(public)/movie/[id]/page.jsx

import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import HomeButton from "@/components/shared/Buttons/HomeButton";

import { getMovieById, getMovieShowtimesByDate } from "@/api/movieService";

import {
  getSeatLayout,
  getSnacksByCinema,
  holdSeats,
  releaseSeats,
  previewPrice,
} from "@/api/bookingService";

const DAYS = 7;
const HOLD_SECONDS = 300; // 5 phút

// Mock loại vé (sau này có thể lấy từ BE theo showtime)
const BASE_TICKET_TYPES = [
  { id: "adult", label: "NGƯỜI LỚN", price: 69000 },
  { id: "student", label: "HSSV/U22-GV", price: 49000 },
  { id: "senior", label: "NGƯỜI CAO TUỔI", price: 55000 },
  { id: "member", label: "GIÁ VÉ THÀNH VIÊN", price: 45000 },
  { id: "double", label: "GHẾ ĐÔI (2 NGƯỜI)", price: 128000 },
];

export default function MovieDetailPage() {
  const { id } = useParams();

  const [movie, setMovie] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [showtimes, setShowtimes] = useState([]);
  const [loadingMovie, setLoadingMovie] = useState(true);
  const [loadingShowtimes, setLoadingShowtimes] = useState(true);

  // Booking state
  const [activeShowtime, setActiveShowtime] = useState(null); // { showtimeId, cinemaId, ... }
  const [seatLayout, setSeatLayout] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]); // [{ seat_id, row, number, price }]
  const [ticketTypes, setTicketTypes] = useState(
    BASE_TICKET_TYPES.map((t) => ({ ...t, quantity: 0 }))
  );
  const [snacks, setSnacks] = useState([]);
  const [selectedSnacks, setSelectedSnacks] = useState({}); // { snack_id: { ...snack, quantity } }
  const [holdExpireAt, setHoldExpireAt] = useState(null);
  const [remainSeconds, setRemainSeconds] = useState(0);
  const [priceSummary, setPriceSummary] = useState({
    subtotal: 0,
    discount: 0,
    total: 0,
  });

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

  /* ===== HOLD TIMER ===== */
  useEffect(() => {
    if (!holdExpireAt) {
      setRemainSeconds(0);
      return;
    }

    const timer = setInterval(() => {
      const diff = Math.max(
        0,
        Math.floor((new Date(holdExpireAt).getTime() - Date.now()) / 1000)
      );
      setRemainSeconds(diff);

      if (diff <= 0) {
        if (activeShowtime && selectedSeats.length > 0) {
          releaseSeats(
            activeShowtime.showtimeId,
            selectedSeats.map((s) => s.seat_id)
          );
        }
        resetBookingState();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [holdExpireAt, activeShowtime, selectedSeats]);

  /* ===== TÍNH TIỀN (previewPrice) ===== */
  useEffect(() => {
    const calc = async () => {
      if (!activeShowtime) {
        setPriceSummary({ subtotal: 0, discount: 0, total: 0 });
        return;
      }

      const seatIds = selectedSeats.map((s) => s.seat_id);
      const snackList = Object.values(selectedSnacks).map((s) => ({
        snack_id: s.snack_id,
        quantity: s.quantity,
        price: s.price,
      }));

      const res = await previewPrice({
        showtimeId: activeShowtime.showtimeId,
        seatIds,
        snacks: snackList,
      });

      if (res?.data) {
        setPriceSummary(res.data);
      } else {
        // fallback mock
        const seatTotal = selectedSeats.reduce(
          (sum, s) => sum + (s.price || 0),
          0
        );
        const snackTotal = snackList.reduce(
          (sum, s) => sum + s.price * s.quantity,
          0
        );
        const total = seatTotal + snackTotal;
        setPriceSummary({ subtotal: total, discount: 0, total });
      }
    };

    calc();
  }, [activeShowtime, selectedSeats, selectedSnacks]);

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

  const totalTickets = useMemo(
    () => ticketTypes.reduce((sum, t) => sum + t.quantity, 0),
    [ticketTypes]
  );

  const isSelectedSeat = (seatId) =>
    selectedSeats.some((s) => s.seat_id === seatId);

  const resetBookingState = () => {
    setActiveShowtime(null);
    setSeatLayout([]);
    setSelectedSeats([]);
    setTicketTypes(BASE_TICKET_TYPES.map((t) => ({ ...t, quantity: 0 })));
    setSnacks([]);
    setSelectedSnacks({});
    setHoldExpireAt(null);
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
    setTicketTypes((prev) => {
      const next = prev.map((t) =>
        t.id === ticketId
          ? { ...t, quantity: Math.max(0, t.quantity + delta) }
          : t
      );

      // Nếu giảm số vé < số ghế đang chọn -> cắt bớt ghế cuối
      const newTotal = next.reduce((sum, t) => sum + t.quantity, 0);
      if (newTotal < selectedSeats.length) {
        setSelectedSeats((old) => old.slice(0, newTotal));
      }

      // Nếu về 0 vé -> release hết seat & huỷ hold
      if (newTotal === 0 && activeShowtime && selectedSeats.length > 0) {
        releaseSeats(
          activeShowtime.showtimeId,
          selectedSeats.map((s) => s.seat_id)
        );
        setSelectedSeats([]);
        setHoldExpireAt(null);
      }

      return next;
    });
  };

  const handleToggleSeat = async (seat) => {
    if (!activeShowtime) return;
    if (seat.status === "BOOKED") return;

    // Bắt buộc chọn vé trước
    if (totalTickets === 0) {
      alert("Vui lòng chọn số lượng vé trước khi chọn ghế.");
      return;
    }

    const already = isSelectedSeat(seat.seat_id);

    if (already) {
      const newSelected = selectedSeats.filter(
        (s) => s.seat_id !== seat.seat_id
      );
      setSelectedSeats(newSelected);
      await releaseSeats(activeShowtime.showtimeId, [seat.seat_id]);
      if (newSelected.length === 0) setHoldExpireAt(null);
    } else {
      // không cho chọn quá số vé
      if (selectedSeats.length >= totalTickets) {
        alert("Số ghế không được vượt quá số vé đã chọn.");
        return;
      }

      const newSelected = [
        ...selectedSeats,
        {
          ...seat,
          price: seat.price || activeShowtime.price || 0,
        },
      ];
      setSelectedSeats(newSelected);

      const res = await holdSeats(
        activeShowtime.showtimeId,
        [seat.seat_id],
        HOLD_SECONDS
      );
      if (res?.data?.expires_at) setHoldExpireAt(res.data.expires_at);
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

  const handleProceedBooking = () => {
    if (!activeShowtime) return;
    if (totalTickets === 0) {
      alert("Vui lòng chọn vé.");
      return;
    }
    if (selectedSeats.length === 0) {
      alert("Vui lòng chọn ghế.");
      return;
    }
    if (remainSeconds === 0) {
      alert("Hết thời gian giữ ghế, vui lòng chọn lại.");
      return;
    }

    // Mock submit
    alert(
      `Mock đặt vé:
Phim: ${movie?.title}
Rạp: ${activeShowtime.cinemaName}
Suất: ${activeShowtime.startTime}
Ghế: ${selectedSeats.map((s) => `${s.row}${s.number}`).join(", ")}
Tổng tiền: ${priceSummary.total.toLocaleString()}đ`
    );
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

      <main className="relative z-10 pb-10">
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
          />
        )}

        {/* BOTTOM BAR: sticky, nằm TRONG main, phía trên Footer */}
        {activeShowtime && (
          <div className="sticky bottom-0 inset-x-0 z-30 bg-[#050018] border-t border-white/10">
            <div className="max-w-6xl mx-auto px-4 py-2 flex flex-col md:flex-row items-center justify-between gap-2 text-[10px] md:text-[11px]">
              {/* Info suất + ghế */}
              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-3 text-white/80 w-full md:w-auto">
                <span className="font-semibold text-[#ffe700] line-clamp-1">
                  {movie?.title}
                </span>
                <span className="line-clamp-1">
                  {activeShowtime.cinemaName} • {activeShowtime.startTime} •{" "}
                  {activeShowtime.room}
                </span>
                <span className="line-clamp-1">
                  Ghế:{" "}
                  {selectedSeats.length
                    ? selectedSeats.map((s) => `${s.row}${s.number}`).join(", ")
                    : "Chưa chọn"}
                </span>
              </div>

              {/* Timer + Tổng tiền + Button */}
              <div className="flex flex-wrap md:flex-nowrap items-center gap-3 justify-between w-full md:w-auto">
                <div className="text-[#ffed4a] font-semibold min-w-[96px]">
                  {remainSeconds > 0 && selectedSeats.length > 0
                    ? `Giữ ghế: ${formatTime(remainSeconds)}`
                    : selectedSeats.length > 0
                    ? "Hết thời gian giữ ghế"
                    : ""}
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-white/60 text-[9px]">Tạm tính</span>
                  <span className="text-[#ffe700] font-extrabold text-sm md:text-base">
                    {priceSummary.total.toLocaleString()}đ
                  </span>
                </div>

                <button
                  onClick={handleProceedBooking}
                  disabled={
                    totalTickets === 0 ||
                    selectedSeats.length === 0 ||
                    remainSeconds === 0
                  }
                  className="px-4 py-2 rounded-lg text-[10px] md:text-xs font-extrabold bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6] text-white hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ĐẶT VÉ
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
    <section className="max-w-6xl mx-auto px-4 pt-4 pb-8 flex flex-col lg:flex-row gap-8 lg:gap-10 items-center lg:items-start">
      {/* Poster */}
      <div className="w-[240px] sm:w-[260px] lg:w-[280px] flex-shrink-0">
        <div className="rounded-3xl overflow-hidden border border-white/16 shadow-[0_20px_60px_rgba(0,0,0,0.9)] bg-black/40">
          {movie?.posterUrl ? (
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-[360px] flex items-center justify-center text-white/40 text-xs">
              No Poster
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 max-w-2xl">
        <p className="text-[10px] tracking-[0.22em] text-[#9ca3ff] uppercase">
          Movie Detail • CinesVerse
        </p>
        <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold leading-snug bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6] bg-clip-text text-transparent drop-shadow-[0_0_26px_rgba(123,92,255,0.9)]">
          {movie?.title || "..."}
        </h1>

        <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-[#cbd5ff]/90">
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
            <span className="px-3 py-1 rounded-xl bg白/5 border border-white/10">
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

        {movie?.description && (
          <p className="mt-4 text-[13px] text-[#e5e7ff]/85 leading-relaxed">
            {movie.description}
          </p>
        )}

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] text-[#cbd5ff]/90">
          {movie?.director && (
            <div className="bg-white/4 border border-white/10 rounded-2xl p-3">
              <p className="text-white/60 text-[9px] uppercase tracking-wide mb-1">
                Đạo diễn
              </p>
              <p>{movie.director}</p>
            </div>
          )}
          {movie?.cast && (
            <div className="bg-white/4 border border-white/10 rounded-2xl p-3">
              <p className="text-white/60 text-[9px] uppercase tracking-wide mb-1">
                Diễn viên
              </p>
              <p>{movie.cast}</p>
            </div>
          )}
        </div>

        {movie?.trailerUrl && (
          <div className="mt-6">
            <button
              onClick={() => window.open(movie.trailerUrl, "_blank")}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl text-[12px] font-semibold text-white bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6] shadow-[0_0_24px_rgba(123,92,255,0.9)] hover:shadow-[0_0_34px_rgba(123,92,255,1)] hover:scale-[1.03] active:scale-100 transition-all"
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
    <section className="max-w-5xl mx-auto px-4 pb-10">
      <h2 className="text-center text-sm md:text-base font-semibold text-[#e5e7ff] mb-4 tracking-[0.16em]">
        LỊCH CHIẾU THEO RẠP
      </h2>

      {/* chọn ngày */}
      <div className="flex justify-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {Array.from({ length: DAYS }).map((_, idx) => {
          const d = getDateByOffset(idx);
          const isActive = d.value === selectedDate;
          return (
            <button
              key={d.value}
              onClick={() => setSelectedDate(d.value)}
              className={`px-3.5 py-2 rounded-2xl text-[10px] border transition-all ${
                isActive
                  ? "bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6] text-white border-transparent shadow-[0_0_14px_rgba(123,92,255,0.9)]"
                  : "bg-white/5 border-white/10 text-[#cbd5ff]/85 hover:bg-white/10"
              }`}
            >
              <div className="font-semibold">{d.label}</div>
              <div className="text-[9px] opacity-80">{d.display}</div>
            </button>
          );
        })}
      </div>

      {loadingShowtimes ? (
        <p className="text-center text-xs text-white/70">
          Đang tải lịch chiếu...
        </p>
      ) : showtimes.length === 0 ? (
        <p className="text-center text-xs text-white/60">
          Hiện chưa có lịch chiếu cho ngày này.
        </p>
      ) : (
        <div className="space-y-4">
          {showtimes.map((c) => (
            <div
              key={c.cinemaId}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm shadow-[0_12px_40px_rgba(0,0,0,0.9)]"
            >
              <p className="text-[12px] font-semibold text-white">
                {c.cinemaName}
              </p>
              <p className="text-[10px] text-white/60">{c.address}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                {c.showtimes.map((s) => {
                  const isActive = activeShowtime?.showtimeId === s.showtimeId;
                  return (
                    <button
                      key={s.showtimeId}
                      onClick={() => onSelectShowtime(c, s)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] border transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6] text-white border-transparent shadow-[0_0_12px_rgba(123,92,255,0.9)]"
                          : "bg-[#050018] border-[#7b5cff66] text-[#e5e7ff] hover:bg-[#7b5cff33] hover:shadow-[0_0_10px_rgba(123,92,255,0.7)]"
                      }`}
                    >
                      <span className="font-semibold mr-1">{s.startTime}</span>
                      <span className="text-[9px] opacity-80">
                        {s.format} • {s.room}
                      </span>
                      {/* <span className="ml-1 text-[#ffe700] font-semibold">
                        {s.price.toLocaleString()}đ
                      </span> */}
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
}) {
  return (
    <section className="max-w-6xl mx-auto px-4 pb-24 space-y-10">
      {/* CHỌN LOẠI VÉ */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <h3 className="text-center text-xl md:text-2xl font-extrabold tracking-[0.24em] mb-8 text-white">
          CHỌN LOẠI VÉ
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 text-[11px]">
          {ticketTypes.map((t) => (
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
        `}
            >
              {/* LOẠI VÉ */}
              <div className="text-[10px] text-white/50 mb-1 tracking-[0.1em] uppercase">
                Loại vé
              </div>

              <div className="text-[13px] font-semibold text-white">
                {t.label}
              </div>

              <div className="mt-1 text-[#ffe700] font-semibold text-[12px]">
                {t.price.toLocaleString()} VND
              </div>

              {/* Nút + - */}
              <div className="mt-3 flex items-center justify-center gap-2">
                <button
                  onClick={() => onChangeTicket(t.id, -1)}
                  className="
              w-6 h-6
              flex items-center justify-center
              rounded-md
              border border-white/35
              text-[11px] text-white/85
              hover:bg-white/15
              transition-all
            "
                >
                  −
                </button>

                <span className="min-w-[22px] text-center text-[11px] text-white">
                  {t.quantity}
                </span>

                <button
                  onClick={() => onChangeTicket(t.id, 1)}
                  className="
              w-6 h-6
              flex items-center justify-center
              rounded-md
              bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6]
              text-[11px] text-white
              shadow-[0_0_10px_rgba(123,92,255,0.8)]
              hover:shadow-[0_0_16px_rgba(123,92,255,1)]
              transition-all
            "
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CHỌN GHẾ */}
      <div>
        <h3 className="text-center text-lg font-extrabold tracking-[0.12em] mb-3">
          CHỌN GHẾ - {activeShowtime.room || "RẠP"}
        </h3>
        <p className="text-center text-[10px] text-white/60 mb-3">Màn hình</p>
        <div className="mx-auto mb-4 h-1 w-80 bg-gradient-to-r from-transparent via-white/80 to-transparent rounded-full" />

        <div className="flex flex-col items-center gap-1 text-[9px]">
          {layoutByRow.map(([row, seats]) => (
            <div key={row} className="flex items-center gap-1">
              <span className="w-4 text-right text-white/60">{row}</span>
              {seats.map((seat) => {
                const selected = isSelectedSeat(seat.seat_id);
                const booked = seat.status === "BOOKED";
                return (
                  <button
                    key={seat.seat_id}
                    onClick={() => onToggleSeat(seat)}
                    disabled={booked}
                    className={`w-6 h-6 rounded-[4px] text-[8px] flex items-center justify-center border transition-all ${
                      booked
                        ? "bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed"
                        : selected
                        ? "bg-[#ffe700] border-[#ffe700] text-black font-bold shadow-[0_0_10px_rgba(255,231,0,0.9)]"
                        : "bg-[#111827] border-[#374151] text-white/80 hover:bg-[#312e81]"
                    }`}
                  >
                    {seat.number}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap justify-center gap-4 text-[9px] text-white/60">
          <Legend color="bg-[#111827]" label="Ghế trống" />
          <Legend color="bg-[#ffe700]" label="Ghế đang chọn" />
          <Legend color="bg-gray-700" label="Ghế đã đặt" />
        </div>
      </div>

    {/* 🎬 CHỌN BẮP NƯỚC */}
<section className="max-w-5xl mx-auto px-4 pb-20">
  <h3 className="text-center text-xl md:text-2xl font-extrabold tracking-[0.24em] mb-8 text-white">
    CHỌN BẮP NƯỚC
  </h3>

  {snacks.length === 0 ? (
    <p className="text-center text-sm text-white/50">
      Hiện chưa có dữ liệu bắp nước (mock).
    </p>
  ) : (
    <div className="space-y-10">
      {Object.entries(
        snacks.reduce((acc, s) => {
          const cat = s.category || "KHÁC";
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(s);
          return acc;
        }, {})
      ).map(([category, items]) => (
        <div key={category} className="flex flex-col items-center">
          {/* Tiêu đề nhóm */}
          <h4 className="mb-4 text-[10px] md:text-xs font-semibold text-[#ffdf7b] tracking-[0.22em] uppercase text-center">
            {category}
          </h4>

          {/* Các item căn giữa */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {items.map((snack) => {
              const selected = selectedSnacks[snack.snack_id];
              const qty = selected?.quantity || 0;

              return (
                <div
                  key={snack.snack_id}
                  className={`
                    w-[140px] md:w-[160px]
                    flex flex-col items-center text-center
                    px-3 pt-3 pb-2
                    rounded-2xl
                    bg-[#0b0a26]/80
                    border border-white/10
                    shadow-[0_8px_20px_rgba(0,0,0,0.7)]
                    hover:bg-[#18163d]/95
                    hover:border-[#7b5cff]
                    hover:shadow-[0_0_20px_rgba(123,92,255,0.5)]
                    transition-all duration-300
                    ${
                      qty > 0
                        ? "ring-1 ring-[#ffe700] shadow-[0_0_26px_rgba(255,231,0,0.6)]"
                        : ""
                    }
                  `}
                >
                  {/* Ảnh */}
                  {snack.image_url && (
                    <div className="w-full h-20 flex items-center justify-center mb-2">
                      <img
                        src={snack.image_url}
                        alt={snack.name}
                        className="max-h-full max-w-full object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]"
                      />
                    </div>
                  )}

                  {/* Tên + giá */}
                  <p className="text-[9px] md:text-[10px] font-semibold text-white leading-snug line-clamp-2 min-h-[24px]">
                    {snack.name}
                  </p>
                  <p className="mt-1 text-[10px] md:text-[11px] font-semibold text-[#ffe700]">
                    {snack.price.toLocaleString()}đ
                  </p>

                  {/* Nút +/- */}
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <button
                      onClick={() => onChangeSnack(snack, -1)}
                      className="
                        w-6 h-6 flex items-center justify-center
                        rounded-md border border-white/35
                        text-[11px] text-white/85
                        hover:bg-white/15
                        transition-all
                      "
                    >
                      −
                    </button>

                    <span className="min-w-[22px] text-center text-[11px] text-white">
                      {qty}
                    </span>

                    <button
                      onClick={() => onChangeSnack(snack, 1)}
                      className="
                        w-6 h-6 flex items-center justify-center
                        rounded-md
                        bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6]
                        text-[11px] text-white
                        shadow-[0_0_10px_rgba(123,92,255,0.8)]
                        hover:shadow-[0_0_16px_rgba(123,92,255,1)]
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

function Legend({ color, label }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`w-4 h-3 rounded-[3px] border border-white/20 ${color}`}
      />
      <span>{label}</span>
    </div>
  );
}

/* ===== HELPERS ===== */

function getToday() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function getDateByOffset(offset) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  const value = d.toISOString().slice(0, 10);
  const weekday = d.toLocaleDateString("vi-VN", { weekday: "short" });
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  return {
    value,
    label: offset === 0 ? "HÔM NAY" : weekday.toUpperCase(),
    display: `${day}/${month}`,
  };
}

function formatTime(sec) {
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, "0");
  const s = (sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
