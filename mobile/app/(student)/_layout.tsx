import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import {
  LayoutDashboard, User, FileText, BookOpen,
  ClipboardList, DollarSign, Calendar, Award, Bell,
} from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useStudentUnreadCount } from "@/src/hooks/student/Usestudent";
import { COLORS } from "@/constants/theme";

function TabIcon({
  Icon, focused, label, badge,
}: {
  Icon: any; focused: boolean; label: string; badge?: number;
}) {
  return (
    <View style={ti.wrap}>
      <View style={[ti.iconWrap, focused && ti.iconWrapActive]}>
        <Icon size={20} color={focused ? COLORS.tealMid : COLORS.textMuted} />
        {badge && badge > 0 ? (
          <View style={ti.badge}>
            <Text style={ti.badgeText}>{badge > 99 ? "99+" : badge}</Text>
          </View>
        ) : null}
      </View>
      <Text style={[ti.label, focused && ti.labelActive]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const ti = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center", paddingTop: 4 },
  iconWrap: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  iconWrapActive: { backgroundColor: `${COLORS.tealMid}14` },
  label: { fontSize: 10, color: COLORS.textMuted, marginTop: 2, fontWeight: "500" },
  labelActive: { color: COLORS.tealMid, fontWeight: "600" },
  badge: { position: "absolute", top: -4, right: -4, backgroundColor: COLORS.red, borderRadius: 8, minWidth: 16, height: 16, alignItems: "center", justifyContent: "center", paddingHorizontal: 3 },
  badgeText: { color: "#fff", fontSize: 9, fontWeight: "700" },
});

export default function StudentLayout() {
  const { t } = useTranslation();
  const { data: unreadData } = useStudentUnreadCount();
  const unreadCount = unreadData?.count ?? 0;

  const tabs = [
    { name: "index", icon: LayoutDashboard, label: t("student.nav.dashboard") },
    { name: "profile", icon: User, label: t("student.nav.profile") },
    { name: "documents", icon: FileText, label: t("student.nav.documents") },
    { name: "courses", icon: BookOpen, label: t("student.nav.courses") },
    { name: "enrollments", icon: ClipboardList, label: t("student.nav.enrollments") },
    { name: "fees", icon: DollarSign, label: t("student.nav.fees") },
    { name: "attendance", icon: Calendar, label: t("student.nav.attendance") },
    { name: "results", icon: Award, label: t("student.nav.results") },
    { name: "notifications", icon: Bell, label: t("student.nav.notifications"), badge: unreadCount },
  ];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: COLORS.borderLight,
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon Icon={tab.icon} focused={focused} label={tab.label} badge={(tab as any).badge} />
            ),
          }}
        />
      ))}
      {/* Hidden screens (dynamic routes) */}
      <Tabs.Screen name="group/[groupId]" options={{ href: null }} />
    </Tabs>
  );
}
