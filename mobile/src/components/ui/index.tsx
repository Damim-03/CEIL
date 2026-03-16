import React from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";
import { COLORS, SPACING, RADIUS } from "../../constants/theme";

// ─── PageLoader ───────────────────────────────────────────────────────────────
export function PageLoader() {
  return (
    <View style={s.loaderWrap}>
      <ActivityIndicator size="large" color={COLORS.tealMid} />
    </View>
  );
}

// ─── ErrorState ───────────────────────────────────────────────────────────────
export function ErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <View style={s.errorWrap}>
      <View style={s.errorIcon}>
        <Text style={s.errorIconText}>!</Text>
      </View>
      <Text style={s.errorTitle}>حدث خطأ</Text>
      {message && <Text style={s.errorMsg}>{message}</Text>}
      {onRetry && (
        <TouchableOpacity style={s.retryBtn} onPress={onRetry} activeOpacity={0.8}>
          <Text style={s.retryText}>إعادة المحاولة</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({
  icon,
  title,
  subtitle,
}: {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={s.emptyWrap}>
      {icon && <View style={s.emptyIcon}>{icon}</View>}
      <Text style={s.emptyTitle}>{title}</Text>
      {subtitle && <Text style={s.emptySubtitle}>{subtitle}</Text>}
    </View>
  );
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────
type BadgeVariant = "success" | "warning" | "error" | "info" | "default";

const BADGE_STYLES: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: "rgba(43,111,94,0.10)", text: COLORS.tealMid },
  warning: { bg: "rgba(196,160,53,0.10)", text: COLORS.gold },
  error: { bg: "rgba(239,68,68,0.10)", text: COLORS.red },
  info: { bg: "rgba(59,130,246,0.10)", text: COLORS.blue },
  default: { bg: "rgba(155,142,130,0.10)", text: COLORS.textMuted },
};

export function StatusBadge({
  label,
  variant = "default",
  style,
}: {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}) {
  const c = BADGE_STYLES[variant];
  return (
    <View style={[s.badge, { backgroundColor: c.bg }, style]}>
      <Text style={[s.badgeText, { color: c.text }]}>{label}</Text>
    </View>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[s.card, style]}>{children}</View>;
}

// ─── SectionHeader ────────────────────────────────────────────────────────────
export function SectionHeader({
  title,
  icon,
  right,
}: {
  title: string;
  icon?: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <View style={s.sectionHeader}>
      <View style={s.sectionHeaderLeft}>
        {icon && <View style={s.sectionHeaderIcon}>{icon}</View>}
        <Text style={s.sectionHeaderText}>{title}</Text>
      </View>
      {right}
    </View>
  );
}

// ─── CircularProgress ─────────────────────────────────────────────────────────
export function CircularProgress({
  percentage,
  size = 140,
  strokeWidth = 10,
  color = COLORS.tealMid,
  label = "مكتمل",
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const center = size / 2;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
        <Defs>
          <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={color} />
            <Stop offset="100%" stopColor={COLORS.tealLight} />
          </LinearGradient>
        </Defs>
        {/* Track */}
        <Circle cx={center} cy={center} r={radius} stroke="rgba(232,221,212,0.5)" strokeWidth={strokeWidth} fill="none" />
        {/* Progress */}
        <Circle
          cx={center} cy={center} r={radius}
          stroke="url(#grad)" strokeWidth={strokeWidth}
          fill="none" strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={StyleSheet.absoluteFill as ViewStyle}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={[s.circlePercent, { color }]}>{percentage}%</Text>
          <Text style={s.circleLabel}>{label}</Text>
        </View>
      </View>
    </View>
  );
}

// ─── DonutChart ───────────────────────────────────────────────────────────────
export function DonutChart({
  approved,
  pending,
  rejected,
  total,
}: {
  approved: number;
  pending: number;
  rejected: number;
  total: number;
}) {
  const size = 140;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  if (total === 0) {
    return (
      <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 12, color: COLORS.textMuted, textAlign: "center" }}>لا توجد وثائق</Text>
      </View>
    );
  }

  const segments = [
    { value: approved, color: COLORS.tealMid },
    { value: pending, color: COLORS.gold },
    { value: rejected, color: COLORS.red },
  ];

  let offset = 0;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
        <Circle cx={center} cy={center} r={radius} stroke="rgba(232,221,212,0.5)" strokeWidth={strokeWidth} fill="none" />
        {segments.map((seg, i) => {
          if (seg.value === 0) return null;
          const len = (seg.value / total) * circumference;
          const el = (
            <Circle
              key={i} cx={center} cy={center} r={radius}
              stroke={seg.color} strokeWidth={strokeWidth} fill="none"
              strokeDasharray={`${len} ${circumference}`}
              strokeDashoffset={-offset} strokeLinecap="round"
            />
          );
          offset += len;
          return el;
        })}
      </Svg>
      <View style={StyleSheet.absoluteFill as ViewStyle}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={[s.circlePercent, { color: COLORS.text }]}>{total}</Text>
          <Text style={s.circleLabel}>المجموع</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  loaderWrap: { flex: 1, alignItems: "center", justifyContent: "center", minHeight: 200 },
  errorWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: SPACING.xl, minHeight: 200 },
  errorIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(239,68,68,0.1)", alignItems: "center", justifyContent: "center", marginBottom: SPACING.md },
  errorIconText: { fontSize: 24, fontWeight: "700", color: #EF4444 },
  errorTitle: { fontSize: 16, fontWeight: "600", color: #EF4444, marginBottom: 4 },
  errorMsg: { fontSize: 13, color: #1B1B1BMuted, textAlign: "center", marginBottom: SPACING.md },
  retryBtn: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, backgroundColor: #2B6F5E, borderRadius: RADIUS.lg },
  retryText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  emptyWrap: { alignItems: "center", justifyContent: "center", padding: SPACING.xxxl, minHeight: 180 },
  emptyIcon: { width: 56, height: 56, borderRadius: 16, backgroundColor: "#F0EBE5", alignItems: "center", justifyContent: "center", marginBottom: SPACING.md },
  emptyTitle: { fontSize: 15, fontWeight: "600", color: #1B1B1B, marginBottom: 4, textAlign: "center" },
  emptySubtitle: { fontSize: 13, color: #1B1B1BMuted, textAlign: "center" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },
  card: { backgroundColor: #FFFFFF, borderRadius: RADIUS.xl, borderWidth: 1, borderColor: #E8DDD4Light, overflow: "hidden" },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: "rgba(232,221,212,0.4)" },
  sectionHeaderLeft: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  sectionHeaderIcon: {},
  sectionHeaderText: { fontSize: 14, fontWeight: "600", color: #1B1B1B },
  circlePercent: { fontSize: 26, fontWeight: "700" },
  circleLabel: { fontSize: 10, color: #1B1B1BMuted, fontWeight: "500", marginTop: 2, textTransform: "uppercase", letterSpacing: 0.8 },
});
