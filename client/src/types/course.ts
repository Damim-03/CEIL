import type { Teacher } from "./Teacher";
import type { Enrollment } from "./enrollment";
import type { Session } from "./session";
import type { Exam } from "./exam";

/* =======================
   BASE COURSE
   (Prisma / API model)
======================= */

export interface Course {
  course_id: string;

  course_name: string;
  course_code?: string;
  credits?: number;

  teacher_id?: string;

  // relations (optional – depends on API include)
  teacher?: Teacher;
  enrollments?: Enrollment[];
  sessions?: Session[];
  exams?: Exam[];
}

/* =======================
   LIST / TABLE ITEM
======================= */

export interface CourseListItem {
  course_id: string;
  course_name: string;
  course_code?: string;
  credits?: number;
  teacher?: {
    teacher_id: string;
    first_name: string;
    last_name: string;
  };
}

/* =======================
   UI EXTENDED TYPE
   (computed / frontend only)
======================= */

export interface CourseUI extends Course {
  description?: string;
  duration?: string;

  enrollment_count?: number;
  completion_rate?: number;

  prerequisites?: string;
  syllabus?: string;
  instructor?: string;
}

/* =======================
   MUTATION PAYLOADS
======================= */

export interface CreateCoursePayload {
  course_name: string;
  course_code?: string;
  credits?: number;
  teacher_id?: string;
}

export interface UpdateCoursePayload {
  course_name?: string;
  course_code?: string;
  credits?: number;
  teacher_id?: string;
}
