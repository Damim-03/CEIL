import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { EventEmitter } from "eventemitter3";

// ─── Session event ────────────────────────────────────────────
export const sessionEvents = new EventEmitter();
export const SESSION_EXPIRED_EVENT = "session:expired";

const BASE_URL = "https://www.ceil-eloued.com/api";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 15000,
});

// ─── Endpoints مستثناة من الـ refresh ────────────────────────
const SKIP_REFRESH_URLS = [
  "/auth/me",
  "/auth/refresh",
  "/auth/login",
  "/auth/register",
  "/auth/logout",
];

let isRefreshing = false;
let queue: ((success: boolean) => void)[] = [];

// ── Request Interceptor ───────────────────────────────────────
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("ceil_access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else if (!config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response Interceptor ──────────────────────────────────────
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl: string = originalRequest?.url || "";

    const isAuthEndpoint = SKIP_REFRESH_URLS.some((url) =>
      requestUrl.includes(url),
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
            if (success) resolve(apiClient(originalRequest));
            else reject(error);
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = await AsyncStorage.getItem("ceil_refresh_token");

        // ✅ إذا ما عندك refresh token — أطلق الحدث مباشرة بدون محاولة
        if (!refreshToken) {
          sessionEvents.emit(SESSION_EXPIRED_EVENT);
          await clearTokens();
          return Promise.reject(error);
        }

        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
          token: refreshToken,
        });

        const newToken = data.accessToken;

        // ✅ تحقق أن الـ token موجود فعلاً
        if (!newToken) {
          throw new Error("No access token in refresh response");
        }

        await AsyncStorage.setItem("ceil_access_token", newToken);

        queue.forEach((cb) => cb(true));
        queue = [];

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch {
        queue.forEach((cb) => cb(false));
        queue = [];
        sessionEvents.emit(SESSION_EXPIRED_EVENT);
        await clearTokens();
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// ── Helper ────────────────────────────────────────────────────
async function clearTokens() {
  await Promise.all([
    AsyncStorage.removeItem("ceil_access_token"),
    AsyncStorage.removeItem("ceil_refresh_token"),
    AsyncStorage.removeItem("ceil_user"),
  ]);
}
