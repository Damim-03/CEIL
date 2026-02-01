import axiosInstance from "../axios";

export const adminDocumentsApi = {
  // 🔹 Get all documents
  getAll: async () => {
    try {
      const { data } = await axiosInstance.get("/admin/documents");

      // Log the response for debugging
      console.log("Documents API response:", data);

      return data;
    } catch (error: any) {
      console.error("Error in getAll:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },

  // 🔹 Get single document by ID
  getById: async (documentId: string) => {
    try {
      const { data } = await axiosInstance.get(
        `/admin/documents/${documentId}`,
      );

      console.log("Document API response:", data);

      return data;
    } catch (error: any) {
      console.error("Error in getById:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },

  // 🔹 Delete document
  delete: async (documentId: string) => {
    try {
      const { data } = await axiosInstance.delete(
        `/admin/documents/${documentId}`,
      );

      console.log("Delete API response:", data);

      return data;
    } catch (error: any) {
      console.error("Error in delete:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      throw error;
    }
  },

  // 🔹 Review document (Approve/Reject)
  review: async (documentId: string, status: "APPROVED" | "REJECTED") => {
    try {
      const { data } = await axiosInstance.patch(
        `/admin/documents/${documentId}/review`,
        { status },
      );

      console.log("Review API response:", data);

      return data;
    } catch (error: any) {
      console.error("Error in review:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data,
        },
      });
      throw error;
    }
  },
};
