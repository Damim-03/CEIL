import axios from "axios";
import { authApi } from "./auth.api";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let queue: ((success: boolean) => void)[] = [];

// ✅ ADD THIS: Request Interceptor for FormData
axiosInstance.interceptors.request.use(
  (config) => {
    // ✅ CRITICAL: Handle FormData
    if (config.data instanceof FormData) {
      // Let browser set Content-Type with boundary
      delete config.headers["Content-Type"];
    } else if (!config.headers["Content-Type"]) {
      // For non-FormData requests, set JSON
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// ✅ EXISTING: Response Interceptor (keep as is)
axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

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
        queue.forEach((cb) => cb(true));
        queue = [];
        return axiosInstance(originalRequest);
      } catch {
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
