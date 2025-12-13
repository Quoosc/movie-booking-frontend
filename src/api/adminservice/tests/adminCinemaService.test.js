import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("/src/api/fetchConfig.js", () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from "/src/api/fetchConfig.js";
import * as SUT from "../adminCinemaService.js";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("adminCinemaService", () => {
  /* ===================== CINEMAS ===================== */

  it("getCinemas: GET /cinemas", async () => {
    apiFetch.mockResolvedValueOnce({ data: [{ id: "c1" }] });

    const res = await SUT.getCinemas();

    expect(apiFetch).toHaveBeenCalledWith("/cinemas");
    expect(res).toEqual([{ id: "c1" }]);
  });

  it("getCinemaById: GET /cinemas/{id}", async () => {
    apiFetch.mockResolvedValueOnce({ data: { id: "c1" } });

    const res = await SUT.getCinemaById("c1");

    expect(apiFetch).toHaveBeenCalledWith("/cinemas/c1");
    expect(res).toEqual({ id: "c1" });
  });

  it("createCinema: POST /cinemas (JSON body)", async () => {
    const payload = { name: "CV HCM", address: "Q1" };
    apiFetch.mockResolvedValueOnce({ data: { id: "c2" } });

    const res = await SUT.createCinema(payload);

    expect(apiFetch).toHaveBeenCalledWith("/cinemas", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    expect(res).toEqual({ id: "c2" });
  });

  it("updateCinema: PUT /cinemas/{id} (JSON body)", async () => {
    const payload = { name: "Updated" };
    apiFetch.mockResolvedValueOnce({ data: { id: "c1", name: "Updated" } });

    const res = await SUT.updateCinema("c1", payload);

    expect(apiFetch).toHaveBeenCalledWith("/cinemas/c1", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    expect(res).toEqual({ id: "c1", name: "Updated" });
  });

  it("deleteCinema: DELETE /cinemas/{id} returns true", async () => {
    apiFetch.mockResolvedValueOnce({ code: 200 });

    const res = await SUT.deleteCinema("c1");

    expect(apiFetch).toHaveBeenCalledWith("/cinemas/c1", { method: "DELETE" });
    expect(res).toBe(true);
  });

  it("getMoviesByCinema: GET /cinemas/{id}/movies?status=SHOWING", async () => {
    apiFetch.mockResolvedValueOnce({ data: [{ id: "m1" }] });

    const res = await SUT.getMoviesByCinema("c1", "SHOWING");

    expect(apiFetch).toHaveBeenCalledWith("/cinemas/c1/movies?status=SHOWING");
    expect(res).toEqual([{ id: "m1" }]);
  });

  it("getMoviesByCinema: bỏ query nếu status undefined/null/''", async () => {
    apiFetch.mockResolvedValueOnce({ data: [] });

    await SUT.getMoviesByCinema("c1", "");

    expect(apiFetch).toHaveBeenCalledWith("/cinemas/c1/movies");
  });

  /* ===================== ROOMS ===================== */

  it("getRooms: GET /cinemas/rooms", async () => {
    apiFetch.mockResolvedValueOnce({ data: [{ id: "r1" }] });

    const res = await SUT.getRooms();

    expect(apiFetch).toHaveBeenCalledWith("/cinemas/rooms");
    expect(res).toEqual([{ id: "r1" }]);
  });

  it("getRoomById: GET /cinemas/rooms/{id}", async () => {
    apiFetch.mockResolvedValueOnce({ data: { id: "r1" } });

    const res = await SUT.getRoomById("r1");

    expect(apiFetch).toHaveBeenCalledWith("/cinemas/rooms/r1");
    expect(res).toEqual({ id: "r1" });
  });

  it("createRoom: POST /cinemas/rooms (JSON body)", async () => {
    const payload = { cinemaId: "c1", name: "Room 1" };
    apiFetch.mockResolvedValueOnce({ data: { id: "r2" } });

    const res = await SUT.createRoom(payload);

    expect(apiFetch).toHaveBeenCalledWith("/cinemas/rooms", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    expect(res).toEqual({ id: "r2" });
  });

  it("updateRoom: PUT /cinemas/rooms/{id} (JSON body)", async () => {
    const payload = { name: "Room Updated" };
    apiFetch.mockResolvedValueOnce({ data: { id: "r1" } });

    const res = await SUT.updateRoom("r1", payload);

    expect(apiFetch).toHaveBeenCalledWith("/cinemas/rooms/r1", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    expect(res).toEqual({ id: "r1" });
  });

  it("deleteRoom: DELETE /cinemas/rooms/{id} returns true", async () => {
    apiFetch.mockResolvedValueOnce({ code: 200 });

    const res = await SUT.deleteRoom("r1");

    expect(apiFetch).toHaveBeenCalledWith("/cinemas/rooms/r1", {
      method: "DELETE",
    });
    expect(res).toBe(true);
  });

  /* ===================== SNACKS ===================== */

  it("getSnacks: GET /cinemas/snacks", async () => {
    apiFetch.mockResolvedValueOnce({ data: [{ id: "s1" }] });

    const res = await SUT.getSnacks();

    expect(apiFetch).toHaveBeenCalledWith("/cinemas/snacks");
    expect(res).toEqual([{ id: "s1" }]);
  });

  it("getSnackById: GET /cinemas/snacks/{id}", async () => {
    apiFetch.mockResolvedValueOnce({ data: { id: "s1" } });

    const res = await SUT.getSnackById("s1");

    expect(apiFetch).toHaveBeenCalledWith("/cinemas/snacks/s1");
    expect(res).toEqual({ id: "s1" });
  });

  it("createSnack: POST /cinemas/snacks (JSON body)", async () => {
    const payload = { cinemaId: "c1", name: "Popcorn", price: 49000 };
    apiFetch.mockResolvedValueOnce({ data: { id: "s2" } });

    const res = await SUT.createSnack(payload);

    expect(apiFetch).toHaveBeenCalledWith("/cinemas/snacks", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    expect(res).toEqual({ id: "s2" });
  });

  it("updateSnack: PUT /cinemas/snacks/{id} (JSON body)", async () => {
    const payload = { price: 59000 };
    apiFetch.mockResolvedValueOnce({ data: { id: "s1", price: 59000 } });

    const res = await SUT.updateSnack("s1", payload);

    expect(apiFetch).toHaveBeenCalledWith("/cinemas/snacks/s1", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    expect(res).toEqual({ id: "s1", price: 59000 });
  });

  it("deleteSnack: DELETE /cinemas/snacks/{id} returns true", async () => {
    apiFetch.mockResolvedValueOnce({ code: 200 });

    const res = await SUT.deleteSnack("s1");

    expect(apiFetch).toHaveBeenCalledWith("/cinemas/snacks/s1", {
      method: "DELETE",
    });
    expect(res).toBe(true);
  });

  /* ===================== SEATS (ROOM LEVEL) ===================== */

  it("createSeat: POST /seats (JSON body)", async () => {
    const payload = { roomId: "r1", code: "A1", type: "NORMAL" };
    apiFetch.mockResolvedValueOnce({ data: { id: "seat1" } });

    const res = await SUT.createSeat(payload);

    expect(apiFetch).toHaveBeenCalledWith("/seats", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    expect(res).toEqual({ id: "seat1" });
  });

  it("generateSeats: POST /seats/generate (JSON body)", async () => {
    const payload = { roomId: "r1", rows: 10, cols: 12 };
    apiFetch.mockResolvedValueOnce({ data: { created: 120 } });

    const res = await SUT.generateSeats(payload);

    expect(apiFetch).toHaveBeenCalledWith("/seats/generate", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    expect(res).toEqual({ created: 120 });
  });

  it("getSeatRowLabels: GET /seats/row-labels?rows=...", async () => {
    apiFetch.mockResolvedValueOnce({ data: { labels: ["A", "B"] } });

    const res = await SUT.getSeatRowLabels(2);

    expect(apiFetch).toHaveBeenCalledWith("/seats/row-labels?rows=2");
    expect(res).toEqual({ labels: ["A", "B"] });
  });

  it("updateSeat: PUT /seats/{id} (JSON body)", async () => {
    const payload = { type: "VIP" };
    apiFetch.mockResolvedValueOnce({ data: { id: "seat1", type: "VIP" } });

    const res = await SUT.updateSeat("seat1", payload);

    expect(apiFetch).toHaveBeenCalledWith("/seats/seat1", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    expect(res).toEqual({ id: "seat1", type: "VIP" });
  });

  it("deleteSeat: DELETE /seats/{id} returns true", async () => {
    apiFetch.mockResolvedValueOnce({ code: 200 });

    const res = await SUT.deleteSeat("seat1");

    expect(apiFetch).toHaveBeenCalledWith("/seats/seat1", { method: "DELETE" });
    expect(res).toBe(true);
  });

  it("getSeatById: GET /seats/{id}", async () => {
    apiFetch.mockResolvedValueOnce({ data: { id: "seat1" } });

    const res = await SUT.getSeatById("seat1");

    expect(apiFetch).toHaveBeenCalledWith("/seats/seat1");
    expect(res).toEqual({ id: "seat1" });
  });

  it("getAllSeats: GET /seats", async () => {
    apiFetch.mockResolvedValueOnce({ data: [{ id: "seat1" }] });

    const res = await SUT.getAllSeats();

    expect(apiFetch).toHaveBeenCalledWith("/seats");
    expect(res).toEqual([{ id: "seat1" }]);
  });

  it("getSeatsByRoom: GET /seats/room/{roomId}", async () => {
    apiFetch.mockResolvedValueOnce({ data: [{ id: "seat1" }] });

    const res = await SUT.getSeatsByRoom("r1");

    expect(apiFetch).toHaveBeenCalledWith("/seats/room/r1");
    expect(res).toEqual([{ id: "seat1" }]);
  });

  it("getSeatLayoutByShowtime: GET /seats/layout?showtime_id=...", async () => {
    apiFetch.mockResolvedValueOnce({ data: [{ seatId: "seat1", status: "AVAILABLE" }] });

    const res = await SUT.getSeatLayoutByShowtime("sh1");

    expect(apiFetch).toHaveBeenCalledWith("/seats/layout?showtime_id=sh1");
    expect(res).toEqual([{ seatId: "seat1", status: "AVAILABLE" }]);
  });

  it("return rule: nếu apiFetch trả trực tiếp array/object không có data thì trả nguyên", async () => {
    apiFetch.mockResolvedValueOnce([{ id: "cX" }]);

    const res = await SUT.getCinemas();

    expect(res).toEqual([{ id: "cX" }]);
  });
});
