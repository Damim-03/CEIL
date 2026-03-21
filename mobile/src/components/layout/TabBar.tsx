// src/components/layout/TabBar.tsx
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Animated,
  Dimensions,
  PanResponder,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
} from "react-native";
import { useRef, useEffect, useState } from "react";
import type { ComponentType } from "react";
import type { IconProps } from "@tabler/icons-react-native";

const { width: SW, height: SH } = Dimensions.get("window");

const GOLD = "#C4A035";
const TEAL2 = "#3D6B55";
const TEAL3 = "#1A2E22";
const WHITE = "#FFFFFF";

const PILL_H = 62;
const PILL_W = SW - 32;
const LONG_PRESS_MS = 500;
const WHEEL_RADIUS = 150; // أكبر لاستيعاب 8 أيقونات
const ICON_BOX = 54;
const CENTER_BTN = 72;

export const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 100 : 82;

export interface TabItem {
  readonly name: string;
  readonly Icon: ComponentType<IconProps>;
  readonly label: string;
}

// ✅ نوع جديد للدائرة يشمل tab + hidden
export interface WheelItem {
  readonly name: string;
  readonly Icon: ComponentType<IconProps>;
  readonly label: string;
  readonly isTab: boolean; // true = tab عادي, false = hidden screen
}

interface TabBarProps {
  tabs: readonly TabItem[];
  activeIndex: number;
  onPress: (index: number) => void;
  // ✅ قائمة الدائرة الكاملة (tabs + hidden screens)
  wheelItems?: readonly WheelItem[];
  onWheelSelect?: (name: string) => void;
}

// ── WheelMenu ─────────────────────────────────────────────────────
function WheelMenu({
  visible,
  items,
  activeTabIndex,
  onSelect,
  onClose,
}: {
  visible: boolean;
  items: readonly WheelItem[];
  activeTabIndex: number;
  onSelect: (name: string, isTab: boolean, tabIndex?: number) => void;
  onClose: () => void;
}) {
  const N = items.length;
  const STEP = (2 * Math.PI) / N;
  const CX = SW / 2;
  const CY = SH / 2;
  const HALF = WHEEL_RADIUS + ICON_BOX;

  const backdropA = useRef(new Animated.Value(0)).current;
  const scaleA = useRef(new Animated.Value(0)).current;
  const itemAnims = useRef(items.map(() => new Animated.Value(0))).current;
  const ringRotA = useRef(new Animated.Value(0)).current;

  const rotRef = useRef(0);
  const startTouch = useRef(0);
  const velocityRef = useRef(0);
  const lastTime = useRef(0);
  const lastAngle = useRef(0);
  const rafId = useRef<any>(null);

  const [rotDeg, setRotDeg] = useState(0);
  const [activeLocal, setActiveLocal] = useState(0);

  const onSelectRef = useRef(onSelect);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const topIndex = (rot: number) => {
    const norm = ((-rot % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    return Math.round(norm / STEP) % N;
  };

  const applyRot = (rad: number) => {
    rotRef.current = rad;
    setRotDeg(rad * (180 / Math.PI));
    setActiveLocal(topIndex(rad));
  };

  const snapAndNavigate = (vel: number) => {
    if (rafId.current) cancelAnimationFrame(rafId.current);
    let current = rotRef.current;
    let v = vel;
    let prev = performance.now();
    let phase: "momentum" | "snap" = Math.abs(vel) > 0.1 ? "momentum" : "snap";
    let snapTarget = Math.round(current / STEP) * STEP;
    let snapStart = current;
    let snapT = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - prev) / 1000, 0.05);
      prev = now;

      if (phase === "momentum") {
        v *= Math.pow(0.85, dt * 60);
        current += v * dt;
        applyRot(current);
        if (Math.abs(v) < 0.08) {
          phase = "snap";
          snapTarget = Math.round(current / STEP) * STEP;
          snapStart = current;
          snapT = 0;
        }
        rafId.current = requestAnimationFrame(tick);
      } else {
        snapT += dt * 8;
        const val =
          snapStart + (snapTarget - snapStart) * (1 - Math.exp(-snapT));
        applyRot(val);
        if (snapT < 3) {
          rafId.current = requestAnimationFrame(tick);
        } else {
          applyRot(snapTarget);
          const idx = topIndex(snapTarget);
          const selected = items[idx];
          // حساب tabIndex إذا كان tab عادي
          const tabIndex = selected.isTab
            ? items
                .filter((it) => it.isTab)
                .findIndex((it) => it.name === selected.name)
            : undefined;
          onSelectRef.current(selected.name, selected.isTab, tabIndex);
          onCloseRef.current();
        }
      }
    };
    rafId.current = requestAnimationFrame(tick);
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (e) => {
        if (rafId.current) cancelAnimationFrame(rafId.current);
        const dx = e.nativeEvent.pageX - CX;
        const dy = e.nativeEvent.pageY - CY;
        startTouch.current = Math.atan2(dy, dx) - rotRef.current;
        lastAngle.current = Math.atan2(dy, dx);
        lastTime.current = performance.now();
        velocityRef.current = 0;
      },

      onPanResponderMove: (e) => {
        const dx = e.nativeEvent.pageX - CX;
        const dy = e.nativeEvent.pageY - CY;
        const angle = Math.atan2(dy, dx);
        const rot = angle - startTouch.current;
        const now = performance.now();
        const dt = (now - lastTime.current) / 1000;
        if (dt > 0) {
          let dA = angle - lastAngle.current;
          if (dA > Math.PI) dA -= 2 * Math.PI;
          if (dA < -Math.PI) dA += 2 * Math.PI;
          velocityRef.current = dA / dt;
        }
        lastAngle.current = angle;
        lastTime.current = now;
        applyRot(rot);
      },

      onPanResponderRelease: () => snapAndNavigate(velocityRef.current),
      onPanResponderTerminate: () => snapAndNavigate(0),
    }),
  ).current;

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.timing(ringRotA, {
          toValue: 360,
          duration: 14000,
          useNativeDriver: true,
        }),
      ).start();
    } else {
      ringRotA.stopAnimation();
      ringRotA.setValue(0);
    }
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [ringRotA, visible]);

  useEffect(() => {
    if (visible) {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rotRef.current = 0;
      setRotDeg(0);
      setActiveLocal(0);
      Animated.parallel([
        Animated.timing(backdropA, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleA, {
          toValue: 1,
          tension: 130,
          friction: 10,
          useNativeDriver: true,
        }),
        ...itemAnims.map((a, i) =>
          Animated.spring(a, {
            toValue: 1,
            tension: 140,
            friction: 10,
            delay: i * 40,
            useNativeDriver: true,
          }),
        ),
      ]).start();
    } else {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      Animated.parallel([
        Animated.timing(backdropA, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(scaleA, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        ...itemAnims.map((a) =>
          Animated.timing(a, {
            toValue: 0,
            duration: 140,
            useNativeDriver: true,
          }),
        ),
      ]).start();
    }
  }, [backdropA, itemAnims, scaleA, visible]);

  if (!visible) return null;

  const ringRotDeg = ringRotA.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <Modal
      transparent
      animationType="none"
      visible={visible}
      onRequestClose={onClose}
    >
      <Animated.View style={[wm.backdrop, { opacity: backdropA }]}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFillObject} />
        </TouchableWithoutFeedback>
      </Animated.View>

      <Animated.View
        style={[
          wm.wheelWrap,
          {
            left: CX - HALF,
            top: CY - HALF,
            width: HALF * 2,
            height: HALF * 2,
            transform: [{ scale: scaleA }],
          },
        ]}
        {...pan.panHandlers}
      >
        {/* Rings */}
        <View
          style={[
            wm.ringFixed,
            {
              width: HALF * 2 - 4,
              height: HALF * 2 - 4,
              borderRadius: HALF - 2,
              left: 2,
              top: 2,
            },
          ]}
          pointerEvents="none"
        />
        <Animated.View
          style={[
            wm.ringRotating,
            {
              width: WHEEL_RADIUS * 2 + 28,
              height: WHEEL_RADIUS * 2 + 28,
              borderRadius: WHEEL_RADIUS + 14,
              left: HALF - WHEEL_RADIUS - 14,
              top: HALF - WHEEL_RADIUS - 14,
              transform: [{ rotate: ringRotDeg }],
            },
          ]}
          pointerEvents="none"
        />
        <View
          style={[
            wm.ringInner,
            {
              width: WHEEL_RADIUS * 2,
              height: WHEEL_RADIUS * 2,
              borderRadius: WHEEL_RADIUS,
              left: HALF - WHEEL_RADIUS,
              top: HALF - WHEEL_RADIUS,
            },
          ]}
          pointerEvents="none"
        />
        <View
          style={[
            wm.ringCore,
            {
              width: CENTER_BTN + 24,
              height: CENTER_BTN + 24,
              borderRadius: (CENTER_BTN + 24) / 2,
              left: HALF - (CENTER_BTN + 24) / 2,
              top: HALF - (CENTER_BTN + 24) / 2,
            },
          ]}
          pointerEvents="none"
        />

        {/* Icons */}
        {items.map((item, i) => {
          const { Icon } = item;
          const angle = STEP * i - Math.PI / 2 + rotDeg * (Math.PI / 180);
          const tx = Math.cos(angle) * WHEEL_RADIUS;
          const ty = Math.sin(angle) * WHEEL_RADIUS;
          const isActive = i === activeLocal;

          return (
            <Animated.View
              key={item.name}
              style={[
                wm.iconWrap,
                {
                  left: HALF + tx - ICON_BOX / 2,
                  top: HALF + ty - ICON_BOX / 2,
                  width: ICON_BOX,
                  height: ICON_BOX,
                  opacity: itemAnims[i],
                  transform: [{ scale: itemAnims[i] }],
                },
              ]}
            >
              {isActive && <View style={wm.halo} />}
              <View
                style={[
                  wm.iconBtn,
                  isActive && wm.iconBtnActive,
                  // ✅ hidden screens لها لون مختلف قليلاً
                  !item.isTab && !isActive && wm.iconBtnHidden,
                ]}
              >
                <Icon
                  size={20}
                  color={isActive ? TEAL3 : WHITE}
                  strokeWidth={isActive ? 2.4 : 1.7}
                />
                <Text
                  style={[wm.iconLabel, isActive && wm.iconLabelActive]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
              </View>
            </Animated.View>
          );
        })}

        {/* Center */}
        <TouchableOpacity
          style={[
            wm.center,
            {
              left: HALF - CENTER_BTN / 2,
              top: HALF - CENTER_BTN / 2,
              width: CENTER_BTN,
              height: CENTER_BTN,
              borderRadius: CENTER_BTN / 2,
            },
          ]}
          onPress={onClose}
          activeOpacity={0.85}
        >
          <Image
            source={require("../../../assets/logo-2.png")}
            style={wm.logoImg}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[wm.hint, { opacity: backdropA }]}>
        <View style={wm.hintPill}>
          <Text style={wm.hintText}>اسحب للتدوير • أفلت للاختيار</Text>
        </View>
      </Animated.View>
    </Modal>
  );
}

const wm = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5,10,7,0.88)",
  },
  wheelWrap: { position: "absolute" },
  ringFixed: {
    position: "absolute",
    borderWidth: 0.5,
    borderColor: "rgba(196,160,53,0.12)",
  },
  ringRotating: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "rgba(196,160,53,0.22)",
    borderStyle: "dashed",
  },
  ringInner: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "rgba(196,160,53,0.28)",
    backgroundColor: "rgba(26,46,34,0.32)",
  },
  ringCore: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "rgba(196,160,53,0.16)",
  },
  halo: {
    position: "absolute",
    width: ICON_BOX + 14,
    height: ICON_BOX + 14,
    borderRadius: (ICON_BOX + 14) / 2,
    backgroundColor: GOLD + "22",
    top: -7,
    left: -7,
  },
  iconWrap: { position: "absolute" },
  iconBtn: {
    width: ICON_BOX,
    height: ICON_BOX,
    borderRadius: ICON_BOX / 2,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    backgroundColor: TEAL2,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.14)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  // hidden screens — لون أغمق قليلاً للتمييز
  iconBtnHidden: {
    backgroundColor: "#2A5240",
    borderColor: "rgba(196,160,53,0.2)",
  },
  iconBtnActive: {
    backgroundColor: GOLD,
    borderColor: "rgba(255,255,255,0.6)",
    shadowColor: GOLD,
    shadowOpacity: 0.7,
    shadowRadius: 12,
    elevation: 12,
  },
  iconLabel: {
    color: WHITE,
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 0.2,
    opacity: 0.75,
    textAlign: "center",
  },
  iconLabelActive: { color: TEAL3, opacity: 1 },
  center: {
    position: "absolute",
    backgroundColor: TEAL3,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2.5,
    borderColor: GOLD + "90",
    shadowColor: GOLD,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 16,
  },
  logoImg: { width: 74, height: 74 },
  hint: {
    position: "absolute",
    bottom: TAB_BAR_HEIGHT + 28,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  hintPill: {
    backgroundColor: "rgba(38,66,48,0.75)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderWidth: 0.5,
    borderColor: GOLD + "50",
  },
  hintText: {
    color: GOLD + "CC",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.4,
  },
});

// ── FloatingTabBar ────────────────────────────────────────────────
export function FloatingTabBar({
  tabs,
  activeIndex,
  onPress,
  wheelItems,
  onWheelSelect,
}: TabBarProps) {
  const tabCount = tabs.length;
  const tabW = PILL_W / tabCount;

  const [radialVisible, setRadialVisible] = useState(false);

  const onPressRef = useRef(onPress);
  useEffect(() => {
    onPressRef.current = onPress;
  }, [onPress]);

  const pillOpacity = useRef(new Animated.Value(1)).current;
  const pillScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(pillOpacity, {
        toValue: radialVisible ? 0 : 1,
        duration: radialVisible ? 180 : 320,
        useNativeDriver: true,
      }),
      Animated.spring(pillScale, {
        toValue: radialVisible ? 0.78 : 1,
        useNativeDriver: true,
        tension: 120,
        friction: 10,
      }),
    ]).start();
  }, [pillOpacity, pillScale, radialVisible]);

  const indicatorX = useRef(new Animated.Value(activeIndex * tabW)).current;

  const opacities = useRef(
    Array.from(
      { length: tabCount },
      (_, i) => new Animated.Value(i === 0 ? 1 : 0.5),
    ),
  ).current;

  const dots = useRef(
    Array.from(
      { length: tabCount },
      (_, i) => new Animated.Value(i === 0 ? 1 : 0),
    ),
  ).current;

  useEffect(() => {
    Animated.spring(indicatorX, {
      toValue: activeIndex * tabW,
      useNativeDriver: true,
      tension: 85,
      friction: 12,
    }).start();
    opacities.forEach((anim, i) =>
      Animated.timing(anim, {
        toValue: i === activeIndex ? 1 : 0.5,
        duration: 200,
        useNativeDriver: true,
      }).start(),
    );
    dots.forEach((anim, i) =>
      Animated.timing(anim, {
        toValue: i === activeIndex ? 1 : 0,
        duration: 180,
        useNativeDriver: true,
      }).start(),
    );
  }, [activeIndex, dots, indicatorX, opacities, tabW]);

  const indicatorTranslate = useRef(
    Animated.add(indicatorX, new Animated.Value(8)),
  ).current;

  // ✅ بناء قائمة الدائرة: tabs أولاً ثم hidden screens
  const effectiveWheelItems: WheelItem[] = wheelItems
    ? [...wheelItems]
    : tabs.map((t) => ({ ...t, isTab: true }));

  return (
    <>
      <WheelMenu
        visible={radialVisible}
        items={effectiveWheelItems}
        activeTabIndex={activeIndex}
        onSelect={(name, isTab, tabIndex) => {
          if (isTab && tabIndex !== undefined) {
            onPressRef.current(tabIndex);
          } else {
            onWheelSelect?.(name);
          }
          setRadialVisible(false);
        }}
        onClose={() => setRadialVisible(false)}
      />

      <Animated.View
        style={[
          tb.wrapper,
          { opacity: pillOpacity, transform: [{ scale: pillScale }] },
        ]}
        pointerEvents={radialVisible ? "none" : "box-none"}
      >
        <View style={tb.pill}>
          <Animated.View
            style={[
              tb.activeBg,
              {
                width: tabW - 16,
                transform: [{ translateX: indicatorTranslate }],
              },
            ]}
          />

          {tabs.map((tab, i) => {
            const { Icon } = tab;
            return (
              <TouchableOpacity
                key={tab.name}
                style={[tb.tab, { width: tabW }]}
                onPress={() => onPressRef.current(i)}
                onLongPress={() => setRadialVisible(true)}
                delayLongPress={LONG_PRESS_MS}
                activeOpacity={0.75}
              >
                <Animated.View
                  style={{
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: opacities[i],
                  }}
                >
                  <Icon
                    size={24}
                    color={WHITE}
                    strokeWidth={i === activeIndex ? 2.2 : 1.5}
                  />
                </Animated.View>
                <Animated.View style={[tb.dot, { opacity: dots[i] }]} />
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>
    </>
  );
}

const tb = StyleSheet.create({
  wrapper: {
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
    backgroundColor: "rgba(38,66,48,0.28)",
    borderRadius: PILL_H / 2,
    borderWidth: 0.5,
    borderColor: "rgba(255,255,255,0.18)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 10,
    overflow: "hidden",
  },
  activeBg: {
    position: "absolute",
    top: 8,
    left: 0,
    height: PILL_H - 16,
    backgroundColor: GOLD,
    borderRadius: (PILL_H - 16) / 2,
  },
  tab: {
    height: PILL_H,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: WHITE },
});

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
