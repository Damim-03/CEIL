import React, { useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/src/lib/Context/ThemeContext";

const TEAL2 = "#3D8B76";
const RED = "#EF4444";
const WHITE = "#FFFFFF";

export interface NavItem {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  badge?: number;
  avatar?: string;
}

interface Props {
  items: NavItem[];
  activeKey: string;
  onPress: (key: string) => void;
}

export default function BottomNavbar({ items, activeKey, onPress }: Props) {
  const insets = useSafeAreaInsets();
  const { theme: t } = useTheme(); // ← من الـ Context المشترك

  const scales = useRef(
    items.reduce(
      (acc, item) => {
        acc[item.key] = new Animated.Value(1);
        return acc;
      },
      {} as Record<string, Animated.Value>,
    ),
  ).current;

  const handlePress = useCallback(
    (key: string) => {
      Animated.sequence([
        Animated.timing(scales[key], {
          toValue: 0.75,
          duration: 65,
          useNativeDriver: true,
        }),
        Animated.spring(scales[key], {
          toValue: 1,
          useNativeDriver: true,
          tension: 280,
          friction: 6,
        }),
      ]).start();
      onPress(key);
    },
    [scales, onPress],
  );

  return (
    <View
      style={[
        s.wrapper,
        { bottom: insets.bottom + (Platform.OS === "ios" ? 10 : 16) },
      ]}
    >
      <View
        style={[
          s.container,
          { backgroundColor: t.navBg, borderColor: t.navBorder },
        ]}
      >
        {items.map((item) => {
          const isActive = item.key === activeKey;
          return (
            <TouchableOpacity
              key={item.key}
              onPress={() => handlePress(item.key)}
              activeOpacity={1}
              style={s.tab}
            >
              <Animated.View
                style={[
                  s.tabInner,
                  { transform: [{ scale: scales[item.key] }] },
                ]}
              >
                <View
                  style={[
                    s.iconWrap,
                    isActive && {
                      backgroundColor: t.pillBg,
                      borderWidth: 1,
                      borderColor: `${TEAL2}30`,
                    },
                  ]}
                >
                  {!!item.badge && (
                    <View style={[s.badge, { borderColor: t.navBg }]}>
                      <Text style={s.badgeText}>{item.badge}</Text>
                    </View>
                  )}
                  {item.avatar ? (
                    <View
                      style={[
                        s.avatar,
                        isActive && { borderWidth: 1.5, borderColor: TEAL2 },
                      ]}
                    >
                      <Text style={s.avatarText}>{item.avatar}</Text>
                    </View>
                  ) : (
                    <Ionicons
                      name={isActive ? item.iconActive : item.icon}
                      size={20}
                      color={isActive ? TEAL2 : t.inactive}
                    />
                  )}
                  {isActive && <View style={s.activeDot} />}
                </View>
                <Text
                  style={[
                    s.label,
                    { color: isActive ? TEAL2 : t.inactive },
                    isActive && s.labelActive,
                  ]}
                >
                  {item.label}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrapper: { position: "absolute", left: 18, right: 18, zIndex: 999 },
  container: {
    flexDirection: "row",
    borderRadius: 24,
    paddingHorizontal: 6,
    paddingVertical: 7,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 18,
  },
  tab: { flex: 1, alignItems: "center" },
  tabInner: { alignItems: "center", gap: 3 },
  iconWrap: {
    width: 46,
    height: 32,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  activeDot: {
    position: "absolute",
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#C4A035",
  },
  label: { fontSize: 10, fontWeight: "600" },
  labelActive: { fontWeight: "700" },
  badge: {
    position: "absolute",
    top: -3,
    right: 3,
    minWidth: 15,
    height: 15,
    borderRadius: 8,
    backgroundColor: RED,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    zIndex: 10,
    borderWidth: 1.5,
  },
  badgeText: { color: WHITE, fontSize: 8, fontWeight: "900" },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#2B6F5E",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: WHITE, fontSize: 11, fontWeight: "800" },
});
