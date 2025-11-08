import { Link } from "react-router-dom";

export default function HeroBanner() {
  return (
    <section className="max-w-7xl mx-auto px-4 mt-5">
      {/* Banner */}
      <div className="rounded-xl overflow-hidden border border-white/10">
        <div className="h-44 md:h-56 bg-[url('/cinestar_hero.jpg')] bg-cover bg-center relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#3C1361]/80 to-[#5B2E91]/60" />
          <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
            <h2 className="text-white text-2xl md:text-[28px] font-extrabold tracking-wide drop-shadow">
              CINESTAR QUỐC THANH (TP.HCM)
            </h2>
            <p className="text-white/85 text-sm mt-1">
              271 Nguyễn Trãi, Phường Cầu Ông Lãnh, Thành Phố Hồ Chí Minh
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-[#111829] px-4 md:px-6">
          <div className="flex items-center gap-6 overflow-x-auto">
            {[
              { label: "PHIM ĐANG CHIẾU", active: true },
              { label: "PHIM SẮP CHIẾU" },
              { label: "SUẤT CHIẾU ĐẶC BIỆT" },
              { label: "BẢNG GIÁ VÉ" },
            ].map((t, i) => (
              <Link
                key={i}
                to="#"
                className={`py-3 border-b-2 text-sm md:text-base whitespace-nowrap ${
                  t.active
                    ? "border-[#FFD700] text-white font-bold"
                    : "border-transparent text-white/70 hover:text-white"
                }`}
              >
                {t.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
