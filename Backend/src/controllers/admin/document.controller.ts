// ================================================================
// 📌 src/controllers/admin/document.controller.ts
// ✅ Refactored: Uses DocumentService (Socket.IO inside service)
// ================================================================

import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";
import { DocumentStatus } from "../../../generated/prisma";
import * as DocumentService from "../../services/admin/Document.service";

export const reviewDocumentController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body as { status: DocumentStatus };
  const admin = (req as AuthenticatedRequest).user;

  if (!admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const result = await DocumentService.reviewDocument(
    id,
    status,
    admin.user_id,
  );

  if ("error" in result) {
    if (result.error === "invalid_status")
      return res
        .status(400)
        .json({ message: "Invalid status. Use APPROVED or REJECTED" });
    if (result.error === "not_found")
      return res.status(404).json({ message: "Document not found" });
    if (result.error === "already_reviewed")
      return res
        .status(400)
        .json({ message: "Document has already been reviewed" });
  }

  return res.json({
    message: "Document reviewed successfully",
    document: result.data,
  });
};
