// src/context/TabTransitionContext.tsx
// ⚠️ هذا الملف غير مستخدم مع _layout.tsx الجديد
// احذفه إذا كنت تستخدم النهج الجديد (PanResponder في _layout)

import { createContext, useContext, useRef, useCallback } from "react";
import { Animated, Easing, Dimensions, StyleSheet } from "react-native";
import { useFocusEffect } from "expo-router";

const SW = Dimensions.get("window").width;

interface Ctx {
  directionRef: React.MutableRefObject<"left" | "right" | "none">;
}

const TabTransitionContext = createContext<Ctx>({
  directionRef: { current: "none" },
});

export function TabTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // useRef بدل useState — لا يسبب re-render
  const directionRef = useRef<"left" | "right" | "none">("none");
  return (
    <TabTransitionContext.Provider value={{ directionRef }}>
      {children}
    </TabTransitionContext.Provider>
  );
}

export function useTabDirection() {
  return useContext(TabTransitionContext);
}

// ─────────────────────────────────────────────
// TabScreen
// ─────────────────────────────────────────────

export function TabScreen({ children }: { children: React.ReactNode }) {
  const { directionRef } = useTabDirection();
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useFocusEffect(
    useCallback(() => {
      const dir = directionRef.current;

      const startX =
        dir === "right" ? SW * 0.28 : dir === "left" ? -SW * 0.28 : 0;

      translateX.setValue(startX);
      opacity.setValue(dir === "none" ? 1 : 0);

      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 13,
          overshootClamping: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 180,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => {
        directionRef.current = "none";
      });
    }, [directionRef, opacity, translateX]), // ✅ empty deps — يقرأ directionRef.current عند كل focus
  );

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        { opacity, transform: [{ translateX }] },
      ]}
    >
      {children}
    </Animated.View>
  );
}
