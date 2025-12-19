// src/api/fetchConfig.js
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
  export const OAUTH_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

export const USE_MOCK =
  String(import.meta.env.VITE_USE_MOCK || "false") === "true";

const AUTH_MODE = (import.meta.env.VITE_AUTH_MODE || "auto").toLowerCase();

const TOKEN_KEYS = ["accessToken", "access_token", "token"];

function getCookie(name) {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

function getStoredAccessToken() {
  try {
    // ưu tiên token lưu riêng
    for (const k of TOKEN_KEYS) {
      const t = localStorage.getItem(k);
      if (t) return t;
    }

    // fallback: token nằm trong user object
    const rawUser =
      localStorage.getItem("user") || localStorage.getItem("auth");
    if (rawUser) {
      const obj = JSON.parse(rawUser);
      return (
        obj?.accessToken ||
        obj?.access_token ||
        obj?.token ||
        obj?.data?.accessToken ||
        obj?.data?.token ||
        obj?.user?.accessToken ||
        obj?.user?.token ||
        null
      );
    }
  } catch {
    // ignore
  }
  return null;
}

function shouldAttachBearer() {
  if (AUTH_MODE === "bearer") return true;
  if (AUTH_MODE === "cookie") return false;

  // auto: Laravel thường chạy :8000, Spring thường :8080
  try {
    const u = new URL(API_BASE_URL);
    return u.port === "8000";
  } catch {
    return false;
  }
}

export async function apiFetch(path, options = {}) {
  const headers = {
    Accept: "application/json",
    ...(options.headers || {}),
  };

  // auto JSON
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
  } else {
    // FormData thì để browser tự set boundary
    delete headers["Content-Type"];
  }

  // CSRF (Spring / Laravel sanctum nếu dùng)
  try {
    const csrf = getCookie("XSRF-TOKEN") || getCookie("CSRF-TOKEN");
    if (csrf) {
      headers["X-XSRF-TOKEN"] = csrf;
      headers["X-CSRF-TOKEN"] = csrf;
    }
  } catch {}

  // JWT Bearer (Laravel)
  if (shouldAttachBearer()) {
    const token = getStoredAccessToken();
    if (token && !headers.Authorization && !headers.authorization) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include", // Spring cookie vẫn chạy, Laravel cũng không hại
  });

  let data = null;
  try {
    if (res.status !== 204) data = await res.json();
  } catch {}

  if (!res.ok) {
    const message =
      data?.message || `API error ${res.status} ${res.statusText}`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}
