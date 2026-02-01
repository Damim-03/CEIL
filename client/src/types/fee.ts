import type { FeeStatus } from "./enums";
import type { Student } from "./student";
import type { Enrollment } from "./enrollment";

/* =======================
   BASE FEE
   (Prisma / API model)
======================= */

export interface Fee {
  fee_id: string;

  student_id: string;
  enrollment_id?: string;

  amount: number;
  due_date: string;
  status: FeeStatus;

  payment_method?: string;
  reference_code?: string;
  paid_at?: string;

  // relations (optional – depends on API include)
  student?: Student;
  enrollment?: Enrollment;
}

/* =======================
   LIST / TABLE ITEM
======================= */

export interface FeeListItem {
  fee_id: string;
  amount: number;
  due_date: string;
  status: FeeStatus;

  student: {
    student_id: string;
    first_name: string;
    last_name: string;
    email?: string;
  };

  enrollment?: {
    enrollment_id: string;
  };
}

/* =======================
   MUTATION PAYLOADS
======================= */

export interface CreateFeePayload {
  student_id: string;
  enrollment_id?: string;
  amount: number;
  due_date: string; // ISO date
}

export interface UpdateFeePayload {
  amount?: number;
  due_date?: string; // ISO date
}

export interface MarkFeeAsPaidPayload {
  fee_id: string;
  payment_method?: string; // optional (default handled in backend)
}
