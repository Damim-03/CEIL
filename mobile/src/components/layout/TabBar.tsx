// src/components/layout/TabBar.tsx
import { View, Text, StyleSheet, Platform } from "react-native";
import { Colors, FontSize } from "../../constants/theme";

interface TabIconProps {
  emoji: string;
  label: string;
  focused: boolean;
}

export function TabIcon({ emoji, label, focused }: TabIconProps) {
  return (
    <View style={styles.tabItem}>
      <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
        {label}
      </Text>
    </View>
  );
}

export const tabBarStyle = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "ios" ? 85 : 68,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingBottom: Platform.OS === "ios" ? 24 : 8,
    paddingTop: 8,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
});

const styles = StyleSheet.create({
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  iconWrap: {
    width: 40,
    height: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  iconWrapActive: {
    backgroundColor: Colors.primary + "14",
  },
  emoji: { fontSize: 20 },
  tabLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: "400",
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: "600",
  },
});