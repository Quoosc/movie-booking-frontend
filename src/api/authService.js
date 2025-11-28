// src/api/authService.js
import { apiFetch, USE_MOCK } from "./fetchConfig";
import * as mockAuth from "./mockAuthService";

const STORAGE_KEYS = {
  access: "access_token",
  refresh: "refresh_token",
  user: "user",
};

function saveAuthToStorage({ accessToken, refreshToken, user }) {
  if (accessToken) localStorage.setItem(STORAGE_KEYS.access, accessToken);
  if (refreshToken) localStorage.setItem(STORAGE_KEYS.refresh, refreshToken);
  if (user) localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
}

export function getStoredUser() {
  const raw = localStorage.getItem(STORAGE_KEYS.user);
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * LOGIN
 * body: { email, password }
 * v2.4: trả về { accessToken, refreshToken?, user }
 */
export async function login({ email, password }) {
  if (USE_MOCK) {
    // dùng mockAuthService v2.0
    const loginRes = await mockAuth.login({ email, password });
    const meRes = await mockAuth.me(loginRes.access_token);

    const accessToken = loginRes.access_token;
    const refreshToken = loginRes.refresh_token;
    const user = meRes.data;

    saveAuthToStorage({ accessToken, refreshToken, user });
    return { accessToken, refreshToken, user };
  }

  const res = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  // hỗ trợ 2 kiểu: { code, message, data } hoặc { accessToken, ... }
  const data = res.data || res;
  const { accessToken, refreshToken, user } = data || {};

  if (!accessToken || !user) {
    throw new Error("Phản hồi đăng nhập không hợp lệ từ server");
  }

  saveAuthToStorage({ accessToken, refreshToken, user });
  return data;
}

/**
 * REGISTER
 * body: { name, email, password, phone? }
 */
export async function register(payload) {
  if (USE_MOCK) {
    return mockAuth.register(payload);
  }

  const res = await apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return res.data || res; // { code, message, data? }
}

/**
 * LẤY PROFILE HIỆN TẠI (me)
 * v2.4: dùng /users/profile
 */
export async function me() {
  if (USE_MOCK) {
    // mock: đã có sẵn
    return mockAuth.me();
  }

  const res = await apiFetch("/users/profile");
  // chuẩn hoá trả về { data: user } cho AuthContext xài
  if (res?.data) return { data: res.data };
  return { data: res };
}

/**
 * VERIFY ACCOUNT (nếu có)
 */
export async function verifyAccount({ email, codeId }) {
  if (USE_MOCK) {
    return mockAuth.verifyAccount({ email, codeId });
  }

  const res = await apiFetch("/auth/verify", {
    method: "POST",
    body: JSON.stringify({ email, code: codeId }),
  });

  return res.data || res;
}

/**
 * RESEND VERIFY CODE
 */
export async function resendCode({ email }) {
  if (USE_MOCK) {
    return mockAuth.resendCode({ email });
  }

  const res = await apiFetch("/auth/resend-code", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

  return res.data || res;
}

/**
 * LOGOUT
 */
export async function logout() {
  // clear local trước
  localStorage.removeItem(STORAGE_KEYS.access);
  localStorage.removeItem(STORAGE_KEYS.refresh);
  localStorage.removeItem(STORAGE_KEYS.user);

  if (USE_MOCK) {
    try {
      await mockAuth.logout();
    } catch {
      // ignore
    }
    return;
  }

  try {
    await apiFetch("/auth/logout", { method: "POST" });
  } catch {
    // bỏ qua lỗi logout (token hết hạn, v.v.)
  }
}

/**
 * REFRESH TOKEN
 */
export async function refreshToken() {
  const storedRefresh = localStorage.getItem(STORAGE_KEYS.refresh);
  if (!storedRefresh) return null;

  if (USE_MOCK) {
    const res = await mockAuth.refreshToken();
    const accessToken = res.access_token || res.data?.accessToken;
    if (accessToken) {
      localStorage.setItem(STORAGE_KEYS.access, accessToken);
      return accessToken;
    }
    return null;
  }

  const res = await apiFetch("/auth/refresh-token", {
    method: "POST",
    body: JSON.stringify({ refreshToken: storedRefresh }),
  });

  const data = res.data || res;
  const { accessToken, refreshToken } = data || {};

  if (accessToken) {
    localStorage.setItem(STORAGE_KEYS.access, accessToken);
  }
  if (refreshToken) {
    localStorage.setItem(STORAGE_KEYS.refresh, refreshToken);
  }

  return accessToken || null;
}
