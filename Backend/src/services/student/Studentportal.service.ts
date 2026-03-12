// ================================================================
// 📦 src/services/student/Studentportal.service.ts
// ✅ Updated: Category-based document requirements
// ✅ Updated: BASICS level support
// ✅ FIXED: Robust registrant_category fallback (null-safe)
// ✅ CHANGED: is_profile_complete = رفع مستند واحد على الأقل
// ================================================================

import { prisma } from "../../prisma/client";
import {
  REQUIRED_DOCUMENTS_BY_CATEGORY,
  areDocumentsComplete,
  DOCUMENT_TYPES,
} from "../../constants/document.constants";
import type {
  RegistrantCategory,
  DocumentType,
} from "../../constants/document.constants";
import { Level } from "../../../generated/prisma/client";
import cloudinary from "../../middlewares/cloudinary";
import streamifier from "streamifier";
import {
  emitToAdminLevel,
  emitToUser,
  emitToGroup,
  triggerDashboardRefresh,
} from "../socket.service";

// ─── Constants ───────────────────────────────────────────
const LEVEL_ORDER: Record<Level, number> = {
  PRE_A1: 0,
  A1: 1,
  A2: 2,
  B1: 3,
  B2: 4,
  C1: 5,
};
const MAX_ACTIVE_ENROLLMENTS = 3;

const VALID_CATEGORIES: RegistrantCategory[] = [
  "STUDENT",
  "EXTERNAL",
  "EMPLOYEE",
];

// ─── Cloudinary Helper ───────────────────────────────────
export function uploadToCloudinaryStream(
  file: Express.Multer.File,
  folder: string,
): Promise<{ secure_url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    const isPdf = file.mimetype === "application/pdf";
    const isImage = file.mimetype.startsWith("image/");
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: isPdf || isImage ? "image" : "raw" },
      (error, result) => {
        if (error || !result) reject(error);
        else
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
      },
    );
    streamifier.createReadStream(file.buffer).pipe(stream);
  });
}

// ─── Helper: resolve student from user_id ────────────────
async function getStudentByUserId(userId: string) {
  return prisma.student.findUnique({ where: { user_id: userId } });
}

// ─── Helper: get registrant category (null-safe) ─────────
function getCategory(student: any): RegistrantCategory {
  const cat = student?.registrant_category;
  if (cat && VALID_CATEGORIES.includes(cat as RegistrantCategory)) {
    return cat as RegistrantCategory;
  }
  return "STUDENT";
}

// ══════════════════════════════════════════════
// 1. PROFILE
// ══════════════════════════════════════════════

export async function getProfile(userId: string) {
  const student = await prisma.student.findFirst({
    where: { user: { user_id: userId } },
    include: {
      enrollments: {
        where: {
          registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
          group_id: { not: null },
        },
        include: { group: true, course: true, pricing: true },
      },
      documents: true,
      user: { select: { email: true, role: true, google_avatar: true } },
    },
  });
  if (!student) return null;

  const category = getCategory(student);

  const uploadedTypes = student.documents.map((d) => d.type as DocumentType);
  const approvedTypes = student.documents
    .filter((d) => d.status === "APPROVED")
    .map((d) => d.type as DocumentType);
  const docCheck = areDocumentsComplete(category, uploadedTypes, approvedTypes);

  // ✅ CHANGED: اكتمال الملف = رفع مستند واحد على الأقل
  const isProfileComplete = student.documents.length > 0;

  return {
    ...student,
    email: student.user?.email,
    google_avatar: student.user?.google_avatar,
    registrant_category: category,
    is_profile_complete: isProfileComplete,
    is_documents_complete: docCheck.complete,
    missing_documents: docCheck.missing,
    required_documents: REQUIRED_DOCUMENTS_BY_CATEGORY[category],
  };
}

export async function updateProfile(userId: string, data: any) {
  const parsedDOB =
    data.date_of_birth && !isNaN(Date.parse(data.date_of_birth))
      ? new Date(data.date_of_birth)
      : undefined;

  const updateData: any = {
    first_name: data.first_name?.trim() || undefined,
    last_name: data.last_name?.trim() || undefined,
    phone_number: data.phone_number || undefined,
    nationality: data.nationality || undefined,
    gender: data.gender ? data.gender.toUpperCase() : undefined,
    address: data.address || undefined,
    language: data.language || undefined,
    education_level: data.education_level || undefined,
    study_location: data.study_location || undefined,
    date_of_birth: parsedDOB,
  };

  if (
    data.registrant_category &&
    VALID_CATEGORIES.includes(data.registrant_category)
  ) {
    updateData.registrant_category = data.registrant_category;
  }

  const updated = await prisma.student.update({
    where: { user_id: userId },
    data: updateData,
  });

  emitToAdminLevel("student:profileUpdated", {
    student_id: updated.student_id,
    name: `${updated.first_name} ${updated.last_name}`,
  });

  return updated;
}

// ══════════════════════════════════════════════
// 2. DOCUMENTS
// ══════════════════════════════════════════════

export async function uploadDocuments(
  userId: string,
  files: Record<string, Express.Multer.File[]>,
) {
  const student = await getStudentByUserId(userId);
  if (!student) return { error: "not_found" as const };

  const created: any[] = [];
  const skipped: any[] = [];

  const validTypes = DOCUMENT_TYPES as readonly string[];

  for (const type of Object.keys(files)) {
    if (!validTypes.includes(type)) {
      skipped.push({ type, reason: "invalid_type" });
      continue;
    }

    const file = files[type]?.[0];
    if (!file) continue;

    const exists = await prisma.document.findFirst({
      where: { student_id: student.student_id, type },
    });
    if (exists) {
      skipped.push({ type, reason: "already_exists" });
      continue;
    }

    const uploadResult = await uploadToCloudinaryStream(
      file,
      `students/${student.student_id}`,
    );
    const document = await prisma.document.create({
      data: {
        student_id: student.student_id,
        type,
        file_path: uploadResult.secure_url,
        public_id: uploadResult.public_id,
      },
    });
    created.push(document);
  }

  if (created.length > 0) {
    emitToAdminLevel("document:uploaded", {
      student_id: student.student_id,
      name: `${student.first_name} ${student.last_name}`,
      count: created.length,
      types: created.map((d) => d.type),
    });
    emitToUser(userId, "document:uploadComplete", {
      count: created.length,
      types: created.map((d) => d.type),
    });
  }

  return { data: { documents: created, skipped } };
}

export async function getDocuments(userId: string) {
  const student = await prisma.student.findUnique({
    where: { user_id: userId },
    include: { documents: true },
  });
  if (!student) return { error: "not_found" as const };

  const category = getCategory(student);
  const uploadedTypes = student.documents.map((d) => d.type as DocumentType);
  const approvedTypes = student.documents
    .filter((d) => d.status === "APPROVED")
    .map((d) => d.type as DocumentType);
  const docCheck = areDocumentsComplete(category, uploadedTypes, approvedTypes);

  return {
    data: {
      documents: student.documents,
      registrant_category: category,
      required_documents: REQUIRED_DOCUMENTS_BY_CATEGORY[category],
      is_complete: docCheck.complete,
      missing: docCheck.missing,
    },
  };
}

export async function deleteDocument(userId: string, documentId: string) {
  const document = await prisma.document.findFirst({
    where: { document_id: documentId, student: { user_id: userId } },
  });
  if (!document) return { error: "not_found" as const };
  if (document.status === "APPROVED")
    return {
      error: "forbidden" as const,
      message: "Approved documents cannot be deleted",
    };

  if (document.public_id) await cloudinary.uploader.destroy(document.public_id);
  await prisma.document.delete({ where: { document_id: documentId } });

  emitToAdminLevel("document:deleted", {
    document_id: documentId,
    student_id: document.student_id,
  });

  return { data: { message: "Document deleted successfully" } };
}

export async function reuploadDocument(
  userId: string,
  documentId: string,
  file: Express.Multer.File,
) {
  const student = await getStudentByUserId(userId);
  if (!student)
    return { error: "not_found" as const, message: "Student not found" };

  const document = await prisma.document.findFirst({
    where: { document_id: documentId, student_id: student.student_id },
  });
  if (!document)
    return { error: "not_found" as const, message: "Document not found" };
  if (document.status !== "REJECTED")
    return {
      error: "bad_request" as const,
      message: "Only rejected documents can be re-uploaded",
    };

  if (document.public_id) await cloudinary.uploader.destroy(document.public_id);

  const uploadResult = await uploadToCloudinaryStream(
    file,
    `students/${student.student_id}`,
  );
  const updated = await prisma.document.update({
    where: { document_id: documentId },
    data: {
      file_path: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      status: "PENDING",
      reviewed_at: null,
      reviewed_by: null,
      uploaded_at: new Date(),
    },
  });

  emitToAdminLevel("document:reuploaded", {
    document_id: documentId,
    student_id: student.student_id,
    name: `${student.first_name} ${student.last_name}`,
    type: document.type,
  });

  return { data: updated };
}

// ══════════════════════════════════════════════
// 3. ENROLLMENT
// ══════════════════════════════════════════════

export async function createEnrollment(
  userId: string,
  data: {
    course_id: string;
    group_id?: string;
    level?: Level;
    pricing_id?: string;
  },
) {
  if (!data.course_id)
    return { error: "validation" as const, message: "course_id is required" };

  const student = await prisma.student.findUnique({
    where: { user_id: userId },
    include: {
      enrollments: {
        where: {
          registration_status: { in: ["PENDING", "VALIDATED", "PAID"] },
        },
      },
    },
  });
  if (!student)
    return { error: "not_found" as const, message: "Student not found" };
  if (student.enrollments.length >= MAX_ACTIVE_ENROLLMENTS)
    return {
      error: "bad_request" as const,
      message: `You can only have ${MAX_ACTIVE_ENROLLMENTS} active enrollments`,
      current_active: student.enrollments.length,
      max_allowed: MAX_ACTIVE_ENROLLMENTS,
    };

  const course = await prisma.course.findUnique({
    where: { course_id: data.course_id },
    include: { profile: { include: { pricing: true } } },
  });
  if (!course)
    return { error: "not_found" as const, message: "Course not found" };

  const exists = await prisma.enrollment.findFirst({
    where: { student_id: student.student_id, course_id: data.course_id },
  });
  if (exists)
    return {
      error: "duplicate" as const,
      message: "Already enrolled in this course",
    };

  if (data.pricing_id) {
    const valid = course.profile?.pricing.find(
      (p) => p.pricing_id === data.pricing_id,
    );
    if (!valid)
      return { error: "bad_request" as const, message: "Invalid pricing_id" };
  }

  let enrollmentGroupId: string | null = null;
  let enrollmentLevel: Level | null = data.level || null;

  if (data.group_id) {
    const group = await prisma.group.findUnique({
      where: { group_id: data.group_id },
      include: {
        _count: {
          select: {
            enrollments: {
              where: {
                registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
              },
            },
          },
        },
      },
    });
    if (!group)
      return { error: "not_found" as const, message: "Group not found" };
    if (group.course_id !== data.course_id)
      return {
        error: "bad_request" as const,
        message: "Group does not belong to this course",
      };
    if (
      group.status === "FULL" ||
      group._count.enrollments >= group.max_students
    )
      return { error: "bad_request" as const, message: "Group is full" };
    enrollmentGroupId = data.group_id;
    enrollmentLevel = group.level;
  }

  const enrollment = await prisma.enrollment.create({
    data: {
      student_id: student.student_id,
      course_id: data.course_id,
      group_id: enrollmentGroupId,
      level: enrollmentLevel,
      pricing_id: data.pricing_id || null,
      registration_status: "PENDING",
    },
    include: {
      course: true,
      group: true,
      pricing: {
        select: {
          pricing_id: true,
          status_fr: true,
          status_ar: true,
          status_en: true,
          price: true,
          currency: true,
          discount: true,
        },
      },
    },
  });

  emitToAdminLevel("enrollment:created", {
    enrollment_id: enrollment.enrollment_id,
    student_id: student.student_id,
    student_name: `${student.first_name} ${student.last_name}`,
    course_name: course.course_name,
    course_id: data.course_id,
    status: "PENDING",
  });
  emitToUser(userId, "enrollment:created", {
    enrollment_id: enrollment.enrollment_id,
    course_name: course.course_name,
    status: "PENDING",
  });
  triggerDashboardRefresh("enrollment_created");

  return { data: enrollment };
}

export async function getEnrollments(userId: string) {
  const student = await getStudentByUserId(userId);
  if (!student) return { error: "not_found" as const };

  const enrollments = await prisma.enrollment.findMany({
    where: { student_id: student.student_id },
    include: {
      course: true,
      group: {
        include: {
          teacher: {
            select: {
              teacher_id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          department: {
            select: { department_id: true, name: true, description: true },
          },
          _count: {
            select: {
              enrollments: {
                where: {
                  registration_status: {
                    in: ["VALIDATED", "PAID", "FINISHED"],
                  },
                },
              },
            },
          },
        },
      },
      fees: true,
      pricing: {
        select: {
          pricing_id: true,
          status_fr: true,
          status_ar: true,
          status_en: true,
          price: true,
          currency: true,
          discount: true,
        },
      },
    },
    orderBy: { enrollment_date: "desc" },
  });

  return {
    data: enrollments.map((e) => {
      const totalFees = e.fees.reduce((sum, f) => sum + Number(f.amount), 0);
      const paidFees = e.fees
        .filter((f) => f.status === "PAID")
        .reduce((sum, f) => sum + Number(f.amount), 0);
      const group = e.group
        ? { ...e.group, _count: { students: e.group._count?.enrollments ?? 0 } }
        : null;
      return {
        ...e,
        group,
        payment_summary: {
          total: totalFees,
          paid: paidFees,
          remaining: totalFees - paidFees,
          is_fully_paid: totalFees > 0 && paidFees >= totalFees,
        },
      };
    }),
  };
}

export async function cancelEnrollment(userId: string, enrollmentId: string) {
  const student = await getStudentByUserId(userId);
  if (!student)
    return { error: "not_found" as const, message: "Student not found" };

  const enrollment = await prisma.enrollment.findFirst({
    where: { enrollment_id: enrollmentId, student_id: student.student_id },
    include: { fees: true, course: true },
  });
  if (!enrollment)
    return { error: "not_found" as const, message: "Enrollment not found" };
  if (enrollment.registration_status === "FINISHED")
    return {
      error: "bad_request" as const,
      message: "Cannot cancel a finished enrollment",
    };

  const hasPaidFees = enrollment.fees.some((f) => f.status === "PAID");

  if (enrollment.group_id) {
    const group = await prisma.group.findUnique({
      where: { group_id: enrollment.group_id },
    });
    if (group?.status === "FULL") {
      await prisma.group.update({
        where: { group_id: enrollment.group_id },
        data: { status: "OPEN" },
      });
    }
  }

  await prisma.registrationHistory.create({
    data: {
      enrollment_id: enrollmentId,
      old_status: enrollment.registration_status,
      new_status: "REJECTED",
      changed_by: userId,
    },
  });
  await prisma.enrollment.delete({ where: { enrollment_id: enrollmentId } });

  emitToAdminLevel("enrollment:cancelled", {
    enrollment_id: enrollmentId,
    student_id: student.student_id,
    student_name: `${student.first_name} ${student.last_name}`,
    course_name: enrollment.course?.course_name,
    old_status: enrollment.registration_status,
  });
  emitToUser(userId, "enrollment:cancelled", {
    enrollment_id: enrollmentId,
    course_name: enrollment.course?.course_name,
  });
  triggerDashboardRefresh("enrollment_cancelled");

  return {
    data: {
      message: "Enrollment cancelled successfully",
      had_paid_fees: hasPaidFees,
      refund_note: hasPaidFees
        ? "Please contact administration for fee refund"
        : undefined,
    },
  };
}

export async function getEnrollmentDetails(
  userId: string,
  enrollmentId: string,
) {
  const student = await getStudentByUserId(userId);
  if (!student) return { error: "not_found" as const };

  const enrollment = await prisma.enrollment.findFirst({
    where: { enrollment_id: enrollmentId, student_id: student.student_id },
    include: {
      course: true,
      group: {
        include: {
          teacher: true,
          sessions: { orderBy: { session_date: "desc" }, take: 5 },
        },
      },
      fees: { orderBy: { due_date: "asc" } },
      history: { orderBy: { changed_at: "desc" } },
      pricing: {
        select: {
          pricing_id: true,
          status_fr: true,
          status_ar: true,
          status_en: true,
          price: true,
          currency: true,
          discount: true,
        },
      },
    },
  });
  if (!enrollment) return { error: "not_found" as const };
  return { data: enrollment };
}

// ══════════════════════════════════════════════
// 4. GROUPS
// ══════════════════════════════════════════════

export async function joinGroup(userId: string, groupId: string) {
  if (!groupId)
    return { error: "validation" as const, message: "groupId is required" };

  const student = await getStudentByUserId(userId);
  if (!student)
    return { error: "not_found" as const, message: "Student not found" };

  const group = await prisma.group.findUnique({
    where: { group_id: groupId },
    include: {
      _count: {
        select: {
          enrollments: {
            where: {
              registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
            },
          },
        },
      },
    },
  });
  if (!group)
    return { error: "not_found" as const, message: "Group not found" };
  if (group.status !== "OPEN")
    return { error: "bad_request" as const, message: "Group is not open" };
  if (group._count.enrollments >= group.max_students)
    return { error: "bad_request" as const, message: "Group is full" };

  const enrollment = await prisma.enrollment.findFirst({
    where: { student_id: student.student_id, course_id: group.course_id },
  });
  if (!enrollment)
    return {
      error: "bad_request" as const,
      message: "You must enroll in this course first",
    };
  if (!["VALIDATED", "PAID"].includes(enrollment.registration_status))
    return {
      error: "bad_request" as const,
      message: "Enrollment must be validated first",
    };
  if (enrollment.group_id)
    return {
      error: "bad_request" as const,
      message: "You are already assigned to a group",
      current_group_id: enrollment.group_id,
    };

  await prisma.enrollment.update({
    where: { enrollment_id: enrollment.enrollment_id },
    data: { group_id: groupId, level: group.level },
  });
  if (group._count.enrollments + 1 >= group.max_students)
    await prisma.group.update({
      where: { group_id: groupId },
      data: { status: "FULL" },
    });

  emitToAdminLevel("group:studentJoined", {
    group_id: groupId,
    group_name: group.name,
    student_id: student.student_id,
    student_name: `${student.first_name} ${student.last_name}`,
  });
  emitToGroup(groupId, "group:memberChanged", {
    action: "joined",
    student_id: student.student_id,
    student_name: `${student.first_name} ${student.last_name}`,
  });
  emitToUser(userId, "group:joined", {
    group_id: groupId,
    group_name: group.name,
    level: group.level,
  });

  return {
    data: {
      message: "Joined group successfully",
      group_id: group.group_id,
      group_name: group.name,
      level: group.level,
    },
  };
}

export async function leaveGroup(userId: string) {
  const student = await getStudentByUserId(userId);
  if (!student)
    return { error: "not_found" as const, message: "Student not found" };

  const enrollment = await prisma.enrollment.findFirst({
    where: {
      student_id: student.student_id,
      group_id: { not: null },
      registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
    },
  });
  if (!enrollment?.group_id)
    return {
      error: "bad_request" as const,
      message: "You are not in any group",
    };

  const groupId = enrollment.group_id;
  await prisma.enrollment.update({
    where: { enrollment_id: enrollment.enrollment_id },
    data: { group_id: null },
  });

  const group = await prisma.group.findUnique({ where: { group_id: groupId } });
  if (group?.status === "FULL")
    await prisma.group.update({
      where: { group_id: groupId },
      data: { status: "OPEN" },
    });

  emitToAdminLevel("group:studentLeft", {
    group_id: groupId,
    student_id: student.student_id,
    student_name: `${student.first_name} ${student.last_name}`,
  });
  emitToGroup(groupId, "group:memberChanged", {
    action: "left",
    student_id: student.student_id,
  });
  emitToUser(userId, "group:left", {
    previous_group_id: groupId,
  });

  return {
    data: { message: "Left group successfully", previous_group_id: groupId },
  };
}

// ══════════════════════════════════════════════
// 5. COURSES
// ══════════════════════════════════════════════

export async function getCourseGroups(courseId: string) {
  const groups = await prisma.group.findMany({
    where: { course_id: courseId },
    include: {
      teacher: true,
      _count: {
        select: {
          enrollments: {
            where: {
              registration_status: { in: ["VALIDATED", "PAID", "FINISHED"] },
            },
          },
        },
      },
    },
    orderBy: { level: "asc" },
  });

  return groups.map((g) => {
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
}

export async function getCoursesWithGroups() {
  const courses = await prisma.course.findMany({
    select: {
      course_id: true,
      course_name: true,
      course_code: true,
      credits: true,
      course_type: true,
      session_duration: true,
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
                  registration_status: {
                    in: ["VALIDATED", "PAID", "FINISHED"],
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { course_name: "asc" },
  });

  return courses.map((course) => {
    const groups = course.groups.map((g) => ({
      group_id: g.group_id,
      level: g.level,
      max_students: g.max_students,
      current_capacity: g._count.enrollments,
      available_spots: g.max_students - g._count.enrollments,
      status: g._count.enrollments >= g.max_students ? "FULL" : "OPEN",
    }));
    const totalSpots = groups.reduce((s, g) => s + g.max_students, 0);
    const totalEnrolled = groups.reduce((s, g) => s + g.current_capacity, 0);
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
}

// ══════════════════════════════════════════════
// 6. DASHBOARD
// ══════════════════════════════════════════════

export async function getDashboard(userId: string) {
  const student = await prisma.student.findUnique({
    where: { user_id: userId },
    include: {
      documents: true,
      enrollments: {
        include: { course: true, group: true, fees: true, pricing: true },
        orderBy: { enrollment_date: "desc" },
      },
    },
  });
  if (!student) return null;

  const category = getCategory(student);

  // ─── Profile completion (informational only, لا يؤثر على is_profile_complete) ───
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
  const completedFields = profileFields.filter(Boolean).length;
  const totalFields = profileFields.length;
  const percentage = Math.round((completedFields / totalFields) * 100);
  const missingFields = fieldNames.filter((_, i) => !profileFields[i]);

  const uploadedTypes = student.documents.map((d) => d.type as DocumentType);
  const approvedTypes = student.documents
    .filter((d) => d.status === "APPROVED")
    .map((d) => d.type as DocumentType);
  const docCheck = areDocumentsComplete(category, uploadedTypes, approvedTypes);

  const approved = student.documents.filter(
    (d) => d.status === "APPROVED",
  ).length;
  const pending = student.documents.filter(
    (d) => d.status === "PENDING",
  ).length;
  const rejected = student.documents.filter(
    (d) => d.status === "REJECTED",
  ).length;

  // ✅ CHANGED: يكفي رفع مستند واحد على الأقل
  const isProfileComplete = student.documents.length > 0;
  const isDocumentsComplete = docCheck.complete;
  const isEnrollmentReady = isProfileComplete; // ✅ لا يشترط شيء آخر

  const activeEnrollments = student.enrollments.filter((e) =>
    ["PENDING", "VALIDATED", "PAID"].includes(e.registration_status),
  );
  const totalFees = student.enrollments
    .flatMap((e) => e.fees)
    .reduce((s, f) => s + Number(f.amount), 0);
  const paidFees = student.enrollments
    .flatMap((e) => e.fees)
    .filter((f) => f.status === "PAID")
    .reduce((s, f) => s + Number(f.amount), 0);
  const currentGroups = student.enrollments
    .filter(
      (e) =>
        e.group_id &&
        ["VALIDATED", "PAID", "FINISHED"].includes(e.registration_status),
    )
    .map((e) => ({
      group_id: e.group?.group_id,
      name: e.group?.name,
      level: e.group?.level,
      course_name: e.course?.course_name,
    }))
    .filter((g) => g.group_id);

  return {
    registrant_category: category,
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
      missingDocuments: docCheck.missing,
      isComplete: isDocumentsComplete,
      required: REQUIRED_DOCUMENTS_BY_CATEGORY[category],
    },
    enrollment: {
      isReady: isEnrollmentReady,
      active_count: activeEnrollments.length,
      max_allowed: MAX_ACTIVE_ENROLLMENTS,
      can_enroll:
        isEnrollmentReady && activeEnrollments.length < MAX_ACTIVE_ENROLLMENTS,
      enrollments: activeEnrollments.map((e) => ({
        enrollment_id: e.enrollment_id,
        course_name: e.course?.course_name,
        group_name: e.group?.name,
        level: e.level,
        status: e.registration_status,
        enrollment_date: e.enrollment_date,
        pricing: e.pricing
          ? {
              status_fr: e.pricing.status_fr,
              status_ar: e.pricing.status_ar,
              price: Number(e.pricing.price),
              currency: e.pricing.currency,
            }
          : null,
      })),
    },
    fees: {
      total: totalFees,
      paid: paidFees,
      remaining: totalFees - paidFees,
      is_fully_paid: totalFees > 0 && paidFees >= totalFees,
    },
    current_groups: currentGroups,
  };
}

// ══════════════════════════════════════════════
// 7-9. FEES, ATTENDANCE, RESULTS
// ══════════════════════════════════════════════

export async function getMyFees(userId: string) {
  const student = await getStudentByUserId(userId);
  if (!student) return { error: "not_found" as const };

  const fees = await prisma.fee.findMany({
    where: { student_id: student.student_id },
    include: { enrollment: { include: { course: true, pricing: true } } },
    orderBy: { due_date: "asc" },
  });

  const total = fees.reduce((s, f) => s + Number(f.amount), 0);
  const paid = fees
    .filter((f) => f.status === "PAID")
    .reduce((s, f) => s + Number(f.amount), 0);
  return {
    data: {
      fees,
      summary: {
        total,
        paid,
        remaining: total - paid,
        is_fully_paid: total > 0 && paid >= total,
      },
    },
  };
}

export async function getMyAttendance(userId: string) {
  const student = await getStudentByUserId(userId);
  if (!student) return { error: "not_found" as const };

  const attendance = await prisma.attendance.findMany({
    where: { student_id: student.student_id },
    include: { session: { include: { group: { include: { course: true } } } } },
    orderBy: { session: { session_date: "desc" } },
  });

  const total = attendance.length;
  const present = attendance.filter((a) => a.status === "PRESENT").length;
  const absent = attendance.filter((a) => a.status === "ABSENT").length;

  return {
    data: {
      records: attendance,
      summary: {
        total_sessions: total,
        present,
        absent,
        attendance_rate: total > 0 ? Math.round((present / total) * 100) : 0,
      },
    },
  };
}

export async function getMyResults(userId: string) {
  const student = await getStudentByUserId(userId);
  if (!student) return { error: "not_found" as const };

  const results = await prisma.result.findMany({
    where: { student_id: student.student_id },
    include: { exam: { include: { course: true } } },
    orderBy: { exam: { exam_date: "desc" } },
  });

  const totalExams = results.length;
  const averageScore =
    totalExams > 0
      ? Math.round(
          (results.reduce(
            (s, r) => s + (r.marks_obtained / r.exam.max_marks) * 100,
            0,
          ) /
            totalExams) *
            100,
        ) / 100
      : 0;

  return {
    data: {
      results,
      summary: { total_exams: totalExams, average_score: averageScore },
    },
  };
}

// ══════════════════════════════════════════════
// 10. COURSE PROFILE WITH PRICING
// ══════════════════════════════════════════════

export async function getCourseProfileWithPricing(courseId: string) {
  const profile = await prisma.courseProfile.findUnique({
    where: { course_id: courseId },
    include: {
      pricing: { orderBy: { sort_order: "asc" } },
      course: {
        select: {
          course_id: true,
          course_name: true,
          course_code: true,
          course_type: true,
          session_duration: true,
        },
      },
    },
  });

  if (!profile)
    return { error: "not_found" as const, message: "Course profile not found" };
  if (!profile.is_published)
    return {
      error: "forbidden" as const,
      message: "Course profile is not published",
    };
  if (!profile.registration_open)
    return { error: "forbidden" as const, message: "Registration is closed" };

  return { data: profile };
}
