// src/components/cinema/CinemaTabs.jsx

const TABS = [
  { key: "showing", label: "Phim đang chiếu" },
  { key: "upcoming", label: "Phim sắp chiếu" },
  { key: "special", label: "Suất chiếu đặc biệt" },
];

export default function CinemaTabs({ activeTab, onChange }) {
  return (
    <section className="max-w-7xl mx-auto px-4 mt-6">
      <div
        className="
          inline-flex rounded-full bg-white/[0.03]
          border border-white/12 p-1
          shadow-[0_18px_60px_rgba(0,0,0,0.85)]
        "
      >
        {TABS.map((t) => {
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onChange?.(t.key)}
              className={`
                px-4 md:px-6 py-2 text-[11px] md:text-xs font-extrabold uppercase
                tracking-[0.18em] rounded-full transition-all duration-200
                ${
                  active
                    ? "bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6] text-white shadow-[0_0_20px_rgba(123,92,255,0.8)]"
                    : "text-white/65 hover:text-white hover:bg-white/[0.06]"
                }
              `}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
