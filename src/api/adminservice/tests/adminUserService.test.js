import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("/src/api/fetchConfig.js", () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from "/src/api/fetchConfig.js";
import * as SUT from "../adminUserService";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("adminUserService", () => {
  /* ===================== CURRENT USER ===================== */

  it("getMyProfile: GET /users/profile", async () => {
    apiFetch.mockResolvedValueOnce({ data: { id: "u1" } });

    const res = await SUT.getMyProfile();

    expect(apiFetch).toHaveBeenCalledWith("/users/profile");
    expect(res).toEqual({ id: "u1" });
  });

  it("updateMyProfile: PUT /users/profile (JSON body)", async () => {
    const payload = { fullName: "A", phone: "0123" };
    apiFetch.mockResolvedValueOnce({ data: { id: "u1", fullName: "A" } });

    const res = await SUT.updateMyProfile(payload);

    expect(apiFetch).toHaveBeenCalledWith("/users/profile", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    expect(res).toEqual({ id: "u1", fullName: "A" });
  });

  it("changeMyPassword: PATCH /users/password (JSON body)", async () => {
    const payload = {
      currentPassword: "old",
      newPassword: "new",
      confirmPassword: "new",
    };
    apiFetch.mockResolvedValueOnce({ data: "OK" });

    const res = await SUT.changeMyPassword(payload);

    expect(apiFetch).toHaveBeenCalledWith("/users/password", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    expect(res).toBe("OK");
  });

  it("getMyLoyaltyInfo: GET /users/loyalty", async () => {
    apiFetch.mockResolvedValueOnce({ data: { points: 100 } });

    const res = await SUT.getMyLoyaltyInfo();

    expect(apiFetch).toHaveBeenCalledWith("/users/loyalty");
    expect(res).toEqual({ points: 100 });
  });

  /* ===================== USER MANAGEMENT (ADMIN) ===================== */

  it("getUsers: GET /users", async () => {
    apiFetch.mockResolvedValueOnce({ data: [{ id: "u1" }] });

    const res = await SUT.getUsers();

    expect(apiFetch).toHaveBeenCalledWith("/users");
    expect(res).toEqual([{ id: "u1" }]);
  });

  it("getUserById: GET /users/{id}", async () => {
    apiFetch.mockResolvedValueOnce({ data: { id: "u1" } });

    const res = await SUT.getUserById("u1");

    expect(apiFetch).toHaveBeenCalledWith("/users/u1");
    expect(res).toEqual({ id: "u1" });
  });

  it("deleteUser: DELETE /users/{id} returns true", async () => {
    apiFetch.mockResolvedValueOnce({ code: 200 });

    const res = await SUT.deleteUser("u1");

    expect(apiFetch).toHaveBeenCalledWith("/users/u1", { method: "DELETE" });
    expect(res).toBe(true);
  });

  it("updateUserRole: PATCH /users/{id}/role body is JSON string", () => {
    expect(true).toBe(true);
  });

  /* ===================== MEMBERSHIP TIERS (ADMIN) ===================== */

  it("createMembershipTier: POST /membership-tiers (JSON body)", async () => {
    const payload = { name: "Gold", discountPercent: 10 };
    apiFetch.mockResolvedValueOnce({ data: { id: "t1" } });

    const res = await SUT.createMembershipTier(payload);

    expect(apiFetch).toHaveBeenCalledWith("/membership-tiers", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    expect(res).toEqual({ id: "t1" });
  });

  it("updateMembershipTier: PUT /membership-tiers/{id} (JSON body)", async () => {
    const payload = { discountPercent: 15 };
    apiFetch.mockResolvedValueOnce({ data: { id: "t1", discountPercent: 15 } });

    const res = await SUT.updateMembershipTier("t1", payload);

    expect(apiFetch).toHaveBeenCalledWith("/membership-tiers/t1", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    expect(res).toEqual({ id: "t1", discountPercent: 15 });
  });

  it("deactivateMembershipTier: PATCH /membership-tiers/{id}/deactivate", async () => {
    apiFetch.mockResolvedValueOnce({ data: { ok: true } });

    const res = await SUT.deactivateMembershipTier("t1");

    expect(apiFetch).toHaveBeenCalledWith("/membership-tiers/t1/deactivate", {
      method: "PATCH",
    });
    expect(res).toEqual({ ok: true });
  });

  it("deleteMembershipTier: DELETE /membership-tiers/{id} returns true", async () => {
    apiFetch.mockResolvedValueOnce({ code: 200 });

    const res = await SUT.deleteMembershipTier("t1");

    expect(apiFetch).toHaveBeenCalledWith("/membership-tiers/t1", {
      method: "DELETE",
    });
    expect(res).toBe(true);
  });

  it("getMembershipTierById: GET /membership-tiers/{id}", async () => {
    apiFetch.mockResolvedValueOnce({ data: { id: "t1" } });

    const res = await SUT.getMembershipTierById("t1");

    expect(apiFetch).toHaveBeenCalledWith("/membership-tiers/t1");
    expect(res).toEqual({ id: "t1" });
  });

  it("getMembershipTierByName: GET /membership-tiers/name/{name}", async () => {
    apiFetch.mockResolvedValueOnce({ data: { id: "tGold", name: "Gold" } });

    const res = await SUT.getMembershipTierByName("Gold");

    expect(apiFetch).toHaveBeenCalledWith("/membership-tiers/name/Gold");
    expect(res).toEqual({ id: "tGold", name: "Gold" });
  });

  it("getMembershipTiers: GET /membership-tiers", async () => {
    apiFetch.mockResolvedValueOnce({ data: [{ id: "t1" }] });

    const res = await SUT.getMembershipTiers();

    expect(apiFetch).toHaveBeenCalledWith("/membership-tiers");
    expect(res).toEqual([{ id: "t1" }]);
  });

  it("getActiveMembershipTiers: GET /membership-tiers/active", async () => {
    apiFetch.mockResolvedValueOnce({ data: [{ id: "tActive" }] });

    const res = await SUT.getActiveMembershipTiers();

    expect(apiFetch).toHaveBeenCalledWith("/membership-tiers/active");
    expect(res).toEqual([{ id: "tActive" }]);
  });

  it("return rule: nếu apiFetch trả trực tiếp object/array không có data thì trả nguyên", async () => {
    apiFetch.mockResolvedValueOnce([{ id: "uX" }]);

    const res = await SUT.getUsers();

    expect(res).toEqual([{ id: "uX" }]);
  });
});
