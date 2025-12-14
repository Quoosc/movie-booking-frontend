"use client";

import SocialLogin from "../../social_login/SocialLogin";
import Divider from "../../shared/AuthDivider";
import AuthRedirect from "../../shared/AuthRedirect";
import LoginFields from "./LoginFields";
import AuthHeader from "../../shared/AuthHeader";

export default function LoginForm() {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-5">
        <p className="text-[10px] tracking-[0.22em] text-[#9ca3ff] uppercase">
          Movie Booking • CinesVerse
        </p>

        <h1 className="mt-2 text-3xl md:text-[32px] font-extrabold leading-tight">
          <span className="bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6] bg-clip-text text-transparent drop-shadow-[0_0_14px_rgba(123,92,255,0.8)]">
            Đăng nhập tài khoản
          </span>
        </h1>

        <p className="mt-3 text-[13px] text-[#cbd5ff]/85 max-w-md">
          Khám phá vũ trụ điện ảnh cùng{" "}
          <span className="text-[#ffe700] font-semibold">CinesVerse</span> – Đặt
          vé nhanh, ưu đãi độc quyền & trải nghiệm rạp phim hiện đại.
        </p>

        <div className="mt-4 flex gap-2">
          <div className="h-1 w-16 bg-gradient-to-r from-[#43e1ff] to-[#7b5cff] rounded-full" />
          <div className="h-1 w-10 bg-gradient-to-r from-[#7b5cff] to-[#ff7af6] rounded-full" />
          <div className="h-1 w-6 bg-white/20 rounded-full" />
        </div>
      </div>

      {/* Form fields */}
      <LoginFields />

      {/* Divider */}
      <Divider
        text="Hoặc đăng nhập với"
        textColor="text-[#bdbfff]/70"
        lineColor="bg-white/10"
      />

      {/* Social Login */}
      <div className="mt-5">
        <SocialLogin />
      </div>

      {/* Link register */}
      <div className="mt-5">
        <AuthRedirect
          text="Bạn chưa có tài khoản?"
          linkText="Đăng ký ngay"
          href="/auth/register"
          textColor="text-[#bdbfff]/70"
          linkColor="text-[#7b5cff] hover:text-[#43e1ff]"
        />
      </div>
    </div>
  );
}
