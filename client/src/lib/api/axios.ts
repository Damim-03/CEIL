/* ===============================================================
   AXIOS INSTANCE - Fixed Interceptor
   
   ✅ FIX: Auth endpoints (/auth/me, /auth/refresh, etc.)
   are excluded from the refresh retry logic to prevent
   infinite 401 → refresh → 401 → refresh loops.
   
   This was the ROOT CAUSE of:
   - ProtectedRoute not redirecting (stuck in loading)
   - Login page flash before redirect
   - useMe() hanging forever on public pages
=============================================================== */

import axios from "axios";
import { authApi } from "./auth.api";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let queue: ((success: boolean) => void)[] = [];

// ✅ These endpoints should NEVER trigger a refresh attempt
const SKIP_REFRESH_URLS = [
  "/auth/me",
  "/auth/refresh",
  "/auth/login",
  "/auth/register",
  "/auth/logout",
];

// ── Request Interceptor ──────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      // Let browser set Content-Type with boundary for file uploads
      delete config.headers["Content-Type"];
    } else if (!config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response Interceptor ─────────────────────────────────────
axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = originalRequest?.url || "";

    // ✅ CRITICAL: Check if this is an auth endpoint
    const isAuthEndpoint = SKIP_REFRESH_URLS.some((url) =>
      requestUrl.includes(url),
    );

    // Only attempt refresh for non-auth 401 errors
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push((success) => {
            if (success) {
              resolve(axiosInstance(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      isRefreshing = true;

      try {
        await authApi.refresh();
        // Refresh succeeded — retry all queued requests
        queue.forEach((cb) => cb(true));
        queue = [];
        return axiosInstance(originalRequest);
      } catch {
        // Refresh failed — reject all queued requests
        queue.forEach((cb) => cb(false));
        queue = [];
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
