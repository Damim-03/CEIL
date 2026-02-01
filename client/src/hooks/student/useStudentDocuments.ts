import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { studentApi } from "../../lib/api/student/student.api";

const DOCUMENTS_KEY = ["student-documents"];

export const useStudentDocuments = () => {
  const qc = useQueryClient();

  const documentsQuery = useQuery({
    queryKey: DOCUMENTS_KEY,
    queryFn: studentApi.getDocuments,
  });

  const uploadDocuments = useMutation({
    mutationFn: studentApi.uploadDocuments,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DOCUMENTS_KEY });
    },
  });

  const deleteDocument = useMutation({
    mutationFn: studentApi.deleteDocument,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DOCUMENTS_KEY });
    },
  });

  return {
    ...documentsQuery,
    uploadDocuments,
    deleteDocument,
  };
};
