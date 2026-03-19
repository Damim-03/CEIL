// src/hooks/useTabTransition.ts
import { useEffect, useRef } from "react";
import { Animated, Easing, Dimensions } from "react-native";
import { usePathname } from "expo-router";
import { TAB_SCREENS } from "../constants/tabs";

const SW = Dimensions.get("window").width;

// Store last visited tab index globally
let lastIndex = 0;

export function useTabTransition() {
  const pathname = usePathname();
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const currentIndex = (() => {
    const idx = TAB_SCREENS.findIndex(
      (t) => pathname === `/${t.name}` || pathname.endsWith(`/${t.name}`),
    );
    return idx < 0 ? 0 : idx;
  })();

  useEffect(() => {
    const direction = currentIndex > lastIndex ? 1 : -1;
    const isFirst = lastIndex === currentIndex;

    // Start from offscreen (or center if same tab)
    translateX.setValue(isFirst ? 0 : direction * SW * 0.3);
    opacity.setValue(isFirst ? 1 : 0);

    // Slide in + fade in
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
        tension: 72,
        friction: 13,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    lastIndex = currentIndex;
  }, [currentIndex, opacity, pathname, translateX]);

  return {
    style: {
      flex: 1,
      opacity,
      transform: [{ translateX }],
    } as any,
  };
}
