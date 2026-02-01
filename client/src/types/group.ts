import type { Student } from "./Student";
import type { Department } from "./department";
import type { Session } from "./session";
import type { Enrollment } from "./enrollment";

/* =======================
   BASE GROUP
   (Prisma / API model)
======================= */

export interface Group {
  group_id: string;

  name: string;
  academic_year?: string;

  department_id: string;

  // relations (optional – depends on API include)
  department?: Department;
  students?: Student[];
  sessions?: Session[];
  enrollments?: Enrollment[];
}

/* =======================
   LIST / TABLE ITEM
======================= */

export interface GroupListItem {
  group_id: string;
  name: string;
  academic_year?: string;
  department: {
    department_id: string;
    name: string;
  };
  total_students: number;
}

/* =======================
   MUTATION PAYLOADS
======================= */

export interface CreateGroupPayload {
  name: string;
  academic_year?: string;
  department_id: string;
}

export interface UpdateGroupPayload {
  name?: string;
  academic_year?: string;
  department_id?: string;
}
