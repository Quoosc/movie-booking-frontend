// src/api/adminservice/adminUserService.js
import { apiFetch } from "../fetchConfig";

/* ===================== CURRENT USER (PROFILE / LOYALTY) ===================== */

export async function getMyProfile() {
  const res = await apiFetch("/users/profile");
  return res.data || res; // UserProfileResponse
}

export async function updateMyProfile(payload) {
  const res = await apiFetch("/users/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return res.data || res; // UserProfileResponse
}

export async function changeMyPassword(payload) {
  // payload: { currentPassword, newPassword, confirmPassword }
  const res = await apiFetch("/users/password", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return res.data || res; // string (message)
}

export async function getMyLoyaltyInfo() {
  const res = await apiFetch("/users/loyalty");
  return res.data || res; // UserLoyaltyResponse (giống profile nhưng focus loyalty)
}

/* ===================== USER MANAGEMENT (ADMIN) ===================== */

export async function getUsers() {
  const res = await apiFetch("/users");
  return res.data || res; // List<UserDataResponse>
}

export async function getUserById(userId) {
  const res = await apiFetch(`/users/${userId}`);
  return res.data || res;
}

export async function deleteUser(userId) {
  const res = await apiFetch(`/users/${userId}`, {
    method: "DELETE",
  });
  return true; // string (OK / message)
}

/**
 * Cập nhật role cho user:
 * body là string "ADMIN" / "USER" / "GUEST"
 */
//spring
// export async function updateUserRole(userId, role) {
//   const res = await apiFetch(`/users/${userId}/role`, {
//     method: "PATCH",
//     headers: {
//       "Content-Type": "text/plain",
//     },
//     body: role, // "ADMIN" | "USER"
//   });

//   return res.data || res; // UserDataResponse
// }

//laravel
export async function updateUserRole(userId, role) {
  const res = await apiFetch(`/users/${userId}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });

  return res.data || res;
}

/* ===================== MEMBERSHIP TIERS (ADMIN) ===================== */

export async function createMembershipTier(payload) {
  const res = await apiFetch("/membership-tiers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data || res; // MembershipTierResponse
}

export async function updateMembershipTier(tierId, payload) {
  const res = await apiFetch(`/membership-tiers/${tierId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return res.data || res;
}

export async function deactivateMembershipTier(tierId) {
  const res = await apiFetch(`/membership-tiers/${tierId}/deactivate`, {
    method: "PATCH",
  });
  return res.data || res; // thường là 200 OK / empty, để FE tự handle
}

export async function deleteMembershipTier(tierId) {
  const res = await apiFetch(`/membership-tiers/${tierId}`, {
    method: "DELETE",
  });
  return true;
}

export async function getMembershipTierById(tierId) {
  const res = await apiFetch(`/membership-tiers/${tierId}`);
  return res.data || res;
}

export async function getMembershipTierByName(name) {
  const res = await apiFetch(`/membership-tiers/name/${name}`);
  return res.data || res;
}

export async function getMembershipTiers() {
  const res = await apiFetch("/membership-tiers");
  return res.data || res; // List<MembershipTierResponse>
}

export async function getActiveMembershipTiers() {
  const res = await apiFetch("/membership-tiers/active");
  return res.data || res;
}
