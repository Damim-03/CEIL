// src/constants/tabs.ts
export const TAB_SCREENS = [
  { name: "home",          emoji: "🏠", label: "الرئيسية"  },
  { name: "courses",       emoji: "📚", label: "دوراتي"    },
  { name: "schedule",      emoji: "📅", label: "الجدول"    },
  { name: "attendance",    emoji: "✅", label: "الحضور"    },
  { name: "notifications", emoji: "🔔", label: "الإشعارات" },
  { name: "profile",       emoji: "👤", label: "الملف"     },
] as const;

export type TabName = (typeof TAB_SCREENS)[number]["name"];