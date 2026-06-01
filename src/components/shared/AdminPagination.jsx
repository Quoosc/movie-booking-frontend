// src/components/shared/AdminPagination.jsx

const PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function AdminPagination({
  page,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  const pages = buildPageNumbers(page, totalPages);

  if (totalItems === 0) return null;

  return (
    <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/60">
      {/* Info */}
      <p className="shrink-0">
        Hiển thị{" "}
        <span className="font-semibold text-white/80">{from}–{to}</span>{" "}
        / <span className="font-semibold text-white/80">{totalItems}</span> kết quả
      </p>

      {/* Page buttons */}
      <div className="flex items-center gap-1">
        {/* Prev */}
        <PageBtn
          label="←"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        />

        {pages.map((p, i) =>
          p === "…" ? (
            <span
              key={`ellipsis-${i}`}
              className="px-2 py-1 text-white/30 select-none"
            >
              …
            </span>
          ) : (
            <PageBtn
              key={p}
              label={p}
              active={p === page}
              onClick={() => onPageChange(p)}
            />
          )
        )}

        {/* Next */}
        <PageBtn
          label="→"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        />
      </div>

      {/* Page size */}
      {onPageSizeChange && (
        <select
          value={pageSize}
          onChange={(e) => {
            onPageSizeChange(Number(e.target.value));
            onPageChange(1);
          }}
          className="rounded-xl bg-white/5 border border-white/15 px-2 py-1 text-[11px] text-white/70 focus:outline-none focus:ring-1 focus:ring-violet-400/50"
        >
          {PAGE_SIZE_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s} / trang
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

function PageBtn({ label, active, disabled, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`min-w-[30px] h-[30px] px-2 rounded-xl text-[11px] font-semibold transition-all
        ${
          active
            ? "bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-400 text-white shadow-md shadow-purple-500/40"
            : "bg-white/5 border border-white/15 text-white/70 hover:bg-white/10 hover:text-white"
        }
        ${disabled ? "opacity-30 cursor-not-allowed" : ""}
      `}
    >
      {label}
    </button>
  );
}

function buildPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = [];
  pages.push(1);

  if (current > 3) pages.push("…");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let p = start; p <= end; p++) pages.push(p);

  if (current < total - 2) pages.push("…");

  pages.push(total);
  return pages;
}
