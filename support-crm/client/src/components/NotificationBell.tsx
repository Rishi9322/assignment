import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from "../hooks/useNotifications";
import { formatDate } from "../utils/date";
import type { NotificationItem } from "../types/notification";

export const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClick = (n: NotificationItem) => {
    if (!n.read) markRead.mutate(n.id);
    setOpen(false);
    if (n.ticket_id) navigate(`/tickets/${n.ticket_id}`);
  };

  const unreadCount = data?.unread_count ?? 0;

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-md p-2 text-ink-secondary hover:bg-surface-alt hover:text-ink"
        aria-label="Notifications"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.75}
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-medium text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-80 rounded-md border border-line bg-surface shadow-lg">
          <div className="flex items-center justify-between border-b border-line px-3 py-2">
            <span className="text-sm font-semibold text-ink">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                className="text-xs font-medium text-accent hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {(!data || data.notifications.length === 0) && (
              <p className="px-3 py-6 text-center text-sm text-ink-secondary">
                No notifications yet.
              </p>
            )}
            {data?.notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={`block w-full border-b border-line px-3 py-2.5 text-left text-sm last:border-b-0 hover:bg-surface-alt ${
                  n.read ? "text-ink-secondary" : "text-ink"
                }`}
              >
                <div className="flex items-start gap-2">
                  {!n.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />}
                  <div className={n.read ? "" : "ml-0"}>
                    <p className={n.read ? "" : "font-medium"}>{n.message}</p>
                    <p className="mt-0.5 text-xs text-ink-muted">{formatDate(n.created_at)}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
