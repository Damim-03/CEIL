export const Colors = {
  // ── CEIL Brand ──────────────────────────
  primary: "#264230",      // teal داكن
  primaryLight: "#2B6F5E", // teal فاتح
  gold: "#C4A035",         // ذهبي
  goldLight: "#D8B84E",

  // ── Neutrals ────────────────────────────
  background: "#F5F4F0",
  surface: "#FFFFFF",
  surfaceAlt: "#EEECE6",
  border: "#D8CDC0",
  borderLight: "#E8E4DC",

  // ── Text ────────────────────────────────
  textPrimary: "#1A1A1A",
  textSecondary: "#5C5C5C",
  textMuted: "#9E9E9E",
  textInverse: "#FFFFFF",

  // ── Status ──────────────────────────────
  success: "#2E7D32",
  successLight: "#E8F5E9",
  warning: "#F59E0B",
  warningLight: "#FEF3C7",
  error: "#C62828",
  errorLight: "#FFEBEE",
  info: "#1565C0",
  infoLight: "#E3F2FD",

  // ── Dark mode ───────────────────────────
  dark: {
    background: "#0D0D0D",
    surface: "#1A1A1A",
    surfaceAlt: "#242424",
    border: "#2E2E2E",
    textPrimary: "#F0EEE8",
    textSecondary: "#A0A0A0",
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
} as const;

export const FontWeight = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
};

export const Shadow = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 10,
  },
} as const;