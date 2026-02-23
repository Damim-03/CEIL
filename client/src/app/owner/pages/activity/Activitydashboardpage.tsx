// ================================================================
// 📌 src/app/owner/pages/activity/ActivityDashboardPage.tsx
// ✅ Premium UI — Luxury Owner Portal aesthetic
// ✅ Gold accent, glass morphism, smooth animations
// ✅ Matches Layout: bg-[#FAFAF8] light / bg-[#0F0F0F] dark
// ✅ RTL-first, fully responsive
// ✅ i18n — all text via useTranslation("owner.activity")
// ================================================================

import { useState, useMemo, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../../../hooks/useLanguage";
import {
  useOnlineUsers,
  usePresenceStats,
  useActivityTimeline,
  useLoginHistory,
  useRecentSessions,
  type OnlineUser,
  type TimelineEntry,
} from "../../../../hooks/owner/Useactivitytracking";
import {
  Activity,
  Clock,
  Eye,
  Globe,
  History,
  LogIn,
  LogOut,
  Monitor,
  MonitorSmartphone,
  RefreshCw,
  Smartphone,
  TrendingUp,
  User,
  UserCheck,
  Users,
  Wifi,
  WifiOff,
  ChevronLeft,
  ChevronRight,
  Filter,
  BarChart3,
  Shield,
  GraduationCap,
  Crown,
  FileText,
  Settings,
  BookOpen,
  CreditCard,
  Bell,
  Home,
  Calendar,
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
  type LucideIcon,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────
   Layout background reference:
   Light → bg-[#FAFAF8]   (warm off-white)
   Dark  → bg-[#0F0F0F]   (near-black)

   Cards & surfaces must contrast against these:
   Light cards → white (#FFFFFF) with subtle warm border
   Dark cards  → #1A1A1A with faint white-border
   ───────────────────────────────────────────────────────── */

// Reusable surface classes that match the Layout
const CARD =
  "rounded-2xl bg-white dark:bg-[#1A1A1A] border border-[#E8E5DE] dark:border-[#2A2A2A]";
const CARD_HOVER =
  "hover:shadow-lg hover:shadow-black/[0.04] dark:hover:shadow-black/30 hover:border-amber-500/30 dark:hover:border-amber-500/20 transition-all duration-300";
const CHIP =
  "bg-[#F3F1EC] dark:bg-[#222222] border border-[#E8E5DE] dark:border-[#2A2A2A]";
const DIVIDER = "divide-[#F0EDE6] dark:divide-[#222222]";
const BORDER_B = "border-b border-[#F0EDE6] dark:border-[#222222]";

// Text shades that work on both backgrounds
const TXT = "text-[#1A1A1A] dark:text-[#F5F5F5]"; // primary
const TXT_2 = "text-[#555555] dark:text-[#A0A0A0]"; // secondary
const TXT_3 = "text-[#999999] dark:text-[#666666]"; // tertiary
const TXT_4 = "text-[#BBBBBB] dark:text-[#444444]"; // faintest

// ─── Constants ───────────────────────────────────────────

const ROLE_ICON: Record<string, LucideIcon> = {
  OWNER: Crown,
  ADMIN: Shield,
  TEACHER: BookOpen,
  STUDENT: GraduationCap,
};

const ROLE_STYLE: Record<string, { color: string; bg: string }> = {
  OWNER: {
    color: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-500/10 border border-amber-500/20",
  },
  ADMIN: {
    color: "text-violet-700 dark:text-violet-400",
    bg: "bg-violet-500/10 border border-violet-500/20",
  },
  TEACHER: {
    color: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-500/10 border border-emerald-500/20",
  },
  STUDENT: {
    color: "text-sky-700 dark:text-sky-400",
    bg: "bg-sky-500/10 border border-sky-500/20",
  },
};

const ACTION_ICON: Record<string, LucideIcon> = {
  CREATE_ADMIN: Plus,
  CREATE_STUDENT: Plus,
  CREATE_TEACHER: Plus,
  CREATE_COURSE: Plus,
  CREATE_GROUP: Plus,
  CREATE_FEE: CreditCard,
  CREATE_SESSION: Calendar,
  UPDATE_SETTINGS: Settings,
  CHANGE_ENROLLMENT_STATUS: RefreshCw,
  MARK_FEE_PAID: CheckCircle,
  USER_CONNECTED: LogIn,
  USER_DISCONNECTED: LogOut,
  SESSION_COMPLETED: CheckCircle,
  LOGIN: LogIn,
  LOGOUT: LogOut,
  APPROVE: CheckCircle,
  REJECT: XCircle,
  CREATE: Plus,
  UPDATE: Pencil,
  DELETE: Trash2,
};

const ACTION_COLOR: Record<string, string> = {
  CREATE_ADMIN: "text-violet-600 dark:text-violet-400",
  CREATE_STUDENT: "text-sky-600 dark:text-sky-400",
  CREATE_TEACHER: "text-emerald-600 dark:text-emerald-400",
  CREATE_COURSE: "text-orange-600 dark:text-orange-400",
  CREATE_GROUP: "text-cyan-600 dark:text-cyan-400",
  CREATE_FEE: "text-green-600 dark:text-green-400",
  CREATE_SESSION: "text-blue-600 dark:text-blue-400",
  UPDATE_SETTINGS: "text-gray-600 dark:text-gray-400",
  CHANGE_ENROLLMENT_STATUS: "text-yellow-600 dark:text-yellow-400",
  MARK_FEE_PAID: "text-green-600 dark:text-green-400",
  USER_CONNECTED: "text-green-600 dark:text-green-400",
  USER_DISCONNECTED: "text-red-600 dark:text-red-400",
  SESSION_COMPLETED: "text-blue-600 dark:text-blue-400",
  LOGIN: "text-green-600 dark:text-green-400",
  LOGOUT: "text-red-600 dark:text-red-400",
  APPROVE: "text-green-600 dark:text-green-400",
  REJECT: "text-red-600 dark:text-red-400",
  CREATE: "text-blue-600 dark:text-blue-400",
  UPDATE: "text-yellow-600 dark:text-yellow-400",
  DELETE: "text-red-600 dark:text-red-400",
};

const PAGE_ICON: Record<string, LucideIcon> = {
  "/dashboard": Home,
  "/students": GraduationCap,
  "/teachers": BookOpen,
  "/courses": FileText,
  "/groups": Users,
  "/fees": CreditCard,
  "/enrollments": UserCheck,
  "/sessions": Calendar,
  "/announcements": Bell,
  "/settings": Settings,
  "/rooms": Monitor,
  "/documents": FileText,
  "/activity": Activity,
  "/admins": Shield,
  "/audit-logs": History,
};

const PAGE_KEY: Record<string, string> = {
  "/dashboard": "dashboard",
  "/students": "students",
  "/teachers": "teachers",
  "/courses": "courses",
  "/groups": "groups",
  "/fees": "fees",
  "/enrollments": "enrollments",
  "/sessions": "sessions",
  "/announcements": "announcements",
  "/settings": "settings",
  "/rooms": "rooms",
  "/documents": "documents",
  "/activity": "activity",
  "/admins": "admins",
  "/audit-logs": "auditLogs",
};

// ─── i18n-aware helper hooks ─────────────────────────────

function useFormatDuration() {
  const { t } = useTranslation();
  return (seconds: number): string => {
    if (!seconds || seconds < 0) return t("owner.activity.duration.none");
    if (seconds < 60)
      return t("owner.activity.duration.seconds", { count: seconds });
    if (seconds < 3600) {
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return s > 0
        ? t("owner.activity.duration.minutes", { m, s })
        : t("owner.activity.duration.minutesOnly", { m });
    }
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return m > 0
      ? t("owner.activity.duration.hours", { h, m })
      : t("owner.activity.duration.hoursOnly", { h });
  };
}

function useTimeAgo() {
  const { t } = useTranslation();
  return (dateStr: string): string => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const s = Math.floor(diff / 1000);
    if (s < 30) return t("owner.activity.online.now");
    if (s < 60) return t("owner.activity.online.secondsAgo", { count: s });
    if (s < 3600)
      return t("owner.activity.online.minutesAgo", {
        count: Math.floor(s / 60),
      });
    if (s < 86400)
      return t("owner.activity.online.hoursAgo", {
        count: Math.floor(s / 3600),
      });
    return t("owner.activity.online.daysAgo", {
      count: Math.floor(s / 86400),
    });
  };
}

function useGetPageInfo() {
  const { t } = useTranslation();
  return (path: string): { label: string; icon: LucideIcon } => {
    for (const [key, pageKey] of Object.entries(PAGE_KEY)) {
      if (path.includes(key))
        return {
          label: t(`owner.activity.pages.${pageKey}`),
          icon: PAGE_ICON[key] || Globe,
        };
    }
    return { label: path, icon: Globe };
  };
}

function useGetActionConfig() {
  const { t } = useTranslation();
  return (action: string) => {
    const key = `owner.activity.actions.${action}`;
    const label = t(key);
    const fbKey = `owner.activity.actions.${action?.split("_")[0]}`;
    const fbLabel = t(fbKey);
    return {
      label:
        label !== key
          ? label
          : fbLabel !== fbKey
            ? fbLabel
            : action?.replace(/_/g, " ") || "—",
      icon:
        ACTION_ICON[action] || ACTION_ICON[action?.split("_")[0]] || Activity,
      color:
        ACTION_COLOR[action] || ACTION_COLOR[action?.split("_")[0]] || TXT_3,
    };
  };
}

function useGetRoleConfig() {
  const { t } = useTranslation();
  return (role: string) => {
    const style = ROLE_STYLE[role] || {
      color: TXT,
      bg: CHIP,
    };
    return {
      label: t(`owner.activity.roles.${role}`, role),
      color: style.color,
      bg: style.bg,
      icon: ROLE_ICON[role] || User,
    };
  };
}

// ─── Animated Counter ────────────────────────────────────

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(0);

  useEffect(() => {
    const start = ref.current;
    const end = value;
    if (start === end) return;
    const duration = 600;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      setDisplay(current);
      if (progress < 1) requestAnimationFrame(animate);
      else ref.current = end;
    };
    requestAnimationFrame(animate);
  }, [value]);

  return <>{display}</>;
}

// ─── Pulse Dot ───────────────────────────────────────────

function PulseDot({ color = "bg-emerald-500" }: { color?: string }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span
        className={`animate-ping absolute inline-flex h-full w-full rounded-full ${color} opacity-60`}
      />
      <span
        className={`relative inline-flex rounded-full h-2.5 w-2.5 ${color}`}
      />
    </span>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════

type TabId = "online" | "timeline" | "logins" | "sessions";

export default function ActivityDashboardPage() {
  const { t } = useTranslation();
  const { dir } = useLanguage();
  const formatDuration = useFormatDuration();
  const getRoleConfig = useGetRoleConfig();

  const [activeTab, setActiveTab] = useState<TabId>("online");
  const [timelineFilters, setTimelineFilters] = useState({ page: 1, role: "" });
  const [loginFilters, setLoginFilters] = useState({ page: 1, user_id: "" });

  const { data: onlineData, isLoading: onlineLoading } = useOnlineUsers();
  const { data: stats } = usePresenceStats();
  const { data: timelineData, isLoading: timelineLoading } =
    useActivityTimeline({
      page: timelineFilters.page,
      limit: 30,
      role: timelineFilters.role || undefined,
    });
  const { data: loginData, isLoading: loginLoading } = useLoginHistory({
    page: loginFilters.page,
    limit: 30,
    user_id: loginFilters.user_id || undefined,
  });
  const { data: sessionsData } = useRecentSessions({ limit: 30 });

  const tabs: { id: TabId; label: string; icon: LucideIcon; count?: number }[] =
    [
      {
        id: "online",
        label: t("owner.activity.tabs.online"),
        icon: Wifi,
        count: onlineData?.total,
      },
      {
        id: "timeline",
        label: t("owner.activity.tabs.timeline"),
        icon: Activity,
      },
      { id: "logins", label: t("owner.activity.tabs.logins"), icon: LogIn },
      {
        id: "sessions",
        label: t("owner.activity.tabs.sessions"),
        icon: Clock,
        count: sessionsData?.total,
      },
    ];

  return (
    <div dir={dir} className="space-y-6 max-w-[1400px] mx-auto">
      {/* ═══ Page Header ═══ */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${TXT} flex items-center gap-2.5`}>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <Activity className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            {t("owner.activity.pageTitle")}
          </h1>
          <p className={`text-sm mt-1 ms-[52px] ${TXT_2}`}>
            {t("owner.activity.pageSubtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PulseDot />
          <span className={`text-xs font-medium ${TXT_3}`}>
            {t("owner.activity.live")}
          </span>
        </div>
      </div>

      {/* ═══ Stats Row ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassStatCard
          icon={Users}
          label={t("owner.activity.stats.onlineNow")}
          value={stats?.onlineNow ?? onlineData?.total ?? 0}
          gradient="from-emerald-500 to-teal-600"
          detail={
            stats?.onlineByRole
              ? Object.entries(stats.onlineByRole)
                  .map(([r, c]) => `${getRoleConfig(r).label}: ${c}`)
                  .join(" · ")
              : undefined
          }
          live
        />
        <GlassStatCard
          icon={BarChart3}
          label={t("owner.activity.stats.sessionsToday")}
          value={stats?.totalSessionsToday ?? 0}
          gradient="from-blue-500 to-indigo-600"
        />
        <GlassStatCard
          icon={Clock}
          label={t("owner.activity.stats.avgSession")}
          textValue={formatDuration(stats?.avgSessionDuration ?? 0)}
          gradient="from-violet-500 to-purple-600"
        />
        <GlassStatCard
          icon={TrendingUp}
          label={t("owner.activity.stats.peakToday")}
          value={stats?.peakToday ?? 0}
          gradient="from-amber-500 to-orange-600"
        />
      </div>

      {/* ═══ Active Pages Strip ═══ */}
      <ActivePagesStrip stats={stats} />

      {/* ═══ Tab Navigation ═══ */}
      <div className="flex gap-1.5 p-1.5 rounded-2xl bg-[#F0EDE6] dark:bg-[#161616] border border-[#E8E5DE] dark:border-[#2A2A2A]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-white dark:bg-[#1A1A1A] shadow-sm border border-[#E8E5DE] dark:border-[#2A2A2A] " +
                    TXT
                  : TXT_3 + " hover:bg-white/60 dark:hover:bg-[#1A1A1A]/60"
              }`}
            >
              <Icon
                className={`w-4 h-4 ${active ? "text-amber-600 dark:text-amber-400" : ""}`}
              />
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`text-[11px] font-bold min-w-[20px] h-5 flex items-center justify-center rounded-full px-1.5 ${
                    active
                      ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                      : "bg-[#E8E5DE] dark:bg-[#2A2A2A] " + TXT_3
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ═══ Tab Content ═══ */}
      <div className="min-h-[400px]">
        {activeTab === "online" && (
          <OnlineUsersPanel
            users={onlineData?.users || []}
            loading={onlineLoading}
            byRole={onlineData?.byRole || {}}
          />
        )}
        {activeTab === "timeline" && (
          <TimelinePanel
            data={timelineData?.data || []}
            pagination={timelineData?.pagination}
            loading={timelineLoading}
            filters={timelineFilters}
            onFilterChange={setTimelineFilters}
          />
        )}
        {activeTab === "logins" && (
          <LoginHistoryPanel
            data={loginData?.data || []}
            pagination={loginData?.pagination}
            loading={loginLoading}
            filters={loginFilters}
            onFilterChange={setLoginFilters}
          />
        )}
        {activeTab === "sessions" && (
          <SessionsPanel sessions={sessionsData?.sessions || []} />
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ACTIVE PAGES STRIP
// ═══════════════════════════════════════════════════════════

function ActivePagesStrip({ stats }: { stats: any }) {
  const { t } = useTranslation();
  const getPageInfo = useGetPageInfo();
  if (!stats?.activePages || Object.keys(stats.activePages).length === 0)
    return null;

  return (
    <div className={`${CARD} px-5 py-3.5`}>
      <div className="flex items-center gap-4 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 shrink-0">
          <Eye className={`w-4 h-4 ${TXT_3}`} />
          <span className={`text-xs font-medium ${TXT_3}`}>
            {t("owner.activity.activePages")}
          </span>
        </div>
        <div className="h-5 w-px bg-[#E8E5DE] dark:bg-[#2A2A2A] shrink-0" />
        {Object.entries(stats.activePages)
          .sort(([, a]: any, [, b]: any) => b - a)
          .slice(0, 8)
          .map(([page, count]: any) => {
            const info = getPageInfo(page);
            const Icon = info.icon;
            return (
              <div
                key={page}
                className={`flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-full ${CHIP}`}
              >
                <Icon className={`w-3.5 h-3.5 ${TXT_3}`} />
                <span className={`text-xs ${TXT_2}`}>{info.label}</span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 min-w-[16px] text-center">
                  {count}
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// GLASS STAT CARD
// ═══════════════════════════════════════════════════════════

function GlassStatCard({
  icon: Icon,
  label,
  value,
  textValue,
  gradient,
  detail,
  live,
}: {
  icon: LucideIcon;
  label: string;
  value?: number;
  textValue?: string;
  gradient: string;
  detail?: string;
  live?: boolean;
}) {
  return (
    <div className={`group relative ${CARD} ${CARD_HOVER} p-5 overflow-hidden`}>
      {/* Gradient accent glow */}
      <div
        className={`absolute top-0 end-0 w-28 h-28 bg-gradient-to-bl ${gradient} opacity-[0.07] dark:opacity-[0.12] rounded-bl-[70px] group-hover:opacity-[0.13] dark:group-hover:opacity-[0.18] transition-opacity duration-300`}
      />
      <div className="relative flex items-start justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span
              className={`text-[11px] font-semibold uppercase tracking-wider ${TXT_3}`}
            >
              {label}
            </span>
            {live && <PulseDot />}
          </div>
          <div className={`text-3xl font-bold tracking-tight ${TXT}`}>
            {textValue || <AnimatedNumber value={value ?? 0} />}
          </div>
          {detail && (
            <p className={`text-[11px] truncate max-w-[200px] ${TXT_4}`}>
              {detail}
            </p>
          )}
        </div>
        <div
          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg shadow-black/10 dark:shadow-black/40 opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300`}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SKELETONS & EMPTY STATE
// ═══════════════════════════════════════════════════════════

function SkeletonLoader({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`${CARD} p-5 space-y-3 animate-pulse`}
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#F0EDE6] dark:bg-[#222222]" />
            <div className="space-y-2 flex-1">
              <div className="h-3.5 bg-[#F0EDE6] dark:bg-[#222222] rounded-full w-3/4" />
              <div className="h-3 bg-[#F0EDE6] dark:bg-[#222222] rounded-full w-1/2" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-6 bg-[#F0EDE6] dark:bg-[#222222] rounded-full w-16" />
            <div className="h-6 bg-[#F0EDE6] dark:bg-[#222222] rounded-full w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex gap-4 p-4 rounded-xl animate-pulse"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div className="w-10 h-10 rounded-xl bg-[#F0EDE6] dark:bg-[#222222] shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-[#F0EDE6] dark:bg-[#222222] rounded-full w-2/3" />
            <div className="h-3 bg-[#F0EDE6] dark:bg-[#222222] rounded-full w-1/3" />
          </div>
          <div className="h-3 bg-[#F0EDE6] dark:bg-[#222222] rounded-full w-16 self-center" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#F0EDE6] dark:bg-[#1A1A1A] flex items-center justify-center mb-4">
        <Icon className={`w-7 h-7 ${TXT_4}`} />
      </div>
      <p className={`text-base font-medium ${TXT_3}`}>{title}</p>
      {subtitle && <p className={`text-sm mt-1 ${TXT_4}`}>{subtitle}</p>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ONLINE USERS PANEL
// ═══════════════════════════════════════════════════════════

function OnlineUsersPanel({
  users,
  loading,
  byRole,
}: {
  users: OnlineUser[];
  loading: boolean;
  byRole: Record<string, number>;
}) {
  const { t } = useTranslation();
  const getRoleConfig = useGetRoleConfig();
  const [filterRole, setFilterRole] = useState("");

  const filtered = useMemo(() => {
    const withoutStudents = users.filter((u) => u.role !== "STUDENT");
    return filterRole
      ? withoutStudents.filter((u) => u.role === filterRole)
      : withoutStudents;
  }, [users, filterRole]);

  if (loading) return <SkeletonLoader />;

  return (
    <div className="space-y-5">
      {/* Role filter pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterRole("")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
            !filterRole
              ? "bg-[#1A1A1A] dark:bg-[#F5F5F5] text-white dark:text-[#0F0F0F] border-transparent shadow-md"
              : `bg-white dark:bg-[#1A1A1A] ${TXT_2} border-[#E8E5DE] dark:border-[#2A2A2A] hover:border-[#CCC9C0] dark:hover:border-[#444]`
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          {t("owner.activity.online.all")}
          <span className="font-bold">{users.length}</span>
        </button>
        {Object.entries(byRole)
          .filter(([role]) => role !== "STUDENT")
          .map(([role, count]) => {
            const rc = getRoleConfig(role);
            const RoleIcon = rc.icon;
            const active = filterRole === role;
            return (
              <button
                key={role}
                onClick={() => setFilterRole(active ? "" : role)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border ${
                  active
                    ? `${rc.bg} ${rc.color} shadow-sm`
                    : `bg-white dark:bg-[#1A1A1A] ${TXT_2} border-[#E8E5DE] dark:border-[#2A2A2A] hover:border-[#CCC9C0] dark:hover:border-[#444]`
                }`}
              >
                <RoleIcon className="w-3.5 h-3.5" />
                {rc.label}
                <span className="font-bold">{count}</span>
              </button>
            );
          })}
      </div>

      {/* Users grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={WifiOff}
          title={t("owner.activity.online.noUsersOnline")}
          subtitle={t("owner.activity.online.usersWillAppear")}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((user, i) => (
            <OnlineUserCard key={user.userId} user={user} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Online User Card ────────────────────────────────────

function OnlineUserCard({ user, index }: { user: OnlineUser; index: number }) {
  const getRoleConfig = useGetRoleConfig();
  const getPageInfo = useGetPageInfo();
  const timeAgo = useTimeAgo();
  const formatDuration = useFormatDuration();

  const rc = getRoleConfig(user.role);
  const RoleIcon = rc.icon;
  const pageInfo = getPageInfo(user.currentPage);
  const PageIcon = pageInfo.icon;

  return (
    <div
      className={`group ${CARD} ${CARD_HOVER} p-4`}
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="flex gap-3.5">
        {/* Avatar */}
        <div className="relative shrink-0">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt=""
              className="w-12 h-12 rounded-full object-cover ring-2 ring-[#E8E5DE] dark:ring-[#2A2A2A] group-hover:ring-amber-500/30 transition-all"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#F0EDE6] dark:bg-[#222222] flex items-center justify-center ring-2 ring-[#E8E5DE] dark:ring-[#2A2A2A] group-hover:ring-amber-500/30 transition-all">
              <span className={`text-base font-bold ${TXT_3}`}>
                {user.name?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>
          )}
          <span className="absolute -bottom-0.5 -end-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-[2.5px] border-white dark:border-[#1A1A1A]" />
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className={`font-semibold text-sm truncate ${TXT}`}>
                {user.name}
              </p>
              <p className={`text-xs truncate ${TXT_3}`}>{user.email}</p>
            </div>
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium shrink-0 ${rc.bg} ${rc.color}`}
            >
              <RoleIcon className="w-3 h-3" />
              {rc.label}
            </div>
          </div>

          <div className={`flex items-center gap-3 text-xs ${TXT_3}`}>
            <span className="flex items-center gap-1">
              <PageIcon className="w-3.5 h-3.5" />
              {pageInfo.label}
            </span>
            <span className="flex items-center gap-1">
              {user.device === "mobile" ? (
                <Smartphone className="w-3.5 h-3.5" />
              ) : (
                <MonitorSmartphone className="w-3.5 h-3.5" />
              )}
              {user.device}
            </span>
          </div>

          <div className={`flex items-center gap-1.5 text-[11px] ${TXT_4}`}>
            <Clock className="w-3 h-3" />
            <span>{timeAgo(user.connectedAt)}</span>
            {user.sessionDuration !== undefined && user.sessionDuration > 0 && (
              <>
                <span>·</span>
                <span>{formatDuration(user.sessionDuration)}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TIMELINE PANEL
// ═══════════════════════════════════════════════════════════

function TimelinePanel({
  data,
  pagination,
  loading,
  filters,
  onFilterChange,
}: {
  data: TimelineEntry[];
  pagination?: { page: number; totalPages: number; total: number };
  loading: boolean;
  filters: { page: number; role: string };
  onFilterChange: (f: { page: number; role: string }) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-5">
      {/* Filter bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 text-sm ${TXT_3}`}>
            <Filter className="w-4 h-4" />
            <span>{t("owner.activity.timeline.filter")}</span>
          </div>
          <select
            className={`select select-sm bg-white dark:bg-[#1A1A1A] border-[#E8E5DE] dark:border-[#2A2A2A] rounded-xl text-sm min-h-0 h-9 focus:outline-none focus:border-amber-500/50 ${TXT}`}
            value={filters.role}
            onChange={(e) =>
              onFilterChange({ ...filters, role: e.target.value, page: 1 })
            }
          >
            <option value="">{t("owner.activity.timeline.allRoles")}</option>
            <option value="OWNER">{t("owner.activity.roles.OWNER")}</option>
            <option value="ADMIN">{t("owner.activity.roles.ADMIN")}</option>
            <option value="TEACHER">{t("owner.activity.roles.TEACHER")}</option>
            <option value="STUDENT">{t("owner.activity.roles.STUDENT")}</option>
          </select>
        </div>
        {pagination && (
          <span className={`text-xs ${TXT_4}`}>
            {t("owner.activity.timeline.activitiesCount", {
              count: pagination.total,
            })}
          </span>
        )}
      </div>

      {/* Timeline list */}
      {loading ? (
        <ListSkeleton />
      ) : data.length === 0 ? (
        <EmptyState
          icon={Activity}
          title={t("owner.activity.timeline.noActivities")}
          subtitle={t("owner.activity.timeline.activitiesWillAppear")}
        />
      ) : (
        <div className={`${CARD} overflow-hidden ${DIVIDER} divide-y`}>
          {data.map((entry, i) => (
            <TimelineRow key={entry.id} entry={entry} index={i} />
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <PaginationControls
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(p) => onFilterChange({ ...filters, page: p })}
        />
      )}
    </div>
  );
}

function TimelineRow({ entry }: { entry: TimelineEntry; index: number }) {
  const getActionConfig = useGetActionConfig();
  const getRoleConfig = useGetRoleConfig();
  const timeAgo = useTimeAgo();
  const action = getActionConfig(entry.action);
  const ActionIcon = action.icon;
  const userRole = entry.user?.role ? getRoleConfig(entry.user.role) : null;

  return (
    <div className="flex gap-4 px-5 py-4 hover:bg-[#FAFAF8] dark:hover:bg-[#161616] transition-colors">
      <div
        className={`w-10 h-10 rounded-xl bg-[#F3F1EC] dark:bg-[#222222] flex items-center justify-center shrink-0 ${action.color}`}
      >
        <ActionIcon className="w-4.5 h-4.5" />
      </div>
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {entry.user && (
              <>
                {entry.user.isOnline && <PulseDot color="bg-emerald-400" />}
                <span className={`text-sm font-medium truncate ${TXT}`}>
                  {entry.user.email || "—"}
                </span>
                {userRole && (
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${userRole.bg} ${userRole.color}`}
                  >
                    {userRole.label}
                  </span>
                )}
              </>
            )}
          </div>
          <span className={`text-[11px] whitespace-nowrap shrink-0 ${TXT_4}`}>
            {timeAgo(entry.performedAt)}
          </span>
        </div>
        <div className={`flex items-center gap-2 text-xs ${TXT_2}`}>
          <span>{action.label}</span>
          {entry.entityType && (
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] ${CHIP} ${TXT_3}`}
            >
              {entry.entityType}
            </span>
          )}
        </div>
        {entry.details &&
          typeof entry.details === "object" &&
          Object.keys(entry.details).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1">
              {Object.entries(entry.details)
                .slice(0, 4)
                .map(([k, v]) => (
                  <span
                    key={k}
                    className={`text-[10px] px-2 py-0.5 rounded-md ${CHIP} ${TXT_3}`}
                  >
                    <span className={TXT_4}>{k}:</span> {String(v)}
                  </span>
                ))}
            </div>
          )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// LOGIN HISTORY PANEL
// ═══════════════════════════════════════════════════════════

function LoginHistoryPanel({
  data,
  pagination,
  loading,
  filters,
  onFilterChange,
}: {
  data: TimelineEntry[];
  pagination?: { page: number; totalPages: number; total: number };
  loading: boolean;
  filters: { page: number; user_id: string };
  onFilterChange: (f: { page: number; user_id: string }) => void;
}) {
  const { t } = useTranslation();
  const getActionConfig = useGetActionConfig();
  const getRoleConfig = useGetRoleConfig();
  const timeAgo = useTimeAgo();

  if (loading) return <ListSkeleton />;
  if (data.length === 0)
    return (
      <EmptyState
        icon={LogIn}
        title={t("owner.activity.loginHistory.noRecords")}
        subtitle={t("owner.activity.loginHistory.recordsWillAppear")}
      />
    );

  return (
    <div className="space-y-5">
      <div className={`${CARD} overflow-hidden`}>
        <table className="w-full">
          <thead>
            <tr className={BORDER_B}>
              <th
                className={`text-start text-xs font-medium uppercase tracking-wider px-5 py-3.5 ${TXT_3}`}
              >
                {t("owner.activity.loginHistory.user")}
              </th>
              <th
                className={`text-start text-xs font-medium uppercase tracking-wider px-5 py-3.5 ${TXT_3}`}
              >
                {t("owner.activity.loginHistory.event")}
              </th>
              <th
                className={`text-start text-xs font-medium uppercase tracking-wider px-5 py-3.5 hidden md:table-cell ${TXT_3}`}
              >
                {t("owner.activity.loginHistory.details")}
              </th>
              <th
                className={`text-end text-xs font-medium uppercase tracking-wider px-5 py-3.5 hidden sm:table-cell ${TXT_3}`}
              >
                {t("owner.activity.loginHistory.time")}
              </th>
            </tr>
          </thead>
          <tbody className={`${DIVIDER} divide-y`}>
            {data.map((entry) => {
              const action = getActionConfig(entry.action);
              const ActionIcon = action.icon;
              const userRole = entry.user?.role
                ? getRoleConfig(entry.user.role)
                : null;
              return (
                <tr
                  key={entry.id}
                  className="hover:bg-[#FAFAF8] dark:hover:bg-[#161616] transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className={`text-sm truncate max-w-[180px] ${TXT}`}>
                        {entry.user?.email || "—"}
                      </span>
                      {userRole && (
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${userRole.bg} ${userRole.color}`}
                        >
                          {userRole.label}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <ActionIcon
                        className={`w-4 h-4 ${action.color} shrink-0`}
                      />
                      <span className={`text-sm ${TXT_2}`}>{action.label}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className={`text-xs ${TXT_3}`}>
                      {(entry.details as any)?.duration_human ||
                        (entry.details as any)?.device ||
                        "—"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell text-end">
                    <span className={`text-xs ${TXT_4}`}>
                      {timeAgo(entry.performedAt)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {pagination && pagination.totalPages > 1 && (
        <PaginationControls
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(p) => onFilterChange({ ...filters, page: p })}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SESSIONS PANEL
// ═══════════════════════════════════════════════════════════

function SessionsPanel({ sessions }: { sessions: any[] }) {
  const { t } = useTranslation();
  const getRoleConfig = useGetRoleConfig();
  const getPageInfo = useGetPageInfo();
  const formatDuration = useFormatDuration();
  const timeAgo = useTimeAgo();

  if (!sessions.length)
    return (
      <EmptyState
        icon={Clock}
        title={t("owner.activity.sessionsPanel.noSessions")}
        subtitle={t("owner.activity.sessionsPanel.sessionsWillAppear")}
      />
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {sessions.map((s: any, i: number) => {
        const rc = getRoleConfig(s.role);
        const RoleIcon = rc.icon;
        return (
          <div
            key={i}
            className={`group ${CARD} ${CARD_HOVER} p-5 space-y-3.5`}
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className="flex items-center justify-between">
              <p className={`font-semibold text-sm truncate ${TXT}`}>
                {s.name}
              </p>
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium ${rc.bg} ${rc.color}`}
              >
                <RoleIcon className="w-3 h-3" />
                {rc.label}
              </div>
            </div>
            <div className={`flex gap-4 text-xs ${TXT_3}`}>
              <span className="flex items-center gap-1">
                <Clock className={`w-3.5 h-3.5 ${TXT_4}`} />
                {formatDuration(s.duration)}
              </span>
              <span className="flex items-center gap-1">
                <FileText className={`w-3.5 h-3.5 ${TXT_4}`} />
                {s.pagesVisited?.length || 0}{" "}
                {t("owner.activity.sessionsPanel.pages")}
              </span>
              <span className={TXT_4}>
                {timeAgo(s.disconnectedAt || s.connectedAt)}
              </span>
            </div>
            {s.pagesVisited && s.pagesVisited.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {s.pagesVisited.slice(0, 4).map((p: string, j: number) => {
                  const info = getPageInfo(p);
                  const PIcon = info.icon;
                  return (
                    <span
                      key={j}
                      className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg ${CHIP} ${TXT_3}`}
                    >
                      <PIcon className={`w-3 h-3 ${TXT_4}`} />
                      {info.label}
                    </span>
                  );
                })}
                {s.pagesVisited.length > 4 && (
                  <span className="text-[11px] px-2 py-1 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium">
                    +{s.pagesVisited.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PAGINATION
// ═══════════════════════════════════════════════════════════

function PaginationControls({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  const { dir } = useLanguage();
  const isRTL = dir === "rtl";

  const btnClass = `w-9 h-9 rounded-xl border border-[#E8E5DE] dark:border-[#2A2A2A] bg-white dark:bg-[#1A1A1A] flex items-center justify-center ${TXT_3} hover:border-amber-500/40 disabled:opacity-30 transition-all`;

  return (
    <div className="flex items-center justify-center gap-2 py-4">
      <button
        className={btnClass}
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        {isRTL ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
      <div
        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#F0EDE6] dark:bg-[#161616] text-sm`}
      >
        <span className={`font-bold ${TXT}`}>{page}</span>
        <span className={TXT_4}>/</span>
        <span className={TXT_3}>{totalPages}</span>
      </div>
      <button
        className={btnClass}
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        {isRTL ? (
          <ChevronLeft className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
