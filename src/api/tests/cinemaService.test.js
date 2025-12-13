import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../fetchConfig", () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from "../fetchConfig";
import * as SUT from "../cinemaService";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("cinemaService", () => {
  it("getAllCinemas: GET /cinemas + mapCinema (defaults for images)", async () => {
    apiFetch.mockResolvedValueOnce({
      data: [
        {
          cinemaId: "c1",
          name: "Cinestar Q1",
          address: "Q1",
          city: "HCM",
          district: "1",
          // no image fields => default
        },
      ],
    });

    const res = await SUT.getAllCinemas();

    expect(apiFetch).toHaveBeenCalledWith("/cinemas");
    expect(res).toEqual([
      expect.objectContaining({
        id: "c1",
        name: "Cinestar Q1",
        address: "Q1",
        city: "HCM",
        district: "1",
        heroImageUrl: "/public/cinemas/default-hero.jpg",
        thumbnailUrl: "/public/cinemas/default-thumb.jpg",
      }),
    ]);
  });

  it("getAllCinemas: map snake_case + prefer hero_image_url/thumbnail_url over image_url", async () => {
    apiFetch.mockResolvedValueOnce([
      {
        cinema_id: "c2",
        name: "C2",
        address: "",
        hero_image_url: "https://img/hero.jpg",
        thumbnail_url: "https://img/thumb.jpg",
        image_url: "https://img/should-not-win.jpg",
      },
    ]);

    const res = await SUT.getAllCinemas();

    expect(apiFetch).toHaveBeenCalledWith("/cinemas");
    expect(res[0]).toEqual(
      expect.objectContaining({
        id: "c2",
        name: "C2",
        heroImageUrl: "https://img/hero.jpg",
        thumbnailUrl: "https://img/thumb.jpg",
      })
    );
  });

  it("getCinemaById: GET /cinemas/{id} + mapCinema", async () => {
    apiFetch.mockResolvedValueOnce({
      data: {
        id: "c9",
        name: "Detail",
        imageUrl: "https://img/x.jpg",
      },
    });

    const res = await SUT.getCinemaById("c9");

    expect(apiFetch).toHaveBeenCalledWith("/cinemas/c9");
    expect(res).toEqual(
      expect.objectContaining({
        id: "c9",
        name: "Detail",
        heroImageUrl: "https://img/x.jpg",
        thumbnailUrl: "https://img/x.jpg",
      })
    );
  });
});
