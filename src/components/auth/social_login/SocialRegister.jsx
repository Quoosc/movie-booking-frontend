// src/components/auth/social_login/SocialRegister.jsx
import { FcGoogle } from "react-icons/fc";
import { BsFacebook } from "react-icons/bs";
import { BsInstagram } from "react-icons/bs";

import { toast } from "react-toastify";

export default function SocialLogin() {
  const handleGoogleLogin = () => {
    const base = import.meta.env.VITE_API_URL || "http://localhost:8080";
    window.location.href = `${base}/api/auth/google/login`;
  };

  return (
    <div className="space-y-4 mb-8">
      {/* Facebook */}
      <button
        onClick={() => toast.info("Chức năng này đang được phát triển")}
        className="w-full group relative overflow-hidden flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#2E004F] via-[#3C1361] to-[#5B2E91] text-white font-semibold py-3.5 px-4 border border-white/15 transition-all hover:shadow-[0_0_25px_rgba(142,36,170,0.4)]"
      >
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#FFD700]/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full"></div>
        <BsFacebook className="text-2xl relative z-10" color="#1877F2" />
        <span className="relative z-10">Đăng ký nhanh với Facebook</span>
      </button>

      {/* Instagram */}
      <button
        onClick={() => toast.info("Chức năng này đang được phát triển")}
        className="w-full group relative overflow-hidden flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#2E004F] via-[#3C1361] to-[#5B2E91] text-white font-semibold py-3.5 px-4 border border-white/15 transition-all hover:shadow-[0_0_25px_rgba(142,36,170,0.4)]"
      >
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#FFD700]/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full"></div>
        <BsInstagram className="text-2xl relative z-10" color="#C13584" />
        <span className="relative z-10">Đăng ký nhanh với Instagram</span>
      </button>
    </div>
  );
}
