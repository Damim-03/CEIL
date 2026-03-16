import {
  View, Text, ScrollView, StyleSheet, RefreshControl,
} from "react-native";
import {
  Calendar, CheckCircle, XCircle, TrendingUp,
  Clock, AlertCircle, BookOpen,
} from "lucide-react-native";
import { useStudentAttendance } from "@/src/hooks/student/Usestudent";
import { PageLoader, ErrorState, EmptyState } from "@/src/components/ui";
import { COLORS, SPACING, RADIUS } from "@/src/constants/theme";

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

const formatTime = (d: string) =>
  new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

export default function AttendanceScreen() {
  const { data, isLoading, isError, error, refetch, isRefetching } = useStudentAttendance();

  if (isLoading) return <PageLoader />;
  if (isError) return <ErrorState message={(error as any)?.message} onRetry={refetch} />;

  const records = data?.records || [];
  const summary = data?.summary || { total_sessions: 0, present: 0, absent: 0, attendance_rate: 0 };
  const rate = summary.attendance_rate;

  const rateColor = rate >= 80 ? COLORS.tealMid : rate >= 60 ? COLORS.gold : COLORS.red;
  const rateLabel = rate >= 80 ? "Excellent Attendance!" : rate >= 60 ? "Good Attendance" : "Attendance Warning";
  const rateSub = rate >= 80 ? "Keep up the great work!" : rate >= 60 ? "Try to attend more classes to improve." : "Your rate is below acceptable levels.";

  const statusBannerStyle = rate >= 80
    ? { bg: "rgba(43,111,94,0.04)", border: "rgba(43,111,94,0.15)" }
    : rate >= 60
      ? { bg: "rgba(196,160,53,0.04)", border: "rgba(196,160,53,0.2)" }
      : { bg: "rgba(239,68,68,0.04)", border: "rgba(239,68,68,0.2)" };

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.tealMid} />}
    >
      {/* ── Header ── */}
      <View style={s.headerCard}>
        <View style={s.headerIcon}>
          <Calendar size={24} color="#fff" />
          <View style={s.headerIconDot} />
        </View>
        <View>
          <Text style={s.headerTitle}>My Attendance</Text>
          <Text style={s.headerSub}>Track your class attendance records</Text>
        </View>
      </View>

      {/* ── Stats grid ── */}
      <View style={s.statsRow}>
        {/* Total */}
        <View style={[s.statCard, { flex: 1 }]}>
          <View style={[s.statIcon, { backgroundColor: `${COLORS.tealMid}12` }]}>
            <Calendar size={16} color={COLORS.tealMid} />
          </View>
          <Text style={s.statValue}>{summary.total_sessions}</Text>
          <Text style={s.statLabel}>Total</Text>
        </View>

        {/* Present */}
        <View style={[s.statCard, s.statCardGreen, { flex: 1 }]}>
          <View style={[s.statIcon, { backgroundColor: `${COLORS.tealMid}14` }]}>
            <CheckCircle size={16} color={COLORS.tealMid} />
          </View>
          <Text style={[s.statValue, { color: COLORS.tealMid }]}>{summary.present}</Text>
          <Text style={[s.statLabel, { color: `${COLORS.tealMid}99` }]}>Present</Text>
        </View>

        {/* Absent */}
        <View style={[s.statCard, s.statCardRed, { flex: 1 }]}>
          <View style={[s.statIcon, { backgroundColor: "rgba(239,68,68,0.1)" }]}>
            <XCircle size={16} color={COLORS.red} />
          </View>
          <Text style={[s.statValue, { color: COLORS.red }]}>{summary.absent}</Text>
          <Text style={[s.statLabel, { color: COLORS.red + "99" }]}>Absent</Text>
        </View>

        {/* Rate */}
        <View style={[s.statCard, { flex: 1, backgroundColor: `${rateColor}08`, borderColor: `${rateColor}20` }]}>
          <View style={[s.statIcon, { backgroundColor: `${rateColor}14` }]}>
            <TrendingUp size={16} color={rateColor} />
          </View>
          <Text style={[s.statValue, { color: rateColor }]}>{rate.toFixed(0)}%</Text>
          <Text style={[s.statLabel, { color: rateColor + "99" }]}>Rate</Text>
          {/* mini progress bar */}
          <View style={s.miniProgressTrack}>
            <View style={[s.miniProgressFill, { width: `${rate}%` as any, backgroundColor: rateColor }]} />
          </View>
        </View>
      </View>

      {/* ── Status Banner ── */}
      {summary.total_sessions > 0 && (
        <View style={[s.statusBanner, { backgroundColor: statusBannerStyle.bg, borderColor: statusBannerStyle.border }]}>
          <View style={[s.statusIcon, { backgroundColor: `${rateColor}14` }]}>
            {rate >= 80
              ? <CheckCircle size={16} color={rateColor} />
              : rate >= 60
                ? <Clock size={16} color={rateColor} />
                : <AlertCircle size={16} color={rateColor} />
            }
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.statusTitle}>{rateLabel}</Text>
            <Text style={s.statusSub}>{rateSub}</Text>
          </View>
          <View style={[s.statusPill, { backgroundColor: `${rateColor}14` }]}>
            <Text style={[s.statusPillText, { color: rateColor }]}>{rate.toFixed(0)}%</Text>
          </View>
        </View>
      )}

      {/* ── Records list ── */}
      <View style={s.recordsCard}>
        <View style={s.recordsHeader}>
          <Text style={s.recordsTitle}>Attendance Records</Text>
          <Text style={s.recordsSub}>Detailed history of all your class sessions</Text>
        </View>

        {records.length > 0 ? records.map((record: any, index: number) => {
          const isPresent = record.status === "PRESENT";
          return (
            <View
              key={record.attendance_id || index}
              style={[s.recordRow, index < records.length - 1 && s.recordRowBorder]}
            >
              <View style={[s.recordIcon, { backgroundColor: isPresent ? `${COLORS.tealMid}10` : "rgba(239,68,68,0.06)" }]}>
                {isPresent
                  ? <CheckCircle size={18} color={COLORS.tealMid} />
                  : <XCircle size={18} color={COLORS.red} />
                }
              </View>
              <View style={s.recordInfo}>
                <Text style={s.recordTopic} numberOfLines={1}>
                  {record.session?.topic || "Class Session"}
                </Text>
                <View style={s.recordMeta}>
                  <Calendar size={11} color={COLORS.textMuted} />
                  <Text style={s.recordMetaText}>{formatDate(record.session?.session_date)}</Text>
                  <Clock size={11} color={COLORS.textMuted} />
                  <Text style={s.recordMetaText}>{formatTime(record.session?.session_date)}</Text>
                  {record.session?.group && (
                    <>
                      <BookOpen size={11} color={COLORS.textMuted} />
                      <Text style={s.recordMetaText} numberOfLines={1}>{record.session.group.name}</Text>
                    </>
                  )}
                </View>
              </View>
              <View style={[s.recordBadge, { backgroundColor: isPresent ? `${COLORS.tealMid}10` : "rgba(239,68,68,0.1)" }]}>
                <Text style={[s.recordBadgeText, { color: isPresent ? COLORS.tealMid : COLORS.red }]}>
                  {record.status}
                </Text>
              </View>
            </View>
          );
        }) : (
          <EmptyState
            icon={<Calendar size={24} color={COLORS.textMuted} />}
            title="No Attendance Records"
            subtitle="Your records will appear once you start attending classes"
          />
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F8F4F0" },
  content: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: 32 },

  headerCard: { backgroundColor: "#fff", borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.borderLight, padding: SPACING.lg, flexDirection: "row", alignItems: "center", gap: SPACING.md },
  headerIcon: { width: 56, height: 56, borderRadius: 18, backgroundColor: COLORS.tealMid, alignItems: "center", justifyContent: "center", position: "relative" },
  headerIconDot: { position: "absolute", bottom: -2, right: -2, width: 16, height: 16, borderRadius: 8, backgroundColor: COLORS.gold, borderWidth: 2, borderColor: "#fff" },
  headerTitle: { fontSize: 20, fontWeight: "700", color: COLORS.text },
  headerSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },

  statsRow: { flexDirection: "row", gap: SPACING.sm },
  statCard: { backgroundColor: "#fff", borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.borderLight, padding: SPACING.md, alignItems: "center", overflow: "hidden" },
  statCardGreen: { backgroundColor: "rgba(43,111,94,0.04)", borderColor: "rgba(43,111,94,0.15)" },
  statCardRed: { backgroundColor: "rgba(239,68,68,0.04)", borderColor: "rgba(239,68,68,0.2)" },
  statIcon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: SPACING.sm },
  statValue: { fontSize: 22, fontWeight: "700", color: COLORS.text },
  statLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: "500", marginTop: 2 },
  miniProgressTrack: { position: "absolute", bottom: 0, left: 0, right: 0, height: 3, backgroundColor: "rgba(0,0,0,0.05)" },
  miniProgressFill: { height: "100%", borderRadius: 2 },

  statusBanner: { flexDirection: "row", alignItems: "center", gap: SPACING.md, borderRadius: RADIUS.xl, borderWidth: 1, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  statusIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statusTitle: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  statusSub: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14 },
  statusPillText: { fontSize: 11, fontWeight: "700" },

  recordsCard: { backgroundColor: "#fff", borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.borderLight, overflow: "hidden" },
  recordsHeader: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: "rgba(232,221,212,0.4)" },
  recordsTitle: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  recordsSub: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },

  recordRow: { flexDirection: "row", alignItems: "center", gap: SPACING.md, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  recordRowBorder: { borderBottomWidth: 1, borderBottomColor: "rgba(232,221,212,0.3)" },
  recordIcon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  recordInfo: { flex: 1 },
  recordTopic: { fontSize: 13, fontWeight: "500", color: COLORS.text },
  recordMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4, flexWrap: "wrap" },
  recordMetaText: { fontSize: 10, color: COLORS.textMuted, marginRight: 4 },
  recordBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 14 },
  recordBadgeText: { fontSize: 10, fontWeight: "700", letterSpacing: 0.4 },
});
