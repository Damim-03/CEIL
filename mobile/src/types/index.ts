// ── User & Auth ──────────────────────────────────────────────
export interface Student {
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url: string | null;
  phone_number: string | null;
  nationality: string | null;
  education_level: string | null;
  study_location: string | null;
  registrant_category: "STUDENT" | "EXTERNAL" | "EMPLOYEE";
  status: "ACTIVE" | "INACTIVE";
  gender?: "MALE" | "FEMALE" | "OTHER";
  date_of_birth?: string;
  language?: string;
  created_at?: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

export interface User {
  user_id: string;
  email: string;
  role: "STUDENT";
  google_avatar: string | null;
  student: Student | null;
}

// ── Enrollment ───────────────────────────────────────────────
export type RegistrationStatus =
  | "PENDING"
  | "VALIDATED"
  | "REJECTED"
  | "PAID"
  | "FINISHED";

export type Level = "PRE_A1" | "A1" | "A2" | "B1" | "B2" | "C1";

export interface Enrollment {
  enrollment_id: string;
  course_id: string;
  group_id: string | null;
  enrollment_date: string;
  registration_status: RegistrationStatus;
  level: Level | null;
  course: Course;
  group: Group | null;
  pricing: CoursePricing | null;
  fees: Fee[];
}

// ── Course ───────────────────────────────────────────────────
export interface Course {
  course_id: string;
  course_name: string;
  course_code: string | null;
  course_type: "NORMAL" | "INTENSIVE";
  session_duration: number | null;
  profile: CourseProfile | null;
}

export interface CourseProfile {
  profile_id: string;
  title_ar: string | null;
  description: string | null;
  description_ar: string | null;
  language: string | null;
  level: string | null;
  flag_emoji: string | null;
  price: number | null;
  currency: string | null;
  session_name: string | null;
  start_date: string | null;
  end_date: string | null;
  registration_open: boolean;
  image_url: string | null;
}

export interface CoursePricing {
  pricing_id: string;
  status_fr: string;
  status_ar: string | null;
  status_en: string | null;
  price: number;
  currency: string;
  discount: string | null;
}

// ── Group ────────────────────────────────────────────────────
export interface Group {
  group_id: string;
  name: string;
  level: Level;
  status: "OPEN" | "FULL" | "FINISHED";
  max_students: number;
  teacher: Teacher | null;
}

// ── Teacher ──────────────────────────────────────────────────
export interface Teacher {
  teacher_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
}

// ── Attendance ───────────────────────────────────────────────
export type AttendanceStatus = "PRESENT" | "ABSENT";

export interface AttendanceRecord {
  attendance_id: string;
  status: AttendanceStatus;
  attended_at: string;
  session: Session | null;
}

export interface AttendanceSummary {
  total_sessions: number;
  present: number;
  absent: number;
  attendance_rate: number;
}

// ── Session ──────────────────────────────────────────────────
export interface Session {
  session_id: string;
  session_date: string;
  end_time: string | null;
  topic: string | null;
  group: Group | null;
  room: Room | null;
}

// ── Room ─────────────────────────────────────────────────────
export interface Room {
  room_id: string;
  name: string;
  capacity: number;
  location: string | null;
}

// ── Fee ──────────────────────────────────────────────────────
export interface Fee {
  fee_id: string;
  amount: number;
  due_date: string;
  status: "PAID" | "UNPAID";
  payment_method: string | null;
  paid_at: string | null;
}

// ── Notification ─────────────────────────────────────────────
export type NotificationPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export interface Notification {
  notification_id: string;
  title: string;
  title_ar: string | null;
  message: string;
  message_ar: string | null;
  priority: NotificationPriority;
  created_at: string;
}

export interface NotificationRecipient {
  recipient_id: string;
  is_read: boolean;
  read_at: string | null;
  notification: Notification;
}

// ── Timetable ────────────────────────────────────────────────
export type DayOfWeek =
  | "SATURDAY"
  | "SUNDAY"
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY";

export interface TimetableSlot {
  slot_id: string;
  day: DayOfWeek;
  start_time: string;
  end_time: string;
  level: string | null;
  group_label: string | null;
  language: string | null;
  notes: string | null;
  room: Room | null;
}

export interface Timetable {
  timetable_id: string;
  session_name: string;
  month: number;
  year: number;
  is_active: boolean;
  slots: TimetableSlot[];
}

// ── API Response ─────────────────────────────────────────────
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}