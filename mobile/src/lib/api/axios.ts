import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { authApi } from "./auth.api";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000/api";

export const SESSION_EXPIRED_EVENT = "session:expired";

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 15000,
});

let isRefreshing = false;
let queue: ((success: boolean) => void)[] = [];

const SKIP_REFRESH_URLS = [
  "/auth/me",
  "/auth/refresh",
  "/auth/login",
  "/auth/register",
  "/auth/logout",
];

// ── Request interceptor ───────────────────────────────────────────────────────
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("access_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else if (!config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ──────────────────────────────────────────────────────
axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl: string = originalRequest?.url || "";

    const isAuthEndpoint = SKIP_REFRESH_URLS.some((u) =>
      requestUrl.includes(u)
    );

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push((success) => {
            success ? resolve(axiosInstance(originalRequest)) : reject(error);
          });
        });
      }

      isRefreshing = true;
      try {
        const data = await authApi.refresh();
        // Save new tokens if returned
        if (data?.access_token) {
          await SecureStore.setItemAsync("access_token", data.access_token);
        }
        queue.forEach((cb) => cb(true));
        queue = [];
        return axiosInstance(originalRequest);
      } catch {
        queue.forEach((cb) => cb(false));
        queue = [];
        // Clear tokens on refresh failure
        await SecureStore.deleteItemAsync("access_token");
        await SecureStore.deleteItemAsync("refresh_token");
        // Emit session expired (handled by SessionGuard)
        sessionExpiredListeners.forEach((l) => l());
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// ── Session expired listeners (replaces window.dispatchEvent) ─────────────────
type Listener = () => void;
const sessionExpiredListeners: Listener[] = [];
export const onSessionExpired = (fn: Listener) => {
  sessionExpiredListeners.push(fn);
  return () => {
    const i = sessionExpiredListeners.indexOf(fn);
    if (i > -1) sessionExpiredListeners.splice(i, 1);
  };
};

export default axiosInstance;
