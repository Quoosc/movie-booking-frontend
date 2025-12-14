// src/components/promotions/PromoHighlight.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";

const promos = [
  {
    id: 1,
    title: "C'SCHOOL - Vé từ 45K cho HSSV/U22/Giáo viên",
    image: "/movies/CINESVERSE1.jpg",
  },
  {
    id: 2,
    title: "HAPPY HOUR - Suất sớm & khuya chỉ từ 45K",
    image: "/movies/CINESVERSE2.jpg",
  },
  {
    id: 3,
    title: "THỨ 4 HAPPY DAY - Ưu đãi siêu dễ",
    image: "/movies/CINESVERSE3.jpg",
  },
];

export default function PromoHighlight() {
  const [index, setIndex] = useState(0);
  const nav = useNavigate();

  const current = promos[index];

  const next = () => setIndex((i) => (i + 1) % promos.length);
  const prev = () => setIndex((i) => (i - 1 + promos.length) % promos.length);

  return (
    <section className="relative mt-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Title */}
        <h2 className="text-[26px] md:text-[30px] font-extrabold tracking-wide text-white mb-6">
          KHUYẾN MÃI
        </h2>

        {/* Slider wrapper */}
        <div className="relative bg-white/[0.02] border border-white/10 rounded-3xl px-4 py-6 md:px-8 md:py-8 shadow-[0_18px_60px_rgba(0,0,0,0.7)] backdrop-blur-sm">
          {/* Arrows */}
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

          {/* Slider content */}
          <div className="flex flex-col items-center gap-6">
            <div className="w-full flex justify-center">
              <div
                className="
                  w-full md:w-[80%]
                  rounded-2xl
                  overflow-hidden
                  bg-black/40
                  flex items-center justify-center
                "
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={current.id}
                    src={current.image}
                    alt={current.title}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="w-full h-auto object-contain"
                  />
                </AnimatePresence>
              </div>
            </div>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {promos.map((p, i) => (
                <button
                  key={p.id}
                  onClick={() => setIndex(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === index
                      ? "bg-[#ff7af6]"
                      : "bg-white/25 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>

            {/* CTA */}
            <div className="mt-2">
              <button
                onClick={() => nav("/promotions")}
                className="
                  px-8 py-3 rounded-xl
                  bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6]
                  text-white font-extrabold text-sm
                  shadow-[0_10px_28px_rgba(0,0,0,0.8)]
                  hover:shadow-[0_0_26px_rgba(123,92,255,0.9)]
                  hover:scale-[1.02] active:scale-100
                  transition-all
                "
              >
                TẤT CẢ ƯU ĐÃI
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
