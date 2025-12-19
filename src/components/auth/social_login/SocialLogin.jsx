// src/components/auth/social_login/SocialLogin.jsx
import { FcGoogle } from "react-icons/fc";
import { BsFacebook } from "react-icons/bs";
import { BsInstagram } from "react-icons/bs";
//import { API_BASE_URL } from "@/api/fetchConfig";
import { OAUTH_BASE_URL } from "@/api/fetchConfig";
import { toast } from "react-toastify";

export default function SocialLogin() {
  const handleGoogleLogin = () => {
    try {
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const redirectUri = `${origin}/oauth2/success`;

      // const url = `${API_BASE_URL}/oauth2/authorization/google?redirect_uri=${encodeURIComponent(
      //   redirectUri
      // )}`;
      const url = `${OAUTH_BASE_URL}/oauth2/authorization/google?redirect_uri=${encodeURIComponent(
        redirectUri
      )}`;

      window.location.href = url;
    } catch (e) {
      console.error("Google login error:", e);
      toast.error("Không thể chuyển tới Google Login.");
    }
  };

  return (
    <div className="space-y-4 mb-8">
      {/* Google */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full group relative overflow-hidden flex items-center justify-center gap-3 rounded-xl border border-[#FFD700]/30 bg-gradient-to-r from-[#3C1361]/80 to-[#5B2E91]/90 text-[#FFD700] font-semibold py-3.5 px-4 transition-all hover:shadow-[0_0_25px_rgba(255,215,0,0.3)]"
      >
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#FFD700]/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full"></div>
        <FcGoogle className="text-2xl relative z-10" />
        <span className="relative z-10">Đăng nhập với Google</span>
      </button>

      {/* Facebook */}
      <button
        onClick={() => toast.info("Chức năng này đang được phát triển")}
        className="w-full group relative overflow-hidden flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#2E004F] via-[#3C1361] to-[#5B2E91] text-white font-semibold py-3.5 px-4 border border-white/15 transition-all hover:shadow-[0_0_25px_rgba(142,36,170,0.4)]"
      >
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#FFD700]/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full"></div>
        <BsFacebook className="text-2xl relative z-10" color="#1877F2" />
        <span className="relative z-10">Đăng Nhập với Facebook</span>
      </button>

      {/* Instagram */}
      <button
        onClick={() => toast.info("Chức năng này đang được phát triển")}
        className="w-full group relative overflow-hidden flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#2E004F] via-[#3C1361] to-[#5B2E91] text-white font-semibold py-3.5 px-4 border border-white/15 transition-all hover:shadow-[0_0_25px_rgba(142,36,170,0.4)]"
      >
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#FFD700]/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full"></div>
        <BsInstagram className="text-2xl relative z-10" color="#C13584" />
        <span className="relative z-10">Đăng Nhập với Instagram</span>
      </button>
    </div>
  );
}
