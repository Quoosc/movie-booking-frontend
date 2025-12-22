// src/components/home/HeroSlider.jsx
import { useEffect, useState } from "react";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    id: 1,
    image:
      "https://media.lottecinemavn.com/Media/WebAdmin/5b652a8e06284aa79ab4be8663074fc3.jpg",
    alt: "PREDATOR",
  }, 
  {
    id: 2,
    image:
      "https://lh3.googleusercontent.com/rd-gg-dl/ABS2GSmSqeKixZVicBQ5XB_bLgsHdNGkkE9cngwZD_eWb269EisEsyqNL8QLWhm92SMjjj0dySbjWx-WLMuv0XT7fdfaYMpCzHbYeH61PkIn0OhZpjpyNR3I-rD1m45kltTfkvRvK19Sc-Ol5h_uLMHh3F6-EAS7813mZ-lEcxLAN6OAw94MERDKVewS8FlUC-PUVDhYQEGVtsTIDbgKSuNbvQ83-Yxumet2I122H70PcSU4How--h9Sex9fjwao7nL2Uulp2YnOF_nPC6Fr8Y0BlA4CKk8WOWJ0_6iN17u5oSde1fIDuIXU_73MJ4cG-pTJ9pwPuC9q6PEtMvqE1FQ2QUooesIAK730EHOH6pt7HsGYqnZRG_KVWjq5juCioYLYDfHm0SBM7TOohnLAqNeKqUY-nje0536k0Cd2SxVF-Z4HqjkhViZUC6R5M_bnbmK78c0JrqcwMtdqSs_H52vtgE8ImGcg5PknJecc69RJU8shSZoNTv4R4XQTezpoev34YpN-HMEyetqH3_KyHYHqALCmynHkbYkYH1V9B-lfzzNmuurBtv4LOFR_5yYtk27m9R2dvBlV8wG6cYQJQllSKcEEJXmupbZ51BbIbKx892az5-3fwSoRAlgfPkY5FwtG2btlvXel38pg40HMrhJngEzHlwMwGouLGlh0D3L4ITE9jJng9Rfq2nPxDvYe4fdNFaXCcmS4zYchsfK0bdlZidyZGT3xVlq5t6luXmPe4Hu2XpRGr11JhYUs4PHSAv4bm8zkH_KZJfjKb_GM6DImzc2J_FEa4lvhkp4lRc2mB2naUQfX1CPNhcrCSwxhcXry8D8mBUmWE0ZYtiGsa9ble5ZZmjmVpatiwpl9YmhsHYBSG39r8kl8g9k0DFVcCS3ajJzh5xAN-D-TK1ORDQ9TVRG-L6c5rYxUrmKlUoWH7ICGJYTTjjDKTn8lxqyq0PopMPFEY0WZUrflcSKyv8Nlr6HRmxWpsjR8lgrFF44vs7TRUah-DNpWTBs70nNhgW23QtVXrKCOK5Gc3giJD1ZLs5jgd3UM6FR13yOyUzBuEYVvBMNTXB8LZvxZDnQ2-53Zi9ifwVrJ-YiH_EM93WyNH_PBfjkiXmM_5o9x-dMw_AfpM6BV4yzaRCl4-Y7K9p6zENOoBlwis1vivymlEe-g39S1PnPmqCsm_ID3SW6q6r3miet0unjdk0RDWA_6rGdE9ScnMWAYlmffUhjYJkIigs2t5AI=s1024-rj",
    alt: "TÌNH NGƯỜI DUYÊN MA",
  },
  {
    id: 3,
    image:
      "https://media.lottecinemavn.com/Media/WebAdmin/26384bcf544142be9ea619a0395de25d.jpg",
    alt: "TÌNH NGƯỜI DUYÊN MA",
  },
  {
    id: 4,
    image:
      "https://media.lottecinemavn.com/Media/WebAdmin/363767d1580e44b38de01266a7c9b8a8.png",
    alt: "TRÁI TIM QUÈ QUẶT",
  },
  {
    id: 5,
    image:
      "https://media.lottecinemavn.com/Media/WebAdmin/e6f1837b83b245d4a6f28ca77e192255.jpg",
    alt: "PREDATOR 2",
  },
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
