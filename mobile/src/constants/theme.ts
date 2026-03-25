// src/constants/theme.ts
export interface AppColors {
  primary: string;
  textSecondary: ColorValue | undefined;
  isDark: any;
  background: string;
  surface: string;
  surfaceHigh: string;
  overlay: string;
  teal: string;
  teal2: string;
  teal3: string;
  gold: string;
  text: string;
  textMuted: string;
  textOnTeal: string;
  border: string;
  borderLight: string;
  success: string;
  warning: string;
  error: string;
  white: string;
  cream2: string;
}

export const lightColors: AppColors = {
  background: "#F7F3EC",
  surface: "#FFFFFF",
  surfaceHigh: "#FFFFFF",
  overlay: "#F7F3EC",
  teal: "#264230",
  teal2: "#3D6B55",
  teal3: "#1A2E22",
  gold: "#C4A035",
  text: "#111818",
  textMuted: "#8A9E94",
  textOnTeal: "#FFFFFF",
  border: "#DDD8CE",
  borderLight: "#EDE8DF",
  success: "#22C55E",
  warning: "#C4A035",
  error: "#EF4444",
  white: "#FFFFFF",
  cream2: "#EDE8DF",
};

export const darkColors: AppColors = {
  background: "#0D1610",
  surface: "#162018",
  surfaceHigh: "#1E2D24",
  overlay: "#0D1610",
  teal: "#8ECBA4",
  teal2: "#A8D9BC",
  teal3: "#264230",
  gold: "#D4B84A",
  text: "#F4F9F6",
  textMuted: "#AECBBE",
  textOnTeal: "#FFFFFF",
  border: "#2A3D32",
  borderLight: "#1E2D24",
  success: "#4ADE80",
  warning: "#D4B84A",
  error: "#F87171",
  white: "#FFFFFF",
  cream2: "#1E2D24",
};

// ── Legacy Colors — backward compatibility ────────────────────────
export const Colors = {
  // Brand
  primary: lightColors.teal,
  secondary: lightColors.teal2,
  gold: lightColors.gold,

  // Backgrounds
  background: lightColors.background,
  surface: lightColors.surface,
  surfaceHigh: lightColors.surfaceHigh,
  overlay: lightColors.overlay,
  cream2: lightColors.cream2,
  white: lightColors.white,

  // Text — كل الـ aliases لضمان التوافق
  text: lightColors.text,
  textPrimary: lightColors.text,
  textSecondary: lightColors.textMuted,
  textMuted: lightColors.textMuted,
  textOnTeal: lightColors.textOnTeal,

  // Borders
  border: lightColors.border,
  borderLight: lightColors.borderLight,

  // Semantic
  success: lightColors.success,
  warning: lightColors.warning,
  error: lightColors.error,
};

// ── Spacing ───────────────────────────────────────────────────────
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// ── Font sizes ────────────────────────────────────────────────────
export const FontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 26,
  xxxl: 32,
};

// ── Font weights ──────────────────────────────────────────────────
export const FontWeight = {
  light: "300" as const,
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
  black: "900" as const,
};

// ── Border radius ─────────────────────────────────────────────────
export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 9999,
};

// ── Shadow ────────────────────────────────────────────────────────
export const Shadow = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
};
