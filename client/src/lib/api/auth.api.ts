import axiosInstance from "./axios";

// ---------- TYPES ----------
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  gender?: string;
  phone_number?: string;
  nationality?: string;
  education_level?: string;
}

// ---------- API ----------
export const authApi = {
  login: async (payload: LoginPayload) => {
    const { data } = await axiosInstance.post("/auth/login", payload);
    return data; // sets cookies on backend
  },

  register: async (payload: RegisterPayload) => {
    const { data } = await axiosInstance.post("/auth/register", payload);
    return data;
  },

  me: async () => {
    const { data } = await axiosInstance.get("/auth/me");
    return data;
  },

  logout: async () => {
    await axiosInstance.post("/auth/logout");
  },

  // ✅ ADD THIS (next step ready)
  refresh: async () => {
    const { data } = await axiosInstance.post("/auth/refresh");
    return data;
  },
};
