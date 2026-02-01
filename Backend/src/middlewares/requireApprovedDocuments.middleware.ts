import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma/client";
import { AuthenticatedRequest } from "./auth.middleware";
import { REQUIRED_DOCUMENTS } from "../constants/document.constants";

export const requireApprovedDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = (req as AuthenticatedRequest).user;

  // 1️⃣ Get student with documents
  const student = await prisma.student.findUnique({
    where: { user_id: user.user_id },
    include: { documents: true },
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  // 2️⃣ Get approved document types
  const approvedTypes: string[] = student.documents
    .filter((doc) => doc.status === "APPROVED")
    .map((doc) => doc.type);

  // 3️⃣ Check missing required documents
  const missing = REQUIRED_DOCUMENTS.filter(
    (type) => !approvedTypes.includes(type)
  );

  if (missing.length > 0) {
    return res.status(403).json({
      message: "Required documents not approved",
      missing,
    });
  }

  // 4️⃣ All good
  next();
};
