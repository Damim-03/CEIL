/* ===============================================================
   AdminNotificationsPage.tsx - i18n enabled
=============================================================== */

import { useState, useMemo } from "react";
import {
  Bell,
  Send,
  List,
  Trash2,
  Eye,
  Users,
  GraduationCap,
  BookOpen,
  Layers,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Clock,
  User,
} from "lucide-react";
import {
  useNotificationTargets,
  useSendNotification,
  useAdminNotifications,
  useAdminNotificationDetail,
  useDeleteNotification,
  useSearchStudents,
} from "../../../../hooks/admin/useAdmin";
import type {
  NotificationPayload,
  NotificationTargetType,
  NotificationPriorityType,
} from "../../../../lib/api/admin/admin.api";
import { useTranslation } from "react-i18next";

/* ── CONSTANTS ── */

const TARGET_OPTION_KEYS: {
  value: NotificationTargetType;
  labelKey: string;
  icon: typeof Users;
  descKey: string;
}[] = [
  {
    value: "ALL_STUDENTS",
    labelKey: "admin.notifications.targets.allStudents",
    icon: GraduationCap,
    descKey: "admin.notifications.targets.allStudentsDesc",
  },
  {
    value: "ALL_TEACHERS",
    labelKey: "admin.notifications.targets.allTeachers",
    icon: User,
    descKey: "admin.notifications.targets.allTeachersDesc",
  },
  {
    value: "GROUP",
    labelKey: "admin.notifications.targets.group",
    icon: Layers,
    descKey: "admin.notifications.targets.groupDesc",
  },
  {
    value: "COURSE",
    labelKey: "admin.notifications.targets.course",
    icon: BookOpen,
    descKey: "admin.notifications.targets.courseDesc",
  },
  {
    value: "SPECIFIC_TEACHERS",
    labelKey: "admin.notifications.targets.specificTeachers",
    icon: User,
    descKey: "admin.notifications.targets.specificTeachersDesc",
  },
  {
    value: "SPECIFIC_STUDENTS",
    labelKey: "admin.notifications.targets.specificStudents",
    icon: GraduationCap,
    descKey: "admin.notifications.targets.specificStudentsDesc",
  },
];

const PRIORITY_OPTION_KEYS: {
  value: NotificationPriorityType;
  labelKey: string;
  color: string;
  icon: typeof Info;
}[] = [
  {
    value: "LOW",
    labelKey: "admin.notifications.priority.low",
    color: "text-gray-500 bg-gray-50 border-gray-200",
    icon: Info,
  },
  {
    value: "NORMAL",
    labelKey: "admin.notifications.priority.normal",
    color: "text-blue-600 bg-blue-50 border-blue-200",
    icon: Bell,
  },
  {
    value: "HIGH",
    labelKey: "admin.notifications.priority.high",
    color: "text-amber-600 bg-amber-50 border-amber-200",
    icon: AlertTriangle,
  },
  {
    value: "URGENT",
    labelKey: "admin.notifications.priority.urgent",
    color: "text-red-600 bg-red-50 border-red-200",
    icon: AlertCircle,
  },
];

const PRIORITY_BADGES: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-600",
  NORMAL: "bg-blue-100 text-blue-700",
  HIGH: "bg-amber-100 text-amber-700",
  URGENT: "bg-red-100 text-red-700",
};

function getTargetI18nKey(targetType: string): string {
  const map: Record<string, string> = {
    ALL_STUDENTS: "allStudents",
    ALL_TEACHERS: "allTeachers",
    GROUP: "group",
    COURSE: "course",
    SPECIFIC_TEACHERS: "specificTeachers",
    SPECIFIC_STUDENTS: "specificStudents",
  };
  return map[targetType] || "allStudents";
}

/* ── STUDENT SELECTOR ── */

interface SelectedStudent {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
}

function StudentSelector({
  selectedIds,
  onChange,
}: {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<SelectedStudent[]>(
    [],
  );
  const { data, isLoading } = useSearchStudents(searchQuery);
  const results = data?.students ?? [];

  const handleSelect = (student: SelectedStudent) => {
    if (!selectedIds.includes(student.user_id)) {
      setSelectedStudents((prev) => [...prev, student]);
      onChange([...selectedIds, student.user_id]);
    }
  };
  const handleRemove = (userId: string) => {
    setSelectedStudents((prev) => prev.filter((s) => s.user_id !== userId));
    onChange(selectedIds.filter((id) => id !== userId));
  };

  return (
    <div className="mt-4 space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {t("admin.notifications.studentSelector.label")}
      </label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("admin.notifications.studentSelector.placeholder")}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>
      {selectedStudents.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedStudents.map((s) => (
            <span
              key={s.user_id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 border border-teal-200 rounded-lg text-xs text-teal-800"
            >
              <GraduationCap className="w-3 h-3" /> {s.first_name} {s.last_name}
              <button
                onClick={() => handleRemove(s.user_id)}
                className="text-teal-500 hover:text-teal-700 ml-1"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      {searchQuery.length >= 2 && (
        <div className="border border-gray-200 rounded-xl max-h-52 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-6">
              <div className="w-5 h-5 border-2 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
              <span className="text-sm text-gray-400 ml-2">
                {t("admin.notifications.studentSelector.searching")}
              </span>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-6">
              <GraduationCap className="w-6 h-6 text-gray-200 mx-auto mb-1" />
              <p className="text-sm text-gray-400">
                {t("admin.notifications.studentSelector.noResults", {
                  query: searchQuery,
                })}
              </p>
            </div>
          ) : (
            results.map((s: any) => {
              const isSelected = selectedIds.includes(s.user_id);
              return (
                <button
                  key={s.user_id}
                  onClick={() => !isSelected && handleSelect(s)}
                  disabled={isSelected}
                  className={`w-full flex items-center gap-3 p-3 text-left transition-colors border-b border-gray-50 last:border-b-0 ${isSelected ? "bg-teal-50/50 opacity-60 cursor-not-allowed" : "hover:bg-gray-50 cursor-pointer"}`}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800">
                      {s.first_name} {s.last_name}
                      {isSelected && (
                        <span className="text-xs text-teal-600 ml-2">
                          ✓ {t("admin.notifications.studentSelector.selected")}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{s.email}</p>
                  </div>
                  {!isSelected && (
                    <span className="text-xs text-teal-600 shrink-0">
                      + {t("admin.notifications.studentSelector.add")}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
      {searchQuery.length > 0 && searchQuery.length < 2 && (
        <p className="text-xs text-gray-400">
          {t("admin.notifications.studentSelector.minChars")}
        </p>
      )}
      {selectedIds.length > 0 && (
        <p className="text-xs text-teal-600 font-medium">
          {t("admin.notifications.studentSelector.selectedCount", {
            count: selectedIds.length,
          })}
        </p>
      )}
    </div>
  );
}
/* ── MAIN PAGE ── */

export default function AdminNotificationsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"send" | "list">("send");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
              <Bell className="w-5 h-5 text-teal-700" />
            </div>
            {t("admin.notifications.title")}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {t("admin.notifications.subtitle")}
          </p>
        </div>
      </div>
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab("send")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "send" ? "bg-white text-teal-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          <Send className="w-4 h-4" /> {t("admin.notifications.tabs.send")}
        </button>
        <button
          onClick={() => setActiveTab("list")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "list" ? "bg-white text-teal-700 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
        >
          <List className="w-4 h-4" /> {t("admin.notifications.tabs.sent")}
        </button>
      </div>
      {activeTab === "send" ? <SendNotificationForm /> : <NotificationsList />}
    </div>
  );
}

/* ── SEND NOTIFICATION FORM ── */

function SendNotificationForm() {
  const { t } = useTranslation();
  const { data: targets, isLoading: targetsLoading } = useNotificationTargets();
  const sendMutation = useSendNotification();

  const [form, setForm] = useState<{
    title: string;
    title_ar: string;
    message: string;
    message_ar: string;
    target_type: NotificationTargetType;
    priority: NotificationPriorityType;
    course_id: string;
    group_id: string;
    user_ids: string[];
  }>({
    title: "",
    title_ar: "",
    message: "",
    message_ar: "",
    target_type: "ALL_STUDENTS",
    priority: "NORMAL",
    course_id: "",
    group_id: "",
    user_ids: [],
  });

  const handleSubmit = () => {
    if (!form.title_ar && !form.title) return;
    if (!form.message_ar && !form.message) return;
    const payload: NotificationPayload = {
      title: form.title || form.title_ar,
      title_ar: form.title_ar || undefined,
      message: form.message || form.message_ar,
      message_ar: form.message_ar || undefined,
      target_type: form.target_type,
      priority: form.priority,
    };
    if (form.target_type === "COURSE" && form.course_id)
      payload.course_id = form.course_id;
    if (form.target_type === "GROUP" && form.group_id)
      payload.group_id = form.group_id;
    if (
      (form.target_type === "SPECIFIC_TEACHERS" ||
        form.target_type === "SPECIFIC_STUDENTS") &&
      form.user_ids.length > 0
    )
      payload.user_ids = form.user_ids;
    sendMutation.mutate(payload, {
      onSuccess: () =>
        setForm({
          title: "",
          title_ar: "",
          message: "",
          message_ar: "",
          target_type: "ALL_STUDENTS",
          priority: "NORMAL",
          course_id: "",
          group_id: "",
          user_ids: [],
        }),
    });
  };

  const canSubmit = useMemo(() => {
    if (!form.title_ar && !form.title) return false;
    if (!form.message_ar && !form.message) return false;
    if (form.target_type === "COURSE" && !form.course_id) return false;
    if (form.target_type === "GROUP" && !form.group_id) return false;
    if (
      (form.target_type === "SPECIFIC_TEACHERS" ||
        form.target_type === "SPECIFIC_STUDENTS") &&
      form.user_ids.length === 0
    )
      return false;
    return true;
  }, [form]);

  const estimatedRecipients = useMemo(() => {
    if (!targets) return null;
    switch (form.target_type) {
      case "ALL_STUDENTS":
        return (
          targets.courses.reduce(
            (sum: number, c: any) => sum + c.student_count,
            0,
          ) || t("admin.notifications.targets.allStudents")
        );
      case "ALL_TEACHERS":
        return targets.teachers.length;
      case "COURSE":
        return (
          targets.courses.find((c: any) => c.course_id === form.course_id)
            ?.student_count ?? "—"
        );
      case "GROUP":
        return (
          targets.groups.find((g: any) => g.group_id === form.group_id)
            ?.student_count ?? "—"
        );
      case "SPECIFIC_TEACHERS":
      case "SPECIFIC_STUDENTS":
        return form.user_ids.length;
      default:
        return null;
    }
  }, [
    form.target_type,
    form.course_id,
    form.group_id,
    form.user_ids,
    targets,
    t,
  ]);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Target Type */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-600" />{" "}
            {t("admin.notifications.form.targetAudience")}
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {TARGET_OPTION_KEYS.map((opt) => {
              const Icon = opt.icon;
              const isActive = form.target_type === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      target_type: opt.value,
                      course_id: "",
                      group_id: "",
                      user_ids: [],
                    }))
                  }
                  className={`relative p-4 rounded-xl border-2 text-left transition-all ${isActive ? "border-teal-500 bg-teal-50/50" : "border-gray-200 hover:border-gray-300 bg-white"}`}
                >
                  {isActive && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="w-5 h-5 text-teal-600" />
                    </div>
                  )}
                  <Icon
                    className={`w-6 h-6 mb-2 ${isActive ? "text-teal-600" : "text-gray-400"}`}
                  />
                  <p
                    className={`text-sm font-medium ${isActive ? "text-teal-900" : "text-gray-700"}`}
                  >
                    {t(opt.labelKey)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{t(opt.descKey)}</p>
                </button>
              );
            })}
          </div>

          {form.target_type === "COURSE" && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("admin.notifications.form.selectCourse")}
              </label>
              <select
                value={form.course_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, course_id: e.target.value }))
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              >
                <option value="">
                  {t("admin.notifications.form.selectCourseOption")}
                </option>
                {targets?.courses.map((c: any) => (
                  <option key={c.course_id} value={c.course_id}>
                    {c.course_name} ({c.student_count}{" "}
                    {t("admin.notifications.form.students")})
                  </option>
                ))}
              </select>
            </div>
          )}

          {form.target_type === "GROUP" && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("admin.notifications.form.selectGroup")}
              </label>
              <select
                value={form.group_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, group_id: e.target.value }))
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              >
                <option value="">
                  {t("admin.notifications.form.selectGroupOption")}
                </option>
                {targets?.groups.map((g: any) => (
                  <option key={g.group_id} value={g.group_id}>
                    {g.name} — {g.course.course_name} ({g.student_count}{" "}
                    {t("admin.notifications.form.students")})
                    {g.teacher
                      ? ` | ${g.teacher.first_name} ${g.teacher.last_name}`
                      : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {form.target_type === "SPECIFIC_TEACHERS" && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("admin.notifications.form.selectTeachers")}
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-3">
                {targetsLoading ? (
                  <p className="text-sm text-gray-400 text-center py-4">
                    {t("admin.notifications.loading")}
                  </p>
                ) : (
                  targets?.teachers.map((teacher: any) => (
                    <label
                      key={teacher.user_id}
                      className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${form.user_ids.includes(teacher.user_id) ? "bg-teal-50 border border-teal-200" : "hover:bg-gray-50 border border-transparent"}`}
                    >
                      <input
                        type="checkbox"
                        checked={form.user_ids.includes(teacher.user_id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setForm((f) => ({
                              ...f,
                              user_ids: [...f.user_ids, teacher.user_id],
                            }));
                          } else {
                            setForm((f) => ({
                              ...f,
                              user_ids: f.user_ids.filter(
                                (id) => id !== teacher.user_id,
                              ),
                            }));
                          }
                        }}
                        className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {teacher.first_name} {teacher.last_name}
                        </p>
                        {teacher.email && (
                          <p className="text-xs text-gray-400">
                            {teacher.email}
                          </p>
                        )}
                      </div>
                    </label>
                  ))
                )}
              </div>
              {form.user_ids.length > 0 && (
                <p className="text-xs text-teal-600 mt-2">
                  {t("admin.notifications.form.teachersSelected", {
                    count: form.user_ids.length,
                  })}
                </p>
              )}
            </div>
          )}

          {form.target_type === "SPECIFIC_STUDENTS" && (
            <StudentSelector
              selectedIds={form.user_ids}
              onChange={(ids) => setForm((f) => ({ ...f, user_ids: ids }))}
            />
          )}
        </div>

        {/* Message Content */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
          <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <Send className="w-4 h-4 text-teal-600" />{" "}
            {t("admin.notifications.form.content")}
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t("admin.notifications.form.titleAr")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title_ar}
              onChange={(e) =>
                setForm((f) => ({ ...f, title_ar: e.target.value }))
              }
              placeholder={t("admin.notifications.form.titleArPlaceholder")}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              dir="rtl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t("admin.notifications.form.titleFr")}{" "}
              <span className="text-gray-400 text-xs ml-1">
                {t("admin.notifications.form.optional")}
              </span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder={t("admin.notifications.form.titleFrPlaceholder")}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t("admin.notifications.form.messageAr")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.message_ar}
              onChange={(e) =>
                setForm((f) => ({ ...f, message_ar: e.target.value }))
              }
              placeholder={t("admin.notifications.form.messageArPlaceholder")}
              rows={4}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 resize-none"
              dir="rtl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              {t("admin.notifications.form.messageFr")}{" "}
              <span className="text-gray-400 text-xs ml-1">
                {t("admin.notifications.form.optional")}
              </span>
            </label>
            <textarea
              value={form.message}
              onChange={(e) =>
                setForm((f) => ({ ...f, message: e.target.value }))
              }
              placeholder={t("admin.notifications.form.messageFrPlaceholder")}
              rows={3}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 resize-none"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("admin.notifications.form.priority")}
            </label>
            <div className="flex flex-wrap gap-2">
              {PRIORITY_OPTION_KEYS.map((p) => {
                const Icon = p.icon;
                return (
                  <button
                    key={p.value}
                    onClick={() =>
                      setForm((f) => ({ ...f, priority: p.value }))
                    }
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${form.priority === p.value ? p.color + " border-current" : "text-gray-400 bg-white border-gray-200 hover:border-gray-300"}`}
                  >
                    <Icon className="w-3.5 h-3.5" /> {t(p.labelKey)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            {t("admin.notifications.preview.title")}
          </h3>
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${PRIORITY_BADGES[form.priority]}`}
              >
                {t(
                  `admin.notifications.priority.${form.priority.toLowerCase()}`,
                )}
              </span>
              <span className="text-xs text-gray-400">
                {t("admin.notifications.preview.now")}
              </span>
            </div>
            <p className="font-semibold text-gray-900 text-sm">
              {form.title_ar ||
                form.title ||
                t("admin.notifications.preview.titlePlaceholder")}
            </p>
            <p className="text-gray-600 text-xs leading-relaxed line-clamp-3">
              {form.message_ar ||
                form.message ||
                t("admin.notifications.preview.messagePlaceholder")}
            </p>
            <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
              <Users className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">
                {t(
                  `admin.notifications.targets.${getTargetI18nKey(form.target_type)}`,
                )}
              </span>
              {estimatedRecipients !== null && (
                <span className="text-xs text-teal-600 font-medium ml-auto">
                  ~{estimatedRecipients}{" "}
                  {t("admin.notifications.preview.recipients")}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit || sendMutation.isPending}
          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-all ${canSubmit && !sendMutation.isPending ? "bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-600/25" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
        >
          {sendMutation.isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{" "}
              {t("admin.notifications.form.sending")}
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />{" "}
              {t("admin.notifications.form.sendBtn")}
            </>
          )}
        </button>

        {targets && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              {t("admin.notifications.quickStats.title")}
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />{" "}
                  {t("admin.notifications.quickStats.courses")}
                </span>
                <span className="text-sm font-semibold text-gray-800">
                  {targets.courses.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />{" "}
                  {t("admin.notifications.quickStats.groups")}
                </span>
                <span className="text-sm font-semibold text-gray-800">
                  {targets.groups.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />{" "}
                  {t("admin.notifications.quickStats.teachers")}
                </span>
                <span className="text-sm font-semibold text-gray-800">
                  {targets.teachers.length}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── NOTIFICATIONS LIST ── */

function NotificationsList() {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading } = useAdminNotifications(page);
  const deleteMutation = useDeleteNotification();
  const notifications = data?.data ?? [];
  const meta = data?.meta;

  const filtered = useMemo(() => {
    if (!searchQuery) return notifications;
    const q = searchQuery.toLowerCase();
    return notifications.filter(
      (n: any) =>
        n.title.toLowerCase().includes(q) ||
        n.title_ar?.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q),
    );
  }, [notifications, searchQuery]);

  if (selectedId)
    return (
      <NotificationDetail id={selectedId} onBack={() => setSelectedId(null)} />
    );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("admin.notifications.list.searchPlaceholder")}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">
              {t("admin.notifications.list.noNotifications")}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">
                    {t("admin.notifications.list.colTitle")}
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">
                    {t("admin.notifications.list.colTarget")}
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">
                    {t("admin.notifications.list.colPriority")}
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">
                    {t("admin.notifications.list.colRecipients")}
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">
                    {t("admin.notifications.list.colRead")}
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">
                    {t("admin.notifications.list.colDate")}
                  </th>
                  <th className="text-left text-xs font-medium text-gray-500 px-5 py-3">
                    {t("admin.notifications.list.colActions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((n: any) => {
                  const readPct =
                    n.total_recipients > 0
                      ? Math.round((n.read_count / n.total_recipients) * 100)
                      : 0;
                  return (
                    <tr
                      key={n.notification_id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                          {n.title_ar || n.title}
                        </p>
                        <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                          {n.message_ar?.slice(0, 60) ||
                            n.message?.slice(0, 60)}
                          ...
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">
                          {t(
                            `admin.notifications.targets.${getTargetI18nKey(n.target_type)}`,
                          )}
                        </span>
                        {n.course && (
                          <p className="text-xs text-gray-400 mt-1">
                            {n.course.course_name}
                          </p>
                        )}
                        {n.group && (
                          <p className="text-xs text-gray-400 mt-1">
                            {n.group.name}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium ${PRIORITY_BADGES[n.priority] || PRIORITY_BADGES.NORMAL}`}
                        >
                          {t(
                            `admin.notifications.priority.${(n.priority || "NORMAL").toLowerCase()}`,
                          )}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-gray-800">
                          {n.total_recipients}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-teal-500 rounded-full transition-all"
                              style={{ width: `${readPct}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {readPct}%
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(n.created_at).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedId(n.notification_id)}
                            className="p-2 rounded-lg hover:bg-teal-50 text-gray-400 hover:text-teal-600 transition-colors"
                            title={t("admin.notifications.list.viewDetails")}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  t("admin.notifications.list.confirmDelete"),
                                )
                              )
                                deleteMutation.mutate(n.notification_id);
                            }}
                            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                            title={t("admin.notifications.list.delete")}
                          >
                            <Trash2 className="w-4 h-4" />
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

        {meta && meta.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              {t("admin.notifications.list.pagination", {
                page: meta.page,
                pages: meta.pages,
                total: meta.total,
              })}
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= meta.pages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── NOTIFICATION DETAIL ── */

function NotificationDetail({
  id,
  onBack,
}: {
  id: string;
  onBack: () => void;
}) {
  const { t } = useTranslation();
  const { data: notification, isLoading } = useAdminNotificationDetail(id);
  const deleteMutation = useDeleteNotification();

  if (isLoading)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
      </div>
    );

  if (!notification) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">
          {t("admin.notifications.detail.notFound")}
        </p>
        <button
          onClick={onBack}
          className="text-teal-600 text-sm mt-2 hover:underline"
        >
          {t("admin.notifications.detail.goBack")}
        </button>
      </div>
    );
  }

  const readCount =
    notification.recipients?.filter((r: any) => r.is_read).length ?? 0;
  const totalCount = notification.recipients?.length ?? 0;
  const readPct =
    totalCount > 0 ? Math.round((readCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />{" "}
          {t("admin.notifications.detail.backToList")}
        </button>
        <button
          onClick={() => {
            if (confirm(t("admin.notifications.list.confirmDelete")))
              deleteMutation.mutate(id, { onSuccess: () => onBack() });
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-600 text-sm hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />{" "}
          {t("admin.notifications.detail.delete")}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${PRIORITY_BADGES[notification.priority] || PRIORITY_BADGES.NORMAL}`}
              >
                {t(
                  `admin.notifications.priority.${(notification.priority || "NORMAL").toLowerCase()}`,
                )}
              </span>
              <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg">
                {t(
                  `admin.notifications.targets.${getTargetI18nKey(notification.target_type)}`,
                )}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {notification.title_ar || notification.title}
            </h2>
            {notification.title_ar && notification.title && (
              <p className="text-sm text-gray-500">{notification.title}</p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-gray-400">
              {new Date(notification.created_at).toLocaleDateString("en-US", {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-5 space-y-3">
          <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
            {notification.message_ar || notification.message}
          </p>
          {notification.message_ar && notification.message && (
            <p className="text-gray-500 text-sm leading-relaxed border-t border-gray-200 pt-3">
              {notification.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
            <p className="text-xs text-gray-500 mt-1">
              {t("admin.notifications.detail.totalRecipients")}
            </p>
          </div>
          <div className="bg-teal-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-teal-700">{readCount}</p>
            <p className="text-xs text-teal-600 mt-1">
              {t("admin.notifications.detail.read")}
            </p>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-amber-700">
              {totalCount - readCount}
            </p>
            <p className="text-xs text-amber-600 mt-1">
              {t("admin.notifications.detail.unread")}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">
              {t("admin.notifications.detail.readRate")}
            </span>
            <span className="text-sm font-semibold text-teal-700">
              {readPct}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-teal-400 to-teal-600 rounded-full transition-all duration-500"
              style={{ width: `${readPct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">
            {t("admin.notifications.detail.recipients")} ({totalCount})
          </h3>
        </div>
        <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
          {notification.recipients?.map((r: any) => {
            const name = r.user.student
              ? `${r.user.student.first_name} ${r.user.student.last_name}`
              : r.user.teacher
                ? `${r.user.teacher.first_name} ${r.user.teacher.last_name}`
                : r.user.email;
            return (
              <div
                key={r.recipient_id}
                className="flex items-center justify-between px-6 py-3 hover:bg-gray-50/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                    {r.user.google_avatar ? (
                      <img
                        src={r.user.google_avatar}
                        className="w-8 h-8 rounded-full object-cover"
                        alt=""
                      />
                    ) : (
                      <User className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{name}</p>
                    <p className="text-xs text-gray-400">{r.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${r.user.role === "STUDENT" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}
                  >
                    {r.user.role === "STUDENT"
                      ? t("admin.notifications.detail.student")
                      : t("admin.notifications.detail.teacher")}
                  </span>
                  {r.is_read ? (
                    <span className="flex items-center gap-1 text-xs text-teal-600">
                      <CheckCircle2 className="w-3.5 h-3.5" />{" "}
                      {t("admin.notifications.detail.read")}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">
                      {t("admin.notifications.detail.unread")}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
