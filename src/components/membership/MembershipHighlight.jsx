// src/components/membership/MembershipHighlight.jsx
import { motion } from "framer-motion";

const cards = [
  {
    id: "cfriend",
    title: "THÀNH VIÊN C'FRIEND",
    description:
      "Đặc quyền tích điểm, ưu đãi riêng, trải nghiệm tốt hơn.",
    btn: "TÌM HIỂU NGAY",
    image: "/movies/logo4.png",
  },
  {
    id: "cvip",
    title: "THÀNH VIÊN C'VIP",
    description:
      "Không gian cao cấp, màn hình lớn và trải nghiệm điện ảnh đỉnh cao.",
    btn: "TÌM HIỂU NGAY",
    image: "/movies/logo5.png",
  },
];

export default function MembershipHighlight({ onSelect, activeId }) {
  return (
    <section className="relative mt-16 px-4">
      <div
        className="
          relative
          max-w-7xl
          mx-auto
          px-4
          md:px-6
          py-8
          md:py-10
          rounded-3xl
          overflow-hidden
          bg-gradient-to-r
          from-[#070018]
          via-[#090024]
          to-[#070018]
          border
          border-white/10
          shadow-[0_18px_55px_rgba(0,0,0,0.85)]
        "
      >
        {/* Background overlay */}
        <div
          className="
            pointer-events-none
            absolute
            inset-0
            opacity-[0.04]
            mix-blend-screen
            bg-[url('/movies/CINESVERSE2.jpg')]
            bg-cover
            bg-center
          "
        />

        {/* Glow nền */}
        <div className="pointer-events-none absolute -top-16 left-10 w-40 h-40 bg-[radial-gradient(circle,#7b5cff55,transparent)] blur-2xl" />

        <div className="pointer-events-none absolute -bottom-10 right-10 w-48 h-48 bg-[radial-gradient(circle,#43e1ff40,transparent)] blur-2xl" />

        <div className="relative z-10">
          {/* Đặt z-index cao để card không đè lên */}
          <h2
            className="
              relative
              z-30
              text-center
              text-[22px]
              md:text-[26px]
              font-extrabold
              tracking-[0.18em]
              mb-8
            "
          >
            <span
              className="
                bg-gradient-to-r
                from-[#43e1ff]
                via-[#7b5cff]
                to-[#ff7af6]
                bg-clip-text
                text-transparent
                drop-shadow-[0_0_16px_rgba(123,92,255,0.9)]
              "
            >
              CHƯƠNG TRÌNH THÀNH VIÊN
            </span>
          </h2>

          <div className="relative z-10 grid gap-6 md:grid-cols-2">
            {cards.map((card) => {
              const isActive = activeId === card.id;

              return (
                <motion.button
                  key={card.id}
                  type="button"
                  onClick={() => onSelect?.(card.id)}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 22,
                  }}
                  className={`
                    group
                    relative
                    w-full
                    text-left
                    rounded-2xl
                    overflow-hidden
                    transition-all
                    duration-300
                    bg-[#050014]/95
                    border
                    ${
                      isActive
                        ? `
                          border-[#FFE700]
                          shadow-[0_0_26px_rgba(255,231,0,0.55)]
                        `
                        : `
                          border-white/10
                          hover:border-[#7b5cff]
                          hover:shadow-[0_0_26px_rgba(123,92,255,0.45)]
                        `
                    }
                  `}
                >
                  {/* Ảnh giữ nguyên toàn bộ tỷ lệ 16:9 */}
                  <div
                    className="
                      relative
                      w-full
                      aspect-video
                      overflow-hidden
                      bg-[#02000b]
                    "
                  >
                    <img
                      src={card.image}
                      alt={card.title}
                      className="
                        w-full
                        h-full
                        object-contain
                        object-center
                        transition-transform
                        duration-500
                        ease-out
                        group-hover:scale-[1.015]
                      "
                    />

                    {/* Gradient nhẹ ở đáy, không làm mờ toàn bộ ảnh */}
                    <div
                      className="
                        pointer-events-none
                        absolute
                        inset-x-0
                        bottom-0
                        h-16
                        bg-gradient-to-t
                        from-[#050014]/70
                        to-transparent
                      "
                    />
                  </div>

                  {/* Nội dung */}
                  <div
                    className="
                      relative
                      z-10
                      flex
                      flex-col
                      sm:flex-row
                      sm:items-center
                      justify-between
                      gap-4
                      px-5
                      py-5
                      bg-gradient-to-r
                      from-white/[0.03]
                      via-white/[0.01]
                      to-transparent
                    "
                  >
                    <div className="min-w-0">
                      <p className="text-xs md:text-sm text-[#cbd5ff]/75 leading-relaxed">
                        {card.description}
                      </p>

                      <h3 className="mt-1.5 text-lg md:text-xl font-extrabold tracking-wide text-white">
                        {card.title}
                      </h3>
                    </div>

                    <div
                      className="
                        shrink-0
                        self-start
                        sm:self-center
                        px-5
                        py-3
                        rounded-xl
                        text-xs
                        font-extrabold
                        bg-gradient-to-r
                        from-[#FFE700]
                        to-[#FFB300]
                        text-[#120815]
                        shadow-[0_4px_14px_rgba(0,0,0,0.7)]
                        whitespace-nowrap
                        transition-all
                        duration-300
                        group-hover:brightness-110
                        group-hover:shadow-[0_0_20px_rgba(255,213,0,0.45)]
                      "
                    >
                      {card.btn}
                    </div>
                  </div>

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
