// src/utils/api.js
import axios from "axios";

// ---------- BASE URL RESOLUTION (Dev vs Production) ----------

let baseURL = "http://localhost:5000/api"; // default for localhost dev

try {
  // ✅ Vite style: import.meta.env.VITE_API_BASE_URL
  if (
    typeof import.meta !== "undefined" &&
    import.meta &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE_URL
  ) {
    baseURL = import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, "") + "/api";
  }
  // ✅ CRA style: process.env.REACT_APP_API_BASE_URL
  else if (typeof process !== "undefined" && process.env.REACT_APP_API_BASE_URL) {
    baseURL = process.env.REACT_APP_API_BASE_URL.replace(/\/+$/, "") + "/api";
  }
  // ✅ No env set → choose based on where the app is running
  else if (typeof window !== "undefined") {
    const host = window.location.hostname;

    const isLocal =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host.startsWith("192.168.") ||
      host.endsWith(".local");

    // 🖥 Local dev → talk to local backend
    if (isLocal) {
      baseURL = "http://localhost:5000/api";
    } else {
      // 🌐 Production (Vercel / custom domain) → talk to Render backend
      baseURL = "https://passiify.onrender.com/api";
    }
  }
} catch (e) {
  // If anything weird happens, just stay with localhost (dev mode)
  baseURL = "http://localhost:5000/api";
}

console.log("[Passiify] API baseURL =", baseURL);

const API = axios.create({
  baseURL,
});

// ---------- INTERCEPTOR: ATTACH TOKENS ----------
API.interceptors.request.use(
  (config) => {
    const userToken = localStorage.getItem("token");
    const partnerToken = localStorage.getItem("partnerToken");
    const adminToken = localStorage.getItem("adminToken");

    const url = config.url || "";
    const isAdminRoute = url.startsWith("/admin") || url.startsWith("admin");

    // Make sure headers exists
    config.headers = {
      ...(config.headers || {}),
    };

    // 🔐 Admin routes use adminToken
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
