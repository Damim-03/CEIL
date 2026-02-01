import type { Gender } from "./enums";
import type { User } from "./user";
import type { Group } from "./group";
import type { Enrollment } from "./enrollment";
import type { Attendance } from "./attendance";
import type { Fee } from "./fee";
import type { Result } from "./result";
import type { Document } from "./document";

export interface Student {
  student_id: string;

  first_name: string;
  last_name: string;

  email?: string;
  secondary_email?: string;
  phone_number?: string;

  date_of_birth?: string;
  gender?: Gender;

  nationality?: string;
  language?: string;
  education_level?: string;
  study_location?: string;
  address?: string;

  avatar_url?: string;

  status: "Active" | "Inactive";

  user_id: string;
  group_id?: string;

  // relations
  user?: User;
  group?: Group;
  enrollments?: Enrollment[];
  attendance?: Attendance[];
  fees?: Fee[];
  results?: Result[];
  documents?: Document[];
}
