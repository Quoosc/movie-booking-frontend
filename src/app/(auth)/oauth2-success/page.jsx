// src/app/(auth)/oauth2-success/page.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";

export default function OAuth2SuccessPage() {
  const { refreshProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    async function handleCallback() {
      try {
        await refreshProfile();
        if (!mounted) return;

        toast.success("Đăng nhập bằng Google thành công!");
        navigate("/", { replace: true });
      } catch (err) {
        console.error("OAuth2 callback error:", err);
        if (!mounted) return;

        toast.error("Không thể lấy thông tin người dùng sau khi đăng nhập Google.");
        navigate("/auth/login", { replace: true });
      }
    }

    handleCallback();

    return () => {
      mounted = false;
    };
  }, [refreshProfile, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050816]">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-white/20 border-t-[#7b5cff] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/80 text-sm">
          Đang xử lý đăng nhập Google, vui lòng chờ...
        </p>
      </div>
    </div>
  );
}
