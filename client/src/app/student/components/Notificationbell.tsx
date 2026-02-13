/* ===============================================================
   NotificationBell.tsx
   
   Notification Bell component for Navbar
   ✅ Imports from UseStudent
   ✅ Unread count with 30s polling
   ✅ Dropdown with recent notifications
=============================================================== */

import { useState, useRef, useEffect } from "react";
import {
  Bell,
  Clock,
  ChevronRight,
  CheckCheck,
  BookOpen,
  Layers,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  useStudentNotifications,
  useStudentUnreadCount,
  useMarkStudentNotificationRead,
  useMarkAllStudentNotificationsRead,
} from "../../../hooks/student/Usestudent";

interface NotificationBellProps {
  /** Path to full notifications page */
  notificationsPath: string;
}

const PRIORITY_DOTS: Record<string, string> = {
  LOW: "bg-gray-400",
  NORMAL: "bg-blue-500",
  HIGH: "bg-amber-500",
  URGENT: "bg-red-500",
};

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Now";
  if (mins < 60) return `${mins}m`;
  if (hrs < 24) return `${hrs}h`;
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
}

export default function NotificationBell({
  notificationsPath,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { data: unreadData } = useStudentUnreadCount();
  const { data: notifData } = useStudentNotifications(1, false);
  const markRead = useMarkStudentNotificationRead();
  const markAllRead = useMarkAllStudentNotificationsRead();

  const unreadCount = unreadData?.unread_count ?? 0;
  const recentNotifications = notifData?.data?.slice(0, 5) ?? [];

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleNotificationClick = (recipientId: string, isRead: boolean) => {
    if (!isRead) markRead.mutate(recipientId);
    setIsOpen(false);
    navigate(notificationsPath);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl hover:bg-[#D8CDC0]/15 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-[#BEB29E]" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[360px] bg-white rounded-2xl border border-gray-200 shadow-xl shadow-black/10 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                className="text-xs text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-[340px] overflow-y-auto">
            {recentNotifications.length === 0 ? (
              <div className="text-center py-10">
                <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No notifications</p>
              </div>
            ) : (
              recentNotifications.map((n: any) => (
                <div
                  key={n.recipient_id}
                  onClick={() =>
                    handleNotificationClick(n.recipient_id, n.is_read)
                  }
                  className={`flex items-start gap-3 px-5 py-3.5 cursor-pointer transition-colors border-b border-gray-50 last:border-b-0 ${
                    !n.is_read
                      ? "bg-teal-50/30 hover:bg-teal-50/50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {/* Dot */}
                  <div className="pt-1.5 shrink-0">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        !n.is_read
                          ? PRIORITY_DOTS[n.priority] || PRIORITY_DOTS.NORMAL
                          : "bg-gray-200"
                      }`}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm line-clamp-1 ${
                        !n.is_read
                          ? "font-semibold text-gray-900"
                          : "text-gray-700"
                      }`}
                    >
                      {n.title_ar || n.title}
                    </p>
                    <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                      {n.message_ar?.slice(0, 80) || n.message?.slice(0, 80)}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(n.created_at)}
                      </span>
                      {n.course && (
                        <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                          <BookOpen className="w-3 h-3" />
                          {n.course.course_name}
                        </span>
                      )}
                      {n.group && (
                        <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                          <Layers className="w-3 h-3" />
                          {n.group.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate(notificationsPath);
              }}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm text-teal-600 hover:bg-teal-50/50 transition-colors font-medium"
            >
              View all notifications
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
