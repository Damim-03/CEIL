// src/api/client.ts
import axios from "axios";
import * as SecureStore from "expo-secure-store";

const BASE_URL = "https://www.ceil-eloued.com/api";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor ──────────────────────────
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response interceptor (token refresh) ────────
apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = await SecureStore.getItemAsync("refreshToken");
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
          token: refresh,
        });
        await SecureStore.setItemAsync("accessToken", data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(original);
      } catch {
        await SecureStore.deleteItemAsync("accessToken");
        await SecureStore.deleteItemAsync("refreshToken");
        // سيتعامل معه AuthContext
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);