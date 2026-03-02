/* ===============================================================
   OwnerDashboard.tsx — ENHANCED v2
   
   📁 src/app/owner/pages/dashboard/OwnerDashboard.tsx
   
   ✅ Uses ALL new dashboard data from enhanced getOwnerDashboard()
   ✅ Revenue analytics with monthly trend, payment methods
   ✅ Attendance stats + today's overview
   ✅ Student demographics (gender, level, new this month)
   ✅ Documents pending review
   ✅ Communications overview
   ✅ Infrastructure: groups fill rates, sessions today
   ✅ Month-over-month comparisons with trend arrows
   ✅ Dark mode · i18n ready · Same design language
=============================================================== */

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
  ClipboardList,
  BarChart3,
  Crown,
  ShieldCheck,
  Server,
  Database,
  Cpu,
  Eye,
  AlertTriangle,
  Zap,
  Settings,
  ScrollText,
  Briefcase,
  PieChart,
  UserCheck,
  UserPlus,
  Bell,
  Megaphone,
  FileCheck,
  FileClock,
  FileX,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import PageLoader from "../../../../components/PageLoader";
import {
  useOwnerDashboard,
  useSystemHealth,
} from "../../../../hooks/owner/Useowner.hooks";
import { useMe } from "../../../../hooks/auth/auth.hooks";

/* ═══ Helpers ═══ */
const formatCurrency = (amount: number) =>
  `${Number(amount).toLocaleString("en-US")} DA`;

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

/* ═══ Main Component ═══ */
const OwnerDashboard = () => {
  const { t, i18n } = useTranslation();
  const { data: dashboard, isLoading: isDashboardLoading } =
    useOwnerDashboard();
  const { data: health } = useSystemHealth();
  const { isLoading: isUserLoading } = useMe();

  const isLoading = isDashboardLoading || isUserLoading;

  const formatRelativeTime = (date: string) => {
    const now = new Date();
    const d = new Date(date);
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return t("admin.dashboard.justNow", "Just now");
    if (diffMins < 60)
      return t("admin.dashboard.minsAgo", "{{count}}m ago", {
        count: diffMins,
      });
    if (diffHours < 24)
      return t("admin.dashboard.hoursAgo", "{{count}}h ago", {
        count: diffHours,
      });
    if (diffDays < 7)
      return t("admin.dashboard.daysAgo", "{{count}}d ago", {
        count: diffDays,
      });
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
    const config: Record<string, { bg: string; text: string; label: string }> =
      {
        PENDING: {
          bg: "bg-[#C4A035]/15 dark:bg-[#C4A035]/20",
          text: "text-[#9A7D2A] dark:text-[#D4A843]",
          label: t("admin.dashboard.pending", "Pending"),
        },
        VALIDATED: {
          bg: "bg-[#2B6F5E]/15 dark:bg-[#4ADE80]/15",
          text: "text-[#2B6F5E] dark:text-[#4ADE80]",
          label: t("admin.dashboard.validated", "Validated"),
        },
        PAID: {
          bg: "bg-[#8DB896]/20 dark:bg-[#8DB896]/15",
          text: "text-[#3D7A4A] dark:text-[#8DB896]",
          label: t("admin.dashboard.paid", "Paid"),
        },
        FINISHED: {
          bg: "bg-[#D8CDC0]/40 dark:bg-[#555555]/30",
          text: "text-[#6B5D4F] dark:text-[#AAAAAA]",
          label: t("admin.dashboard.finished", "Finished"),
        },
        REJECTED: {
          bg: "bg-red-100 dark:bg-red-950/40",
          text: "text-red-700 dark:text-red-400",
          label: t("admin.dashboard.rejected", "Rejected"),
        },
      };
    const c = config[status] || config.PENDING;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${c.bg} ${c.text}`}
      >
        {c.label}
      </span>
    );
  };

  if (isLoading) return <PageLoader />;
  if (!dashboard) return null;

  // Destructure new + legacy data
  const d = dashboard as any;
  const kpis = d.kpis || {};
  const system = d.system || {};
  const academics = d.academics || {};
  const finance = d.finance || {};
  const revenue = d.revenue || {};
  const enrollments = d.enrollments || {};
  const attendance = d.attendance || {};
  const users = d.users || {};
  const audit = d.audit || {};
  const students = d.students || {};
  const documents = d.documents || {};
  const communications = d.communications || {};
  const infrastructure = d.infrastructure || {};
  const users_by_role = d.users_by_role || [];
  const enrollments_by_status = d.enrollments_by_status || [];
  const recent_activity = audit.recent || d.recent_activity || [];

  // Pipeline
  const pipeline: Record<string, number> = {
    pending: enrollments.pending || 0,
    validated: enrollments.validated || 0,
    paid: enrollments.paid || 0,
    finished: enrollments.finished || 0,
    rejected: enrollments.rejected || 0,
  };
  const pipelineTotal = enrollments.total || academics.total_enrollments || 0;

  return (
    <div className="space-y-6">
      {/* ═══════════ HEADER ═══════════ */}
      <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] p-6 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#C4A035] to-[#2B6F5E]"></div>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C4A035] to-[#C4A035]/80 flex items-center justify-center shadow-lg shadow-[#C4A035]/20 dark:shadow-[#C4A035]/10">
            <Crown className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-2xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                {t("owner.dashboard.title", "System Overview")}
              </h1>
              <span className="px-2 py-0.5 bg-[#C4A035]/15 dark:bg-[#C4A035]/20 text-[#9A7D2A] dark:text-[#D4A843] text-[10px] font-bold rounded-full uppercase tracking-wider">
                Owner
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#6B5D4F] dark:text-[#AAAAAA]">
              <Calendar className="w-4 h-4 text-[#C4A035]" />
              <span>{getCurrentDate()}</span>
            </div>
            <p className="text-sm text-brand-brown dark:text-[#666666] mt-0.5">
              {t(
                "owner.dashboard.subtitle",
                "Complete system control & monitoring",
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════ 🔒 SYSTEM HEALTH BANNER ═══════════ */}
      {health && (
        <div
          className={`relative overflow-hidden rounded-2xl border p-4 ${
            health.status === "healthy"
              ? "bg-[#8DB896]/8 dark:bg-[#4ADE80]/5 border-[#8DB896]/25 dark:border-[#4ADE80]/15"
              : "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800/30"
          }`}
        >
          <div
            className={`absolute left-0 top-0 bottom-0 w-1.5 ${
              health.status === "healthy"
                ? "bg-gradient-to-b from-[#8DB896] to-[#2B6F5E]"
                : "bg-gradient-to-b from-red-500 to-red-600"
            }`}
          ></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  health.status === "healthy"
                    ? "bg-[#2B6F5E]/10 dark:bg-[#4ADE80]/10"
                    : "bg-red-100 dark:bg-red-950/30"
                }`}
              >
                <Server
                  className={`w-5 h-5 ${
                    health.status === "healthy"
                      ? "text-[#2B6F5E] dark:text-[#4ADE80]"
                      : "text-red-600 dark:text-red-400"
                  }`}
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                    {health.status === "healthy"
                      ? t(
                          "owner.dashboard.systemHealthy",
                          "All Systems Operational",
                        )
                      : t(
                          "owner.dashboard.systemUnhealthy",
                          "System Issue Detected",
                        )}
                  </p>
                  <span
                    className={`w-2 h-2 rounded-full animate-pulse ${
                      health.status === "healthy"
                        ? "bg-[#2B6F5E] dark:bg-[#4ADE80]"
                        : "bg-red-500"
                    }`}
                  ></span>
                </div>
                <p className="text-xs text-[#6B5D4F] dark:text-[#888888]">
                  Database: {health.database?.latency_ms ?? "—"}ms · Uptime:{" "}
                  {health.uptime ?? "N/A"}
                </p>
              </div>
            </div>
            <Link
              to="/owner/system"
              className="text-sm font-medium text-[#2B6F5E] dark:text-[#4ADE80] hover:text-[#2B6F5E]/80 dark:hover:text-[#4ADE80]/80 flex items-center gap-1 transition-colors"
            >
              {t("owner.dashboard.systemDetails", "Details")}{" "}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* ═══════════ MAIN STATS — 8 cards ═══════════ */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <MainStatCard
          icon={Users}
          label={t("owner.dashboard.totalUsers", "Total Users")}
          value={kpis.total_users || system.total_users}
          variant="teal"
        />
        <MainStatCard
          icon={ShieldCheck}
          label={t("owner.dashboard.admins", "Admins")}
          value={kpis.total_admins || system.admins}
          variant="mustard"
          sub={`${kpis.total_owners || system.owners || 0} owners`}
        />
        <MainStatCard
          icon={GraduationCap}
          label={t("owner.dashboard.students", "Students")}
          value={kpis.total_students || academics.total_students}
          variant="teal"
        />
        <MainStatCard
          icon={Briefcase}
          label={t("owner.dashboard.teachers", "Teachers")}
          value={kpis.total_teachers || academics.total_teachers}
          variant="mustard"
        />
        <MainStatCard
          icon={BookOpen}
          label={t("owner.dashboard.courses", "Courses")}
          value={kpis.total_courses || academics.total_courses}
          variant="teal"
        />
        <MainStatCard
          icon={LayoutGrid}
          label={t("owner.dashboard.groups", "Groups")}
          value={kpis.total_groups || academics.total_groups}
          variant="mustard"
        />
        <MainStatCard
          icon={FileText}
          label={t("owner.dashboard.enrollments", "Enrollments")}
          value={enrollments.total || academics.total_enrollments}
          variant="teal"
        />
        <MainStatCard
          icon={Calendar}
          label={t("owner.dashboard.sessions", "Sessions")}
          value={kpis.total_sessions || academics.total_sessions}
          variant="mustard"
        />
      </div>

      {/* ═══════════ 🔒 USERS BREAKDOWN BY ROLE ═══════════ */}
      <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] p-6 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#C4A035] to-[#C4A035]/60"></div>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C4A035] to-[#C4A035]/80 flex items-center justify-center shadow-md shadow-[#C4A035]/20 dark:shadow-[#C4A035]/10">
              <PieChart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                {t("owner.dashboard.userBreakdown", "User Breakdown")}
              </h3>
              <p className="text-xs text-[#BEB29E] dark:text-[#666666]">
                {users.active || system.active_users}{" "}
                {t("owner.dashboard.activeOf", "active of")}{" "}
                {kpis.total_users || system.total_users}{" "}
                {t("owner.dashboard.total", "total")}
                {users.google_users > 0 && (
                  <span className="ml-2">
                    · {users.google_users} Google · {users.password_users}{" "}
                    {t("owner.dashboard.password", "Password")}
                  </span>
                )}
              </p>
            </div>
          </div>
          <Link
            to="/owner/users"
            className="text-sm font-medium text-[#2B6F5E] dark:text-[#4ADE80] hover:text-[#2B6F5E]/80 dark:hover:text-[#4ADE80]/80 flex items-center gap-1 transition-colors"
          >
            {t("owner.dashboard.manageUsers", "Manage")}{" "}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {users_by_role.map((item: any) => {
            const rc = ROLE_CONFIG[item.role] || ROLE_CONFIG.STUDENT;
            const RoleIcon = rc.icon;
            const totalU = kpis.total_users || system.total_users || 1;
            const percent = Math.round((item.count / totalU) * 100);
            return (
              <div
                key={item.role}
                className={`rounded-xl border p-4 ${rc.bg} transition-shadow hover:shadow-sm`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${rc.iconBg}`}
                  >
                    <RoleIcon className={`w-4 h-4 ${rc.text}`} />
                  </div>
                  <span
                    className={`text-xs font-bold uppercase tracking-wider ${rc.text}`}
                  >
                    {item.role}
                  </span>
                </div>
                <p className="text-2xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                  {item.count}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1.5 rounded-full bg-[#D8CDC0]/30 dark:bg-[#333333] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${rc.bar}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-[#BEB29E] dark:text-[#666666]">
                    {percent}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════════ ENROLLMENT PIPELINE + REVENUE ═══════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline */}
        <div className="lg:col-span-2 relative bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] p-6 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#C4A035] to-[#C4A035]/60"></div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C4A035] to-[#C4A035]/80 flex items-center justify-center shadow-md shadow-[#C4A035]/20 dark:shadow-[#C4A035]/10">
                <ClipboardList className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                  {t(
                    "admin.dashboard.enrollmentPipeline",
                    "Enrollment Pipeline",
                  )}
                </h3>
                {enrollments.month_change_percent !== undefined && (
                  <TrendBadge
                    value={enrollments.month_change_percent}
                    label={t("owner.dashboard.vsLastMonth", "vs last month")}
                  />
                )}
              </div>
            </div>
            <Link
              to="/admin/enrollments"
              className="text-sm font-medium text-[#2B6F5E] dark:text-[#4ADE80] hover:text-[#2B6F5E]/80 dark:hover:text-[#4ADE80]/80 flex items-center gap-1 transition-colors"
            >
              {t("admin.dashboard.viewAll", "View All")}{" "}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-5 gap-3">
            <PipelineStep
              icon={Clock}
              label={t("admin.dashboard.pending", "Pending")}
              count={pipeline.pending}
              variant="mustard"
              badge={pipeline.pending > 0}
            />
            <PipelineStep
              icon={CheckCircle}
              label={t("admin.dashboard.validated", "Validated")}
              count={pipeline.validated}
              variant="teal"
            />
            <PipelineStep
              icon={DollarSign}
              label={t("admin.dashboard.paid", "Paid")}
              count={pipeline.paid}
              variant="green"
            />
            <PipelineStep
              icon={GraduationCap}
              label={t("admin.dashboard.finished", "Finished")}
              count={pipeline.finished}
              variant="beige"
            />
            <PipelineStep
              icon={AlertTriangle}
              label={t("admin.dashboard.rejected", "Rejected")}
              count={pipeline.rejected}
              variant="red"
            />
          </div>
          {pipelineTotal > 0 && (
            <div className="mt-5">
              <div className="flex h-3 rounded-full overflow-hidden bg-[#D8CDC0]/30 dark:bg-[#333333]">
                {pipeline.pending > 0 && (
                  <div
                    className="bg-[#C4A035] transition-all"
                    style={{
                      width: `${(pipeline.pending / pipelineTotal) * 100}%`,
                    }}
                  />
                )}
                {pipeline.validated > 0 && (
                  <div
                    className="bg-[#2B6F5E] transition-all"
                    style={{
                      width: `${(pipeline.validated / pipelineTotal) * 100}%`,
                    }}
                  />
                )}
                {pipeline.paid > 0 && (
                  <div
                    className="bg-[#8DB896] transition-all"
                    style={{
                      width: `${(pipeline.paid / pipelineTotal) * 100}%`,
                    }}
                  />
                )}
                {pipeline.finished > 0 && (
                  <div
                    className="bg-[#BEB29E] transition-all"
                    style={{
                      width: `${(pipeline.finished / pipelineTotal) * 100}%`,
                    }}
                  />
                )}
                {pipeline.rejected > 0 && (
                  <div
                    className="bg-red-500 transition-all"
                    style={{
                      width: `${(pipeline.rejected / pipelineTotal) * 100}%`,
                    }}
                  />
                )}
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-4 text-xs text-[#6B5D4F] dark:text-[#AAAAAA]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#C4A035]" />
                    {t("admin.dashboard.pending", "Pending")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2B6F5E]" />
                    {t("admin.dashboard.validated", "Validated")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#8DB896]" />
                    {t("admin.dashboard.paid", "Paid")}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#BEB29E]" />
                    {t("admin.dashboard.finished", "Finished")}
                  </span>
                </div>
                {enrollments.acceptance_rate > 0 && (
                  <span className="text-xs font-semibold text-[#2B6F5E] dark:text-[#4ADE80]">
                    {t("owner.dashboard.acceptanceRate", "Acceptance")}:{" "}
                    {enrollments.acceptance_rate}%
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Revenue Card — Enhanced */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#2B6F5E] via-[#2B6F5E] to-[#2B6F5E]/90 rounded-2xl shadow-xl shadow-[#2B6F5E]/20 dark:shadow-[#2B6F5E]/10 p-6 text-white">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#C4A035]"></div>
          <div className="absolute inset-0 opacity-[0.07]">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-20 translate-x-20" />
            <div className="absolute bottom-0 left-0 w-28 h-28 bg-white rounded-full translate-y-14 -translate-x-14" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/10">
                <Banknote className="w-5 h-5 text-[#C4A035]" />
              </div>
              <div>
                <h3 className="text-lg font-bold">
                  {t("admin.dashboard.revenue", "Revenue")}
                </h3>
                {revenue.month_change_percent !== undefined && (
                  <span
                    className={`text-xs font-medium ${revenue.month_change_percent >= 0 ? "text-green-300" : "text-red-300"}`}
                  >
                    {revenue.month_change_percent >= 0 ? "↑" : "↓"}{" "}
                    {Math.abs(revenue.month_change_percent)}%{" "}
                    {t("owner.dashboard.vsLastMonth", "vs last month")}
                  </span>
                )}
              </div>
            </div>
            <div className="mb-4">
              <p className="text-white/60 text-xs font-medium mb-1 uppercase tracking-wider">
                {t("admin.dashboard.totalCollected", "Total Collected")}
              </p>
              <p className="text-3xl font-bold text-[#C4A035]">
                {formatCurrency(revenue.collected || finance.collected)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/5">
                <p className="text-white/60 text-[10px] mb-0.5">
                  {t("owner.dashboard.today", "Today")}
                </p>
                <p className="text-base font-bold">
                  {formatCurrency(revenue.today?.amount || 0)}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/5">
                <p className="text-white/60 text-[10px] mb-0.5">
                  {t("owner.dashboard.thisMonth", "This Month")}
                </p>
                <p className="text-base font-bold">
                  {formatCurrency(revenue.this_month?.amount || 0)}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/5">
                <p className="text-white/60 text-[10px] mb-0.5">
                  {t("admin.dashboard.pendingRevenue", "Pending")}
                </p>
                <p className="text-base font-bold">
                  {formatCurrency(revenue.pending || finance.pending)}
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2.5 border border-white/5">
                <p className="text-white/60 text-[10px] mb-0.5">
                  {t("owner.dashboard.collectionRate", "Collection")}
                </p>
                <p className="text-base font-bold">
                  {revenue.collection_rate || 0}%
                </p>
              </div>
            </div>
            <Link
              to="/admin/fees"
              className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 bg-[#C4A035] hover:bg-[#C4A035]/90 rounded-xl text-sm font-semibold transition-colors text-[#1B1B1B]"
            >
              <DollarSign className="w-4 h-4" />{" "}
              {t("admin.dashboard.manageFees", "Manage Fees")}
            </Link>
          </div>
        </div>
      </div>

      {/* ═══════════ ✨ NEW: ATTENDANCE + STUDENTS + DOCUMENTS ═══════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Overview */}
        <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] p-6 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#2B6F5E] to-[#8DB896]"></div>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2B6F5E] to-[#2B6F5E]/80 flex items-center justify-center shadow-md shadow-[#2B6F5E]/20 dark:shadow-[#2B6F5E]/10">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                {t("owner.dashboard.attendance", "Attendance")}
              </h3>
              <p className="text-xs text-[#BEB29E] dark:text-[#666666]">
                {t("owner.dashboard.overallRate", "Overall rate")}:{" "}
                <span className="font-semibold text-[#2B6F5E] dark:text-[#4ADE80]">
                  {attendance.overall_rate || 0}%
                </span>
              </p>
            </div>
          </div>
          {/* Today */}
          <div className="bg-[#2B6F5E]/5 dark:bg-[#4ADE80]/5 rounded-xl p-3 mb-4 border border-[#2B6F5E]/10 dark:border-[#4ADE80]/10">
            <p className="text-xs font-semibold text-[#2B6F5E] dark:text-[#4ADE80] mb-2 uppercase tracking-wider">
              {t("owner.dashboard.today", "Today")}
            </p>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <p className="text-xl font-bold text-[#2B6F5E] dark:text-[#4ADE80]">
                  {attendance.today?.present || 0}
                </p>
                <p className="text-[10px] text-[#6B5D4F] dark:text-[#888888]">
                  {t("owner.dashboard.present", "Present")}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-red-600 dark:text-red-400">
                  {attendance.today?.absent || 0}
                </p>
                <p className="text-[10px] text-[#6B5D4F] dark:text-[#888888]">
                  {t("owner.dashboard.absent", "Absent")}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                  {attendance.today?.rate || 0}%
                </p>
                <p className="text-[10px] text-[#6B5D4F] dark:text-[#888888]">
                  {t("owner.dashboard.rate", "Rate")}
                </p>
              </div>
            </div>
          </div>
          {/* Top absent */}
          {attendance.top_absent_students?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#6B5D4F] dark:text-[#888888] mb-2">
                {t("owner.dashboard.topAbsent", "Most Absent")}
              </p>
              <div className="space-y-1.5">
                {attendance.top_absent_students
                  .slice(0, 3)
                  .map((s: any, i: number) => (
                    <div
                      key={s.student_id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-[#1B1B1B] dark:text-[#E5E5E5] truncate flex-1">
                        {i + 1}. {s.student_name}
                      </span>
                      <span className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded-full">
                        {s.absent_count}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Student Demographics */}
        <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] p-6 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#C4A035] to-[#C4A035]/60"></div>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C4A035] to-[#C4A035]/80 flex items-center justify-center shadow-md shadow-[#C4A035]/20 dark:shadow-[#C4A035]/10">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                {t("owner.dashboard.studentDemographics", "Students")}
              </h3>
              {students.new_change_percent !== undefined && (
                <TrendBadge
                  value={students.new_change_percent}
                  label={t("owner.dashboard.newThisMonth", "new this month")}
                />
              )}
            </div>
          </div>
          {/* New this month */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-[#C4A035]/5 dark:bg-[#C4A035]/10 rounded-xl p-3 border border-[#C4A035]/15 dark:border-[#C4A035]/20">
              <p className="text-[10px] text-[#9A7D2A] dark:text-[#D4A843] font-medium">
                {t("owner.dashboard.newThisMonth", "New This Month")}
              </p>
              <p className="text-2xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                {students.new_this_month || 0}
              </p>
            </div>
            <div className="bg-[#D8CDC0]/15 dark:bg-[#333333]/30 rounded-xl p-3 border border-[#D8CDC0]/30 dark:border-[#333333]">
              <p className="text-[10px] text-[#6B5D4F] dark:text-[#888888] font-medium">
                {t("owner.dashboard.withoutGroup", "Without Group")}
              </p>
              <p className="text-2xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                {students.without_group || 0}
              </p>
            </div>
          </div>
          {/* Gender */}
          {students.gender && (
            <div className="mb-4">
              <p className="text-xs font-semibold text-[#6B5D4F] dark:text-[#888888] mb-2">
                {t("owner.dashboard.gender", "Gender")}
              </p>
              <div className="grid grid-cols-3 gap-2">
                <GenderStat
                  label={t("owner.dashboard.male", "Male")}
                  count={students.gender.male}
                  color="teal"
                />
                <GenderStat
                  label={t("owner.dashboard.female", "Female")}
                  count={students.gender.female}
                  color="mustard"
                />
                <GenderStat
                  label={t("owner.dashboard.other", "Other")}
                  count={students.gender.other}
                  color="beige"
                />
              </div>
            </div>
          )}
          {/* By level */}
          {students.by_level?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-[#6B5D4F] dark:text-[#888888] mb-2">
                {t("owner.dashboard.byLevel", "By Level")}
              </p>
              <div className="flex gap-2 flex-wrap">
                {students.by_level.map((l: any) => (
                  <span
                    key={l.level}
                    className="px-3 py-1.5 rounded-lg bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/10 text-xs font-semibold text-[#2B6F5E] dark:text-[#4ADE80] border border-[#2B6F5E]/15 dark:border-[#4ADE80]/15"
                  >
                    {l.level}{" "}
                    <span className="text-[#1B1B1B] dark:text-[#E5E5E5] ml-1">
                      {l.count}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Documents + Communications */}
        <div className="space-y-6">
          {/* Documents */}
          <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] p-5 overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#8DB896] to-[#8DB896]/60"></div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#8DB896] to-[#8DB896]/80 flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-base font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                {t("owner.dashboard.documents", "Documents")}
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <DocStat
                icon={FileClock}
                label={t("admin.dashboard.pending", "Pending")}
                count={documents.pending || 0}
                color="mustard"
              />
              <DocStat
                icon={FileCheck}
                label={t("owner.dashboard.approved", "Approved")}
                count={documents.approved || 0}
                color="teal"
              />
              <DocStat
                icon={FileX}
                label={t("admin.dashboard.rejected", "Rejected")}
                count={documents.rejected || 0}
                color="red"
              />
            </div>
          </div>

          {/* Communications */}
          <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] p-5 overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#C4A035] to-[#C4A035]/60"></div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#C4A035] to-[#C4A035]/80 flex items-center justify-center">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-base font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                {t("owner.dashboard.communications", "Communications")}
              </h3>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#C4A035]/5 dark:bg-[#C4A035]/8 border border-[#C4A035]/10 dark:border-[#C4A035]/15">
                <span className="flex items-center gap-2 text-xs text-[#6B5D4F] dark:text-[#AAAAAA]">
                  <Megaphone className="w-3.5 h-3.5 text-[#C4A035]" />
                  {t("owner.dashboard.publishedAnnouncements", "Published")}
                </span>
                <span className="text-sm font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                  {communications.published_announcements || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#2B6F5E]/5 dark:bg-[#4ADE80]/5 border border-[#2B6F5E]/10 dark:border-[#4ADE80]/10">
                <span className="flex items-center gap-2 text-xs text-[#6B5D4F] dark:text-[#AAAAAA]">
                  <Bell className="w-3.5 h-3.5 text-[#2B6F5E] dark:text-[#4ADE80]" />
                  {t("owner.dashboard.notifications", "Notifications")}
                </span>
                <span className="text-sm font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                  {communications.total_notifications || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#8DB896]/5 dark:bg-[#8DB896]/8 border border-[#8DB896]/10 dark:border-[#8DB896]/15">
                <span className="flex items-center gap-2 text-xs text-[#6B5D4F] dark:text-[#AAAAAA]">
                  <Eye className="w-3.5 h-3.5 text-[#8DB896]" />
                  {t("owner.dashboard.readRate", "Read Rate")}
                </span>
                <span className="text-sm font-bold text-[#2B6F5E] dark:text-[#4ADE80]">
                  {communications.notification_read_rate || 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ ✨ NEW: INFRASTRUCTURE (Groups Fill + Sessions Today) ═══════════ */}
      {(infrastructure.group_fill_rates?.length > 0 ||
        infrastructure.sessions_today > 0) && (
        <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] p-6 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#2B6F5E] to-[#8DB896]"></div>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2B6F5E] to-[#2B6F5E]/80 flex items-center justify-center shadow-md shadow-[#2B6F5E]/20 dark:shadow-[#2B6F5E]/10">
                <LayoutGrid className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                  {t("owner.dashboard.infrastructure", "Infrastructure")}
                </h3>
                <p className="text-xs text-[#BEB29E] dark:text-[#666666]">
                  {infrastructure.groups?.open || 0}{" "}
                  {t("owner.dashboard.openGroups", "open")} ·{" "}
                  {infrastructure.sessions_today || 0}{" "}
                  {t("owner.dashboard.sessionsToday", "sessions today")} ·{" "}
                  {infrastructure.rooms_active || 0}{" "}
                  {t("owner.dashboard.roomsActive", "rooms")}
                </p>
              </div>
            </div>
            <Link
              to="/admin/groups"
              className="text-sm font-medium text-[#2B6F5E] dark:text-[#4ADE80] hover:text-[#2B6F5E]/80 dark:hover:text-[#4ADE80]/80 flex items-center gap-1 transition-colors"
            >
              {t("admin.dashboard.viewAll", "View All")}{" "}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {infrastructure.group_fill_rates?.slice(0, 8).map((g: any) => (
              <div
                key={g.group_id}
                className="rounded-xl border border-[#D8CDC0]/40 dark:border-[#2A2A2A] p-3 hover:shadow-sm transition-shadow"
              >
                <p className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] truncate mb-2">
                  {g.group_name}
                </p>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="flex-1 h-2 rounded-full bg-[#D8CDC0]/30 dark:bg-[#333333] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${g.fill_rate >= 90 ? "bg-red-500" : g.fill_rate >= 70 ? "bg-[#C4A035]" : "bg-[#2B6F5E]"}`}
                      style={{ width: `${Math.min(g.fill_rate, 100)}%` }}
                    />
                  </div>
                  <span
                    className={`text-xs font-bold ${g.fill_rate >= 90 ? "text-red-600 dark:text-red-400" : g.fill_rate >= 70 ? "text-[#C4A035] dark:text-[#D4A843]" : "text-[#2B6F5E] dark:text-[#4ADE80]"}`}
                  >
                    {g.fill_rate}%
                  </span>
                </div>
                <p className="text-[10px] text-[#BEB29E] dark:text-[#666666]">
                  {g.enrolled}/{g.max}{" "}
                  {t("owner.dashboard.students", "students")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════ SYSTEM PERF + QUICK ACTIONS + ENROLLMENT ANALYTICS ═══════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Performance */}
        <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] p-6 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#2B6F5E] to-[#8DB896]"></div>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2B6F5E] to-[#2B6F5E]/80 flex items-center justify-center shadow-md shadow-[#2B6F5E]/20 dark:shadow-[#2B6F5E]/10">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
              {t("owner.dashboard.systemPerformance", "System Performance")}
            </h3>
          </div>
          <div className="space-y-4">
            <SystemMetric
              icon={Database}
              label={t("owner.dashboard.database", "Database")}
              value={
                health?.database?.latency_ms
                  ? `${health.database.latency_ms}ms`
                  : "—"
              }
              status={
                health?.database?.latency_ms && health.database.latency_ms < 100
                  ? "good"
                  : health?.database?.latency_ms &&
                      health.database.latency_ms < 300
                    ? "warning"
                    : "error"
              }
            />
            <SystemMetric
              icon={ScrollText}
              label={t("owner.dashboard.auditToday", "Audit Today")}
              value={String(audit.today || 0)}
              status="good"
            />
            <SystemMetric
              icon={Zap}
              label={t("owner.dashboard.activeUsers", "Active Users")}
              value={`${users.active || system.active_users}/${kpis.total_users || system.total_users}`}
              status={
                (users.active || system.active_users) /
                  (kpis.total_users || system.total_users || 1) >
                0.7
                  ? "good"
                  : "warning"
              }
            />
            <SystemMetric
              icon={Activity}
              label={t("owner.dashboard.auditWeek", "Audit This Week")}
              value={String(audit.this_week || 0)}
              status="good"
            />
          </div>
          <Link
            to="/owner/system"
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 border border-[#D8CDC0]/60 dark:border-[#2A2A2A] hover:bg-[#D8CDC0]/10 dark:hover:bg-[#222222] rounded-xl text-sm font-medium text-[#6B5D4F] dark:text-[#AAAAAA] transition-colors"
          >
            <Settings className="w-4 h-4" />{" "}
            {t("owner.dashboard.systemSettings", "System Settings")}
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] p-6 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#C4A035] to-[#C4A035]/60"></div>
          <h3 className="text-lg font-bold text-[#1B1B1B] dark:text-[#E5E5E5] mb-4">
            {t("owner.dashboard.quickActions", "Quick Actions")}
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
            <QuickActionLink
              to="/owner/admins"
              icon={ShieldCheck}
              label={t("owner.dashboard.admins", "Admins")}
              variant="mustard"
            />
            <QuickActionLink
              to="/owner/users"
              icon={Users}
              label={t("owner.dashboard.users", "Users")}
              variant="teal"
            />
            <QuickActionLink
              to="/admin/enrollments"
              icon={ClipboardList}
              label={t("admin.dashboard.enrollments", "Enrollments")}
              variant="mustard"
              badge={pipeline.pending > 0 ? pipeline.pending : undefined}
            />
            <QuickActionLink
              to="/admin/fees"
              icon={DollarSign}
              label={t("admin.dashboard.fees", "Fees")}
              variant="teal"
            />
            <QuickActionLink
              to="/owner/teachers"
              icon={ScrollText}
              label={t("owner.dashboard.auditLogs", "Audit Logs")}
              variant="mustard"
            />
            <QuickActionLink
              to="/owner/settings"
              icon={Settings}
              label={t("owner.dashboard.settings", "Settings")}
              variant="teal"
            />
            <QuickActionLink
              to="/admin/students"
              icon={GraduationCap}
              label={t("admin.dashboard.students", "Students")}
              variant="teal"
            />
            <QuickActionLink
              to="/admin/courses"
              icon={BookOpen}
              label={t("admin.dashboard.courses", "Courses")}
              variant="mustard"
            />
          </div>
        </div>

        {/* Enrollment by Course */}
        <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] p-6 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#8DB896] to-[#8DB896]/60"></div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8DB896] to-[#8DB896]/80 flex items-center justify-center shadow-md shadow-[#8DB896]/20 dark:shadow-[#8DB896]/10">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
              {t("owner.dashboard.enrollmentByCourse", "Enrollments by Course")}
            </h3>
          </div>
          {enrollments.by_course?.length > 0 ? (
            <div className="space-y-3">
              {enrollments.by_course.slice(0, 6).map((c: any, i: number) => {
                const maxCount = enrollments.by_course[0]?.count || 1;
                const pct = Math.round((c.count / maxCount) * 100);
                const colors = [
                  "bg-[#2B6F5E]",
                  "bg-[#C4A035]",
                  "bg-[#8DB896]",
                  "bg-violet-500",
                  "bg-blue-500",
                  "bg-[#BEB29E]",
                ];
                return (
                  <div key={c.course_id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-[#1B1B1B] dark:text-[#E5E5E5] font-medium truncate flex-1">
                        {c.course_name}
                      </span>
                      <span className="text-xs font-bold text-[#6B5D4F] dark:text-[#AAAAAA] ml-2">
                        {c.count}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#D8CDC0]/20 dark:bg-[#2A2A2A] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${colors[i % colors.length]}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              {enrollments_by_status.map((item: any) => {
                const total = academics.total_enrollments || 1;
                const percent = Math.round((item.count / total) * 100);
                const barColors: Record<string, string> = {
                  PENDING: "bg-[#C4A035]",
                  VALIDATED: "bg-[#2B6F5E]",
                  PAID: "bg-[#8DB896]",
                  FINISHED: "bg-[#BEB29E]",
                  REJECTED: "bg-red-500",
                };
                return (
                  <div key={item.status}>
                    <div className="flex items-center justify-between mb-1.5">
                      <StatusBadge status={item.status} />
                      <span className="text-xs font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                        {item.count}{" "}
                        <span className="text-[#BEB29E] dark:text-[#666666] font-normal">
                          ({percent}%)
                        </span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#D8CDC0]/20 dark:bg-[#2A2A2A] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${barColors[item.status] || "bg-[#BEB29E]"}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ═══════════ 🔒 ACTIVITY FEED + QUICK STATS ═══════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 relative bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] p-6 overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#2B6F5E] to-[#2B6F5E]/60"></div>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2B6F5E] to-[#2B6F5E]/80 flex items-center justify-center shadow-md shadow-[#2B6F5E]/20 dark:shadow-[#2B6F5E]/10">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                {t("owner.dashboard.recentActivity", "Recent Activity")}
              </h3>
            </div>
            <Link
              to="/owner/audit-logs"
              className="text-sm font-medium text-[#2B6F5E] dark:text-[#4ADE80] hover:text-[#2B6F5E]/80 dark:hover:text-[#4ADE80]/80 flex items-center gap-1 transition-colors"
            >
              {t("owner.dashboard.fullAuditLog", "Full Audit Log")}{" "}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {recent_activity.length > 0 ? (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {recent_activity.slice(0, 12).map((log: any, idx: number) => {
                const ai = getActionIcon(log.action);
                return (
                  <div
                    key={log.log_id || idx}
                    className="flex items-start gap-3 p-3 rounded-xl border border-[#D8CDC0]/40 dark:border-[#2A2A2A] hover:bg-[#D8CDC0]/10 dark:hover:bg-[#222222] transition-colors"
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${ai.bg}`}
                    >
                      <ai.icon className={`w-4 h-4 ${ai.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1B1B1B] dark:text-[#E5E5E5] truncate">
                        {formatActionLabel(log.action)}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-[#6B5D4F] dark:text-[#888888] truncate">
                          {log.user_email || "System"}
                        </span>
                        {log.entity_type && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#D8CDC0]/30 dark:bg-[#2A2A2A] text-[#6B5D4F] dark:text-[#888888]">
                            {log.entity_type}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] text-[#BEB29E] dark:text-[#666666] shrink-0 whitespace-nowrap">
                      {formatRelativeTime(log.created_at)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-[#BEB29E] dark:text-[#666666]">
              <ScrollText className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">
                {t("owner.dashboard.noActivity", "No recent activity")}
              </p>
            </div>
          )}
        </div>

        {/* Quick Stats + Platform Overview */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] p-6 overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#C4A035] to-[#2B6F5E]"></div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C4A035] to-[#C4A035]/80 flex items-center justify-center shadow-md shadow-[#C4A035]/20 dark:shadow-[#C4A035]/10">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                {t("owner.dashboard.quickStats", "Quick Stats")}
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <MiniStat
                label={t(
                  "owner.dashboard.studentTeacherRatio",
                  "Student:Teacher",
                )}
                value={`${(kpis.total_teachers || academics.total_teachers) > 0 ? ((kpis.total_students || academics.total_students) / (kpis.total_teachers || academics.total_teachers)).toFixed(1) : "0"}:1`}
                color="teal"
              />
              <MiniStat
                label={t("owner.dashboard.avgPerGroup", "Avg/Group")}
                value={
                  (kpis.total_groups || academics.total_groups) > 0
                    ? (
                        (kpis.total_students || academics.total_students) /
                        (kpis.total_groups || academics.total_groups)
                      ).toFixed(1)
                    : "0"
                }
                color="mustard"
              />
              <MiniStat
                label={t("owner.dashboard.attendanceRate", "Attendance")}
                value={`${attendance.overall_rate || 0}%`}
                color="green"
              />
              <MiniStat
                label={t("owner.dashboard.activeRate", "Active Rate")}
                value={`${(kpis.total_users || system.total_users) > 0 ? Math.round(((users.active || system.active_users) / (kpis.total_users || system.total_users)) * 100) : 0}%`}
                color="violet"
              />
            </div>
          </div>

          {/* Platform Overview — dark card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#1B1B1B] via-[#1B1B1B] to-[#2B6F5E]/40 rounded-2xl shadow-xl p-6 text-white">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#C4A035]"></div>
            <div className="absolute inset-0 opacity-[0.04]">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#C4A035] rounded-full -translate-y-24 translate-x-24" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#2B6F5E] rounded-full translate-y-16 -translate-x-16" />
            </div>
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#C4A035]/20 backdrop-blur-sm flex items-center justify-center border border-[#C4A035]/20">
                  <Crown className="w-5 h-5 text-[#C4A035]" />
                </div>
                <h3 className="text-lg font-bold">
                  {t("owner.dashboard.platformOverview", "Platform Overview")}
                </h3>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-white/50 text-xs font-medium uppercase tracking-wider">
                    {t(
                      "owner.dashboard.totalPlatformUsers",
                      "Total Platform Users",
                    )}
                  </p>
                  <p className="text-3xl font-bold text-[#C4A035]">
                    {(
                      kpis.total_users ||
                      system.total_users ||
                      0
                    ).toLocaleString()}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10">
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-2 border border-white/5 text-center">
                    <p className="text-white/50 text-[10px]">
                      {t("owner.dashboard.students", "Students")}
                    </p>
                    <p className="text-lg font-bold">
                      {kpis.total_students || academics.total_students}
                    </p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-2 border border-white/5 text-center">
                    <p className="text-white/50 text-[10px]">
                      {t("owner.dashboard.teachers", "Teachers")}
                    </p>
                    <p className="text-lg font-bold">
                      {kpis.total_teachers || academics.total_teachers}
                    </p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-2 border border-white/5 text-center">
                    <p className="text-white/50 text-[10px]">
                      {t("owner.dashboard.staff", "Staff")}
                    </p>
                    <p className="text-lg font-bold">
                      {(kpis.total_admins || system.admins || 0) +
                        (kpis.total_owners || system.owners || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════ PAYMENT ALERT ═══════════ */}
      {(revenue.pending || finance.pending) > 0 && (
        <div className="relative overflow-hidden bg-gradient-to-br from-[#C4A035]/10 to-[#C4A035]/5 dark:from-[#C4A035]/15 dark:to-[#C4A035]/5 border-2 border-[#C4A035]/30 dark:border-[#C4A035]/25 rounded-2xl p-6">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#C4A035] to-[#C4A035]/60"></div>
          <div className="relative flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#C4A035] to-[#C4A035]/80 flex items-center justify-center shrink-0 shadow-lg shadow-[#C4A035]/20 dark:shadow-[#C4A035]/10">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                  {t("admin.dashboard.paymentAlert", "Payment Alert")}
                </h3>
                <span className="px-2.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full uppercase">
                  {t("admin.dashboard.actionNeeded", "Action Needed")}
                </span>
              </div>
              <p className="text-[#6B5D4F] dark:text-[#AAAAAA] mb-3 text-sm leading-relaxed">
                {t(
                  "owner.dashboard.pendingRevenueAlert",
                  `There is ${formatCurrency(revenue.pending || finance.pending)} in pending revenue that needs attention.`,
                  {
                    amount: formatCurrency(revenue.pending || finance.pending),
                  },
                )}
              </p>
              <Link
                to="/admin/fees"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#C4A035] to-[#C4A035]/90 hover:from-[#C4A035]/90 hover:to-[#C4A035]/80 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg text-sm"
              >
                <DollarSign className="w-4 h-4" />{" "}
                {t("admin.dashboard.viewUnpaidFees", "View Unpaid Fees")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;

/* ═══════════════════════════════════════════════════════════
   SUB-COMPONENTS
═══════════════════════════════════════════════════════════ */

const ROLE_CONFIG: Record<
  string,
  { icon: any; bg: string; text: string; iconBg: string; bar: string }
> = {
  OWNER: {
    icon: Crown,
    bg: "bg-[#C4A035]/8 dark:bg-[#C4A035]/10 border-[#C4A035]/20 dark:border-[#C4A035]/15",
    text: "text-[#9A7D2A] dark:text-[#D4A843]",
    iconBg: "bg-[#C4A035]/15 dark:bg-[#C4A035]/20",
    bar: "bg-[#C4A035]",
  },
  ADMIN: {
    icon: ShieldCheck,
    bg: "bg-blue-50/80 dark:bg-blue-950/20 border-blue-200/60 dark:border-blue-800/20",
    text: "text-blue-700 dark:text-blue-400",
    iconBg: "bg-blue-100 dark:bg-blue-950/30",
    bar: "bg-blue-500",
  },
  TEACHER: {
    icon: Briefcase,
    bg: "bg-violet-50/80 dark:bg-violet-950/20 border-violet-200/60 dark:border-violet-800/20",
    text: "text-violet-700 dark:text-violet-400",
    iconBg: "bg-violet-100 dark:bg-violet-950/30",
    bar: "bg-violet-500",
  },
  STUDENT: {
    icon: GraduationCap,
    bg: "bg-[#8DB896]/8 dark:bg-[#4ADE80]/5 border-[#8DB896]/25 dark:border-[#4ADE80]/15",
    text: "text-[#2B6F5E] dark:text-[#4ADE80]",
    iconBg: "bg-[#2B6F5E]/10 dark:bg-[#4ADE80]/10",
    bar: "bg-[#2B6F5E]",
  },
};

function TrendBadge({ value, label }: { value: number; label: string }) {
  if (value === 0)
    return (
      <span className="flex items-center gap-1 text-xs text-[#BEB29E] dark:text-[#666666]">
        <Minus className="w-3 h-3" /> {label}
      </span>
    );
  const isUp = value > 0;
  return (
    <span
      className={`flex items-center gap-1 text-xs font-medium ${isUp ? "text-[#2B6F5E] dark:text-[#4ADE80]" : "text-red-600 dark:text-red-400"}`}
    >
      {isUp ? (
        <ArrowUpRight className="w-3 h-3" />
      ) : (
        <ArrowDownRight className="w-3 h-3" />
      )}
      {Math.abs(value)}% {label}
    </span>
  );
}

function MainStatCard({
  icon: Icon,
  label,
  value,
  variant,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  variant: "teal" | "mustard";
  sub?: string;
}) {
  const styles = {
    teal: {
      bg: "bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/10",
      icon: "text-[#2B6F5E] dark:text-[#4ADE80]",
      bar: "from-[#2B6F5E] to-[#2B6F5E]/70",
    },
    mustard: {
      bg: "bg-[#C4A035]/8 dark:bg-[#D4A843]/10",
      icon: "text-[#C4A035] dark:text-[#D4A843]",
      bar: "from-[#C4A035] to-[#C4A035]/70",
    },
  };
  const s = styles[variant];
  return (
    <div className="relative bg-white dark:bg-[#1A1A1A] rounded-2xl border border-[#D8CDC0]/60 dark:border-[#2A2A2A] p-3 hover:shadow-md hover:shadow-[#D8CDC0]/30 dark:hover:shadow-black/20 transition-all overflow-hidden group">
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${s.bar} opacity-60 group-hover:opacity-100 transition-opacity`}
      />
      <div
        className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center mb-2`}
      >
        <Icon className={`w-4 h-4 ${s.icon}`} />
      </div>
      <p className="text-[10px] text-[#6B5D4F] dark:text-[#888888] mb-0.5 truncate">
        {label}
      </p>
      <p className="text-xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
        {value}
      </p>
      {sub && (
        <p className="text-[9px] text-[#BEB29E] dark:text-[#666666] mt-0.5">
          {sub}
        </p>
      )}
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
  variant: "mustard" | "teal" | "green" | "beige" | "red";
  badge?: boolean;
}) {
  const styles = {
    mustard: {
      bg: "bg-[#C4A035]/8 border-[#C4A035]/20 dark:bg-[#C4A035]/10 dark:border-[#C4A035]/15",
      text: "text-[#9A7D2A] dark:text-[#D4A843]",
      icon: "text-[#C4A035] dark:text-[#D4A843]",
    },
    teal: {
      bg: "bg-[#2B6F5E]/8 border-[#2B6F5E]/20 dark:bg-[#4ADE80]/10 dark:border-[#4ADE80]/15",
      text: "text-[#2B6F5E] dark:text-[#4ADE80]",
      icon: "text-[#2B6F5E] dark:text-[#4ADE80]",
    },
    green: {
      bg: "bg-[#8DB896]/15 border-[#8DB896]/25 dark:bg-[#8DB896]/10 dark:border-[#8DB896]/15",
      text: "text-[#3D7A4A] dark:text-[#8DB896]",
      icon: "text-[#8DB896]",
    },
    beige: {
      bg: "bg-[#D8CDC0]/20 border-[#D8CDC0]/40 dark:bg-[#555555]/15 dark:border-[#555555]/25",
      text: "text-[#6B5D4F] dark:text-[#AAAAAA]",
      icon: "text-[#BEB29E] dark:text-[#888888]",
    },
    red: {
      bg: "bg-red-50 border-red-200/60 dark:bg-red-950/20 dark:border-red-800/20",
      text: "text-red-700 dark:text-red-400",
      icon: "text-red-500 dark:text-red-400",
    },
  };
  const s = styles[variant];
  return (
    <div
      className={`relative rounded-xl border p-3 text-center ${s.bg} transition-shadow hover:shadow-sm`}
    >
      {badge && count > 0 && (
        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-[10px] font-bold text-white">{count}</span>
        </div>
      )}
      <Icon className={`w-5 h-5 mx-auto mb-1.5 ${s.icon}`} />
      <p className={`text-xl font-bold ${s.text}`}>{count}</p>
      <p className="text-[10px] font-medium text-[#6B5D4F] dark:text-[#888888] mt-0.5">
        {label}
      </p>
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
      bg: "bg-[#C4A035]/6 dark:bg-[#C4A035]/8",
      hover: "hover:bg-[#C4A035]/12 dark:hover:bg-[#C4A035]/15",
      icon: "text-[#C4A035] dark:text-[#D4A843]",
    },
    teal: {
      bg: "bg-[#2B6F5E]/6 dark:bg-[#2B6F5E]/8",
      hover: "hover:bg-[#2B6F5E]/12 dark:hover:bg-[#2B6F5E]/15",
      icon: "text-[#2B6F5E] dark:text-[#4ADE80]",
    },
  };
  const s = styles[variant];
  return (
    <Link
      to={to}
      className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border border-[#D8CDC0]/40 dark:border-[#2A2A2A] ${s.bg} ${s.hover} transition-all`}
    >
      {badge && badge > 0 && (
        <div className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-[10px] font-bold text-white">{badge}</span>
        </div>
      )}
      <Icon className={`w-5 h-5 ${s.icon}`} />
      <span className="text-[11px] font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] text-center">
        {label}
      </span>
    </Link>
  );
}

function SystemMetric({
  icon: Icon,
  label,
  value,
  status,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  status: "good" | "warning" | "error";
}) {
  const cfg = {
    good: {
      dot: "bg-[#2B6F5E] dark:bg-[#4ADE80]",
      bg: "bg-[#2B6F5E]/5 dark:bg-[#4ADE80]/5",
      icon: "text-[#2B6F5E] dark:text-[#4ADE80]",
    },
    warning: {
      dot: "bg-[#C4A035] dark:bg-[#D4A843]",
      bg: "bg-[#C4A035]/5 dark:bg-[#D4A843]/5",
      icon: "text-[#C4A035] dark:text-[#D4A843]",
    },
    error: {
      dot: "bg-red-500 dark:bg-red-400",
      bg: "bg-red-50 dark:bg-red-950/20",
      icon: "text-red-600 dark:text-red-400",
    },
  };
  const s = cfg[status];
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl ${s.bg}`}>
      <div className="w-8 h-8 rounded-lg bg-white/80 dark:bg-[#1A1A1A] flex items-center justify-center">
        <Icon className={`w-4 h-4 ${s.icon}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[#6B5D4F] dark:text-[#888888]">{label}</p>
        <p className="text-sm font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
          {value}
        </p>
      </div>
      <div className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
    </div>
  );
}

function MiniStat({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "teal" | "mustard" | "green" | "violet";
}) {
  const styles = {
    teal: "bg-[#2B6F5E]/5 dark:bg-[#2B6F5E]/10 border-[#2B6F5E]/15 dark:border-[#2B6F5E]/20 text-[#2B6F5E] dark:text-[#4ADE80]",
    mustard:
      "bg-[#C4A035]/5 dark:bg-[#C4A035]/10 border-[#C4A035]/15 dark:border-[#C4A035]/20 text-[#C4A035] dark:text-[#D4A843]",
    green:
      "bg-[#8DB896]/10 dark:bg-[#8DB896]/10 border-[#8DB896]/20 dark:border-[#8DB896]/15 text-[#3D7A4A] dark:text-[#8DB896]",
    violet:
      "bg-violet-50/80 dark:bg-violet-950/20 border-violet-200/40 dark:border-violet-800/20 text-violet-700 dark:text-violet-400",
  };
  return (
    <div className={`rounded-xl p-3 border ${styles[color]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wider">
        {label}
      </p>
      <p className="text-2xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5] mt-1">
        {value}
      </p>
    </div>
  );
}

function GenderStat({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: "teal" | "mustard" | "beige";
}) {
  const styles = {
    teal: "bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/10 border-[#2B6F5E]/15 dark:border-[#4ADE80]/15",
    mustard:
      "bg-[#C4A035]/8 dark:bg-[#C4A035]/10 border-[#C4A035]/15 dark:border-[#C4A035]/15",
    beige:
      "bg-[#D8CDC0]/15 dark:bg-[#333333]/30 border-[#D8CDC0]/30 dark:border-[#333333]",
  };
  return (
    <div className={`rounded-lg p-2 border text-center ${styles[color]}`}>
      <p className="text-lg font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
        {count}
      </p>
      <p className="text-[10px] text-[#6B5D4F] dark:text-[#888888]">{label}</p>
    </div>
  );
}

function DocStat({
  icon: Icon,
  label,
  count,
  color,
}: {
  icon: React.ElementType;
  label: string;
  count: number;
  color: "teal" | "mustard" | "red";
}) {
  const styles = {
    teal: {
      bg: "bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/10",
      icon: "text-[#2B6F5E] dark:text-[#4ADE80]",
    },
    mustard: {
      bg: "bg-[#C4A035]/8 dark:bg-[#C4A035]/10",
      icon: "text-[#C4A035] dark:text-[#D4A843]",
    },
    red: {
      bg: "bg-red-50 dark:bg-red-950/20",
      icon: "text-red-600 dark:text-red-400",
    },
  };
  const s = styles[color];
  return (
    <div className={`rounded-xl p-2.5 ${s.bg} text-center`}>
      <Icon className={`w-4 h-4 mx-auto mb-1 ${s.icon}`} />
      <p className="text-lg font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
        {count}
      </p>
      <p className="text-[10px] text-[#6B5D4F] dark:text-[#888888]">{label}</p>
    </div>
  );
}

/* ═══ Action helpers ═══ */

function formatActionLabel(action: string): string {
  return action.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function getActionIcon(action: string): {
  icon: React.ElementType;
  bg: string;
  color: string;
} {
  const a = action.toLowerCase();
  if (a.includes("create") || a.includes("add"))
    return {
      icon: UserPlus,
      bg: "bg-[#2B6F5E]/10 dark:bg-[#4ADE80]/10",
      color: "text-[#2B6F5E] dark:text-[#4ADE80]",
    };
  if (a.includes("update") || a.includes("edit") || a.includes("modify"))
    return {
      icon: Eye,
      bg: "bg-[#C4A035]/10 dark:bg-[#D4A843]/10",
      color: "text-[#C4A035] dark:text-[#D4A843]",
    };
  if (a.includes("delete") || a.includes("remove"))
    return {
      icon: AlertTriangle,
      bg: "bg-red-50 dark:bg-red-950/20",
      color: "text-red-600 dark:text-red-400",
    };
  if (a.includes("login") || a.includes("auth"))
    return {
      icon: ShieldCheck,
      bg: "bg-blue-50 dark:bg-blue-950/20",
      color: "text-blue-600 dark:text-blue-400",
    };
  if (a.includes("pay") || a.includes("fee"))
    return {
      icon: DollarSign,
      bg: "bg-[#8DB896]/10 dark:bg-[#8DB896]/10",
      color: "text-[#3D7A4A] dark:text-[#8DB896]",
    };
  if (a.includes("enroll"))
    return {
      icon: ClipboardList,
      bg: "bg-[#C4A035]/8 dark:bg-[#C4A035]/10",
      color: "text-[#C4A035] dark:text-[#D4A843]",
    };
  return {
    icon: Activity,
    bg: "bg-[#D8CDC0]/20 dark:bg-[#2A2A2A]",
    color: "text-[#6B5D4F] dark:text-[#888888]",
  };
}
