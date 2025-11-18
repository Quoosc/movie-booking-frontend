const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export { USE_MOCK };

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("access_token");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let data = null;
  try {
    if (res.status !== 204) {
      data = await res.json();
    }
  } catch {
    // ignore parse error
  }

  if (!res.ok) {
    const message =
      data?.message || `API error ${res.status} ${res.statusText}`;
    throw new Error(message);
  }

  return data;
}
