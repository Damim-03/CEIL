import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import {
  Colors,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  Shadow,
} from "../../constants/theme";

// ── Button ───────────────────────────────────────────────────
interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  fullWidth = false,
}: ButtonProps) {
  const styles = btnStyles[variant];

  return (
    <TouchableOpacity
      style={[
        base.btn,
        styles.btn,
        fullWidth && { width: "100%" },
        (disabled || loading) && base.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "ghost" ? Colors.primary : "#fff"}
        />
      ) : (
        <Text style={[base.label, styles.label]}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const base = StyleSheet.create({
  btn: {
    height: 48,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.lg,
  },
  label: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  disabled: { opacity: 0.6 },
});

const btnStyles = {
  primary: StyleSheet.create({
    btn: { backgroundColor: Colors.primary, ...Shadow.sm },
    label: { color: "#fff" },
  }),
  secondary: StyleSheet.create({
    btn: {
      backgroundColor: Colors.surface,
      borderWidth: 1.5,
      borderColor: Colors.border,
    },
    label: { color: Colors.textPrimary },
  }),
  danger: StyleSheet.create({
    btn: {
      backgroundColor: Colors.error + "12",
      borderWidth: 1,
      borderColor: Colors.error + "30",
    },
    label: { color: Colors.error },
  }),
  ghost: StyleSheet.create({
    btn: { backgroundColor: "transparent" },
    label: { color: Colors.primary },
  }),
};

// ── Card ─────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  style?: object;
}

export function Card({ children, style }: CardProps) {
  return <View style={[cardStyle.card, style]}>{children}</View>;
}

const cardStyle = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    ...Shadow.sm,
  },
});

// ── Badge ────────────────────────────────────────────────────
interface BadgeProps {
  label: string;
  color?: string;
  bg?: string;
}

export function Badge({ label, color = Colors.primary, bg }: BadgeProps) {
  return (
    <View style={[badgeStyle.wrap, { backgroundColor: bg ?? color + "14" }]}>
      <Text style={[badgeStyle.text, { color }]}>{label}</Text>
    </View>
  );
}

const badgeStyle = StyleSheet.create({
  wrap: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  text: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
});

// ── Empty State ───────────────────────────────────────────────
interface EmptyProps {
  emoji: string;
  title: string;
  subtitle?: string;
}

export function EmptyState({ emoji, title, subtitle }: EmptyProps) {
  return (
    <View style={emptyStyle.wrap}>
      <Text style={emptyStyle.emoji}>{emoji}</Text>
      <Text style={emptyStyle.title}>{title}</Text>
      {subtitle && <Text style={emptyStyle.sub}>{subtitle}</Text>}
    </View>
  );
}

const emptyStyle = StyleSheet.create({
  wrap: {
    alignItems: "center",
    paddingVertical: Spacing.xxl,
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    ...Shadow.sm,
  },
  emoji: { fontSize: 40 },
  title: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  sub: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textAlign: "center",
  },
});

// ── Loader ───────────────────────────────────────────────────
export function Loader() {
  return (
    <View style={loaderStyle.wrap}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

const loaderStyle = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xxl,
  },
});

// ── Error State ───────────────────────────────────────────────
interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = "فشل تحميل البيانات",
  onRetry,
}: ErrorStateProps) {
  return (
    <View style={errorStyle.wrap}>
      <Text style={errorStyle.emoji}>⚠️</Text>
      <Text style={errorStyle.msg}>{message}</Text>
      {onRetry && (
        <Button label="إعادة المحاولة" onPress={onRetry} variant="primary" />
      )}
    </View>
  );
}

const errorStyle = StyleSheet.create({
  wrap: {
    alignItems: "center",
    paddingVertical: Spacing.xxl,
    gap: Spacing.md,
  },
  emoji: { fontSize: 40 },
  msg: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
    textAlign: "center",
  },
});
