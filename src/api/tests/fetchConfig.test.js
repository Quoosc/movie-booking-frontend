import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiFetch, API_BASE_URL } from "../fetchConfig";

describe("apiFetch", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("calls fetch with base url + path and includes credentials", async () => {
    const mockRes = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: vi.fn().mockResolvedValue({ ok: true }),
    };

    global.fetch = vi.fn().mockResolvedValue(mockRes);

    const data = await apiFetch("/ping", { method: "GET" });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/ping`, expect.objectContaining({
      method: "GET",
      credentials: "include",
      headers: expect.objectContaining({
        Accept: "application/json",
      }),
    }));
    expect(data).toEqual({ ok: true });
  });

  it("throws Error with message from response when !ok", async () => {
    const mockRes = {
      ok: false,
      status: 403,
      statusText: "Forbidden",
      json: vi.fn().mockResolvedValue({ message: "Access denied" }),
    };

    global.fetch = vi.fn().mockResolvedValue(mockRes);

    await expect(apiFetch("/admin", { method: "GET" })).rejects.toMatchObject({
      message: "Access denied",
      status: 403,
    });
  });

  it("sets Content-Type: application/json when body is not FormData", async () => {
    const mockRes = {
      ok: true,
      status: 200,
      statusText: "OK",
      json: vi.fn().mockResolvedValue({ ok: true }),
    };

    global.fetch = vi.fn().mockResolvedValue(mockRes);

    await apiFetch("/test", { method: "POST", body: JSON.stringify({ a: 1 }) });

    const call = global.fetch.mock.calls[0];
    const options = call[1];

    expect(options.headers["Content-Type"]).toBe("application/json");
  });
});
