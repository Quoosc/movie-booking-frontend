import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getReviewsForModeration,
  moderateReview,
} from "@/api/adminservice/adminReviewService";

const PAGE_SIZE = 10;

export default function AdminReviewsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [reportedOnly, setReportedOnly] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 });
  const [pendingAction, setPendingAction] = useState(null);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getReviewsForModeration({
        status,
        reportedOnly,
        page,
        perPage: PAGE_SIZE,
      });
      setItems(data.items);
      setPagination(data.pagination);
      if (page > data.pagination.lastPage) {
        setPage(Math.max(1, data.pagination.lastPage));
      }
    } catch (error) {
      toast.error(error?.message || "Không thể tải danh sách đánh giá.");
    } finally {
      setLoading(false);
    }
  }, [page, reportedOnly, status]);

  useEffect(() => {
    load();
  }, [load]);

  const openModeration = (review, nextStatus) => {
    setPendingAction({ review, nextStatus });
    setReason("");
  };

  const closeModeration = () => {
    if (saving) return;
    setPendingAction(null);
    setReason("");
  };

  const submitModeration = async (event) => {
    event.preventDefault();
    const normalizedReason = reason.trim();
    if (normalizedReason.length < 3) {
      toast.warning("Vui lòng nhập lý do xử lý (ít nhất 3 ký tự).");
      return;
    }

    setSaving(true);
    try {
      await moderateReview(
        pendingAction.review.reviewId,
        pendingAction.nextStatus,
        normalizedReason,
      );
      toast.success(
        pendingAction.nextStatus === "HIDDEN"
          ? "Đã ẩn đánh giá và lưu nhật ký."
          : "Đã khôi phục đánh giá và lưu nhật ký.",
      );
      setPendingAction(null);
      setReason("");
      await load();
    } catch (error) {
      toast.error(error?.message || "Không thể cập nhật kiểm duyệt.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-300">Community safety</p>
          <h1 className="mt-2 text-3xl font-black">Kiểm duyệt đánh giá</h1>
          <p className="mt-2 text-sm text-white/55">Xử lý nội dung bị người dùng báo cáo hoặc khôi phục đánh giá đã ẩn.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-white/15 bg-[#0c0924] px-3 py-2.5 text-xs text-white"
          >
            <option value="">Mọi trạng thái</option>
            <option value="PUBLISHED">Đang hiển thị</option>
            <option value="HIDDEN">Đã ẩn</option>
          </select>
          <label className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs text-white/70">
            <input
              type="checkbox"
              checked={reportedOnly}
              onChange={(event) => {
                setReportedOnly(event.target.checked);
                setPage(1);
              }}
            />
            Chỉ nội dung bị báo cáo
          </label>
        </div>
      </div>

      <section className="space-y-3">
        {loading ? (
          <p className="py-14 text-center text-sm text-white/50">Đang tải dữ liệu kiểm duyệt...</p>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 py-14 text-center text-sm text-white/50">Không có đánh giá cần xử lý.</div>
        ) : items.map((review) => (
          <article key={review.reviewId} className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-black text-white">{review.reviewerName}</span>
                  <span className="text-amber-300">★ {review.rating}/10</span>
                  <span className="rounded-full bg-red-500/15 px-2 py-0.5 font-bold text-red-300">{review.reportCount} báo cáo</span>
                  {review.isSpoiler && <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-amber-200">Spoiler</span>}
                </div>
                <p className="mt-2 text-xs font-bold text-cyan-300">{review.movieTitle}</p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-white/75">{review.comment}</p>
                {review.reports?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {review.reports.map((report) => (
                      <span key={report.reportId} title={report.details || ""} className="rounded-lg border border-red-400/20 bg-red-500/10 px-2.5 py-1 text-[10px] text-red-200">
                        {report.reason}{report.details ? `: ${report.details}` : ""}
                      </span>
                    ))}
                  </div>
                )}
                {review.lastModeration && (
                  <div className="mt-4 rounded-xl border border-violet-400/20 bg-violet-400/[0.08] px-3 py-2.5 text-[11px] text-white/60">
                    <p>
                      Lần xử lý gần nhất bởi <span className="font-bold text-violet-200">{review.lastModeration.moderatorName}</span>
                      {review.lastModeration.createdAt && ` · ${new Date(review.lastModeration.createdAt).toLocaleString("vi-VN")}`}
                    </p>
                    <p className="mt-1 text-white/75">Lý do: {review.lastModeration.reason}</p>
                  </div>
                )}
                <p className="mt-3 text-[11px] text-white/35">{new Date(review.createdAt).toLocaleString("vi-VN")}</p>
              </div>
              {review.status === "HIDDEN" ? (
                <button onClick={() => openModeration(review, "PUBLISHED")} className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-xs font-bold text-emerald-300">Khôi phục</button>
              ) : (
                <button onClick={() => openModeration(review, "HIDDEN")} className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-2 text-xs font-bold text-red-300">Ẩn nội dung</button>
              )}
            </div>
          </article>
        ))}
      </section>

      {!loading && pagination.total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-xs text-white/55">
          <span>
            {pagination.total} đánh giá · Trang {pagination.currentPage}/{pagination.lastPage}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded-lg border border-white/15 px-3 py-1.5 font-bold text-white/75 transition hover:border-violet-400/60 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Trang trước
            </button>
            <button
              type="button"
              disabled={page >= pagination.lastPage}
              onClick={() => setPage((current) => Math.min(pagination.lastPage, current + 1))}
              className="rounded-lg border border-white/15 px-3 py-1.5 font-bold text-white/75 transition hover:border-violet-400/60 disabled:cursor-not-allowed disabled:opacity-35"
            >
              Trang sau
            </button>
          </div>
        </div>
      )}

      {pendingAction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="moderation-title">
          <form onSubmit={submitModeration} className="w-full max-w-lg rounded-3xl border border-violet-400/30 bg-[#09051f] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.75)]">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-violet-300">Nhật ký kiểm duyệt</p>
            <h2 id="moderation-title" className="mt-2 text-xl font-black text-white">
              {pendingAction.nextStatus === "HIDDEN" ? "Ẩn đánh giá này?" : "Khôi phục đánh giá này?"}
            </h2>
            <p className="mt-2 text-sm text-white/55">
              Lý do và tài khoản quản trị thực hiện sẽ được lưu để có thể truy vết về sau.
            </p>
            <label className="mt-5 block text-xs font-bold text-white/75" htmlFor="moderation-reason">
              Lý do xử lý
            </label>
            <textarea
              id="moderation-reason"
              autoFocus
              required
              minLength={3}
              maxLength={1000}
              rows={4}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Ví dụ: Nội dung công kích cá nhân, vi phạm quy tắc cộng đồng..."
              className="mt-2 w-full resize-y rounded-xl border border-white/15 bg-[#050018] px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-violet-400"
            />
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" disabled={saving} onClick={closeModeration} className="rounded-xl border border-white/15 px-4 py-2 text-xs font-bold text-white/65 disabled:opacity-50">
                Hủy
              </button>
              <button type="submit" disabled={saving} className={`rounded-xl px-4 py-2 text-xs font-black text-white disabled:opacity-50 ${pendingAction.nextStatus === "HIDDEN" ? "bg-red-500" : "bg-emerald-500"}`}>
                {saving ? "Đang lưu..." : pendingAction.nextStatus === "HIDDEN" ? "Xác nhận ẩn" : "Xác nhận khôi phục"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
