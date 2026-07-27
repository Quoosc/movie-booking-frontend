import { apiFetch } from "../fetchConfig";

export async function getReviewsForModeration(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "" && value !== undefined && value !== null && value !== false) params.set(key, String(value));
  });
  const query = params.toString();
  const res = await apiFetch(`/movies/reviews/moderation${query ? `?${query}` : ""}`);
  const data = res?.data || res || {};
  return {
    items: Array.isArray(data.items) ? data.items : [],
    pagination: data.pagination || { currentPage: 1, lastPage: 1, total: 0 },
  };
}

export async function moderateReview(reviewId, status, reason) {
  const res = await apiFetch(`/movies/reviews/${reviewId}/moderate`, {
    method: "PATCH",
    body: JSON.stringify({ status, reason }),
  });
  return res?.data || res;
}
