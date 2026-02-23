// ================================================================
// 📌 src/validations/owner.validation.ts
// ✅ Zod v4 compatible
// ================================================================

import { z } from "zod";

// ─── Reusable primitives ─────────────────────────────────

const uuid = z.string().uuid("Invalid ID format");
const email = z.string().email("Invalid email").toLowerCase().trim();
const requiredString = (field: string) =>
  z
    .string({ error: `${field} is required` })
    .trim()
    .min(1, `${field} cannot be empty`);
const optionalString = z.string().trim().optional();
const positiveNumber = (field: string) =>
  z
    .number({ error: `${field} is required` })
    .positive(`${field} must be positive`);
const page = z.coerce.number().int().min(1).default(1);
const limit = z.coerce.number().int().min(1).max(100).default(50);
const dateString = z
  .string()
  .refine((v) => !isNaN(Date.parse(v)), { message: "Invalid date format" });

// ─── Params (URL parameters) ─────────────────────────────

export const userIdParam = z.object({ userId: uuid });
export const studentIdParam = z.object({ studentId: uuid });
export const teacherIdParam = z.object({ teacherId: uuid });
export const courseIdParam = z.object({ courseId: uuid });
export const departmentIdParam = z.object({ departmentId: uuid });
export const groupIdParam = z.object({ groupId: uuid });
export const enrollmentIdParam = z.object({ enrollmentId: uuid });
export const documentIdParam = z.object({ documentId: uuid });
export const sessionIdParam = z.object({ sessionId: uuid });
export const attendanceIdParam = z.object({ attendanceId: uuid });
export const examIdParam = z.object({ examId: uuid });
export const resultIdParam = z.object({ resultId: uuid });
export const feeIdParam = z.object({ feeId: uuid });
export const announcementIdParam = z.object({ announcementId: uuid });
export const notificationIdParam = z.object({ notificationId: uuid });
export const roomIdParam = z.object({ roomId: uuid });
export const pricingIdParam = z.object({ pricingId: uuid });

export const groupStudentParams = z.object({
  groupId: uuid,
  studentId: uuid,
});

export const studentPermissionParams = z.object({
  studentId: uuid,
  permissionId: uuid,
});

export const coursePricingParams = z.object({
  courseId: uuid,
  pricingId: uuid,
});

// ═══════════════════════════════════════════════════════════
// SECTION A: OWNER-EXCLUSIVE
// ═══════════════════════════════════════════════════════════

// ─── 2. Admin Management ────────────────────────────────

export const createAdminSchema = z.object({
  email,
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
});

// ─── 3. Audit Logs ──────────────────────────────────────

export const auditLogQuerySchema = z.object({
  page,
  limit,
  action: optionalString,
  entity_type: optionalString,
  user_id: z.string().uuid().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export const cleanupAuditSchema = z.object({
  days_to_keep: z.number().int().min(1).max(365).optional(),
});

// ─── 4. System Settings ─────────────────────────────────

export const updateSettingsSchema = z.object({
  settings: z
    .record(z.string(), z.any())
    .refine((obj) => Object.keys(obj).length > 0, {
      message: "At least one setting is required",
    }),
});

// ─── 5. Users ───────────────────────────────────────────

export const usersQuerySchema = z.object({
  page,
  limit,
  role: z.enum(["STUDENT", "TEACHER", "ADMIN", "OWNER"]).optional(),
  search: optionalString,
  is_active: z.enum(["true", "false"]).optional(),
});

export const changeUserRoleSchema = z.object({
  role: z.enum(["STUDENT", "TEACHER", "ADMIN", "OWNER"], {
    error: "Role is required and must be STUDENT, TEACHER, ADMIN, or OWNER",
  }),
});

// ─── 7. Fees ────────────────────────────────────────────

export const feesQuerySchema = z.object({
  page,
  limit,
  status: z.enum(["PAID", "UNPAID"]).optional(),
  student_id: z.string().uuid().optional(),
});

export const createFeeSchema = z.object({
  student_id: uuid,
  enrollment_id: z.string().uuid().optional(),
  amount: positiveNumber("Amount"),
  due_date: dateString,
});

export const updateFeeSchema = z.object({
  amount: z.number().positive().optional(),
  due_date: dateString.optional(),
  status: z.enum(["PAID", "UNPAID"]).optional(),
  payment_method: optionalString,
  reference_code: optionalString,
});

export const markFeePaidSchema = z.object({
  payment_method: optionalString,
  reference_code: optionalString,
});

// ─── Activity ───────────────────────────────────────────

export const activityQuerySchema = z.object({
  page,
  limit,
  user_id: z.string().uuid().optional(),
  role: optionalString,
  action: optionalString,
  entity_type: optionalString,
  from: z.string().optional(),
  to: z.string().optional(),
});

// ═══════════════════════════════════════════════════════════
// SECTION B: SHARED CRUD
// ═══════════════════════════════════════════════════════════

// ─── Students ───────────────────────────────────────────

export const createStudentSchema = z.object({
  first_name: requiredString("First name"),
  last_name: requiredString("Last name"),
  email,
  phone_number: optionalString,
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  nationality: optionalString,
  education_level: optionalString,
  password: z.string().min(6).optional(),
});

export const updateStudentSchema = createStudentSchema.partial();

// ─── Teachers ───────────────────────────────────────────

export const createTeacherSchema = z.object({
  first_name: requiredString("First name"),
  last_name: requiredString("Last name"),
  email,
  phone_number: optionalString,
  password: z.string().min(6).optional(),
});

export const updateTeacherSchema = createTeacherSchema.partial();

// ─── Courses ────────────────────────────────────────────

export const createCourseSchema = z.object({
  course_name: requiredString("Course name"),
  course_code: optionalString,
  department_id: z.string().uuid().optional(),
  teacher_id: z.string().uuid().optional(),
  max_students: z.number().int().positive().optional(),
});

export const updateCourseSchema = createCourseSchema.partial();

// ─── Departments ────────────────────────────────────────

export const createDepartmentSchema = z.object({
  name: requiredString("Department name"),
  description: optionalString,
});

export const updateDepartmentSchema = createDepartmentSchema.partial();

// ─── Groups ─────────────────────────────────────────────

export const createGroupSchema = z.object({
  name: requiredString("Group name"),
  course_id: uuid,
  department_id: z.string().uuid().optional(),
  teacher_id: z.string().uuid().optional(),
  max_students: z.number().int().positive().optional(),
  level: optionalString,
});

export const updateGroupSchema = createGroupSchema.partial();

export const assignInstructorSchema = z.object({
  teacher_id: z.string().uuid("Invalid teacher ID"),
});

// ─── Enrollments ────────────────────────────────────────

export const changeEnrollmentStatusSchema = z.object({
  status: z.enum(["PENDING", "VALIDATED", "PAID", "FINISHED", "REJECTED"], {
    error: "Status must be PENDING, VALIDATED, PAID, FINISHED, or REJECTED",
  }),
});

export const rejectEnrollmentSchema = z.object({
  reason: requiredString("Rejection reason"),
});

export const validateEnrollmentSchema = z.object({
  pricing_id: z.string().uuid().optional(),
});

// ─── Sessions ───────────────────────────────────────────

export const createSessionSchema = z.object({
  group_id: uuid,
  session_date: dateString,
  end_time: optionalString,
  topic: optionalString,
  room_id: z.string().uuid().optional(),
});

export const updateSessionSchema = z.object({
  session_date: dateString.optional(),
  end_time: z.string().nullable().optional(),
  topic: optionalString,
  room_id: z.string().uuid().nullable().optional(),
});

// ─── Attendance ─────────────────────────────────────────

export const markAttendanceSchema = z.object({
  student_id: uuid,
  status: z.enum(["PRESENT", "ABSENT"], {
    error: "Status must be PRESENT or ABSENT",
  }),
});

export const updateAttendanceSchema = z.object({
  status: z.enum(["PRESENT", "ABSENT"], {
    error: "Status must be PRESENT or ABSENT",
  }),
});

// ─── Exams ──────────────────────────────────────────────

export const createExamSchema = z.object({
  course_id: uuid,
  exam_name: optionalString,
  exam_date: dateString,
  max_marks: positiveNumber("Max marks"),
});

export const updateExamSchema = z.object({
  exam_name: optionalString,
  exam_date: dateString.optional(),
  max_marks: z.number().positive().optional(),
});

// ─── Results ────────────────────────────────────────────

export const addResultSchema = z.object({
  student_id: uuid,
  marks_obtained: z.number().min(0, "Marks cannot be negative"),
  grade: optionalString,
});

export const updateResultSchema = z.object({
  marks_obtained: z.number().min(0).optional(),
  grade: optionalString,
});

// ─── Permissions ────────────────────────────────────────

export const createPermissionSchema = z.object({
  name: requiredString("Permission name"),
  description: optionalString,
});

export const assignPermissionSchema = z.object({
  permissionId: uuid,
});

// ─── Announcements ──────────────────────────────────────

export const announcementQuerySchema = z.object({
  page,
  limit,
  category: optionalString,
  is_published: z.enum(["true", "false"]).optional(),
  search: optionalString,
});

export const createAnnouncementSchema = z.object({
  title: requiredString("Title"),
  title_ar: optionalString,
  content: requiredString("Content"),
  content_ar: optionalString,
  excerpt: optionalString,
  excerpt_ar: optionalString,
  category: optionalString,
  is_published: z.boolean().optional(),
});

export const updateAnnouncementSchema = createAnnouncementSchema.partial();

// ─── Course Profile & Pricing ───────────────────────────

export const upsertCourseProfileSchema = z.object({
  title_ar: optionalString,
  description: optionalString,
  description_ar: optionalString,
  language: optionalString,
  level: optionalString,
  flag_emoji: optionalString,
  price: z.number().min(0).optional(),
  currency: optionalString,
  session_name: optionalString,
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  registration_open: z.boolean().optional(),
  is_published: z.boolean().optional(),
});

export const createPricingSchema = z.object({
  status_fr: requiredString("Status (FR)"),
  status_ar: optionalString,
  status_en: optionalString,
  price: positiveNumber("Price"),
  currency: z.string().default("DZD"),
  discount: optionalString,
  sort_order: z.number().int().optional(),
});

export const updatePricingSchema = createPricingSchema.partial();

// ─── Notifications ──────────────────────────────────────

export const sendNotificationSchema = z.object({
  title: requiredString("Title"),
  title_ar: optionalString,
  message: requiredString("Message"),
  message_ar: optionalString,
  target_type: z.enum(
    [
      "ALL_STUDENTS",
      "ALL_TEACHERS",
      "ALL_ADMINS",
      "ALL_USERS",
      "SPECIFIC_STUDENTS",
      "SPECIFIC_TEACHERS",
      "SPECIFIC_ADMINS",
      "GROUP",
      "COURSE",
    ],
    {
      error: "Invalid target_type",
    },
  ),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).optional(),
  user_ids: z.array(z.string().uuid()).optional(),
  group_id: z.string().uuid().optional(),
  course_id: z.string().uuid().optional(),
});

export const notificationQuerySchema = z.object({
  page,
  limit,
});

// ─── Rooms ──────────────────────────────────────────────

export const createRoomSchema = z.object({
  name: requiredString("Room name"),
  capacity: z.number().int().positive().optional(),
  location: optionalString,
});

export const updateRoomSchema = createRoomSchema.partial();

export const roomScheduleQuerySchema = z.object({
  from: dateString,
  to: dateString,
});

export const roomAvailabilityQuerySchema = z.object({
  date: dateString,
  end_time: requiredString("End time"),
});

export const roomsOverviewQuerySchema = z.object({
  date: z.string().optional(),
});

// ─── Fee Analytics ──────────────────────────────────────

export const feeAnalyticsQuerySchema = z.object({
  period: z.enum(["daily", "weekly", "monthly", "yearly"]).default("monthly"),
  date: z.string().optional(),
  page,
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
