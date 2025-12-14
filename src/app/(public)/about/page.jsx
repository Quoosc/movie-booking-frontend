// src/app/(public)/about/page.jsx

import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import HomeButton from "@/components/shared/Buttons/HomeButton";

export default function AboutPage() {
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
      {/* nền neon nhẹ */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-[10%] w-[420px] h-[420px] bg-[radial-gradient(circle_at_center,#8a66ff70,transparent)] blur-[110px]" />
        <div className="absolute top-[35%] right-[12%] w-[380px] h-[380px] bg-[radial-gradient(circle_at_center,#55e5ff55,transparent)] blur-[110px]" />
        <div className="absolute bottom-[-40px] left-1/3 w-[520px] h-[260px] bg-[radial-gradient(circle_at_center,#ff92ff40,transparent)] blur-[120px]" />
      </div>

      <Navbar />

      <main className="relative z-10 flex-1">
        {/* HERO + HOME BUTTON */}
        <section className="max-w-6xl mx-auto px-4 pt-10 pb-8">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-8 lg:gap-12">
            {/* Text */}
            <div className="flex-1">
              <p className="text-[11px] md:text-xs tracking-[0.28em] uppercase text-[#9ca3ff] mb-3">
                About • CinesVerse
              </p>

              <h1
                className="
                  text-2xl md:text-3xl lg:text-[32px]
                  font-extrabold leading-snug
                  bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6]
                  bg-clip-text text-transparent
                  drop-shadow-[0_0_24px_rgba(123,92,255,0.85)]
                  uppercase
                "
              >
                CINESVERSE: KHÔNG CHỈ LÀ RẠP PHIM,{" "}
                <br className="hidden md:block" />
                MÀ LÀ VŨ TRỤ GIẢI TRÍ TOÀN DIỆN.
              </h1>

              <p className="mt-4 text-sm md:text-[15px] text-white/75 leading-relaxed">
                CinesVerse là hệ thống tổ hợp giải trí - điện ảnh hàng đầu tại
                Việt Nam, được xây dựng với mục tiêu trở thành điểm đến văn hóa
                và giải trí số 1 cho mọi thế hệ gia đình Việt. Với mạng lưới cụm
                rạp hiện đại trải dài khắp các tỉnh thành trọng điểm, CinesVerse
                cam kết mang đến trải nghiệm điện ảnh chất lượng cao và các dịch
                vụ giải trí đi kèm vượt trội.
              </p>
            </div>

            {/* Image + HomeButton */}
            <div className="flex-1 w-full">
              <div className="flex justify-end mb-4 lg:mb-6">
                <HomeButton />
              </div>
              <div className="relative">
                <div className="absolute -inset-4 bg-[radial-gradient(circle_at_top,#7b5cff35,transparent)] blur-2xl" />
                <img
                  src="https://png.pngtree.com/thumb_back/fh260/background/20230704/pngtree-flat-lay-view-of-cinema-essentials-on-a-purple-background-popcorn-image_3754937.jpg"
                  alt="CinesVerse Entertainment"
                  className="relative w-full rounded-3xl object-cover border border-white/12 shadow-[0_20px_45px_rgba(0,0,0,0.85)]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ALL-IN-ONE ENTERTAINMENT */}
        <section className="max-w-6xl mx-auto px-4 pb-10">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md p-6 md:p-8 shadow-[0_18px_40px_rgba(0,0,0,0.85)]">
            <h2 className="text-[18px] md:text-[20px] font-extrabold mb-4">
              <span className="bg-gradient-to-r from-[#ff7af6] via-[#7b5cff] to-[#43e1ff] bg-clip-text text-transparent">
                MÔ HÌNH &quot;ALL-IN-ONE ENTERTAINMENT&quot;
              </span>
            </h2>
            <p className="text-sm md:text-[15px] text-white/75 leading-relaxed mb-5">
              Điều làm nên sự khác biệt của CinesVerse chính là mô hình giải trí
              &quot;All-in-one&quot;. Chúng tôi tích hợp nhiều loại hình dịch vụ
              hấp dẫn, biến mỗi chuyến đi đến CinesVerse thành một hành trình
              khám phá:
            </p>

            <div className="grid gap-5 md:grid-cols-2">
              {/* Card 1 */}
              <InfoCard
                title="Rạp Chiếu Phim Đỉnh Cao"
                desc="Hệ thống phòng chiếu tối tân với công nghệ hình ảnh và âm thanh chuẩn quốc tế, mang đến cảm xúc chân thực nhất cho từng thước phim bom tấn quốc tế và những tác phẩm điện ảnh Việt Nam đặc sắc."
                tag="Cinema"
                img="/movies/z7324456300477_3abf9077a63b1b4a8048fde7a5e8865c.jpg"
              />
              {/* Card 2 */}
              <InfoCard
                title="Khu Vui Chơi CinesZone"
                desc="Tổ hợp giải trí năng động với Bowling, Billiards, các trò chơi thực tế ảo (VR Games) và khu vui chơi giáo trí KidZone dành cho trẻ em."
                tag="CinesZone"
                img="/movies/z7324457307940_8a902f87077dd9cc44a0bf2e1df16c5a.jpg"
              />
              {/* Card 3 */}
              <InfoCard
                title="Ẩm Thực & Giải Khát"
                desc="Chuỗi Nhà Hàng, Quán Cà Phê phong cách và Phố Bia C'Beer độc đáo, phục vụ từ món ăn nhanh đến ẩm thực cao cấp."
                tag="Food & Drink"
                img="/movies/z7324458514974_36ac6d18a218b57b8d8f2b7dee680f6c.jpg"
              />
              {/* Card 4 */}
              <InfoCard
                title="Không Gian Sự Kiện"
                desc="Các phòng đa chức năng và Nhà hát mini hiện đại, lý tưởng cho việc tổ chức sự kiện, họp báo và biểu diễn nghệ thuật."
                tag="Event Space"
                img="/movies/z7324460668977_34a86153bb4c8e10a6ed31294e1aa544.jpg"
              />
            </div>
          </div>
        </section>

        {/* VISION & MISSION */}
        <section className="max-w-6xl mx-auto px-4 pb-12">
          <div className="mb-6 text-center">
            <h2 className="text-[18px] md:text-[20px] font-extrabold uppercase tracking-[0.22em] text-[#cbd5ff]">
              TẦM NHÌN &amp; SỨ MỆNH
            </h2>
            <p className="mt-3 text-sm md:text-[15px] text-white/70 max-w-2xl mx-auto">
              CinesVerse hoạt động dựa trên ba sứ mệnh cốt lõi, hướng tới sự
              phát triển bền vững của ngành điện ảnh và văn hóa Việt Nam:
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <MissionCard
              title="Nâng cao trải nghiệm"
              desc="Cung cấp dịch vụ giải trí chất lượng tốt nhất với mức giá tối ưu, phù hợp với thu nhập của người Việt Nam."
            />
            <MissionCard
              title="Đồng hành cùng Điện ảnh Việt"
              desc="Tiên phong ủng hộ phim Việt, góp phần thúc đẩy sự phát triển của nền điện ảnh nước nhà và đưa tác phẩm Việt Nam hội nhập quốc tế."
            />
            <MissionCard
              title="Mở rộng văn hóa"
              desc="Góp phần tăng trưởng thị phần văn hóa, điện ảnh, giải trí và mang lại niềm vui, hạnh phúc cho cộng đồng."
            />
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="max-w-5xl mx-auto px-4 pb-16">
          <div className="rounded-3xl border border-[#FFE700]/35 bg-[radial-gradient(circle_at_top,#FFE70020,transparent)] bg-[#050018]/90 px-6 md:px-10 py-8 md:py-10 text-center shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
            <p className="text-sm md:text-[15px] text-white/80 leading-relaxed mb-4">
              Hãy đến với CinesVerse để không chỉ xem phim, mà còn để tận hưởng
              một ngày trọn vẹn niềm vui, tiếng cười và những trải nghiệm đáng
              nhớ cùng gia đình, bạn bè.
            </p>
            <p className="text-[15px] md:text-lg font-semibold mb-6">
              <span className="bg-gradient-to-r from-[#FFE700] via-[#FFB300] to-[#ff7af6] bg-clip-text text-transparent">
                CinesVerse: BE HAPPY, BE YOUR STAR.
              </span>
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => (window.location.href = "/movie/movies")}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6] text-white text-[13px] font-extrabold tracking-wide shadow-[0_10px_30px_rgba(0,0,0,0.8)] hover:brightness-110 transition"
              >
                ĐẶT VÉ / BẮP NƯỚC NGAY
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

/* ============ SMALL SUB COMPONENTS ============ */

function InfoCard({ title, desc, tag, img }) {
  return (
    <div className="relative rounded-2xl border border-white/12 bg-white/[0.03] overflow-hidden shadow-[0_14px_32px_rgba(0,0,0,0.85)]">
      {img && (
        <div className="h-32 w-full overflow-hidden relative">
          <img
            src={img}
            alt={title}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </div>
      )}
      <div className="p-4 md:p-5 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm md:text-[15px] font-bold text-white">
            {title}
          </h3>
          {tag && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.18em] bg-white/10 text-[#FFD700]">
              {tag}
            </span>
          )}
        </div>
        <p className="text-xs md:text-sm text-white/70 leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
}

function MissionCard({ title, desc }) {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/[0.03] px-4 py-5 shadow-[0_14px_32px_rgba(0,0,0,0.8)]">
      <h3 className="text-sm md:text-[15px] font-semibold mb-2 text-[#e5e7ff]">
        {title}
      </h3>
      <p className="text-xs md:text-sm text-white/70 leading-relaxed">{desc}</p>
    </div>
  );
}
