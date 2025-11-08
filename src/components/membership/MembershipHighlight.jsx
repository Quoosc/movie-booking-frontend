// src/components/membership/MembershipHighlight.jsx
import { motion } from "framer-motion";

const cards = [
  {
    id: "cfriend",
    title: "THÀNH VIÊN C'FRIEND",
    btn: "TÌM HIỂU NGAY",
    image:
      "https://api-website.cinestar.com.vn/media/wysiwyg/CMSPage/Member/Desktop519x282_CMember.jpg",
  },
  {
    id: "cvip",
    title: "THÀNH VIÊN C'VIP",
    btn: "TÌM HIỂU NGAY",
    image:
      "https://cdn2.fptshop.com.vn/unsafe/Uploads/images/tin-tuc/148569/Originals/dinh-dang-imax-la-gi-2.jpeg",
  },
];

export default function MembershipHighlight({ onSelect, activeId }) {
  return (
    <section className="relative mt-16">
      <div
        className="
          max-w-7xl mx-auto px-4 py-10
          rounded-3xl overflow-hidden
          bg-gradient-to-r from-[#070018] via-[#090024] to-[#070018]
          border border-white/8
          shadow-[0_18px_55px_rgba(0,0,0,0.85)]
          relative
        "
      >
        {/* film overlay mờ mờ */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-screen bg-[url('https://png.pngtree.com/background/20211215/original/pngtree-film-film-purple-minimalist-film-festival-picture-image_1474584.jpg')] bg-cover bg-center" />
        {/* glow */}
        <div className="pointer-events-none absolute -top-16 left-10 w-40 h-40 bg-[radial-gradient(circle,#7b5cff55,transparent)] blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 right-10 w-48 h-48 bg-[radial-gradient(circle,#43e1ff40,transparent)] blur-2xl" />

        <div className="relative z-10">
          <h2 className="text-center text-[22px] md:text-[26px] font-extrabold tracking-[0.18em] text-white mb-7">
            <span className="bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6] bg-clip-text text-transparent drop-shadow-[0_0_16px_rgba(123,92,255,0.9)]">
              CHƯƠNG TRÌNH THÀNH VIÊN
            </span>
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            {cards.map((c) => {
              const isActive = activeId === c.id;
              return (
                <motion.button
                  key={c.id}
                  onClick={() => onSelect?.(c.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    group relative w-full text-left rounded-2xl overflow-hidden
                    transition-all duration-300
                    bg-[#050014]/95
                    border
                    ${
                      isActive
                        ? "border-[#FFE700] shadow-[0_0_26px_rgba(255,231,0,0.55)]"
                        : "border-white/10 hover:border-[#7b5cff] hover:shadow-[0_0_26px_rgba(123,92,255,0.45)]"
                    }
                  `}
                >
                  {/* Poster */}
                  <div className="h-40 w-full overflow-hidden">
                    <img
                      src={c.image}
                      alt={c.title}
                      className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                    />
                  </div>

                  {/* Content */}
                  <div className="px-5 py-4 flex items-center justify-between gap-3 bg-gradient-to-r from-white/[0.02] via-white/[0.01] to-transparent">
                    <div>
                      <p className="text-[12px] text-[#cbd5ff]/75">
                        Đặc quyền tích điểm, ưu đãi riêng, trải nghiệm tốt hơn.
                      </p>
                      <h3 className="mt-1 text-lg font-extrabold tracking-wide text-white">
                        {c.title}
                      </h3>
                    </div>
                    <div
                      className={`
                        px-4 py-2 rounded-xl text-[10px] font-extrabold
                        bg-gradient-to-r from-[#FFE700] to-[#FFB300]
                        text-[#120815]
                        shadow-[0_4px_14px_rgba(0,0,0,0.7)]
                        whitespace-nowrap
                        group-hover:brightness-105
                      `}
                    >
                      {c.btn}
                    </div>
                  </div>

                  {/* subtle glow bên trong card */}
                  <div className="pointer-events-none absolute -bottom-8 right-4 w-20 h-20 bg-[radial-gradient(circle,#FFE70025,transparent)] blur-xl" />
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
