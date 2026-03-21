// app/_layout.tsx
import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "../src/context/AuthContext";
import { View, ActivityIndicator } from "react-native";
import AlertModal from "../src/components/common/AlertModal"; // ✅

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
    },
  },
});

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
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
          backgroundColor: "#0A0A0A",
        }}
      >
        <ActivityIndicator size="large" color="#4A7065" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <StatusBar style="light" />
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
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
