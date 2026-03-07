// ================================================================
// app/(auth)/_layout.tsx — Guest guard
// ✅ مسجّل دخول → يُعاد توجيهه لصفحته حسب دوره
// ✅ غير مسجّل → يبقى في صفحة login
// ✅ import path صحيح: @/src/lib/AuthContext (ليس Context/AuthContext)
// ================================================================
import { Stack, Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "@/src/lib/Context/AuthContext";
import { useTheme } from "@/src/lib/Context/ThemeContext";

export default function AuthLayout() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { theme: t } = useTheme();

  // ── Loading state ─────────────────────────────────────────────
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#080A0C",
        }}
      >
        <ActivityIndicator color="#3D8B76" size="large" />
      </View>
    );
  }

  // ── Already authenticated → redirect to correct dashboard ─────
  if (isAuthenticated) {
    switch (user?.role) {
      case "STUDENT":
        return <Redirect href="/(student)/" />;
      case "TEACHER":
        return <Redirect href="/(teacher)/" />;
      case "ADMIN":
        return <Redirect href="/(admin)/" />;
      case "OWNER":
        return <Redirect href="/(owner)/" />;
      default:
        return <Redirect href="/(public)/home" />;
    }
  }

  // ── Guest → show auth screens ─────────────────────────────────
  return <Stack screenOptions={{ headerShown: false }} />;
}
