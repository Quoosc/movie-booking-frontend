import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import HomeButton from "@/components/shared/Buttons/HomeButton";

const services = [
  {
    id: 1,
    title: "KIDZONE",
    image:
      "https://api-website.cinestar.com.vn/media/entertainment_images/s/e/service-1_1_.png",
  },
  {
    id: 2,
    title: "MÓN NGON",
    image:
      "https://api-website.cinestar.com.vn/media/entertainment_images/r/e/rectangle_3463983_1_.png",
  },
  {
    id: 3,
    title: "BOWLING",
    image:
      "https://api-website.cinestar.com.vn/media/entertainment_images/b/o/bowling-dt-2_1_.png",
  },
  {
    id: 4,
    title: "BILLIARDS",
    image:
      "https://api-website.cinestar.com.vn/media/entertainment_images/b/i/billards-dt-2_1_.png",
  },
  {
    id: 5,
    title: "DALAT OPERA HOUSE",
    image:
      "https://api-website.cinestar.com.vn/media/entertainment_images/o/p/opera-dt-2_1_.png",
  },
  {
    id: 6,
    title: "GYM",
    image:
      "https://api-website.cinestar.com.vn/media/entertainment_images/g/y/gym-dt-2_1_.png",
  },
  {
    id: 7,
    title: "COFFEE",
    image:
      "https://api-website.cinestar.com.vn/media/entertainment_images/c/o/coffee-dt-2_1_.png",
  },
];

export default function EntertainmentServicesPage() {
  const navigate = useNavigate();

  return (
    <div
      className="
        min-h-screen
        bg-gradient-to-b
        from-[#050024] via-[#0b0630] to-[#020015]
        text-white
        relative overflow-hidden
      "
    >
      {/* nền neon nhẹ (giống HomePage) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-[10%] w-[420px] h-[420px] bg-[radial-gradient(circle_at_center,#8a66ff70,transparent)] blur-[110px]" />
        <div className="absolute top-[35%] right-[12%] w-[380px] h-[380px] bg-[radial-gradient(circle_at_center,#55e5ff55,transparent)] blur-[110px]" />
        <div className="absolute bottom-[-40px] left-1/3 w-[520px] h-[260px] bg-[radial-gradient(circle_at_center,#ff92ff40,transparent)] blur-[120px]" />
      </div>

      <Navbar />

      {/* MAIN */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 pt-10 md:pt-12 pb-14">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="space-y-8"
        >
          {/* HEADER + HOME */}
          <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] md:text-xs font-semibold tracking-[0.24em] uppercase text-[#9ca3ff]/80 mb-1">
                DỊCH VỤ GIẢI TRÍ
              </p>

              <h1
                className="
                  text-2xl md:text-3xl lg:text-4xl
                  font-extrabold uppercase
                  tracking-[0.28em]
                  bg-gradient-to-r from-[#FFE55A] via-[#FF9CF5] to-[#7b5cff]
                  bg-clip-text text-transparent
                  drop-shadow-[0_0_18px_rgba(123,92,255,0.7)]
                "
              >
                CÁC DỊCH VỤ GIẢI TRÍ KHÁC
              </h1>

              <p className="mt-2 text-xs md:text-sm text-[#cbd5ff]/80 max-w-2xl">
                Tổng hợp các dịch vụ giải trí tại hệ thống CinesVerse.
              </p>
            </div>

            <div className="flex justify-center md:justify-end mt-2 md:mt-0">
              <HomeButton />
            </div>
          </section>

          {/* LIST BANNERS */}
          <div className="space-y-6">
            {services.map((s, idx) => (
              <motion.section
                key={s.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.05 }}
                className="
                  rounded-3xl overflow-hidden
                  bg-white/[0.03]
                  border border-white/10
                  shadow-[0_16px_50px_rgba(0,0,0,0.78)]
                  backdrop-blur-sm
                "
              >
                <button type="button" className="w-full text-left group">
                  <div className="relative">
                    <img
                      src={s.image}
                      alt={s.title}
                      className="
                        w-full
                        h-[140px] sm:h-[170px] md:h-[190px]
                        object-cover
                        transition-transform duration-500
                        group-hover:scale-[1.02]
                      "
                    />

                    {/* overlay + title */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
                    <div className="absolute left-5 top-1/2 -translate-y-1/2">
                      <div className="text-xl md:text-2xl font-extrabold tracking-[0.22em] uppercase text-white drop-shadow"></div>
                    </div>
                  </div>
                </button>
              </motion.section>
            ))}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
