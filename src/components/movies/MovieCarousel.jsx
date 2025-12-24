// src/components/movies/MovieCarousel.jsx
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import MovieCard from "./MovieCard";

export default function MovieCarousel({ title, movies = [], onShowAll }) {
  const VISIBLE = 4;

  const [startIndex, setStartIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 trái, 1 phải

  const getMovieKey = (m) => m?.movieId || m?.id;

  const maxStart = Math.max(0, movies.length - VISIBLE);

  useEffect(() => {
    setStartIndex(0);
    setDirection(0);
  }, [movies]);

  useEffect(() => {
    if (startIndex > maxStart) setStartIndex(maxStart);
  }, [maxStart, startIndex]);

  const currentMovies = useMemo(
    () => movies.slice(startIndex, startIndex + VISIBLE),
    [movies, startIndex]
  );

  const canPrev = startIndex > 0;
  const canNext = startIndex < maxStart;

  const handleNext = () => {
    if (!canNext) return;
    const next = startIndex + VISIBLE;
    setDirection(1);
    setStartIndex(next > maxStart ? maxStart : next);
  };

  const handlePrev = () => {
    if (!canPrev) return;
    const prev = startIndex - VISIBLE;
    setDirection(-1);
    setStartIndex(prev < 0 ? 0 : prev);
  };

  const slideVariants = {
    initial: (dir) => ({
      x: dir === 0 ? 0 : dir > 0 ? 40 : -40,
      opacity: 0,
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.25, ease: "easeOut" },
    },
  };

  const hasPagination = movies.length > VISIBLE;
  const totalPages = hasPagination
    ? Math.floor((movies.length - 1) / VISIBLE) + 1
    : 1;
  const currentPage = hasPagination ? Math.floor(startIndex / VISIBLE) + 1 : 1;

  return (
    <section className="relative py-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        {/* Title + page indicator */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-3xl md:text-4xl font-extrabold text-white tracking-wide">
            {title}
          </h3>
          {hasPagination && (
            <span className="hidden md:inline-block text-[11px] text-white/60">
              {currentPage}/{totalPages}
            </span>
          )}
        </div>

        <div className="relative">
          {/* Arrow trái */}
          {hasPagination && (
            <button
              onClick={handlePrev}
              disabled={!canPrev}
              className={`hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full border border-white/15 items-center justify-center backdrop-blur
                ${
                  canPrev
                    ? "bg-white/10 hover:bg-white/25 text-white cursor-pointer"
                    : "bg-white/5 text-white/20 cursor-default"
                }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 6L9 12L15 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}

          {/* Arrow phải */}
          {hasPagination && (
            <button
              onClick={handleNext}
              disabled={!canNext}
              className={`hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full border border-white/15 items-center justify-center backdrop-blur
                ${
                  canNext
                    ? "bg-white/10 hover:bg-white/25 text-white cursor-pointer"
                    : "bg-white/5 text-white/20 cursor-default"
                }`}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 6L15 12L9 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}

          {/* Slide phim */}
          <div className="overflow-hidden">
            <motion.div
              key={startIndex}
              custom={direction}
              variants={slideVariants}
              initial="initial"
              animate="animate"
              className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6"
 
              style={{ direction: "rtl" }}
            >
              {currentMovies.map((m) => (
            
                <div
                  key={getMovieKey(m)}
                  style={{ direction: "ltr" }}
                  className="text-left"
                >
                  <MovieCard m={m} />
                </div>
              ))}
            </motion.div>
          </div>

          {/* Dots */}
          {hasPagination && (
            <div className="mt-5 flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition ${
                    i + 1 === currentPage
                      ? "bg-[#FFD700]"
                      : "bg-white/25 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>
          )}

          {/* XEM THÊM */}
          {hasPagination && onShowAll && (
            <div className="mt-6 flex items-center justify-center">
              <button
                onClick={onShowAll}
                className="px-6 py-2.5 rounded-lg border border-[#FFD700]/40 bg-[#FFE700] text-[#111] font-extrabold text-xs md:text-sm hover:brightness-95 transition"
              >
                XEM THÊM
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
