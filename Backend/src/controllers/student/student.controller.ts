import { Request, Response } from "express";
import { prisma } from "../../prisma/client";
import streamifier from "streamifier";
import {
  AuthenticatedRequest,
  JwtUser,
} from "../../middlewares/auth.middleware";
import { REQUIRED_DOCUMENTS } from "../../constants/document.constants";
import { Level } from "../../../generated/prisma/client";
import cloudinary from "../../middlewares/cloudinary";

export const uploadToCloudinary = (
  file: Express.Multer.File,
  folder: string,
): Promise<{ secure_url: string; public_id: string }> => {
  return new Promise((resolve, reject) => {
    const isPdf = file.mimetype === "application/pdf";
    const isImage = file.mimetype.startsWith("image/");

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: isPdf || isImage ? "image" : "raw",
      },
      (error, result) => {
        if (error || !result) {
          reject(error);
        } else {
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        }
      },
    );

    streamifier.createReadStream(file.buffer).pipe(stream);
  });
};

export const getMyProfile = async (req: Request, res: Response) => {
  const student = await prisma.student.findFirst({
    where: {
      user: {
        user_id: req.user!.user_id,
      },
    },
    include: {
      group: true,
      documents: true,
      user: {
        select: {
          email: true,
          role: true,
          google_avatar: true, // ✅
        },
      },
    },
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  const isProfileComplete = Boolean(
    student.first_name &&
    student.last_name &&
    student.date_of_birth &&
    student.gender &&
    student.phone_number &&
    student.nationality &&
    student.language &&
    student.education_level &&
    student.study_location,
  );

  const approvedDocs = student.documents.filter((d) => d.status === "APPROVED");

  const isDocumentsComplete = approvedDocs.length === REQUIRED_DOCUMENTS.length;

  return res.json({
    ...student,
    email: student.user?.email,
    google_avatar: student.user?.google_avatar, // ✅
    is_profile_complete: isProfileComplete,
    is_documents_complete: isDocumentsComplete,
  });
};

export const updateMyStudentProfile = async (req: Request, res: Response) => {
  const user = (req as Request & { user?: JwtUser }).user;

  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const {
    first_name,
    last_name,
    date_of_birth,
    gender,
    phone_number,
    nationality,
    address,
    language,
    education_level,
    study_location,
  } = req.body;

  const updatedStudent = await prisma.student.update({
    where: { user_id: user.user_id },
    data: {
      first_name: first_name !== undefined ? first_name.trim() : undefined,
      last_name: last_name !== undefined ? last_name.trim() : undefined,
      phone_number: phone_number ?? undefined,
      nationality: nationality ?? undefined,
      gender: gender ?? undefined,
      address: address ?? undefined,
      language: language ?? undefined,
      education_level: education_level ?? undefined,
      study_location: study_location ?? undefined,
      date_of_birth: date_of_birth ? new Date(date_of_birth) : undefined,
    },
  });

  return res.json({
    message: "Profile updated successfully",
    student: updatedStudent,
  });
};

export const uploadDocumentsController = async (
  req: Request,
  res: Response,
) => {
  const user = (req as AuthenticatedRequest).user;
  const files = req.files as Record<string, Express.Multer.File[]>;

  // 1️⃣ At least one file required
  if (!files || Object.keys(files).length === 0) {
    return res.status(400).json({ message: "No documents uploaded" });
  }

  // 2️⃣ Get student
  const student = await prisma.student.findUnique({
    where: { user_id: user.user_id },
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  const createdDocuments = [];

  // 3️⃣ Loop required document types
  for (const type of REQUIRED_DOCUMENTS) {
    const file = files[type]?.[0];
    if (!file) continue;

    // prevent duplicate
    const exists = await prisma.document.findFirst({
      where: {
        student_id: student.student_id,
        type,
      },
    });

    if (exists) continue;

    // 🔥 رفع الملف إلى Cloudinary
    const uploadResult = await uploadToCloudinary(
      file,
      `students/${student.student_id}`,
    );

    const document = await prisma.document.create({
      data: {
        student_id: student.student_id,
        type,
        file_path: uploadResult.secure_url,
        public_id: uploadResult.public_id, // ✅ الآن موجود
      },
    });

    createdDocuments.push(document);
  }

  return res.status(201).json({
    message: "Documents uploaded successfully",
    documents: createdDocuments,
  });
};

export const getMyDocumentsController = async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;

  const student = await prisma.student.findUnique({
    where: { user_id: user.user_id },
    include: { documents: true },
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  return res.json(student.documents);
};

export const createEnrollmentController = async (
  req: Request,
  res: Response,
) => {
  const user = (req as AuthenticatedRequest).user;
  const { course_id, group_id, level } = req.body;

  // 1️⃣ Validate input
  if (!course_id || !level) {
    return res.status(400).json({
      message: "course_id and level are required",
    });
  }

  // 2️⃣ Validate level
  if (!Object.values(Level).includes(level)) {
    return res.status(400).json({
      message: "Invalid level",
      allowed: Object.values(Level),
    });
  }

  // 3️⃣ Get student
  const student = await prisma.student.findUnique({
    where: { user_id: user.user_id },
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  // 4️⃣ Prevent duplicate enrollment
  const exists = await prisma.enrollment.findFirst({
    where: {
      student_id: student.student_id,
      course_id,
    },
  });

  if (exists) {
    return res.status(409).json({
      message: "Already enrolled in this course",
    });
  }

  // 5️⃣ Create enrollment
  const enrollment = await prisma.enrollment.create({
    data: {
      student_id: student.student_id,
      course_id,
      group_id,
      level,
      registration_status: "Pending",
    },
  });

  return res.status(201).json({
    message: "Enrollment created successfully",
    enrollment,
  });
};

export const getMyEnrollmentsController = async (
  req: Request,
  res: Response,
) => {
  const user = (req as AuthenticatedRequest).user;

  const student = await prisma.student.findUnique({
    where: { user_id: user.user_id },
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { student_id: student.student_id },
    include: {
      course: true,
      group: true,
    },
    orderBy: { enrollment_date: "desc" },
  });

  return res.json(enrollments);
};

export const deleteMyDocumentController = async (
  req: Request,
  res: Response,
) => {
  const user = (req as AuthenticatedRequest).user;
  const { document_id } = req.params;

  // 1️⃣ Get document + ownership
  const document = await prisma.document.findFirst({
    where: {
      document_id,
      student: {
        user_id: user.user_id,
      },
    },
  });

  if (!document) {
    return res.status(404).json({ message: "Document not found" });
  }

  // 2️⃣ منع حذف الملفات المقبولة (اختياري لكن مهم)
  if (document.status === "APPROVED") {
    return res.status(403).json({
      message: "Approved documents cannot be deleted",
    });
  }

  // 3️⃣ حذف من Cloudinary
  if (document.public_id) {
    await cloudinary.uploader.destroy(document.public_id);
  }

  // 4️⃣ حذف من DB
  await prisma.document.delete({
    where: { document_id },
  });

  return res.json({
    message: "Document deleted successfully",
  });
};

export const getMyDashboardController = async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;

  if (!user?.user_id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const student = await prisma.student.findUnique({
    where: { user_id: user.user_id },
    include: { documents: true },
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  /* ================= PROFILE ================= */

  const profileFields = [
    student.first_name,
    student.last_name,
    student.phone_number,
    student.date_of_birth,
    student.gender,
    student.nationality,
    student.education_level,
    student.study_location,
    student.language,
  ];

  const completedFields = profileFields.filter(Boolean).length;
  const totalFields = profileFields.length;
  const percentage = Math.round((completedFields / totalFields) * 100);
  const isProfileComplete = percentage === 100;

  /* ================= DOCUMENTS ================= */

  const approved = student.documents.filter(
    (d) => d.status === "APPROVED",
  ).length;
  const pending = student.documents.filter(
    (d) => d.status === "PENDING",
  ).length;
  const rejected = student.documents.filter(
    (d) => d.status === "REJECTED",
  ).length;

  const uploadedTypes = new Set(student.documents.map((d) => d.type));
  const hasAllDocuments = REQUIRED_DOCUMENTS.every((type) =>
    uploadedTypes.has(type),
  );

  const isDocumentsComplete =
    hasAllDocuments && approved === REQUIRED_DOCUMENTS.length;

  /* ================= ENROLLMENT ================= */

  const isEnrollmentReady = isProfileComplete && isDocumentsComplete;

  return res.json({
    profile: {
      completedFields,
      totalFields,
      percentage,
      isComplete: isProfileComplete,
    },
    documents: {
      total: student.documents.length,
      approved,
      pending,
      rejected,
      isComplete: isDocumentsComplete,
    },
    enrollment: {
      isReady: isEnrollmentReady,
    },
  });
};
