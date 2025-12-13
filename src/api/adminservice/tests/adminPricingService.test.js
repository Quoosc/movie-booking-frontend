import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("/src/api/fetchConfig.js", () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from "/src/api/fetchConfig.js";
import * as SUT from "../adminPricingService";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("adminPricingService", () => {
  /* ===================== PRICE BASE ===================== */

  it("createPriceBase: POST /price-base", async () => {
    const payload = { price: 79000, isActive: true };
    apiFetch.mockResolvedValueOnce({ data: { id: "pb1" } });

    const res = await SUT.createPriceBase(payload);

    expect(apiFetch).toHaveBeenCalledWith("/price-base", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    expect(res).toEqual({ id: "pb1" });
  });

  it("updatePriceBase: PUT /price-base/{id}", async () => {
    const payload = { price: 89000 };
    apiFetch.mockResolvedValueOnce({ data: { id: "pb1", price: 89000 } });

    const res = await SUT.updatePriceBase("pb1", payload);

    expect(apiFetch).toHaveBeenCalledWith("/price-base/pb1", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    expect(res).toEqual({ id: "pb1", price: 89000 });
  });

  it("deletePriceBase: DELETE /price-base/{id} returns true", async () => {
    apiFetch.mockResolvedValueOnce({ code: 200 });

    const res = await SUT.deletePriceBase("pb1");

    expect(apiFetch).toHaveBeenCalledWith("/price-base/pb1", {
      method: "DELETE",
    });
    expect(res).toBe(true);
  });

  it("getPriceBaseById: GET /price-base/{id}", async () => {
    apiFetch.mockResolvedValueOnce({ data: { id: "pb1" } });

    const res = await SUT.getPriceBaseById("pb1");

    expect(apiFetch).toHaveBeenCalledWith("/price-base/pb1");
    expect(res).toEqual({ id: "pb1" });
  });

  it("getPriceBases: GET /price-base", async () => {
    apiFetch.mockResolvedValueOnce({ data: [{ id: "pb1" }] });

    const res = await SUT.getPriceBases();

    expect(apiFetch).toHaveBeenCalledWith("/price-base");
    expect(res).toEqual([{ id: "pb1" }]);
  });

  it("getActivePriceBase: GET /price-base/active", async () => {
    apiFetch.mockResolvedValueOnce({ data: { id: "pb_active" } });

    const res = await SUT.getActivePriceBase();

    expect(apiFetch).toHaveBeenCalledWith("/price-base/active");
    expect(res).toEqual({ id: "pb_active" });
  });

  /* ===================== PRICE MODIFIERS ===================== */

  it("createPriceModifier: POST /price-modifiers", async () => {
    const payload = { name: "Weekend", modifierType: "PERCENTAGE", value: 10 };
    apiFetch.mockResolvedValueOnce({ data: { id: "pm1" } });

    const res = await SUT.createPriceModifier(payload);

    expect(apiFetch).toHaveBeenCalledWith("/price-modifiers", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    expect(res).toEqual({ id: "pm1" });
  });

  it("updatePriceModifier: PUT /price-modifiers/{id}", async () => {
    const payload = { value: 15 };
    apiFetch.mockResolvedValueOnce({ data: { id: "pm1", value: 15 } });

    const res = await SUT.updatePriceModifier("pm1", payload);

    expect(apiFetch).toHaveBeenCalledWith("/price-modifiers/pm1", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    expect(res).toEqual({ id: "pm1", value: 15 });
  });

  it("deletePriceModifier: DELETE /price-modifiers/{id} returns true", async () => {
    apiFetch.mockResolvedValueOnce({ code: 200 });

    const res = await SUT.deletePriceModifier("pm1");

    expect(apiFetch).toHaveBeenCalledWith("/price-modifiers/pm1", {
      method: "DELETE",
    });
    expect(res).toBe(true);
  });

  it("getPriceModifierById: GET /price-modifiers/{id}", async () => {
    apiFetch.mockResolvedValueOnce({ data: { id: "pm1" } });

    const res = await SUT.getPriceModifierById("pm1");

    expect(apiFetch).toHaveBeenCalledWith("/price-modifiers/pm1");
    expect(res).toEqual({ id: "pm1" });
  });

  it("getPriceModifiers: GET /price-modifiers", async () => {
    apiFetch.mockResolvedValueOnce({ data: [{ id: "pm1" }] });

    const res = await SUT.getPriceModifiers();

    expect(apiFetch).toHaveBeenCalledWith("/price-modifiers");
    expect(res).toEqual([{ id: "pm1" }]);
  });

  it("getActivePriceModifiers: GET /price-modifiers/active", async () => {
    apiFetch.mockResolvedValueOnce({ data: [{ id: "pm_active" }] });

    const res = await SUT.getActivePriceModifiers();

    expect(apiFetch).toHaveBeenCalledWith("/price-modifiers/active");
    expect(res).toEqual([{ id: "pm_active" }]);
  });

  it("getPriceModifiersByCondition: GET /price-modifiers/by-condition?conditionType=...", async () => {
    apiFetch.mockResolvedValueOnce({ data: [{ id: "pm1" }] });

    const res = await SUT.getPriceModifiersByCondition("DAY_OF_WEEK");

    expect(apiFetch).toHaveBeenCalledWith(
      "/price-modifiers/by-condition?conditionType=DAY_OF_WEEK"
    );
    expect(res).toEqual([{ id: "pm1" }]);
  });

  it("getPriceModifiersByCondition: bỏ query nếu conditionType rỗng", async () => {
    apiFetch.mockResolvedValueOnce({ data: [] });

    await SUT.getPriceModifiersByCondition("");

    expect(apiFetch).toHaveBeenCalledWith("/price-modifiers/by-condition");
  });

  /* ===================== TICKET TYPES ===================== */

  it("getPublicTicketTypes: GET /ticket-types?showtimeId=...&userId=...", async () => {
    apiFetch.mockResolvedValueOnce({ data: [{ id: "tt1" }] });

    const res = await SUT.getPublicTicketTypes("sh1", "u1");

    expect(apiFetch).toHaveBeenCalledWith(
      "/ticket-types?showtimeId=sh1&userId=u1"
    );
    expect(res).toEqual([{ id: "tt1" }]);
  });

  it("getPublicTicketTypes: chỉ có showtimeId thì query chỉ gồm showtimeId", async () => {
    apiFetch.mockResolvedValueOnce({ data: [{ id: "tt1" }] });

    const res = await SUT.getPublicTicketTypes("sh1");

    expect(apiFetch).toHaveBeenCalledWith("/ticket-types?showtimeId=sh1");
    expect(res).toEqual([{ id: "tt1" }]);
  });

  it("getAdminTicketTypes: GET /ticket-types/admin", async () => {
    apiFetch.mockResolvedValueOnce({ data: [{ id: "tt_admin" }] });

    const res = await SUT.getAdminTicketTypes();

    expect(apiFetch).toHaveBeenCalledWith("/ticket-types/admin");
    expect(res).toEqual([{ id: "tt_admin" }]);
  });

  it("createTicketType: POST /ticket-types", async () => {
    const payload = { code: "adult", label: "NGƯỜI LỚN" };
    apiFetch.mockResolvedValueOnce({ data: { id: "tt1" } });

    const res = await SUT.createTicketType(payload);

    expect(apiFetch).toHaveBeenCalledWith("/ticket-types", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    expect(res).toEqual({ id: "tt1" });
  });

  it("updateTicketType: PUT /ticket-types/{id}", async () => {
    const payload = { label: "Updated" };
    apiFetch.mockResolvedValueOnce({ data: { id: "tt1", label: "Updated" } });

    const res = await SUT.updateTicketType("tt1", payload);

    expect(apiFetch).toHaveBeenCalledWith("/ticket-types/tt1", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    expect(res).toEqual({ id: "tt1", label: "Updated" });
  });

  it("deleteTicketType: DELETE /ticket-types/{id} returns true", async () => {
    apiFetch.mockResolvedValueOnce({ code: 200 });

    const res = await SUT.deleteTicketType("tt1");

    expect(apiFetch).toHaveBeenCalledWith("/ticket-types/tt1", {
      method: "DELETE",
    });
    expect(res).toBe(true);
  });

  /* ========== SHOWTIME TICKET TYPES ========== */

  it("getShowtimeTicketTypes: GET /showtimes/{id}/ticket-types (res?.data ?? res)", async () => {
    apiFetch.mockResolvedValueOnce({ data: { showtimeId: "sh1", assignedTicketTypeIds: ["tt1"] } });

    const res = await SUT.getShowtimeTicketTypes("sh1");

    expect(apiFetch).toHaveBeenCalledWith("/showtimes/sh1/ticket-types");
    expect(res).toEqual({ showtimeId: "sh1", assignedTicketTypeIds: ["tt1"] });
  });

  it("getShowtimeTicketTypes: nếu apiFetch trả thẳng object (không có data) thì trả nguyên", async () => {
    apiFetch.mockResolvedValueOnce({ showtimeId: "sh1", assignedTicketTypeIds: [] });

    const res = await SUT.getShowtimeTicketTypes("sh1");

    expect(res).toEqual({ showtimeId: "sh1", assignedTicketTypeIds: [] });
  });

  it("replaceShowtimeTicketTypes: PUT /showtimes/{id}/ticket-types body { ticketTypeIds } returns true", async () => {
    apiFetch.mockResolvedValueOnce({ code: 200 });

    const res = await SUT.replaceShowtimeTicketTypes("sh1", ["tt1", "tt2"]);

    expect(apiFetch).toHaveBeenCalledWith("/showtimes/sh1/ticket-types", {
      method: "PUT",
      body: JSON.stringify({ ticketTypeIds: ["tt1", "tt2"] }),
    });
    expect(res).toBe(true);
  });

  it("addShowtimeTicketTypes: POST /showtimes/{id}/ticket-types body { ticketTypeIds } returns true", async () => {
    apiFetch.mockResolvedValueOnce({ code: 200 });

    const res = await SUT.addShowtimeTicketTypes("sh1", ["tt3"]);

    expect(apiFetch).toHaveBeenCalledWith("/showtimes/sh1/ticket-types", {
      method: "POST",
      body: JSON.stringify({ ticketTypeIds: ["tt3"] }),
    });
    expect(res).toBe(true);
  });

  it("addShowtimeTicketType: POST /showtimes/{id}/ticket-types/{ticketTypeId} returns true", async () => {
    apiFetch.mockResolvedValueOnce({ code: 200 });

    const res = await SUT.addShowtimeTicketType("sh1", "tt1");

    expect(apiFetch).toHaveBeenCalledWith(
      "/showtimes/sh1/ticket-types/tt1",
      { method: "POST" }
    );
    expect(res).toBe(true);
  });

  it("removeShowtimeTicketType: DELETE /showtimes/{id}/ticket-types/{ticketTypeId} returns true", async () => {
    apiFetch.mockResolvedValueOnce({ code: 200 });

    const res = await SUT.removeShowtimeTicketType("sh1", "tt1");

    expect(apiFetch).toHaveBeenCalledWith(
      "/showtimes/sh1/ticket-types/tt1",
      { method: "DELETE" }
    );
    expect(res).toBe(true);
  });

  /* ===================== SHOWTIME SEATS ===================== */

  it("getShowtimeSeatById: GET /showtime-seats/{id}", async () => {
    apiFetch.mockResolvedValueOnce({ data: { id: "ss1" } });

    const res = await SUT.getShowtimeSeatById("ss1");

    expect(apiFetch).toHaveBeenCalledWith("/showtime-seats/ss1");
    expect(res).toEqual({ id: "ss1" });
  });

  it("getShowtimeSeats: GET /showtime-seats/showtime/{showtimeId}", async () => {
    apiFetch.mockResolvedValueOnce({ data: [{ id: "ss1" }] });

    const res = await SUT.getShowtimeSeats("sh1");

    expect(apiFetch).toHaveBeenCalledWith("/showtime-seats/showtime/sh1");
    expect(res).toEqual([{ id: "ss1" }]);
  });

  it("getAvailableShowtimeSeats: GET /showtime-seats/showtime/{showtimeId}/available", async () => {
    apiFetch.mockResolvedValueOnce({ data: [{ id: "ss1" }] });

    const res = await SUT.getAvailableShowtimeSeats("sh1");

    expect(apiFetch).toHaveBeenCalledWith(
      "/showtime-seats/showtime/sh1/available"
    );
    expect(res).toEqual([{ id: "ss1" }]);
  });

  it("updateShowtimeSeat: PUT /showtime-seats/{id} (JSON body)", async () => {
    const payload = { status: "AVAILABLE", price: 99000 };
    apiFetch.mockResolvedValueOnce({ data: { id: "ss1", price: 99000 } });

    const res = await SUT.updateShowtimeSeat("ss1", payload);

    expect(apiFetch).toHaveBeenCalledWith("/showtime-seats/ss1", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    expect(res).toEqual({ id: "ss1", price: 99000 });
  });

  it("resetShowtimeSeat: PUT /showtime-seats/{id}/reset", async () => {
    apiFetch.mockResolvedValueOnce({ data: { id: "ss1", status: "AVAILABLE" } });

    const res = await SUT.resetShowtimeSeat("ss1");

    expect(apiFetch).toHaveBeenCalledWith("/showtime-seats/ss1/reset", {
      method: "PUT",
    });
    expect(res).toEqual({ id: "ss1", status: "AVAILABLE" });
  });

  it("recalculateShowtimeSeatPrices: POST /showtime-seats/showtime/{id}/recalculate-prices", async () => {
    apiFetch.mockResolvedValueOnce({ data: { updated: 120 } });

    const res = await SUT.recalculateShowtimeSeatPrices("sh1");

    expect(apiFetch).toHaveBeenCalledWith(
      "/showtime-seats/showtime/sh1/recalculate-prices",
      { method: "POST" }
    );
    expect(res).toEqual({ updated: 120 });
  });

  it("return rule: nếu apiFetch trả trực tiếp array/object không có data thì trả nguyên", async () => {
    apiFetch.mockResolvedValueOnce([{ id: "pbX" }]);

    const res = await SUT.getPriceBases();

    expect(res).toEqual([{ id: "pbX" }]);
  });
});
