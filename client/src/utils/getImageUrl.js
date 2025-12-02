// src/utils/getImageUrl.js
import API from "./api";

const FALLBACK_IMAGE =
  "https://via.placeholder.com/600x400?text=Passiify+Gym";

export function getImageUrl(raw) {
  if (!raw) return FALLBACK_IMAGE;

  // If already a full URL (Cloudinary, etc.)
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw;
  }

  // If it's like "/uploads/gyms/xxx.jpg"
  const base = API.defaults?.baseURL || "";
  const cleanBase = base.replace(/\/+$/, "");
  const cleanPath = raw.replace(/^\/+/, "");

  return `${cleanBase}/${cleanPath}`;
}
