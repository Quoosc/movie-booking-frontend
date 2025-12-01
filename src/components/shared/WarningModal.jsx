export default function WarningModal({
  open,
  title = "Lưu ý!",
  message = "",
  onCancel,
  onConfirm,
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[90%] max-w-md rounded-3xl bg-gradient-to-r from-[#4f46e5] via-[#7b5cff] to-[#ec4899] p-[1px] shadow-[0_30px_80px_rgba(0,0,0,0.95)]">
        <div className="rounded-3xl bg-[#050018]/95 px-6 py-6 text-center">
          <h3 className="text-[13px] sm:text-[14px] font-extrabold tracking-[0.28em] text-white uppercase mb-2">
            {title}
          </h3>
          <p className="text-xs sm:text-[13px] text-white/80 mb-6 leading-relaxed">
            {message}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={onCancel}
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-[11px] sm:text-[12px] font-extrabold tracking-[0.2em] uppercase border border-white/20 text-white bg-white/5 hover:bg-white/10 transition-all"
            >
              Hủy
            </button>
            {typeof onConfirm === "function" && (
              <button
                onClick={onConfirm}
                className="inline-flex items-center justify-center px-8 py-2.5 rounded-full text-[11px] sm:text-[12px] font-extrabold tracking-[0.2em] uppercase bg-gradient-to-r from-[#ffe700] to-[#facc15] text-black shadow-[0_0_18px_rgba(255,231,0,0.95)] hover:brightness-110 transition-all"
              >
                Xác nhận
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
