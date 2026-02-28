import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma/client";
import { AuthenticatedRequest } from "./auth.middleware";
import { REQUIRED_DOCUMENTS_BY_CATEGORY } from "../constants/document.constants";

type RegistrantCategory = "STUDENT" | "EXTERNAL" | "EMPLOYEE";

export const requireApprovedDocuments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = (req as AuthenticatedRequest).user;

  // 1️⃣ Get student with documents AND category
  const student = await prisma.student.findUnique({
    where: { user_id: user.user_id },
    include: { documents: true },
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  // 2️⃣ Determine the student's category (default to EXTERNAL if not set)
  const category: RegistrantCategory =
    (student.registrant_category as RegistrantCategory) || "EXTERNAL";

  // 3️⃣ Get required documents for this category
  const requirements = REQUIRED_DOCUMENTS_BY_CATEGORY[category];

  // If no requirements defined for this category, allow enrollment
  if (!requirements || requirements.length === 0) {
    return next();
  }

  // 4️⃣ Get approved document types
  const approvedTypes: string[] = student.documents
    .filter((doc) => doc.status === "APPROVED")
    .map((doc) => doc.type);

  // 5️⃣ Check missing required documents
  // Each requirement has `alternatives` — at least ONE must be approved
  const missing: { label: string; alternatives: string[] }[] = [];

  for (const req of requirements) {
    const satisfied = req.alternatives.some((type) =>
      approvedTypes.includes(type),
    );
    if (!satisfied) {
      missing.push({
        label: req.label,
        alternatives: req.alternatives,
      });
    }
  }

  if (missing.length > 0) {
    return res.status(403).json({
      message: "Required documents not approved",
      missing: missing.map((m) => m.alternatives.join(" | ")),
      missing_details: missing,
      category,
    });
  }

  // 6️⃣ All good
  next();
};
