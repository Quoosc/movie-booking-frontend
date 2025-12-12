// src/api/authService.js
import { apiFetch } from "./fetchConfig";

const STORAGE_KEYS = {
  user: "user",
};

function saveUserToStorage(user) {
  if (user) {
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEYS.user);
  }
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
}

/**
 * ĐĂNG KÝ USER THƯỜNG
 * POST /auth/register
 */
export async function register({ fullName, email, phone, password }) {
  const body = {
    phoneNumber: phone || "",
    email,
    username: fullName, // map sang username của BE
    password,
    confirmPassword: password,
  };

  await apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });

  // 201 + body rỗng → chỉ cần không lỗi là OK
  return { success: true };
}

/**
 * LOGIN
 * POST /auth/login
 * BE set cookie accessToken + refreshToken, body rỗng
 */
export async function login({ email, password }) {
  await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  // cookie đã được set, FE sẽ tự gọi /users/profile để lấy user
  return { success: true };
}

/**
 * LẤY PROFILE HIỆN TẠI
 * (dùng cookie accessToken)
 */
export async function me() {
  const res = await apiFetch("/users/profile");
  const data = res.data || res;
  saveUserToStorage(data);
  return data;
}

/**
 * LOGOUT HIỆN TẠI
 * POST /auth/logout
 */
export async function logout() {
  saveUserToStorage(null);

  try {
    await apiFetch("/auth/logout", { method: "POST" });
  } catch {
    // token hết hạn thì bỏ qua
  }
}

/**
 * LOGOUT TẤT CẢ PHIÊN
 * POST /auth/logout-all?email=...
 */
export async function logoutAll(email) {
  await apiFetch(`/auth/logout-all?email=${encodeURIComponent(email)}`, {
    method: "POST",
  });
}

/**
 * REFRESH ACCESS TOKEN
 * GET /auth/refresh
 */
export async function refreshToken() {
  await apiFetch("/auth/refresh", { method: "GET" });
  // cookie đã được set lại → FE chỉ cần biết là thành công
  return true;
}
