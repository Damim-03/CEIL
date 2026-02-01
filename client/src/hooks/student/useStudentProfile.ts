import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentApi } from "../../lib/api/student/student.api";

const ME_KEY = ["me"];
const PROFILE_KEY = ["student-profile"];

export const useStudentProfile = () => {
  const qc = useQueryClient();

  const profileQuery = useQuery({
    queryKey: PROFILE_KEY,
    queryFn: studentApi.getProfile,
  });

  const updateProfile = useMutation({
    mutationFn: studentApi.updateProfile,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROFILE_KEY });
      qc.invalidateQueries({ queryKey: ME_KEY });
    },
  });

  const uploadAvatar = useMutation({
    mutationFn: studentApi.uploadAvatar,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROFILE_KEY });
      qc.invalidateQueries({ queryKey: ME_KEY }); // 🔥 هذا المهم
    },
  });

  return {
    ...profileQuery,
    updateProfile,
    uploadAvatar,
  };
};
