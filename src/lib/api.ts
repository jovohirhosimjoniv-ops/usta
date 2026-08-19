import axios from "axios";

export const api = axios.create({
  baseURL: "https://rest-production-388c.up.railway.app/api",
});

// Ochiq (token talab qilmaydigan) URL-lar ro'yxati
const PUBLIC_ENDPOINTS = ["/register/", "/login/", "/token/refresh/"];

api.interceptors.request.use(
  (config) => {
    // Agar so'rov ochiq URL-larga ketayotgan bo'lsa, Authorization header yubormaymiz
    const isPublic = PUBLIC_ENDPOINTS.some((url) => config.url?.endsWith(url));

    if (!isPublic) {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("access");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);