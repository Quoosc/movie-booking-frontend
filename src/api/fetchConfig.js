// src/api/fetchConfig.js
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "false";

export { USE_MOCK };

function getCookie(name) {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
  return null;
}

export async function apiFetch(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers || {}),
  };

  // Attach CSRF token header if cookie is present (e.g. Spring Security)
  try {
    const csrf = getCookie("XSRF-TOKEN") || getCookie("CSRF-TOKEN");
    if (csrf) {
      headers["X-XSRF-TOKEN"] = csrf;
      headers["X-CSRF-TOKEN"] = csrf;
    }
  } catch {
    // ignore if cookies not accessible
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    // Quan trọng: gửi cookie (access/refresh token) sang BE
    credentials: "include",
  });

  let data = null;
  try {
    if (res.status !== 204) {
      data = await res.json();
    }
  } catch {
    // ignore parse error nếu không phải JSON
  }

  if (!res.ok) {
    const message =
      data?.message || `API error ${res.status} ${res.statusText}`;
    throw new Error(message);
  }

  return data;
}
