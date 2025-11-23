import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import HomeButton from "@/components/shared/Buttons/HomeButton";

const membershipContent = {
  cfriend: {
    title: "HẠNG C'FRIEND",
    image:
      "https://png.pngtree.com/thumb_back/fh260/background/20230704/pngtree-flat-lay-view-of-cinema-essentials-on-a-purple-background-popcorn-image_3754937.jpg",
    benefits: [
      "Thẻ được cấp khi khách mua từ 2 vé xem phim bất kỳ tại hệ thống.",
      "Tích điểm trên giá trị hóa đơn, đổi quà & ưu đãi bắp nước.",
      "Giảm giá trên hóa đơn bắp nước khi mua trực tiếp tại quầy.",
      "Ưu tiên tham gia các chương trình ưu đãi & sự kiện dành riêng cho thành viên.",
    ],
    cta: "ĐẶT VÉ NGAY",
  },
  cvip: {
    title: "HẠNG C'VIP",
    image:
      "https://cinemacapitol.com/wp-content/uploads/2024/03/pngtree-blank-movie-ticket-with-popcorn-bucket-filmstrip-clapperboard-and-camera-in-image_3623915.jpg",
    benefits: [
      "Nâng hạng từ C'Friend khi tích lũy điểm theo quy định.",
      "Ưu đãi mạnh hơn: giảm giá combo, bắp nước, ưu tiên ghế & suất chiếu.",
      "Nhận vé mời / quà tặng trong các chương trình đặc biệt.",
      "Tham gia sự kiện ra mắt phim & ưu đãi độc quyền chỉ dành cho C'VIP.",
    ],
    cta: "ĐẶT VÉ NGAY",
  },
};

export default function MembershipDetail({ type, onBack }) {
  if (!type) return null;
  const data = membershipContent[type];

  const isCfriend = type === "cfriend";
  const navigate = useNavigate(); 

  return (
    <section className="relative z-10 max-w-7xl mx-auto px-4 mt-10 mb-6">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="rounded-3xl bg-gradient-to-b from-[#070018]/95 via-[#050015]/98 to-[#02000f]/98 border border-white/10 shadow-[0_0_32px_rgba(0,0,0,0.9)] px-6 md:px-8 py-7 space-y-10"
      >
        {/* nút quay lại / home */}
        <div className="flex justify-between items-center gap-3">
          <HomeButton />
          <p className="text-[11px] text-[#9ca3ff]/70 uppercase tracking-[0.16em]">
            Member Benefits • CinesVerse
          </p>
        </div>

        {/* block 1 */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className={isCfriend ? "" : "md:order-2"}>
            <h3 className="text-[22px] md:text-[24px] font-extrabold">
              <span className="bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6] bg-clip-text text-transparent">
                {data.title}
              </span>
            </h3>
            <ul className="mt-4 space-y-2 text-[13px] text-[#e5e7ff]/85">
              {data.benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#FFE700]" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <button
              className="mt-5 inline-flex items-center px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FFE700] to-[#FFB300] text-[#1a1020] text-[12px] font-extrabold tracking-wide shadow-[0_6px_20px_rgba(0,0,0,0.65)] hover:brightness-105 transition"
              onClick={() => navigate("/movie/movies")} 
            >
              {data.cta}
            </button>
          </div>

          <div className={isCfriend ? "" : "md:order-1"}>
            <div className="relative">
              <div className="absolute -inset-4 bg-[radial-gradient(circle_at_top,#FFE70022,transparent)] blur-xl" />
              <img
                src={data.image}
                alt={data.title}
                className="relative w-full rounded-2xl object-cover border border-white/12 shadow-[0_12px_35px_rgba(0,0,0,0.85)]"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
