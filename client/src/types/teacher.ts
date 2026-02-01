import type { User } from "./user";
import type { Course } from "./course";
import type { Session } from "./session";

export interface Teacher {
  teacher_id: string;

  first_name: string;
  last_name: string;

  email?: string;
  phone_number?: string;

  created_at: string;

  // relations
  courses?: Course[];
  sessions?: Session[];
  user?: User;
}
