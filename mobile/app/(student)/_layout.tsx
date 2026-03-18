// app/(student)/_layout.tsx
import { Tabs } from "expo-router";
import { TabIcon, tabBarStyle } from "../../src/components/layout/TabBar";
import { TAB_SCREENS } from "../../src/constants/tabs";

export default function StudentLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: tabBarStyle.tabBar,
      }}
    >
      {TAB_SCREENS.map(({ name, emoji, label }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji={emoji} label={label} focused={focused} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
