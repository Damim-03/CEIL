// ================================================================
// app/(student)/_layout.tsx — Student guard + Tab bar
// ✅ Role guard: STUDENT only → redirect to /(auth)/login
// ✅ Dark mode aware tab bar via useTheme()
// ✅ Unread notifications badge
// ✅ All 12 screens registered (visible + hidden)
// ================================================================
import { Tabs, Redirect } from "expo-router";
import { Platform, View, ActivityIndicator } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/src/lib/Context/AuthContext";
import { useTheme } from "@/src/lib/Context/ThemeContext";

const TEAL = "#2B6F5E";
const TEAL2 = "#3D8B76";

// ── Guard ────────────────────────────────────────────────────────
function Guard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const { theme: t } = useTheme();

  if (isLoading)
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: t.bg,
        }}
      >
        <ActivityIndicator color={TEAL} size="large" />
      </View>
    );

  // ── DEV MODE: comment out these 2 lines to bypass auth during testing ──
  if (!user) return <Redirect href="/(auth)/login" />;
  if (user.role !== "STUDENT") return <Redirect href="/(public)/home" />;
  // ────────────────────────────────────────────────────────────────────────

  return <>{children}</>;
}

// ── Tab bar ──────────────────────────────────────────────────────
function StudentTabs() {
  const { theme: t } = useTheme();

  // TODO: replace with real hook when API connected:
  // const { data } = useStudentUnreadCount();
  const unread = 2; // mock — set to 0 or real value

  const TAB_H = Platform.OS === "ios" ? 84 : 62;
  const PAD_B = Platform.OS === "ios" ? 24 : 8;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: TEAL2,
        tabBarInactiveTintColor: t.text3,
        tabBarStyle: {
          backgroundColor: t.navBg,
          borderTopColor: t.navBorder,
          borderTopWidth: 1,
          height: TAB_H,
          paddingBottom: PAD_B,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "700",
        },
      }}
    >
      {/* ══ VISIBLE TABS ══ */}
      <Tabs.Screen
        name="index"
        options={{
          title: "الرئيسية",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="courses"
        options={{
          title: "الدورات",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "book" : "book-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: "الحضور",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "calendar" : "calendar-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="fees"
        options={{
          title: "الرسوم",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "card" : "card-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "الإشعارات",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "notifications" : "notifications-outline"}
              size={size}
              color={color}
            />
          ),
          tabBarBadge: unread > 0 ? unread : undefined,
          tabBarBadgeStyle: {
            backgroundColor: "#DC2626",
            fontSize: 9,
            minWidth: 16,
            height: 16,
          },
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: "المزيد",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "grid" : "grid-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      {/* ══ HIDDEN — push-accessible, not shown in tab bar ══ */}
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="documents" options={{ href: null }} />
      <Tabs.Screen name="enrollments" options={{ href: null }} />
      <Tabs.Screen name="results" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="group/[groupId]" options={{ href: null }} />
    </Tabs>
  );
}

// ── Root export ──────────────────────────────────────────────────
export default function StudentLayout() {
  return (
    <Guard>
      <StudentTabs />
    </Guard>
  );
}
