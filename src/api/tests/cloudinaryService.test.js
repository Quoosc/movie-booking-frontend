import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as SUT from "../cloudinaryService";

describe("cloudinaryService", () => {
  const originalFetch = global.fetch;
  const OriginalFormData = global.FormData;

  class MockFormData {
    constructor() {
      this.entries = [];
    }
    append(k, v) {
      this.entries.push([k, v]);
    }
  }

  beforeEach(() => {
    global.fetch = vi.fn();
    global.FormData = MockFormData;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    global.FormData = OriginalFormData;
    vi.restoreAllMocks();
  });

  it("uploadPoster: no file => throws", async () => {
    await expect(SUT.uploadPoster(null)).rejects.toThrow("No file provided");
  });

  it("uploadPoster: POST đúng endpoint + formData fields + return posterUrl/posterCloudinaryId", async () => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME; // có thể undefined, test vẫn theo đúng module
    const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    const folder = import.meta.env.VITE_CLOUDINARY_FOLDER || "movie-posters";

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ secure_url: "https://x/poster.jpg", public_id: "pid1" }),
    });

    const file = new Blob(["x"], { type: "image/png" });

    const res = await SUT.uploadPoster(file);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = global.fetch.mock.calls[0];

    expect(url).toBe(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
    expect(options.method).toBe("POST");
    expect(options.body).toBeInstanceOf(MockFormData);

    const entries = options.body.entries;
    expect(entries).toEqual(
      expect.arrayContaining([
        ["file", file],
        ["upload_preset", preset],
        ["folder", folder],
      ])
    );

    expect(res).toEqual({
      posterUrl: "https://x/poster.jpg",
      posterCloudinaryId: "pid1",
    });
  });

  it("uploadPoster: res.ok=false => throws message from data.error.message", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: { message: "bad upload" } }),
    });

    const file = new Blob(["x"], { type: "image/png" });

    await expect(SUT.uploadPoster(file)).rejects.toThrow("bad upload");
  });

  it("uploadSnackImage: POST đúng folder snacks + return imageUrl/imageCloudinaryId", async () => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    const snacksFolder = import.meta.env.VITE_CLOUDINARY_SNACKS_FOLDER || "snacks";

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ secure_url: "https://x/snack.jpg", public_id: "sid1" }),
    });

    const file = new Blob(["y"], { type: "image/png" });

    const res = await SUT.uploadSnackImage(file);

    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
    expect(options.method).toBe("POST");

    const entries = options.body.entries;
    expect(entries).toEqual(
      expect.arrayContaining([
        ["file", file],
        ["upload_preset", preset],
        ["folder", snacksFolder],
      ])
    );

    expect(res).toEqual({
      imageUrl: "https://x/snack.jpg",
      imageCloudinaryId: "sid1",
    });
  });

  it("uploadSnackImage: res.ok=false => throws default message when no error.message", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    const file = new Blob(["y"], { type: "image/png" });

    await expect(SUT.uploadSnackImage(file)).rejects.toThrow(
      "Upload snack image thất bại"
    );
  });
});
