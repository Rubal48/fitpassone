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
      // Optional debug:
      // console.log("[ADMIN API] attaching token", adminToken.slice(0, 15));
    } else {
      // Optional debug:
      // console.log("[ADMIN API] no adminToken in localStorage");
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
