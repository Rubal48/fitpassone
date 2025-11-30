// src/utils/api.js
import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

/**
 * 🌐 Default API for normal users & partners
 */
const API = axios.create({
  baseURL: BASE_URL,
});

// Attach user / partner token (NOT admin)
API.interceptors.request.use(
  (config) => {
    const userToken = localStorage.getItem("token");
    const partnerToken = localStorage.getItem("partnerToken");

    const url = config.url || "";
    const isAdminRoute = url.startsWith("/admin") || url.startsWith("admin");

    // Don't touch admin routes with this instance
    if (isAdminRoute) {
      return config;
    }

    // Partner protected routes
    const isPartnerRoute =
      url.startsWith("/gyms/me") ||
      url.startsWith("gyms/me") ||
      url.startsWith("/bookings") ||
      url.startsWith("bookings") ||
      url.startsWith("/events/host") ||
      url.startsWith("events/host") ||
      url.startsWith("/events/my") ||
      url.startsWith("events/my") ||
      url.startsWith("/event-bookings") ||
      url.startsWith("event-bookings");

    config.headers = {
      ...(config.headers || {}),
    };

    if (isPartnerRoute) {
      if (partnerToken) {
        config.headers.Authorization = `Bearer ${partnerToken}`;
      } else if (userToken) {
        config.headers.Authorization = `Bearer ${userToken}`;
      }
      return config;
    }

    // Normal user token
    if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ======================================
   MEDIA / ASSET URL HELPERS
   ====================================== */

// Root of backend: e.g. "https://passiify.onrender.com" or "http://localhost:5000"
const getBackendRoot = () => {
  const base = API?.defaults?.baseURL || BASE_URL || "";
  if (!base) return "";
  let root = base.replace(/\/$/, "");   // remove trailing slash
  root = root.replace(/\/api$/i, "");   // drop trailing /api
  return root;
};

// Only allow images that come from our backend (or old localhost data)
const normalizeImagePath = (rawPath) => {
  if (!rawPath) return null;

  let path = String(rawPath).trim();
  if (!path) return null;

  // If it's an absolute URL, only accept localhost or our backend host
  if (/^https?:\/\//i.test(path)) {
    const backendRoot = getBackendRoot();
    let backendHost = "";
    try {
      if (backendRoot) {
        backendHost = new URL(backendRoot).host;
      }
    } catch {
      backendHost = "";
    }

    try {
      const url = new URL(path);
      const isLocalhost =
        url.hostname === "localhost" || url.hostname === "127.0.0.1";
      const isBackendHost = backendHost && url.host === backendHost;

      if (isLocalhost || isBackendHost) {
        // Normalize to relative path like "/uploads/gyms/xxx.jpg"
        path = url.pathname + url.search + url.hash;
      } else {
        // External random image/CDN => ignore so UI uses our brand fallback
        return null;
      }
    } catch {
      return null;
    }
  }

  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  return path;
};

// 🔥 Use THIS everywhere on frontend when you render images from backend
export const getAssetUrl = (rawPath) => {
  const normalized = normalizeImagePath(rawPath);
  if (!normalized) return null;

  const root = getBackendRoot();
  if (!root) return normalized; // dev fallback

  return `${root}${normalized}`;
};

/**
 * 🛡️ Admin-only API — ALWAYS tries to send admin token
 */
export const adminAPI = axios.create({
  baseURL: BASE_URL,
});

adminAPI.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem("adminToken");

    config.headers = {
      ...(config.headers || {}),
    };

    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
      // console.log("[ADMIN API] attaching token", adminToken.slice(0, 15));
    } else {
      // console.log("[ADMIN API] no adminToken in localStorage");
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
