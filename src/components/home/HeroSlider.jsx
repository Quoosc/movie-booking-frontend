// src/components/home/HeroSlider.jsx
import { useEffect, useState } from "react";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";
import { getPublicHeroSlides } from "@/api/heroSlideService";

const fallbackSlides = [
  {
    heroSlideId: "fallback-1",
    title: "Hero Slide 1",
    imageUrl: "/movies/CINESVERSE1.jpg",
    altText: "PREDATOR",
    sortOrder: 0,
    isActive: true,
  },
  {
    heroSlideId: "fallback-2",
    title: "Hero Slide 2",
    imageUrl: "/movies/CINESVERSE2.jpg",
    altText: "TINH NGUOI DUYEN MA",
    sortOrder: 1,
    isActive: true,
  },
  {
    heroSlideId: "fallback-3",
    title: "Hero Slide 3",
    imageUrl: "/movies/CINESVERSE3.jpg",
    altText: "TINH NGUOI DUYEN MA",
    sortOrder: 2,
    isActive: true,
  },
  {
    heroSlideId: "fallback-4",
    title: "Hero Slide 4",
    imageUrl: "/movies/trai-tim-que-quat-poster.jpg",
    altText: "TRAI TIM QUE QUAT",
    sortOrder: 3,
    isActive: true,
  },
];

export default function HeroSlider() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [baseRatio, setBaseRatio] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadSlides = async () => {
      try {
        setLoading(true);
        const data = await getPublicHeroSlides();
        const list = (Array.isArray(data) ? data : [])
          .filter((item) => item?.imageUrl)
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

        if (!mounted) return;
        setSlides(list.length ? list : fallbackSlides);
      } catch (error) {
        console.error("Load HeroSlide error:", error);
        if (mounted) {
          setSlides(fallbackSlides);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadSlides();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setBaseRatio(null);
    if (!slides.length) {
      setIndex(0);
      return;
    }
    if (index >= slides.length) {
      setIndex(0);
    }
  }, [slides.length, index]);

  const goTo = (i, dir = 1) => {
    if (!slides.length) return;
    setDirection(dir);
    setIndex((i + slides.length) % slides.length);
  };

  const next = () => goTo(index + 1, 1);
  const prev = () => goTo(index - 1, -1);

  useEffect(() => {
    if (slides.length <= 1) return undefined;
    const timer = setTimeout(() => next(), 30000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, slides.length]);

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

  const handleImgLoad = (e) => {
    if (baseRatio) return;

    const w = e.currentTarget.naturalWidth;
    const h = e.currentTarget.naturalHeight;
    if (w && h) setBaseRatio(w / h);
  };

  if (!slides.length) return null;
  const current = slides[index] || slides[0];

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
                key={current.heroSlideId || current.id}
                src={current.imageUrl || current.image}
                alt={
                  current.altText ||
                  current.alt ||
                  current.title ||
                  "Hero Slide"
                }
                onLoad={handleImgLoad}
                onError={(event) => {
                  event.currentTarget.src = "/movies/CINESVERSE1.jpg";
                }}
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
                  key={s.heroSlideId || s.id || i}
                  onClick={() => goTo(i, i > index ? 1 : -1)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${
                    i === index
                      ? "bg-[#ff7af6] w-7 shadow-[0_0_10px_rgba(255,122,246,0.9)]"
                      : "bg-white/35 w-2.5 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>

            {loading ? (
              <div className="absolute top-3 right-3 text-[10px] tracking-[0.12em] uppercase rounded-full bg-black/45 border border-white/20 px-2 py-1 text-white/80">
                syncing
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
