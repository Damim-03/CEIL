import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminTeachersApi } from "../../lib/api/admin/adminTeachers.api";

export const useAdminTeachers = () =>
  useQuery({
    queryKey: ["admin-teachers"],
    queryFn: adminTeachersApi.getAll,
  });

export const useAdminTeacher = (teacherId?: string) =>
  useQuery({
    queryKey: ["admin-teacher", teacherId],
    queryFn: () => adminTeachersApi.getById(teacherId!),
    enabled: !!teacherId,
  });

export const useDeleteTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminTeachersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-teachers"] });
    },
  });
};
