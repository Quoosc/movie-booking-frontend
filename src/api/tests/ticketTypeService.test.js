import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../fetchConfig", () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from "../fetchConfig";
import * as SUT from "../ticketTypeService";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("ticketTypeService", () => {
  const originalError = console.error;

  afterEach(() => {
    console.error = originalError;
  });

  it("getTicketTypes: GET /ticket-types (no params)", async () => {
    apiFetch.mockResolvedValueOnce({
      data: [{ ticketTypeId: "tt1", code: "ADULT", label: "Người lớn", price: 69000 }],
    });

    const res = await SUT.getTicketTypes();

    expect(apiFetch).toHaveBeenCalledWith("/ticket-types");
    expect(res).toEqual([
      expect.objectContaining({
        id: "adult",
        ticketTypeId: "tt1",
        code: "ADULT",
        label: "Người lớn",
        price: 69000,
      }),
    ]);
  });

  it("getTicketTypes: query params showtimeId then userId", async () => {
    apiFetch.mockResolvedValueOnce({
      data: [{ ticketTypeId: "tt1", code: "ADULT", price: 1 }],
    });

    await SUT.getTicketTypes({ showtimeId: "sh1", userId: "u1" });

    expect(apiFetch).toHaveBeenCalledWith("/ticket-types?showtimeId=sh1&userId=u1");
  });

  it("map: label fallback to code, price fallback 0, id fallback to ticketTypeId if code empty", async () => {
    apiFetch.mockResolvedValueOnce({
      data: [
        { ticketTypeId: "ttX", code: "STUDENT" }, // label missing
        { ticketTypeId: "ttY", code: "", label: "", price: null }, // code empty
      ],
    });

    const res = await SUT.getTicketTypes({ showtimeId: "sh1" });

    expect(res).toEqual([
      expect.objectContaining({
        id: "student",
        ticketTypeId: "ttX",
        code: "STUDENT",
        label: "STUDENT",
        price: 0,
      }),
      expect.objectContaining({
        id: "ttY",
        ticketTypeId: "ttY",
        code: "",
        label: "Vé xem phim",
        price: 0,
      }),
    ]);
  });

  it("getTicketTypes: list empty => return [] and console.error called", async () => {
    console.error = vi.fn();
    apiFetch.mockResolvedValueOnce({ data: [] });

    const res = await SUT.getTicketTypes({ showtimeId: "sh1" });

    expect(res).toEqual([]);
    expect(console.error).toHaveBeenCalled();
  });

  it("getTicketTypes: wrapper raw array (no data) still works", async () => {
    apiFetch.mockResolvedValueOnce([
      { ticketTypeId: "tt1", code: "ADULT", label: "A", price: 10 },
    ]);

    const res = await SUT.getTicketTypes();

    expect(res[0]).toEqual(expect.objectContaining({ id: "adult", price: 10 }));
  });
});
