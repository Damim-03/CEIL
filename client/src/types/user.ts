import type { UserRole } from "./enums";
import type { Student } from "./Student";
import type { Teacher } from "./Teacher";
import type { Document } from "./document";

export interface User {
  user_id: string;

  email: string;
  password?: string;

  role: UserRole;
  is_active: boolean;

  google_id?: string;
  google_email?: string;
  google_avatar?: string;

  student_id?: string;
  teacher_id?: string;

  created_at: string;

  // relations
  student?: Student;
  teacher?: Teacher;
  documents?: Document[];
}
