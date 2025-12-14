// src/components/cinema/CinemaHero.jsx
import HomeButton from "@/components/shared/Buttons/HomeButton";

export default function CinemaHero({ cinema }) {
  if (!cinema) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 pt-10">
      <div className="flex items-start justify-between gap-4">
        {/* Info + banner */}
        <div
          className="
            relative flex-1 overflow-hidden
            rounded-3xl border border-white/12
            bg-gradient-to-r from-[#07102A] via-[#080022] to-[#050018]
            shadow-[0_24px_70px_rgba(0,0,0,0.9)]
          "
        >
          {/* bg image */}
          <div className="absolute inset-0">
            {/* <img
              src={cinema.heroImageUrl}
              alt={cinema.name}
              className="w-full h-full object-cover opacity-[0.38]"
            /> */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/20" />
          </div>

          {/* content */}
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 px-6 py-5">
            {/* <div className="hidden md:block w-40 h-28 rounded-2xl overflow-hidden border border-white/20 bg-black/40">
              <img
                src={cinema.thumbnailUrl}
                alt={cinema.name}
                className="w-full h-full object-cover"
              />
            </div> */}

            <div className="flex-1">
              <p className="text-[11px] uppercase tracking-[0.18em] text-[#9ca3ff]">
                Cụm rạp CinesVerse
              </p>
              <h1
                className="
                  mt-1 text-2xl md:text-3xl font-extrabold
                  bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6]
                  bg-clip-text text-transparent
                  drop-shadow-[0_0_20px_rgba(123,92,255,0.9)]
                "
              >
                {cinema.name}
              </h1>
              {cinema.address && (
                <p className="mt-2 text-xs md:text-sm text-white/75">
                  📍 {cinema.address}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Home button bên phải */}
        <div className="pt-1">
          <HomeButton />
        </div>
      </div>
    </section>
  );
}
