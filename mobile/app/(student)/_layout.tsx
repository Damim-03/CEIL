// app/(student)/_layout.tsx
import { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
  PanResponder,
} from "react-native";
import { Tabs } from "expo-router";
import { FloatingTabBar } from "../../src/components/layout/TabBar";
import { TAB_SCREENS } from "../../src/constants/tabs";
import PageLoader from "../../src/components/common/PageLoader";

import HomeScreen from "./home";
import CoursesScreen from "./courses";
import SettingsScreen from "./settings";
import ProfileScreen from "./profile";

const { width: SW } = Dimensions.get("window");

const SCREENS = [HomeScreen, CoursesScreen, SettingsScreen, ProfileScreen];
const COUNT = SCREENS.length;

const SWIPE_THRESHOLD = SW * 0.22;
const SWIPE_VELOCITY = 0.35;

export default function StudentLayout() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const isAnimating = useRef(false);
  const currentIndex = useRef(0);

  // One animated value — represents the "page offset" in screen widths
  // 0 = first screen, -SW = second screen, -2*SW = third, etc.
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 2900);
    return () => clearTimeout(t);
  }, []);

  // ── Animate scrollX to target index ──
  function animateTo(index: number, velocity = 0) {
    isAnimating.current = true;
    Animated.spring(scrollX, {
      toValue: -index * SW,
      useNativeDriver: true,
      tension: 72,
      friction: 13,
      overshootClamping: true,
      velocity,
    }).start(() => {
      isAnimating.current = false;
      currentIndex.current = index;
      setActiveIndex(index);
    });
  }

  // ── Tab press ──
  function navigateTab(index: number) {
    if (index === currentIndex.current || isAnimating.current) return;
    animateTo(index);
    // Update indicator immediately for responsiveness
    setActiveIndex(index);
  }

  // ── PanResponder ──
  const startScrollX = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        !isAnimating.current &&
        Math.abs(gs.dx) > 6 &&
        Math.abs(gs.dx) > Math.abs(gs.dy) * 1.5,

      onPanResponderGrant: () => {
        // Capture current scrollX value
        scrollX.stopAnimation((val) => {
          startScrollX.current = val;
        });
      },

      onPanResponderMove: (_, gs) => {
        const atStart = currentIndex.current === 0 && gs.dx > 0;
        const atEnd = currentIndex.current === COUNT - 1 && gs.dx < 0;
        const dampen = atStart || atEnd ? 0.1 : 1;
        scrollX.setValue(startScrollX.current + gs.dx * dampen);
      },

      onPanResponderRelease: (_, gs) => {
        const { dx, vx } = gs;
        const swipedLeft = dx < -SWIPE_THRESHOLD || vx < -SWIPE_VELOCITY;
        const swipedRight = dx > SWIPE_THRESHOLD || vx > SWIPE_VELOCITY;

        let target = currentIndex.current;

        if (swipedLeft && currentIndex.current < COUNT - 1) target++;
        if (swipedRight && currentIndex.current > 0) target--;

        setActiveIndex(target);
        animateTo(target, -vx * SW * 0.5);
      },

      onPanResponderTerminate: () => {
        animateTo(currentIndex.current);
      },
    }),
  ).current;

  return (
    <View style={s.root}>
      {/* Hidden Tabs — required by Expo Router for file-based routing */}
      <View style={s.hidden}>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: "none" },
          }}
        >
          {TAB_SCREENS.map(({ name }) => (
            <Tabs.Screen key={name} name={name} />
          ))}
        </Tabs>
      </View>

      {/* All screens rendered side by side — only after loading */}
      {!loading && (
        <Animated.View
          style={[s.rail, { transform: [{ translateX: scrollX }] }]}
          {...panResponder.panHandlers}
        >
          {SCREENS.map((Screen, i) => (
            <View key={i} style={[s.page, { left: i * SW }]}>
              <Screen />
            </View>
          ))}
        </Animated.View>
      )}

      {/* Floating tab bar */}
      {!loading && (
        <FloatingTabBar
          tabs={
            TAB_SCREENS as unknown as {
              name: string;
              Icon: any;
              label: string;
            }[]
          }
          activeIndex={activeIndex}
          onPress={navigateTab}
        />
      )}

      {loading && <PageLoader />}
    </View>
  );
}

const s = StyleSheet.create({
  root: {
    flex: 1,
    overflow: "hidden",
  },
  // The rail holds all screens side by side
  rail: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: SW * COUNT,
  },
  // Each page occupies one screen width
  page: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: SW,
  },
  hidden: {
    position: "absolute",
    width: 0,
    height: 0,
    overflow: "hidden",
  },
});
