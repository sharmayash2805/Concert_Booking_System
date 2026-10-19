import axios from "axios";

const backendBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api";

const API = axios.create({
  baseURL: backendBaseUrl,
  timeout: 3000, // Short timeout for snappy fallback
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;