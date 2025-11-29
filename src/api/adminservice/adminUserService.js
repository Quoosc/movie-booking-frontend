// src/api/adminservice/adminUserService.js
import { apiFetch } from "../fetchConfig";

/* ===================== CURRENT USER (PROFILE / LOYALTY) ===================== */

export async function getMyProfile() {
  const res = await apiFetch("/users/profile");
  return res; // UserProfileResponse
}

export async function updateMyProfile(payload) {
  const res = await apiFetch("/users/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return res; // UserProfileResponse
}

export async function changeMyPassword(payload) {
  // payload: { currentPassword, newPassword, confirmPassword }
  const res = await apiFetch("/users/password", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return res; // string (message)
}

export async function getMyLoyaltyInfo() {
  const res = await apiFetch("/users/loyalty");
  return res; // UserLoyaltyResponse (giống profile nhưng focus loyalty)
}

/* ===================== USER MANAGEMENT (ADMIN) ===================== */

export async function getUsers() {
  const res = await apiFetch("/users");
  return res; // List<UserDataResponse>
}

export async function getUserById(userId) {
  const res = await apiFetch(`/users/${userId}`);
  return res;
}

export async function deleteUser(userId) {
  const res = await apiFetch(`/users/${userId}`, {
    method: "DELETE",
  });
  return res; // string (OK / message)
}

/**
 * Cập nhật role cho user:
 * body là string "ADMIN" / "USER" / "GUEST"
 */
export async function updateUserRole(userId, role) {
  const res = await apiFetch(`/users/${userId}/role`, {
    method: "PATCH",
    // swagger: body là plain JSON string
    body: JSON.stringify(role),
  });
  return res; // UserDataResponse
}

/* ===================== MEMBERSHIP TIERS (ADMIN) ===================== */

export async function createMembershipTier(payload) {
  const res = await apiFetch("/membership-tiers", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res; // MembershipTierResponse
}

export async function updateMembershipTier(tierId, payload) {
  const res = await apiFetch(`/membership-tiers/${tierId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return res;
}

export async function deactivateMembershipTier(tierId) {
  const res = await apiFetch(`/membership-tiers/${tierId}/deactivate`, {
    method: "PATCH",
  });
  return res; // thường là 200 OK / empty, để FE tự handle
}

export async function deleteMembershipTier(tierId) {
  const res = await apiFetch(`/membership-tiers/${tierId}`, {
    method: "DELETE",
  });
  return res;
}

export async function getMembershipTierById(tierId) {
  const res = await apiFetch(`/membership-tiers/${tierId}`);
  return res;
}

export async function getMembershipTierByName(name) {
  const res = await apiFetch(`/membership-tiers/name/${name}`);
  return res;
}

export async function getMembershipTiers() {
  const res = await apiFetch("/membership-tiers");
  return res; // List<MembershipTierResponse>
}

export async function getActiveMembershipTiers() {
  const res = await apiFetch("/membership-tiers/active");
  return res;
}
