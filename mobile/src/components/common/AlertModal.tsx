// src/components/common/AlertModal.tsx
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
} from "react-native";
import { useRef, useState, useEffect } from "react";
import {
  IconCircleCheck,
  IconAlertTriangle,
  IconX,
  IconInfoCircle,
  IconAlertCircle,
} from "@tabler/icons-react-native";

Dimensions.get("window");

// ── Types ─────────────────────────────────────────────────────────
export type AlertType = "success" | "error" | "warning" | "info" | "confirm";

interface AlertOptions {
  type: AlertType;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

// ── Global Manager ────────────────────────────────────────────────
type Listener = (opts: AlertOptions) => void;
let _listener: Listener | null = null;

export const AlertManager = {
  show: (opts: AlertOptions) => {
    if (_listener) _listener(opts);
  },
};

// ── Config ────────────────────────────────────────────────────────
const ALERT_CONFIG: Record<
  AlertType,
  {
    icon: any;
    iconColor: string;
    iconBg: string;
    confirmBg: string;
    confirmText: string;
    titleColor: string;
    borderColor: string;
  }
> = {
  success: {
    icon: IconCircleCheck,
    iconColor: "#15803D",
    iconBg: "#DCFCE7",
    confirmBg: "#264230",
    confirmText: "#FFFFFF",
    titleColor: "#111818",
    borderColor: "#86EFAC",
  },
  error: {
    icon: IconX,
    iconColor: "#B91C1C",
    iconBg: "#FEE2E2",
    confirmBg: "#EF4444",
    confirmText: "#FFFFFF",
    titleColor: "#111818",
    borderColor: "#FCA5A5",
  },
  warning: {
    icon: IconAlertTriangle,
    iconColor: "#A16207",
    iconBg: "#FEF9C3",
    confirmBg: "#C4A035",
    confirmText: "#264230",
    titleColor: "#111818",
    borderColor: "#FDE047",
  },
  info: {
    icon: IconInfoCircle,
    iconColor: "#1D4ED8",
    iconBg: "#DBEAFE",
    confirmBg: "#264230",
    confirmText: "#FFFFFF",
    titleColor: "#111818",
    borderColor: "#93C5FD",
  },
  confirm: {
    icon: IconAlertCircle,
    iconColor: "#A16207",
    iconBg: "#FEF9C3",
    confirmBg: "#EF4444",
    confirmText: "#FFFFFF",
    titleColor: "#111818",
    borderColor: "#FDE047",
  },
};

// ── AlertModal Component ──────────────────────────────────────────
export default function AlertModal() {
  const [visible, setVisible] = useState(false);
  const [opts, setOpts] = useState<AlertOptions | null>(null);
  const scale = useRef(new Animated.Value(0.8)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  // Register listener
  useEffect(() => {
    _listener = (newOpts) => {
      setOpts(newOpts);
      setVisible(true);
    };
    return () => {
      _listener = null;
    };
  }, []);

  // Animate in
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 120,
          friction: 10,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scale.setValue(0.8);
      opacity.setValue(0);
    }
  }, [opacity, scale, visible]);

  const dismiss = (cb?: () => void) => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.85,
        useNativeDriver: true,
        tension: 150,
        friction: 12,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      cb?.();
    });
  };

  if (!opts) return null;

  const cfg = ALERT_CONFIG[opts.type];
  const Icon = cfg.icon;
  const isConfirm = opts.type === "confirm";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={() => dismiss(opts.onCancel)}
    >
      <View style={s.backdrop}>
        <Animated.View
          style={[
            s.card,
            { transform: [{ scale }], opacity, borderColor: cfg.borderColor },
          ]}
        >
          {/* Icon */}
          <View style={[s.iconWrap, { backgroundColor: cfg.iconBg }]}>
            <Icon size={28} color={cfg.iconColor} strokeWidth={2} />
          </View>

          {/* Title */}
          <Text style={[s.title, { color: cfg.titleColor }]}>{opts.title}</Text>

          {/* Message */}
          {opts.message ? <Text style={s.message}>{opts.message}</Text> : null}

          {/* Buttons */}
          {isConfirm ? (
            <View style={s.btnRow}>
              <TouchableOpacity
                style={s.cancelBtn}
                onPress={() => dismiss(opts.onCancel)}
                activeOpacity={0.8}
              >
                <Text style={s.cancelText}>{opts.cancelText ?? "إلغاء"}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.confirmBtn, { backgroundColor: cfg.confirmBg }]}
                onPress={() => dismiss(opts.onConfirm)}
                activeOpacity={0.85}
              >
                <Text style={[s.confirmText, { color: cfg.confirmText }]}>
                  {opts.confirmText ?? "تأكيد"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[s.singleBtn, { backgroundColor: cfg.confirmBg }]}
              onPress={() => dismiss(opts.onConfirm)}
              activeOpacity={0.85}
            >
              <Text style={[s.confirmText, { color: cfg.confirmText }]}>
                {opts.confirmText ?? "حسناً"}
              </Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  card: {
    width: "100%",
    backgroundColor: "#F7F3EC",
    borderRadius: 28,
    padding: 28,
    alignItems: "center",
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 12,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 26,
  },
  message: {
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 4,
  },
  btnRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#DDD8CE",
    alignItems: "center",
  },
  cancelText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8A9E94",
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  singleBtn: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 20,
  },
  confirmText: {
    fontSize: 15,
    fontWeight: "800",
  },
});
