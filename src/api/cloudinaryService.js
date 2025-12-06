// src/api/cloudinaryService.js
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const FOLDER = import.meta.env.VITE_CLOUDINARY_FOLDER || "movie-posters";

export async function uploadPoster(file) {
  if (!file) throw new Error("No file provided");

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", FOLDER);

  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("Cloudinary upload error:", data);
    throw new Error(data.error?.message || "Upload poster thất bại");
  }

  // Quan trọng: trả về đúng 2 field 
  return {
    posterUrl: data.secure_url,
    posterCloudinaryId: data.public_id,
  };
}
