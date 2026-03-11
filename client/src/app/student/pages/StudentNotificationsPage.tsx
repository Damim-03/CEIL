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

/* ── Priority config ── */
type PriorityKey = "LOW" | "NORMAL" | "HIGH" | "URGENT";

const PRIORITY: Record<
  PriorityKey,
  {
    cardBg: string;
    cardBorder: string;
    accentBar: string;
    dotUnread: string;
    badge: string;
    icon: typeof Info;
    label: string;
  }
> = {
  LOW: {
    cardBg: "bg-white dark:bg-[#111111]",
    cardBorder: "border-[#E8DDD4]/70 dark:border-[#1E1E1E]",
    accentBar: "from-[#9B8E82]/40 to-[#9B8E82]/10",
    dotUnread: "bg-[#9B8E82]",
    badge: "bg-[#F0EBE5] dark:bg-[#1E1E1E] text-[#9B8E82] dark:text-[#555555]",
    icon: Info,
    label: "Low",
  },
  NORMAL: {
    cardBg: "bg-white dark:bg-[#111111]",
    cardBorder: "border-[#E8DDD4]/70 dark:border-[#1E1E1E]",
    accentBar: "from-[#2B6F5E]/50 to-[#2B6F5E]/10",
    dotUnread: "bg-[#2B6F5E] dark:bg-[#4ADE80]",
    badge:
      "bg-[#2B6F5E]/8 dark:bg-[#4ADE80]/10 text-[#2B6F5E] dark:text-[#4ADE80]",
    icon: Bell,
    label: "Normal",
  },
  HIGH: {
    cardBg: "bg-[#C4A035]/[0.025] dark:bg-[#D4A843]/[0.025]",
    cardBorder: "border-[#C4A035]/25 dark:border-[#D4A843]/20",
    accentBar: "from-[#C4A035] to-[#C4A035]/10",
    dotUnread: "bg-[#C4A035] dark:bg-[#D4A843]",
    badge:
      "bg-[#C4A035]/10 dark:bg-[#D4A843]/10 text-[#C4A035] dark:text-[#D4A843]",
    icon: AlertTriangle,
    label: "High",
  },
  URGENT: {
    cardBg: "bg-red-50/50 dark:bg-red-950/[0.08]",
    cardBorder: "border-red-200/60 dark:border-red-900/25",
    accentBar: "from-red-500 to-red-500/10",
    dotUnread: "bg-red-500",
    badge: "bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400",
    icon: AlertCircle,
    label: "Urgent",
  },
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
    <div className="space-y-5">
      {/* ── Header ── */}
      <div className="relative bg-white dark:bg-[#111111] rounded-2xl border border-[#E8DDD4]/70 dark:border-[#1E1E1E] overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2B6F5E]/40 to-transparent" />
        <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-5 flex-1 min-w-0">
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2B6F5E] to-[#1a4a3a] flex items-center justify-center shadow-lg shadow-[#2B6F5E]/25 dark:shadow-[#2B6F5E]/10">
                <Bell className="w-6 h-6 text-white" />
              </div>
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 shadow-sm">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#1B1B1B] dark:text-[#E8E8E8]">
                Notifications
              </h1>
              <p className="text-sm text-[#9B8E82] dark:text-[#555555] mt-0.5">
                Stay up to date with the latest announcements
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#E8DDD4]/70 dark:border-[#1E1E1E] text-xs font-medium text-[#6B5D4F] dark:text-[#666666] hover:border-[#2B6F5E]/30 dark:hover:border-[#2B6F5E]/30 hover:text-[#2B6F5E] dark:hover:text-[#4ADE80] transition-colors shrink-0"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              {markAllRead.isPending ? "Marking..." : "Mark all as read"}
            </button>
          )}
        </div>
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex gap-1 p-1 bg-[#F0EBE5]/80 dark:bg-[#0D0D0D] rounded-xl w-fit border border-[#E8DDD4]/50 dark:border-[#1A1A1A]">
        {[
          {
            label: "All",
            icon: Inbox,
            active: !unreadOnly,
            onClick: () => {
              setUnreadOnly(false);
              setPage(1);
            },
          },
          {
            label: "Unread",
            icon: Bell,
            active: unreadOnly,
            onClick: () => {
              setUnreadOnly(true);
              setPage(1);
            },
            count: unreadCount,
          },
        ].map((tab) => (
          <button
            key={tab.label}
            onClick={tab.onClick}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold transition-all ${
              tab.active
                ? "bg-white dark:bg-[#111111] text-[#2B6F5E] dark:text-[#4ADE80] shadow-sm dark:shadow-black/30 border border-[#E8DDD4]/60 dark:border-[#1E1E1E]"
                : "text-[#9B8E82] dark:text-[#555555] hover:text-[#6B5D4F] dark:hover:text-[#888888]"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Notification list ── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-7 h-7 border-2 border-[#E8DDD4] dark:border-[#1E1E1E] border-t-[#2B6F5E] dark:border-t-[#4ADE80] rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-[#111111] border border-[#E8DDD4]/70 dark:border-[#1E1E1E] rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-[#F0EBE5] dark:bg-[#1E1E1E] flex items-center justify-center mx-auto mb-4">
            <BellOff className="w-6 h-6 text-[#BEB29E] dark:text-[#444444]" />
          </div>
          <p className="text-sm font-semibold text-[#1B1B1B] dark:text-[#E8E8E8]">
            {unreadOnly ? "No unread notifications" : "No notifications yet"}
          </p>
          <p className="text-xs text-[#9B8E82] dark:text-[#555555] mt-1">
            Notifications will appear here when sent by administration
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {notifications.map((n: any) => {
            const priority = (n.priority as PriorityKey) ?? "NORMAL";
            const style = PRIORITY[priority] ?? PRIORITY.NORMAL;
            const isExpanded = expandedId === n.recipient_id;
            const isUnread = !n.is_read;

            return (
              <div
                key={n.recipient_id}
                onClick={() => handleExpand(n.recipient_id, n.is_read)}
                className={`relative rounded-2xl border overflow-hidden cursor-pointer transition-all duration-200 ${style.cardBg} ${style.cardBorder} ${
                  isUnread
                    ? "shadow-sm dark:shadow-black/20 ring-1 ring-[#2B6F5E]/10 dark:ring-[#4ADE80]/8"
                    : "hover:border-[#D8CDC0]/80 dark:hover:border-[#2A2A2A]"
                }`}
              >
                {/* left accent bar */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b ${style.accentBar}`}
                />

                <div className="pl-4 pr-5 py-4 flex items-start gap-3.5">
                  {/* unread dot */}
                  <div className="pt-1.5 shrink-0 w-4 flex justify-center">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        isUnread
                          ? `${style.dotUnread}`
                          : "bg-[#E8DDD4] dark:bg-[#222222]"
                      }`}
                    />
                  </div>

                  {/* content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* title row */}
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3
                            className={`text-sm leading-snug ${
                              isUnread
                                ? "font-bold text-[#1B1B1B] dark:text-[#E8E8E8]"
                                : "font-medium text-[#4A4A4A] dark:text-[#AAAAAA]"
                            }`}
                          >
                            {n.title_ar || n.title}
                          </h3>
                          {priority !== "NORMAL" && (
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0 ${style.badge}`}
                            >
                              {style.label}
                            </span>
                          )}
                        </div>

                        {/* message preview */}
                        <p
                          className={`text-xs text-[#9B8E82] dark:text-[#666666] leading-relaxed ${
                            isExpanded ? "" : "line-clamp-2"
                          }`}
                        >
                          {n.message_ar || n.message}
                        </p>

                        {/* expanded content */}
                        {isExpanded && (
                          <div className="mt-3 space-y-3">
                            {((n.title_ar && n.title) ||
                              (n.message_ar && n.message)) && (
                              <div className="bg-[#F8F4F0]/80 dark:bg-[#0D0D0D] rounded-xl p-3.5 border border-[#E8DDD4]/60 dark:border-[#1A1A1A]">
                                {n.title_ar && n.title && (
                                  <p className="text-xs font-semibold text-[#4A4A4A] dark:text-[#BBBBBB] mb-1">
                                    {n.title}
                                  </p>
                                )}
                                {n.message_ar && n.message && (
                                  <p className="text-xs text-[#9B8E82] dark:text-[#666666] leading-relaxed">
                                    {n.message}
                                  </p>
                                )}
                              </div>
                            )}

                            <div className="flex flex-wrap items-center gap-2">
                              {n.course && (
                                <span className="flex items-center gap-1 text-[10px] font-medium bg-white dark:bg-[#111111] border border-[#E8DDD4]/70 dark:border-[#1E1E1E] px-2.5 py-1 rounded-lg text-[#6B5D4F] dark:text-[#777777]">
                                  <BookOpen className="w-3 h-3" />
                                  {n.course.course_name}
                                </span>
                              )}
                              {n.group && (
                                <span className="flex items-center gap-1 text-[10px] font-medium bg-white dark:bg-[#111111] border border-[#E8DDD4]/70 dark:border-[#1E1E1E] px-2.5 py-1 rounded-lg text-[#6B5D4F] dark:text-[#777777]">
                                  <Layers className="w-3 h-3" />
                                  {n.group.name}
                                </span>
                              )}
                              {n.is_read && n.read_at && (
                                <span className="text-[10px] text-[#9B8E82] dark:text-[#555555]">
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

                      {/* timestamp */}
                      <span className="flex items-center gap-1 text-[10px] text-[#9B8E82] dark:text-[#555555] whitespace-nowrap shrink-0 mt-0.5">
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

      {/* ── Pagination ── */}
      {meta && meta.pages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-[#111111] border border-[#E8DDD4]/70 dark:border-[#1E1E1E] rounded-xl px-5 py-3">
          <p className="text-[10px] text-[#9B8E82] dark:text-[#555555] font-medium">
            Page {meta.page} of {meta.pages}
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#F0EBE5] dark:hover:bg-[#1A1A1A] disabled:opacity-30 disabled:cursor-not-allowed text-[#6B5D4F] dark:text-[#666666] transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {Array.from(
              { length: Math.min(meta.pages, 5) },
              (_, i) => i + 1,
            ).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-7 h-7 rounded-lg text-[10px] font-bold transition-colors ${
                  page === p
                    ? "bg-[#2B6F5E] dark:bg-[#2B6F5E] text-white"
                    : "text-[#9B8E82] dark:text-[#666666] hover:bg-[#F0EBE5] dark:hover:bg-[#1A1A1A]"
                }`}
              >
                {p}
              </button>
            ))}

            <button
              disabled={page >= meta.pages}
              onClick={() => setPage((p) => p + 1)}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#F0EBE5] dark:hover:bg-[#1A1A1A] disabled:opacity-30 disabled:cursor-not-allowed text-[#6B5D4F] dark:text-[#666666] transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
