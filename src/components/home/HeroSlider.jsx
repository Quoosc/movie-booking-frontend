// src/components/home/HeroSlider.jsx
import { useEffect, useState } from "react";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    id: 1,
    image:
      "https://media.lottecinemavn.com/Media/WebAdmin/35faf5f79b8c43fa91450705f57b9b10.png",
    alt: "PREDATOR",
  }, 
  {
    id: 2,
    image:
      "https://media.lottecinemavn.com/Media/WebAdmin/dae8ae8187d847638637ee528362fe86.jpg",
    alt: "TÌNH NGƯỜI DUYÊN MA",
  },
  {
    id: 3,
    image:
      "https://media.lottecinemavn.com/Media/WebAdmin/b8a254a018fc4345bd7869a93a0f37b1.jpg",
    alt: "TÌNH NGƯỜI DUYÊN MA",
  },
  {
    id: 4,
    image:
      "https://media.lottecinemavn.com/Media/WebAdmin/35a10a886e16496aacef84321c63631f.jpg",
    alt: "TRÁI TIM QUÈ QUẶT",
  },
  // {
  //   id: 5,
  //   image:
  //     "https://media.lottecinemavn.com/Media/WebAdmin/35a10a886e16496aacef84321c63631f.jpg",
  //   alt: "PREDATOR 2",
  // },
];

export default function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const [baseRatio, setBaseRatio] = useState(null);

  if (!slides.length) return null;
  const current = slides[index];

  const goTo = (i, dir = 1) => {
    setDirection(dir);
    setIndex((i + slides.length) % slides.length);
  };

  const next = () => goTo(index + 1, 1);
  const prev = () => goTo(index - 1, -1);

  useEffect(() => {
    const timer = setTimeout(() => next(), 30000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

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
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
    exit: (dir) => ({
      opacity: 0,
      x: dir >= 0 ? -40 : 40,
      scale: 1,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    }),
  };

  // ✅ Khi load ảnh id=1 lần đầu -> set ratio cho khung
  const handleImgLoad = (e) => {
    if (baseRatio) return; // đã chốt ratio rồi thì thôi
    if (current.id !== 1) return;

    const w = e.currentTarget.naturalWidth;
    const h = e.currentTarget.naturalHeight;
    if (w && h) setBaseRatio(w / h);
  };

  return (
    <section className="relative z-10 mt-3 md:mt-4 mb-5 md:mb-8">
      <div className="mx-auto px-2 sm:px-4 max-w-7xl">
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-[0_18px_60px_rgba(0,0,0,0.65)]">
          <div
            className="relative w-full"
            style={{ aspectRatio: baseRatio ? `${baseRatio}` : "3 / 1" }}
          >
            <AnimatePresence custom={direction} mode="wait">
              <motion.img
                key={current.id}
                src={current.image}
                alt={current.alt}
                onLoad={handleImgLoad}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </AnimatePresence>

            <div className="absolute inset-0 bg-gradient-to-r from-[#050018]/35 via-transparent to-[#050018]/35 pointer-events-none" />

            <button
              onClick={prev}
              className="hidden md:flex absolute left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/45 border border-white/25 text-white items-center justify-center hover:bg-white/20 transition-all duration-200 z-20"
            >
              <HiOutlineChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={next}
              className="hidden md:flex absolute right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/45 border border-white/25 text-white items-center justify-center hover:bg-white/20 transition-all duration-200 z-20"
            >
              <HiOutlineChevronRight className="w-5 h-5" />
            </button>

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => goTo(i, i > index ? 1 : -1)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    i === index
                      ? "bg-[#ff7af6] w-7 shadow-[0_0_10px_rgba(255,122,246,0.9)]"
                      : "bg-white/35 w-2.5 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
