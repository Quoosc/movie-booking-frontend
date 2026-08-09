import { useCallback, useEffect, useState } from "react";
import {
  FiBell,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiTrash2,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import {
  deleteNotification,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/api/notificationService";

const PAGE_SIZE = 15;

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 });
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getNotifications({ page, perPage: PAGE_SIZE, unreadOnly });
      setItems(data.items);
      setUnreadCount(data.unreadCount);
      setPagination(data.pagination);
      if (page > data.pagination.lastPage) {
        setPage(Math.max(1, data.pagination.lastPage));
      }
    } catch (requestError) {
      setItems([]);
      setError(requestError?.message || "Không thể tải thông báo lúc này.");
    } finally {
      setLoading(false);
    }
  }, [page, unreadOnly]);

  useEffect(() => { load(); }, [load]);

  const openItem = async (item) => {
    if (!item.isRead) {
      try {
        await markNotificationRead(item.notificationId);
      } catch {
        toast.error("Chưa thể đánh dấu thông báo đã đọc.");
      }
    }
    if (item.actionUrl) navigate(item.actionUrl);
    else load();
  };

  const remove = async (event, id) => {
    event.stopPropagation();
    try {
      await deleteNotification(id);
      await load();
    } catch {
      toast.error("Không thể xóa thông báo. Vui lòng thử lại.");
    }
  };

  const markAllRead = async () => {
    try {
      await markAllNotificationsRead();
      await load();
    } catch {
      toast.error("Không thể đánh dấu tất cả là đã đọc.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#050018] via-[#090526] to-[#050018] text-white">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-10 md:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#43e1ff]">Luôn nắm thông tin</p>
            <h1 className="mt-2 flex items-center gap-3 text-3xl font-black md:text-4xl"><FiBell /> Trung tâm thông báo</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setPage(1); setUnreadOnly((value) => !value); }} className={`rounded-xl border px-3 py-2 text-xs font-bold ${unreadOnly ? "border-[#43e1ff] bg-[#43e1ff]/10" : "border-white/15 bg-white/5"}`}>
              Chưa đọc ({unreadCount})
            </button>
            <button onClick={markAllRead} className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-bold hover:border-[#7b5cff]">
              <FiCheck /> Đọc tất cả
            </button>
          </div>
        </div>

        <section className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
          {loading ? (
            <p className="py-16 text-center text-sm text-white/50">Đang tải thông báo...</p>
          ) : error ? (
            <div className="px-5 py-14 text-center">
              <p className="text-sm text-red-200">{error}</p>
              <button type="button" onClick={load} className="mt-4 rounded-xl border border-red-300/30 px-4 py-2 text-xs font-bold text-red-100 hover:bg-red-400/10">
                Thử lại
              </button>
            </div>
          ) : items.length === 0 ? (
            <p className="py-16 text-center text-sm text-white/50">Không có thông báo phù hợp.</p>
          ) : items.map((item) => (
            <div key={item.notificationId} role="button" tabIndex={0} onClick={() => openItem(item)} onKeyDown={(event) => { if (event.key === "Enter") openItem(item); }} className={`group flex w-full cursor-pointer items-start gap-4 border-b border-white/10 px-5 py-5 text-left transition hover:bg-white/[0.06] ${item.isRead ? "opacity-60" : "bg-[#7b5cff]/10"}`}>
              <span className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${item.isRead ? "bg-white/20" : "bg-[#43e1ff] shadow-[0_0_12px_#43e1ff]"}`} />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black">{item.title}</span>
                <span className="mt-1.5 block text-sm leading-relaxed text-white/60">{item.message}</span>
                <span className="mt-2 block text-[11px] text-white/35">{new Date(item.createdAt).toLocaleString("vi-VN")}</span>
              </span>
              <button type="button" onClick={(event) => remove(event, item.notificationId)} className="rounded-lg p-2 text-white/30 opacity-0 transition hover:bg-red-500/10 hover:text-red-300 group-hover:opacity-100" aria-label="Xóa thông báo"><FiTrash2 /></button>
            </div>
          ))}
        </section>

        {!loading && !error && pagination.total > 0 && (
          <nav className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm" aria-label="Phân trang thông báo">
            <span className="text-white/45">
              Trang {pagination.currentPage}/{pagination.lastPage} · {pagination.total} thông báo
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1}
                className="inline-flex items-center gap-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2 font-semibold hover:border-[#43e1ff] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <FiChevronLeft /> Trước
              </button>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(pagination.lastPage, current + 1))}
                disabled={page >= pagination.lastPage}
                className="inline-flex items-center gap-1 rounded-xl border border-white/15 bg-white/5 px-3 py-2 font-semibold hover:border-[#43e1ff] disabled:cursor-not-allowed disabled:opacity-35"
              >
                Sau <FiChevronRight />
              </button>
            </div>
          </nav>
        )}
      </main>
      <Footer />
    </div>
  );
}
