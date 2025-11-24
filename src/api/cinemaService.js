// src/api/cinemaService.js


// import { apiFetch, USE_MOCK } from "./fetchConfig";

const USE_MOCK = true;

const MOCK_CINEMAS = [
  {
    cinema_id: "c1",
    name: "CinesVerse Quốc ProPlayer (Q.1)",
    address: "271 Nguyễn Trãi, Quận 1, TP.HCM",
    city: "TP.HCM",
    district: "Quận 1",
    heroImageUrl: "/public/cinemas/quoc-pro-hero.jpg",
    thumbnailUrl: "/public/cinemas/quoc-pro-thumb.jpg",
  },
  {
    cinema_id: "c2",
    name: "CinesVerse Hai Bà Trưng (Q.3)",
    address: "135 Hai Bà Trưng, Quận 3, TP.HCM",
    city: "TP.HCM",
    district: "Quận 3",
    heroImageUrl: "/public/cinemas/hai-ba-trung-hero.jpg",
    thumbnailUrl: "/public/cinemas/hai-ba-trung-thumb.jpg",
  },
  {
    cinema_id: "c3",
    name: "CinesVerse Huỳnh Tấn Phát (Q.7)",
    address: "126 Huỳnh Tấn Phát, Quận 7, TP.HCM",
    city: "TP.HCM",
    district: "Quận 7",
    heroImageUrl: "/public/cinemas/huynh-tan-phat-hero.jpg",
    thumbnailUrl: "/public/cinemas/huynh-tan-phat-thumb.jpg",
  },
  {
    cinema_id: "c4",
    name: "CinesVerse Bình Dương",
    address: "Khu đô thị mới, Thủ Dầu Một, Bình Dương",
    city: "Bình Dương",
    district: "Thủ Dầu Một",
    heroImageUrl: "/public/cinemas/binh-duong-hero.jpg",
    thumbnailUrl: "/public/cinemas/binh-duong-thumb.jpg",
  },
];

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

  // const res = await apiFetch("/cinemas");
  // const data = res.data || res;
  // return (data || []).map(mapCinema);
}

/** GET /cinemas/{id} – chi tiết 1 rạp */
export async function getCinemaById(id) {
  if (USE_MOCK) {
    const found = MOCK_CINEMAS.find((c) => String(c.cinema_id) === String(id));
    return found ? mapCinema(found) : null;
  }

  // const res = await apiFetch(`/cinemas/${id}`);
  // const data = res.data || res;
  // return mapCinema(data);
}
