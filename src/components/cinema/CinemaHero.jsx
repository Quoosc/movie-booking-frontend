// src/components/cinema/CinemaHero.jsx
import HomeButton from "@/components/shared/Buttons/HomeButton";
import { HiOutlineLocationMarker } from "react-icons/hi";

export default function CinemaHero({ cinema }) {
  if (!cinema) return null;

  const heroImage =
    cinema.heroImageUrl ||
    cinema.hero_image_url ||
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1400&q=80";

  return (
    <section className="max-w-7xl mx-auto px-4 pt-8 md:pt-10">
      <div className="flex justify-end mb-3">
        <HomeButton />
      </div>

      <div className="overflow-hidden rounded-[18px] border border-white/10 shadow-[0_26px_80px_rgba(0,0,0,0.65)]">
        <div className="grid md:grid-cols-[42%_58%]">
          <div className="relative h-56 md:h-[290px] bg-[#050a1f]">
            <img
              src={heroImage}
              alt={cinema.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/35 via-transparent to-transparent" />
          </div>

          <div className="relative bg-gradient-to-r from-[#5f3cb5] via-[#4f45bd] to-[#3d63c7] px-6 py-7 md:px-10 md:py-9 flex flex-col justify-center">
            <p className="text-[11px] uppercase tracking-[0.22em] text-white/70 font-semibold">
              CinesVerse
            </p>
            <h1 className="mt-2 text-3xl md:text-5xl font-black uppercase leading-[1.02] text-white [text-shadow:0_4px_18px_rgba(0,0,0,0.35)]">
              {cinema.name}
            </h1>

            {cinema.address ? (
              <p className="mt-5 inline-flex items-start gap-2 text-sm md:text-lg text-white/95 font-medium">
                <HiOutlineLocationMarker className="w-5 h-5 mt-0.5 text-yellow-300 flex-shrink-0" />
                <span>{cinema.address}</span>
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
