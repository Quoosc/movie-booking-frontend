import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock đúng path mà adminMovieService đang import
vi.mock("/src/api/fetchConfig.js", () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from "../../../api/fetchConfig.js";
import * as SUT from "../adminMovieService.js";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("adminMovieService", () => {
  /* ===================== MOVIES ===================== */

  it("getMovies: gọi /movies khi không có filters", async () => {
    apiFetch.mockResolvedValueOnce({ data: [{ id: "m1" }] });

    const res = await SUT.getMovies();

    expect(apiFetch).toHaveBeenCalledTimes(1);
    expect(apiFetch).toHaveBeenCalledWith("/movies");
    expect(res).toEqual([{ id: "m1" }]);
  });

  it("getMovies: buildQuery bỏ undefined/null/'' và giữ đúng thứ tự title,genre,status", async () => {
    apiFetch.mockResolvedValueOnce({ data: [] });

    await SUT.getMovies({
      title: "Avengers",
      genre: "",
      status: "SHOWING",
    });

    expect(apiFetch).toHaveBeenCalledWith("/movies?title=Avengers&status=SHOWING");
  });

  it("getMovieById: gọi /movies/{id}", async () => {
    apiFetch.mockResolvedValueOnce({ data: { id: "m1" } });

    const res = await SUT.getMovieById("m1");

    expect(apiFetch).toHaveBeenCalledWith("/movies/m1");
    expect(res).toEqual({ id: "m1" });
  });

  it("createMovie: POST /movies với body JSON", async () => {
    const payload = { title: "New Movie", duration: 120 };
    apiFetch.mockResolvedValueOnce({ data: { id: "m2" } });

    const res = await SUT.createMovie(payload);

    expect(apiFetch).toHaveBeenCalledWith("/movies", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    expect(res).toEqual({ id: "m2" });
  });

  it("updateMovie: PUT /movies/{id} với body JSON", async () => {
    const payload = { title: "Updated" };
    apiFetch.mockResolvedValueOnce({ data: { id: "m1", title: "Updated" } });

    const res = await SUT.updateMovie("m1", payload);

    expect(apiFetch).toHaveBeenCalledWith("/movies/m1", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    expect(res).toEqual({ id: "m1", title: "Updated" });
  });

  it("deleteMovie: DELETE /movies/{id} và return true", async () => {
    apiFetch.mockResolvedValueOnce({ code: 200 });

    const res = await SUT.deleteMovie("m1");

    expect(apiFetch).toHaveBeenCalledWith("/movies/m1", { method: "DELETE" });
    expect(res).toBe(true);
  });

  it("searchMoviesByTitle: gọi /movies/search/title?title=...", async () => {
    apiFetch.mockResolvedValueOnce({ data: [{ id: "m1" }] });

    const res = await SUT.searchMoviesByTitle("Ava");

    expect(apiFetch).toHaveBeenCalledWith("/movies/search/title?title=Ava");
    expect(res).toEqual([{ id: "m1" }]);
  });

  it("filterMoviesByStatus: gọi /movies/filter/status?status=...", async () => {
    apiFetch.mockResolvedValueOnce({ data: [{ id: "m1" }] });

    const res = await SUT.filterMoviesByStatus("UPCOMING");

    expect(apiFetch).toHaveBeenCalledWith(
      "/movies/filter/status?status=UPCOMING"
    );
    expect(res).toEqual([{ id: "m1" }]);
  });

  it("filterMoviesByGenre: gọi /movies/filter/genre?genre=...", async () => {
    apiFetch.mockResolvedValueOnce({ data: [{ id: "m1" }] });

    const res = await SUT.filterMoviesByGenre("Action");

    expect(apiFetch).toHaveBeenCalledWith("/movies/filter/genre?genre=Action");
    expect(res).toEqual([{ id: "m1" }]);
  });

  /* ===================== SHOWTIMES ===================== */

  it("createShowtime: POST /showtimes với body JSON", async () => {
    const payload = { movieId: "m1", roomId: "r1", startTime: "2025-01-01T10:00:00" };
    apiFetch.mockResolvedValueOnce({ data: { id: "s1" } });

    const res = await SUT.createShowtime(payload);

    expect(apiFetch).toHaveBeenCalledWith("/showtimes", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    expect(res).toEqual({ id: "s1" });
  });

  it("updateShowtime: PUT /showtimes/{id} với body JSON", async () => {
    const payload = { format: "2D" };
    apiFetch.mockResolvedValueOnce({ data: { id: "s1" } });

    const res = await SUT.updateShowtime("s1", payload);

    expect(apiFetch).toHaveBeenCalledWith("/showtimes/s1", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    expect(res).toEqual({ id: "s1" });
  });

  it("deleteShowtime: DELETE /showtimes/{id} và return true", async () => {
    apiFetch.mockResolvedValueOnce({ code: 200 });

    const res = await SUT.deleteShowtime("s1");

    expect(apiFetch).toHaveBeenCalledWith("/showtimes/s1", { method: "DELETE" });
    expect(res).toBe(true);
  });

  it("getShowtimeById: gọi /showtimes/{id}", async () => {
    apiFetch.mockResolvedValueOnce({ data: { id: "s1" } });

    const res = await SUT.getShowtimeById("s1");

    expect(apiFetch).toHaveBeenCalledWith("/showtimes/s1");
    expect(res).toEqual({ id: "s1" });
  });

  it("getAllShowtimes: gọi /showtimes", async () => {
    apiFetch.mockResolvedValueOnce({ data: [{ id: "s1" }] });

    const res = await SUT.getAllShowtimes();

    expect(apiFetch).toHaveBeenCalledWith("/showtimes");
    expect(res).toEqual([{ id: "s1" }]);
  });

  it("getShowtimesByMovie: gọi /showtimes/movie/{movieId}", async () => {
    apiFetch.mockResolvedValueOnce({ data: [{ id: "s1" }] });

    const res = await SUT.getShowtimesByMovie("m1");

    expect(apiFetch).toHaveBeenCalledWith("/showtimes/movie/m1");
    expect(res).toEqual([{ id: "s1" }]);
  });

  it("getUpcomingShowtimesByMovie: gọi /showtimes/movie/{movieId}/upcoming", async () => {
    apiFetch.mockResolvedValueOnce({ data: [{ id: "s1" }] });

    const res = await SUT.getUpcomingShowtimesByMovie("m1");

    expect(apiFetch).toHaveBeenCalledWith("/showtimes/movie/m1/upcoming");
    expect(res).toEqual([{ id: "s1" }]);
  });

  it("getShowtimesByRoom: gọi /showtimes/room/{roomId}", async () => {
    apiFetch.mockResolvedValueOnce({ data: [{ id: "s1" }] });

    const res = await SUT.getShowtimesByRoom("r1");

    expect(apiFetch).toHaveBeenCalledWith("/showtimes/room/r1");
    expect(res).toEqual([{ id: "s1" }]);
  });

  it("getShowtimesByMovieInRange: gọi /showtimes/movie/{id}/date-range?startDate=...&endDate=...", async () => {
    apiFetch.mockResolvedValueOnce({ data: [{ id: "s1" }] });

    const res = await SUT.getShowtimesByMovieInRange("m1", "2025-01-01", "2025-01-07");

    expect(apiFetch).toHaveBeenCalledWith(
      "/showtimes/movie/m1/date-range?startDate=2025-01-01&endDate=2025-01-07"
    );
    expect(res).toEqual([{ id: "s1" }]);
  });

  it("getMovieShowtimesPublic: gọi /movies/{id}/showtimes?date=YYYY-MM-DD", async () => {
    apiFetch.mockResolvedValueOnce({ data: { cinemas: [] } });

    const res = await SUT.getMovieShowtimesPublic("m1", "2025-01-02");

    expect(apiFetch).toHaveBeenCalledWith("/movies/m1/showtimes?date=2025-01-02");
    expect(res).toEqual({ cinemas: [] });
  });

  it("return rule: nếu apiFetch trả trực tiếp array/object không có data thì trả nguyên", async () => {
    apiFetch.mockResolvedValueOnce([{ id: "mX" }]); // không có .data

    const res = await SUT.getMovies({ title: "X" });

    expect(res).toEqual([{ id: "mX" }]);
  });
});
