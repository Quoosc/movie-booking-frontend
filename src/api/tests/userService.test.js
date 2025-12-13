import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getUserProfile,
  updateUserProfile,
  getUserLoyalty,
  getActiveMembershipTiers,
  changePassword,
} from "../userService";

const apiFetchMock = vi.fn();
vi.mock("../fetchConfig", () => ({
  apiFetch: (...args) => apiFetchMock(...args),
}));

describe("userService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getUserProfile unwraps res.data.data", async () => {
    apiFetchMock.mockResolvedValue({ data: { data: { username: "u1" } } });
    const res = await getUserProfile();
    expect(res).toEqual({ username: "u1" });
    expect(apiFetchMock).toHaveBeenCalledWith("/users/profile");
  });

  it("updateUserProfile sends PUT with JSON body and unwraps", async () => {
    apiFetchMock.mockResolvedValue({ data: { data: { username: "new" } } });
    const payload = { username: "new" };

    const res = await updateUserProfile(payload);

    expect(apiFetchMock).toHaveBeenCalledWith("/users/profile", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    expect(res).toEqual({ username: "new" });
  });

  it("getUserLoyalty unwraps", async () => {
    apiFetchMock.mockResolvedValue({ data: { data: { loyaltyPoints: 10 } } });
    const res = await getUserLoyalty();
    expect(res).toEqual({ loyaltyPoints: 10 });
    expect(apiFetchMock).toHaveBeenCalledWith("/users/loyalty");
  });

  it("getActiveMembershipTiers returns array or []", async () => {
    apiFetchMock.mockResolvedValue({
      data: { data: [{ membershipTierId: "t1" }] },
    });
    const ok = await getActiveMembershipTiers();
    expect(ok).toEqual([{ membershipTierId: "t1" }]);

    apiFetchMock.mockResolvedValue({ data: { data: { a: 1 } } });
    const empty = await getActiveMembershipTiers();
    expect(empty).toEqual([]);
  });

  it("changePassword returns string OR message OR default", async () => {
    apiFetchMock.mockResolvedValue("OK");
    const a = await changePassword({ currentPassword: "a" });
    expect(a).toBe("OK");

    apiFetchMock.mockResolvedValue({ message: "Done" });
    const b = await changePassword({ currentPassword: "a" });
    expect(b).toBe("Done");

    apiFetchMock.mockResolvedValue({});
    const c = await changePassword({ currentPassword: "a" });
    expect(c).toBe("Password updated successfully");

    expect(apiFetchMock).toHaveBeenLastCalledWith("/users/password", {
      method: "PATCH",
      body: JSON.stringify({ currentPassword: "a" }),
    });
  });
});
