import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl, Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ClipboardList, CheckCircle, Clock, XCircle, AlertCircle,
  BookOpen, Users, Calendar, ChevronRight, X,
} from "lucide-react-native";
import {
  useStudentEnrollments, useCancelEnrollment,
} from "@/src/hooks/student/Usestudent";
import { PageLoader, ErrorState, EmptyState, StatusBadge } from "@/src/components/ui";
import { COLORS, SPACING, RADIUS } from "@/constants/theme";

const STATUS_MAP: Record<string, { variant: any; label: string }> = {
  PENDING: { variant: "warning", label: "Pending" },
  VALIDATED: { variant: "success", label: "Validated" },
  PAID: { variant: "success", label: "Paid" },
  REJECTED: { variant: "error", label: "Rejected" },
  FINISHED: { variant: "default", label: "Finished" },
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

export default function EnrollmentsScreen() {
  const router = useRouter();
  const { data: enrollments = [], isLoading, isError, error, refetch, isRefetching } = useStudentEnrollments();
  const cancelMutation = useCancelEnrollment();

  if (isLoading) return <PageLoader />;
  if (isError) return <ErrorState message={(error as any)?.message} onRetry={refetch} />;

  const handleCancel = (enrollment: any) => {
    Alert.alert(
      "Cancel Enrollment",
      `Cancel enrollment in ${enrollment.course?.course_name || "this course"}?`,
      [
        { text: "Keep", style: "cancel" },
        { text: "Cancel Enrollment", style: "destructive", onPress: () => cancelMutation.mutate(enrollment.enrollment_id) },
      ]
    );
  };

  const stats = {
    total: enrollments.length,
    active: enrollments.filter((e: any) => ["VALIDATED", "PAID"].includes(e.registration_status)).length,
    pending: enrollments.filter((e: any) => e.registration_status === "PENDING").length,
    rejected: enrollments.filter((e: any) => e.registration_status === "REJECTED").length,
  };

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.tealMid} />}
    >
      {/* Header */}
      <View style={s.headerCard}>
        <View style={s.headerIcon}>
          <ClipboardList size={22} color="#fff" />
        </View>
        <View>
          <Text style={s.headerTitle}>My Enrollments</Text>
          <Text style={s.headerSub}>{stats.total} enrollment{stats.total !== 1 ? "s" : ""}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        {[
          { label: "Total", value: stats.total, color: COLORS.tealMid },
          { label: "Active", value: stats.active, color: COLORS.tealMid },
          { label: "Pending", value: stats.pending, color: COLORS.gold },
          { label: "Rejected", value: stats.rejected, color: COLORS.red },
        ].map((stat) => (
          <View key={stat.label} style={[s.statCard, { borderColor: `${stat.color}20` }]}>
            <Text style={[s.statValue, { color: stat.color }]}>{stat.value}</Text>
            <Text style={s.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* List */}
      {enrollments.length > 0 ? enrollments.map((enrollment: any) => {
        const status = enrollment.registration_status;
        const statusInfo = STATUS_MAP[status] || { variant: "default", label: status };
        const canCancel = ["PENDING"].includes(status);
        const hasGroup = !!enrollment.group_id;

        return (
          <View key={enrollment.enrollment_id} style={s.enrollCard}>
            {/* color accent */}
            <View style={[s.enrollAccent, {
              backgroundColor: status === "PAID" || status === "VALIDATED" ? COLORS.tealMid
                : status === "REJECTED" ? COLORS.red : COLORS.gold
            }]} />

            <View style={s.enrollPad}>
              <View style={s.enrollHeader}>
                <View style={[s.enrollIcon, { backgroundColor: `${COLORS.tealMid}10` }]}>
                  <BookOpen size={20} color={COLORS.tealMid} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.enrollCourse}>{enrollment.course?.course_name || "Course"}</Text>
                  {enrollment.course?.course_code && (
                    <Text style={s.enrollCode}>{enrollment.course.course_code}</Text>
                  )}
                </View>
                <StatusBadge label={statusInfo.label} variant={statusInfo.variant} />
              </View>

              {/* Details */}
              <View style={s.enrollDetails}>
                {enrollment.level && (
                  <View style={s.enrollDetail}>
                    <Text style={s.enrollDetailLabel}>Level</Text>
                    <Text style={s.enrollDetailValue}>{enrollment.level}</Text>
                  </View>
                )}
                {enrollment.group && (
                  <View style={s.enrollDetail}>
                    <Text style={s.enrollDetailLabel}>Group</Text>
                    <Text style={s.enrollDetailValue}>{enrollment.group.name}</Text>
                  </View>
                )}
                {enrollment.enrollment_date && (
                  <View style={s.enrollDetail}>
                    <Text style={s.enrollDetailLabel}>Enrolled</Text>
                    <Text style={s.enrollDetailValue}>{formatDate(enrollment.enrollment_date)}</Text>
                  </View>
                )}
                {enrollment.group?.teacher && (
                  <View style={s.enrollDetail}>
                    <Text style={s.enrollDetailLabel}>Teacher</Text>
                    <Text style={s.enrollDetailValue}>
                      {enrollment.group.teacher.first_name} {enrollment.group.teacher.last_name}
                    </Text>
                  </View>
                )}
              </View>

              {/* Actions */}
              <View style={s.enrollActions}>
                {hasGroup && (
                  <TouchableOpacity
                    style={s.viewGroupBtn}
                    onPress={() => router.push(`/(student)/group/${enrollment.group_id}` as any)}
                    activeOpacity={0.8}
                  >
                    <Users size={14} color={COLORS.tealMid} />
                    <Text style={s.viewGroupBtnText}>View Group</Text>
                    <ChevronRight size={14} color={COLORS.tealMid} />
                  </TouchableOpacity>
                )}
                {canCancel && (
                  <TouchableOpacity
                    style={s.cancelBtn}
                    onPress={() => handleCancel(enrollment)}
                    disabled={cancelMutation.isPending}
                    activeOpacity={0.8}
                  >
                    <X size={14} color={COLORS.red} />
                    <Text style={s.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        );
      }) : (
        <EmptyState
          icon={<ClipboardList size={24} color={COLORS.textMuted} />}
          title="No Enrollments Yet"
          subtitle="Browse available courses to get started"
        />
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F8F4F0" },
  content: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: 32 },

  headerCard: { backgroundColor: "#fff", borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.borderLight, padding: SPACING.lg, flexDirection: "row", alignItems: "center", gap: SPACING.md },
  headerIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: COLORS.tealMid, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  headerSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },

  statsRow: { flexDirection: "row", gap: SPACING.sm },
  statCard: { flex: 1, backgroundColor: "#fff", borderRadius: RADIUS.lg, borderWidth: 1, padding: SPACING.md, alignItems: "center" },
  statValue: { fontSize: 22, fontWeight: "700" },
  statLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: "500", marginTop: 2 },

  enrollCard: { backgroundColor: "#fff", borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.borderLight, overflow: "hidden" },
  enrollAccent: { height: 3, width: "100%" },
  enrollPad: { padding: SPACING.lg },
  enrollHeader: { flexDirection: "row", alignItems: "flex-start", gap: SPACING.md, marginBottom: SPACING.md },
  enrollIcon: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  enrollCourse: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  enrollCode: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  enrollDetails: { flexDirection: "row", flexWrap: "wrap", gap: SPACING.sm, backgroundColor: "rgba(248,244,240,0.6)", borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.md },
  enrollDetail: { minWidth: "40%" },
  enrollDetailLabel: { fontSize: 9, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8, color: COLORS.textMuted, marginBottom: 3 },
  enrollDetailValue: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  enrollActions: { flexDirection: "row", gap: SPACING.sm, flexWrap: "wrap" },
  viewGroupBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: `${COLORS.tealMid}30`, backgroundColor: `${COLORS.tealMid}06` },
  viewGroupBtnText: { fontSize: 12, color: COLORS.tealMid, fontWeight: "500" },
  cancelBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: "rgba(239,68,68,0.25)" },
  cancelBtnText: { fontSize: 12, color: COLORS.red, fontWeight: "500" },
});
