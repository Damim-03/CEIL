import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://www.ceil-eloued.com/api";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("ceil_access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = await AsyncStorage.getItem("ceil_refresh_token");
        const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
          token: refresh,
        });
        await AsyncStorage.setItem("ceil_access_token", data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(original);
      } catch {
        await AsyncStorage.removeItem("ceil_access_token");
        await AsyncStorage.removeItem("ceil_refresh_token");
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);