import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("/src/api/fetchConfig.js", () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from "/src/api/fetchConfig.js";
import * as SUT from "../adminToolsService";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("adminToolsService", () => {
  /* ===================== SEAT LOCKS (TOOLS / DEBUG) ===================== */

  it("createSeatLock: POST /seat-locks (JSON body)", async () => {
    const payload = {
      showtimeId: "sh1",
      seats: [{ showtimeSeatId: "ss1", ticketTypeId: "tt1" }],
    };
    apiFetch.mockResolvedValueOnce({ data: { lockKey: "LK" } });

    const res = await SUT.createSeatLock(payload);

    expect(apiFetch).toHaveBeenCalledWith("/seat-locks", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    expect(res).toEqual({ lockKey: "LK" });
  });

  it("getSeatLockAvailability: GET /seat-locks/availability/showtime/{showtimeId}", async () => {
    apiFetch.mockResolvedValueOnce({ data: { showtimeId: "sh1", seats: [] } });

    const res = await SUT.getSeatLockAvailability("sh1");

    expect(apiFetch).toHaveBeenCalledWith(
      "/seat-locks/availability/showtime/sh1"
    );
    expect(res).toEqual({ showtimeId: "sh1", seats: [] });
  });

  it("releaseSeatLocks: DELETE /seat-locks/showtime/{showtimeId}", async () => {
    apiFetch.mockResolvedValueOnce({ data: { released: true } });

    const res = await SUT.releaseSeatLocks("sh1");

    expect(apiFetch).toHaveBeenCalledWith("/seat-locks/showtime/sh1", {
      method: "DELETE",
    });
    expect(res).toEqual({ released: true });
  });

  /* ===================== CHECKOUT PRICE PREVIEW (TOOLS) ===================== */

  it("previewBookingPrice: POST /bookings/price-preview (JSON body)", async () => {
    const payload = {
      showtimeId: "sh1",
      seats: [{ showtimeSeatId: "ss1", ticketTypeId: "tt1" }],
      snacks: [{ snackId: "sn1", quantity: 2 }],
      promotionCode: "SALE20",
    };
    apiFetch.mockResolvedValueOnce({ data: { total: 150000 } });

    const res = await SUT.previewBookingPrice(payload);

    expect(apiFetch).toHaveBeenCalledWith("/bookings/price-preview", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    expect(res).toEqual({ total: 150000 });
  });

  /* ===================== PROMOTIONS ===================== */

  it("createPromotion: POST /promotions (JSON body)", async () => {
    const payload = { code: "SALE20", discountType: "PERCENT", value: 20 };
    apiFetch.mockResolvedValueOnce({ data: { id: "p1" } });

    const res = await SUT.createPromotion(payload);

    expect(apiFetch).toHaveBeenCalledWith("/promotions", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    expect(res).toEqual({ id: "p1" });
  });

  it("updatePromotion: PUT /promotions/{id} (JSON body)", async () => {
    const payload = { value: 25 };
    apiFetch.mockResolvedValueOnce({ data: { id: "p1", value: 25 } });

    const res = await SUT.updatePromotion("p1", payload);

    expect(apiFetch).toHaveBeenCalledWith("/promotions/p1", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    expect(res).toEqual({ id: "p1", value: 25 });
  });

  it("deactivatePromotion: PATCH /promotions/{id}/deactivate", async () => {
    apiFetch.mockResolvedValueOnce({ data: { ok: true } });

    const res = await SUT.deactivatePromotion("p1");

    expect(apiFetch).toHaveBeenCalledWith("/promotions/p1/deactivate", {
      method: "PATCH",
    });
    expect(res).toEqual({ ok: true });
  });

  it("deletePromotion: DELETE /promotions/{id} returns true", async () => {
    apiFetch.mockResolvedValueOnce({ code: 200 });

    const res = await SUT.deletePromotion("p1");

    expect(apiFetch).toHaveBeenCalledWith("/promotions/p1", {
      method: "DELETE",
    });
    expect(res).toBe(true);
  });

  it("getPromotionById: GET /promotions/{id}", async () => {
    apiFetch.mockResolvedValueOnce({ data: { id: "p1" } });

    const res = await SUT.getPromotionById("p1");

    expect(apiFetch).toHaveBeenCalledWith("/promotions/p1");
    expect(res).toEqual({ id: "p1" });
  });

  it("getPromotionByCode: GET /promotions/code/{code}", async () => {
    apiFetch.mockResolvedValueOnce({ data: { id: "pX", code: "SALE20" } });

    const res = await SUT.getPromotionByCode("SALE20");

    expect(apiFetch).toHaveBeenCalledWith("/promotions/code/SALE20");
    expect(res).toEqual({ id: "pX", code: "SALE20" });
  });

  it("getPromotions: GET /promotions (no filter) => no query", async () => {
    apiFetch.mockResolvedValueOnce({ data: [{ id: "p1" }] });

    const res = await SUT.getPromotions();

    expect(apiFetch).toHaveBeenCalledWith("/promotions");
    expect(res).toEqual([{ id: "p1" }]);
  });

  it("getPromotions: GET /promotions?filter=active", async () => {
    apiFetch.mockResolvedValueOnce({ data: [{ id: "pActive" }] });

    const res = await SUT.getPromotions("active");

    expect(apiFetch).toHaveBeenCalledWith("/promotions?filter=active");
    expect(res).toEqual([{ id: "pActive" }]);
  });

  it("getPromotions: filter='' => no query", async () => {
    apiFetch.mockResolvedValueOnce({ data: [] });

    await SUT.getPromotions("");

    expect(apiFetch).toHaveBeenCalledWith("/promotions");
  });

  it("getActivePromotions: GET /promotions/active", async () => {
    apiFetch.mockResolvedValueOnce({ data: [{ id: "p1" }] });

    const res = await SUT.getActivePromotions();

    expect(apiFetch).toHaveBeenCalledWith("/promotions/active");
    expect(res).toEqual([{ id: "p1" }]);
  });

  it("getValidPromotions: GET /promotions/valid", async () => {
    apiFetch.mockResolvedValueOnce({ data: [{ id: "p1" }] });

    const res = await SUT.getValidPromotions();

    expect(apiFetch).toHaveBeenCalledWith("/promotions/valid");
    expect(res).toEqual([{ id: "p1" }]);
  });

  it("return rule: nếu apiFetch trả trực tiếp object/array không có data thì trả nguyên", async () => {
    apiFetch.mockResolvedValueOnce([{ id: "pRaw" }]);

    const res = await SUT.getValidPromotions();

    expect(res).toEqual([{ id: "pRaw" }]);
  });
});
