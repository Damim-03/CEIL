// ================================================================
// 📌 src/app/owner/pages/Notifications/OwnerNotificationsPage.tsx
// ✅ Full notification management: Send + List + Detail + Delete
// ✅ Target types: ALL_STUDENTS, ALL_TEACHERS, ALL_ADMINS, ALL_USERS,
//    SPECIFIC_STUDENTS, SPECIFIC_TEACHERS, SPECIFIC_ADMINS, GROUP, COURSE
// ✅ Trilingual: Arabic, French, English
// ✅ Real-time Socket.IO integration
// ✅ Dark mode support
// ✅ FIX: Search results now handle both array and {students:[]} responses
// ================================================================

import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Send,
  Plus,
  Trash2,
  Eye,
  Users,
  GraduationCap,
  BookOpen,
  Shield,
  Globe,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Info,
  CheckCircle2,
  Clock,
  Megaphone,
  UserCheck,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  useOwnerNotificationTargets,
  useOwnerBroadcastNotification,
  useOwnerNotifications,
  useOwnerNotificationDetail,
  useOwnerDeleteNotification,
  useOwnerSearchStudents,
} from "../../../../hooks/owner/Useowner.hooks";
import type { OwnerNotificationPayload } from "../../../../lib/api/owner/owner.api";

// ─── Types ───────────────────────────────────────────────
type TargetType =
  | "ALL_STUDENTS"
  | "ALL_TEACHERS"
  | "ALL_ADMINS"
  | "ALL_USERS"
  | "SPECIFIC_STUDENTS"
  | "SPECIFIC_TEACHERS"
  | "SPECIFIC_ADMINS"
  | "GROUP"
  | "COURSE";

type Priority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

type ViewMode = "list" | "compose" | "detail";

interface SelectedUser {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
}

// ─── Helper: Normalize search results ────────────────────
// Backend may return { students: [...] } OR [...] directly
function normalizeSearchResults(data: any): SelectedUser[] {
  if (!data) return [];
  if (data.students && Array.isArray(data.students)) return data.students;
  if (data.data && Array.isArray(data.data)) return data.data;
  if (Array.isArray(data)) return data;
  return [];
}

// ─── Priority Config ─────────────────────────────────────
const PRIORITY_CONFIG: Record<
  Priority,
  { icon: React.ReactNode; color: string; bg: string; label: string }
> = {
  LOW: {
    icon: <Info size={14} />,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/30",
    label: "Low",
  },
  NORMAL: {
    icon: <CheckCircle2 size={14} />,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/30",
    label: "Normal",
  },
  HIGH: {
    icon: <AlertTriangle size={14} />,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/30",
    label: "High",
  },
  URGENT: {
    icon: <Megaphone size={14} />,
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-900/30",
    label: "Urgent",
  },
};

// ─── Target Config ───────────────────────────────────────
const TARGET_CONFIG: Record<
  TargetType,
  { icon: React.ReactNode; label: string; description: string }
> = {
  ALL_STUDENTS: {
    icon: <GraduationCap size={18} />,
    label: "All Students",
    description: "Send to all active students",
  },
  ALL_TEACHERS: {
    icon: <BookOpen size={18} />,
    label: "All Teachers",
    description: "Send to all teachers",
  },
  ALL_ADMINS: {
    icon: <Shield size={18} />,
    label: "All Admins",
    description: "Send to all admins & owners",
  },
  ALL_USERS: {
    icon: <Globe size={18} />,
    label: "All Users",
    description: "Broadcast to everyone",
  },
  SPECIFIC_STUDENTS: {
    icon: <UserCheck size={18} />,
    label: "Specific Students",
    description: "Choose individual students",
  },
  SPECIFIC_TEACHERS: {
    icon: <UserCheck size={18} />,
    label: "Specific Teachers",
    description: "Choose individual teachers",
  },
  SPECIFIC_ADMINS: {
    icon: <UserCheck size={18} />,
    label: "Specific Admins",
    description: "Choose individual admins",
  },
  GROUP: {
    icon: <Users size={18} />,
    label: "Group",
    description: "Send to a specific group",
  },
  COURSE: {
    icon: <BookOpen size={18} />,
    label: "Course",
    description: "Send to students in a course",
  },
};

// ════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════
const OwnerNotificationsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedNotificationId, setSelectedNotificationId] = useState<
    string | null
  >(null);
  const [page, setPage] = useState(1);

  const {
    data: notifications,
    isLoading: loadingList,
    refetch,
  } = useOwnerNotifications({ page, limit: 15 });

  return (
    <div
      className={`min-h-screen p-4 md:p-6 ${isRtl ? "rtl" : "ltr"}`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          {viewMode !== "list" && (
            <button
              onClick={() => {
                setViewMode("list");
                setSelectedNotificationId(null);
              }}
              className="p-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
            >
              {isRtl ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Bell className="text-teal-600 dark:text-teal-400" size={26} />
              {t("notifications.title", "Notifications")}
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              {viewMode === "compose"
                ? t("notifications.compose_subtitle", "Send a new notification")
                : viewMode === "detail"
                  ? t("notifications.detail_subtitle", "Notification details")
                  : t(
                      "notifications.subtitle",
                      "Manage and send notifications to users",
                    )}
            </p>
          </div>
        </div>

        {viewMode === "list" && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={18} />
            </button>
            <button
              onClick={() => setViewMode("compose")}
              className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-medium transition-colors shadow-sm"
            >
              <Plus size={18} />
              {t("notifications.send_new", "Send Notification")}
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {viewMode === "compose" && (
          <motion.div
            key="compose"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ComposeNotification
              onSuccess={() => {
                setViewMode("list");
                refetch();
              }}
              onCancel={() => setViewMode("list")}
            />
          </motion.div>
        )}

        {viewMode === "detail" && selectedNotificationId && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <NotificationDetail
              notificationId={selectedNotificationId}
              onBack={() => {
                setViewMode("list");
                setSelectedNotificationId(null);
              }}
              onDeleted={() => {
                setViewMode("list");
                setSelectedNotificationId(null);
                refetch();
              }}
            />
          </motion.div>
        )}

        {viewMode === "list" && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <NotificationList
              notifications={notifications?.data || []}
              meta={notifications?.meta}
              isLoading={loadingList}
              page={page}
              onPageChange={setPage}
              onView={(id) => {
                setSelectedNotificationId(id);
                setViewMode("detail");
              }}
              onDelete={() => {
                setSelectedNotificationId(null);
                refetch();
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// COMPOSE NOTIFICATION
// ════════════════════════════════════════════════════════════
const ComposeNotification: React.FC<{
  onSuccess: () => void;
  onCancel: () => void;
}> = ({ onSuccess, onCancel }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const [title, setTitle] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [message, setMessage] = useState("");
  const [messageAr, setMessageAr] = useState("");
  const [targetType, setTargetType] = useState<TargetType>("ALL_STUDENTS");
  const [priority, setPriority] = useState<Priority>("NORMAL");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: targets } = useOwnerNotificationTargets();
  const broadcastMutation = useOwnerBroadcastNotification();

  // ✅ FIX: Search with proper enabled check
  const searchEnabled = searchQuery.trim().length >= 2;
  const { data: searchResultsRaw, isFetching: isSearching } =
    useOwnerSearchStudents(searchEnabled ? searchQuery.trim() : "", targetType);

  // ✅ FIX: Normalize to always get an array
  const searchResults = useMemo(
    () => normalizeSearchResults(searchResultsRaw),
    [searchResultsRaw],
  );

  const isSpecific =
    targetType === "SPECIFIC_STUDENTS" ||
    targetType === "SPECIFIC_TEACHERS" ||
    targetType === "SPECIFIC_ADMINS";

  const handleSubmit = async () => {
    if (!title.trim() || !message.trim()) return;

    const payload: OwnerNotificationPayload = {
      title: title.trim(),
      title_ar: titleAr.trim() || undefined,
      message: message.trim(),
      message_ar: messageAr.trim() || undefined,
      target_type: targetType,
      priority,
      ...(targetType === "GROUP" && { group_id: selectedGroupId }),
      ...(targetType === "COURSE" && { course_id: selectedCourseId }),
      ...(isSpecific && { user_ids: selectedUsers.map((u) => u.user_id) }),
    };

    broadcastMutation.mutate(payload, { onSuccess: () => onSuccess() });
  };

  const addUser = (user: SelectedUser) => {
    if (!selectedUsers.find((u) => u.user_id === user.user_id)) {
      setSelectedUsers((prev) => [...prev, user]);
    }
    setSearchQuery("");
  };

  const removeUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.user_id !== userId));
  };

  const canSubmit =
    title.trim() &&
    message.trim() &&
    (targetType === "GROUP" ? !!selectedGroupId : true) &&
    (targetType === "COURSE" ? !!selectedCourseId : true) &&
    (isSpecific ? selectedUsers.length > 0 : true);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden shadow-sm">
        {/* ─── Target Type Selection ─── */}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-700">
          <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
            {t("notifications.target", "Target Audience")}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {(Object.keys(TARGET_CONFIG) as TargetType[]).map((type) => {
              const config = TARGET_CONFIG[type];
              const isActive = targetType === type;
              return (
                <button
                  key={type}
                  onClick={() => {
                    setTargetType(type);
                    setSelectedUsers([]);
                    setSelectedCourseId("");
                    setSelectedGroupId("");
                    setSearchQuery("");
                  }}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center ${
                    isActive
                      ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300"
                      : "border-zinc-200 dark:border-zinc-600 hover:border-zinc-300 dark:hover:border-zinc-500 text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  <span
                    className={
                      isActive
                        ? "text-teal-600 dark:text-teal-400"
                        : "text-zinc-400 dark:text-zinc-500"
                    }
                  >
                    {config.icon}
                  </span>
                  <span className="text-xs font-medium leading-tight">
                    {config.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Group selector */}
          {targetType === "GROUP" && targets?.groups && (
            <div className="mt-4">
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">
                  {t("notifications.select_group", "Select a group...")}
                </option>
                {targets.groups.map((g: any) => (
                  <option key={g.group_id} value={g.group_id}>
                    {g.name}{" "}
                    {g.course?.course_name ? `(${g.course.course_name})` : ""} —{" "}
                    {g.student_count} {t("notifications.students", "students")}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Course selector */}
          {targetType === "COURSE" && targets?.courses && (
            <div className="mt-4">
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">
                  {t("notifications.select_course", "Select a course...")}
                </option>
                {targets.courses.map((c: any) => (
                  <option key={c.course_id} value={c.course_id}>
                    {c.course_name} ({c.course_code}) — {c.student_count}{" "}
                    {t("notifications.students", "students")}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Specific user search */}
          {isSpecific && (
            <div className="mt-4">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute top-3 left-3 text-zinc-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t(
                    "notifications.search_users",
                    "Search by name or email (min 2 chars)...",
                  )}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
                {isSearching && (
                  <Loader2
                    size={16}
                    className="absolute top-3 right-3 text-teal-500 animate-spin"
                  />
                )}
              </div>

              {/* ✅ FIXED: Search Results using normalized data */}
              {searchEnabled && searchResults.length > 0 && (
                <div className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 divide-y divide-zinc-100 dark:divide-zinc-600">
                  {searchResults
                    .filter(
                      (s: any) =>
                        !selectedUsers.find((u) => u.user_id === s.user_id),
                    )
                    .map((student: any) => (
                      <button
                        key={student.user_id}
                        onClick={() =>
                          addUser({
                            user_id: student.user_id,
                            first_name: student.first_name,
                            last_name: student.last_name,
                            email: student.email,
                          })
                        }
                        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-600 transition-colors text-left"
                      >
                        <div>
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                            {student.first_name} {student.last_name}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {student.email}
                          </p>
                        </div>
                        <Plus
                          size={16}
                          className="text-teal-600 dark:text-teal-400"
                        />
                      </button>
                    ))}
                </div>
              )}

              {/* No results */}
              {searchEnabled && !isSearching && searchResults.length === 0 && (
                <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500 px-1">
                  {t(
                    "notifications.no_results",
                    "No users found matching your search",
                  )}
                </p>
              )}

              {/* Selected chips */}
              {selectedUsers.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedUsers.map((user) => (
                    <span
                      key={user.user_id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-sm font-medium"
                    >
                      {user.first_name} {user.last_name}
                      <button
                        onClick={() => removeUser(user.user_id)}
                        className="hover:text-red-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── Priority ─── */}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-700">
          <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
            {t("notifications.priority", "Priority")}
          </label>
          <div className="flex flex-wrap gap-2">
            {(["LOW", "NORMAL", "HIGH", "URGENT"] as Priority[]).map((p) => {
              const config = PRIORITY_CONFIG[p];
              const isActive = priority === p;
              return (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                    isActive
                      ? `${config.bg} ${config.color} border-current`
                      : "border-zinc-200 dark:border-zinc-600 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300"
                  }`}
                >
                  {config.icon}
                  {config.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Message Content ─── */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                {t("notifications.title_en", "Title (English/French)")} *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t(
                  "notifications.title_placeholder",
                  "Notification title...",
                )}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                maxLength={200}
              />
              <p className="text-xs text-zinc-400 mt-1">{title.length}/200</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                {t("notifications.title_ar", "Title (Arabic)")}
              </label>
              <input
                type="text"
                value={titleAr}
                onChange={(e) => setTitleAr(e.target.value)}
                placeholder="عنوان الإشعار..."
                dir="rtl"
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                maxLength={200}
              />
              <p className="text-xs text-zinc-400 mt-1 text-right">
                {titleAr.length}/200
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                {t("notifications.message_en", "Message (English/French)")} *
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t(
                  "notifications.message_placeholder",
                  "Write your notification message...",
                )}
                rows={5}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                maxLength={2000}
              />
              <p className="text-xs text-zinc-400 mt-1">
                {message.length}/2000
              </p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                {t("notifications.message_ar", "Message (Arabic)")}
              </label>
              <textarea
                value={messageAr}
                onChange={(e) => setMessageAr(e.target.value)}
                placeholder="اكتب رسالة الإشعار..."
                dir="rtl"
                rows={5}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                maxLength={2000}
              />
              <p className="text-xs text-zinc-400 mt-1 text-right">
                {messageAr.length}/2000
              </p>
            </div>
          </div>
        </div>

        {/* ─── Actions ─── */}
        <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            <span className="font-medium">
              {TARGET_CONFIG[targetType].label}
            </span>
            {targetType === "GROUP" && selectedGroupId && (
              <span className="ml-1">
                →{" "}
                {
                  targets?.groups?.find(
                    (g: any) => g.group_id === selectedGroupId,
                  )?.name
                }
              </span>
            )}
            {targetType === "COURSE" && selectedCourseId && (
              <span className="ml-1">
                →{" "}
                {
                  targets?.courses?.find(
                    (c: any) => c.course_id === selectedCourseId,
                  )?.course_name
                }
              </span>
            )}
            {isSpecific && selectedUsers.length > 0 && (
              <span className="ml-1">
                → {selectedUsers.length}{" "}
                {t("notifications.recipients", "recipients")}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-600 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 font-medium transition-colors"
            >
              {t("common.cancel", "Cancel")}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || broadcastMutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-600 text-white rounded-xl font-medium transition-colors shadow-sm disabled:cursor-not-allowed"
            >
              {broadcastMutation.isPending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
              {t("notifications.send", "Send")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// NOTIFICATION LIST
// ════════════════════════════════════════════════════════════
const NotificationList: React.FC<{
  notifications: any[];
  meta: any;
  isLoading: boolean;
  page: number;
  onPageChange: (page: number) => void;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({
  notifications,
  meta,
  isLoading,
  page,
  onPageChange,
  onView,
  onDelete,
}) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const deleteMutation = useOwnerDeleteNotification();

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      window.confirm(
        t("notifications.confirm_delete", "Delete this notification?"),
      )
    ) {
      deleteMutation.mutate(id, { onSuccess: () => onDelete(id) });
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return t("notifications.just_now", "Just now");
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString(isRtl ? "ar-DZ" : "en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-teal-600" />
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
          <Bell size={28} className="text-zinc-400" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
          {t("notifications.empty", "No notifications yet")}
        </h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {t(
            "notifications.empty_desc",
            "Start by sending your first notification",
          )}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notif: any, index: number) => {
        const priorityConf =
          PRIORITY_CONFIG[(notif.priority as Priority) || "NORMAL"];
        const readRate =
          notif.total_recipients > 0
            ? Math.round((notif.read_count / notif.total_recipients) * 100)
            : 0;

        return (
          <motion.div
            key={notif.notification_id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            onClick={() => onView(notif.notification_id)}
            className="group bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 p-4 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-600 transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${priorityConf.bg} ${priorityConf.color}`}
                  >
                    {priorityConf.icon}
                    {priorityConf.label}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                    {TARGET_CONFIG[notif.target_type as TargetType]?.icon ||
                      TARGET_CONFIG["ALL_STUDENTS"].icon}
                    {TARGET_CONFIG[notif.target_type as TargetType]?.label ||
                      notif.target_type}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {formatDate(notif.created_at)}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {isRtl && notif.title_ar ? notif.title_ar : notif.title}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                  {isRtl && notif.message_ar ? notif.message_ar : notif.message}
                </p>

                <div className="flex flex-wrap items-center gap-4 mt-2.5">
                  <span className="text-xs text-zinc-500 flex items-center gap-1">
                    <Users size={13} />
                    {notif.total_recipients}{" "}
                    {t("notifications.recipients", "recipients")}
                  </span>
                  <span className="text-xs flex items-center gap-1.5">
                    <div className="w-16 h-1.5 bg-zinc-200 dark:bg-zinc-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-500 rounded-full transition-all"
                        style={{ width: `${readRate}%` }}
                      />
                    </div>
                    <span className="text-zinc-500">{readRate}% read</span>
                  </span>
                  {notif.course && (
                    <span className="text-xs text-zinc-400 flex items-center gap-1">
                      <BookOpen size={13} />
                      {notif.course.course_name}
                    </span>
                  )}
                  {notif.group && (
                    <span className="text-xs text-zinc-400 flex items-center gap-1">
                      <Users size={13} />
                      {notif.group.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(notif.notification_id);
                  }}
                  className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 transition-colors"
                  title="View"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={(e) => handleDelete(notif.notification_id, e)}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-500 hover:text-red-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}

      {meta && meta.pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-600 disabled:opacity-30 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm text-zinc-600 dark:text-zinc-300 px-3">
            {page} / {meta.pages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= meta.pages}
            className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-600 disabled:opacity-30 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// NOTIFICATION DETAIL
// ════════════════════════════════════════════════════════════
const NotificationDetail: React.FC<{
  notificationId: string;
  onBack: () => void;
  onDeleted: () => void;
}> = ({ notificationId, onBack, onDeleted }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const { data: notification, isLoading } =
    useOwnerNotificationDetail(notificationId);
  const deleteMutation = useOwnerDeleteNotification();

  const handleDelete = () => {
    if (
      window.confirm(
        t("notifications.confirm_delete", "Delete this notification?"),
      )
    ) {
      deleteMutation.mutate(notificationId, { onSuccess: () => onDeleted() });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-teal-600" />
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-500">
          {t("notifications.not_found", "Notification not found")}
        </p>
      </div>
    );
  }

  const priorityConf =
    PRIORITY_CONFIG[(notification.priority as Priority) || "NORMAL"];
  const totalRecipients = notification.recipients?.length || 0;
  const readCount =
    notification.recipients?.filter((r: any) => r.is_read).length || 0;
  const readRate =
    totalRecipients > 0 ? Math.round((readCount / totalRecipients) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden shadow-sm">
        <div className="p-6">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${priorityConf.bg} ${priorityConf.color}`}
            >
              {priorityConf.icon}
              {priorityConf.label}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
              {TARGET_CONFIG[notification.target_type as TargetType]?.icon}
              {TARGET_CONFIG[notification.target_type as TargetType]?.label ||
                notification.target_type}
            </span>
            {notification.course && (
              <span className="text-xs text-zinc-500 flex items-center gap-1">
                <BookOpen size={13} />
                {notification.course.course_name}
              </span>
            )}
            {notification.group && (
              <span className="text-xs text-zinc-500 flex items-center gap-1">
                <Users size={13} />
                {notification.group.name}
              </span>
            )}
          </div>

          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
            {notification.title}
          </h2>
          {notification.title_ar && (
            <h3
              className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-3"
              dir="rtl"
            >
              {notification.title_ar}
            </h3>
          )}

          <div className="bg-zinc-50 dark:bg-zinc-700/50 rounded-xl p-4 mb-3">
            <p className="text-sm text-zinc-700 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
              {notification.message}
            </p>
          </div>
          {notification.message_ar && (
            <div
              className="bg-zinc-50 dark:bg-zinc-700/50 rounded-xl p-4"
              dir="rtl"
            >
              <p className="text-sm text-zinc-700 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
                {notification.message_ar}
              </p>
            </div>
          )}

          <div className="flex items-center gap-4 mt-4 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <Clock size={13} />
              {new Date(notification.created_at).toLocaleString(
                isRtl ? "ar-DZ" : "en-US",
              )}
            </span>
          </div>
        </div>

        <div className="px-6 py-4 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-zinc-500 mb-0.5">
                {t("notifications.total_sent", "Total Sent")}
              </p>
              <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {totalRecipients}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-0.5">
                {t("notifications.read", "Read")}
              </p>
              <p className="text-lg font-bold text-teal-600 dark:text-teal-400">
                {readCount}
              </p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-0.5">
                {t("notifications.read_rate", "Read Rate")}
              </p>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-zinc-200 dark:bg-zinc-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full"
                    style={{ width: `${readRate}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                  {readRate}%
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium text-sm transition-colors"
          >
            {deleteMutation.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
            {t("common.delete", "Delete")}
          </button>
        </div>
      </div>

      {/* Recipients */}
      <div className="bg-white dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-100 dark:border-zinc-700">
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
            <Users size={16} />
            {t("notifications.recipients_list", "Recipients")} (
            {totalRecipients})
          </h3>
        </div>
        <div className="max-h-80 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-700">
          {notification.recipients?.map((r: any) => {
            const name =
              r.user?.student?.first_name && r.user?.student?.last_name
                ? `${r.user.student.first_name} ${r.user.student.last_name}`
                : r.user?.teacher?.first_name && r.user?.teacher?.last_name
                  ? `${r.user.teacher.first_name} ${r.user.teacher.last_name}`
                  : r.user?.email || "Unknown";

            return (
              <div
                key={r.recipient_id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  {r.user?.google_avatar ? (
                    <img
                      src={r.user.google_avatar}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-700 dark:text-teal-300 text-xs font-bold">
                      {name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {r.user?.email || ""}{" "}
                      {r.user?.role && (
                        <span className="ml-1 px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-700 text-zinc-500 text-[10px] uppercase">
                          {r.user.role}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    r.is_read
                      ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                      : "bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  {r.is_read
                    ? `✓ ${t("notifications.read", "Read")}`
                    : t("notifications.unread", "Unread")}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OwnerNotificationsPage;
