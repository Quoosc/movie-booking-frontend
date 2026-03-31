// src/api/heroSlideService.js
import { apiFetch } from "./fetchConfig";

function normalizeListResponse(res) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  return [];
}

function mapSlide(item) {
  return {
    id: item.heroSlideId || item.hero_slide_id || item.id,
    title: item.title || "Hero Slide",
    altText: item.altText || item.alt_text || item.title || "Hero Slide",
    imageUrl: item.imageUrl || item.image_url || "",
    imageCloudinaryId:
      item.imageCloudinaryId || item.image_cloudinary_id || null,
    sortOrder: Number(item.sortOrder ?? item.sort_order ?? 0),
    isActive: Boolean(item.isActive ?? item.is_active ?? true),
  };
}

export async function getPublicHeroSlides() {
  const res = await apiFetch("/hero-slides");
  return normalizeListResponse(res).map(mapSlide);
}
