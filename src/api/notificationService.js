import { apiFetch } from "./fetchConfig";

export async function getNotifications(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "" && value !== undefined && value !== null && value !== false) params.set(key, String(value));
  });
  const query = params.toString();
  const res = await apiFetch(`/notifications${query ? `?${query}` : ""}`);
  const data = res?.data || res || {};
  return {
    items: Array.isArray(data.items) ? data.items : [],
    unreadCount: Number(data.unreadCount || 0),
    pagination: data.pagination || { currentPage: 1, lastPage: 1, total: 0 },
  };
}

export async function getUnreadNotificationCount() {
  const res = await apiFetch("/notifications/unread-count");
  return Number((res?.data || res)?.unreadCount || 0);
}

export async function markNotificationRead(notificationId) {
  return apiFetch(`/notifications/${notificationId}/read`, { method: "PATCH" });
}

export async function markAllNotificationsRead() {
  return apiFetch("/notifications/read-all", { method: "PATCH" });
}

export async function deleteNotification(notificationId) {
  return apiFetch(`/notifications/${notificationId}`, { method: "DELETE" });
}
