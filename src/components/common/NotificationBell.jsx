import { useCallback, useEffect, useRef, useState } from "react";
import { FiBell } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/api/notificationService";

function timeAgo(value) {
  const time = new Date(value).getTime();
  const minutes = Math.floor((Date.now() - time) / 60000);
  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} giờ trước`;
  return new Date(value).toLocaleDateString("vi-VN");
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const data = await getNotifications({ perPage: 6 });
      setItems(data.items);
      setUnreadCount(data.unreadCount);
    } catch {
      setItems([]);
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = window.setInterval(refresh, 60000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  useEffect(() => {
    const close = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const openNotification = async (notification) => {
    if (!notification.isRead) {
      await markNotificationRead(notification.notificationId);
      setUnreadCount((count) => Math.max(0, count - 1));
    }
    setOpen(false);
    if (notification.actionUrl) navigate(notification.actionUrl);
  };

  const markAll = async () => {
    await markAllNotificationsRead();
    setUnreadCount(0);
    setItems((current) => current.map((item) => ({ ...item, isRead: true })));
  };

  return (
    <div ref={rootRef} className="relative">
      <button type="button" onClick={() => { setOpen((value) => !value); if (!open) refresh(); }}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white/75 transition hover:border-[#7b5cff] hover:text-white"
        aria-label={`Thông báo${unreadCount ? `, ${unreadCount} chưa đọc` : ""}`}>
        <FiBell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-pink-500 px-1 text-[10px] font-black text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-3 w-[min(360px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-white/15 bg-[#09051f] shadow-[0_24px_70px_rgba(0,0,0,0.8)]">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <h2 className="text-sm font-black text-white">Thông báo</h2>
            {unreadCount > 0 && <button onClick={markAll} className="text-[11px] font-semibold text-[#43e1ff]">Đọc tất cả</button>}
          </div>
          <div className="max-h-[420px] overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-5 py-10 text-center text-xs text-white/45">Bạn chưa có thông báo.</p>
            ) : items.map((item) => (
              <button key={item.notificationId} onClick={() => openNotification(item)}
                className={`block w-full border-b border-white/8 px-4 py-3 text-left transition hover:bg-white/[0.06] ${item.isRead ? "opacity-60" : "bg-[#7b5cff]/10"}`}>
                <div className="flex items-start gap-3">
                  <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${item.isRead ? "bg-white/20" : "bg-[#43e1ff]"}`} />
                  <span className="min-w-0">
                    <span className="block text-xs font-bold text-white">{item.title}</span>
                    <span className="mt-1 block text-[11px] leading-relaxed text-white/60">{item.message}</span>
                    <span className="mt-1.5 block text-[10px] text-white/35">{timeAgo(item.createdAt)}</span>
                  </span>
                </div>
              </button>
            ))}
          </div>
          <button onClick={() => { setOpen(false); navigate("/account/notifications"); }} className="w-full border-t border-white/10 px-4 py-3 text-xs font-bold text-[#43e1ff] hover:bg-white/5">
            Xem tất cả thông báo
          </button>
        </div>
      )}
    </div>
  );
}
