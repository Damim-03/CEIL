import type { Course } from "./course";

/* =======================
   COURSE UI (Computed)
======================= */

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
