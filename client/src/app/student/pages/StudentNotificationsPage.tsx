/* ===============================================================
   StudentNotificationsPage.tsx
   
   Student Notifications - Inbox style
   ✅ View + Filter + Mark as read + Pagination
   ✅ Imports from UseStudent
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
    bg: "bg-gray-50",
    border: "border-gray-200",
    icon: Info,
    dot: "bg-gray-400",
  },
  NORMAL: {
    bg: "bg-white",
    border: "border-gray-200",
    icon: Bell,
    dot: "bg-blue-500",
  },
  HIGH: {
    bg: "bg-amber-50/50",
    border: "border-amber-200",
    icon: AlertTriangle,
    dot: "bg-amber-500",
  },
  URGENT: {
    bg: "bg-red-50/50",
    border: "border-red-200",
    icon: AlertCircle,
    dot: "bg-red-500",
  },
};

const PRIORITY_LABELS: Record<string, string> = {
  LOW: "Low",
  NORMAL: "Normal",
  HIGH: "High",
  URGENT: "Urgent",
};

const PRIORITY_BADGES: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-600",
  NORMAL: "bg-blue-100 text-blue-700",
  HIGH: "bg-amber-100 text-amber-700",
  URGENT: "bg-red-100 text-red-700",
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
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
              <Bell className="w-5 h-5 text-teal-700" />
            </div>
            Notifications
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Stay up to date with the latest announcements
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <CheckCheck className="w-4 h-4" />
            {markAllRead.isPending ? "Marking..." : "Mark all as read"}
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        <button
          onClick={() => {
            setUnreadOnly(false);
            setPage(1);
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
            !unreadOnly
              ? "bg-white text-teal-700 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
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
              ? "bg-white text-teal-700 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Bell className="w-4 h-4" />
          Unread
          {unreadCount > 0 && (
            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <BellOff className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">
            {unreadOnly ? "No unread notifications" : "No notifications yet"}
          </p>
          <p className="text-gray-400 text-sm mt-1">
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
                    ? "ring-2 ring-teal-500/20 shadow-sm"
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
                          : "bg-gray-200"
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
                                ? "font-bold text-gray-900"
                                : "font-medium text-gray-700"
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
                          className={`text-sm text-gray-500 leading-relaxed ${isExpanded ? "" : "line-clamp-2"}`}
                        >
                          {n.message_ar || n.message}
                        </p>

                        {/* Expanded */}
                        {isExpanded && (
                          <div className="mt-4 space-y-3">
                            {((n.title_ar && n.title) ||
                              (n.message_ar && n.message)) && (
                              <div className="bg-white/60 rounded-xl p-4 border border-gray-100">
                                {n.title_ar && n.title && (
                                  <p className="font-medium text-gray-700 text-sm mb-1">
                                    {n.title}
                                  </p>
                                )}
                                {n.message_ar && n.message && (
                                  <p className="text-gray-500 text-sm leading-relaxed">
                                    {n.message}
                                  </p>
                                )}
                              </div>
                            )}

                            <div className="flex flex-wrap items-center gap-2">
                              {n.course && (
                                <span className="flex items-center gap-1 text-xs bg-white border border-gray-200 px-2.5 py-1 rounded-lg text-gray-600">
                                  <BookOpen className="w-3 h-3" />
                                  {n.course.course_name}
                                </span>
                              )}
                              {n.group && (
                                <span className="flex items-center gap-1 text-xs bg-white border border-gray-200 px-2.5 py-1 rounded-lg text-gray-600">
                                  <Layers className="w-3 h-3" />
                                  {n.group.name}
                                </span>
                              )}
                              {n.is_read && n.read_at && (
                                <span className="text-xs text-gray-400">
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

                      <span className="flex items-center gap-1 text-xs text-gray-400 whitespace-nowrap shrink-0">
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
        <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 px-5 py-3">
          <p className="text-xs text-gray-500">
            Page {meta.page} of {meta.pages}
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
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
                    ? "bg-teal-600 text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              disabled={page >= meta.pages}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
