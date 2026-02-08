/* ===============================================================
   APPLICATION TYPES - PRISMA SCHEMA ALIGNED
   
   All TypeScript types matching Prisma database schema exactly.
   Organized by domain for easy navigation.
   
   Based on Prisma Schema - February 2026
=============================================================== */

/* ===============================================================
   ENUMS (Matching Prisma Schema Exactly)
=============================================================== */

export type StudentStatus = "ACTIVE" | "INACTIVE";
export type UserRole = "ADMIN" | "STUDENT" | "TEACHER";
export type AttendanceStatus = "PRESENT" | "ABSENT";
export type FeeStatus = "PAID" | "UNPAID";
export type Gender = "MALE" | "FEMALE" | "OTHER";
export type RegistrationStatus = "PENDING" | "VALIDATED" | "REJECTED" | "PAID" | "FINISHED";
export type Level = "A1" | "A2" | "B1" | "B2" | "C1";
export type DocumentStatus = "PENDING" | "APPROVED" | "REJECTED";
export type GroupStatus = "OPEN" | "FULL" | "FINISHED";

// Helper type alias
export type GroupLevel = Level;

// Available levels constant
export const LEVELS = ["A1", "A2", "B1", "B2", "C1"] as const;

/* ===============================================================
   USER (Prisma Model)
=============================================================== */

export interface User {
  user_id: string; // UUID
  email: string; // VARCHAR(100), unique
  password?: string | null;
  role: UserRole; // Default: STUDENT
  is_active: boolean; // Default: true
  google_id?: string | null; // unique
  google_email?: string | null;
  google_avatar?: string | null;
  student_id?: string | null; // UUID, unique
  teacher_id?: string | null; // UUID, unique
  created_at: Date | string;
  
  // Relations
  refresh_tokens?: RefreshToken[];
  student?: Student | null;
  teacher?: Teacher | null;
}

/* ===============================================================
   STUDENT (Prisma Model)
=============================================================== */

export interface Student {
  student_id: string; // UUID
  first_name: string; // VARCHAR(100)
  last_name: string; // VARCHAR(100)
  date_of_birth?: Date | string | null;
  gender?: Gender | null;
  user_id: string; // UUID, unique
  phone_number?: string | null; // VARCHAR(35)
  email?: string | null; // VARCHAR(100)
  secondary_email?: string | null; // VARCHAR(100)
  address?: string | null;
  nationality?: string | null; // VARCHAR(50)
  language?: string | null;
  avatar_url?: string | null;
  education_level?: string | null; // VARCHAR(100)
  study_location?: string | null; // VARCHAR(100)
  status: StudentStatus; // Default: ACTIVE
  created_at: Date | string;
  updated_at: Date | string;
  group_id?: string | null; // UUID
  
  // Relations
  attendance?: Attendance[];
  documents?: Document[];
  enrollments?: Enrollment[];
  fees?: Fee[];
  results?: Result[];
  group?: Group | null;
  permissions?: StudentPermission[];
  user?: User | null;
}

// Extended type for admin views with computed fields
export interface AdminStudent extends Student {
  emergency_contact?: string | null;
}

/* ===============================================================
   TEACHER (Prisma Model)
=============================================================== */

export interface Teacher {
  bio: any;
  qualifications: any;
  google_avatar: null;
  status: string;
  courses_count: undefined;
  students_count: undefined;
  address: any;
  department: any;
  specialization: any;
  teacher_id: string; // UUID
  first_name: string; // VARCHAR(100)
  last_name: string; // VARCHAR(100)
  email?: string | null; // VARCHAR(100)
  phone_number?: string | null; // VARCHAR(35)
  created_at: Date | string;
  
  // Relations
  groups?: Group[];
  user?: User | null;
}

/* ===============================================================
   COURSE (Prisma Model)
=============================================================== */

export interface Course {
  course_id: string; // UUID
  course_code?: string | null; // VARCHAR(20), unique
  course_name: string; // VARCHAR(100)
  credits?: number | null;
  
  // Relations
  enrollments?: Enrollment[];
  exams?: Exam[];
  groups?: Group[];
}

export interface CourseListItem {
  course_id: string;
  course_name: string;
  course_code?: string | null;
  credits?: number | null;
}

// Extended type for UI with computed fields
export interface CourseUI extends Course {
  description?: string;
  duration?: string;
  enrollment_count?: number;
  completion_rate?: number;
  prerequisites?: string;
  syllabus?: string;
  instructor?: string;
  created_at?: string;
}

/* ===============================================================
   DEPARTMENT (Prisma Model)
=============================================================== */

export interface Department {
  department_id: string; // UUID
  name: string; // VARCHAR(100), unique
  description?: string | null;
  created_at: Date | string;
  
  // Relations
  groups?: Group[];
}

export interface DepartmentListItem {
  department_id: string;
  name: string;
  description?: string;
  groups_count: number;
}

/* ===============================================================
   GROUP (Prisma Model)
=============================================================== */

export interface Group {
  group_id: string; // UUID
  name: string;
  department_id?: string | null; // UUID
  course_id: string; // UUID
  max_students: number; // Default: 25
  status: GroupStatus; // Default: OPEN
  teacher_id?: string | null; // UUID
  level: Level;
  
  // Relations
  enrollments?: Enrollment[];
  course?: Course;
  department?: Department | null;
  teacher?: Teacher | null;
  sessions?: Session[];
  students?: Student[];
  
  // Computed field (not in DB)
  current_capacity?: number;
  _count?: {
    students: number;
  };
}

export interface GroupListItem {
  group_id: string;
  name: string;
  level: Level;
  department?: {
    department_id: string;
    name: string;
  } | null;
  total_students: number;
}

export interface GroupUI extends Group {
  group_name?: string;
  instructor_id?: string;
  max_capacity?: number;
  current_capacity: number;
  created_at?: string;
  updated_at?: string;
  
  course?: {
    course_id: string;
    course_name: string;
    course_code?: string;
    credits?: number;
  };
  
  instructor?: {
    teacher_id: string;
    first_name: string;
    last_name: string;
    email?: string;
  };
  
  students?: Array<{
    student_id: string;
    first_name: string;
    last_name: string;
    email?: string;
    enrolled_at?: string;
  }>;
}

/* ===============================================================
   ENROLLMENT (Prisma Model)
=============================================================== */

export interface Enrollment {
  enrollment_id: string; // UUID
  student_id: string; // UUID
  course_id: string; // UUID
  group_id?: string | null; // UUID
  enrollment_date: Date | string; // Default: now()
  level?: Level | null;
  start_date?: Date | string | null;
  end_date?: Date | string | null;
  registration_status: RegistrationStatus; // Default: PENDING
  
  // Relations
  course?: Course;
  group?: Group | null;
  student?: Student;
  fees?: Fee[];
  history?: RegistrationHistory[];
  
  // Computed/Extended fields (not in DB)
  rejection_reason?: string | null;
}

export interface EnrollmentListItem {
  enrollment_id: string;
  enrollment_date: Date | string;
  registration_status: RegistrationStatus;
  
  student: {
    student_id: string;
    first_name: string;
    last_name: string;
  };
  
  course: {
    course_id: string;
    course_name: string;
  };
}

/* ===============================================================
   SESSION (Prisma Model)
=============================================================== */

export interface Session {
  _count: any;
  session_id: string; // UUID
  group_id: string; // UUID
  session_date?: Date;
  topic?: string | null;
  
  // Relations
  attendance?: Attendance[];
  group?: Group;
  
  // Computed fields (not in DB, populated via joins)
  course_id?: string;
  course_name?: string;
  teacher_id?: string;
  teacher_name?: string;
  group_name?: string;
  has_attendance?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SessionAttendance {
  attendance_id: string;
  session_id: string;
  student_id: string;
  student_name: string;
  status: AttendanceStatus;
  marked_at?: string;
}

/* ===============================================================
   ATTENDANCE (Prisma Model)
=============================================================== */

export interface Attendance {
  attendance_id: string; // UUID
  session_id: string; // UUID
  student_id: string; // UUID
  status: AttendanceStatus;
  
  // Relations
  session?: Session;
  student?: Student;
  
  // Computed field
  marked_at?: Date | string;
}

export interface AttendanceBySession {
  attendance_id: string;
  status: AttendanceStatus;
  student: {
    student_id: string;
    first_name: string;
    last_name: string;
    email?: string | null;
  };
}

export interface AttendanceByStudent {
  attendance_id: string;
  status: AttendanceStatus;
  session: {
    session_id: string;
    session_date: Date | string;
    topic?: string | null;
  };
}

export interface AttendanceWithSession {
  attendance_id: string;
  status: AttendanceStatus;
  marked_at?: Date | string;
  
  session: {
    session_id: string;
    session_date: Date | string;
    topic?: string | null;
    course_name?: string;
    teacher_name?: string;
  };
}

export interface AttendanceSummary {
  total_sessions: number;
  present: number;
  absent: number;
  attendance_rate: number; // percentage
}

export interface AttendanceResponse {
  records: AttendanceWithSession[];
  summary: AttendanceSummary;
}

/* ===============================================================
   EXAM (Prisma Model)
=============================================================== */

export interface Exam {
  exam_id: string; // UUID
  course_id: string; // UUID
  exam_name?: string | null;
  exam_date: Date | string;
  max_marks: number;
  
  // Relations
  course?: Course;
  results?: Result[];
}

export interface ExamListItem {
  exam_id: string;
  exam_name?: string | null;
  exam_date: Date | string;
  max_marks: number;
  course: {
    course_id: string;
    course_name: string;
  };
}

/* ===============================================================
   RESULT (Prisma Model)
=============================================================== */

export interface Result {
  result_id: string; // UUID
  exam_id: string; // UUID
  student_id: string; // UUID
  marks_obtained: number;
  grade?: string | null;
  
  // Relations
  exam?: Exam;
  student?: Student;
}

export interface ResultByExam {
  result_id: string;
  marks_obtained: number;
  grade?: string | null;
  
  student: {
    student_id: string;
    first_name: string;
    last_name: string;
    email?: string | null;
  };
}

export interface ResultByStudent {
  result_id: string;
  marks_obtained: number;
  grade?: string | null;
  
  exam: {
    exam_id: string;
    exam_name?: string | null;
    exam_date: Date | string;
    max_marks: number;
  };
}

export interface ResultsSummary {
  total_exams: number;
  average_score: number;
  highest_score?: number;
  lowest_score?: number;
}

export interface ResultsResponse {
  results: Result[];
  summary: ResultsSummary;
}

export interface ExamResult {
  result_id: string;
  exam_id: string;
  student_id: string;
  marks_obtained: number;
  grade?: string | null;
}

/* ===============================================================
   FEE (Prisma Model)
=============================================================== */

export interface Fee {
  fee_id: string; // UUID
  student_id: string; // UUID
  enrollment_id?: string | null; // UUID
  amount: number; // Decimal(10,2)
  due_date: Date | string;
  status: FeeStatus; // Default: UNPAID
  payment_method?: string | null; // VARCHAR(30)
  reference_code?: string | null; // VARCHAR(100)
  paid_at?: Date | string | null;
  
  // Relations
  enrollment?: Enrollment | null;
  student?: Student;
}

export interface FeeListItem {
  fee_id: string;
  amount: number;
  due_date: Date | string;
  status: FeeStatus;
  
  student: {
    student_id: string;
    first_name: string;
    last_name: string;
    email?: string | null;
  };
  
  enrollment?: {
    enrollment_id: string;
  } | null;
}

export interface FeeSummary {
  total: number;
  paid: number;
  remaining: number;
  is_fully_paid: boolean;
}

export interface FeeResponse {
  fees: Fee[];
  summary: FeeSummary;
}

/* ===============================================================
   DOCUMENT (Prisma Model)
=============================================================== */

export interface Document {
  document_id: string; // UUID
  student_id: string; // UUID
  type: string;
  file_path: string;
  public_id?: string | null;
  status: DocumentStatus; // Default: PENDING
  reviewed_at?: Date | string | null;
  reviewed_by?: string | null; // UUID
  uploaded_at: Date | string; // Default: now()
  
  // Relations
  student?: Student;
  
  // Computed field
  rejection_reason?: string | null;
}

export type DocumentType = "PHOTO" | "ID_CARD" | "SCHOOL_CERTIFICATE" | "PAYMENT_RECEIPT";

export interface AdminDocumentResponse {
  document_id: string;
  file_path: string;
  uploaded_at: Date | string;
  status: DocumentStatus;
  student: {
    student_id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string | null;
  };
}

export interface AdminDocument {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: "pdf" | "image" | "doc";
  uploadDate: Date | string;
  status: DocumentStatus;
  student: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
}

/* ===============================================================
   PERMISSION (Prisma Model)
=============================================================== */

export interface Permission {
  permission_id: string; // UUID
  name: string; // unique
  description?: string | null;
  
  // Relations
  students?: StudentPermission[];
}

export interface StudentPermission {
  student_id: string; // UUID
  permission_id: string; // UUID
  
  // Relations
  permission?: Permission;
  student?: Student;
}

/* ===============================================================
   REGISTRATION HISTORY (Prisma Model)
=============================================================== */

export interface RegistrationHistory {
  history_id: string; // UUID
  enrollment_id: string; // UUID
  old_status: RegistrationStatus;
  new_status: RegistrationStatus;
  changed_at: Date | string; // Default: now()
  changed_by?: string | null; // UUID
  
  // Relations
  enrollment?: Enrollment;
}

/* ===============================================================
   REFRESH TOKEN (Prisma Model)
=============================================================== */

export interface RefreshToken {
  token_id: string; // UUID
  user_id: string; // UUID
  token: string; // unique
  expires_at: Date | string;
  created_at: Date | string; // Default: now()
  
  // Relations
  user?: User;
}

/* ===============================================================
   PROFILE (Extended from Student)
=============================================================== */

export interface Profile {
  student_id?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  secondary_email?: string | null;
  phone_number?: string | null;
  date_of_birth?: Date | string | null;
  gender?: Gender | null;
  address?: string | null;
  nationality?: string | null;
  language?: string | null;
  education_level?: string | null;
  study_location?: string | null;
  avatar_url?: string | null;
  google_avatar?: string | null;
  status?: StudentStatus;
  user_id?: string;
  created_at?: Date | string;
  updated_at?: Date | string;
  
  // Computed
  is_profile_complete?: boolean;
}

/* ===============================================================
   DASHBOARD
=============================================================== */

export interface ProfileCompletion {
  completedFields: number;
  totalFields: number;
  percentage: number;
  isComplete: boolean;
}

export interface DocumentsStatus {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

export interface EnrollmentReadiness {
  isReady: boolean;
  profileComplete: boolean;
  documentsApproved: boolean;
  missingRequirements?: string[];
}

export interface DashboardResponse {
  profile: ProfileCompletion;
  documents: DocumentsStatus;
  enrollment: EnrollmentReadiness;
}

export interface AdminDashboardStats {
  students: number;
  teachers: number;
  courses: number;
  unpaidFees: number;
  gender: {
    Male: number;
    Female: number;
    Other: number;
  };
}

/* ===============================================================
   REPORTS
=============================================================== */

export interface StudentsReport {
  total: number;
  students: StudentReportItem[];
}

export interface StudentReportItem {
  student_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  group?: {
    group_id: string;
    name: string;
  } | null;
  enrollments: {
    enrollment_id: string;
    course_id: string;
  }[];
}

export interface GroupsReportItem {
  group_id: string;
  name: string;
  department: string;
  total_students: number;
}

export interface PaymentsReport {
  total: number;
  paid: number;
  unpaid: number;
  totalAmount: number;
  paidAmount: number;
}

export interface AttendanceReport {
  present: number;
  absent: number;
}

export interface EnrollmentsReport {
  Pending: number;
  Validated: number;
  Paid: number;
  Finished: number;
  Rejected: number;
}

/* ===============================================================
   PAYLOAD TYPES (For Mutations)
=============================================================== */

// Profile
export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  phone_number?: string | null;
  address?: string | null;
  date_of_birth?: Date | string | null;
  gender?: Gender | null;
  nationality?: string | null;
  language?: string | null;
  education_level?: string | null;
  study_location?: string | null;
  secondary_email?: string | null;
}

// Course
export interface CreateCoursePayload {
  course_name: string;
  course_code?: string;
  credits?: number;
  description?: string;
}

export interface UpdateCoursePayload {
  course_name?: string;
  course_code?: string;
  credits?: number;
  description?: string;
}

// Department
export interface CreateDepartmentPayload {
  name: string;
  description?: string;
}

export interface UpdateDepartmentPayload {
  name?: string;
  description?: string;
}

// Group
export interface CreateGroupPayload {
  instructor_id: string;
  name: string;
  level: Level;
  course_id: string;
  department_id?: string;
  teacher_id?: string;
  max_students?: number;
}

export interface UpdateGroupPayload {
  name?: string;
  level?: Level;
  max_students?: number;
  teacher_id?: string;
  department_id?: string;
  status?: GroupStatus;
}

// Enrollment
export interface EnrollPayload {
  course_id: string;
  group_id?: string;
  level?: Level;
}

export interface EnrollResponse {
  enrollment_id: string;
  course_id: string;
  group_id?: string | null;
  registration_status: RegistrationStatus;
  message?: string;
}

export interface ValidateEnrollmentPayload {
  enrollment_id: string;
}

export interface RejectEnrollmentPayload {
  enrollment_id: string;
  rejection_reason?: string;
}

export interface MarkEnrollmentPaidPayload {
  enrollment_id: string;
}

export interface FinishEnrollmentPayload {
  enrollment_id: string;
}

// Session
export interface CreateSessionPayload {
  group_id: string;
  session_date: Date | string;
  topic?: string;
}

export interface UpdateSessionPayload {
  session_date?: Date | string;
  topic?: string;
}

// Attendance
export interface MarkAttendancePayload {
  session_id: string;
  student_id: string;
  status: AttendanceStatus;
}

export interface UpdateAttendancePayload {
  status: AttendanceStatus;
}

// Fee
export interface CreateFeePayload {
  student_id: string;
  enrollment_id?: string;
  amount: number;
  due_date: Date | string;
}

export interface UpdateFeePayload {
  amount?: number;
  due_date?: Date | string;
}

export interface MarkFeeAsPaidPayload {
  fee_id: string;
  payment_method?: string;
  reference_code?: string;
}

// Exam
export interface CreateExamPayload {
  course_id: string;
  exam_name?: string;
  exam_date: Date | string;
  max_marks: number;
}

export interface UpdateExamPayload {
  exam_name?: string;
  exam_date?: Date | string;
  max_marks?: number;
}

// Result
export interface AddExamResultPayload {
  student_id: string;
  marks_obtained: number;
  grade?: string;
}

export interface UpdateResultPayload {
  marks_obtained?: number;
  grade?: string;
}

// Permission
export interface CreatePermissionPayload {
  name: string;
  description?: string;
}

// Teacher
export interface UpdateTeacherPayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
}

// Document
export interface UploadMutation {
  mutate: (
    formData: FormData,
    options?: {
      onSuccess?: () => void;
      onError?: (err: Error) => void;
    }
  ) => void;
  isPending: boolean;
}

export interface DocumentUploadProps {
  documentTypes: string[];
}

/* ===============================================================
   MUTATION RESULT
=============================================================== */

export interface MutationResult<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

/* ===============================================================
   UTILITY TYPES
=============================================================== */

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FilterParams {
  search?: string;
  status?: string;
  level?: Level;
  dateFrom?: Date | string;
  dateTo?: Date | string;
}

export interface ItemCardProps<T> {
  item: T;
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  isLoading?: boolean;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
}

export type AlertType = "success" | "error" | "warning" | "info";

export interface AlertConfig {
  type: AlertType;
  title: string;
  message: string;
  duration?: number;
}

/* ===============================================================
   TYPE GUARDS & HELPER FUNCTIONS
=============================================================== */

export function hasGroup(enrollment: Enrollment): boolean {
  return !!enrollment.group_id;
}

export function canJoinGroup(enrollment: Enrollment): boolean {
  return (
    (enrollment.registration_status === "VALIDATED" || 
     enrollment.registration_status === "PAID") && 
    !enrollment.group_id
  );
}

export function isDocumentApproved(document: Document): boolean {
  return document.status === "APPROVED";
}

export function isFeePaid(fee: Fee): boolean {
  return fee.status === "PAID";
}

export function isGroupAvailable(group: Group): boolean {
  const currentCapacity = group.current_capacity ?? group._count?.students ?? 0;
  const isFull = currentCapacity >= group.max_students;
  return !isFull && group.status === "OPEN";
}

/* ===============================================================
   HELPER TYPES
=============================================================== */

export type PickFields<T, K extends keyof T> = Pick<T, K>;
export type PartialFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;