// src/components/home/HeroSlider.jsx
import { useEffect, useState } from "react";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";

// slide đầu homepage
const slides = [
  {
    id: 1,
    image:
      "https://cdn.galaxycine.vn/media/2025/10/21/predator-2048_1761030066371.jpg",
    alt: "PREDATOR",
  },
  {
    id: 2,
    image:
      "https://cdn.galaxycine.vn/media/2025/11/4/tinh-nguoi-duyen-ma-2048_1762243716787.jpg",
    alt: "TÌNH NGƯỜI DUYÊN MA",
  },
  {
    id: 3,
    image:
      "https://cdn.galaxycine.vn/media/2025/10/30/trai-tim-qq-2048_1761795200071.jpg",
    alt: "TRÁI TIM QUÈ QUẶT",
  },
];

export default function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0); // 1: next, -1: prev

  if (!slides.length) return null;
  const current = slides[index];

  const goTo = (i, dir = 1) => {
    setDirection(dir);
    setIndex((i + slides.length) % slides.length);
  };

  const next = () => goTo(index + 1, 1);
  const prev = () => goTo(index - 1, -1);

  // Auto slide sau 5s (reset mỗi lần đổi slide cho cảm giác tự nhiên)
  useEffect(() => {
    const timer = setTimeout(() => {
      next();
    }, 10000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // Animation variants cho slide
  const slideVariants = {
    enter: (dir) => ({
      opacity: 0,
      x: dir >= 0 ? 40 : -40,
      scale: 1.02,
    }),
    center: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1], // smooth kiểu cinematic
      },
    },
    exit: (dir) => ({
      opacity: 0,
      x: dir >= 0 ? -40 : 40,
      scale: 1.01,
      transition: {
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
      },
    }),
  };

  return (
    <section className="relative z-10 mt-2 md:mt-3 mb-4 md:mb-6">
      <div className="max-w-7xl mx-auto px-4">
        <div
          className="
            relative overflow-hidden
            rounded-3xl
            border border-white/10
            bg-white/5
            shadow-[0_12px_36px_rgba(0,0,0,0.55)]
          "
        >
          <div className="relative h-[150px] sm:h-[210px] md:h-[250px] lg:h-[300px]">
            {/* Slide với hiệu ứng mượt */}
            <AnimatePresence custom={direction} mode="wait">
              <motion.img
                key={current.id}
                src={current.image}
                alt={current.alt}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="
                  absolute inset-0
                  w-full h-full
                  object-cover
                "
              />
            </AnimatePresence>

            {/* Overlay gradient cho hợp theme */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#050018]/40 via-transparent to-[#050018]/40 pointer-events-none" />

            {/* Nút Prev */}
            <button
              onClick={prev}
              className="
                hidden md:flex
                absolute left-4 top-1/2 -translate-y-1/2
                w-9 h-9 rounded-full
                bg-black/45 border border-white/25
                text-white items-center justify-center
                hover:bg-white/20 hover:text-white
                transition-all duration-200
                z-20
              "
            >
              <HiOutlineChevronLeft className="w-5 h-5" />
            </button>

            {/* Nút Next */}
            <button
              onClick={next}
              className="
                hidden md:flex
                absolute right-4 top-1/2 -translate-y-1/2
                w-9 h-9 rounded-full
                bg-black/45 border border-white/25
                text-white items-center justify-center
                hover:bg-white/20 hover:text-white
                transition-all duration-200
                z-20
              "
            >
              <HiOutlineChevronRight className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => goTo(i, i > index ? 1 : -1)}
                  className={`
                    h-2.5 rounded-full transition-all duration-300
                    ${
                      i === index
                        ? "bg-[#ff7af6] w-6 shadow-[0_0_10px_rgba(255,122,246,0.9)]"
                        : "bg-white/35 w-2.5 hover:bg-white/80"
                    }
                  `}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
