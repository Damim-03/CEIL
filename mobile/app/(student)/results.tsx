import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from "react-native";
import {
  Award,
  TrendingUp,
  AlertCircle,
  BookOpen,
  Calendar,
  Target,
  Star,
} from "lucide-react-native";
import { useStudentResults } from "@/src/hooks/student/Usestudent";
import {
  PageLoader,
  ErrorState,
  EmptyState,
  StatusBadge,
} from "@/src/components/ui";
import { COLORS, SPACING, RADIUS } from "@/src/constants/theme";

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

function getPerfColor(p: number): string {
  if (p >= 80) return COLORS.tealMid;
  if (p >= 60) return COLORS.tealMid;
  if (p >= 50) return COLORS.gold;
  return COLORS.red;
}

function getPerfLabel(p: number): string {
  if (p >= 80) return "Excellent";
  if (p >= 60) return "Good";
  if (p >= 50) return "Pass";
  return "Needs Improvement";
}

function getBarColor(p: number): string {
  if (p >= 80) return COLORS.tealMid;
  if (p >= 60) return COLORS.tealMid;
  if (p >= 50) return COLORS.gold;
  return COLORS.red;
}

export default function ResultsScreen() {
  const { data, isLoading, isError, error, refetch, isRefetching } =
    useStudentResults();

  if (isLoading) return <PageLoader />;
  if (isError)
    return <ErrorState message={(error as any)?.message} onRetry={refetch} />;

  const results = data?.results || [];
  const summary = data?.summary || { total_exams: 0, average_score: 0 };
  const avg = summary.average_score;

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={COLORS.tealMid}
        />
      }
    >
      {/* ── Header ── */}
      <View style={s.headerCard}>
        <View style={s.headerAccent} />
        <View style={s.headerIcon}>
          <Award size={24} color="#fff" />
        </View>
        <View>
          <Text style={s.headerTitle}>My Results</Text>
          <Text style={s.headerSub}>
            View your exam scores and academic performance
          </Text>
        </View>
      </View>

      {/* ── Summary ── */}
      <View style={s.summaryRow}>
        <View style={[s.summaryCard, { flex: 1 }]}>
          <View
            style={[s.summaryIcon, { backgroundColor: `${COLORS.tealMid}10` }]}
          >
            <Award size={18} color={COLORS.tealMid} />
          </View>
          <Text style={s.summaryLabel}>Total Exams</Text>
          <Text style={s.summaryValue}>{summary.total_exams}</Text>
        </View>
        <View
          style={[
            s.summaryCard,
            {
              flex: 1,
              backgroundColor: `${getPerfColor(avg)}08`,
              borderColor: `${getPerfColor(avg)}20`,
            },
          ]}
        >
          <View
            style={[
              s.summaryIcon,
              { backgroundColor: `${getPerfColor(avg)}14` },
            ]}
          >
            <TrendingUp size={18} color={getPerfColor(avg)} />
          </View>
          <Text style={[s.summaryLabel, { color: getPerfColor(avg) }]}>
            Average Score
          </Text>
          <View style={s.avgRow}>
            <Text style={[s.summaryValue, { color: getPerfColor(avg) }]}>
              {avg.toFixed(1)}%
            </Text>
            <Text style={[s.avgLabel, { color: getPerfColor(avg) }]}>
              {getPerfLabel(avg)}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Performance Banner ── */}
      {summary.total_exams > 0 && (
        <View
          style={[
            s.perfBanner,
            {
              backgroundColor: `${getPerfColor(avg)}06`,
              borderColor: `${getPerfColor(avg)}20`,
            },
          ]}
        >
          <View
            style={[
              s.perfBannerIcon,
              { backgroundColor: `${getPerfColor(avg)}12` },
            ]}
          >
            {avg >= 80 ? (
              <Star size={20} color={getPerfColor(avg)} />
            ) : avg >= 60 ? (
              <Target size={20} color={getPerfColor(avg)} />
            ) : avg >= 50 ? (
              <TrendingUp size={20} color={getPerfColor(avg)} />
            ) : (
              <AlertCircle size={20} color={getPerfColor(avg)} />
            )}
          </View>
          <View>
            <Text style={[s.perfBannerTitle, { color: COLORS.text }]}>
              {avg >= 80
                ? "Outstanding Performance!"
                : avg >= 60
                  ? "Good Performance"
                  : avg >= 50
                    ? "Room for Improvement"
                    : "Needs Attention"}
            </Text>
            <Text style={s.perfBannerSub}>
              {avg >= 80
                ? "You're performing exceptionally well. Keep it up!"
                : avg >= 60
                  ? "You're doing well! A little more effort can make you excellent."
                  : avg >= 50
                    ? "You're passing, but there's potential to do better."
                    : "Your performance needs improvement. Please seek help from instructors."}
            </Text>
          </View>
        </View>
      )}

      {/* ── Results list ── */}
      {results.length > 0 ? (
        results.map((result: any, index: number) => {
          const percentage =
            (result.marks_obtained / result.exam.max_marks) * 100;
          const passed = percentage >= 50;
          const perfColor = getPerfColor(percentage);
          const barColor = getBarColor(percentage);

          return (
            <View key={result.result_id || index} style={s.resultCard}>
              {/* top accent */}
              <View
                style={[
                  s.resultAccent,
                  { backgroundColor: passed ? COLORS.tealMid : COLORS.red },
                ]}
              />

              <View style={s.resultPad}>
                {/* header */}
                <View style={s.resultHeader}>
                  <View
                    style={[
                      s.resultIcon,
                      {
                        backgroundColor: passed
                          ? `${COLORS.tealMid}10`
                          : "rgba(239,68,68,0.1)",
                      },
                    ]}
                  >
                    <Award
                      size={22}
                      color={passed ? COLORS.tealMid : COLORS.red}
                    />
                  </View>
                  <View style={s.resultInfo}>
                    <Text style={s.resultName}>
                      {result.exam.exam_name || "Exam"}
                    </Text>
                    <View style={s.resultMeta}>
                      <Calendar size={12} color={COLORS.textMuted} />
                      <Text style={s.resultMetaText}>
                        {formatDate(result.exam.exam_date)}
                      </Text>
                      {result.exam.course && (
                        <>
                          <BookOpen size={12} color={COLORS.textMuted} />
                          <Text style={s.resultMetaText}>
                            {result.exam.course.course_name}
                          </Text>
                        </>
                      )}
                    </View>
                  </View>
                  {result.grade && (
                    <View
                      style={[
                        s.gradeBadge,
                        {
                          backgroundColor: `${perfColor}12`,
                          borderColor: `${perfColor}25`,
                        },
                      ]}
                    >
                      <Text style={[s.gradeText, { color: perfColor }]}>
                        {result.grade}
                      </Text>
                    </View>
                  )}
                </View>

                {/* score grid */}
                <View style={s.scoreGrid}>
                  <View style={s.scoreItem}>
                    <Text style={s.scoreLabel}>Score</Text>
                    <Text style={s.scoreValue}>
                      {result.marks_obtained} / {result.exam.max_marks}
                    </Text>
                  </View>
                  <View style={s.scoreItem}>
                    <Text style={s.scoreLabel}>Percentage</Text>
                    <Text style={[s.scoreValue, { color: perfColor }]}>
                      {percentage.toFixed(1)}%
                    </Text>
                  </View>
                  <View style={s.scoreItem}>
                    <Text style={s.scoreLabel}>Result</Text>
                    <StatusBadge
                      label={passed ? "✓ PASS" : "✗ FAIL"}
                      variant={passed ? "success" : "error"}
                    />
                  </View>
                </View>

                {/* progress bar */}
                <View style={s.barRow}>
                  <Text style={s.barLabel}>Performance</Text>
                  <Text style={[s.barPerf, { color: perfColor }]}>
                    {getPerfLabel(percentage)}
                  </Text>
                </View>
                <View style={s.barTrack}>
                  <View
                    style={[
                      s.barFill,
                      {
                        width: `${Math.min(percentage, 100)}%` as any,
                        backgroundColor: barColor,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          );
        })
      ) : (
        <EmptyState
          icon={<Award size={24} color={COLORS.textMuted} />}
          title="No Exam Results Yet"
          subtitle="Your exam results will appear here once you take your first exam"
        />
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F8F4F0" },
  content: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: 32 },

  headerCard: {
    backgroundColor: "#fff",
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: SPACING.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    overflow: "hidden",
  },
  headerAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: COLORS.tealMid,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: COLORS.text },
  headerSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },

  summaryRow: { flexDirection: "row", gap: SPACING.md },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: SPACING.lg,
  },
  summaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "500",
    marginBottom: 4,
  },
  summaryValue: { fontSize: 28, fontWeight: "700", color: COLORS.text },
  avgRow: { flexDirection: "row", alignItems: "baseline", gap: SPACING.sm },
  avgLabel: { fontSize: 12, fontWeight: "600" },

  perfBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.md,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    padding: SPACING.lg,
  },
  perfBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 2,
  },
  perfBannerTitle: { fontSize: 14, fontWeight: "600", marginBottom: 4 },
  perfBannerSub: { fontSize: 12, color: COLORS.textMuted, lineHeight: 18 },

  resultCard: {
    backgroundColor: "#fff",
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: "hidden",
  },
  resultAccent: { height: 3, width: "100%" },
  resultPad: { padding: SPACING.lg },
  resultHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  resultIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  resultInfo: { flex: 1 },
  resultName: { fontSize: 15, fontWeight: "600", color: COLORS.text },
  resultMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
    flexWrap: "wrap",
  },
  resultMetaText: { fontSize: 11, color: COLORS.textMuted, marginRight: 4 },
  gradeBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  gradeText: { fontSize: 20, fontWeight: "700" },

  scoreGrid: {
    flexDirection: "row",
    backgroundColor: "rgba(216,205,192,0.08)",
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  scoreItem: { flex: 1 },
  scoreLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 4,
    fontWeight: "500",
  },
  scoreValue: { fontSize: 20, fontWeight: "700", color: COLORS.text },

  barRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.sm,
  },
  barLabel: { fontSize: 12, color: COLORS.textSub },
  barPerf: { fontSize: 12, fontWeight: "600" },
  barTrack: {
    height: 10,
    backgroundColor: "rgba(216,205,192,0.3)",
    borderRadius: 5,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 5 },
});
