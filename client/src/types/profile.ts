import type { Gender } from "./enums";

/* =======================
   USER / STUDENT PROFILE
======================= */

export interface Profile {
  first_name?: string;
  last_name?: string;

  email: string;
  secondary_email?: string;

  phone_number?: string;

  date_of_birth?: string; // ISO string from API
  gender?: Gender;

  nationality?: string;
  education_level?: string;
  study_location?: string;
  language?: string;
  address?: string;
}
