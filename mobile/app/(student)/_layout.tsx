// app/(student)/_layout.tsx
import { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  PanResponder,
  TouchableOpacity,
  Text,
} from "react-native";
import { Tabs, usePathname, useRouter } from "expo-router";
import { FloatingTabBar } from "../../src/components/layout/TabBar";
import type { WheelItem } from "../../src/components/layout/TabBar";
import { TAB_SCREENS, HIDDEN_SCREENS } from "../../src/constants/tabs";
import PageLoader from "../../src/components/common/PageLoader";
import {
  IconArrowRight,
  IconHome,
  IconBook,
  IconSettings,
  IconUser,
  IconBell,
  IconFileText,
  IconClipboardList,
  IconCoin,
} from "@tabler/icons-react-native";

import HomeScreen from "./home";
import CoursesScreen from "./courses";
import SettingsScreen from "./settings";
import ProfileScreen from "./profile";
import DocumentsScreen from "./documents";
import NotificationsScreen from "./notifications";
import AttendanceScreen from "./attendance";
import ScheduleScreen from "./schedule";
import EnrollmentsScreen from "./enrollments";
import FeesScreen from "./fees";
import { useSocket } from "../../src/hooks/useSocket";
import { useTheme } from "../../src/context/ThemeContext";

const { width: SW } = Dimensions.get("window");

const TAB_SCREENS_LIST = [
  HomeScreen,
  CoursesScreen,
  SettingsScreen,
  ProfileScreen,
];
const COUNT = TAB_SCREENS_LIST.length;
const SWIPE_THRESHOLD = SW * 0.12;
const SWIPE_VELOCITY = 0.25;
const TEAL = "#264230";

const OVERLAY_MAP: Record<string, React.ComponentType<any>> = {
  documents: DocumentsScreen,
  notifications: NotificationsScreen,
  attendance: AttendanceScreen,
  schedule: ScheduleScreen,
  enrollments: EnrollmentsScreen,
  fees: FeesScreen,
};

const OVERLAY_TITLES: Record<string, string> = {
  documents: "وثائقي",
  notifications: "الإشعارات",
  attendance: "الحضور",
  schedule: "الجدول",
  enrollments: "تسجيلاتي",
  fees: "رسومي",
};

// ✅ 4 tabs + 6 hidden screens
const WHEEL_ITEMS: WheelItem[] = [
  { name: "home", Icon: IconHome, label: "الرئيسية", isTab: true },
  { name: "documents", Icon: IconFileText, label: "وثائقي", isTab: false },
  { name: "courses", Icon: IconBook, label: "الخدمات", isTab: true },
  { name: "notifications", Icon: IconBell, label: "الإشعارات", isTab: false },
  { name: "settings", Icon: IconSettings, label: "الإعدادات", isTab: true },
  { name: "fees", Icon: IconCoin, label: "رسومي", isTab: false },
  { name: "profile", Icon: IconUser, label: "الملف", isTab: true },
  {
    name: "enrollments",
    Icon: IconClipboardList,
    label: "تسجيلاتي",
    isTab: false,
  },
];

export default function StudentLayout() {
  useSocket();
  const { colors } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [overlay, setOverlay] = useState<string | null>(null);

  const isAnimating = useRef(false);
  const currentIndex = useRef(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const overlayX = useRef(new Animated.Value(SW)).current;
  const ignorePathname = useRef(false);

  const isMounted = useRef(false);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 2900);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (ignorePathname.current) return;
    const parts = pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    const isHidden = HIDDEN_SCREENS.includes(last as any);
    if (isHidden && last !== overlay) {
      setOverlay(last);
      overlayX.setValue(SW);
      Animated.timing(overlayX, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [pathname, loading]);

  const openOverlay = (name: string) => {
    if (overlay === name) return;
    ignorePathname.current = true;
    setOverlay(name);
    overlayX.setValue(SW);
    Animated.timing(overlayX, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      ignorePathname.current = false;
    });
  };

  const closeOverlay = () => {
    ignorePathname.current = true;
    Animated.timing(overlayX, {
      toValue: SW,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setOverlay(null);
      overlayX.setValue(SW);
      setTimeout(() => {
        ignorePathname.current = false;
        router.replace("/(student)/home");
      }, 50);
    });
  };

  function animateTo(index: number) {
    isAnimating.current = true;
    Animated.timing(scrollX, {
      toValue: -index * SW,
      duration: 160,
      useNativeDriver: true,
    }).start(() => {
      isAnimating.current = false;
      currentIndex.current = index;
      setActiveIndex(index);
    });
  }

  function navigateTab(index: number) {
    if (index === currentIndex.current || isAnimating.current) return;
    if (overlay) closeOverlay();
    animateTo(index);
    setActiveIndex(index);
  }

  const startScrollX = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        !isAnimating.current &&
        !overlay &&
        Math.abs(gs.dx) > 6 &&
        Math.abs(gs.dx) > Math.abs(gs.dy) * 1.5,

      onPanResponderGrant: () => {
        scrollX.stopAnimation();
        startScrollX.current = (scrollX as any)._value;
      },

      onPanResponderMove: (_, gs) => {
        const atStart = currentIndex.current === 0 && gs.dx > 0;
        const atEnd = currentIndex.current === COUNT - 1 && gs.dx < 0;
        const dampen = atStart || atEnd ? 0.08 : 1;
        scrollX.setValue(startScrollX.current + gs.dx * dampen);
      },

      onPanResponderRelease: (_, gs) => {
        const { dx, vx } = gs;
        const swipedLeft = dx < -SWIPE_THRESHOLD || vx < -SWIPE_VELOCITY;
        const swipedRight = dx > SWIPE_THRESHOLD || vx > SWIPE_VELOCITY;
        let target = currentIndex.current;
        if (swipedLeft && currentIndex.current < COUNT - 1) target++;
        if (swipedRight && currentIndex.current > 0) target--;
        isAnimating.current = false;
        setActiveIndex(target);
        animateTo(target);
      },

      onPanResponderTerminate: () => animateTo(currentIndex.current),
    }),
  ).current;

  const OverlayScreen = overlay ? OVERLAY_MAP[overlay] : null;

  return (
    <View style={s.root}>
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
          {HIDDEN_SCREENS.map((name) => (
            <Tabs.Screen key={name} name={name} options={{ href: null }} />
          ))}
        </Tabs>
      </View>

      {!loading && (
        <Animated.View
          style={[s.rail, { transform: [{ translateX: scrollX }] }]}
          {...panResponder.panHandlers}
        >
          {TAB_SCREENS_LIST.map((Screen, i) => (
            <View key={i} style={[s.page, { left: i * SW }]}>
              <Screen />
            </View>
          ))}
        </Animated.View>
      )}

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
          wheelItems={WHEEL_ITEMS}
          onWheelSelect={(name) => openOverlay(name)}
        />
      )}

      {OverlayScreen && (
        <Animated.View
          style={[
            s.overlay,
            {
              transform: [{ translateX: overlayX }],
              backgroundColor: colors.background,
            },
          ]}
        >
          <TouchableOpacity
            style={[s.backBtn, { backgroundColor: colors.background }]}
            onPress={closeOverlay}
            activeOpacity={0.8}
          >
            <IconArrowRight size={20} color={colors.teal} strokeWidth={2.5} />
            <Text style={[s.backTitle, { color: colors.teal }]}>
              {overlay ? (OVERLAY_TITLES[overlay] ?? "") : ""}
            </Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            {overlay === "enrollments" ? (
              <OverlayScreen
                onNavigateCourses={() => {
                  closeOverlay();
                  // انتقل للـ tab index 1 (courses) بعد إغلاق الـ overlay
                  setTimeout(() => navigateTab(1), 300);
                }}
              />
            ) : (
              <OverlayScreen />
            )}
          </View>
        </Animated.View>
      )}

      {loading && <PageLoader />}
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, overflow: "hidden" },
  rail: { position: "absolute", top: 0, bottom: 0, width: SW * COUNT },
  page: { position: "absolute", top: 0, bottom: 0, width: SW },
  hidden: { position: "absolute", width: 0, height: 0, overflow: "hidden" },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 52,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backTitle: { fontSize: 16, fontWeight: "700" },
});
