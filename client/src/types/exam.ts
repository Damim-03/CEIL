import type { Course } from "./Course";
import type { Result } from "./result";

/* =======================
   BASE EXAM
   (Prisma / API model)
======================= */

export interface Exam {
  exam_id: string;

  course_id: string;

  exam_name?: string;
  exam_date: string;
  max_marks: number;

  // relations (optional – depends on API include)
  course?: Course;
  results?: Result[];
}

/* =======================
   LIST / TABLE ITEM
======================= */

export interface ExamListItem {
  exam_id: string;
  exam_name?: string;
  exam_date: string;
  max_marks: number;
  course: {
    course_id: string;
    course_name: string;
  };
}

/* =======================
   MUTATION PAYLOADS
======================= */

export interface CreateExamPayload {
  course_id: string;
  exam_name?: string;
  exam_date: string;
  max_marks: number;
}

export interface UpdateExamPayload {
  exam_name?: string;
  exam_date?: string;
  max_marks?: number;
}
