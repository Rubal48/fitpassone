// src/utils/api.js
import axios from "axios";

// -------------------------------------
// 🔗 BASE URL RESOLUTION (Dev vs Prod)
// -------------------------------------

const FALLBACK_LOCAL = "http://localhost:5000/api";
const FALLBACK_PROD = "https://passiify.onrender.com/api";

let baseURL = FALLBACK_LOCAL;

try {
  let rawBase = null;

  // ✅ Vite style: import.meta.env.VITE_API_BASE_URL
  if (
    typeof import.meta !== "undefined" &&
    import.meta &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE_URL
  ) {
    rawBase = import.meta.env.VITE_API_BASE_URL;
  }
  // ✅ CRA style: process.env.REACT_APP_API_BASE_URL
  else if (typeof process !== "undefined" && process.env.REACT_APP_API_BASE_URL) {
    rawBase = process.env.REACT_APP_API_BASE_URL;
  }

  if (rawBase) {
    // 🔥 IMPORTANT:
    // rawBase should be like "https://passiify.onrender.com"
    // We add "/api" here.
    baseURL = rawBase.replace(/\/+$/, "") + "/api";
  } else if (typeof window !== "undefined") {
    const host = window.location.hostname;

    const isLocal =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host.startsWith("192.168.") ||
      host.endsWith(".local");

    baseURL = isLocal ? FALLBACK_LOCAL : FALLBACK_PROD;
  }
} catch (e) {
  // Any weirdness → stay in local dev mode
  baseURL = FALLBACK_LOCAL;
}

console.log("[Passiify] API baseURL =", baseURL);

const API = axios.create({
  baseURL,
});

// -------------------------------------
// 🔐 INTERCEPTOR: ATTACH TOKENS
// -------------------------------------
API.interceptors.request.use(
  (config) => {
    const userToken = localStorage.getItem("token");
    const partnerToken = localStorage.getItem("partnerToken");
    const adminToken = localStorage.getItem("adminToken");

    const url = config.url || "";
    const isAdminRoute = url.startsWith("/admin") || url.startsWith("admin");

    config.headers = {
      ...(config.headers || {}),
    };

    // 👑 Admin routes → admin token
    if (isAdminRoute) {
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
      return config;
    }

    // 🤝 Partner routes
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

    if (isPartnerRoute) {
      if (partnerToken) {
        config.headers.Authorization = `Bearer ${partnerToken}`;
      } else if (userToken) {
        config.headers.Authorization = `Bearer ${userToken}`;
      }
      return config;
    }

    // 👤 Normal user routes
    if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
