import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  TrendingUp,
  Activity,
  Calendar,
  Clock,
  CheckCircle,
  ArrowRight,
  Banknote,
  FileText,
  LayoutGrid,
  BadgeCheck,
  UserPlus,
  ClipboardList,
  BarChart3,
} from "lucide-react";
import PageLoader from "../../../../components/PageLoader";
import { useAdminDashboard } from "../../../../hooks/admin/useAdmin";
import { useMe } from "../../../../hooks/auth/auth.hooks";
import { EnrollmentsChart } from "../../components/EnrollmentsChart";
import { GenderChart } from "../../components/GenderChart";

interface RecentEnrollment {
  enrollment_id: string;
  enrollment_date: string;
  registration_status: string;
  student: {
    student_id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string;
  };
  course: {
    course_id: string;
    course_name: string;
    course_code?: string;
  };
  pricing?: {
    status_fr: string;
    price: number;
    currency: string;
  };
}

interface RecentFee {
  fee_id: string;
  amount: number;
  paid_at: string;
  payment_method?: string;
  student: {
    first_name: string;
    last_name: string;
  };
}

/* ===============================================================
   HELPERS
=============================================================== */

const formatCurrency = (amount: number) =>
  `${Number(amount).toLocaleString("en-US")} DA`;

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

/* ===============================================================
   MAIN DASHBOARD
=============================================================== */

const AdminDashboard = () => {
  const { t, i18n } = useTranslation();
  const { data: dashboardData, isLoading: isDashboardLoading } =
    useAdminDashboard();
  const { isLoading: isUserLoading } = useMe();

  const isLoading = isDashboardLoading || isUserLoading;

  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const d = new Date(date);
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return t("admin.dashboard.justNow");
    if (diffMins < 60) return t("admin.dashboard.minsAgo", { count: diffMins });
    if (diffHours < 24)
      return t("admin.dashboard.hoursAgo", { count: diffHours });
    if (diffDays < 7) return t("admin.dashboard.daysAgo", { count: diffDays });
    return formatDate(date);
  };

  const getCurrentDate = () => {
    const locale =
      i18n.language === "ar"
        ? "ar-DZ"
        : i18n.language === "fr"
          ? "fr-FR"
          : "en-US";
    return new Date().toLocaleDateString(locale, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const config: Record<
      string,
      { bg: string; text: string; labelKey: string }
    > = {
      PENDING: {
        bg: "bg-[#C4A035]/15",
        text: "text-[#9A7D2A]",
        labelKey: "admin.dashboard.pending",
      },
      VALIDATED: {
        bg: "bg-[#2B6F5E]/15",
        text: "text-[#2B6F5E]",
        labelKey: "admin.dashboard.validated",
      },
      PAID: {
        bg: "bg-[#8DB896]/20",
        text: "text-[#3D7A4A]",
        labelKey: "admin.dashboard.paid",
      },
      FINISHED: {
        bg: "bg-[#D8CDC0]/40",
        text: "text-[#6B5D4F]",
        labelKey: "admin.dashboard.finished",
      },
      REJECTED: {
        bg: "bg-red-100",
        text: "text-red-700",
        labelKey: "admin.dashboard.rejected",
      },
    };
    const c = config[status] || config.PENDING;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${c.bg} ${c.text}`}
      >
        {t(c.labelKey)}
      </span>
    );
  };

  if (isLoading) return <PageLoader />;

  const {
    students = 0,
    teachers = 0,
    courses = 0,
    groups = 0,
    unpaidFees = 0,
    gender = {},
    enrollments = { pending: 0, validated: 0, paid: 0, finished: 0, total: 0 },
    revenue = {
      collected: 0,
      pending: 0,
      total: 0,
      paidCount: 0,
      unpaidCount: 0,
      totalCount: 0,
    },
    recentEnrollments = [],
    recentFees = [],
  } = (dashboardData as any) ?? {};

  const totalUsers = students + teachers;

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="relative bg-white rounded-2xl border border-[#D8CDC0]/60 p-6 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#2B6F5E] to-[#C4A035]"></div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2B6F5E] to-[#2B6F5E]/80 flex items-center justify-center shadow-lg shadow-[#2B6F5E]/20">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#1B1B1B] mb-0.5">
                {t("admin.dashboard.title")}
              </h1>
              <div className="flex items-center gap-2 text-sm text-[#6B5D4F]">
                <Calendar className="w-4 h-4 text-[#C4A035]" />
                <span>{getCurrentDate()}</span>
              </div>
              <p className="text-sm text-[#BEB29E] mt-0.5">
                {t("admin.dashboard.subtitle")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MAIN STATS ================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MainStatCard
          icon={Users}
          label={t("admin.dashboard.totalUsers")}
          value={totalUsers}
          variant="teal"
        />
        <MainStatCard
          icon={GraduationCap}
          label={t("admin.dashboard.students")}
          value={students}
          variant="mustard"
        />
        <MainStatCard
          icon={Users}
          label={t("admin.dashboard.teachers")}
          value={teachers}
          variant="teal"
        />
        <MainStatCard
          icon={BookOpen}
          label={t("admin.dashboard.courses")}
          value={courses}
          variant="mustard"
        />
        <MainStatCard
          icon={LayoutGrid}
          label={t("admin.dashboard.groups")}
          value={groups}
          variant="teal"
        />
        <MainStatCard
          icon={FileText}
          label={t("admin.dashboard.enrollments")}
          value={enrollments.total}
          variant="mustard"
        />
      </div>

      {/* ================= ENROLLMENT PIPELINE + REVENUE ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enrollment Pipeline */}
        <div className="lg:col-span-2 relative bg-white rounded-2xl border border-[#D8CDC0]/60 p-6 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#C4A035] to-[#C4A035]/60"></div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C4A035] to-[#C4A035]/80 flex items-center justify-center shadow-md shadow-[#C4A035]/20">
                <ClipboardList className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-[#1B1B1B]">
                {t("admin.dashboard.enrollmentPipeline")}
              </h3>
            </div>
            <Link
              to="/admin/enrollments"
              className="text-sm font-medium text-[#2B6F5E] hover:text-[#2B6F5E]/80 flex items-center gap-1 transition-colors"
            >
              {t("admin.dashboard.viewAll")}{" "}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <PipelineStep
              icon={Clock}
              label={t("admin.dashboard.pending")}
              count={enrollments.pending}
              variant="mustard"
              badge={enrollments.pending > 0}
            />
            <PipelineStep
              icon={CheckCircle}
              label={t("admin.dashboard.validated")}
              count={enrollments.validated}
              variant="teal"
            />
            <PipelineStep
              icon={DollarSign}
              label={t("admin.dashboard.paid")}
              count={enrollments.paid}
              variant="green"
            />
            <PipelineStep
              icon={GraduationCap}
              label={t("admin.dashboard.finished")}
              count={enrollments.finished}
              variant="beige"
            />
          </div>

          {enrollments.total > 0 && (
            <div className="mt-5">
              <div className="flex h-3 rounded-full overflow-hidden bg-[#D8CDC0]/30">
                {enrollments.pending > 0 && (
                  <div
                    className="bg-[#C4A035] transition-all"
                    style={{
                      width: `${(enrollments.pending / enrollments.total) * 100}%`,
                    }}
                    title={`${t("admin.dashboard.pending")}: ${enrollments.pending}`}
                  />
                )}
                {enrollments.validated > 0 && (
                  <div
                    className="bg-[#2B6F5E] transition-all"
                    style={{
                      width: `${(enrollments.validated / enrollments.total) * 100}%`,
                    }}
                    title={`${t("admin.dashboard.validated")}: ${enrollments.validated}`}
                  />
                )}
                {enrollments.paid > 0 && (
                  <div
                    className="bg-[#8DB896] transition-all"
                    style={{
                      width: `${(enrollments.paid / enrollments.total) * 100}%`,
                    }}
                    title={`${t("admin.dashboard.paid")}: ${enrollments.paid}`}
                  />
                )}
                {enrollments.finished > 0 && (
                  <div
                    className="bg-[#BEB29E] transition-all"
                    style={{
                      width: `${(enrollments.finished / enrollments.total) * 100}%`,
                    }}
                    title={`${t("admin.dashboard.finished")}: ${enrollments.finished}`}
                  />
                )}
              </div>
              <div className="flex items-center gap-4 mt-2.5 text-xs text-[#6B5D4F]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#C4A035]"></span>
                  {t("admin.dashboard.pending")}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2B6F5E]"></span>
                  {t("admin.dashboard.validated")}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8DB896]"></span>
                  {t("admin.dashboard.paid")}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#BEB29E]"></span>
                  {t("admin.dashboard.finished")}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Revenue Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#2B6F5E] via-[#2B6F5E] to-[#2B6F5E]/90 rounded-2xl shadow-xl shadow-[#2B6F5E]/20 p-6 text-white">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#C4A035]"></div>
          <div className="absolute inset-0 opacity-[0.07]">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-20 translate-x-20"></div>
            <div className="absolute bottom-0 left-0 w-28 h-28 bg-white rounded-full translate-y-14 -translate-x-14"></div>
          </div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/10">
                <Banknote className="w-5 h-5 text-[#C4A035]" />
              </div>
              <h3 className="text-lg font-bold">
                {t("admin.dashboard.revenue")}
              </h3>
            </div>
            <div className="mb-5">
              <p className="text-white/60 text-xs font-medium mb-1 uppercase tracking-wider">
                {t("admin.dashboard.totalCollected")}
              </p>
              <p className="text-3xl font-bold text-[#C4A035]">
                {formatCurrency(revenue.collected)}
              </p>
              <p className="text-white/50 text-xs mt-1">
                {t("admin.dashboard.paymentsReceived", {
                  count: revenue.paidCount,
                })}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/15">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/5">
                <p className="text-white/60 text-xs mb-1">
                  {t("admin.dashboard.pendingRevenue")}
                </p>
                <p className="text-xl font-bold">
                  {formatCurrency(revenue.pending)}
                </p>
                <p className="text-white/40 text-[10px] mt-0.5">
                  {t("admin.dashboard.unpaid", { count: revenue.unpaidCount })}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/5">
                <p className="text-white/60 text-xs mb-1">
                  {t("admin.dashboard.totalFees")}
                </p>
                <p className="text-xl font-bold">{revenue.totalCount}</p>
                <p className="text-white/40 text-[10px] mt-0.5">
                  {t("admin.dashboard.allRecords")}
                </p>
              </div>
            </div>
            <Link
              to="/admin/fees"
              className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-[#C4A035] hover:bg-[#C4A035]/90 rounded-xl text-sm font-semibold transition-colors text-[#1B1B1B]"
            >
              <DollarSign className="w-4 h-4" />
              {t("admin.dashboard.manageFees")}
            </Link>
          </div>
        </div>
      </div>

      {/* ================= RECENT ACTIVITY + QUICK ACTIONS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Enrollments */}
        <div className="lg:col-span-2 relative bg-white rounded-2xl border border-[#D8CDC0]/60 p-6 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#2B6F5E] to-[#2B6F5E]/60"></div>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2B6F5E] to-[#2B6F5E]/80 flex items-center justify-center shadow-md shadow-[#2B6F5E]/20">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-[#1B1B1B]">
                {t("admin.dashboard.recentEnrollments")}
              </h3>
            </div>
            <Link
              to="/admin/enrollments"
              className="text-sm font-medium text-[#2B6F5E] hover:text-[#2B6F5E]/80 flex items-center gap-1 transition-colors"
            >
              {t("admin.dashboard.viewAll")}{" "}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentEnrollments.length > 0 ? (
            <div className="space-y-2">
              {(recentEnrollments as RecentEnrollment[])
                .slice(0, 6)
                .map((enrollment) => (
                  <div
                    key={enrollment.enrollment_id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-[#D8CDC0]/40 hover:bg-[#D8CDC0]/10 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2B6F5E]/20 to-[#2B6F5E]/10 flex items-center justify-center shrink-0 border border-[#2B6F5E]/20">
                      <span className="text-xs font-bold text-[#2B6F5E]">
                        {enrollment.student.first_name[0]}
                        {enrollment.student.last_name[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-[#1B1B1B] truncate">
                          {enrollment.student.first_name}{" "}
                          {enrollment.student.last_name}
                        </p>
                        <StatusBadge status={enrollment.registration_status} />
                      </div>
                      <p className="text-xs text-[#6B5D4F] truncate">
                        {enrollment.course.course_name}
                        {enrollment.pricing && (
                          <span className="text-[#C4A035] font-medium ml-1">
                            · {formatCurrency(Number(enrollment.pricing.price))}
                          </span>
                        )}
                      </p>
                    </div>
                    <span className="text-[11px] text-[#BEB29E] shrink-0">
                      {formatRelativeTime(enrollment.enrollment_date)}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-10 text-[#BEB29E]">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">
                {t("admin.dashboard.noRecentEnrollments")}
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions + Recent Payments */}
        <div className="space-y-6">
          <div className="relative bg-white rounded-2xl border border-[#D8CDC0]/60 p-6 overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#C4A035] to-[#C4A035]/60"></div>
            <h3 className="text-lg font-bold text-[#1B1B1B] mb-4">
              {t("admin.dashboard.quickActions")}
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <QuickActionLink
                to="/admin/enrollments"
                icon={ClipboardList}
                label={t("admin.dashboard.enrollments")}
                variant="mustard"
                badge={
                  enrollments.pending > 0 ? enrollments.pending : undefined
                }
              />
              <QuickActionLink
                to="/admin/fees"
                icon={DollarSign}
                label={t("admin.dashboard.fees")}
                variant="teal"
                badge={
                  revenue.unpaidCount > 0 ? revenue.unpaidCount : undefined
                }
              />
              <QuickActionLink
                to="/admin/students"
                icon={UserPlus}
                label={t("admin.dashboard.students")}
                variant="mustard"
              />
              <QuickActionLink
                to="/admin/courses"
                icon={BookOpen}
                label={t("admin.dashboard.courses")}
                variant="teal"
              />
              <QuickActionLink
                to="/admin/groups"
                icon={LayoutGrid}
                label={t("admin.dashboard.groups")}
                variant="mustard"
              />
              <QuickActionLink
                to="/admin/sessions"
                icon={Calendar}
                label={t("admin.dashboard.sessions")}
                variant="teal"
              />
            </div>
          </div>

          <div className="relative bg-white rounded-2xl border border-[#D8CDC0]/60 p-6 overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#8DB896] to-[#8DB896]/60"></div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#1B1B1B]">
                {t("admin.dashboard.recentPayments")}
              </h3>
              <Link
                to="/admin/fees"
                className="text-xs text-[#2B6F5E] hover:text-[#2B6F5E]/80 font-medium transition-colors"
              >
                {t("admin.dashboard.viewAll")}
              </Link>
            </div>
            {(recentFees as RecentFee[]).length > 0 ? (
              <div className="space-y-2.5">
                {(recentFees as RecentFee[]).map((fee) => (
                  <div
                    key={fee.fee_id}
                    className="flex items-center justify-between py-2 border-b border-[#D8CDC0]/30 last:border-0"
                  >
                    <div className="flex items-center gap-2">
                      <BadgeCheck className="w-4 h-4 text-[#2B6F5E]" />
                      <div>
                        <p className="text-xs font-semibold text-[#1B1B1B]">
                          {fee.student.first_name} {fee.student.last_name}
                        </p>
                        <p className="text-[10px] text-[#BEB29E]">
                          {fee.paid_at
                            ? formatRelativeTime(fee.paid_at)
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#2B6F5E]">
                      {formatCurrency(fee.amount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-xs text-[#BEB29E] py-4">
                {t("admin.dashboard.noRecentPayments")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ================= QUICK STATS + PLATFORM OVERVIEW ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative bg-white rounded-2xl border border-[#D8CDC0]/60 p-6 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#C4A035] to-[#2B6F5E]"></div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C4A035] to-[#C4A035]/80 flex items-center justify-center shadow-md shadow-[#C4A035]/20">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-[#1B1B1B]">
              {t("admin.dashboard.quickStats")}
            </h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#2B6F5E]/5 rounded-xl p-4 border border-[#2B6F5E]/15">
              <p className="text-xs text-[#2B6F5E] font-semibold mb-1">
                {t("admin.dashboard.teachers")}
              </p>
              <p className="text-3xl font-bold text-[#1B1B1B]">{teachers}</p>
            </div>
            <div className="bg-[#C4A035]/5 rounded-xl p-4 border border-[#C4A035]/15">
              <p className="text-xs text-[#C4A035] font-semibold mb-1">
                {t("admin.dashboard.studentTeacherRatio")}
              </p>
              <p className="text-3xl font-bold text-[#1B1B1B]">
                {teachers > 0 ? (students / teachers).toFixed(1) : "0"}:1
              </p>
            </div>
            <div className="bg-[#8DB896]/10 rounded-xl p-4 border border-[#8DB896]/20">
              <p className="text-xs text-[#3D7A4A] font-semibold mb-1">
                {t("admin.dashboard.avgPerCourse")}
              </p>
              <p className="text-3xl font-bold text-[#1B1B1B]">
                {courses > 0 ? (students / courses).toFixed(1) : "0"}
              </p>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-[#1B1B1B] via-[#1B1B1B] to-[#2B6F5E]/40 rounded-2xl shadow-xl p-6 text-white">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#C4A035]"></div>
          <div className="absolute inset-0 opacity-[0.04]">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#C4A035] rounded-full -translate-y-24 translate-x-24"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#2B6F5E] rounded-full translate-y-16 -translate-x-16"></div>
          </div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#C4A035]/20 backdrop-blur-sm flex items-center justify-center border border-[#C4A035]/20">
                <Activity className="w-5 h-5 text-[#C4A035]" />
              </div>
              <h3 className="text-lg font-bold">
                {t("admin.dashboard.platformOverview")}
              </h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-white/50 text-xs font-medium mb-1 uppercase tracking-wider">
                  {t("admin.dashboard.totalActiveUsers")}
                </p>
                <p className="text-4xl font-bold text-[#C4A035]">
                  {totalUsers.toLocaleString()}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/10">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/5">
                  <p className="text-white/50 text-xs mb-1">
                    {t("admin.dashboard.students")}
                  </p>
                  <p className="text-2xl font-bold">
                    {students.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/5">
                  <p className="text-white/50 text-xs mb-1">
                    {t("admin.dashboard.teachers")}
                  </p>
                  <p className="text-2xl font-bold">
                    {teachers.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= CHARTS ================= */}
      <div>
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1.5 h-8 bg-gradient-to-b from-[#2B6F5E] to-[#C4A035] rounded-full"></div>
            <h2 className="text-2xl font-bold text-[#1B1B1B]">
              {t("admin.dashboard.analyticsInsights")}
            </h2>
          </div>
          <p className="text-[#6B5D4F] ml-5">
            {t("admin.dashboard.analyticsDesc")}
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <EnrollmentsChart enrollments={enrollments} />
          </div>
          <div className="lg:col-span-1">
            <GenderChart gender={gender} />
          </div>
        </div>
      </div>

      {/* ================= PAYMENT ALERT ================= */}
      {Number(unpaidFees) > 0 && (
        <div className="relative overflow-hidden bg-gradient-to-br from-[#C4A035]/10 to-[#C4A035]/5 border-2 border-[#C4A035]/30 rounded-2xl p-6">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#C4A035] to-[#C4A035]/60"></div>
          <div className="relative flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C4A035] to-[#C4A035]/80 flex items-center justify-center shrink-0 shadow-lg shadow-[#C4A035]/20">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-bold text-[#1B1B1B]">
                  {t("admin.dashboard.paymentAlert")}
                </h3>
                <span className="px-2.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full uppercase">
                  {t("admin.dashboard.actionNeeded")}
                </span>
              </div>
              <p className="text-[#6B5D4F] mb-3 text-sm leading-relaxed">
                {t("admin.dashboard.unpaidFeesCount", {
                  count: revenue.unpaidCount,
                })}{" "}
                {t("admin.dashboard.unpaidFeesTotal", {
                  amount: formatCurrency(Number(unpaidFees)),
                })}
              </p>
              <Link
                to="/admin/fees"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#C4A035] to-[#C4A035]/90 hover:from-[#C4A035]/90 hover:to-[#C4A035]/80 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg text-sm"
              >
                <DollarSign className="w-4 h-4" />
                {t("admin.dashboard.viewUnpaidFees")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

/* ===============================================================
   SUB-COMPONENTS
=============================================================== */

function MainStatCard({
  icon: Icon,
  label,
  value,
  variant,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  variant: "teal" | "mustard";
}) {
  const styles = {
    teal: {
      bg: "bg-[#2B6F5E]/8",
      icon: "text-[#2B6F5E]",
      bar: "from-[#2B6F5E] to-[#2B6F5E]/70",
    },
    mustard: {
      bg: "bg-[#C4A035]/8",
      icon: "text-[#C4A035]",
      bar: "from-[#C4A035] to-[#C4A035]/70",
    },
  };
  const s = styles[variant];
  return (
    <div className="relative bg-white rounded-2xl border border-[#D8CDC0]/60 p-4 hover:shadow-md hover:shadow-[#D8CDC0]/30 transition-all overflow-hidden group">
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${s.bar} opacity-60 group-hover:opacity-100 transition-opacity`}
      ></div>
      <div className="flex items-center justify-between mb-3">
        <div
          className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}
        >
          <Icon className={`w-5 h-5 ${s.icon}`} />
        </div>
      </div>
      <p className="text-xs text-[#6B5D4F] mb-0.5">{label}</p>
      <p className="text-2xl font-bold text-[#1B1B1B]">{value}</p>
    </div>
  );
}

function PipelineStep({
  icon: Icon,
  label,
  count,
  variant,
  badge,
}: {
  icon: React.ElementType;
  label: string;
  count: number;
  variant: "mustard" | "teal" | "green" | "beige";
  badge?: boolean;
}) {
  const styles = {
    mustard: {
      bg: "bg-[#C4A035]/8 border-[#C4A035]/20",
      text: "text-[#9A7D2A]",
      icon: "text-[#C4A035]",
    },
    teal: {
      bg: "bg-[#2B6F5E]/8 border-[#2B6F5E]/20",
      text: "text-[#2B6F5E]",
      icon: "text-[#2B6F5E]",
    },
    green: {
      bg: "bg-[#8DB896]/15 border-[#8DB896]/25",
      text: "text-[#3D7A4A]",
      icon: "text-[#8DB896]",
    },
    beige: {
      bg: "bg-[#D8CDC0]/20 border-[#D8CDC0]/40",
      text: "text-[#6B5D4F]",
      icon: "text-[#BEB29E]",
    },
  };
  const s = styles[variant];
  return (
    <div
      className={`relative rounded-xl border p-4 text-center ${s.bg} transition-shadow hover:shadow-sm`}
    >
      {badge && count > 0 && (
        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-[10px] font-bold text-white">{count}</span>
        </div>
      )}
      <Icon className={`w-5 h-5 mx-auto mb-2 ${s.icon}`} />
      <p className={`text-2xl font-bold ${s.text}`}>{count}</p>
      <p className="text-[11px] font-medium text-[#6B5D4F] mt-1">{label}</p>
    </div>
  );
}

function QuickActionLink({
  to,
  icon: Icon,
  label,
  variant,
  badge,
}: {
  to: string;
  icon: React.ElementType;
  label: string;
  variant: "mustard" | "teal";
  badge?: number;
}) {
  const styles = {
    mustard: {
      bg: "bg-[#C4A035]/6",
      hover: "hover:bg-[#C4A035]/12",
      icon: "text-[#C4A035]",
    },
    teal: {
      bg: "bg-[#2B6F5E]/6",
      hover: "hover:bg-[#2B6F5E]/12",
      icon: "text-[#2B6F5E]",
    },
  };
  const s = styles[variant];
  return (
    <Link
      to={to}
      className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border border-[#D8CDC0]/40 ${s.bg} ${s.hover} transition-all`}
    >
      {badge && badge > 0 && (
        <div className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-[10px] font-bold text-white">{badge}</span>
        </div>
      )}
      <Icon className={`w-5 h-5 ${s.icon}`} />
      <span className="text-[11px] font-semibold text-[#1B1B1B]">{label}</span>
    </Link>
  );
}
