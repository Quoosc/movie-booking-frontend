// src/api/cloudinaryService.js

// Environment variables - validated at runtime
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const FOLDER = import.meta.env.VITE_CLOUDINARY_FOLDER || "movie-posters";
const SNACKS_FOLDER = import.meta.env.VITE_CLOUDINARY_SNACKS_FOLDER || "snacks";
const AVATAR_FOLDER = import.meta.env.VITE_CLOUDINARY_SNACKS_FOLDER || "avatars";


// Debug logging (only in development)
if (import.meta.env.DEV) {
  console.log("[Cloudinary Debug] Environment variables check:");
  console.log("  CLOUD_NAME exists:", !!CLOUD_NAME);
  console.log("  UPLOAD_PRESET exists:", !!UPLOAD_PRESET);
  console.log("  FOLDER:", FOLDER);
  console.log("  SNACKS_FOLDER:", SNACKS_FOLDER);
}

/**
 * Validates required Cloudinary environment variables
 * @throws {Error} If required env vars are missing
 */
function validateCloudinaryConfig() {
  if (!CLOUD_NAME) {
    throw new Error(
      "❌ Missing Vercel environment variable: VITE_CLOUDINARY_CLOUD_NAME\n" +
        "Please add it in Vercel Dashboard → Project Settings → Environment Variables\n" +
        "Then redeploy your application."
    );
  }
  if (!UPLOAD_PRESET) {
    throw new Error(
      "❌ Missing Vercel environment variable: VITE_CLOUDINARY_UPLOAD_PRESET\n" +
        "Please add it in Vercel Dashboard → Project Settings → Environment Variables\n" +
        "Ensure the preset is configured as 'unsigned' in Cloudinary settings.\n" +
        "Then redeploy your application."
    );
  }
}

export async function uploadPoster(file) {
  // Validate configuration before attempting upload
  validateCloudinaryConfig();

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

  return {
    posterUrl: data.secure_url,
    posterCloudinaryId: data.public_id,
  };
}

export async function uploadSnackImage(file) {
  // Validate configuration before attempting upload
  validateCloudinaryConfig();

  if (!file) throw new Error("No file provided");

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", SNACKS_FOLDER);

  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) {
    console.error("Cloudinary upload error:", data);
    throw new Error(data.error?.message || "Upload snack image thất bại");
  }

  return {
    imageUrl: data.secure_url,
    imageCloudinaryId: data.public_id,
  };
}

export async function uploadAvatar(file) {
  validateCloudinaryConfig();
  if (!file) throw new Error("No file provided");

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", AVATAR_FOLDER);

  const res = await fetch(url, { method: "POST", body: formData });
  const data = await res.json();

  if (!res.ok) {
    console.error("Cloudinary upload error:", data);
    throw new Error(data.error?.message || "Upload avatar thất bại");
  }

  return {
    avatarUrl: data.secure_url,
    avatarCloudinaryId: data.public_id,
  };
}
