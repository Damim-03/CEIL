import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Users, ArrowLeft, AlertCircle, Calendar, GraduationCap,
  User, BookOpen, Award, CheckCircle, XCircle, CreditCard,
} from "lucide-react-native";
import { useStudentEnrollments } from "@/src/hooks/student/Usestudent";
import { PageLoader, ErrorState, StatusBadge } from "@/src/components/ui";
import { COLORS, SPACING, RADIUS } from "@/src/constants/theme";

const formatDate = (d: string) =>
  d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={s.infoRow}>
      <View style={s.infoIcon}>
        <Icon size={14} color={COLORS.tealMid} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.infoLabel}>{label}</Text>
        <Text style={s.infoValue}>{value || "—"}</Text>
      </View>
    </View>
  );
}

export default function GroupDetailsScreen() {
  const router = useRouter();
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { data: enrollments = [], isLoading, isError, error, refetch, isRefetching } = useStudentEnrollments();

  if (isLoading) return <PageLoader />;
  if (isError) return <ErrorState message={(error as any)?.message} onRetry={refetch} />;

  const enrollment = enrollments.find((e: any) =>
    e.group_id === groupId || e.group?.group_id === groupId
  );

  if (!enrollment) {
    return (
      <View style={s.notFoundWrap}>
        <AlertCircle size={40} color={COLORS.red} />
        <Text style={s.notFoundTitle}>Group not found</Text>
        <TouchableOpacity style={s.backBtnLarge} onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={s.backBtnLargeText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const group = enrollment.group;
  const course = enrollment.course;
  const teacher = group?.teacher;

  const STATUS_COLORS: Record<string, string> = {
    OPEN: COLORS.tealMid,
    CLOSED: COLORS.red,
    FULL: COLORS.gold,
    FINISHED: COLORS.textMuted,
  };
  const statusColor = STATUS_COLORS[group?.status ?? "OPEN"] ?? COLORS.tealMid;

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.tealMid} />}
    >
      {/* Back */}
      <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
        <ArrowLeft size={18} color={COLORS.tealMid} />
        <Text style={s.backBtnText}>Enrollments</Text>
      </TouchableOpacity>

      {/* Hero Card */}
      <View style={s.heroCard}>
        <View style={s.heroTop}>
          <View style={[s.heroIcon, { backgroundColor: COLORS.tealMid }]}>
            <Users size={24} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.heroGroupName}>{group?.name || "Group"}</Text>
            <Text style={s.heroCourseName}>{course?.course_name || "Course"}</Text>
          </View>
          <View style={[s.statusPill, { backgroundColor: `${statusColor}14`, borderColor: `${statusColor}30` }]}>
            <View style={[s.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[s.statusPillText, { color: statusColor }]}>{group?.status}</Text>
          </View>
        </View>

        {/* Level badge */}
        {enrollment.level && (
          <View style={s.levelChip}>
            <GraduationCap size={14} color={COLORS.gold} />
            <Text style={s.levelChipText}>Level {enrollment.level}</Text>
          </View>
        )}
      </View>

      {/* Group Info */}
      <View style={s.card}>
        <View style={s.cardHeader}>
          <Users size={16} color={COLORS.tealMid} />
          <Text style={s.cardHeaderTitle}>Group Information</Text>
        </View>
        <View style={s.cardBody}>
          <InfoRow icon={BookOpen} label="Course" value={course?.course_name || "—"} />
          {course?.course_code && <InfoRow icon={BookOpen} label="Course Code" value={course.course_code} />}
          <InfoRow icon={GraduationCap} label="Level" value={enrollment.level || "—"} />
          <InfoRow icon={Users} label="Capacity" value={`${group?._count?.students || 0} / ${group?.max_students || 0} students`} />
          {group?.department && <InfoRow icon={BookOpen} label="Department" value={group.department.name} />}
        </View>
      </View>

      {/* Teacher Info */}
      {teacher && (
        <View style={s.card}>
          <View style={s.cardHeader}>
            <User size={16} color={COLORS.gold} />
            <Text style={s.cardHeaderTitle}>Instructor</Text>
          </View>
          <View style={s.cardBody}>
            <View style={s.teacherRow}>
              <View style={s.teacherAvatar}>
                <Text style={s.teacherAvatarText}>
                  {teacher.first_name?.[0]}{teacher.last_name?.[0]}
                </Text>
              </View>
              <View>
                <Text style={s.teacherName}>{teacher.first_name} {teacher.last_name}</Text>
                {teacher.email && <Text style={s.teacherEmail}>{teacher.email}</Text>}
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Enrollment Status */}
      <View style={s.card}>
        <View style={s.cardHeader}>
          <Award size={16} color={COLORS.tealMid} />
          <Text style={s.cardHeaderTitle}>Enrollment Status</Text>
        </View>
        <View style={s.cardBody}>
          <InfoRow icon={Calendar} label="Enrolled On" value={formatDate(enrollment.enrollment_date)} />
          {enrollment.start_date && <InfoRow icon={Calendar} label="Start Date" value={formatDate(enrollment.start_date)} />}
          {enrollment.end_date && <InfoRow icon={Calendar} label="End Date" value={formatDate(enrollment.end_date)} />}
          <View style={s.infoRow}>
            <View style={s.infoIcon}>
              <CreditCard size={14} color={COLORS.tealMid} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.infoLabel}>Registration Status</Text>
              <StatusBadge
                label={enrollment.registration_status}
                variant={
                  ["VALIDATED", "PAID"].includes(enrollment.registration_status) ? "success"
                    : enrollment.registration_status === "REJECTED" ? "error"
                    : enrollment.registration_status === "FINISHED" ? "default"
                    : "warning"
                }
                style={{ alignSelf: "flex-start", marginTop: 4 }}
              />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F8F4F0" },
  content: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: 32 },

  backBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: SPACING.xs },
  backBtnText: { fontSize: 14, color: COLORS.tealMid, fontWeight: "500" },

  heroCard: { backgroundColor: "#fff", borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.borderLight, padding: SPACING.lg },
  heroTop: { flexDirection: "row", alignItems: "flex-start", gap: SPACING.md, marginBottom: SPACING.md },
  heroIcon: { width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  heroGroupName: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  heroCourseName: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  statusPill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusPillText: { fontSize: 11, fontWeight: "600" },
  levelChip: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: `${COLORS.gold}10`, borderWidth: 1, borderColor: `${COLORS.gold}25` },
  levelChipText: { fontSize: 12, color: COLORS.gold, fontWeight: "600" },

  card: { backgroundColor: "#fff", borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.borderLight, overflow: "hidden" },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: "rgba(232,221,212,0.4)" },
  cardHeaderTitle: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  cardBody: { padding: SPACING.lg, gap: 2 },

  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: SPACING.md, paddingVertical: SPACING.sm },
  infoIcon: { width: 28, height: 28, borderRadius: 9, backgroundColor: `${COLORS.tealMid}10`, alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 },
  infoLabel: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.8, color: COLORS.textMuted, marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: "500", color: COLORS.text },

  teacherRow: { flexDirection: "row", alignItems: "center", gap: SPACING.md },
  teacherAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: `${COLORS.gold}15`, alignItems: "center", justifyContent: "center" },
  teacherAvatarText: { fontSize: 16, fontWeight: "700", color: COLORS.gold },
  teacherName: { fontSize: 15, fontWeight: "600", color: COLORS.text },
  teacherEmail: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },

  notFoundWrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: SPACING.lg, padding: SPACING.xl },
  notFoundTitle: { fontSize: 18, fontWeight: "600", color: COLORS.text },
  backBtnLarge: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, backgroundColor: COLORS.tealMid, borderRadius: 14 },
  backBtnLargeText: { color: "#fff", fontWeight: "600", fontSize: 14 },
});
