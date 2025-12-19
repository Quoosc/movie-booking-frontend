// src/app/(auth)/oauth2-success/page.jsx
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";

export default function OAuth2SuccessPage() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const ran = useRef(false);
  const toasted = useRef(false);

  // 1) Gọi refreshProfile đúng 1 lần
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    refreshProfile().catch((err) => {
      console.error("OAuth2 refreshProfile error:", err);
      toast.error("Không thể lấy thông tin người dùng sau khi đăng nhập Google.");
      navigate("/auth/login", { replace: true });
    });
  }, [refreshProfile, navigate]);

  // 2) Khi user đã có -> redirect
  useEffect(() => {
    if (!user) return;

    if (!toasted.current) {
      toasted.current = true;
      toast.success("Đăng nhập bằng Google thành công!");
    }

    navigate("/", { replace: true });
  }, [user, navigate]);

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
