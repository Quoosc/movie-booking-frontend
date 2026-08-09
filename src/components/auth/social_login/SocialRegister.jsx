import { BsFacebook, BsInstagram } from "react-icons/bs";
import { FcGoogle } from "react-icons/fc";
import { toast } from "react-toastify";
import { OAUTH_BASE_URL } from "@/api/fetchConfig";

const socialButtonClass =
  "w-full group relative overflow-hidden flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#2E004F] via-[#3C1361] to-[#5B2E91] text-white font-semibold py-3.5 px-4 border border-white/15 transition-all hover:shadow-[0_0_25px_rgba(142,36,170,0.4)]";

export default function SocialRegister() {
  const handleGoogleRegister = () => {
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const redirectUri = `${origin}/oauth2/success`;
      window.location.href = `${OAUTH_BASE_URL}/oauth2/authorization/google?redirect_uri=${encodeURIComponent(
        redirectUri
      )}`;
    } catch {
      toast.error("Không thể chuyển tới Google.");
    }
  };

  const notifyUnavailable = () =>
    toast.info("Chức năng này đang được phát triển");

  return (
    <div className="space-y-4 mb-8">
      <button
        type="button"
        onClick={handleGoogleRegister}
        className="w-full group relative overflow-hidden flex items-center justify-center gap-3 rounded-xl border border-[#FFD700]/30 bg-gradient-to-r from-[#3C1361]/80 to-[#5B2E91]/90 text-[#FFD700] font-semibold py-3.5 px-4 transition-all hover:shadow-[0_0_25px_rgba(255,215,0,0.3)]"
      >
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#FFD700]/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
        <FcGoogle className="text-2xl relative z-10" />
        <span className="relative z-10">Đăng ký với Google</span>
      </button>

      <button type="button" onClick={notifyUnavailable} className={socialButtonClass}>
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#FFD700]/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
        <BsFacebook className="text-2xl relative z-10 text-[#1877F2]" />
        <span className="relative z-10">Đăng ký nhanh với Facebook</span>
      </button>

      <button type="button" onClick={notifyUnavailable} className={socialButtonClass}>
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#FFD700]/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
        <BsInstagram className="text-2xl relative z-10 text-[#C13584]" />
        <span className="relative z-10">Đăng ký nhanh với Instagram</span>
      </button>
    </div>
  );
}
