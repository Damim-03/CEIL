import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import {
  User, FileText, CheckCircle, AlertTriangle, Edit, Upload,
  GraduationCap, ArrowRight, Shield, Eye, BookOpen, TrendingUp, Award,
} from "lucide-react-native";
import { useStudentDashboard, useStudentProfile } from "@/src/hooks/student/Usestudent";
import { useMe } from "@/src/hooks/auth/auth.hooks";
import { PageLoader, CircularProgress, DonutChart } from "@/src/components/ui";
import { COLORS, SPACING, RADIUS } from "@/src/constants/theme";

export default function DashboardScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { data, isLoading, refetch, isRefetching } = useStudentDashboard();
  const { data: me } = useMe();
  const { data: fullProfile } = useStudentProfile();

  if (isLoading) return <PageLoader />;

  if (!data) {
    return (
      <View style={s.centerWrap}>
        <Text style={s.emptyText}>{t("student.error.loading")}</Text>
      </View>
    );
  }

  const { profile, documents, enrollment } = data;
  const displayName = me?.display_name || me?.first_name || me?.email?.split("@")[0] || "Student";
  const isEnrollmentReady = enrollment.isReady;
  const isProfileComplete = profile.isComplete;
  const completedFields = profile.completedFields;
  const totalFields = profile.totalFields;
  const profilePct = profile.percentage;
  const docStats = { total: documents.total, approved: documents.approved, pending: documents.pending, rejected: documents.rejected };

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.tealMid} />}
    >
      {/* ── Welcome Banner ── */}
      <View style={s.welcomeBanner}>
        <View>
          <Text style={s.welcomeLabel}>{t("student.dashboard.welcomeBack")}</Text>
          <Text style={s.welcomeName}>{displayName}</Text>
          <Text style={s.welcomeSub}>
            {isEnrollmentReady ? t("student.dashboard.ready") : t("student.dashboard.completeProfile")}
          </Text>
        </View>
        <View style={[s.statusPill, isEnrollmentReady ? s.pillGreen : s.pillGold]}>
          <View style={[s.pillDot, isEnrollmentReady ? s.dotGreen : s.dotGold]} />
          <Text style={[s.pillText, isEnrollmentReady ? s.pillTextGreen : s.pillTextGold]}>
            {isEnrollmentReady ? "Active" : "Action Required"}
          </Text>
        </View>
      </View>

      {/* ── Enrollment Ready Banner ── */}
      {isEnrollmentReady && (
        <View style={s.infoBannerGreen}>
          <View style={s.infoBannerIconGreen}>
            <CheckCircle size={20} color="#fff" />
          </View>
          <View style={s.infoBannerBody}>
            <Text style={s.infoBannerTitle}>{t("student.dashboard.enrollmentActive")}</Text>
            <Text style={s.infoBannerSub}>{t("student.dashboard.enrollmentActiveDesc")}</Text>
            <TouchableOpacity
              style={s.infoBannerBtn}
              onPress={() => router.push("/(student)/courses")}
              activeOpacity={0.8}
            >
              <GraduationCap size={14} color="#fff" />
              <Text style={s.infoBannerBtnText}>{t("student.dashboard.browseCourses")}</Text>
              <ArrowRight size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── Requirements Alert ── */}
      {!isEnrollmentReady && (
        <View style={s.infoBannerGold}>
          <View style={s.infoBannerIconGold}>
            <AlertTriangle size={20} color="#fff" />
          </View>
          <View style={s.infoBannerBody}>
            <Text style={s.infoBannerTitle}>{t("student.dashboard.actionRequired")}</Text>
            <Text style={s.infoBannerSub}>{t("student.dashboard.actionRequiredDesc")}</Text>
            {!isProfileComplete && (
              <Text style={s.bulletItem}>
                <Text style={s.bulletDot}>• </Text>
                {`Complete your profile (${completedFields}/${totalFields} fields)`}
              </Text>
            )}
            {docStats.total === 0 && (
              <Text style={s.bulletItem}>
                <Text style={s.bulletDot}>• </Text>
                {t("student.dashboard.uploadRequiredDocs")}
              </Text>
            )}
            {docStats.pending > 0 && (
              <Text style={s.bulletItem}>
                <Text style={s.bulletDot}>• </Text>
                {t("student.dashboard.waitDocApproval", { count: docStats.pending })}
              </Text>
            )}
            {docStats.rejected > 0 && (
              <Text style={[s.bulletItem, { color: COLORS.red }]}>
                <Text style={{ color: COLORS.red }}>• </Text>
                {t("student.dashboard.reuploadRejected", { count: docStats.rejected })}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* ════════ COMPLETE DASHBOARD ════════ */}
      {isEnrollmentReady ? (
        <>
          {/* Stats Grid */}
          <View style={s.statsGrid}>
            {[
              { label: t("student.dashboard.enrolledCourses"), value: "5", Icon: BookOpen, color: COLORS.tealMid },
              { label: t("student.dashboard.averageGrade"), value: "85%", Icon: TrendingUp, color: COLORS.tealMid },
              { label: t("student.dashboard.achievements"), value: "12", Icon: Award, color: COLORS.gold },
            ].map((stat, i) => (
              <View key={i} style={s.statCard}>
                <View style={[s.statIcon, { backgroundColor: `${stat.color}14` }]}>
                  <stat.Icon size={18} color={stat.color} />
                </View>
                <Text style={[s.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={s.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Current Courses card */}
          <View style={s.card}>
            <View style={s.cardHeader}>
              <View style={s.cardHeaderLeft}>
                <BookOpen size={16} color={COLORS.gold} />
                <Text style={s.cardHeaderTitle}>{t("student.dashboard.currentCourses")}</Text>
              </View>
              <TouchableOpacity onPress={() => router.push("/(student)/courses")} activeOpacity={0.7}>
                <View style={s.viewAllRow}>
                  <Text style={s.viewAllText}>{t("student.dashboard.viewAllCourses")}</Text>
                  <ArrowRight size={12} color={COLORS.tealMid} />
                </View>
              </TouchableOpacity>
            </View>
            <View style={s.courseRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.courseName}>Advanced Mathematics</Text>
                <Text style={s.courseSub}>{t("student.dashboard.progress", { value: 75 })}</Text>
              </View>
              <TouchableOpacity
                style={s.courseBtn}
                onPress={() => router.push("/(student)/courses")}
                activeOpacity={0.8}
              >
                <Text style={s.courseBtnText}>View</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      ) : (
        /* ════════ INCOMPLETE DASHBOARD ════════ */
        <>
          <View style={s.twoCol}>
            {/* Profile Completion */}
            {!isProfileComplete && (
              <View style={[s.card, { flex: 1 }]}>
                <View style={s.cardIconRow}>
                  <View style={[s.cardIconBox, { backgroundColor: COLORS.tealMid }]}>
                    <User size={20} color="#fff" />
                  </View>
                  <View>
                    <Text style={s.cardTitle}>{t("student.dashboard.profileCompletion")}</Text>
                    <Text style={s.cardSubtitle}>
                      {t("student.dashboard.fieldsCompleted", { completed: completedFields, total: totalFields })}
                    </Text>
                  </View>
                </View>
                <View style={s.chartCenter}>
                  <CircularProgress percentage={profilePct} color={COLORS.tealMid} size={120} />
                </View>
                <TouchableOpacity
                  style={s.actionBtn}
                  onPress={() => router.push("/(student)/profile")}
                  activeOpacity={0.85}
                >
                  <Edit size={14} color="#fff" />
                  <Text style={s.actionBtnText}>{t("student.dashboard.completeProfileBtn")}</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Documents Status */}
            {(docStats.total === 0 || docStats.pending > 0 || docStats.rejected > 0 || !isProfileComplete) && (
              <View style={[s.card, { flex: 1 }]}>
                <View style={s.cardIconRow}>
                  <View style={[s.cardIconBox, { backgroundColor: COLORS.gold }]}>
                    <FileText size={20} color="#fff" />
                  </View>
                  <View>
                    <Text style={s.cardTitle}>{t("student.dashboard.documentsStatus")}</Text>
                    <Text style={s.cardSubtitle}>{docStats.total} document(s)</Text>
                  </View>
                </View>
                <View style={s.chartCenter}>
                  <DonutChart approved={docStats.approved} pending={docStats.pending} rejected={docStats.rejected} total={docStats.total} />
                </View>
                {/* Legend */}
                {[
                  { label: t("student.dashboard.approved"), count: docStats.approved, color: COLORS.tealMid },
                  { label: t("student.dashboard.pending"), count: docStats.pending, color: COLORS.gold },
                  { label: t("student.dashboard.rejected"), count: docStats.rejected, color: COLORS.red },
                ].map((row) => (
                  <View key={row.label} style={[s.legendRow, { borderColor: `${row.color}20`, backgroundColor: `${row.color}06` }]}>
                    <View style={[s.legendDot, { backgroundColor: row.color }]} />
                    <Text style={s.legendLabel}>{row.label}</Text>
                    <Text style={s.legendCount}>{row.count}</Text>
                  </View>
                ))}
                <View style={s.docBtnsRow}>
                  <TouchableOpacity style={s.docBtnOutline} onPress={() => router.push("/(student)/documents")} activeOpacity={0.8}>
                    <Eye size={14} color={COLORS.textSub} />
                    <Text style={s.docBtnOutlineText}>View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.docBtnFilled} onPress={() => router.push("/(student)/documents")} activeOpacity={0.85}>
                    <Upload size={14} color="#fff" />
                    <Text style={s.docBtnFilledText}>Upload</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Quick Actions */}
          <View style={s.card}>
            <View style={s.cardHeader}>
              <View style={s.cardHeaderLeft}>
                <TrendingUp size={16} color={COLORS.tealMid} />
                <Text style={s.cardHeaderTitle}>{t("student.dashboard.quickActions")}</Text>
              </View>
            </View>
            <View style={s.qaGrid}>
              {!isProfileComplete && (
                <TouchableOpacity style={s.qaItem} onPress={() => router.push("/(student)/profile")} activeOpacity={0.8}>
                  <View style={[s.qaIcon, { backgroundColor: `${COLORS.tealMid}10` }]}>
                    <Edit size={18} color={COLORS.tealMid} />
                  </View>
                  <Text style={s.qaLabel}>{t("student.dashboard.completeProfileBtn")}</Text>
                </TouchableOpacity>
              )}
              {(docStats.total === 0 || docStats.rejected > 0) && (
                <TouchableOpacity style={s.qaItem} onPress={() => router.push("/(student)/documents")} activeOpacity={0.8}>
                  <View style={[s.qaIcon, { backgroundColor: `${COLORS.gold}10` }]}>
                    <Upload size={18} color={COLORS.gold} />
                  </View>
                  <Text style={s.qaLabel}>{t("student.dashboard.uploadDocuments")}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={s.qaItem} onPress={() => router.push("/(student)/documents")} activeOpacity={0.8}>
                <View style={[s.qaIcon, { backgroundColor: `${COLORS.tealMid}10` }]}>
                  <Eye size={18} color={COLORS.tealMid} />
                </View>
                <Text style={s.qaLabel}>{t("student.dashboard.viewDocuments")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}

      {/* ── Security Notice ── */}
      <View style={s.securityNotice}>
        <Shield size={14} color={COLORS.textMuted} style={{ marginTop: 1 }} />
        <Text style={s.securityText}>
          <Text style={s.securityBold}>{t("student.dashboard.securityNotice")} </Text>
          {t("student.dashboard.securityNoticeDesc")}
        </Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F8F4F0" },
  content: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: 32 },
  centerWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { color: COLORS.textMuted, fontSize: 14 },

  // Welcome Banner
  welcomeBanner: { backgroundColor: "#111111", borderRadius: RADIUS.xl, padding: SPACING.xl, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  welcomeLabel: { color: "rgba(74,222,128,0.6)", fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: SPACING.xs },
  welcomeName: { color: "#fff", fontSize: 22, fontWeight: "700" },
  welcomeSub: { color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 4 },
  statusPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  pillGreen: { backgroundColor: "rgba(43,111,94,0.15)", borderColor: "rgba(43,111,94,0.3)" },
  pillGold: { backgroundColor: "rgba(196,160,53,0.1)", borderColor: "rgba(196,160,53,0.25)" },
  pillDot: { width: 6, height: 6, borderRadius: 3 },
  dotGreen: { backgroundColor: COLORS.tealLight },
  dotGold: { backgroundColor: COLORS.goldLight },
  pillText: { fontSize: 11, fontWeight: "600" },
  pillTextGreen: { color: COLORS.tealLight },
  pillTextGold: { color: COLORS.goldLight },

  // Info Banners
  infoBannerGreen: { backgroundColor: "rgba(43,111,94,0.04)", borderWidth: 1, borderColor: "rgba(43,111,94,0.15)", borderRadius: RADIUS.xl, padding: SPACING.lg, flexDirection: "row", gap: SPACING.md },
  infoBannerGold: { backgroundColor: "rgba(196,160,53,0.04)", borderWidth: 1, borderColor: "rgba(196,160,53,0.2)", borderRadius: RADIUS.xl, padding: SPACING.lg, flexDirection: "row", gap: SPACING.md },
  infoBannerIconGreen: { width: 48, height: 48, borderRadius: 16, backgroundColor: COLORS.tealMid, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  infoBannerIconGold: { width: 48, height: 48, borderRadius: 16, backgroundColor: COLORS.gold, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  infoBannerBody: { flex: 1 },
  infoBannerTitle: { fontSize: 13, fontWeight: "700", color: COLORS.text, marginBottom: 4 },
  infoBannerSub: { fontSize: 12, color: COLORS.textMuted, marginBottom: SPACING.md },
  infoBannerBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: COLORS.tealMid, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, alignSelf: "flex-start" },
  infoBannerBtnText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  bulletItem: { fontSize: 12, color: COLORS.textMuted, marginTop: 4 },
  bulletDot: { color: COLORS.gold },

  // Stats Grid
  statsGrid: { flexDirection: "row", gap: SPACING.sm },
  statCard: { flex: 1, backgroundColor: "#fff", borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.borderLight, padding: SPACING.md, alignItems: "center" },
  statIcon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: SPACING.sm },
  statValue: { fontSize: 22, fontWeight: "700" },
  statLabel: { fontSize: 10, color: COLORS.textMuted, marginTop: 2, textAlign: "center", fontWeight: "500" },

  // Card
  card: { backgroundColor: "#fff", borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.borderLight, overflow: "hidden" },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: "rgba(232,221,212,0.4)" },
  cardHeaderLeft: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  cardHeaderTitle: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  viewAllRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  viewAllText: { fontSize: 12, color: COLORS.tealMid, fontWeight: "500" },
  cardIconRow: { flexDirection: "row", alignItems: "center", gap: SPACING.md, padding: SPACING.lg, paddingBottom: SPACING.md },
  cardIconBox: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 13, fontWeight: "700", color: COLORS.text },
  cardSubtitle: { fontSize: 11, color: COLORS.textMuted },

  // Course Row
  courseRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  courseName: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  courseSub: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  courseBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 12, borderWidth: 1, borderColor: COLORS.borderLight },
  courseBtnText: { fontSize: 12, color: COLORS.textSub },

  // Two Col
  twoCol: { flexDirection: "row", gap: SPACING.md },
  chartCenter: { alignItems: "center", paddingVertical: SPACING.lg },
  legendRow: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.md, borderWidth: 1, marginHorizontal: SPACING.lg, marginBottom: SPACING.sm },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { flex: 1, fontSize: 12, color: COLORS.text, fontWeight: "500" },
  legendCount: { fontSize: 14, fontWeight: "700", color: COLORS.text },
  docBtnsRow: { flexDirection: "row", gap: SPACING.sm, padding: SPACING.lg, paddingTop: SPACING.sm },
  docBtnOutline: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, height: 38, borderRadius: 12, borderWidth: 1, borderColor: COLORS.borderLight },
  docBtnOutlineText: { fontSize: 12, color: COLORS.textSub, fontWeight: "500" },
  docBtnFilled: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, height: 38, borderRadius: 12, backgroundColor: COLORS.gold },
  docBtnFilledText: { fontSize: 12, color: "#fff", fontWeight: "600" },

  // Action Btn
  actionBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: COLORS.tealMid, borderRadius: 14, height: 44, marginHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  actionBtnText: { color: "#fff", fontWeight: "600", fontSize: 13 },

  // Quick Actions
  qaGrid: { flexDirection: "row", flexWrap: "wrap", padding: SPACING.md, gap: SPACING.sm },
  qaItem: { width: "30%", minWidth: 90, alignItems: "center", paddingVertical: SPACING.lg, paddingHorizontal: SPACING.sm, borderWidth: 1, borderColor: COLORS.borderLight, borderRadius: RADIUS.lg },
  qaIcon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: SPACING.sm },
  qaLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: "500", textAlign: "center" },

  // Security Notice
  securityNotice: { flexDirection: "row", alignItems: "flex-start", gap: SPACING.sm, backgroundColor: "rgba(248,244,240,0.6)", borderWidth: 1, borderColor: "rgba(232,221,212,0.5)", borderRadius: RADIUS.xl, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  securityText: { flex: 1, fontSize: 11, color: COLORS.textMuted, lineHeight: 18 },
  securityBold: { fontWeight: "600", color: COLORS.textSub },
});
