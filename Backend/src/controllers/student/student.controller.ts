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

// ======================== HELPERS ========================

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

const LEVEL_ORDER: Record<Level, number> = {
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
};

const MAX_ACTIVE_ENROLLMENTS = 3;

// ======================== PROFILE ========================

export const getMyProfile = async (req: Request, res: Response) => {
  const student = await prisma.student.findFirst({
    where: {
      user: {
        user_id: req.user!.user_id,
      },
    },
    include: {
      // ✅ FIXED: Get groups via enrollments
      enrollments: {
        where: {
          registration_status: { in: ['VALIDATED', 'PAID', 'FINISHED'] },
          group_id: { not: null }
        },
        include: {
          group: true,
          course: true
        }
      },
      documents: true,
      user: {
        select: {
          email: true,
          role: true,
          google_avatar: true,
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
    google_avatar: student.user?.google_avatar,
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

  const parsedDOB =
    date_of_birth && !isNaN(Date.parse(date_of_birth))
      ? new Date(date_of_birth)
      : undefined;

  const updatedStudent = await prisma.student.update({
    where: { user_id: user.user_id },
    data: {
      first_name: first_name?.trim() || undefined,
      last_name: last_name?.trim() || undefined,
      phone_number: phone_number || undefined,
      nationality: nationality || undefined,
      gender: gender ? gender.toUpperCase() : undefined,
      address: address || undefined,
      language: language || undefined,
      education_level: education_level || undefined,
      study_location: study_location || undefined,
      date_of_birth: parsedDOB,
    },
  });

  return res.json({
    message: "Profile updated successfully",
    student: updatedStudent,
  });
};

// ======================== DOCUMENTS ========================

export const uploadDocumentsController = async (
  req: Request,
  res: Response,
) => {
  console.log('=== UPLOAD DEBUG START ===');
  console.log('1. User:', req.user);
  
  const user = (req as AuthenticatedRequest).user;
  
  if (!user) {
    console.log('❌ No user found in request');
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  console.log('✅ User authenticated:', user.user_id);
  
  console.log('2. req.files (raw):', req.files);
  console.log('3. typeof req.files:', typeof req.files);
  console.log('4. req.files is array?', Array.isArray(req.files));
  console.log('5. req.files is null?', req.files === null);
  console.log('6. req.files is undefined?', req.files === undefined);
  
  const files = req.files as Record<string, Express.Multer.File[]>;
  
  console.log('7. files after assertion:', files);
  console.log('8. files keys:', files ? Object.keys(files) : 'null');
  console.log('9. files keys length:', files ? Object.keys(files).length : 0);
  
  if (!files) {
    console.log('❌ files is null or undefined');
    return res.status(400).json({ message: "No documents uploaded - files is null" });
  }
  
  const fileKeys = Object.keys(files);
  console.log('10. File keys:', fileKeys);
  
  if (fileKeys.length === 0) {
    console.log('❌ files object is empty');
    return res.status(400).json({ message: "No documents uploaded - empty object" });
  }
  
  console.log('✅ Files received:', fileKeys.length, 'fields');
  
  const student = await prisma.student.findUnique({
    where: { user_id: user.user_id },
  });

  if (!student) {
    console.log('❌ Student not found for user:', user.user_id);
    return res.status(404).json({ message: "Student not found" });
  }
  
  console.log('✅ Student found:', student.student_id);

  const createdDocuments = [];
  const skippedDocuments = [];

  for (const type of REQUIRED_DOCUMENTS) {
    console.log(`\n--- Processing ${type} ---`);
    console.log('  Field exists in files?', type in files);
    console.log('  Field value:', files[type]);
    
    const file = files[type]?.[0];
    
    if (!file) {
      console.log(`  ⏭️  No file for ${type}`);
      continue;
    }
    
    console.log(`  ✅ File found:`, {
      fieldname: file.fieldname,
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    });

    const exists = await prisma.document.findFirst({
      where: {
        student_id: student.student_id,
        type,
      },
    });

    if (exists) {
      console.log(`  ⚠️  Document ${type} already exists`);
      skippedDocuments.push({ type, reason: "already_exists" });
      continue;
    }

    console.log(`  📤 Uploading ${type} to Cloudinary...`);
    const uploadResult = await uploadToCloudinary(
      file,
      `students/${student.student_id}`,
    );
    
    console.log(`  ✅ Uploaded to Cloudinary:`, uploadResult.secure_url);

    const document = await prisma.document.create({
      data: {
        student_id: student.student_id,
        type,
        file_path: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      },
    });
    
    console.log(`  ✅ Saved to database:`, document.document_id);

    createdDocuments.push(document);
  }

  console.log('\n=== UPLOAD SUMMARY ===');
  console.log('Created:', createdDocuments.length);
  console.log('Skipped:', skippedDocuments.length);
  console.log('=== UPLOAD DEBUG END ===\n');

  return res.status(201).json({
    message: "Documents uploaded successfully",
    documents: createdDocuments,
    skipped: skippedDocuments,
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

export const deleteMyDocumentController = async (
  req: Request,
  res: Response,
) => {
  const user = (req as AuthenticatedRequest).user;
  const { document_id } = req.params;

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

  if (document.status === "APPROVED") {
    return res.status(403).json({
      message: "Approved documents cannot be deleted",
    });
  }

  if (document.public_id) {
    await cloudinary.uploader.destroy(document.public_id);
  }

  await prisma.document.delete({
    where: { document_id },
  });

  return res.json({
    message: "Document deleted successfully",
  });
};

export const reuploadDocumentController = async (
  req: Request,
  res: Response,
) => {
  const user = (req as AuthenticatedRequest).user;
  const { document_id } = req.params;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const student = await prisma.student.findUnique({
    where: { user_id: user.user_id },
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  const document = await prisma.document.findFirst({
    where: {
      document_id,
      student_id: student.student_id,
    },
  });

  if (!document) {
    return res.status(404).json({ message: "Document not found" });
  }

  if (document.status !== "REJECTED") {
    return res.status(400).json({
      message: "Only rejected documents can be re-uploaded",
    });
  }

  if (document.public_id) {
    await cloudinary.uploader.destroy(document.public_id);
  }

  const uploadResult = await uploadToCloudinary(
    file,
    `students/${student.student_id}`,
  );

  const updatedDocument = await prisma.document.update({
    where: { document_id },
    data: {
      file_path: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      status: "PENDING",
      reviewed_at: null,
      reviewed_by: null,
      uploaded_at: new Date(),
    },
  });

  return res.json({
    message: "Document re-uploaded successfully",
    document: updatedDocument,
  });
};

// ======================== ENROLLMENT ========================

export const createEnrollmentController = async (
  req: Request,
  res: Response,
) => {
  const user = (req as AuthenticatedRequest).user;
  const { course_id, group_id, level } = req.body;

  if (!course_id) {
    return res.status(400).json({
      message: "course_id is required",
    });
  }

  const student = await prisma.student.findUnique({
    where: { user_id: user.user_id },
    include: {
      enrollments: {
        where: {
          registration_status: {
            in: ["PENDING", "VALIDATED", "PAID"],
          },
        },
      },
    },
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  if (student.enrollments.length >= MAX_ACTIVE_ENROLLMENTS) {
    return res.status(400).json({
      message: `You can only have ${MAX_ACTIVE_ENROLLMENTS} active enrollments at a time`,
      current_active: student.enrollments.length,
      max_allowed: MAX_ACTIVE_ENROLLMENTS,
    });
  }

  const course = await prisma.course.findUnique({
    where: { course_id },
  });

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

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

  let enrollmentGroupId: string | null = null;
  let enrollmentLevel: Level | null = level || null;

  if (group_id) {
    const group = await prisma.group.findUnique({
      where: { group_id },
      include: {
        _count: {
          select: {
            enrollments: {
              where: {
                registration_status: { in: ['VALIDATED', 'PAID', 'FINISHED'] }
              }
            }
          }
        }
      },
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.course_id !== course_id) {
      return res.status(400).json({
        message: "Group does not belong to this course",
      });
    }

    if (group.status === "FULL" || group._count.enrollments >= group.max_students) {
      return res.status(400).json({
        message: "Group is full",
      });
    }

    enrollmentGroupId = group_id;
    enrollmentLevel = group.level;
  }

  const enrollment = await prisma.enrollment.create({
    data: {
      student_id: student.student_id,
      course_id,
      group_id: enrollmentGroupId,
      level: enrollmentLevel,
      registration_status: "PENDING",
    },
    include: {
      course: true,
      group: true,
    },
  });

  return res.status(201).json({
    message: "Enrollment request sent",
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
      fees: true,
    },
    orderBy: { enrollment_date: "desc" },
  });

  const enrichedEnrollments = enrollments.map((enrollment) => {
    const totalFees = enrollment.fees.reduce(
      (sum, fee) => sum + Number(fee.amount),
      0,
    );
    const paidFees = enrollment.fees
      .filter((fee) => fee.status === "PAID")
      .reduce((sum, fee) => sum + Number(fee.amount), 0);

    return {
      ...enrollment,
      payment_summary: {
        total: totalFees,
        paid: paidFees,
        remaining: totalFees - paidFees,
        is_fully_paid: totalFees > 0 && paidFees >= totalFees,
      },
    };
  });

  return res.json(enrichedEnrollments);
};

export const cancelEnrollmentController = async (
  req: Request,
  res: Response,
) => {
  const user = (req as AuthenticatedRequest).user;
  const { enrollment_id } = req.params;

  const student = await prisma.student.findUnique({
    where: { user_id: user.user_id },
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      enrollment_id,
      student_id: student.student_id,
    },
    include: {
      fees: true,
    },
  });

  if (!enrollment) {
    return res.status(404).json({ message: "Enrollment not found" });
  }

  if (enrollment.registration_status === "FINISHED") {
    return res.status(400).json({
      message: "Cannot cancel a finished enrollment",
    });
  }

  const hasPaidFees = enrollment.fees.some((fee) => fee.status === "PAID");

  // ✅ FIXED: Just check group and reopen if needed
  if (enrollment.group_id) {
    const group = await prisma.group.findUnique({
      where: { group_id: enrollment.group_id },
    });

    if (group && group.status === "FULL") {
      await prisma.group.update({
        where: { group_id: enrollment.group_id },
        data: { status: "OPEN" },
      });
    }
  }

  await prisma.registrationHistory.create({
    data: {
      enrollment_id,
      old_status: enrollment.registration_status,
      new_status: "REJECTED",
      changed_by: user.user_id,
    },
  });

  await prisma.enrollment.delete({
    where: { enrollment_id },
  });

  return res.json({
    message: "Enrollment cancelled successfully",
    had_paid_fees: hasPaidFees,
    refund_note: hasPaidFees
      ? "Please contact administration for fee refund"
      : undefined,
  });
};

export const getEnrollmentDetailsController = async (
  req: Request,
  res: Response,
) => {
  const user = (req as AuthenticatedRequest).user;
  const { enrollment_id } = req.params;

  const student = await prisma.student.findUnique({
    where: { user_id: user.user_id },
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      enrollment_id,
      student_id: student.student_id,
    },
    include: {
      course: true,
      group: {
        include: {
          teacher: true,
          sessions: {
            orderBy: { session_date: "desc" },
            take: 5,
          },
        },
      },
      fees: {
        orderBy: { due_date: "asc" },
      },
      history: {
        orderBy: { changed_at: "desc" },
      },
    },
  });

  if (!enrollment) {
    return res.status(404).json({ message: "Enrollment not found" });
  }

  return res.json(enrollment);
};
// ======================== GROUPS ========================

export const joinGroupController = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { groupId } = req.body;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!groupId) {
      return res.status(400).json({ message: "groupId is required" });
    }

    const student = await prisma.student.findUnique({
      where: { user_id: user.user_id },
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // ✅ FIXED: Check via enrollments not student.group_id
    const group = await prisma.group.findUnique({
      where: { group_id: groupId },
      include: {
        _count: {
          select: {
            enrollments: {
              where: {
                registration_status: { in: ['VALIDATED', 'PAID', 'FINISHED'] }
              }
            }
          }
        }
      },
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.status !== "OPEN") {
      return res.status(400).json({ message: "Group is not open" });
    }

    const currentCount = group._count.enrollments;

    if (currentCount >= group.max_students) {
      return res.status(400).json({ message: "Group is full" });
    }

    const enrollment = await prisma.enrollment.findFirst({
      where: {
        student_id: student.student_id,
        course_id: group.course_id,
      },
    });

    if (!enrollment) {
      return res.status(400).json({
        message: "You must enroll in this course first",
      });
    }

    if (!["VALIDATED", "PAID"].includes(enrollment.registration_status)) {
      return res.status(400).json({
        message: "Enrollment must be validated first",
      });
    }

    if (enrollment.group_id) {
      return res.status(400).json({
        message: "You are already assigned to a group for this course",
        current_group_id: enrollment.group_id,
      });
    }

    // ✅ FIXED: Update enrollment, not student
    await prisma.enrollment.update({
      where: { enrollment_id: enrollment.enrollment_id },
      data: {
        group_id: groupId,
        level: group.level,
      },
    });

    if (currentCount + 1 >= group.max_students) {
      await prisma.group.update({
        where: { group_id: groupId },
        data: { status: "FULL" },
      });
    }

    return res.json({
      message: "Joined group successfully",
      group_id: group.group_id,
      group_name: group.name,
      level: group.level,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const leaveGroupController = async (req: Request, res: Response) => {
  try {
    const user = (req as AuthenticatedRequest).user;

    const student = await prisma.student.findUnique({
      where: { user_id: user.user_id },
    });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // ✅ FIXED: Find enrollment with group
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        student_id: student.student_id,
        group_id: { not: null },
        registration_status: { in: ['VALIDATED', 'PAID', 'FINISHED'] }
      },
    });

    if (!enrollment || !enrollment.group_id) {
      return res.status(400).json({
        message: "You are not in any group",
      });
    }

    const groupId = enrollment.group_id;

    // ✅ FIXED: Update enrollment, not student
    await prisma.enrollment.update({
      where: { enrollment_id: enrollment.enrollment_id },
      data: { group_id: null },
    });

    const group = await prisma.group.findUnique({
      where: { group_id: groupId },
    });

    if (group && group.status === "FULL") {
      await prisma.group.update({
        where: { group_id: groupId },
        data: { status: "OPEN" },
      });
    }

    return res.json({
      message: "Left group successfully",
      previous_group_id: groupId,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ======================== COURSES ========================

export const getCourseGroupsForStudents = async (
  req: Request,
  res: Response,
) => {
  const { courseId } = req.params;

  if (!courseId) {
    return res.status(400).json({ message: "courseId is required" });
  }

  const groups = await prisma.group.findMany({
    where: { course_id: courseId },
    include: {
      teacher: true,
      _count: {
        select: {
          enrollments: {
            where: {
              registration_status: { in: ['VALIDATED', 'PAID', 'FINISHED'] }
            }
          }
        },
      },
    },
    orderBy: {
      level: "asc",
    },
  });

  const formatted = groups.map((g) => {
    const current = g._count.enrollments;

    return {
      group_id: g.group_id,
      name: g.name,
      level: g.level,
      teacher: g.teacher
        ? {
            teacher_id: g.teacher.teacher_id,
            first_name: g.teacher.first_name,
            last_name: g.teacher.last_name,
          }
        : null,
      max_students: g.max_students,
      current_capacity: current,
      available_spots: g.max_students - current,
      status: current >= g.max_students ? "FULL" : "OPEN",
    };
  });

  return res.json(formatted);
};

export const getCoursesForStudents = async (req: Request, res: Response) => {
  try {
    const courses = await prisma.course.findMany({
      select: {
        course_id: true,
        course_name: true,
        course_code: true,
        credits: true,
        groups: {
          select: {
            group_id: true,
            level: true,
            max_students: true,
            status: true,
            _count: {
              select: {
                enrollments: {
                  where: {
                    registration_status: { in: ['VALIDATED', 'PAID', 'FINISHED'] }
                  }
                },
              },
            },
          },
        },
      },
      orderBy: {
        course_name: "asc",
      },
    });

    const formatted = courses.map((course) => {
      const groups = course.groups.map((g) => ({
        group_id: g.group_id,
        level: g.level,
        max_students: g.max_students,
        current_capacity: g._count.enrollments,
        available_spots: g.max_students - g._count.enrollments,
        status: g._count.enrollments >= g.max_students ? "FULL" : "OPEN",
      }));

      const totalSpots = groups.reduce((sum, g) => sum + g.max_students, 0);
      const totalEnrolled = groups.reduce(
        (sum, g) => sum + g.current_capacity,
        0,
      );
      const availableLevels = [...new Set(groups.map((g) => g.level))].sort(
        (a, b) => LEVEL_ORDER[a as Level] - LEVEL_ORDER[b as Level],
      );

      return {
        ...course,
        groups,
        summary: {
          total_groups: groups.length,
          total_spots: totalSpots,
          total_enrolled: totalEnrolled,
          available_spots: totalSpots - totalEnrolled,
          available_levels: availableLevels,
          has_open_groups: groups.some((g) => g.status === "OPEN"),
        },
      };
    });

    return res.json(formatted);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Failed to fetch courses",
    });
  }
};

// ======================== DASHBOARD ========================

export const getMyDashboardController = async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;

  if (!user?.user_id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const student = await prisma.student.findUnique({
    where: { user_id: user.user_id },
    include: {
      documents: true,
      enrollments: {
        include: {
          course: true,
          group: true,
          fees: true,
        },
        orderBy: { enrollment_date: "desc" },
      },
    },
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

  const fieldNames = [
    "first_name",
    "last_name",
    "phone_number",
    "date_of_birth",
    "gender",
    "nationality",
    "education_level",
    "study_location",
    "language",
  ];

  const missingFields = fieldNames.filter(
    (_, index) => !profileFields[index],
  );

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

  const missingDocuments = REQUIRED_DOCUMENTS.filter(
    (type) => !uploadedTypes.has(type),
  );

  const isDocumentsComplete =
    hasAllDocuments && approved === REQUIRED_DOCUMENTS.length;

  /* ================= ENROLLMENT ================= */

  const isEnrollmentReady = isProfileComplete && isDocumentsComplete;

  const activeEnrollments = student.enrollments.filter((e) =>
    ["PENDING", "VALIDATED", "PAID"].includes(e.registration_status),
  );

  // ✅ ملخص الرسوم
  const totalFees = student.enrollments
    .flatMap((e) => e.fees)
    .reduce((sum, fee) => sum + Number(fee.amount), 0);
  const paidFees = student.enrollments
    .flatMap((e) => e.fees)
    .filter((fee) => fee.status === "PAID")
    .reduce((sum, fee) => sum + Number(fee.amount), 0);

  // ✅ FIXED: Get current groups from enrollments
  const currentGroups = student.enrollments
    .filter(e => 
      e.group_id && 
      ['VALIDATED', 'PAID', 'FINISHED'].includes(e.registration_status)
    )
    .map(e => ({
      group_id: e.group?.group_id,
      name: e.group?.name,
      level: e.group?.level,
      course_name: e.course?.course_name,
    }))
    .filter(g => g.group_id);

  return res.json({
    profile: {
      completedFields,
      totalFields,
      percentage,
      isComplete: isProfileComplete,
      missingFields,
    },
    documents: {
      total: student.documents.length,
      approved,
      pending,
      rejected,
      missingDocuments,
      isComplete: isDocumentsComplete,
    },
    enrollment: {
      isReady: isEnrollmentReady,
      active_count: activeEnrollments.length,
      max_allowed: MAX_ACTIVE_ENROLLMENTS,
      can_enroll: isEnrollmentReady && activeEnrollments.length < MAX_ACTIVE_ENROLLMENTS,
      enrollments: activeEnrollments.map((e) => ({
        enrollment_id: e.enrollment_id,
        course_name: e.course?.course_name,
        group_name: e.group?.name,
        level: e.level,
        status: e.registration_status,
        enrollment_date: e.enrollment_date,
      })),
    },
    fees: {
      total: totalFees,
      paid: paidFees,
      remaining: totalFees - paidFees,
      is_fully_paid: totalFees > 0 && paidFees >= totalFees,
    },
    current_groups: currentGroups, // ✅ Array of groups, not single group
  });
};

// ======================== FEES ========================

export const getMyFeesController = async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;

  const student = await prisma.student.findUnique({
    where: { user_id: user.user_id },
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  const fees = await prisma.fee.findMany({
    where: { student_id: student.student_id },
    include: {
      enrollment: {
        include: {
          course: true,
        },
      },
    },
    orderBy: { due_date: "asc" },
  });

  const total = fees.reduce((sum, fee) => sum + Number(fee.amount), 0);
  const paid = fees
    .filter((f) => f.status === "PAID")
    .reduce((sum, fee) => sum + Number(fee.amount), 0);

  return res.json({
    fees,
    summary: {
      total,
      paid,
      remaining: total - paid,
      is_fully_paid: total > 0 && paid >= total,
    },
  });
};

// ======================== ATTENDANCE ========================

export const getMyAttendanceController = async (
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

  const attendance = await prisma.attendance.findMany({
    where: { student_id: student.student_id },
    include: {
      session: {
        include: {
          group: {
            include: {
              course: true,
            },
          },
        },
      },
    },
    orderBy: {
      session: {
        session_date: "desc",
      },
    },
  });

  const totalSessions = attendance.length;
  const presentCount = attendance.filter(
    (a) => a.status === "PRESENT",
  ).length;
  const absentCount = attendance.filter((a) => a.status === "ABSENT").length;
  const attendanceRate =
    totalSessions > 0
      ? Math.round((presentCount / totalSessions) * 100)
      : 0;

  return res.json({
    records: attendance,
    summary: {
      total_sessions: totalSessions,
      present: presentCount,
      absent: absentCount,
      attendance_rate: attendanceRate,
    },
  });
};

// ======================== RESULTS ========================

export const getMyResultsController = async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user;

  const student = await prisma.student.findUnique({
    where: { user_id: user.user_id },
  });

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  const results = await prisma.result.findMany({
    where: { student_id: student.student_id },
    include: {
      exam: {
        include: {
          course: true,
        },
      },
    },
    orderBy: {
      exam: {
        exam_date: "desc",
      },
    },
  });

  const totalExams = results.length;
  const averageScore =
    totalExams > 0
      ? Math.round(
          (results.reduce(
            (sum, r) => sum + (r.marks_obtained / r.exam.max_marks) * 100,
            0,
          ) /
            totalExams) *
            100,
        ) / 100
      : 0;

  return res.json({
    results,
    summary: {
      total_exams: totalExams,
      average_score: averageScore,
    },
  });
};