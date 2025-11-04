// src/utils/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// ✅ Automatically attach user or admin token
API.interceptors.request.use((req) => {
  const user = localStorage.getItem("user");
  const adminToken = localStorage.getItem("adminToken");

  if (adminToken) {
    // Admin priority — admin routes will use this
    req.headers.Authorization = `Bearer ${adminToken}`;
  } else if (user) {
    // Regular user token
    req.headers.Authorization = `Bearer ${JSON.parse(user).token}`;
  }

  return req;
});

export default API;
