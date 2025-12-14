// src/components/promotions/PromoList.jsx
import { useNavigate } from "react-router-dom";
import HomeButton from "@/components/shared/Buttons/HomeButton";

const promos = [
  {
    id: 1,
    title: "C'SCHOOL - Ưu đãi vé từ 45K dành riêng cho HSSV/U22/Giáo viên",
    image: "/movies/CINESVERSE1.jpg",
    desc: [
      "Giá vé ưu đãi từ 45.000đ / vé 2D áp dụng vào Thứ 2 và các suất chiếu trước 10:00.",
      "Áp dụng tại các cụm rạp Cinestar trên toàn hệ thống.",
    ],
  },
  {
    id: 2,
    title: "HAPPY HOUR | Suất sớm & sau 22h - Giá vé ưu đãi chỉ từ 45K",
    image: "/movies/CINESVERSE2.jpg",
    desc: [
      "Áp dụng cho các suất chiếu trước 10h và sau 22h.",
      "Số lượng vé ưu đãi có giới hạn cho mỗi suất.",
    ],
  },
  {
    id: 3,
    title: "THỨ 4 HAPPY DAY - Đồng giá vé hấp dẫn",
    image: "/movies/CINESVERSE3.jpg",
    desc: [
      "Thành viên C'Member/C'Friend/C'VIP nhận thêm ưu đãi tích điểm.",
      "Không áp dụng Lễ, Tết và một số suất chiếu đặc biệt.",
    ],
  },
];

export default function PromoList() {
  const navigate = useNavigate();

  return (
    <main className="relative z-10 max-w-6xl mx-auto px-4 pt-20 pb-14">
      {/* HEADER + HOME (sticky) */}
      <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] md:text-xs font-semibold tracking-[0.24em] uppercase text-[#9ca3ff]/80 mb-1">
            ƯU ĐÃI HIỆN HÀNH
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
            CHƯƠNG TRÌNH KHUYẾN MÃI
          </h1>
          <p className="mt-2 text-xs md:text-sm text-[#cbd5ff]/80 max-w-2xl">
            Tổng hợp đầy đủ các ưu đãi, giảm giá và quyền lợi thành viên hiện
            hành tại hệ thống rạp CinesVerse. Nội dung có thể thay đổi tùy theo
            thời điểm triển khai thực tế.
          </p>
        </div>

        <div className="flex justify-center md:justify-end mt-2 md:mt-0">
          <HomeButton />
        </div>
      </section>

      {/* DANH SÁCH PROMO */}
      <div className="space-y-8">
        {promos.map((p) => (
          <section
            key={p.id}
            className="
              grid md:grid-cols-[minmax(0,1.6fr)_minmax(0,1.4fr)]
              gap-5 items-start
              bg-white/[0.03]
              border border-white/10
              rounded-3xl
              p-4 md:p-6
              shadow-[0_16px_50px_rgba(0,0,0,0.78)]
              backdrop-blur-sm
            "
          >
            <div>
              <h2 className="text-lg md:text-2xl font-extrabold text-[#f9f5ff] mb-3">
                {p.title}
              </h2>
              <ul className="list-disc list-outside pl-4 space-y-1.5 text-sm text-[#e5e7ff]/90">
                {p.desc.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>

              <button
                className="
                  mt-4 inline-flex items-center px-5 py-2.5 rounded-xl
                  bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6]
                  text-white text-xs font-extrabold
                  shadow-[0_8px_22px_rgba(0,0,0,0.9)]
                  hover:shadow-[0_0_22px_rgba(123,92,255,0.9)]
                  hover:scale-[1.02] active:scale-100
                  transition-all
                "
                onClick={() => navigate("/movie/movies")}
              >
                ĐẶT VÉ NGAY
              </button>
            </div>

            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-black/40">
              <img
                src={p.image}
                alt={p.title}
                className="w-full h-full object-cover"
              />
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
