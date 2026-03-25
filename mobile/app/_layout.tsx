// app/_layout.tsx
import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { View, ActivityIndicator } from "react-native";
import AlertModal from "../src/components/common/AlertModal";
import { ThemeProvider, useTheme } from "../src/context/ThemeContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    },
  },
});

// ── StatusBar يتبع الثيم ──────────────────────────────────────────
function ThemedStatusBar() {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? "light" : "dark"} />;
}

// ── Auth Guard ────────────────────────────────────────────────────
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const { colors } = useTheme();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inAuth = segments[0] === "(auth)";
    if (!isAuthenticated && !inAuth) router.replace("/(auth)" as any);
    else if (isAuthenticated && inAuth) router.replace("/(student)/home");
  }, [isAuthenticated, isLoading, router, segments]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.teal2} />
      </View>
    );
  }

  return <>{children}</>;
}

// ── Root Layout ───────────────────────────────────────────────────
export default function RootLayout() {
  useEffect(() => {
    async function register() {
      if (!Device.isDevice) return;

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();

      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        alert("لم يتم منح صلاحية الإشعارات");
        return;
      }

      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log("🔥 Expo Token:", token);

      // 🔥 مهم جداً: أرسله للباك اند
    }

    register();

    // استقبال الإشعارات داخل التطبيق
    const sub = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("📩 Notification received:", notification);
      },
    );

    return () => sub.remove();
  }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <ThemedStatusBar />
            <AuthGuard>
              <Stack
                screenOptions={{ headerShown: false, animation: "fade" }}
                initialRouteName="(auth)"
              >
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(student)" />
              </Stack>
              <AlertModal />
            </AuthGuard>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
