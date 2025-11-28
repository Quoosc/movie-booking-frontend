// src/app/(admin)/tools/page.jsx
import { useState } from "react";
import { AdminToolsService } from "@/api/adminservice";

export default function AdminToolsPage() {
  // ====== SEAT LOCK STATES ======
  const [showtimeId, setShowtimeId] = useState("");
  const [lockSeatIds, setLockSeatIds] = useState(""); // CSV showtimeSeatId1,showtimeSeatId2
  const [lockTicketTypeId, setLockTicketTypeId] = useState("");
  const [seatLockLoading, setSeatLockLoading] = useState(false);
  const [seatLockResult, setSeatLockResult] = useState(null);
  const [seatLockError, setSeatLockError] = useState(null);

  // ====== PRICE PREVIEW STATES ======
  const [pricePayloadText, setPricePayloadText] = useState(
    `{
  "user_id": null,
  "showtime_id": "SHOWTIME_UUID",
  "seats": [
    { "showtime_seat_id": "SEAT_UUID_1", "ticket_type_id": "TICKET_TYPE_UUID_1" },
    { "showtime_seat_id": "SEAT_UUID_2", "ticket_type_id": "TICKET_TYPE_UUID_1" }
  ],
  "snacks": [
    { "snack_id": "SNACK_UUID_1", "quantity": 1 }
  ],
  "promotion_code": "SALE20"
}`
  );
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceResult, setPriceResult] = useState(null);
  const [priceError, setPriceError] = useState(null);

  // ========== HANDLERS – SEAT LOCK TOOLS ==========

  const handleViewAvailability = async () => {
    if (!showtimeId.trim()) {
      setSeatLockError("Vui lòng nhập Showtime ID trước.");
      setSeatLockResult(null);
      return;
    }
    try {
      setSeatLockLoading(true);
      setSeatLockError(null);
      setSeatLockResult(null);

      const data = await AdminToolsService.getSeatLockAvailability(showtimeId);
      setSeatLockResult(data);
    } catch (err) {
      console.error("getSeatLockAvailability error:", err);
      setSeatLockError(err?.message || "Lỗi khi xem trạng thái seat-lock.");
    } finally {
      setSeatLockLoading(false);
    }
  };

  const handleCreateSeatLock = async () => {
    if (!showtimeId.trim()) {
      setSeatLockError("Vui lòng nhập Showtime ID trước.");
      setSeatLockResult(null);
      return;
    }
    if (!lockSeatIds.trim() || !lockTicketTypeId.trim()) {
      setSeatLockError(
        "Vui lòng nhập danh sách showtimeSeatId và ticketTypeId."
      );
      setSeatLockResult(null);
      return;
    }

    const ids = lockSeatIds
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!ids.length) {
      setSeatLockError("Danh sách showtimeSeatId không hợp lệ.");
      setSeatLockResult(null);
      return;
    }

    const payload = {
      showtimeId: showtimeId.trim(),
      seats: ids.map((id) => ({
        showtimeSeatId: id,
        ticketTypeId: lockTicketTypeId.trim(),
      })),
    };

    try {
      setSeatLockLoading(true);
      setSeatLockError(null);
      setSeatLockResult(null);

      const data = await AdminToolsService.createSeatLock(payload);
      setSeatLockResult(data);
    } catch (err) {
      console.error("createSeatLock error:", err);
      setSeatLockError(err?.message || "Lỗi khi tạo seat-lock.");
    } finally {
      setSeatLockLoading(false);
    }
  };

  const handleReleaseSeatLocks = async () => {
    if (!showtimeId.trim()) {
      setSeatLockError("Vui lòng nhập Showtime ID trước.");
      setSeatLockResult(null);
      return;
    }

    try {
      setSeatLockLoading(true);
      setSeatLockError(null);
      setSeatLockResult(null);

      const data = await AdminToolsService.releaseSeatLocks(showtimeId.trim());
      setSeatLockResult(data || { message: "Đã release mọi lock cho showtime." });
    } catch (err) {
      console.error("releaseSeatLocks error:", err);
      setSeatLockError(err?.message || "Lỗi khi release seat-lock.");
    } finally {
      setSeatLockLoading(false);
    }
  };

  // ========== HANDLERS – PRICE PREVIEW TOOL ==========

  const handlePreviewPrice = async () => {
    try {
      setPriceLoading(true);
      setPriceError(null);
      setPriceResult(null);

      let payload;
      try {
        payload = JSON.parse(pricePayloadText);
      } catch (parseErr) {
        setPriceError("Payload JSON không hợp lệ, vui lòng kiểm tra lại.");
        setPriceLoading(false);
        return;
      }

      const data = await AdminToolsService.previewBookingPrice(payload);
      setPriceResult(data);
    } catch (err) {
      console.error("previewBookingPrice error:", err);
      setPriceError(err?.message || "Lỗi khi preview giá booking.");
    } finally {
      setPriceLoading(false);
    }
  };

  // ========== RENDER HELPERS ==========

  const renderJson = (obj) => {
    if (!obj) return null;
    return (
      <pre className="mt-3 max-h-72 overflow-auto rounded-2xl bg-black/60 border border-white/10 px-4 py-3 text-xs text-emerald-100 font-mono whitespace-pre-wrap">
        {JSON.stringify(obj, null, 2)}
      </pre>
    );
  };

  return (
    <div className="space-y-8 lg:space-y-10">
      {/* Header */}
      <header className="space-y-3">
        <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-cyan-400/70">
          ADMIN • TOOLS
        </p>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-[0.16em] uppercase">
          <span className="bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Dev tools & Seat Locks
          </span>
        </h1>
        <p className="text-xs md:text-sm text-white/60 max-w-3xl">
          Bộ công cụ hỗ trợ debug seat-lock và kiểm tra logic tính giá booking
          theo spec API v2.4. Chỉ dành cho admin / developer nội bộ.
        </p>
      </header>

      {/* ====== SECTION: SEAT LOCK TOOLS ====== */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a0033]/90 via-[#0b001f] to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-transparent to-cyan-500/20 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400" />

        <div className="relative p-5 md:p-7 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-sm md:text-base font-extrabold tracking-[0.2em] uppercase text-white/80">
                Seat Lock Tools
              </h2>
              <p className="mt-1 text-[11px] text-white/60 max-w-xl">
                Tạo / xem / giải phóng seat-lock cho 1 showtime. Hữu ích khi
                kiểm thử luồng lock ghế trước checkout.
              </p>
            </div>
            <span className="inline-flex items-center rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 text-[10px] font-semibold tracking-[0.16em] uppercase text-cyan-100">
              Debug only
            </span>
          </div>

          {/* Inputs */}
          <div className="grid md:grid-cols-[2fr,2fr,2fr] gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                Showtime ID
              </label>
              <input
                type="text"
                value={showtimeId}
                onChange={(e) => setShowtimeId(e.target.value)}
                placeholder="Nhập showtime UUID..."
                className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                showtimeSeatIds (CSV)
              </label>
              <input
                type="text"
                value={lockSeatIds}
                onChange={(e) => setLockSeatIds(e.target.value)}
                placeholder="SEAT_ID_1,SEAT_ID_2,…"
                className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
              />
              <p className="mt-1 text-[10px] text-white/45">
                Dùng khi muốn <span className="font-semibold">tạo lock</span>{" "}
                nhanh cho vài ghế cụ thể.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                ticketTypeId (áp cho mọi ghế)
              </label>
              <input
                type="text"
                value={lockTicketTypeId}
                onChange={(e) => setLockTicketTypeId(e.target.value)}
                placeholder="TICKET_TYPE_UUID..."
                className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={handleViewAvailability}
              disabled={seatLockLoading}
              className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-[11px] font-semibold tracking-[0.16em] uppercase bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-400 text-black shadow-lg shadow-purple-500/40 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {seatLockLoading ? "Đang xử lý..." : "Xem availability + locks"}
            </button>

            <button
              type="button"
              onClick={handleCreateSeatLock}
              disabled={seatLockLoading}
              className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-[11px] font-semibold tracking-[0.16em] uppercase border border-emerald-400/60 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {seatLockLoading ? "Đang lock..." : "Tạo seat-lock cho ghế"}
            </button>

            <button
              type="button"
              onClick={handleReleaseSeatLocks}
              disabled={seatLockLoading}
              className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-[11px] font-semibold tracking-[0.16em] uppercase border border-red-500/60 bg-red-500/10 text-red-100 hover:bg-red-500/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >
              {seatLockLoading ? "Đang release..." : "Release mọi lock của showtime"}
            </button>
          </div>

          {/* Messages + Result */}
          {seatLockError && (
            <div className="mt-3 rounded-2xl border border-red-500/60 bg-red-500/10 px-4 py-3 text-xs text-red-100">
              {seatLockError}
            </div>
          )}
          {seatLockResult && (
            <>
              <div className="mt-3 text-[11px] text-emerald-200 uppercase tracking-[0.14em] font-semibold">
                Kết quả / Response
              </div>
              {renderJson(seatLockResult)}
            </>
          )}
        </div>
      </section>

      {/* ====== SECTION: PRICE PREVIEW TOOL ====== */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#160033]/90 via-[#090019] to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600/20 via-transparent to-emerald-500/20 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400" />

        <div className="relative p-5 md:p-7 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-sm md:text-base font-extrabold tracking-[0.2em] uppercase text-white/80">
                Checkout Price Preview
              </h2>
              <p className="mt-1 text-[11px] text-white/60 max-w-2xl">
                Gửi payload giống <code className="font-mono">/bookings/price-preview</code>{" "}
                để tính thử giá booking (vé + bắp nước + promotion) mà không tạo
                booking thật.
              </p>
            </div>
            <span className="inline-flex items-center rounded-full border border-purple-400/40 bg-purple-400/10 px-3 py-1 text-[10px] font-semibold tracking-[0.16em] uppercase text-purple-100">
              Pricing Debug
            </span>
          </div>

          <div className="grid lg:grid-cols-[3fr,2fr] gap-5">
            {/* Payload editor */}
            <div>
              <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                Payload JSON
              </label>
              <textarea
                value={pricePayloadText}
                onChange={(e) => setPricePayloadText(e.target.value)}
                rows={14}
                className="w-full rounded-2xl bg-black/60 border border-white/15 px-4 py-3 text-xs text-white font-mono placeholder-white/30 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-black/80 transition-all"
                spellCheck={false}
              />
              <p className="mt-2 text-[10px] text-white/50">
                Gợi ý: copy payload thực từ FE checkout rồi chỉnh sửa showtime /
                seats / promotion_code để test nhanh.
              </p>

              <button
                type="button"
                onClick={handlePreviewPrice}
                disabled={priceLoading}
                className="mt-3 inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-[11px] font-semibold tracking-[0.16em] uppercase bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-400 text-black shadow-lg shadow-purple-500/40 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {priceLoading ? "Đang tính giá..." : "Preview giá booking"}
              </button>

              {priceError && (
                <div className="mt-3 rounded-2xl border border-red-500/60 bg-red-500/10 px-4 py-3 text-xs text-red-100">
                  {priceError}
                </div>
              )}
            </div>

            {/* Result viewer */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-white/60 uppercase tracking-[0.18em]">
                  Kết quả / Breakdown
                </span>
              </div>

              {priceResult ? (
                <>
                  {/* Nếu BE có fields tổng quát, show nhẹ lên trên */}
                  <div className="rounded-2xl border border-emerald-400/50 bg-emerald-400/10 px-4 py-3 text-xs text-emerald-50 mb-3 space-y-1">
                    {"total_price" in priceResult && (
                      <div>
                        Tổng tiền:{" "}
                        <span className="font-semibold">
                          {priceResult.total_price}
                        </span>
                      </div>
                    )}
                    {"base_price" in priceResult && (
                      <div>
                        Giá gốc:{" "}
                          <span className="font-semibold">
                            {priceResult.base_price}
                          </span>
                      </div>
                    )}
                    {"discount_total" in priceResult && (
                      <div>
                        Giảm giá:{" "}
                        <span className="font-semibold">
                          -{priceResult.discount_total}
                        </span>
                      </div>
                    )}
                    {"snack_total" in priceResult && (
                      <div>
                        Bắp nước:{" "}
                        <span className="font-semibold">
                          {priceResult.snack_total}
                        </span>
                      </div>
                    )}
                    {"promotion" in priceResult && priceResult.promotion && (
                      <div>
                        Promotion:{" "}
                        <span className="font-semibold">
                          {priceResult.promotion.code}
                        </span>
                      </div>
                    )}
                  </div>

                  {renderJson(priceResult)}
                </>
              ) : (
                <p className="text-[11px] text-white/45">
                  Chưa có dữ liệu. Gửi một payload ở bên trái để xem kết quả
                  preview giá.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
