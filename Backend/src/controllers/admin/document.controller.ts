import { Request, Response } from "express";
import { prisma } from "../../prisma/client";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";
import { DocumentStatus } from "../../../generated/prisma";

const ALLOWED_STATUSES: DocumentStatus[] = [
  DocumentStatus.APPROVED,
  DocumentStatus.REJECTED,
];

export const reviewDocumentController = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body as { status: DocumentStatus };

  const admin = (req as AuthenticatedRequest).user;

  // 1️⃣ Auth check
  if (!admin) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // 2️⃣ Validate status
  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({
      message: "Invalid status. Use APPROVED or REJECTED",
    });
  }

  // 3️⃣ Check document exists
  const document = await prisma.document.findUnique({
    where: { document_id: id },
  });

  if (!document) {
    return res.status(404).json({ message: "Document not found" });
  }

  // 4️⃣ Prevent re-review
  if (document.status !== DocumentStatus.PENDING) {
    return res.status(400).json({
      message: "Document has already been reviewed",
    });
  }

  // 5️⃣ Update review
  const updated = await prisma.document.update({
    where: { document_id: id },
    data: {
      status,
      reviewed_at: new Date(),
      reviewed_by: admin.user_id, // UUID ✔️
    },
  });

  return res.json({
    message: "Document reviewed successfully",
    document: updated,
  });
};
