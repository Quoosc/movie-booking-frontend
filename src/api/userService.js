import { apiFetch } from "./fetchConfig";

const USE_USER_MOCK = false; // <--- bật mock để test UI

const MOCK_PROFILE = {
  userId: "mock-user-1",
  email: "demo@cinestar.vn",
  username: "Đẳng Cấp",
  phoneNumber: "0912345678",
  avatarUrl: "/movies/proplayer.png",
  avatarCloudinaryId: "",
  loyaltyPoints: 1234,
  membershipTier: {
    membershipTierId: "tier-silver",
    name: "Silver",
    minPoints: 1000,
    discountType: "PERCENTAGE",
    discountValue: 10,
    description: "Giảm 10% giá vé",
    isActive: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  createdAt: "2025-01-01T10:00:00Z",
  updatedAt: "2025-11-24T15:35:27.490Z",
};

const MOCK_LOYALTY = {
  ...MOCK_PROFILE, // đủ loyaltyPoints + membershipTier
};

const MOCK_ACTIVE_TIERS = [
  {
    membershipTierId: "tier-bronze",
    name: "Bronze",
    minPoints: 0,
    discountType: "PERCENTAGE",
    discountValue: 5,
    description: "5% discount",
    isActive: true,
    createdAt: "2024-11-17T10:00:00",
    updatedAt: "2024-11-17T10:00:00",
  },
  {
    membershipTierId: "tier-silver",
    name: "Silver",
    minPoints: 1000,
    discountType: "PERCENTAGE",
    discountValue: 10,
    description: "10% discount",
    isActive: true,
    createdAt: "2024-11-17T10:00:00",
    updatedAt: "2024-11-17T10:00:00",
  },
  {
    membershipTierId: "tier-gold",
    name: "Gold",
    minPoints: 5000,
    discountType: "PERCENTAGE",
    discountValue: 15,
    description: "15% discount",
    isActive: true,
    createdAt: "2024-11-17T10:00:00",
    updatedAt: "2024-11-17T10:00:00",
  },
];

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
