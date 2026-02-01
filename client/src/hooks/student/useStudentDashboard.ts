import { useQuery } from "@tanstack/react-query";
import type { StudentDashboardResponse } from "../../types/student";
import axiosInstance from "../../lib/api/axios";

export const useStudentDashboard = () => {
  return useQuery<StudentDashboardResponse>({
    queryKey: ["student-dashboard"],
    queryFn: async () => {
      const { data } = await axiosInstance.get<StudentDashboardResponse>(
        "/students/me/dashboard",
      );
      return data;
    },
  });
};
