// src/api/fetchConfig.js
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

// TRUE khi muốn dùng mock (ví dụ trong một số service cụ thể)
const USE_MOCK = import.meta.env.VITE_USE_MOCK === "false";

export { USE_MOCK };

export async function apiFetch(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers || {}),
  };

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
