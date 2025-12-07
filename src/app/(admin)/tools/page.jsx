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

  // ====== PROMOTION TOOLS STATES ======
  const [promoCode, setPromoCode] = useState("");
  const [promotionId, setPromotionId] = useState("");
  const [promotionFilter, setPromotionFilter] = useState("valid"); // all | active | valid
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState(null);
  const [promoResult, setPromoResult] = useState(null);

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

      const data = await AdminToolsService.getSeatLockAvailability(
        showtimeId.trim()
      );
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
      setSeatLockResult(
        data || { message: "Đã release mọi lock cho showtime." }
      );
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

  const handleFillSamplePayload = () => {
    setPricePayloadText(
      `{
  "user_id": null,
  "showtime_id": "REPLACE_SHOWTIME_UUID",
  "seats": [
    { "showtime_seat_id": "REPLACE_SEAT_UUID_1", "ticket_type_id": "REPLACE_TICKET_TYPE_UUID_1" }
  ],
  "snacks": [],
  "promotion_code": null
}`
    );
  };

  // ========== HANDLERS – PROMOTION TOOLS ==========

  const resetPromotionState = () => {
    setPromoError(null);
    setPromoResult(null);
  };

  const handleGetPromotionByCode = async () => {
    if (!promoCode.trim()) {
      setPromoError("Vui lòng nhập promotion code.");
      setPromoResult(null);
      return;
    }
    try {
      setPromoLoading(true);
      resetPromotionState();
      const data = await AdminToolsService.getPromotionByCode(promoCode.trim());
      setPromoResult(data);
    } catch (err) {
      console.error("getPromotionByCode error:", err);
      setPromoError(
        err?.message || "Lỗi khi lấy promotion theo promotion code."
      );
    } finally {
      setPromoLoading(false);
    }
  };

  const handleGetPromotionById = async () => {
    if (!promotionId.trim()) {
      setPromoError("Vui lòng nhập promotionId.");
      setPromoResult(null);
      return;
    }
    try {
      setPromoLoading(true);
      resetPromotionState();
      const data = await AdminToolsService.getPromotionById(promotionId.trim());
      setPromoResult(data);
    } catch (err) {
      console.error("getPromotionById error:", err);
      setPromoError(err?.message || "Lỗi khi lấy promotion theo ID.");
    } finally {
      setPromoLoading(false);
    }
  };

  const handleListPromotions = async () => {
    try {
      setPromoLoading(true);
      resetPromotionState();
      let data;

      if (promotionFilter === "active") {
        data = await AdminToolsService.getActivePromotions();
      } else if (promotionFilter === "valid") {
        data = await AdminToolsService.getValidPromotions();
      } else {
        // all
        data = await AdminToolsService.getPromotions();
      }

      setPromoResult(data);
    } catch (err) {
      console.error("getPromotions error:", err);
      setPromoError(err?.message || "Lỗi khi lấy danh sách promotions.");
    } finally {
      setPromoLoading(false);
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

  // Helper lấy các key phổ biến cho preview giá (snake_case + camelCase)
  const pickPriceField = (obj, keys) => {
    for (const key of keys) {
      if (key in obj) return obj[key];
    }
    return undefined;
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
          Bộ công cụ hỗ trợ debug seat-lock, kiểm tra logic tính giá booking &
          promotions theo spec API v2.5. Chỉ dành cho admin / developer nội bộ.
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
              {seatLockLoading
                ? "Đang release..."
                : "Release mọi lock của showtime"}
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
                Gửi payload giống{" "}
                <code className="font-mono">/bookings/price-preview</code> để
                tính thử giá booking (vé + bắp nước + promotion) mà không tạo
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

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handlePreviewPrice}
                  disabled={priceLoading}
                  className="inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-[11px] font-semibold tracking-[0.16em] uppercase bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-400 text-black shadow-lg shadow-purple-500/40 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                >
                  {priceLoading ? "Đang tính giá..." : "Preview giá booking"}
                </button>
                <button
                  type="button"
                  onClick={handleFillSamplePayload}
                  className="inline-flex items-center justify-center rounded-2xl px-3 py-2.5 text-[10px] font-semibold tracking-[0.16em] uppercase border border-white/25 bg-white/5 text-white hover:bg-white/10 transition-all"
                >
                  Load ví dụ đơn giản
                </button>
              </div>

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
                  {/* Summary box – hỗ trợ både snake_case và camelCase */}
                  <div className="rounded-2xl border border-emerald-400/50 bg-emerald-400/10 px-4 py-3 text-xs text-emerald-50 mb-3 space-y-1">
                    {pickPriceField(priceResult, [
                      "total_price",
                      "totalPrice",
                      "finalAmount",
                    ]) !== undefined && (
                      <div>
                        Tổng tiền:{" "}
                        <span className="font-semibold">
                          {pickPriceField(priceResult, [
                            "total_price",
                            "totalPrice",
                            "finalAmount",
                          ])}
                        </span>
                      </div>
                    )}
                    {pickPriceField(priceResult, [
                      "base_price",
                      "basePrice",
                      "ticketTotal",
                    ]) !== undefined && (
                      <div>
                        Giá gốc:{" "}
                        <span className="font-semibold">
                          {pickPriceField(priceResult, [
                            "base_price",
                            "basePrice",
                            "ticketTotal",
                          ])}
                        </span>
                      </div>
                    )}
                    {pickPriceField(priceResult, [
                      "discount_total",
                      "discountTotal",
                      "discountAmount",
                    ]) !== undefined && (
                      <div>
                        Giảm giá:{" "}
                        <span className="font-semibold">
                          -
                          {pickPriceField(priceResult, [
                            "discount_total",
                            "discountTotal",
                            "discountAmount",
                          ])}
                        </span>
                      </div>
                    )}
                    {pickPriceField(priceResult, [
                      "snack_total",
                      "snackTotal",
                    ]) !== undefined && (
                      <div>
                        Bắp nước:{" "}
                        <span className="font-semibold">
                          {pickPriceField(priceResult, [
                            "snack_total",
                            "snackTotal",
                          ])}
                        </span>
                      </div>
                    )}
                    {"promotion" in priceResult &&
                      priceResult.promotion &&
                      (priceResult.promotion.code ||
                        priceResult.promotion.promotionCode) && (
                        <div>
                          Promotion:{" "}
                          <span className="font-semibold">
                            {priceResult.promotion.code ||
                              priceResult.promotion.promotionCode}
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

      {/* ====== SECTION: PROMOTION TOOLS ====== */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#140034]/90 via-[#050018] to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-cyan-500/20 pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-400" />

        <div className="relative p-5 md:p-7 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-sm md:text-base font-extrabold tracking-[0.2em] uppercase text-white/80">
                Promotion Tools
              </h2>
              <p className="mt-1 text-[11px] text-white/60 max-w-2xl">
                Dùng để nhanh chóng kiểm tra promotion theo code / ID hoặc xem
                danh sách promotions đang active / valid.
              </p>
            </div>
            <span className="inline-flex items-center rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-[10px] font-semibold tracking-[0.16em] uppercase text-emerald-100">
              Promotions Debug
            </span>
          </div>

          <div className="grid lg:grid-cols-[3fr,2fr] gap-5">
            {/* Form bên trái */}
            <div className="space-y-4">
              {/* By code / id */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                    Promotion Code
                  </label>
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="VD: SALE20"
                    className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40 focus:bg-white/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleGetPromotionByCode}
                    disabled={promoLoading}
                    className="mt-2 inline-flex items-center justify-center rounded-2xl px-3 py-2 text-[10px] font-semibold tracking-[0.16em] uppercase bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-400 text-black shadow-md shadow-emerald-500/40 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  >
                    {promoLoading ? "Đang lấy..." : "Lấy promotion theo code"}
                  </button>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                    Promotion ID
                  </label>
                  <input
                    type="text"
                    value={promotionId}
                    onChange={(e) => setPromotionId(e.target.value)}
                    placeholder="UUID của promotion..."
                    className="w-full rounded-2xl bg-white/5 border border-white/15 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40 focus:bg-white/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleGetPromotionById}
                    disabled={promoLoading}
                    className="mt-2 inline-flex items-center justify-center rounded-2xl px-3 py-2 text-[10px] font-semibold tracking-[0.16em] uppercase border border-emerald-300/70 bg-emerald-400/10 text-emerald-100 hover:bg-emerald-400/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  >
                    {promoLoading ? "Đang lấy..." : "Lấy promotion theo ID"}
                  </button>
                </div>
              </div>

              {/* List promotions */}
              <div className="mt-1 space-y-2">
                <label className="block text-[11px] font-semibold text-white/60 mb-2 uppercase tracking-[0.18em]">
                  Danh sách promotions
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={promotionFilter}
                    onChange={(e) => setPromotionFilter(e.target.value)}
                    className="rounded-full bg-white/5 border border-white/20 px-3 py-2 text-[11px] text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40 focus:bg-white/10 transition-all"
                  >
                    <option value="valid">
                      Chỉ valid (đang trong date range)
                    </option>
                    <option value="active">Chỉ active</option>
                    <option value="all">Tất cả</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleListPromotions}
                    disabled={promoLoading}
                    className="inline-flex items-center justify-center rounded-2xl px-4 py-2 text-[11px] font-semibold tracking-[0.16em] uppercase bg-gradient-to-r from-emerald-400 via-cyan-400 to-sky-400 text-black shadow-md shadow-emerald-500/40 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                  >
                    {promoLoading ? "Đang tải..." : "Lấy danh sách"}
                  </button>
                </div>
                <p className="text-[10px] text-white/45">
                  Dùng để xem nhanh các promotions đang hoạt động / hợp lệ với
                  hệ thống pricing hiện tại.
                </p>
              </div>

              {promoError && (
                <div className="mt-2 rounded-2xl border border-red-500/60 bg-red-500/10 px-4 py-3 text-xs text-red-100">
                  {promoError}
                </div>
              )}
            </div>

            {/* Result viewer bên phải */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-white/60 uppercase tracking-[0.18em]">
                  Kết quả / Promotions
                </span>
              </div>

              {promoResult ? (
                <>
                  {/* Nếu là array, show chút summary */}
                  {Array.isArray(promoResult) && (
                    <div className="mb-3 rounded-2xl border border-emerald-400/50 bg-emerald-400/10 px-4 py-3 text-xs text-emerald-50 space-y-1">
                      <div>
                        Số promotion:{` `}
                        <span className="font-semibold">
                          {promoResult.length}
                        </span>
                      </div>
                      {promoResult[0] && (
                        <div>
                          Ví dụ:{" "}
                          <span className="font-semibold">
                            {promoResult[0].code ||
                              promoResult[0].promotionCode ||
                              "(không có code)"}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {renderJson(promoResult)}
                </>
              ) : (
                <p className="text-[11px] text-white/45">
                  Chưa có dữ liệu. Tìm promotion theo code / ID hoặc lấy danh
                  sách theo filter ở bên trái để xem response.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
