// src/api/adminservice/adminHeroSlideService.js
import { apiFetch } from "../fetchConfig";

function normalizeListResponse(res) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  return [];
}

function normalizeOneResponse(res) {
  if (!res) return null;
  if (res?.data?.heroSlideId || res?.data?.hero_slide_id) return res.data;
  if (res?.data?.data) return res.data.data;
  return res.data || res;
}

export async function getHeroSlides() {
  const res = await apiFetch("/hero-slides/admin");
  return normalizeListResponse(res);
}

export async function createHeroSlide(payload) {
  const res = await apiFetch("/hero-slides", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return normalizeOneResponse(res);
}

export async function updateHeroSlide(heroSlideId, payload) {
  const res = await apiFetch(`/hero-slides/${heroSlideId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return normalizeOneResponse(res);
}

export async function deleteHeroSlide(heroSlideId) {
  await apiFetch(`/hero-slides/${heroSlideId}`, {
    method: "DELETE",
  });
  return true;
}
