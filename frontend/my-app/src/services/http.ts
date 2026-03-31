import axios from "axios";

export const API_BASE =
  (import.meta.env.VITE_API_BASE as string | undefined) ?? "http://localhost:5000";

export const http = axios.create({
  baseURL: API_BASE.replace(/\/+$/, ""),
  timeout: 20000,
  // THÊM DÒNG NÀY VÀO:
  headers: {
    "ngrok-skip-browser-warning": "true",
  },
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
    // Đảm bảo header skip warning cũng có mặt trong interceptor nếu cần
    config.headers["ngrok-skip-browser-warning"] = "true";
  }
  return config;
});
