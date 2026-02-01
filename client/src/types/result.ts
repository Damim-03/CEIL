import type { Exam } from "./exam";
import type { Student } from "./student";

/* =======================
   BASE RESULT
   (Prisma / API model)
======================= */

export interface Result {
  result_id: string;

  exam_id: string;
  student_id: string;

  marks_obtained: number;
  grade?: string;

  // relations (optional – depends on API include)
  exam?: Exam;
  student?: Student;
}

/* =======================
   LIST / TABLE ITEM
======================= */

/**
 * Result when fetching results by exam
 */
export interface ResultByExam {
  result_id: string;
  marks_obtained: number;
  grade?: string;

  student: {
    student_id: string;
    first_name: string;
    last_name: string;
    email?: string;
  };
}

/**
 * Result when fetching results by student
 */
export interface ResultByStudent {
  result_id: string;
  marks_obtained: number;
  grade?: string;

  exam: {
    exam_id: string;
    exam_name?: string;
    exam_date: string;
    max_marks: number;
  };
}

/* =======================
   MUTATION PAYLOADS
======================= */

export interface AddExamResultPayload {
  studentId: string;
  marks_obtained: number;
  grade?: string;
}

export interface UpdateResultPayload {
  marks_obtained?: number;
  grade?: string;
}
