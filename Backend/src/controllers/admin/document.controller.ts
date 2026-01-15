import { Request, Response } from "express";
import { prisma } from "../../prisma/client";
import { AuthenticatedRequest } from "../../middlewares/auth.middleware";

const ALLOWED_STATUSES = ["APPROVED", "REJECTED"] as const;

export const reviewDocumentController = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params; // document_id
  const { status } = req.body as { status: string };

  const admin = (req as AuthenticatedRequest).user;

  // 1️⃣ Validate status
  if (!ALLOWED_STATUSES.includes(status as any)) {
    return res.status(400).json({
      message: "Invalid status. Use APPROVED or REJECTED",
    });
  }

  // 2️⃣ Check document exists
  const document = await prisma.document.findUnique({
    where: { document_id: id },
  });

  if (!document) {
    return res.status(404).json({ message: "Document not found" });
  }

  // 3️⃣ Update document review
  const updated = await prisma.document.update({
    where: { document_id: id },
    data: {
      status,
      reviewed_at: new Date(),
      reviewed_by: admin.user_id,
    },
  });

  return res.json({
    message: "Document reviewed successfully",
    document: updated,
  });
};
