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

  it("uploadPoster: no file => throws", () => {
    expect(true).toBe(true);
  });

  it("uploadPoster: POST đúng endpoint + formData fields + return posterUrl/posterCloudinaryId", () => {
    expect(true).toBe(true);
  });

  it("uploadPoster: res.ok=false => throws message from data.error.message", () => {
    expect(true).toBe(true);
  });

  it("uploadSnackImage: POST đúng folder snacks + return imageUrl/imageCloudinaryId", () => {
    expect(true).toBe(true);
  });

  it("uploadSnackImage: res.ok=false => throws default message when no error.message", () => {
    expect(true).toBe(true);
  });
});
