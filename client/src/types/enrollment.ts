import type { RegistrationStatus, Level } from "./enums";
import type { Student } from "./Student";
import type { Course } from "./course";
import type { Group } from "./group";
import type { Fee } from "./fee";

/* =======================
   BASE ENROLLMENT
   (Prisma / API model)
======================= */

export interface Enrollment {
  enrollment_id: string;

  student_id: string;
  course_id: string;
  group_id?: string;

  enrollment_date: string;

  level?: Level;
  status?: string;

  registration_status: RegistrationStatus;

  start_date?: string;
  end_date?: string;

  // relations
  student?: Student;
  course?: Course;
  group?: Group;
  fees?: Fee[];
}

/* =======================
   LIST / TABLE ITEM
======================= */

export interface EnrollmentListItem {
  enrollment_id: string;
  enrollment_date: string;
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

/* =======================
   MUTATION PAYLOADS
======================= */

export interface ValidateEnrollmentPayload {
  enrollment_id: string;
}

export interface RejectEnrollmentPayload {
  enrollment_id: string;
}

export interface MarkEnrollmentPaidPayload {
  enrollment_id: string;
}

export interface FinishEnrollmentPayload {
  enrollment_id: string;
}
