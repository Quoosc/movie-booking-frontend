// src/components/movies/ReviewSection.jsx
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  deleteMovieReview,
  getMovieReviews,
  reactToReview,
  replyToReview,
  reportMovieReview,
  submitMovieReview,
  updateMovieReview,
} from "@/api/reviewService";
import { uploadFeedbackImage } from "@/api/cloudinaryService";

const REACTIONS = [
  { type: "LIKE", emoji: "👍" },
  { type: "LOVE", emoji: "❤️" },
  { type: "HAHA", emoji: "😂" },
  { type: "WOW",  emoji: "😮" },
  { type: "SAD",  emoji: "😢" },
];
const STAR_LABELS = ["","Tệ hại","Rất tệ","Kém","Không hay","Tạm được","Bình thường","Khá hay","Hay","Rất hay","Tuyệt vời"];
const PAGE_SIZE = 10;

/* ─── Helpers ─── */
function timeAgo(iso) {
  if (!iso) return "";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "Vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} ngày trước`;
  return new Date(iso).toLocaleDateString("vi-VN");
}

function Avatar({ name, url, size = 8 }) {
  const initials = (name || "K").charAt(0).toUpperCase();
  const sz = `w-${size} h-${size}`;
  if (url) return <img src={url} alt={name} className={`${sz} rounded-full object-cover shrink-0`} />;
  return (
    <div className={`${sz} rounded-full bg-gradient-to-br from-[#7b5cff] to-[#43e1ff] flex items-center justify-center text-xs font-bold text-white shrink-0`}>
      {initials}
    </div>
  );
}

/* ─── Reaction hover button ─── */
function ReactionButton({ reactions, myReaction, onReact }) {
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);

  const activeReaction = REACTIONS.find(r => r.type === myReaction);

  const startOpen = () => { clearTimeout(timerRef.current); setOpen(true); };
  const startClose = () => { timerRef.current = setTimeout(() => setOpen(false), 300); };

  // Non-zero reactions to show inline
  const visibleReactions = REACTIONS.filter(r => (reactions[r.type] || 0) > 0);

  return (
    <div className="relative inline-flex items-center gap-2">
      {/* Hover panel */}
      {open && (
        <div
          className="absolute bottom-full left-0 mb-1.5 flex items-center gap-1 px-2 py-1.5 rounded-full bg-white shadow-lg border border-gray-100 z-10"
          onMouseEnter={startOpen}
          onMouseLeave={startClose}
        >
          {REACTIONS.map(({ type, emoji }) => (
            <button key={type} type="button"
              onClick={() => { onReact(type); setOpen(false); }}
              className={`text-xl transition-all hover:scale-125 ${myReaction === type ? "scale-110 drop-shadow-md" : ""}`}
              title={type}
            >{emoji}</button>
          ))}
        </div>
      )}

      {/* Like button */}
      <button
        type="button"
        onMouseEnter={startOpen}
        onMouseLeave={startClose}
        onClick={() => onReact(myReaction || "LIKE")}
        className={`text-xs font-semibold transition-colors ${
          myReaction ? "text-[#7b5cff]" : "text-gray-400 hover:text-gray-600"
        }`}
      >
        {activeReaction ? `${activeReaction.emoji} ${activeReaction.type === "LIKE" ? "Thích" : activeReaction.type === "LOVE" ? "Yêu thích" : activeReaction.type === "HAHA" ? "Haha" : activeReaction.type === "WOW" ? "Wow" : "Buồn"}` : "👍 Thích"}
      </button>

      {/* Inline reaction counts (only those with votes) */}
      {visibleReactions.length > 0 && (
        <div className="flex items-center gap-0.5">
          {visibleReactions.map(({ type, emoji }) => (
            <span key={type} className="inline-flex items-center gap-0.5 text-xs text-gray-500">
              <span>{emoji}</span>
              <span className="tabular-nums">{reactions[type]}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Star components ─── */
function StarDisplay({ rating }) {
  return (
    <span className="inline-flex items-center gap-[1px]">
      {Array.from({ length: 10 }).map((_, i) => (
        <span key={i} className={`text-[11px] ${i < rating ? "text-[#FFE700]" : "text-gray-200"}`}>★</span>
      ))}
      <span className="ml-1 text-[11px] text-gray-400 font-medium">{rating}/10</span>
    </span>
  );
}

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;
  return (
    <div className="flex flex-wrap items-center gap-px">
      {Array.from({ length: 10 }).map((_, i) => {
        const star = i + 1;
        return (
          <button key={i} type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className={`text-2xl transition-all ${star <= active
              ? "text-[#FFE700] scale-110 drop-shadow-[0_0_4px_rgba(255,231,0,0.8)]"
              : "text-gray-300 hover:text-[#FFE700]/60"}`}
          >★</button>
        );
      })}
      {active > 0 && (
        <span className="ml-2 text-xs font-semibold text-[#7b5cff]">{active}/10 — {STAR_LABELS[active]}</span>
      )}
    </div>
  );
}

/* ─── Reply form ─── */
function ReplyForm({ movieId, reviewId, user, onReplied, onCancel }) {
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) { toast.error("Vui lòng nhập nội dung."); return; }
    if (!user && !name.trim()) { toast.error("Vui lòng nhập tên."); return; }
    try {
      setSubmitting(true);
      const reply = await replyToReview(movieId, reviewId, {
        comment: text.trim(),
        ...(name.trim() && { reviewerName: name.trim() }),
      });
      onReplied(reply);
      setText("");
    } catch (err) {
      toast.error(err?.message || "Gửi thất bại.");
    } finally { setSubmitting(false); }
  };

  return (
    <div className="flex gap-2 mt-3">
      <Avatar name={user?.username || user?.fullName || "?"} url={user?.avatarUrl} size={7} />
      <form onSubmit={handleSubmit} className="flex-1 space-y-1.5">
        {!user && (
          <input type="text" placeholder="Tên của bạn" value={name}
            onChange={(e) => setName(e.target.value)} maxLength={80}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#7b5cff]/50"
          />
        )}
        <div className="flex gap-2">
          <input type="text" placeholder="Viết phản hồi..." value={text}
            onChange={(e) => setText(e.target.value)} maxLength={2000} autoFocus
            className="flex-1 rounded-full border border-gray-200 bg-gray-100 px-4 py-2 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#7b5cff]/50"
          />
          <button type="submit" disabled={submitting}
            className="px-4 py-2 rounded-full bg-[#7b5cff] text-white text-xs font-bold disabled:opacity-50 hover:bg-[#6a4de0] transition-colors shrink-0">
            {submitting ? "..." : "Gửi"}
          </button>
          <button type="button" onClick={onCancel}
            className="px-3 py-2 rounded-full border border-gray-200 text-gray-400 text-xs hover:bg-gray-50 shrink-0">
            Huỷ
          </button>
        </div>
      </form>
    </div>
  );
}

const THREAD_CSS = `
  @keyframes cv-fade-down {
    from { opacity:0; transform:translateY(-5px); }
    to   { opacity:1; transform:translateY(0);    }
  }
  .cv-replies { animation: cv-fade-down 0.2s ease-out; }
  .cv-reply-row { margin-top: 8px; }
`;

/* ─── Single comment (works for both top-level and reply) ─── */
function CommentItem({ review, movieId, user, isReply = false, onRefresh }) {
  const [reactions, setReactions] = useState(review.reactions || {});
  const [myReaction, setMyReaction] = useState(review.myReaction || null);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replies, setReplies] = useState(review.replies || []);
  const [isRepliesExpanded, setIsRepliesExpanded] = useState(false);
  const [spoilerRevealed, setSpoilerRevealed] = useState(!review.isSpoiler);
  const [editing, setEditing] = useState(false);
  const [editComment, setEditComment] = useState(review.comment || "");
  const [editRating, setEditRating] = useState(review.rating || 0);
  const [saving, setSaving] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("spam");

  const hasReplies = replies.length > 0;

  const handleReact = async (type) => {
    const prev = { reactions: { ...reactions }, myReaction };
    const isSame = myReaction === type;
    if (isSame) {
      setMyReaction(null);
      setReactions(r => { const n={...r}; if(n[type]>1)n[type]--; else delete n[type]; return n; });
    } else {
      setReactions(r => {
        const n={...r};
        if(myReaction){if(n[myReaction]>1)n[myReaction]--; else delete n[myReaction];}
        n[type]=(n[type]||0)+1; return n;
      });
      setMyReaction(type);
    }
    try {
      const res = await reactToReview(movieId, review.reviewId, type);
      if (res?.counts) setReactions(res.counts);
      if ("myReaction" in (res||{})) setMyReaction(res.myReaction ?? null);
    } catch {
      setReactions(prev.reactions); setMyReaction(prev.myReaction);
    }
  };

  const handleReplied = (newReply) => {
    setReplies(p => [...p, newReply]);
    setShowReplyForm(false);
    setIsRepliesExpanded(true);
  };

  const handleSave = async () => {
    if (!editComment.trim()) return toast.error("Nội dung không được để trống.");
    try {
      setSaving(true);
      await updateMovieReview(movieId, review.reviewId, {
        comment: editComment.trim(),
        ...(!isReply && { rating: editRating }),
        isSpoiler: review.isSpoiler,
      });
      toast.success("Đã cập nhật đánh giá.");
      setEditing(false);
      onRefresh?.();
    } catch (error) {
      toast.error(error?.message || "Không thể cập nhật đánh giá.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Bạn chắc chắn muốn xóa đánh giá này?")) return;
    try {
      await deleteMovieReview(movieId, review.reviewId);
      toast.success("Đã xóa đánh giá.");
      onRefresh?.();
    } catch (error) {
      toast.error(error?.message || "Không thể xóa đánh giá.");
    }
  };

  const handleReport = async () => {
    try {
      await reportMovieReview(movieId, review.reviewId, { reason: reportReason });
      toast.success("Báo cáo đã được gửi tới quản trị viên.");
      setReportOpen(false);
    } catch (error) {
      toast.error(error?.message || "Không thể gửi báo cáo.");
    }
  };

  return (
    <div>
      {/* ── Row: avatar + bubble ── */}
      <div className="flex gap-3">
        <div className="shrink-0">
          <Avatar name={review.reviewerName} url={review.avatarUrl} size={isReply ? 7 : 8} />
        </div>

        <div className="flex-1 min-w-0">
          {/* Bubble */}
          <div className="inline-block max-w-[90%] md:max-w-[75%]">
            <div className={`rounded-2xl px-3 py-2.5 ${isReply ? "bg-gray-100" : "bg-gray-50 border border-gray-100"}`}>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-sm font-semibold text-gray-800">{review.reviewerName || "Khách"}</span>
                {review.verifiedPurchase && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-700">✓ Đã xem tại rạp</span>
                )}
                <span className="text-[10px] text-gray-400">{timeAgo(review.createdAt)}</span>
                {review.editedAt && <span className="text-[9px] italic text-gray-400">đã sửa</span>}
                {!isReply && <StarDisplay rating={review.rating} />}
              </div>
              {editing ? (
                <div className="min-w-[260px] space-y-2">
                  {!isReply && <StarPicker value={editRating} onChange={setEditRating} />}
                  <textarea value={editComment} onChange={(event) => setEditComment(event.target.value)} rows={3}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#7b5cff]" />
                  <div className="flex gap-2">
                    <button type="button" onClick={handleSave} disabled={saving} className="rounded-lg bg-[#7b5cff] px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50">{saving ? "Đang lưu..." : "Lưu"}</button>
                    <button type="button" onClick={() => setEditing(false)} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-500">Hủy</button>
                  </div>
                </div>
              ) : review.isSpoiler && !spoilerRevealed ? (
                <button type="button" onClick={() => setSpoilerRevealed(true)} className="w-full rounded-xl border border-amber-300/50 bg-amber-50 px-4 py-4 text-left text-xs font-semibold text-amber-700">
                  ⚠ Nội dung có tiết lộ phim — nhấn để xem
                </button>
              ) : (
                <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
              )}
            </div>
            {review.imageUrl && (
              <a href={review.imageUrl} target="_blank" rel="noreferrer" className="block mt-1.5">
                <img src={review.imageUrl} alt="attachment"
                  className="max-h-48 rounded-xl object-cover border border-gray-100 hover:opacity-90 transition-opacity" />
              </a>
            )}
          </div>

          {/* Action bar */}
          <div className="flex items-center gap-4 mt-1 ml-1">
            <ReactionButton reactions={reactions} myReaction={myReaction} onReact={handleReact} />
            {!isReply && (
              <button type="button" onClick={() => setShowReplyForm(v => !v)}
                className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors">
                💬 Trả lời
              </button>
            )}
            {review.canEdit && !editing && (
              <>
                <button type="button" onClick={() => setEditing(true)} className="text-xs font-semibold text-gray-400 hover:text-[#7b5cff]">Sửa</button>
                <button type="button" onClick={handleDelete} className="text-xs font-semibold text-gray-400 hover:text-red-500">Xóa</button>
              </>
            )}
            {!review.canEdit && (
              <button type="button" onClick={() => setReportOpen((value) => !value)} className="text-xs text-gray-400 hover:text-red-500">Báo cáo</button>
            )}
          </div>

          {reportOpen && (
            <div className="mt-2 flex max-w-sm items-center gap-2 rounded-xl border border-gray-200 bg-white p-2">
              <select value={reportReason} onChange={(event) => setReportReason(event.target.value)} className="flex-1 rounded-lg border border-gray-200 px-2 py-1.5 text-xs text-gray-700">
                <option value="spam">Spam / quảng cáo</option>
                <option value="spoiler">Không cảnh báo spoiler</option>
                <option value="abuse">Ngôn từ công kích</option>
                <option value="misinformation">Thông tin sai</option>
                <option value="other">Lý do khác</option>
              </select>
              <button type="button" onClick={handleReport} className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-bold text-white">Gửi</button>
            </div>
          )}
        </div>
      </div>

      {/* ── Reply form (nằm ngoài flex row, căn thẳng với content) ── */}
      {!isReply && showReplyForm && (
        <div className="ml-11 mt-2">
          <ReplyForm movieId={movieId} reviewId={review.reviewId} user={user}
            onReplied={handleReplied} onCancel={() => setShowReplyForm(false)} />
        </div>
      )}

      {/* ── Replies (nằm ngoài flex row để thread line căn đúng) ── */}
      {!isReply && hasReplies && (
        <div className="mt-2 ml-11">
          {/* Collapsed */}
          {!isRepliesExpanded && (
            <button type="button" onClick={() => setIsRepliesExpanded(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#7b5cff] hover:text-[#6a4de0] transition-colors">
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#7b5cff]/10 text-[10px]">↓</span>
              Xem thêm {replies.length} phản hồi
            </button>
          )}

          {/* Expanded — cv-replies + cv-reply-row tạo L-shaped thread */}
          {isRepliesExpanded && (
            <div className="cv-replies">
              {replies.map(r => (
                <div key={r.reviewId} className="cv-reply-row">
                  <CommentItem review={r} movieId={movieId} user={user} isReply onRefresh={onRefresh} />
                </div>
              ))}
              <button type="button" onClick={() => setIsRepliesExpanded(false)}
                className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors">
                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-100 text-[10px]">↑</span>
                Ẩn phản hồi
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Pagination ─── */
function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-1.5 pt-3 border-t border-white/10">
      <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}
        className="w-8 h-8 rounded-lg border border-white/20 text-white/60 text-sm disabled:opacity-30 hover:bg-white/10 transition-all">←</button>
      {Array.from({ length: totalPages }).map((_, i) => (
        <button key={i} onClick={() => onPageChange(i + 1)}
          className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${page === i + 1
            ? "bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6] text-white shadow-md"
            : "border border-white/20 text-white/60 hover:bg-white/10"}`}
        >{i + 1}</button>
      ))}
      <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}
        className="w-8 h-8 rounded-lg border border-white/20 text-white/60 text-sm disabled:opacity-30 hover:bg-white/10 transition-all">→</button>
    </div>
  );
}

/* ─── Main ─── */
export default function ReviewSection({ movieId, user }) {
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ average: null, total: 0, distribution: {} });
  const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 });
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("newest");
  const [ratingFilter, setRatingFilter] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [reviewerName, setReviewerName] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const loadReviews = useCallback(async () => {
    try {
      setLoadingReviews(true);
      const data = await getMovieReviews(movieId, {
        page,
        perPage: PAGE_SIZE,
        sort,
        rating: ratingFilter,
        verifiedOnly,
      });
      setReviews(data.items);
      setSummary(data.summary);
      setPagination(data.pagination);
    } catch {
      setReviews([]);
      setSummary({ average: null, total: 0, distribution: {} });
      setPagination({ currentPage: 1, lastPage: 1, total: 0 });
    } finally {
      setLoadingReviews(false);
    }
  }, [movieId, page, ratingFilter, sort, verifiedOnly]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Vui lòng chọn file ảnh."); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Ảnh tối đa 5MB."); return; }
    setImagePreview(URL.createObjectURL(file)); setImageUrl(null);
    try {
      setUploadingImage(true);
      const { attachmentUrl } = await uploadFeedbackImage(file);
      setImageUrl(attachmentUrl);
    } catch { toast.error("Upload ảnh thất bại."); setImagePreview(null); }
    finally { setUploadingImage(false); }
  };

  const removeImage = () => {
    setImagePreview(null); setImageUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { toast.error("Vui lòng chọn số sao."); return; }
    if (!comment.trim()) { toast.error("Vui lòng nhập nội dung."); return; }
    if (!user && !reviewerName.trim()) { toast.error("Vui lòng nhập tên."); return; }
    if (uploadingImage) { toast.error("Đang upload ảnh..."); return; }
    try {
      setSubmitting(true);
      await submitMovieReview(movieId, {
        rating, comment: comment.trim(),
        ...(reviewerName.trim() && { reviewerName: reviewerName.trim() }),
        ...(imageUrl && { imageUrl }),
        isSpoiler,
      });
      setPage(1);
      toast.success("Đánh giá đã được gửi!");
      setRating(0); setComment(""); setReviewerName(""); setIsSpoiler(false); removeImage();
      if (page === 1) loadReviews();
    } catch (err) {
      toast.error(err?.message || "Gửi đánh giá thất bại.");
    } finally { setSubmitting(false); }
  };

  const avgRating = summary.average;

  return (
    <section className="max-w-6xl mx-auto px-4 pb-16 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <h2 className="text-xl md:text-2xl font-extrabold tracking-[0.2em] text-white uppercase">Đánh giá phim</h2>
        {avgRating && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-[#FFE700]">★</span>
            <span className="text-white font-bold text-sm">{avgRating}</span>
            <span className="text-white/50 text-xs">/ 10 ({summary.total})</span>
          </div>
        )}
      </div>

      {/* CSS thread-line — inject một lần */}
      <style>{THREAD_CSS}</style>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-3">
        <select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }}
          className="rounded-xl border border-white/15 bg-[#0c0924] px-3 py-2 text-xs text-white outline-none">
          <option value="newest">Mới nhất</option>
          <option value="helpful">Hữu ích nhất</option>
          <option value="highest">Điểm cao nhất</option>
          <option value="lowest">Điểm thấp nhất</option>
          <option value="oldest">Cũ nhất</option>
        </select>
        <select value={ratingFilter} onChange={(event) => { setRatingFilter(event.target.value); setPage(1); }}
          className="rounded-xl border border-white/15 bg-[#0c0924] px-3 py-2 text-xs text-white outline-none">
          <option value="">Mọi mức điểm</option>
          {Array.from({ length: 10 }).map((_, index) => {
            const value = 10 - index;
            return <option key={value} value={value}>{value}/10 ({summary.distribution?.[value] || 0})</option>;
          })}
        </select>
        <label className="flex items-center gap-2 text-xs text-white/70">
          <input type="checkbox" checked={verifiedOnly} onChange={(event) => { setVerifiedOnly(event.target.checked); setPage(1); }} />
          Chỉ người đã xem tại rạp
        </label>
      </div>

      {/* ── Comment list ── */}
      <div className="rounded-3xl bg-white/10 border border-white/20 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-5 md:p-6 space-y-5">
        {loadingReviews ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-white/15 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-16 w-3/4 rounded-2xl bg-white/10" />
                  <div className="h-3 w-24 rounded-full bg-white/8" />
                </div>
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">🎬</p>
            <p className="text-sm text-white/50">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-white/40">
              Hiển thị {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, pagination.total)} / {pagination.total} đánh giá
            </p>
            <div className="space-y-5">
              {reviews.map(r => (
                <CommentItem key={r.reviewId} review={r} movieId={movieId} user={user} onRefresh={loadReviews} />
              ))}
            </div>
            <Pagination page={page} totalPages={pagination.lastPage} onPageChange={setPage} />
          </>
        )}
      </div>

      {/* ── Review form ── */}
      <div className="rounded-3xl bg-white/95 border border-white/20 p-5 md:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)] space-y-4">
        <h3 className="text-sm font-extrabold tracking-[0.2em] uppercase text-[#1a0033]">Viết đánh giá của bạn</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!user ? (
            <input type="text" placeholder="Tên của bạn" value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)} maxLength={120}
              className="w-full rounded-xl bg-white border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7b5cff]/50 shadow-sm" />
          ) : (
            <p className="text-xs text-gray-500">
              Đánh giá với tư cách: <span className="text-[#7b5cff] font-semibold">{user.fullName || user.username}</span>
            </p>
          )}

          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.15em] mb-2">Xếp hạng</p>
            <StarPicker value={rating} onChange={setRating} />
          </div>

          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.15em] mb-2">Nội dung</p>
            <textarea rows={4} placeholder="Chia sẻ cảm nhận về bộ phim..."
              value={comment} onChange={(e) => setComment(e.target.value)} maxLength={5000}
              className="w-full rounded-xl bg-white border border-gray-200 px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 resize-y focus:outline-none focus:ring-2 focus:ring-[#7b5cff]/50 shadow-sm" />
            <p className="text-right text-[10px] text-gray-400 mt-1">{comment.length}/5000</p>
            <label className="mt-2 flex items-center gap-2 text-xs text-gray-500">
              <input type="checkbox" checked={isSpoiler} onChange={(event) => setIsSpoiler(event.target.checked)} />
              Nội dung có tiết lộ tình tiết phim
            </label>
          </div>

          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.15em] mb-2">Đính kèm ảnh (tuỳ chọn)</p>
            <div className="flex items-center gap-3 flex-wrap">
              <label className="inline-flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl bg-gray-100 border border-gray-200 text-xs text-gray-600 font-medium hover:bg-gray-200 transition-all select-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4-4a3 3 0 014 0l4 4m-4-8a1 1 0 110-2 1 1 0 010 2zm6 8H6a2 2 0 01-2-2V6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2z" />
                </svg>
                {uploadingImage ? "Đang tải..." : "Thêm ảnh"}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                  onChange={handleImageChange} disabled={uploadingImage} />
              </label>

              {imagePreview && (
                <div className="relative inline-block">
                  <img src={imagePreview} alt="preview" className="h-16 w-auto rounded-xl object-cover border border-gray-200" />
                  {uploadingImage && <div className="absolute inset-0 rounded-xl bg-black/40 flex items-center justify-center text-[10px] text-white">...</div>}
                  {!uploadingImage && (
                    <button type="button" onClick={removeImage}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center hover:bg-red-600">✕</button>
                  )}
                </div>
              )}

              <button type="submit" disabled={submitting || uploadingImage}
                className="ml-auto px-7 py-2.5 rounded-xl text-sm font-extrabold uppercase tracking-[0.16em]
                  bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6] text-white
                  shadow-[0_0_18px_rgba(123,92,255,0.7)] hover:brightness-110 hover:-translate-y-[1px]
                  transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                {submitting ? "ĐANG GỬI..." : "BÌNH LUẬN"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
