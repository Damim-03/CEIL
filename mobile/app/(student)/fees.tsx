import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl,
} from "react-native";
import {
  DollarSign, CheckCircle, Calendar, AlertCircle,
  CreditCard, FileText, Banknote,
} from "lucide-react-native";
import { useStudentFees } from "@/src/hooks/student/Usestudent";
import { PageLoader, ErrorState, EmptyState } from "@/src/components/ui";
import { COLORS, SPACING, RADIUS } from "@/src/constants/theme";
import { useTranslation } from "react-i18next";

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

const formatCurrency = (amount: number) => `${amount.toLocaleString()} DA`;

const isOverdue = (dueDate: string, status: string) => {
  if (status === "PAID") return false;
  return new Date(dueDate) < new Date();
};

export default function FeesScreen() {
  const { t } = useTranslation();
  const { data, isLoading, isError, error, refetch, isRefetching } = useStudentFees();

  if (isLoading) return <PageLoader />;
  if (isError) return <ErrorState message={(error as any)?.message} onRetry={refetch} />;

  const fees = data?.fees || [];
  const summary = data?.summary || { total: 0, paid: 0, remaining: 0, is_fully_paid: true };
  const paidPercent = summary.total > 0 ? Math.round((summary.paid / summary.total) * 100) : 0;

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.tealMid} />}
    >
      {/* ── Header card ── */}
      <View style={s.headerCard}>
        <View style={s.headerIconWrap}>
          <View style={s.headerIcon}>
            <CreditCard size={24} color="#fff" />
          </View>
          <View style={s.headerIconDot} />
        </View>
        <View style={s.headerText}>
          <Text style={s.headerTitle}>My Fees</Text>
          <Text style={s.headerSub}>Manage your registration and course fees</Text>
        </View>
        {summary.total > 0 && (
          <View style={s.headerProgress}>
            <Text style={s.headerProgressPct}>{paidPercent}% paid</Text>
            <View style={s.progressTrack}>
              <View style={[s.progressFill, { width: `${paidPercent}%` }]} />
            </View>
          </View>
        )}
      </View>

      {/* ── Summary cards ── */}
      <View style={s.summaryRow}>
        {/* Total */}
        <View style={[s.summaryCard, { flex: 1 }]}>
          <View style={[s.summaryIcon, { backgroundColor: `${COLORS.tealMid}12` }]}>
            <Banknote size={16} color={COLORS.tealMid} />
          </View>
          <Text style={s.summaryLabel}>Total Fees</Text>
          <Text style={s.summaryValue}>{formatCurrency(summary.total)}</Text>
        </View>

        {/* Paid */}
        <View style={[s.summaryCard, s.summaryCardGreen, { flex: 1 }]}>
          <View style={[s.summaryIcon, { backgroundColor: `${COLORS.tealMid}14` }]}>
            <CheckCircle size={16} color={COLORS.tealMid} />
          </View>
          <Text style={[s.summaryLabel, { color: `${COLORS.tealMid}99` }]}>Paid</Text>
          <Text style={[s.summaryValue, { color: COLORS.tealMid }]}>{formatCurrency(summary.paid)}</Text>
        </View>

        {/* Outstanding */}
        <View style={[
          s.summaryCard,
          summary.remaining > 0 ? s.summaryCardRed : {},
          { flex: 1 },
        ]}>
          <View style={[s.summaryIcon, { backgroundColor: summary.remaining > 0 ? "rgba(239,68,68,0.1)" : "#F0EBE5" }]}>
            <CreditCard size={16} color={summary.remaining > 0 ? COLORS.red : COLORS.textMuted} />
          </View>
          <Text style={[s.summaryLabel, { color: summary.remaining > 0 ? COLORS.red : COLORS.textMuted }]}>Outstanding</Text>
          <Text style={[s.summaryValue, { color: summary.remaining > 0 ? COLORS.red : COLORS.text }]}>
            {formatCurrency(summary.remaining)}
          </Text>
        </View>
      </View>

      {/* ── Status banner ── */}
      <View style={[s.statusBanner, summary.is_fully_paid ? s.statusBannerGreen : s.statusBannerGold]}>
        <View style={[s.statusBannerIcon, { backgroundColor: summary.is_fully_paid ? `${COLORS.tealMid}14` : `${COLORS.gold}14` }]}>
          {summary.is_fully_paid
            ? <CheckCircle size={16} color={COLORS.tealMid} />
            : <AlertCircle size={16} color={COLORS.gold} />
          }
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.statusBannerTitle}>
            {summary.is_fully_paid ? "All Paid!" : "Payment Required"}
          </Text>
          <Text style={s.statusBannerSub}>
            {summary.is_fully_paid
              ? "You have no outstanding fees. Great job!"
              : `You have ${formatCurrency(summary.remaining)} in outstanding fees`}
          </Text>
        </View>
        <View style={[s.statusPill, { backgroundColor: summary.is_fully_paid ? `${COLORS.tealMid}14` : `${COLORS.gold}14` }]}>
          <Text style={[s.statusPillText, { color: summary.is_fully_paid ? COLORS.tealMid : COLORS.gold }]}>
            {summary.is_fully_paid ? "✓ Clear" : `${paidPercent}%`}
          </Text>
        </View>
      </View>

      {/* ── Fees list ── */}
      {fees.length > 0 ? fees.map((fee: any) => {
        const overdue = isOverdue(fee.due_date, fee.status);
        const isPaid = fee.status === "PAID";
        const accentColor = isPaid ? COLORS.tealMid : overdue ? COLORS.red : COLORS.gold;

        return (
          <View key={fee.fee_id} style={s.feeCard}>
            {/* top accent */}
            {!isPaid && <View style={[s.feeTopAccent, { backgroundColor: accentColor }]} />}

            <View style={s.feePadding}>
              {/* header row */}
              <View style={s.feeHeaderRow}>
                <View style={s.feeHeaderLeft}>
                  <View style={[s.feeIcon, { backgroundColor: `${accentColor}12` }]}>
                    <DollarSign size={20} color={accentColor} />
                  </View>
                  <View>
                    <Text style={s.feeName}>Registration Fee</Text>
                    {fee.enrollment?.course && (
                      <Text style={s.feeSub}>
                        {fee.enrollment.course.course_name}
                        {fee.enrollment.level ? ` · ${fee.enrollment.level}` : ""}
                      </Text>
                    )}
                  </View>
                </View>
                <View style={[s.feeBadge, { backgroundColor: `${accentColor}12` }]}>
                  <Text style={[s.feeBadgeText, { color: accentColor }]}>
                    {isPaid ? "PAID" : overdue ? "OVERDUE" : "PENDING"}
                  </Text>
                </View>
              </View>

              {/* details grid */}
              <View style={s.feeDetails}>
                <View style={s.feeDetail}>
                  <Text style={s.feeDetailLabel}>Amount</Text>
                  <Text style={s.feeDetailValue}>{formatCurrency(fee.amount)}</Text>
                </View>
                <View style={s.feeDetail}>
                  <Text style={s.feeDetailLabel}>Due Date</Text>
                  <View style={s.feeDetailRow}>
                    <Calendar size={11} color={COLORS.textMuted} />
                    <Text style={s.feeDetailValue}>{formatDate(fee.due_date)}</Text>
                  </View>
                </View>
                {isPaid && (
                  <>
                    <View style={s.feeDetail}>
                      <Text style={s.feeDetailLabel}>Paid On</Text>
                      <Text style={s.feeDetailValue}>{formatDate(fee.paid_at)}</Text>
                    </View>
                    <View style={s.feeDetail}>
                      <Text style={s.feeDetailLabel}>Reference</Text>
                      <Text style={[s.feeDetailValue, s.feeDetailMono]} numberOfLines={1}>
                        {fee.reference_code}
                      </Text>
                    </View>
                  </>
                )}
              </View>

              {/* payment method */}
              {isPaid && fee.payment_method && (
                <View style={s.paymentMethod}>
                  <CreditCard size={14} color={COLORS.tealMid} />
                  <Text style={s.paymentMethodText}>
                    Paid via <Text style={{ fontWeight: "700" }}>{fee.payment_method}</Text>
                  </Text>
                </View>
              )}

              {/* receipt btn */}
              {isPaid && (
                <TouchableOpacity style={s.receiptBtn} activeOpacity={0.8}>
                  <FileText size={14} color={COLORS.textSub} />
                  <Text style={s.receiptBtnText}>Download Receipt</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      }) : (
        <EmptyState
          icon={<DollarSign size={24} color={COLORS.textMuted} />}
          title="No Fees Yet"
          subtitle="Your fees will appear here once you enroll in a course"
        />
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F8F4F0" },
  content: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: 32 },

  // Header card
  headerCard: { backgroundColor: "#fff", borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.borderLight, padding: SPACING.lg, flexDirection: "row", alignItems: "center", gap: SPACING.md, overflow: "hidden" },
  headerIconWrap: { position: "relative" },
  headerIcon: { width: 56, height: 56, borderRadius: 18, backgroundColor: COLORS.gold, alignItems: "center", justifyContent: "center" },
  headerIconDot: { position: "absolute", bottom: -2, right: -2, width: 16, height: 16, borderRadius: 8, backgroundColor: COLORS.tealMid, borderWidth: 2, borderColor: "#fff" },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: COLORS.text },
  headerSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  headerProgress: { alignItems: "flex-end", gap: 4 },
  headerProgressPct: { fontSize: 11, color: COLORS.textMuted, fontWeight: "500" },
  progressTrack: { width: 80, height: 6, borderRadius: 3, backgroundColor: COLORS.borderLight, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3, backgroundColor: COLORS.tealMid },

  // Summary
  summaryRow: { flexDirection: "row", gap: SPACING.sm },
  summaryCard: { backgroundColor: "#fff", borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.borderLight, padding: SPACING.md },
  summaryCardGreen: { backgroundColor: "rgba(43,111,94,0.04)", borderColor: "rgba(43,111,94,0.15)" },
  summaryCardRed: { backgroundColor: "rgba(239,68,68,0.04)", borderColor: "rgba(239,68,68,0.2)" },
  summaryIcon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: SPACING.sm },
  summaryLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: "500", marginBottom: 4 },
  summaryValue: { fontSize: 16, fontWeight: "700", color: COLORS.text },

  // Status banner
  statusBanner: { flexDirection: "row", alignItems: "center", gap: SPACING.md, borderRadius: RADIUS.xl, borderWidth: 1, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md },
  statusBannerGreen: { backgroundColor: "rgba(43,111,94,0.04)", borderColor: "rgba(43,111,94,0.15)" },
  statusBannerGold: { backgroundColor: "rgba(196,160,53,0.04)", borderColor: "rgba(196,160,53,0.2)" },
  statusBannerIcon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statusBannerTitle: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  statusBannerSub: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14 },
  statusPillText: { fontSize: 11, fontWeight: "700" },

  // Fee Card
  feeCard: { backgroundColor: "#fff", borderRadius: RADIUS.xl, borderWidth: 1, borderColor: COLORS.borderLight, overflow: "hidden" },
  feeTopAccent: { height: 3, width: "100%" },
  feePadding: { padding: SPACING.lg },
  feeHeaderRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: SPACING.md },
  feeHeaderLeft: { flexDirection: "row", alignItems: "flex-start", gap: SPACING.md, flex: 1 },
  feeIcon: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  feeName: { fontSize: 13, fontWeight: "600", color: COLORS.text },
  feeSub: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  feeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  feeBadgeText: { fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  feeDetails: { backgroundColor: "rgba(248,244,240,0.6)", borderRadius: RADIUS.lg, padding: SPACING.md, flexDirection: "row", flexWrap: "wrap", gap: SPACING.md, marginBottom: SPACING.md },
  feeDetail: { minWidth: "40%" },
  feeDetailLabel: { fontSize: 9, color: COLORS.textMuted, fontWeight: "500", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 },
  feeDetailValue: { fontSize: 13, fontWeight: "700", color: COLORS.text },
  feeDetailRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  feeDetailMono: { fontFamily: "monospace", fontSize: 11 },
  paymentMethod: { flexDirection: "row", alignItems: "center", gap: SPACING.sm, backgroundColor: "rgba(43,111,94,0.04)", borderWidth: 1, borderColor: "rgba(43,111,94,0.12)", borderRadius: RADIUS.lg, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, marginBottom: SPACING.md },
  paymentMethodText: { fontSize: 12, color: COLORS.tealMid },
  receiptBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: SPACING.sm, height: 40, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.borderLight },
  receiptBtnText: { fontSize: 12, color: COLORS.textSub, fontWeight: "500" },
});
