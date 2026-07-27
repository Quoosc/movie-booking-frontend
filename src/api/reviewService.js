import { apiFetch } from "./fetchConfig";

export async function getMovieReviews(movieId, filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "" && value !== undefined && value !== null && value !== false) {
      params.set(key, String(value));
    }
  });
  const query = params.toString();
  const res = await apiFetch(`/movies/${movieId}/reviews${query ? `?${query}` : ""}`);
  const data = res?.data || res || {};
  return {
    items: Array.isArray(data.items) ? data.items : Array.isArray(data) ? data : [],
    summary: data.summary || { average: null, total: 0, distribution: {} },
    pagination: data.pagination || { currentPage: 1, lastPage: 1, total: 0 },
  };
}

export async function submitMovieReview(movieId, payload) {
  const res = await apiFetch(`/movies/${movieId}/reviews`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function reactToReview(movieId, reviewId, reactionType) {
  const res = await apiFetch(`/movies/${movieId}/reviews/${reviewId}/react`, {
    method: "POST",
    body: JSON.stringify({ reactionType }),
  });
  return res?.data || res;
}

export async function replyToReview(movieId, reviewId, payload) {
  const res = await apiFetch(`/movies/${movieId}/reviews/${reviewId}/reply`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function updateMovieReview(movieId, reviewId, payload) {
  const res = await apiFetch(`/movies/${movieId}/reviews/${reviewId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return res?.data || res;
}

export async function deleteMovieReview(movieId, reviewId) {
  return apiFetch(`/movies/${movieId}/reviews/${reviewId}`, { method: "DELETE" });
}

export async function reportMovieReview(movieId, reviewId, payload) {
  return apiFetch(`/movies/${movieId}/reviews/${reviewId}/report`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
