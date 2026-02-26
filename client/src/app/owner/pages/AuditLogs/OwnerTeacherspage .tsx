/* ===============================================================
   OwnerTeacherspage.tsx — Manage Teacher Accounts (Owner)
   
   📁 src/app/owner/pages/Teachers/OwnerTeacherspage.tsx
   ✅ Full CRUD with password support
   ✅ Teacher attendance (auto from sessions)
   ✅ Today's overview with present/absent
   ✅ Stats cards + search + table
   ✅ Detail modal with attendance history
   ✅ Same design as AdminsPage (#D4A843, daisyUI)
=============================================================== */

import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  useOwnerTeachers,
  useOwnerTeacherDetail,
  useOwnerCreateTeacher,
  useOwnerUpdateTeacher,
  useOwnerDeleteTeacher,
  useOwnerSessions,
} from "../../../../hooks/owner/Useowner.hooks";
import {
  GraduationCap,
  Plus,
  Trash2,
  Edit3,
  X,
  Eye,
  Search,
  Mail,
  Phone,
  Calendar,
  Lock,
  Users,
  BookOpen,
  Clock,
  Layers,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  EyeOff,
  TrendingUp,
  XCircle,
  CalendarCheck,
  Percent,
  CalendarDays,
} from "lucide-react";

/* ─── Types ────────────────────────────────────────────── */
interface TeacherForm {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
}

const emptyForm: TeacherForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  password: "",
};

type AttendanceStatus = "PRESENT" | "ABSENT" | "NO_CLASS";

/** Timezone-safe local date string YYYY-MM-DD */
function toLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════ */
const OwnerTeacherspage = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const { data: teachers, isLoading } = useOwnerTeachers();
  const { data: allSessions } = useOwnerSessions();
  const createTeacher = useOwnerCreateTeacher();
  const updateTeacher = useOwnerUpdateTeacher();
  const deleteTeacher = useOwnerDeleteTeacher();

  // UI state
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<TeacherForm>(emptyForm);
  const [editingTeacher, setEditingTeacher] = useState<any | null>(null);
  const [viewingTeacherId, setViewingTeacherId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [filterAttendance, setFilterAttendance] = useState<
    "ALL" | AttendanceStatus
  >("ALL");
  const [confirmAction, setConfirmAction] = useState<{
    type: "delete";
    teacher: any;
  } | null>(null);

  // ─── Build teacher attendance map from sessions ────────
  const teacherAttendance = useMemo(() => {
    const map: Record<
      string,
      {
        todayStatus: AttendanceStatus;
        todaySessions: any[];
        totalSessionsAllTime: number;
        // Per-day tracking for attendance rate
        daysWithSessions: number;
        daysPresent: number;
      }
    > = {};

    if (
      !teachers ||
      !Array.isArray(teachers) ||
      !allSessions ||
      !Array.isArray(allSessions)
    ) {
      return map;
    }

    const todayStr = toLocalDateStr(new Date());

    // Build a map: teacher_id -> sessions[]
    const teacherSessionsMap: Record<string, any[]> = {};

    allSessions.forEach((session: any) => {
      const teacherId = session.group?.teacher?.teacher_id;
      if (!teacherId) return;
      if (!teacherSessionsMap[teacherId]) teacherSessionsMap[teacherId] = [];
      teacherSessionsMap[teacherId].push(session);
    });

    teachers.forEach((teacher: any) => {
      const tid = teacher.teacher_id;
      const hasGroups = teacher.groups && teacher.groups.length > 0;
      const sessions = teacherSessionsMap[tid] || [];

      // Today's sessions for this teacher
      const todaySessions = sessions.filter((s: any) => {
        const sDate = toLocalDateStr(new Date(s.session_date));
        return sDate === todayStr;
      });

      // Calculate attendance rate: unique days with sessions vs days they should have taught
      const sessionDates = new Set<string>();
      sessions.forEach((s: any) => {
        const d = toLocalDateStr(new Date(s.session_date));
        // Only count past and today
        if (new Date(s.session_date) <= new Date()) {
          sessionDates.add(d);
        }
      });

      let todayStatus: AttendanceStatus;
      if (todaySessions.length > 0) {
        todayStatus = "PRESENT";
      } else if (hasGroups) {
        todayStatus = "ABSENT";
      } else {
        todayStatus = "NO_CLASS";
      }

      map[tid] = {
        todayStatus,
        todaySessions,
        totalSessionsAllTime: sessions.length,
        daysWithSessions: sessionDates.size,
        daysPresent: sessionDates.size, // each day with a session = present
      };
    });

    return map;
  }, [teachers, allSessions]);

  // ─── Computed Stats ────────────────────────────────────
  const stats = useMemo(() => {
    if (!teachers || !Array.isArray(teachers))
      return {
        total: 0,
        withGroups: 0,
        unassigned: 0,
        totalGroups: 0,
        presentToday: 0,
        absentToday: 0,
      };

    const total = teachers.length;
    const withGroups = teachers.filter((t: any) => t.groups?.length > 0).length;
    const unassigned = total - withGroups;
    const totalGroups = teachers.reduce(
      (acc: number, t: any) => acc + (t.groups?.length || 0),
      0,
    );

    let presentToday = 0;
    let absentToday = 0;
    teachers.forEach((t: any) => {
      const att = teacherAttendance[t.teacher_id];
      if (att?.todayStatus === "PRESENT") presentToday++;
      else if (att?.todayStatus === "ABSENT") absentToday++;
    });

    return {
      total,
      withGroups,
      unassigned,
      totalGroups,
      presentToday,
      absentToday,
    };
  }, [teachers, teacherAttendance]);

  // ─── Today's sessions count ────────────────────────────
  const todaySessionsCount = useMemo(() => {
    if (!allSessions || !Array.isArray(allSessions)) return 0;
    const todayStr = toLocalDateStr(new Date());
    return allSessions.filter((s: any) => {
      const sDate = toLocalDateStr(new Date(s.session_date));
      return sDate === todayStr;
    }).length;
  }, [allSessions]);

  // ─── Filtered teachers ─────────────────────────────────
  const filteredTeachers = useMemo(() => {
    if (!teachers || !Array.isArray(teachers)) return [];
    let list = teachers;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t: any) =>
          t.first_name?.toLowerCase().includes(q) ||
          t.last_name?.toLowerCase().includes(q) ||
          t.email?.toLowerCase().includes(q) ||
          t.phone_number?.includes(q),
      );
    }

    // Attendance filter
    if (filterAttendance !== "ALL") {
      list = list.filter((t: any) => {
        const att = teacherAttendance[t.teacher_id];
        return att?.todayStatus === filterAttendance;
      });
    }

    return list;
  }, [teachers, searchQuery, filterAttendance, teacherAttendance]);

  // ─── Handlers ──────────────────────────────────────────
  const openCreate = () => {
    setForm(emptyForm);
    setEditingTeacher(null);
    setShowPassword(false);
    setShowCreate(true);
  };

  const openEdit = (teacher: any) => {
    setForm({
      first_name: teacher.first_name || "",
      last_name: teacher.last_name || "",
      email: teacher.email || "",
      phone_number: teacher.phone_number || "",
      password: "",
    });
    setEditingTeacher(teacher);
    setShowPassword(false);
    setShowCreate(true);
  };

  const handleSubmit = () => {
    if (!form.first_name.trim() || !form.last_name.trim() || !form.email.trim())
      return;

    if (editingTeacher) {
      const payload: Record<string, any> = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone_number: form.phone_number.trim() || null,
      };
      if (form.password.trim()) payload.password = form.password.trim();
      updateTeacher.mutate(
        { teacherId: editingTeacher.teacher_id, payload },
        {
          onSuccess: () => {
            setShowCreate(false);
            setEditingTeacher(null);
            setForm(emptyForm);
          },
        },
      );
    } else {
      createTeacher.mutate(
        {
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          email: form.email.trim().toLowerCase(),
          phone_number: form.phone_number.trim() || undefined,
          password: form.password.trim() || undefined,
        } as any,
        {
          onSuccess: () => {
            setShowCreate(false);
            setForm(emptyForm);
          },
        },
      );
    }
  };

  const handleDelete = () => {
    if (!confirmAction) return;
    deleteTeacher.mutate(confirmAction.teacher.teacher_id, {
      onSuccess: () => setConfirmAction(null),
    });
  };

  const isMutating = createTeacher.isPending || updateTeacher.isPending;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg text-[#D4A843]" />
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRtl ? "rtl" : "ltr"}>
      {/* ═══ Header ═══ */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4A843] to-[#B8912E] flex items-center justify-center shadow-md shadow-[#D4A843]/20">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
              {t("owner.teachers.title", "Teacher Management")}
            </h1>
            <p className="text-sm text-[#BEB29E] dark:text-[#666666]">
              {stats.total} {t("owner.teachers.total", "teachers registered")}
            </p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="btn btn-sm bg-[#D4A843] hover:bg-[#B8912E] text-white border-none gap-2"
        >
          <Plus className="h-4 w-4" />
          {t("owner.teachers.create", "New Teacher")}
        </button>
      </div>

      {/* ═══ Stats Cards ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          {
            label: t("owner.teachers.stat_total", "Total"),
            value: stats.total,
            icon: <Users className="h-4 w-4" />,
            color: "text-[#D4A843]",
            bg: "bg-[#D4A843]/10",
          },
          {
            label: t("owner.teachers.stat_active", "With Groups"),
            value: stats.withGroups,
            icon: <UserCheck className="h-4 w-4" />,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-500/10",
          },
          {
            label: t("owner.teachers.stat_unassigned", "Unassigned"),
            value: stats.unassigned,
            icon: <AlertTriangle className="h-4 w-4" />,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
          },
          {
            label: t("owner.teachers.stat_groups", "Total Groups"),
            value: stats.totalGroups,
            icon: <Layers className="h-4 w-4" />,
            color: "text-purple-600 dark:text-purple-400",
            bg: "bg-purple-500/10",
          },
          {
            label: t("owner.teachers.stat_present", "Present Today"),
            value: stats.presentToday,
            icon: <CheckCircle2 className="h-4 w-4" />,
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-500/10",
          },
          {
            label: t("owner.teachers.stat_absent", "Absent Today"),
            value: stats.absentToday,
            icon: <XCircle className="h-4 w-4" />,
            color: "text-red-500",
            bg: "bg-red-500/10",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/30 dark:border-[#2A2A2A] p-3.5"
          >
            <div
              className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center ${stat.color} mb-2`}
            >
              {stat.icon}
            </div>
            <p className="text-xl font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
              {stat.value}
            </p>
            <p className="text-[11px] text-[#BEB29E] dark:text-[#666666]">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* ═══ Today's Attendance Overview ═══ */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/30 dark:border-[#2A2A2A] p-4">
        <div className="flex items-center gap-2 mb-3">
          <CalendarCheck className="h-4 w-4 text-[#D4A843]" />
          <h3 className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
            {t("owner.teachers.attendance_today", "Teacher Attendance — Today")}
          </h3>
          <span className="text-[11px] text-[#BEB29E] dark:text-[#666666] ml-auto">
            {new Date().toLocaleDateString(isRtl ? "ar-DZ" : "en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Present */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                {stats.presentToday}
              </p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-500">
                {t("owner.teachers.present", "Present")}
              </p>
            </div>
          </div>

          {/* Absent */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-red-600 dark:text-red-400">
                {stats.absentToday}
              </p>
              <p className="text-[11px] text-red-500 dark:text-red-500">
                {t("owner.teachers.absent", "Absent")}
              </p>
            </div>
          </div>

          {/* No Class */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700">
            <div className="w-10 h-10 rounded-full bg-zinc-200/50 dark:bg-zinc-700 flex items-center justify-center">
              <Clock className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                {stats.unassigned}
              </p>
              <p className="text-[11px] text-[#BEB29E] dark:text-[#666666]">
                {t("owner.teachers.no_class", "No Groups")}
              </p>
            </div>
          </div>

          {/* Today's Sessions */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[#D4A843]/5 dark:bg-[#D4A843]/10 border border-[#D4A843]/20">
            <div className="w-10 h-10 rounded-full bg-[#D4A843]/20 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-[#D4A843]" />
            </div>
            <div>
              <p className="text-lg font-bold text-[#B8912E] dark:text-[#D4A843]">
                {todaySessionsCount}
              </p>
              <p className="text-[11px] text-[#BEB29E] dark:text-[#666666]">
                {t("owner.teachers.sessions_today", "Sessions Today")}
              </p>
            </div>
          </div>
        </div>

        {/* Attendance Rate Bar */}
        {stats.presentToday + stats.absentToday > 0 && (
          <div className="mt-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-[#6B5D4F] dark:text-[#AAAAAA]">
                {t("owner.teachers.attendance_rate", "Today's Attendance Rate")}
              </span>
              <span className="text-sm font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                {Math.round(
                  (stats.presentToday /
                    (stats.presentToday + stats.absentToday)) *
                    100,
                )}
                %
              </span>
            </div>
            <div className="w-full h-2.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.round((stats.presentToday / (stats.presentToday + stats.absentToday)) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ═══ Search + Filter ═══ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-[#BEB29E]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("owner.teachers.search", "Search teachers...")}
            className="input input-bordered input-sm w-full pl-9 bg-white dark:bg-[#0F0F0F] dark:border-[#2A2A2A] dark:text-[#E5E5E5]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute top-2.5 right-3 text-[#BEB29E] hover:text-[#6B5D4F]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Attendance Filter */}
        <div className="flex items-center gap-1.5">
          {[
            {
              key: "ALL",
              label: t("common.all", "All"),
              color:
                "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300",
            },
            {
              key: "PRESENT",
              label: t("owner.teachers.present", "Present"),
              color:
                "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
            },
            {
              key: "ABSENT",
              label: t("owner.teachers.absent", "Absent"),
              color:
                "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
            },
            {
              key: "NO_CLASS",
              label: t("owner.teachers.no_class_filter", "No Class"),
              color:
                "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400",
            },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterAttendance(f.key as any)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all ${
                filterAttendance === f.key
                  ? `${f.color} ring-1 ring-offset-1 ring-current`
                  : "text-[#BEB29E] hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-[#BEB29E] dark:text-[#666666] ml-auto">
          {filteredTeachers.length} {t("owner.teachers.showing", "showing")}
        </span>
      </div>

      {/* ═══ Create / Edit Form ═══ */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/30 dark:border-[#2A2A2A] p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] flex items-center gap-2">
                  {editingTeacher ? (
                    <>
                      <Edit3 className="h-4 w-4 text-[#D4A843]" />
                      {t("owner.teachers.edit_title", "Edit Teacher")}
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 text-[#D4A843]" />
                      {t("owner.teachers.create_title", "Create New Teacher")}
                    </>
                  )}
                </h3>
                <button
                  onClick={() => {
                    setShowCreate(false);
                    setEditingTeacher(null);
                  }}
                  className="btn btn-ghost btn-xs btn-circle"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-[#6B5D4F] dark:text-[#AAAAAA] mb-1 block">
                    {t("owner.teachers.first_name", "First Name")} *
                  </label>
                  <input
                    type="text"
                    value={form.first_name}
                    onChange={(e) =>
                      setForm({ ...form, first_name: e.target.value })
                    }
                    placeholder="Ahmed"
                    className="input input-bordered input-sm w-full bg-white dark:bg-[#0F0F0F] dark:border-[#2A2A2A] dark:text-[#E5E5E5]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[#6B5D4F] dark:text-[#AAAAAA] mb-1 block">
                    {t("owner.teachers.last_name", "Last Name")} *
                  </label>
                  <input
                    type="text"
                    value={form.last_name}
                    onChange={(e) =>
                      setForm({ ...form, last_name: e.target.value })
                    }
                    placeholder="Benali"
                    className="input input-bordered input-sm w-full bg-white dark:bg-[#0F0F0F] dark:border-[#2A2A2A] dark:text-[#E5E5E5]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[#6B5D4F] dark:text-[#AAAAAA] mb-1 block">
                    {t("owner.teachers.email", "Email")} *
                  </label>
                  <div className="relative">
                    <Mail className="absolute top-2.5 left-3 h-3.5 w-3.5 text-[#BEB29E]" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) =>
                        setForm({ ...form, email: e.target.value })
                      }
                      placeholder="teacher@university.dz"
                      className="input input-bordered input-sm w-full pl-9 bg-white dark:bg-[#0F0F0F] dark:border-[#2A2A2A] dark:text-[#E5E5E5]"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-[#6B5D4F] dark:text-[#AAAAAA] mb-1 block">
                    {t("owner.teachers.phone", "Phone")}
                  </label>
                  <div className="relative">
                    <Phone className="absolute top-2.5 left-3 h-3.5 w-3.5 text-[#BEB29E]" />
                    <input
                      type="tel"
                      value={form.phone_number}
                      onChange={(e) =>
                        setForm({ ...form, phone_number: e.target.value })
                      }
                      placeholder="0550 00 00 00"
                      className="input input-bordered input-sm w-full pl-9 bg-white dark:bg-[#0F0F0F] dark:border-[#2A2A2A] dark:text-[#E5E5E5]"
                    />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] font-medium text-[#6B5D4F] dark:text-[#AAAAAA] mb-1 block">
                    {editingTeacher
                      ? t(
                          "owner.teachers.new_password",
                          "New Password (leave empty to keep current)",
                        )
                      : t("owner.teachers.password", "Password")}
                    {!editingTeacher && " *"}
                  </label>
                  <div className="relative">
                    <Lock className="absolute top-2.5 left-3 h-3.5 w-3.5 text-[#BEB29E]" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      placeholder={
                        editingTeacher
                          ? "••••••••"
                          : t(
                              "owner.teachers.password_placeholder",
                              "Min 6 characters",
                            )
                      }
                      className="input input-bordered input-sm w-full pl-9 pr-10 bg-white dark:bg-[#0F0F0F] dark:border-[#2A2A2A] dark:text-[#E5E5E5]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-2 right-3 text-[#BEB29E] hover:text-[#6B5D4F]"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {!editingTeacher && (
                    <p className="text-[10px] text-[#BEB29E] mt-1">
                      {t(
                        "owner.teachers.password_note",
                        "This password allows the teacher to log in directly. They can also use Google login.",
                      )}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-4 gap-2">
                <button
                  onClick={() => {
                    setShowCreate(false);
                    setEditingTeacher(null);
                  }}
                  className="btn btn-ghost btn-sm"
                >
                  {t("common.cancel", "Cancel")}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={
                    isMutating ||
                    !form.first_name.trim() ||
                    !form.last_name.trim() ||
                    !form.email.trim() ||
                    (!editingTeacher && !form.password.trim())
                  }
                  className="btn btn-sm bg-[#D4A843] hover:bg-[#B8912E] text-white border-none gap-2"
                >
                  {isMutating ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : editingTeacher ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" />
                  )}
                  {editingTeacher
                    ? t("common.save", "Save Changes")
                    : t("common.create", "Create")}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ Teachers Table ═══ */}
      <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/30 dark:border-[#2A2A2A] overflow-hidden">
        {filteredTeachers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-[#D4A843]/10 flex items-center justify-center mb-3">
              <GraduationCap className="h-6 w-6 text-[#D4A843]" />
            </div>
            <h3 className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] mb-1">
              {searchQuery || filterAttendance !== "ALL"
                ? t("owner.teachers.no_results", "No teachers found")
                : t("owner.teachers.empty", "No teachers yet")}
            </h3>
            <p className="text-xs text-[#BEB29E] dark:text-[#666666]">
              {searchQuery
                ? t("owner.teachers.try_different", "Try a different search")
                : t(
                    "owner.teachers.empty_desc",
                    "Click 'New Teacher' to add one",
                  )}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-sm w-full">
              <thead>
                <tr className="border-b border-[#D8CDC0]/30 dark:border-[#2A2A2A]">
                  <th className="text-xs text-[#BEB29E] dark:text-[#666666] font-medium">
                    {t("owner.teachers.col_teacher", "Teacher")}
                  </th>
                  <th className="text-xs text-[#BEB29E] dark:text-[#666666] font-medium">
                    {t("owner.teachers.col_contact", "Contact")}
                  </th>
                  <th className="text-xs text-[#BEB29E] dark:text-[#666666] font-medium">
                    {t("owner.teachers.col_groups", "Groups")}
                  </th>
                  <th className="text-xs text-[#BEB29E] dark:text-[#666666] font-medium">
                    {t("owner.teachers.col_courses", "Courses")}
                  </th>
                  <th className="text-xs text-[#BEB29E] dark:text-[#666666] font-medium">
                    <div className="flex items-center gap-1">
                      <CalendarCheck className="h-3 w-3" />
                      {t("owner.teachers.col_attendance", "Today")}
                    </div>
                  </th>
                  <th className="text-xs text-[#BEB29E] dark:text-[#666666] font-medium">
                    {t("owner.teachers.col_total_sessions", "Sessions")}
                  </th>
                  <th className="text-xs text-[#BEB29E] dark:text-[#666666] font-medium text-right">
                    {t("owner.teachers.col_actions", "Actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.map((teacher: any) => {
                  const att = teacherAttendance[teacher.teacher_id];
                  const groupCount = teacher.groups?.length || 0;
                  const courses = [
                    ...new Set(
                      teacher.groups
                        ?.map((g: any) => g.course?.course_name)
                        .filter(Boolean) || [],
                    ),
                  ];

                  return (
                    <tr
                      key={teacher.teacher_id}
                      className="border-b border-[#D8CDC0]/10 dark:border-[#2A2A2A]/50 hover:bg-[#FAFAF8] dark:hover:bg-[#222222] transition-colors"
                    >
                      {/* Name */}
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4A843] to-[#B8912E] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                            {teacher.first_name?.charAt(0)}
                            {teacher.last_name?.charAt(0)}
                          </div>
                          <div>
                            <span className="text-sm font-medium text-[#1B1B1B] dark:text-[#E5E5E5] block leading-tight">
                              {teacher.first_name} {teacher.last_name}
                            </span>
                            <span className="text-[11px] text-[#BEB29E] dark:text-[#666666]">
                              {new Date(
                                teacher.created_at,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td>
                        <div className="space-y-0.5">
                          <p className="text-xs text-[#6B5D4F] dark:text-[#AAAAAA] flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {teacher.email}
                          </p>
                          {teacher.phone_number && (
                            <p className="text-[11px] text-[#BEB29E] dark:text-[#666666] flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {teacher.phone_number}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Groups */}
                      <td>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full ${
                            groupCount > 0
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                          }`}
                        >
                          <Layers className="h-3 w-3" />
                          {groupCount}
                        </span>
                      </td>

                      {/* Courses */}
                      <td>
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {courses.length > 0 ? (
                            courses.slice(0, 2).map((name: string) => (
                              <span
                                key={name}
                                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium rounded bg-[#D4A843]/10 text-[#B8912E] dark:text-[#D4A843]"
                              >
                                <BookOpen className="h-2.5 w-2.5" />
                                {name}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-[#BEB29E]">
                              —
                            </span>
                          )}
                          {courses.length > 2 && (
                            <span className="text-[10px] text-[#BEB29E]">
                              +{courses.length - 2}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Today's Attendance */}
                      <td>
                        {att?.todayStatus === "PRESENT" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 className="h-3 w-3" />
                            {t("owner.teachers.present", "Present")}
                          </span>
                        ) : att?.todayStatus === "ABSENT" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                            <XCircle className="h-3 w-3" />
                            {t("owner.teachers.absent", "Absent")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                            <Clock className="h-3 w-3" />
                            {t("owner.teachers.no_class_short", "N/A")}
                          </span>
                        )}
                        {att?.todaySessions?.length > 0 && (
                          <span className="text-[10px] text-[#BEB29E] ml-1">
                            ({att.todaySessions.length}{" "}
                            {t("owner.teachers.session_abbr", "sess.")})
                          </span>
                        )}
                      </td>

                      {/* Total Sessions */}
                      <td>
                        <span className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                          {att?.totalSessionsAllTime || 0}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() =>
                              setViewingTeacherId(teacher.teacher_id)
                            }
                            className="btn btn-ghost btn-xs"
                            title={t("common.view", "View")}
                          >
                            <Eye className="h-3.5 w-3.5 text-[#D4A843]" />
                          </button>
                          <button
                            onClick={() => openEdit(teacher)}
                            className="btn btn-ghost btn-xs"
                            title={t("common.edit", "Edit")}
                          >
                            <Edit3 className="h-3.5 w-3.5 text-blue-500" />
                          </button>
                          <button
                            onClick={() =>
                              setConfirmAction({ type: "delete", teacher })
                            }
                            className="btn btn-ghost btn-xs"
                            title={t("common.delete", "Delete")}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ═══ Delete Confirm ═══ */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-xl p-6 max-w-sm w-full mx-4 border border-[#D8CDC0]/30 dark:border-[#2A2A2A]">
            <h3 className="text-lg font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] mb-2">
              {t("owner.teachers.confirm_delete", "Delete Teacher?")}
            </h3>
            <p className="text-sm text-[#6B5D4F] dark:text-[#AAAAAA] mb-1">
              {confirmAction.teacher.first_name}{" "}
              {confirmAction.teacher.last_name}
            </p>
            <p className="text-xs text-[#BEB29E] dark:text-[#666666] mb-1">
              {confirmAction.teacher.email}
            </p>
            {confirmAction.teacher.groups?.length > 0 && (
              <div className="mt-2 mb-3 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
                <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                  {t(
                    "owner.teachers.delete_warning_groups",
                    "Teacher is assigned to groups. Remove assignments first.",
                  )}
                </p>
              </div>
            )}
            <p className="text-xs text-[#BEB29E] dark:text-[#666666] mb-4">
              {t(
                "owner.teachers.delete_warning",
                "This action cannot be undone.",
              )}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmAction(null)}
                className="btn btn-ghost btn-sm"
              >
                {t("common.cancel", "Cancel")}
              </button>
              <button
                onClick={handleDelete}
                disabled={
                  deleteTeacher.isPending ||
                  confirmAction.teacher.groups?.length > 0
                }
                className="btn btn-sm bg-red-500 hover:bg-red-600 text-white border-none gap-1"
              >
                {deleteTeacher.isPending ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                {t("common.delete", "Delete")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Detail Modal ═══ */}
      <AnimatePresence>
        {viewingTeacherId && (
          <TeacherDetailModal
            teacherId={viewingTeacherId}
            teacherAttendance={teacherAttendance[viewingTeacherId]}
            allSessions={allSessions}
            onClose={() => setViewingTeacherId(null)}
            onEdit={(teacher: any) => {
              setViewingTeacherId(null);
              openEdit(teacher);
            }}
            isRtl={isRtl}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   TEACHER DETAIL MODAL — with attendance history
════════════════════════════════════════════════════════════ */
const TeacherDetailModal: React.FC<{
  teacherId: string;
  teacherAttendance: any;
  allSessions: any;
  onClose: () => void;
  onEdit: (teacher: any) => void;
  isRtl: boolean;
}> = ({
  teacherId,
  teacherAttendance: att,
  allSessions,
  onClose,
  onEdit,
  isRtl,
}) => {
  const { t } = useTranslation();
  const { data: teacher, isLoading } = useOwnerTeacherDetail(teacherId);

  // Compute session history for this teacher
  const sessionHistory = useMemo(() => {
    if (!allSessions || !Array.isArray(allSessions)) return [];
    return allSessions
      .filter((s: any) => s.group?.teacher?.teacher_id === teacherId)
      .sort(
        (a: any, b: any) =>
          new Date(b.session_date).getTime() -
          new Date(a.session_date).getTime(),
      )
      .slice(0, 20); // Last 20 sessions
  }, [allSessions, teacherId]);

  const groupCount = teacher?.groups?.length || 0;
  const courses = [
    ...new Set(
      teacher?.groups?.map((g: any) => g.course?.course_name).filter(Boolean) ||
        [],
    ),
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-[#D8CDC0]/30 dark:border-[#2A2A2A] shadow-2xl w-full max-w-lg overflow-hidden max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#D8CDC0]/30 dark:border-[#2A2A2A] flex items-center justify-between shrink-0">
          <h3 className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5] flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-[#D4A843]" />
            {t("owner.teachers.detail_title", "Teacher Profile")}
          </h3>
          <div className="flex items-center gap-1.5">
            {teacher && (
              <button
                onClick={() => onEdit(teacher)}
                className="btn btn-ghost btn-xs gap-1"
              >
                <Edit3 className="h-3.5 w-3.5 text-[#D4A843]" />
                {t("common.edit", "Edit")}
              </button>
            )}
            <button
              onClick={onClose}
              className="btn btn-ghost btn-xs btn-circle"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <span className="loading loading-spinner loading-md text-[#D4A843]" />
            </div>
          ) : !teacher ? (
            <p className="text-center text-[#BEB29E] py-12">
              {t("owner.teachers.not_found", "Teacher not found")}
            </p>
          ) : (
            <>
              {/* Profile */}
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#D4A843] to-[#B8912E] flex items-center justify-center text-white font-bold text-lg shadow-md shadow-[#D4A843]/20">
                  {teacher.first_name?.charAt(0)}
                  {teacher.last_name?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                    {teacher.first_name} {teacher.last_name}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-0.5">
                    <span className="text-xs text-[#6B5D4F] dark:text-[#AAAAAA] flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {teacher.email}
                    </span>
                    {teacher.phone_number && (
                      <span className="text-xs text-[#6B5D4F] dark:text-[#AAAAAA] flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {teacher.phone_number}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-[#BEB29E] flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {t("owner.teachers.joined", "Joined")}{" "}
                      {new Date(teacher.created_at).toLocaleDateString(
                        isRtl ? "ar-DZ" : "en-US",
                        { year: "numeric", month: "long", day: "numeric" },
                      )}
                    </span>
                    {/* Today's status badge */}
                    {att?.todayStatus === "PRESENT" ? (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        {t("owner.teachers.present", "Present")}
                      </span>
                    ) : att?.todayStatus === "ABSENT" ? (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                        <XCircle className="h-2.5 w-2.5" />
                        {t("owner.teachers.absent", "Absent")}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-2.5">
                <div className="bg-[#D4A843]/5 dark:bg-[#D4A843]/10 rounded-lg p-3 text-center border border-[#D4A843]/15">
                  <p className="text-xl font-bold text-[#B8912E] dark:text-[#D4A843]">
                    {groupCount}
                  </p>
                  <p className="text-[10px] text-[#BEB29E]">
                    {t("owner.teachers.groups", "Groups")}
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-3 text-center border border-blue-100 dark:border-blue-900/20">
                  <p className="text-xl font-bold text-blue-700 dark:text-blue-400">
                    {att?.totalSessionsAllTime || 0}
                  </p>
                  <p className="text-[10px] text-blue-500">
                    {t("owner.teachers.total_sessions", "Total Sessions")}
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/10 rounded-lg p-3 text-center border border-purple-100 dark:border-purple-900/20">
                  <p className="text-xl font-bold text-purple-700 dark:text-purple-400">
                    {courses.length}
                  </p>
                  <p className="text-[10px] text-purple-500">
                    {t("owner.teachers.courses", "Courses")}
                  </p>
                </div>
              </div>

              {/* Attendance Summary */}
              {att && att.daysWithSessions > 0 && (
                <div>
                  <h4 className="text-[11px] font-semibold text-[#6B5D4F] dark:text-[#AAAAAA] mb-2 flex items-center gap-1.5">
                    <CalendarCheck className="h-3.5 w-3.5" />
                    {t(
                      "owner.teachers.attendance_summary",
                      "Attendance Summary",
                    )}
                  </h4>
                  <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] text-[#6B5D4F] dark:text-[#AAAAAA]">
                        {att.daysPresent}{" "}
                        {t("owner.teachers.days_taught", "days taught")}
                      </span>
                      <span className="text-sm font-bold text-emerald-600">
                        {att.totalSessionsAllTime}{" "}
                        {t("owner.teachers.sessions", "sessions")}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Courses */}
              {courses.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-semibold text-[#6B5D4F] dark:text-[#AAAAAA] mb-2 flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5" />
                    {t("owner.teachers.courses_taught", "Courses Taught")}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {courses.map((name: string) => (
                      <span
                        key={name}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-[#D4A843]/10 text-[#B8912E] dark:text-[#D4A843] border border-[#D4A843]/15"
                      >
                        <BookOpen className="h-3 w-3" />
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Groups */}
              <div>
                <h4 className="text-[11px] font-semibold text-[#6B5D4F] dark:text-[#AAAAAA] mb-2 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5" />
                  {t("owner.teachers.assigned_groups", "Assigned Groups")} (
                  {groupCount})
                </h4>
                {groupCount === 0 ? (
                  <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700 text-center">
                    <p className="text-xs text-[#BEB29E]">
                      {t("owner.teachers.no_groups", "No groups assigned")}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {teacher.groups.map((group: any) => (
                      <div
                        key={group.group_id}
                        className="p-3 rounded-lg bg-[#FAFAF8] dark:bg-[#222222] border border-[#D8CDC0]/20 dark:border-[#2A2A2A]"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E5E5E5]">
                              {group.name}
                            </h5>
                            <div className="flex items-center gap-2 mt-0.5">
                              {group.course && (
                                <span className="text-[11px] text-[#6B5D4F] dark:text-[#AAAAAA] flex items-center gap-1">
                                  <BookOpen className="h-3 w-3" />
                                  {group.course.course_name}
                                  {group.course.course_code &&
                                    ` (${group.course.course_code})`}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-[#1B1B1B] dark:text-[#E5E5E5]">
                              {group.sessions?.length || 0}
                            </p>
                            <p className="text-[10px] text-[#BEB29E]">
                              {t("owner.teachers.sessions", "sessions")}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Session History */}
              {sessionHistory.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-semibold text-[#6B5D4F] dark:text-[#AAAAAA] mb-2 flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {t(
                      "owner.teachers.session_history",
                      "Recent Teaching Sessions",
                    )}
                  </h4>
                  <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                    {sessionHistory.map((session: any) => {
                      const sessionDate = new Date(session.session_date);
                      const isToday =
                        toLocalDateStr(sessionDate) ===
                        toLocalDateStr(new Date());
                      const isPast = sessionDate < new Date();

                      return (
                        <div
                          key={session.session_id}
                          className={`flex items-center justify-between p-2.5 rounded-lg border ${
                            isToday
                              ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-900/20"
                              : "bg-zinc-50 dark:bg-zinc-800/30 border-zinc-100 dark:border-zinc-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {isPast || isToday ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            ) : (
                              <Clock className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                            )}
                            <div>
                              <p className="text-xs font-medium text-[#1B1B1B] dark:text-[#E5E5E5]">
                                {session.group?.course?.course_name ||
                                  session.group?.name ||
                                  "—"}
                                {isToday && (
                                  <span className="ml-1.5 text-[9px] font-semibold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-1 py-0.5 rounded">
                                    {t("owner.teachers.today_label", "TODAY")}
                                  </span>
                                )}
                              </p>
                              {session.topic && (
                                <p className="text-[10px] text-[#BEB29E]">
                                  {session.topic}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[11px] font-medium text-[#6B5D4F] dark:text-[#AAAAAA]">
                              {sessionDate.toLocaleDateString(
                                isRtl ? "ar-DZ" : "en-US",
                                { month: "short", day: "numeric" },
                              )}
                            </p>
                            <p className="text-[10px] text-[#BEB29E]">
                              {sessionDate.toLocaleTimeString(
                                isRtl ? "ar-DZ" : "en-US",
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default OwnerTeacherspage;
