import type { Group } from "./group";

/* =======================
   BASE DEPARTMENT
   (Prisma / API model)
======================= */

export interface Department {
  department_id: string;

  name: string;
  description?: string;

  created_at?: string;

  // relations (optional – depends on API include)
  groups?: Group[];
}

/* =======================
   LIST / TABLE ITEM
======================= */

export interface DepartmentListItem {
  department_id: string;
  name: string;
  description?: string;
  groups_count: number;
}

/* =======================
   MUTATION PAYLOADS
======================= */

export interface CreateDepartmentPayload {
  name: string;
  description?: string;
}

export interface UpdateDepartmentPayload {
  name?: string;
  description?: string;
}
