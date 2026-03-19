// src/components/layout/TabBar.tsx
import {
  View,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { useRef, useEffect } from "react";
import type { ComponentType } from "react";
import type { IconProps } from "@tabler/icons-react-native";

const SW = Dimensions.get("window").width;

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const TEAL = "#264230";
const GOLD = "#C4A035";
const WHITE = "#FFFFFF";
const PILL_H = 58;
const PILL_W = SW - 32;

export const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 96 : 78;

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface TabItem {
  readonly name: string;
  readonly Icon: ComponentType<IconProps>;
  readonly label: string;
}

interface TabBarProps {
  tabs: readonly TabItem[];
  activeIndex: number;
  onPress: (index: number) => void;
}

// ─────────────────────────────────────────────
// FloatingTabBar
// ─────────────────────────────────────────────

export function FloatingTabBar({ tabs, activeIndex, onPress }: TabBarProps) {
  const tabCount = tabs.length;
  const tabW = PILL_W / tabCount;

  const indicatorX = useRef(new Animated.Value(activeIndex * tabW)).current;
  const indicatorOff = useRef(new Animated.Value(6)).current;

  // Scale + opacity per tab
  const scales = useRef(
    Array.from(
      { length: tabCount },
      (_, i) => new Animated.Value(i === activeIndex ? 1.18 : 1),
    ),
  ).current;

  const opacities = useRef(
    Array.from(
      { length: tabCount },
      (_, i) => new Animated.Value(i === activeIndex ? 1 : 0.45),
    ),
  ).current;

  // Gold dot opacity
  const dots = useRef(
    Array.from(
      { length: tabCount },
      (_, i) => new Animated.Value(i === activeIndex ? 1 : 0),
    ),
  ).current;

  useEffect(() => {
    Animated.spring(indicatorX, {
      toValue: activeIndex * tabW,
      useNativeDriver: true,
      tension: 85,
      friction: 12,
    }).start();

    scales.forEach((anim, i) => {
      Animated.spring(anim, {
        toValue: i === activeIndex ? 1.18 : 1,
        useNativeDriver: true,
        tension: 120,
        friction: 9,
      }).start();
    });

    opacities.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: i === activeIndex ? 1 : 0.45,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });

    dots.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: i === activeIndex ? 1 : 0,
        duration: 180,
        useNativeDriver: true,
      }).start();
    });
  }, [activeIndex]);

  return (
    <View style={tb.container} pointerEvents="box-none">
      <View style={tb.pill}>
        {/* Sliding active bg */}
        <Animated.View
          style={[
            tb.activeBg,
            {
              width: tabW - 16,
              transform: [
                { translateX: Animated.add(indicatorX, indicatorOff) },
              ],
            },
          ]}
        />

        {/* Tabs */}
        {tabs.map((tab, i) => {
          const { Icon } = tab;
          return (
            <TouchableOpacity
              key={tab.name}
              style={[tb.tab, { width: tabW }]}
              onPress={() => onPress(i)}
              activeOpacity={0.7}
            >
              <Animated.View
                style={{
                  transform: [{ scale: scales[i] }],
                  opacity: opacities[i],
                }}
              >
                <Icon
                  size={24}
                  color={WHITE}
                  strokeWidth={i === activeIndex ? 2 : 1.5}
                />
              </Animated.View>

              {/* Gold dot indicator */}
              <Animated.View style={[tb.dot, { opacity: dots[i] }]} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────

const tb = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 26 : 12,
    left: 16,
    right: 16,
    alignItems: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    width: PILL_W,
    height: PILL_H,
    backgroundColor: "rgba(38, 66, 48, 0.22)",
    borderRadius: PILL_H / 2,
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.20)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    overflow: "hidden",
  },
  activeBg: {
    position: "absolute",
    top: 7,
    height: PILL_H - 14,
    backgroundColor: "#C4A035",
    borderRadius: (PILL_H - 14) / 2,
  },
  tab: {
    height: PILL_H,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: WHITE,
  },
});

// ─────────────────────────────────────────────
// tabBarStyle — invisible Expo Navigator bar
// ─────────────────────────────────────────────

export const tabBarStyle: object = {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  height: TAB_BAR_HEIGHT,
  backgroundColor: "transparent",
  borderTopWidth: 0,
  elevation: 0,
  shadowOpacity: 0,
};
