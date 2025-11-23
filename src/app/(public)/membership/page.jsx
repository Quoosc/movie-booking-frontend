// src/app/(public)/membership/page.jsx
import { useSearchParams, useNavigate } from "react-router-dom";

import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import MembershipDetail from "@/components/membership/MembershipDetail";

export default function MembershipPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // type = cfriend | cvip, default là cfriend
  const type = searchParams.get("type") || "cfriend";

  const handleBack = () => {
    // Quay lại trang trước. Nếu không có history thì về home.
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div
      className="
        min-h-screen
        flex flex-col
        bg-gradient-to-b from-[#050018] via-[#080023] to-[#050018]
        text-white
        relative
        overflow-hidden
      "
    >
      {/* nền neon giống Home */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-[8%] w-[520px] h-[520px] bg-[radial-gradient(circle_at_center,#7b5cff55,transparent)] blur-[110px]" />
        <div className="absolute top-[28%] right-[12%] w-[420px] h-[420px] bg-[radial-gradient(circle_at_center,#43e1ff40,transparent)] blur-[110px]" />
        <div className="absolute bottom-[-60px] left-1/3 w-[640px] h-[320px] bg-[radial-gradient(circle_at_center,#ff7af640,transparent)] blur-[130px]" />
      </div>

      <Navbar />

      <main className="relative z-10 flex-1 pt-10 md:pt-12">
        {/* Bạn đang xem: C'Friend / C'VIP */}
        <div className="max-w-7xl mx-auto px-4 mb-4">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-[0.18em] text-center">
            <span className="bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6] bg-clip-text text-transparent">
              CHƯƠNG TRÌNH THÀNH VIÊN
            </span>
          </h1>
        </div>

        <MembershipDetail type={type} onBack={handleBack} />
      </main>

      <Footer />
    </div>
  );
}
