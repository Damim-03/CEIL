/* ===============================================================
   StudentNotificationsPage.tsx
   
   Student Notifications - Inbox style
   ✅ View + Filter + Mark as read + Pagination
   ✅ Imports from UseStudent
   ✅ Dark mode support
=============================================================== */

import { useState } from "react";
import {
  Bell,
  BellOff,
  CheckCheck,
  Clock,
  BookOpen,
  Layers,
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from "lucide-react";

import {
  useStudentNotifications,
  useStudentUnreadCount,
  useMarkStudentNotificationRead,
  useMarkAllStudentNotificationsRead,
} from "../../../hooks/student/Usestudent";

const PRIORITY_STYLES: Record<
  string,
  { bg: string; border: string; icon: typeof Info; dot: string }
> = {
  LOW: {
    bg: "bg-gray-50 dark:bg-[#151515]",
    border: "border-gray-200 dark:border-[#2A2A2A]",
    icon: Info,
    dot: "bg-gray-400 dark:bg-[#555555]",
  },
  NORMAL: {
    bg: "bg-white dark:bg-[#1A1A1A]",
    border: "border-gray-200 dark:border-[#2A2A2A]",
    icon: Bell,
    dot: "bg-blue-500 dark:bg-[#4ADE80]",
  },
  HIGH: {
    bg: "bg-amber-50/50 dark:bg-[#D4A843]/[0.03]",
    border: "border-amber-200 dark:border-[#D4A843]/15",
    icon: AlertTriangle,
    dot: "bg-amber-500 dark:bg-[#D4A843]",
  },
  URGENT: {
    bg: "bg-red-50/50 dark:bg-red-950/20",
    border: "border-red-200 dark:border-red-800/30",
    icon: AlertCircle,
    dot: "bg-red-500 dark:bg-red-400",
  },
};

const PRIORITY_LABELS: Record<string, string> = {
  LOW: "Low",
  NORMAL: "Normal",
  HIGH: "High",
  URGENT: "Urgent",
};

const PRIORITY_BADGES: Record<string, string> = {
  LOW: "bg-gray-100 dark:bg-[#2A2A2A] text-gray-600 dark:text-[#888888]",
  NORMAL: "bg-blue-100 dark:bg-[#4ADE80]/10 text-blue-700 dark:text-[#4ADE80]",
  HIGH: "bg-amber-100 dark:bg-[#D4A843]/10 text-amber-700 dark:text-[#D4A843]",
  URGENT: "bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400",
};

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
}

export default function StudentNotificationsPage() {
  const [page, setPage] = useState(1);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading } = useStudentNotifications(page, unreadOnly);
  const { data: unreadData } = useStudentUnreadCount();
  const markRead = useMarkStudentNotificationRead();
  const markAllRead = useMarkAllStudentNotificationsRead();

  const notifications = data?.data ?? [];
  const meta = data?.meta;
  const unreadCount = unreadData?.unread_count ?? data?.unread_count ?? 0;

  const handleExpand = (recipientId: string, isRead: boolean) => {
    setExpandedId((prev) => (prev === recipientId ? null : recipientId));
    if (!isRead) markRead.mutate(recipientId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-[#E5E5E5] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-[#4ADE80]/[0.08] flex items-center justify-center">
              <Bell className="w-5 h-5 text-teal-700 dark:text-[#4ADE80]" />
            </div>
            Notifications
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-gray-500 dark:text-[#888888] text-sm mt-1">
            Stay up to date with the latest announcements
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#2A2A2A] text-sm text-gray-600 dark:text-[#888888] hover:bg-gray-50 dark:hover:bg-[#222222] transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            {markAllRead.isPending ? "Marking..." : "Mark all as read"}
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-[#151515] rounded-xl w-fit">
        <button
          onClick={() => {
            setUnreadOnly(false);
            setPage(1);
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            !unreadOnly
              ? "bg-white dark:bg-[#1A1A1A] text-teal-700 dark:text-[#4ADE80] shadow-sm dark:shadow-black/20"
              : "text-gray-500 dark:text-[#666666] hover:text-gray-700 dark:hover:text-[#888888]"
          }`}
        >
          <Inbox className="w-4 h-4" />
          All
        </button>
        <button
          onClick={() => {
            setUnreadOnly(true);
            setPage(1);
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            unreadOnly
              ? "bg-white dark:bg-[#1A1A1A] text-teal-700 dark:text-[#4ADE80] shadow-sm dark:shadow-black/20"
              : "text-gray-500 dark:text-[#666666] hover:text-gray-700 dark:hover:text-[#888888]"
          }`}
        >
          <Bell className="w-4 h-4" />
          Unread
          {unreadCount > 0 && (
            <span className="bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-teal-200 dark:border-[#2A2A2A] border-t-teal-600 dark:border-t-[#4ADE80] rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-[#2A2A2A] flex items-center justify-center mx-auto mb-4">
            <BellOff className="w-8 h-8 text-gray-300 dark:text-[#555555]" />
          </div>
          <p className="text-gray-500 dark:text-[#888888] font-medium">
            {unreadOnly ? "No unread notifications" : "No notifications yet"}
          </p>
          <p className="text-gray-400 dark:text-[#666666] text-sm mt-1">
            Notifications will appear here when sent by administration
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n: any) => {
            const style = PRIORITY_STYLES[n.priority] || PRIORITY_STYLES.NORMAL;
            const isExpanded = expandedId === n.recipient_id;

            return (
              <div
                key={n.recipient_id}
                onClick={() => handleExpand(n.recipient_id, n.is_read)}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden cursor-pointer ${
                  style.border
                } ${style.bg} ${
                  !n.is_read
                    ? "ring-2 ring-teal-500/20 dark:ring-[#4ADE80]/20 shadow-sm dark:shadow-black/20"
                    : "opacity-90 hover:opacity-100"
                }`}
              >
                <div className="flex items-start gap-4 p-5">
                  {/* Unread dot */}
                  <div className="pt-1.5 shrink-0">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        !n.is_read
                          ? `${style.dot} animate-pulse`
                          : "bg-gray-200 dark:bg-[#2A2A2A]"
                      }`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <h3
                            className={`text-sm line-clamp-1 ${
                              !n.is_read
                                ? "font-bold text-gray-900 dark:text-[#E5E5E5]"
                                : "font-medium text-gray-700 dark:text-[#BBBBBB]"
                            }`}
                          >
                            {n.title_ar || n.title}
                          </h3>
                          {n.priority !== "NORMAL" && (
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                                PRIORITY_BADGES[n.priority]
                              }`}
                            >
                              {PRIORITY_LABELS[n.priority]}
                            </span>
                          )}
                        </div>

                        <p
                          className={`text-sm text-gray-500 dark:text-[#888888] leading-relaxed ${isExpanded ? "" : "line-clamp-2"}`}
                        >
                          {n.message_ar || n.message}
                        </p>

                        {/* Expanded */}
                        {isExpanded && (
                          <div className="mt-4 space-y-3">
                            {((n.title_ar && n.title) ||
                              (n.message_ar && n.message)) && (
                              <div className="bg-white/60 dark:bg-[#222222]/60 rounded-xl p-4 border border-gray-100 dark:border-[#2A2A2A]">
                                {n.title_ar && n.title && (
                                  <p className="font-medium text-gray-700 dark:text-[#BBBBBB] text-sm mb-1">
                                    {n.title}
                                  </p>
                                )}
                                {n.message_ar && n.message && (
                                  <p className="text-gray-500 dark:text-[#888888] text-sm leading-relaxed">
                                    {n.message}
                                  </p>
                                )}
                              </div>
                            )}

                            <div className="flex flex-wrap items-center gap-2">
                              {n.course && (
                                <span className="flex items-center gap-1 text-xs bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] px-2.5 py-1 rounded-lg text-gray-600 dark:text-[#888888]">
                                  <BookOpen className="w-3 h-3" />
                                  {n.course.course_name}
                                </span>
                              )}
                              {n.group && (
                                <span className="flex items-center gap-1 text-xs bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#2A2A2A] px-2.5 py-1 rounded-lg text-gray-600 dark:text-[#888888]">
                                  <Layers className="w-3 h-3" />
                                  {n.group.name}
                                </span>
                              )}
                              {n.is_read && n.read_at && (
                                <span className="text-xs text-gray-400 dark:text-[#666666]">
                                  Read on{" "}
                                  {new Date(n.read_at).toLocaleDateString(
                                    "en-US",
                                    {
                                      day: "numeric",
                                      month: "short",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-[#666666] whitespace-nowrap shrink-0">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(n.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.pages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#2A2A2A] px-5 py-3">
          <p className="text-xs text-gray-500 dark:text-[#888888]">
            Page {meta.page} of {meta.pages}
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#222222] disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 dark:text-[#888888]"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from(
              { length: Math.min(meta.pages, 5) },
              (_, i) => i + 1,
            ).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                  page === p
                    ? "bg-teal-600 dark:bg-[#4ADE80] text-white dark:text-[#0F0F0F]"
                    : "text-gray-500 dark:text-[#888888] hover:bg-gray-100 dark:hover:bg-[#222222]"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              disabled={page >= meta.pages}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#222222] disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 dark:text-[#888888]"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
