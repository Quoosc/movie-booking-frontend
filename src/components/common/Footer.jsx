// src/components/common/Footer.jsx
import { Link } from "react-router-dom";
import { FaFacebookF, FaYoutube, FaTiktok } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="mt-16 bg-gradient-to-r from-[#070016] via-[#0b0620] to-[#051226] text-white relative overflow-hidden">
      {/* soft glow background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-10 w-64 h-64 bg-[radial-gradient(circle_at_center,#7b5cff33,transparent)] blur-3xl" />
        <div className="absolute -bottom-24 right-10 w-72 h-72 bg-[radial-gradient(circle_at_center,#43e1ff26,transparent)] blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 pt-10 pb-6">
        {/* Top */}
        <div className="grid gap-10 md:grid-cols-5">
          {/* Logo + tagline + socials */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/public/movies/—Pngtree—film festival logo popcorn and_4686389.png"
                alt="CinesVerse"
                className="h-11 w-auto drop-shadow-[0_3px_16px_rgba(0,0,0,0.75)]"
              />
              <div>
                <p className="text-[11px] tracking-[0.22em] uppercase text-[#9ca3ff]">
                  Movie Booking Platform
                </p>
                <p className="text-sm font-semibold text-[#e5e7ff]">
                  CinesVerse
                </p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-white/70">
              BE HAPPY, BE A STAR — Nền tảng đặt vé phim hiện đại với trải
              nghiệm điện ảnh sống động, giao diện tối giản và hiệu ứng neon
              sang trọng.
            </p>

            {/* Social */}
            <div className="flex items-center gap-3 mt-3">
              <SocialIcon href="#" aria="Facebook">
                <FaFacebookF />
              </SocialIcon>
              <SocialIcon href="#" aria="YouTube">
                <FaYoutube />
              </SocialIcon>
              <SocialIcon href="#" aria="TikTok">
                <FaTiktok />
              </SocialIcon>
            </div>
          </div>

          {/* Tài khoản */}
          <div>
            <FooterTitle>Tài khoản</FooterTitle>
            <FooterLink to="/auth/login">Đăng nhập</FooterLink>
            <FooterLink to="/auth/register">Đăng ký</FooterLink>
            <FooterLink to="/membership">Membership</FooterLink>
          </div>

          {/* Xem phim */}
          <div>
            <FooterTitle>Xem phim</FooterTitle>
            <FooterLink to="/movie/moviesShowing">Phim đang chiếu</FooterLink>
            <FooterLink to="/movie/moviesUpComming">Phim sắp chiếu</FooterLink>
            <FooterLink to="/movie/movies">Suất chiếu đặc biệt</FooterLink>
          </div>

          {/* CinesVerse + hệ thống rạp */}
          <div>
            {/* <FooterTitle>CinesVerse</FooterTitle>
            <FooterLink to="/about">Giới thiệu</FooterLink>
            <FooterLink to="/contact">Liên hệ</FooterLink>
            <FooterLink to="/careers">Tuyển dụng</FooterLink> */}

            <FooterTitle>Hệ thống rạp</FooterTitle>
            <FooterText>CinesVerse Tran Quoc(Hà Nội)</FooterText>
            <FooterText>CinesVerse Tran Quoc1(TP.HCM)</FooterText>
            <FooterText>CinesVerse Tran Quoc2(Huế)</FooterText>
            <FooterText>CinesVerse Tran Quoc3(Đà Lạt)</FooterText>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-8 border-t border-white/10" />

        {/* Bottom */}
        <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-white/60">
          <p>
            © 2025 CinesVerse.Copyright by{" "}
            <span className="text-[#7b5cff] font-semibold">PhamTranQuoc</span>.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button>Liên hệ</button>
            <a href="/privacy" className="hover:text-white transition-colors">
              Chính sách bảo mật
            </a>
            <a href="/news" className="hover:text-white transition-colors">
              Tin điện ảnh
            </a>
            <a href="/faq" className="hover:text-white transition-colors">
              Hỏi & Đáp
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* Helpers */

function FooterTitle({ children, className = "" }) {
  return (
    <h4
      className={
        "mb-2 text-xs font-bold tracking-[0.18em] uppercase text-[#9ca3ff]" +
        " " +
        className
      }
    >
      {children}
    </h4>
  );
}

function FooterLink({ to, children }) {
  return (
    <Link
      to={to}
      className="block text-sm text-white/65 hover:text-[#43e1ff] hover:translate-x-[3px] transition-all duration-200"
    >
      {children}
    </Link>
  );
}

function FooterText({ children }) {
  return <p className="text-sm text-white/55">{children}</p>;
}

function FooterInlineLink({ to, children }) {
  return (
    <Link
      to={to}
      className="hover:text-[#43e1ff] transition-colors duration-200"
    >
      {children}
    </Link>
  );
}

function SocialIcon({ href, aria, children }) {
  return (
    <a
      href={href}
      aria-label={aria}
      className="w-8 h-8 rounded-full border border-white/25 flex items-center justify-center 
                 text-white/75 hover:text-[#43e1ff] hover:border-[#43e1ff] 
                 hover:bg-white/[0.04] transition-all duration-200"
    >
      {children}
    </a>
  );
}
