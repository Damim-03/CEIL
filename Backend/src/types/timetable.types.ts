// src/types/timetable.types.ts

export const DAYS_AR: Record<number, string> = {
  0: "السبت",
  1: "الأحد",
  2: "الإثنين",
  3: "الثلاثاء",
  4: "الأربعاء",
  5: "الخميس",
};

export const VALID_LANGUAGES = ["FR", "EN", "ES", "DE", "TR", "GR", "IT", "AR"] as const;
export const VALID_LEVELS    = ["PRE_A1", "A1", "A1,1", "A2", "B1", "B2", "C1", "قاعدي"] as const;

export type TimetableLang  = (typeof VALID_LANGUAGES)[number];
export type TimetableLevel = (typeof VALID_LEVELS)[number];

// ── Request bodies ─────────────────────────────────────────────

export interface CreateTimetableEntryDTO {
  room_id:      string;
  group_id?:    string;
  day_of_week:  number;   // 0–5
  start_time:   string;   // "HH:MM"
  end_time:     string;   // "HH:MM"
  level:        string;
  language:     string;
  group_label:  string;
  session_name?: string;
}

export interface UpdateTimetableEntryDTO extends Partial<CreateTimetableEntryDTO> {}

export interface TimetableFilterQuery {
  room_id?:     string;
  day_of_week?: string;   // query param → parse to int
  language?:    string;
  level?:       string;
  group_id?:    string;
}