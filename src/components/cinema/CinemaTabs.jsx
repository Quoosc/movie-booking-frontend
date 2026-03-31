// src/components/cinema/CinemaTabs.jsx

const TABS = [
  { key: "showing", label: "Phim đang chiếu" },
  { key: "upcoming", label: "Phim sắp chiếu" },
  { key: "special", label: "Suất chiếu đặc biệt" },
  { key: "pricing", label: "Bảng giá vé" },
];

export default function CinemaTabs({ activeTab, onChange }) {
  return (
    <section className="max-w-7xl mx-auto px-4 mt-2 md:mt-3">
      <div
        className="
          w-full overflow-hidden rounded-[12px]
          border border-white/10
          bg-gradient-to-r from-[#2d2558] via-[#08183f] to-[#233f73]
          shadow-[0_18px_60px_rgba(0,0,0,0.75)]
          grid grid-cols-2 md:grid-cols-4
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
                relative px-3 md:px-6 py-4 md:py-5 text-[11px] md:text-[16px]
                font-black uppercase tracking-[0.04em] md:tracking-[0.02em]
                transition-all duration-200 border-r border-white/10
                last:border-r-0
                ${
                  active
                    ? "text-white bg-gradient-to-r from-[#43e1ff]/20 via-[#7b5cff]/30 to-[#ff7af6]/20"
                    : "text-white/85 hover:text-white hover:bg-white/[0.04]"
                }
              `}
            >
              {t.label}
              {active ? (
                <span className="absolute bottom-0 left-0 h-[4px] w-full bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6]" />
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
