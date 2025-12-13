import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../fetchConfig", () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from "../fetchConfig";
import * as SUT from "../showtimeService";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("showtimeService", () => {
  const originalToLocaleTimeString = Date.prototype.toLocaleTimeString;

  afterEach(() => {
    // restore nếu test có mock
    Date.prototype.toLocaleTimeString = originalToLocaleTimeString;
  });

  it("getShowtimesByMovie: GET /movies/{id}/showtimes?date=YYYY-MM-DD", async () => {
    // Mock time format ổn định: luôn trả "19:30"
    Date.prototype.toLocaleTimeString = vi.fn(() => "19:30");

    apiFetch.mockResolvedValueOnce({
      data: [
        {
          cinemaId: "c1",
          cinemaName: "Cinestar Q1",
          address: "Q1",
          showtimes: [
            {
              showtimeId: "sh1",
              startTime: "2025-01-01T19:30:00",
              format: "2D",
              roomName: "Phòng 2",
              basePrice: 90000,
            },
          ],
        },
      ],
    });

    const res = await SUT.getShowtimesByMovie("m1", "2025-01-01");

    expect(apiFetch).toHaveBeenCalledWith(
      "/movies/m1/showtimes?date=2025-01-01"
    );

    expect(res).toEqual([
      {
        cinemaId: "c1",
        cinemaName: "Cinestar Q1",
        address: "Q1",
        showtimes: [
          {
            showtimeId: "sh1",
            startTime: "19:30",
            format: "2D",
            room: "Phòng 2",
            basePrice: 90000,
            price: 90000,
          },
        ],
      },
    ]);
  });

  it("getShowtimesByMovie: map fallback fields (snake_case + room + price)", async () => {
    Date.prototype.toLocaleTimeString = vi.fn(() => "08:05");

    apiFetch.mockResolvedValueOnce([
      {
        cinema_id: "c2",
        cinema_name: "C2",
        address: "",
        showtimes: [
          {
            showtime_id: "sh2",
            start_time: "2025-01-02T08:05:00",
            format: "IMAX",
            room: "Room A",
            price: 120000, // fallback cho basePrice/price
          },
        ],
      },
    ]);

    const res = await SUT.getShowtimesByMovie("m2", "2025-01-02");

    expect(apiFetch).toHaveBeenCalledWith(
      "/movies/m2/showtimes?date=2025-01-02"
    );

    expect(res[0]).toEqual(
      expect.objectContaining({
        cinemaId: "c2",
        cinemaName: "C2",
        address: "",
      })
    );

    expect(res[0].showtimes[0]).toEqual(
      expect.objectContaining({
        showtimeId: "sh2",
        startTime: "08:05",
        format: "IMAX",
        room: "Room A",
        basePrice: 120000,
        price: 120000,
      })
    );
  });

  it("getShowtimesByMovie: nếu BE trả data=[] => map ra []", async () => {
    apiFetch.mockResolvedValueOnce({ data: [] });

    const res = await SUT.getShowtimesByMovie("m1", "2025-01-01");

    expect(res).toEqual([]);
  });

  it("getShowtimeDetail: GET /showtimes/{id}", async () => {
    apiFetch.mockResolvedValueOnce({ data: { id: "sh1", format: "2D" } });

    const res = await SUT.getShowtimeDetail("sh1");

    expect(apiFetch).toHaveBeenCalledWith("/showtimes/sh1");
    expect(res).toEqual({ id: "sh1", format: "2D" });
  });

  it("formatTime: invalid date => startTime ''", async () => {
    // Nếu startTime invalid => formatTimeToHHMM trả ""
    apiFetch.mockResolvedValueOnce({
      data: [
        {
          cinemaId: "c1",
          cinemaName: "C1",
          showtimes: [
            { showtimeId: "sh1", startTime: "NOT_A_DATE", format: "2D" },
          ],
        },
      ],
    });

    const res = await SUT.getShowtimesByMovie("m1", "2025-01-01");

    expect(res[0].showtimes[0].startTime).toBe("");
  });
});
