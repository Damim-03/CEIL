import { useQuery } from "@tanstack/react-query";
import axios from "../../lib/api/axios";

export interface AdminDashboardStats {
  students: number;
  teachers: number;
  courses: number;
  unpaidFees: number;
  gender: {
    Male?: number;
    Female?: number;
    Other?: number;
  };
}

export const useAdminDashboard = () =>
  useQuery<AdminDashboardStats>({
    queryKey: ["admin-dashboard"],
    queryFn: async () => {
      const { data } = await axios.get("/admin/dashboard/stats");
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
