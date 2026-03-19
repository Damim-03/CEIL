// src/constants/tabs.ts
import {
  IconHome,
  IconBook,
  IconSettings,
  IconUser,
} from "@tabler/icons-react-native";

export const TAB_SCREENS = [
  { name: "home", Icon: IconHome, IconFilled: IconHome, label: "الرئيسية" },
  { name: "courses", Icon: IconBook, IconFilled: IconBook, label: "الخدمات" },
  {
    name: "settings",
    Icon: IconSettings,
    IconFilled: IconSettings,
    label: "الإعدادات",
  },
  { name: "profile", Icon: IconUser, IconFilled: IconUser, label: "الملف" },
] as const;

export const HIDDEN_SCREENS = [
  "attendance",
  "schedule",
  "notifications",
] as const;

export type TabName = (typeof TAB_SCREENS)[number]["name"];
