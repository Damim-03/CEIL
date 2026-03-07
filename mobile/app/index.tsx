// app/index.tsx
// إذا مسجّل → داشبورد دوره | إذا ضيف → Homepage العامة
import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "@/src/lib/Context/AuthContext";

export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading)
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0D0D0D",
        }}
      >
        <ActivityIndicator color="#2B6F5E" size="large" />
      </View>
    );

  // ✅ غير مسجّل → Homepage العامة (ليس login مباشرة)
  if (!isAuthenticated) return <Redirect href="/(public)/home" />;

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
