// ─── CEIL Brand Colors — flat constants (safe for StyleSheet.create) ─────────

export const COLOR_TEAL       = "#264230";
export const COLOR_TEAL_MID   = "#2B6F5E";
export const COLOR_TEAL_LIGHT = "#4ADE80";
export const COLOR_GOLD       = "#C4A035";
export const COLOR_GOLD_LIGHT = "#D4A843";

export const COLOR_WHITE       = "#FFFFFF";
export const COLOR_BG          = "#F8F4F0";
export const COLOR_BORDER      = "#E8DDD4";
export const COLOR_BORDER_LIGHT = "rgba(232,221,212,0.7)";
export const COLOR_TEXT        = "#1B1B1B";
export const COLOR_TEXT_MUTED  = "#9B8E82";
export const COLOR_TEXT_SUB    = "#6B5D4F";

export const COLOR_DARK        = "#0A0A0A";
export const COLOR_DARK1       = "#111111";
export const COLOR_DARK2       = "#1A1A1A";
export const COLOR_DARK3       = "#1E1E1E";
export const COLOR_DARK_BORDER = "#2A2A2A";
export const COLOR_DARK_TEXT   = "#E8E8E8";
export const COLOR_DARK_MUTED  = "#555555";

export const COLOR_RED         = "#EF4444";
export const COLOR_RED_BG      = "rgba(239,68,68,0.06)";
export const COLOR_AMBER       = "#F59E0B";
export const COLOR_EMERALD     = "#10B981";
export const COLOR_BLUE        = "#3B82F6";

// ─── Convenience object (use only INSIDE functions/components, not at module level) ──
export const COLORS = {
  teal:        COLOR_TEAL,
  tealMid:     COLOR_TEAL_MID,
  tealLight:   COLOR_TEAL_LIGHT,
  gold:        COLOR_GOLD,
  goldLight:   COLOR_GOLD_LIGHT,
  white:       COLOR_WHITE,
  bg:          COLOR_BG,
  border:      COLOR_BORDER,
  borderLight: COLOR_BORDER_LIGHT,
  text:        COLOR_TEXT,
  textMuted:   COLOR_TEXT_MUTED,
  textSub:     COLOR_TEXT_SUB,
  dark:        COLOR_DARK,
  dark1:       COLOR_DARK1,
  dark2:       COLOR_DARK2,
  dark3:       COLOR_DARK3,
  darkBorder:  COLOR_DARK_BORDER,
  darkText:    COLOR_DARK_TEXT,
  darkMuted:   COLOR_DARK_MUTED,
  red:         COLOR_RED,
  redBg:       COLOR_RED_BG,
  amber:       COLOR_AMBER,
  emerald:     COLOR_EMERALD,
  blue:        COLOR_BLUE,
} as const;

export const BRAND = COLORS;

// ─── Spacing ──────────────────────────────────────────────────────────────────
export const SPACING = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  24,
  xxxl: 32,
} as const;

// ─── Border Radius ────────────────────────────────────────────────────────────
export const RADIUS = {
  sm:  8,
  md:  12,
  lg:  16,
  xl:  20,
  xxl: 24,
} as const;

