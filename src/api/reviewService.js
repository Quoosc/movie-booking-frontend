import { apiFetch } from "./fetchConfig";

export async function getMovieReviews(movieId) {
  const res = await apiFetch(`/movies/${movieId}/reviews`);
  return res?.data || res || [];
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
