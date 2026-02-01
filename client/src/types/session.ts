import type { Course } from "./course";
import type { Teacher } from "./Teacher";
import type { Group } from "./group";
import type { Attendance } from "./attendance";

/* =======================
   BASE SESSION
   (Prisma / API model)
======================= */

export interface Session {
  session_id: string;

  course_id: string;
  teacher_id: string;
  group_id: string;

  session_date: string;
  topic?: string;

  // relations (optional – depends on API include)
  course?: Course;
  teacher?: Teacher;
  group?: Group;
  attendance?: Attendance[];
}

/* =======================
   LIST / TABLE ITEM
======================= */

export interface SessionListItem {
  session_id: string;
  session_date: string;
  topic?: string;

  course: {
    course_id: string;
    course_name: string;
  };

  teacher: {
    teacher_id: string;
    first_name: string;
    last_name: string;
  };

  group: {
    group_id: string;
    name: string;
  };
}

/* =======================
   MUTATION PAYLOADS
======================= */

export interface CreateSessionPayload {
  course_id: string;
  teacher_id: string;
  group_id: string;
  session_date: string; // ISO date
  topic?: string;
}

export interface UpdateSessionPayload {
  session_date?: string; // ISO date
  topic?: string;
}
