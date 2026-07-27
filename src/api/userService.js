//src/api/userService.js
import { apiFetch } from "./fetchConfig";

const USE_USER_MOCK = false; // <--- bật mock để test UI


export async function getUserProfile() {
  if (USE_USER_MOCK) return MOCK_PROFILE;

  const res = await apiFetch("/users/profile");
  const raw = res.data || res;
  return raw.data || raw;
}

export async function updateUserProfile(payload) {
  if (USE_USER_MOCK) {
    // giả lập update: merge rồi trả ra
    Object.assign(MOCK_PROFILE, payload, {
      updatedAt: new Date().toISOString(),
    });
    return MOCK_PROFILE;
  }

  const res = await apiFetch("/users/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  const raw = res.data || res;
  return raw.data || raw;
}

export async function getUserLoyalty() {
  if (USE_USER_MOCK) return MOCK_LOYALTY;

  const res = await apiFetch("/users/loyalty");
  const raw = res.data || res;
  return raw.data || raw;
}

export async function getLoyaltyTransactions(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "" && value !== undefined && value !== null) params.set(key, String(value));
  });
  const query = params.toString();
  const res = await apiFetch(`/users/loyalty/transactions${query ? `?${query}` : ""}`);
  const data = res?.data || res || {};
  return {
    items: Array.isArray(data.items) ? data.items : [],
    summary: data.summary || { totalEarned: 0, totalSpent: 0, currentBalance: 0 },
    pagination: data.pagination || { currentPage: 1, lastPage: 1, total: 0 },
  };
}

export async function getActiveMembershipTiers() {
  if (USE_USER_MOCK) return MOCK_ACTIVE_TIERS;

  const res = await apiFetch("/membership-tiers/active");
  const raw = res.data || res;
  const list = raw.data || raw;
  return Array.isArray(list) ? list : [];
}

export async function changePassword(payload) {
  const res = await apiFetch("/users/password", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return typeof res === "string"
    ? res
    : res?.message || "Password updated successfully";
}
