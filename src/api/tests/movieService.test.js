import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../fetchConfig.js", () => ({
  apiFetch: vi.fn(),
}));

vi.mock("../showtimeService", () => ({
  getShowtimesByMovie: vi.fn(),
}));

import { apiFetch } from "../fetchConfig";
import { getShowtimesByMovie } from "../showtimeService.js";
import * as SUT from "../movieService";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("movieService", () => {
  it("getAllMovies: GET /movies + mapMovie (id from movieId, posterUrl keeps full url)", async () => {
    apiFetch.mockResolvedValueOnce({
      data: [
        {
          movieId: "m1",
          title: "A",
          posterUrl: "https://img/a.jpg",
          status: "SHOWING",
        },
      ],
    });

    const res = await SUT.getAllMovies();

    expect(apiFetch).toHaveBeenCalledWith("/movies");
    expect(res).toEqual([
      expect.objectContaining({
        id: "m1",
        title: "A",
        posterUrl: "https://img/a.jpg",
        bannerUrl: "https://img/a.jpg", // fallback banner -> poster
        description: "",
        status: "SHOWING",
      }),
    ]);
  });

  it("getAllMovies: nếu apiFetch trả raw array (không có data) vẫn map được", async () => {
    apiFetch.mockResolvedValueOnce([
      { id: "m2", title: "B", poster_url: "https://img/b.jpg" },
    ]);

    const res = await SUT.getAllMovies();

    expect(apiFetch).toHaveBeenCalledWith("/movies");
    expect(res).toEqual([
      expect.objectContaining({
        id: "m2",
        title: "B",
        posterUrl: "https://img/b.jpg",
        bannerUrl: "https://img/b.jpg",
      }),
    ]);
  });

  it("getAllMovies: nếu không có posterUrl + không có CLOUDINARY_BASE_URL => fallback placeholder", async () => {
    apiFetch.mockResolvedValueOnce({
      data: [{ movieId: "m3", title: "C", posterCloudinaryId: "abc" }],
    });

    const res = await SUT.getAllMovies();

    expect(res[0]).toEqual(
      expect.objectContaining({
        id: "m3",
        posterUrl: "/public/movies/placeholder-poster.jpg",
        bannerUrl: "/public/movies/placeholder-poster.jpg",
      })
    );
  });

  it("getShowingMovies: GET /movies/filter/status?status=SHOWING", async () => {
    apiFetch.mockResolvedValueOnce({ data: [{ movieId: "m1", title: "A" }] });

    const res = await SUT.getShowingMovies();

    expect(apiFetch).toHaveBeenCalledWith("/movies/filter/status?status=SHOWING");
    expect(res[0]).toEqual(expect.objectContaining({ id: "m1", title: "A" }));
  });

  it("getUpcomingMovies: GET /movies/filter/status?status=UPCOMING", async () => {
    apiFetch.mockResolvedValueOnce({ data: [{ movieId: "m9", title: "U" }] });

    const res = await SUT.getUpcomingMovies();

    expect(apiFetch).toHaveBeenCalledWith("/movies/filter/status?status=UPCOMING");
    expect(res[0]).toEqual(expect.objectContaining({ id: "m9", title: "U" }));
  });

  it("getMovieById: GET /movies/{id} + mapMovie banner fallback poster", async () => {
    apiFetch.mockResolvedValueOnce({
      data: {
        movie_id: "m10",
        title: "Detail",
        poster_url: "https://img/p.jpg",
        banner_url: "", // empty -> fallback posterUrl
        description: null,
      },
    });

    const res = await SUT.getMovieById("m10");

    expect(apiFetch).toHaveBeenCalledWith("/movies/m10");
    expect(res).toEqual(
      expect.objectContaining({
        id: "m10",
        title: "Detail",
        posterUrl: "https://img/p.jpg",
        bannerUrl: "https://img/p.jpg",
        description: "", // fallback
      })
    );
  });

  it("getMovieShowtimesByDate: forward sang showtimeService.getShowtimesByMovie(movieId, date)", async () => {
    getShowtimesByMovie.mockResolvedValueOnce([{ cinemaId: "c1", showtimes: [] }]);

    const res = await SUT.getMovieShowtimesByDate("m1", "2025-01-01");

    expect(getShowtimesByMovie).toHaveBeenCalledWith("m1", "2025-01-01");
    expect(res).toEqual([{ cinemaId: "c1", showtimes: [] }]);
  });

  it("getShowtimesByMovieAndDate is alias của getMovieShowtimesByDate", async () => {
    getShowtimesByMovie.mockResolvedValueOnce([{ cinemaId: "c2" }]);

    const res = await SUT.getShowtimesByMovieAndDate("m2", "2025-01-02");

    expect(getShowtimesByMovie).toHaveBeenCalledWith("m2", "2025-01-02");
    expect(res).toEqual([{ cinemaId: "c2" }]);
  });

  it("searchMoviesByTitle: keyword rỗng => gọi getAllMovies (tức GET /movies)", async () => {
    apiFetch.mockResolvedValueOnce({
      data: [{ movieId: "m1", title: "A", posterUrl: "https://img/a.jpg" }],
    });

    const res = await SUT.searchMoviesByTitle("   ");

    expect(apiFetch).toHaveBeenCalledWith("/movies");
    expect(res).toEqual([
      expect.objectContaining({ id: "m1", title: "A" }),
    ]);
  });

  it("searchMoviesByTitle: trim + lowercase + encodeURIComponent", async () => {
    apiFetch.mockResolvedValueOnce({
      data: [{ movieId: "m1", title: "A" }],
    });

    const res = await SUT.searchMoviesByTitle("  AvA  ");

    expect(apiFetch).toHaveBeenCalledWith("/movies/search/title?title=ava");
    expect(res[0]).toEqual(expect.objectContaining({ id: "m1" }));
  });

  it("filterMoviesByStatus: status rỗng => gọi getAllMovies (GET /movies)", async () => {
    apiFetch.mockResolvedValueOnce({ data: [{ movieId: "m1", title: "A" }] });

    const res = await SUT.filterMoviesByStatus("");

    expect(apiFetch).toHaveBeenCalledWith("/movies");
    expect(res[0]).toEqual(expect.objectContaining({ id: "m1" }));
  });

  it("filterMoviesByStatus: normalize uppercase + encode", async () => {
    apiFetch.mockResolvedValueOnce({ data: [{ movieId: "m1", status: "SHOWING" }] });

    const res = await SUT.filterMoviesByStatus("showing");

    expect(apiFetch).toHaveBeenCalledWith("/movies/filter/status?status=SHOWING");
    expect(res[0]).toEqual(expect.objectContaining({ status: "SHOWING" }));
  });

  it("filterMoviesByGenre: genre rỗng => gọi getAllMovies (GET /movies)", async () => {
    apiFetch.mockResolvedValueOnce({ data: [{ movieId: "m1", title: "A" }] });

    const res = await SUT.filterMoviesByGenre(null);

    expect(apiFetch).toHaveBeenCalledWith("/movies");
    expect(res[0]).toEqual(expect.objectContaining({ id: "m1" }));
  });

  it("filterMoviesByGenre: lowercase + encodeURIComponent", async () => {
    apiFetch.mockResolvedValueOnce({ data: [{ movieId: "m1", genre: "hài" }] });

    const res = await SUT.filterMoviesByGenre("Hài");

    // "hài" => encode: h%C3%A0i
    expect(apiFetch).toHaveBeenCalledWith("/movies/filter/genre?genre=h%C3%A0i");
    expect(res[0]).toEqual(expect.objectContaining({ id: "m1" }));
  });

  it("getCinemaMovies: default status SHOWING nếu không truyền", async () => {
    apiFetch.mockResolvedValueOnce({
      data: [{ movieId: "m1", title: "A" }],
    });

    const res = await SUT.getCinemaMovies("c1");

    expect(apiFetch).toHaveBeenCalledWith("/cinemas/c1/movies?status=SHOWING");
    expect(res[0]).toEqual(expect.objectContaining({ id: "m1" }));
  });

  it("getCinemaMovies: normalize status uppercase + encode", async () => {
    apiFetch.mockResolvedValueOnce({
      data: [{ movieId: "m2", status: "UPCOMING" }],
    });

    const res = await SUT.getCinemaMovies("c2", "upcoming");

    expect(apiFetch).toHaveBeenCalledWith("/cinemas/c2/movies?status=UPCOMING");
    expect(res[0]).toEqual(expect.objectContaining({ id: "m2", status: "UPCOMING" }));
  });
});
