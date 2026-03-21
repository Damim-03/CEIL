// src/constants/tabs.ts
import {
  IconHome,
  IconBook,
  IconSettings,
  IconUser,
} from "@tabler/icons-react-native";

export const TAB_SCREENS = [
  { name: "home", Icon: IconHome, label: "الرئيسية" },
  { name: "courses", Icon: IconBook, label: "الخدمات" },
  { name: "settings", Icon: IconSettings, label: "الإعدادات" },
  { name: "profile", Icon: IconUser, label: "الملف" },
] as const;

export const HIDDEN_SCREENS = [
  "attendance",
  "schedule",
  "notifications",
  "documents",
  "enrollments",
  "fees",
] as const;

export type TabName = (typeof TAB_SCREENS)[number]["name"];
