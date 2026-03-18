import { apiClient } from "./client";

export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await apiClient.post("/auth/login", { email, password });
    return data;
  },

  logout: async () => {
    const { data } = await apiClient.post("/auth/logout");
    return data;
  },

  me: async () => {
    const { data } = await apiClient.get("/auth/me");
    return data;
  },

  refresh: async () => {
    const { data } = await apiClient.post("/auth/refresh");
    return data;
  },
};