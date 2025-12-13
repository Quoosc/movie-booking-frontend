import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// mock apiFetch
const apiFetchMock = vi.fn();
vi.mock("../fetchConfig", () => ({
  apiFetch: (...args) => apiFetchMock(...args),
}));

import {
  register,
  login,
  me,
  logout,
  logoutAll,
  refreshToken,
  getStoredUser,
  setStoredUser,
  clearStoredUser,
} from "../authService";

describe("authService", () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("register calls POST /auth/register with mapped body", async () => {
    apiFetchMock.mockResolvedValue({ code: 201 });

    const res = await register({
      fullName: "A",
      email: "a@b.com",
      phone: "0123",
      password: "123456",
    });

    expect(apiFetchMock).toHaveBeenCalledWith("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        phoneNumber: "0123",
        email: "a@b.com",
        username: "A",
        password: "123456",
        confirmPassword: "123456",
      }),
    });

    expect(res).toEqual({ success: true });
  });

  it("login stores tokens + user when response has data.user", async () => {
    apiFetchMock.mockResolvedValue({
      data: {
        accessToken: "at-1",
        refreshToken: "rt-1",
        user: { id: "u1", role: "USER" },
      },
    });

    const res = await login({ email: "a@b.com", password: "123" });

    expect(apiFetchMock).toHaveBeenCalledWith("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "a@b.com", password: "123" }),
    });

    expect(localStorage.getItem("accessToken")).toBe("at-1");
    expect(localStorage.getItem("refreshToken")).toBe("rt-1");
    expect(JSON.parse(localStorage.getItem("user"))).toMatchObject({ id: "u1" });

    expect(res).toEqual({ success: true });
  });

  it("me calls /users/profile and merges stored user + role", async () => {
    // stored user cũ
    setStoredUser({ id: "u1", fullName: "Old Name", role: "USER" });
    localStorage.setItem("accessToken", "fake.jwt.token"); // không decode được vẫn ok

    apiFetchMock.mockResolvedValue({
      data: { id: "u1", email: "a@b.com", role: "ADMIN" },
    });

    const profile = await me();

    expect(apiFetchMock).toHaveBeenCalledWith("/users/profile");
    expect(profile).toMatchObject({
      id: "u1",
      email: "a@b.com",
      role: "ADMIN",
      fullName: "Old Name", // giữ field cũ nếu raw thiếu
    });

    expect(getStoredUser()).toMatchObject({ role: "ADMIN" });
  });

  it("logout clears storage and calls POST /auth/logout (ignore errors)", async () => {
    setStoredUser({ id: "u1" });
    localStorage.setItem("accessToken", "at");
    localStorage.setItem("refreshToken", "rt");

    apiFetchMock.mockRejectedValue(new Error("fail")); // vẫn không throw

    await logout();

    expect(localStorage.getItem("user")).toBe(null);
    expect(localStorage.getItem("accessToken")).toBe(null);
    expect(localStorage.getItem("refreshToken")).toBe(null);
  });

  it("logoutAll calls POST /auth/logout-all?email=", async () => {
    apiFetchMock.mockResolvedValue({ ok: true });

    await logoutAll("a@b.com");

    expect(apiFetchMock).toHaveBeenCalledWith(
      "/auth/logout-all?email=a%40b.com",
      { method: "POST" }
    );
  });

  it("refreshToken calls GET /auth/refresh and stores accessToken if provided", async () => {
    apiFetchMock.mockResolvedValue({ data: { accessToken: "new-at" } });

    const ok = await refreshToken();

    expect(apiFetchMock).toHaveBeenCalledWith("/auth/refresh", { method: "GET" });
    expect(localStorage.getItem("accessToken")).toBe("new-at");
    expect(ok).toBe(true);
  });

  it("clearStoredUser removes user + tokens", () => {
    setStoredUser({ id: "u1" });
    localStorage.setItem("accessToken", "at");
    localStorage.setItem("refreshToken", "rt");

    clearStoredUser();

    expect(localStorage.getItem("user")).toBe(null);
    expect(localStorage.getItem("accessToken")).toBe(null);
    expect(localStorage.getItem("refreshToken")).toBe(null);
  });
});
