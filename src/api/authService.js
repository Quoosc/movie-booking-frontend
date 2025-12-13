// src/api/authService.js
import { apiFetch } from "./fetchConfig";

const STORAGE_KEYS = {
  user: "user",
  accessToken: "accessToken",
  refreshToken: "refreshToken",
};

function saveUserToStorage(user) {
  if (user) localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  else localStorage.removeItem(STORAGE_KEYS.user);
}

export function getStoredUser() {
  const raw = localStorage.getItem(STORAGE_KEYS.user);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  saveUserToStorage(user);
}

export function clearStoredUser() {
  saveUserToStorage(null);
  localStorage.removeItem(STORAGE_KEYS.accessToken);
  localStorage.removeItem(STORAGE_KEYS.refreshToken);
}

// ===== helpers =====
function normalizeRole(role) {
  if (!role) return null;
  const r = String(role).toUpperCase();
  return r.startsWith("ROLE_") ? r.replace("ROLE_", "") : r; 
}

function decodeJwtPayload(token) {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function roleFromJwt(token) {
  const p = decodeJwtPayload(token);
  return normalizeRole(p?.role || p?.userRole || p?.authorities?.[0] || null);
}

/** REGISTER */
export async function register({ fullName, email, phone, password }) {
  const body = {
    phoneNumber: phone || "",
    email,
    username: fullName,
    password,
    confirmPassword: password,
  };

  await apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });

  return { success: true };
}

/** LOGIN */
export async function login({ email, password }) {
  const res = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  const data = res?.data ?? res;

  const accessToken =
    data?.accessToken || data?.data?.accessToken || data?.user?.accessToken || null;

  const refreshToken =
    data?.refreshToken || data?.data?.refreshToken || data?.user?.refreshToken || null;

  const user =
    data?.user ||
    data?.data?.user ||
    (data?.userId || data?.user_id || data?.email ? data : null);

  if (accessToken) localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
  if (refreshToken) localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken);

  if (user) {
    saveUserToStorage({
      ...user,
      role: normalizeRole(user?.role || user?.userRole || null),
    });
  }

  return { success: true };
}

/** ME / PROFILE */
export async function me() {
  const res = await apiFetch("/users/profile");
  const raw = res?.data ?? res;

  const stored = getStoredUser();
  const token = localStorage.getItem(STORAGE_KEYS.accessToken);

  const role =
    normalizeRole(raw?.role || raw?.userRole) ||
    normalizeRole(stored?.role || stored?.userRole) ||
    roleFromJwt(token) ||
    null;

  const profile = {
    ...stored, 
    ...raw,
    role,
  };

  saveUserToStorage(profile);
  return profile;
}

/** LOGOUT */
export async function logout() {
  clearStoredUser();
  try {
    await apiFetch("/auth/logout", { method: "POST" });
  } catch {}
}

/** LOGOUT ALL */
export async function logoutAll(email) {
  await apiFetch(`/auth/logout-all?email=${encodeURIComponent(email)}`, {
    method: "POST",
  });
}

/** REFRESH */
export async function refreshToken() {
  const res = await apiFetch("/auth/refresh", { method: "GET" });

  const payload = res?.data ?? res;
  const accessToken =
    payload?.accessToken ||
    payload?.data?.accessToken ||
    payload?.user?.accessToken ||
    null;

  if (accessToken) localStorage.setItem(STORAGE_KEYS.accessToken, accessToken);
  return true;
}
