// src/api/cinemaService.js


import { apiFetch } from "./fetchConfig";

const USE_MOCK = false;

function mapCinema(c) {
  return {
    id: c.cinemaId || c.cinema_id || c.id,
    name: c.name,
    address: c.address || "",
    city: c.city || "",
    district: c.district || "",
    heroImageUrl:
      c.heroImageUrl ||
      c.hero_image_url ||
      c.imageUrl ||
      c.image_url ||
      "/public/cinemas/default-hero.jpg",
    thumbnailUrl:
      c.thumbnailUrl ||
      c.thumbnail_url ||
      c.imageUrl ||
      c.image_url ||
      "/public/cinemas/default-thumb.jpg",
  };
}

/** GET /cinemas – list tất cả rạp public */
export async function getAllCinemas() {
  if (USE_MOCK) {
    return MOCK_CINEMAS.map(mapCinema);
  }

  const res = await apiFetch("/cinemas");
  const data = res.data || res;
  return (data || []).map(mapCinema);
}

/** GET /cinemas/{id} – chi tiết 1 rạp */
export async function getCinemaById(id) {
  if (USE_MOCK) {
    const found = MOCK_CINEMAS.find((c) => String(c.cinema_id) === String(id));
    return found ? mapCinema(found) : null;
  }

  const res = await apiFetch(`/cinemas/${id}`);
  const data = res.data || res;
  return mapCinema(data);
}
