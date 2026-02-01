import { Request, Response, NextFunction } from "express";
import { prisma } from "../prisma/client";
import { AuthenticatedRequest } from "./auth.middleware";

export const requireCompletedProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = (req as AuthenticatedRequest).user;

  const student = await prisma.student.findUnique({
    where: { user_id: user.user_id },
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  const isComplete =
    student.first_name &&
    student.last_name &&
    student.date_of_birth &&
    student.gender &&
    student.phone_number &&
    student.nationality &&
    student.language &&
    student.education_level &&
    student.study_location;

  if (!isComplete) {
    return res.status(403).json({
      message: "Please complete your profile before enrollment",
    });
  }

  next();
};
