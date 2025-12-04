// src/app/(auth)/login/page.jsx

import HomeButton from "@/components/shared/Buttons/HomeButton";
import LoginForm from "@/components/auth/login/LoginForm/LoginForm";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen bg-[#020014] text-white overflow-hidden">
      {/* nền neon nhẹ */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-[10%] w-[420px] h-[420px] bg-[radial-gradient(circle_at_center,#8a66ff70,transparent)] blur-[110px]" />
        <div className="absolute top-[35%] right-[12%] w-[380px] h-[380px] bg-[radial-gradient(circle_at_center,#55e5ff55,transparent)] blur-[110px]" />
        <div className="absolute bottom-[-40px] left-1/3 w-[520px] h-[260px] bg-[radial-gradient(circle_at_center,#ff92ff40,transparent)] blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-7">
        <HomeButton />

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-[minmax(0,1.6fr)_2px_minmax(0,1.4fr)] gap-0 lg:gap-6 items-stretch">
          {/* LEFT: FORM PANEL */}
          <section
            className="
              flex flex-col justify-center
              bg-gradient-to-b from-[#080018]/98 via-[#050015]/98 to-[#040010]/98
              rounded-3xl px-6 sm:px-8 py-7
              shadow-[0_0_35px_rgba(0,0,0,0.9)]
              border border-white/5
            "
          >
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-md">
                <LoginForm />
              </div>
            </div>
          </section>

          {/* CENTER: GLOW LINE */}
          <div className="hidden lg:flex items-stretch justify-center">
            <div
              className="
                w-[2px] my-6
                bg-gradient-to-b from-transparent via-[#ffe700] to-transparent
                shadow-[0_0_26px_rgba(255,231,0,0.9)]
                rounded-full
              "
            />
          </div>

          {/* RIGHT: HEADER + INFO */}
          <section
            className="
              hidden lg:flex flex-col justify-center gap-5
              bg-gradient-to-b from-[#070018]/96 via-[#040015]/98 to-[#02000f]/98
              rounded-3xl px-7 py-7
              shadow-[0_0_32px_rgba(0,0,0,0.9)]
              border border-white/5
            "
          >
            {/* HEADER */}
            <p className="text-[10px] tracking-[0.22em] text-[#9ca3ff] uppercase">
              Movie Booking • CinesVerse
            </p>

            <h1 className="mt-2 text-3xl md:text-[32px] font-extrabold leading-tight">
              <span className="bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6] bg-clip-text text-transparent drop-shadow-[0_0_14px_rgba(123,92,255,0.8)]">
                CinesVerse
              </span>
            </h1>

            <p className="mt-3 text-[13px] text-[#cbd5ff]/85 max-w-md">
              Trở thành 1 phần của{" "}
              <span className="text-[#ffe700] font-semibold">CinesVerse</span>{" "}
              – khiến đam mê bùng cháy
            </p>

            {/* Decorative divider */}
            <div className="mt-4 flex gap-2">
              <div className="h-1 w-16 bg-gradient-to-r from-[#43e1ff] to-[#7b5cff] rounded-full" />
              <div className="h-1 w-10 bg-gradient-to-r from-[#7b5cff] to-[#ffe700] rounded-full" />
              <div className="h-1 w-6 bg-white/20 rounded-full" />
            </div>

            {/* Description */}
            <p className="text-[13px] text-[#e5e7ff]/80 mt-2">
              Trải nghiệm đặt vé chuẩn rạp – nhanh, đẹp và tiện lợi. Giữ ghế ưng
              ý, thanh toán an toàn, ưu đãi dành riêng cho bạn.
            </p>

            {/* Feature Cards */}
            <div className="mt-3 space-y-3">
              <Card
                title="Đặt vé nhanh chóng"
                desc="Chọn suất chiếu & ghế yêu thích chỉ trong vài bước."
                iconBg="from-[#ffe700] to-[#ff9f1c]"
              />
              <Card
                title="Thanh toán an toàn"
                desc="Hỗ trợ MoMo, ZaloPay, PayPal, thẻ quốc tế & nội địa."
                iconBg="from-[#43e1ff] to-[#7b5cff]"
              />
              <Card
                title="Ưu đãi thành viên"
                desc="Tích điểm & thăng hạng SILVER • GOLD • PLATINUM."
                iconBg="from-[#ff7af6] to-[#ffe700]"
              />
            </div>

            <p className="mt-4 text-[11px] text-right text-[#fbbf24]/80 italic">
              “ Một bộ vé – Ngàn cảm xúc điện ảnh ”
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

function Card({ title, desc, iconBg }) {
  return (
    <div
      className="w-full flex items-center gap-4 px-4 py-3
        bg-white/[0.02]
        border border-white/5
        rounded-2xl
        hover:bg-white/[0.04]
        hover:border-[#ffe70066]
        transition-all duration-200
        shadow-[0_0_14px_rgba(0,0,0,0.8)]"
    >
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center
          bg-gradient-to-br ${iconBg}
          text-[#050816] text-lg font-extrabold
          shadow-[0_0_12px_rgba(255,231,0,0.85)]`}
      >
        •
      </div>
      <div className="flex-1">
        <p className="text-[13px] font-semibold text-white">{title}</p>
        <p className="text-[11px] text-[#d1d5ff]/80">{desc}</p>
      </div>
    </div>
  );
}
