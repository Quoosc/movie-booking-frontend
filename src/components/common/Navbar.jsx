// src/components/common/Navbar.jsx
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaRegUser } from "react-icons/fa";
import { PiCalendarCheckBold, PiPopcornBold } from "react-icons/pi";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import CinemaDropdown from "@/components/cinema/CinemaDropdown";
import { toast } from "react-toastify";
import { MdLocalActivity } from "react-icons/md";
import { RiCoupon3Fill } from "react-icons/ri";
import { AiOutlineInfoCircle } from "react-icons/ai";

import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const nav = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [openUserMenu, setOpenUserMenu] = useState(false);

  const { user, isAuthenticated, isMember, isAdmin, logout } = useAuth();

  const LinkBase =
    "relative py-3 text-sm md:text-[15px] text-[#d4ddff]/80 hover:text-white transition-colors duration-200 group";

  const Underline = (
    <span className="absolute left-0 -bottom-0.5 h-[2px] w-0 bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6] rounded-full transition-all duration-300 group-hover:w-full" />
  );

  const displayName =
    user?.fullName || user?.name || user?.email || "Tài khoản";

  const handleLogoutClick = async () => {
    try {
      await logout();
      setOpenUserMenu(false);
      setOpen(false);
      toast.success("Đăng xuất thành công!");
      nav("/auth/login", { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
      toast.error("Đăng xuất thất bại, vui lòng thử lại.");
    }
  };

  const handleSearch = () => {
    const q = searchTerm.trim();
    if (!q) return;
    nav(`/movie/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-[#050018]/98 backdrop-blur-2xl border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
      {/* neon glow mờ phía trên */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#7b5cff33] via-transparent to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4">
        {/* ROW 1 */}
        <div className="h-[68px] flex items-center gap-3 border-b border-white/10">
          {/* Mobile menu */}
          <button
            className="md:hidden text-[#d4ddff]/80 hover:text-white transition-colors"
            onClick={() => setOpen(true)}
            aria-label="Open Menu"
          >
            <HiOutlineMenu className="w-7 h-7" />
          </button>

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 shrink-0 hover:opacity-95 transition"
          >
            <img
              src="/movies/—Pngtree—film festival logo popcorn and_4686389.png"
              alt="CinesVerse"
              className="h-9 w-auto drop-shadow-[0_0_14px_rgba(123,92,255,0.9)]"
            />
          </Link>

          {/* CTA desktop */}
          <div className="hidden lg:flex items-center gap-2 ml-3">
            <button
              onClick={() => nav("/movie/movies")}
              className="group relative overflow-hidden px-5 py-2.5 rounded-2xl border border-[#43e1ff]/70 bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6] text-white font-extrabold tracking-wide hover:shadow-[0_0_20px_rgba(123,92,255,0.95)] transition-all duration-300"
              title="Đặt vé / bắp nước ngay"
            >
              {/* hiệu ứng highlight chạy ngang */}
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-700 bg-gradient-to-r from-transparent via-white/35 to-transparent" />

              <div className="flex items-center gap-2 relative z-10">
                <PiCalendarCheckBold className="opacity-90" />
                <PiPopcornBold className="opacity-90" />
                <span className="whitespace-nowrap">
                  ĐẶT VÉ / BẮP NƯỚC NGAY
                </span>
              </div>
            </button>
          </div>

          {/* Search */}
          {/* Search */}
          <div className="flex-1 mx-3">
            <div className="relative group">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                placeholder="Tìm phim, rạp, suất chiếu..."
                className="
    w-full rounded-full py-2.5 pl-4 pr-11 text-[13px]
    bg-[#050018]/90
    border border-[#2f3370]
    text-[#f9fafb]
    placeholder:text-[#9ca3ff]/80
    shadow-[0_0_0_1px_rgba(123,92,255,0.35)]
    outline-none
    focus:ring-2 focus:ring-[#7b5cff]/70
    focus:border-[#43e1ff]
    transition-all
  "
              />

              <button
                type="button"
                onClick={handleSearch}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-[#9ca3ff]/75 group-focus-within:text-[#ff7af6] hover:bg-white/[0.06] transition"
                aria-label="Tìm kiếm"
              >
                <svg
                  className="w-4.5 h-4.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle cx="11" cy="11" r="8" strokeWidth="2" />
                  <path d="M21 21l-3.5-3.5" strokeWidth="2" />
                </svg>
              </button>
            </div>
          </div>

          {/* Auth desktop */}
          <div className="hidden md:flex items-center gap-3 relative">
            {!isAuthenticated && (
              <>
                <button
                  onClick={() => nav("/auth/login")}
                  className="px-3 py-2 rounded-lg border border-white/15 bg.white/3 bg-white/3 text-[#d4ddff] hover:text-white hover:bg-white/8 hover:border-[#7b5cff55] transition-all duration-200 flex items-center gap-2 text-[13px]"
                >
                  <FaRegUser className="text-[#7b5cff]" />
                  <span className="font-semibold">Đăng nhập</span>
                </button>
                <button
                  onClick={() => nav("/auth/register")}
                  className="px-3 py-2 rounded-lg bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6] text-white font-extrabold text-[13px] hover:shadow-[0_0_16px_rgba(123,92,255,0.9)] hover:scale-[1.02] active:scale-100 transition-all duration-200 border border-[#43e1ff]/40"
                >
                  Đăng ký
                </button>
              </>
            )}

            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => setOpenUserMenu((v) => !v)}
                  className="px-3 py-2 rounded-lg border border-white/15 bg-white/5 text-[#d4ddff] hover:bg-white/10 hover:border-[#7b5cffaa] transition-all duration-200 flex items-center gap-2 text-[13px]"
                >
                  <FaRegUser className="text-[#7b5cff]" />
                  <span className="font-semibold max-w-[140px] truncate">
                    {displayName}
                  </span>
                </button>

                {openUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#050018] border border-white/15 shadow-[0_18px_50px_rgba(0,0,0,0.9)] text-[13px] py-2 z-50">
                    {/* Member-only: Profile + History + Membership */}
                    {isMember && (
                      <>
                        <button
                          onClick={() => {
                            setOpenUserMenu(false);
                            nav("/account/account-profile");
                          }}
                          className="w-full text-left px-4 py-2 hover:bg:white/8 text-[#e5e7ff]"
                        >
                          Thông tin cá nhân
                        </button>
                        <div className="my-1 h-px bg-white/10" />
                      </>
                    )}

                    {/* Admin-only */}
                    {isAdmin && (
                      <>
                        <button
                          onClick={() => {
                            setOpenUserMenu(false);
                            nav("/admin");
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-white/8 text-[#facc15]"
                        >
                          Admin Dashboard
                        </button>
                        <div className="my-1 h-px bg-white/10" />
                      </>
                    )}

                    <button
                      onClick={handleLogoutClick}
                      className="w-full text-left px-4 py-2 hover:bg-white/8 text-red-300"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ROW 2: dùng chung nền, không thêm border dưới */}
        <div className="h-[40px] flex items-center">
          <nav className="flex items-center gap-6">
            <div className={`${LinkBase} flex items-center gap-2`}>
              <CinemaDropdown />
              {Underline}
            </div>

            <span className="opacity-25">|</span>

            <NavLink
              to="/dich-vu-giai-tri"
              className={({ isActive }) =>
                `${LinkBase} ${
                  isActive ? "text-white" : ""
                } flex items-center gap-2`
              }
            >
              <MdLocalActivity className="text-[16px] text-[#9ca3ff]/80 group-hover:text-[#ff7af6] transition-colors" />
              Dịch vụ giải trí
              {Underline}
            </NavLink>

            <span className="opacity-25">|</span>

            <NavLink
              to="/promotions"
              className={({ isActive }) =>
                `${LinkBase} ${
                  isActive ? "text-white" : ""
                } flex items-center gap-2`
              }
            >
              <RiCoupon3Fill className="text-[16px] text-[#9ca3ff]/80 group-hover:text-[#ff7af6] transition-colors" />
              Khuyến mãi
              {Underline}
            </NavLink>

            <span className="opacity-25">|</span>

            <NavLink
              to="/about"
              className={({ isActive }) =>
                `${LinkBase} ${
                  isActive ? "text-white" : ""
                } flex items-center gap-2`
              }
            >
              <AiOutlineInfoCircle className="text-[16px] text-[#9ca3ff]/80 group-hover:text-[#ff7af6] transition-colors" />
              Giới thiệu
              {Underline}
            </NavLink>
          </nav>
        </div>
      </div>

      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-50 transition ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!open}
      >
        <div
          className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
        />
        <div
          className={`absolute left-0 top-0 h-full w-80 bg-[#050018] border-r border-white/10 transform transition-transform ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="px-4 py-4 flex items-center justify-between border-b border-white/10">
            <img
              src="/movies/logo-popcorn.png"
              className="h-8 drop-shadow-[0_0_10px_rgba(123,92,255,0.9)]"
              alt="CinesVerse"
            />
            <button
              onClick={() => setOpen(false)}
              className="text-[#d4ddff]/80 hover:text-white transition"
            >
              <HiOutlineX className="w-7 h-7" />
            </button>
          </div>

          <div className="p-4 space-y-3 text-[14px]">
            {/* Auth block mobile */}
            {!isAuthenticated && (
              <>
                <button
                  onClick={() => {
                    setOpen(false);
                    nav("/auth/login");
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-white/12 bg-white/4 text-[#d4ddff] hover:bg_white/8 hover:bg-white/8 transition flex items-center gap-2"
                >
                  <FaRegUser className="text-[#7b5cff]" /> Đăng nhập
                </button>
                <button
                  onClick={() => {
                    setOpen(false);
                    nav("/auth/register");
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6] text-white font-extrabold hover:shadow-[0_0_16px_rgba(123,92,255,0.9)] transition"
                >
                  Đăng ký
                </button>
              </>
            )}

            {isAuthenticated && (
              <div className="space-y-2">
                <div className="px-1 py-2 text-[#e5e7ff]/90">
                  <div className="flex items-center gap-2">
                    <FaRegUser className="text-[#7b5cff]" />
                    <div className="flex flex-col">
                      <span className="font-semibold">{displayName}</span>
                      <span className="text-[12px] text-[#9ca3ff]">
                        {isAdmin
                          ? "Quản trị viên"
                          : isMember
                          ? "Thành viên"
                          : "Khách"}
                      </span>
                    </div>
                  </div>
                </div>

                {isMember && (
                  <>
                    <button
                      onClick={() => {
                        setOpen(false);
                        nav("/profile");
                      }}
                      className="w-full text-left text-[#d4ddff]/85 py-2"
                    >
                      Hồ sơ cá nhân
                    </button>
                    <button
                      onClick={() => {
                        setOpen(false);
                        nav("/my-bookings");
                      }}
                      className="w-full text-left text-[#d4ddff]/85 py-2"
                    >
                      Lịch sử đặt vé
                    </button>
                    <button
                      onClick={() => {
                        setOpen(false);
                        nav("/membership");
                      }}
                      className="w-full text-left text-[#d4ddff]/85 py-2"
                    >
                      Membership
                    </button>
                  </>
                )}

                {isAdmin && (
                  <button
                    onClick={() => {
                      setOpen(false);
                      nav("/admin");
                    }}
                    className="w-full text-left text-[#facc15] py-2"
                  >
                    Admin Dashboard
                  </button>
                )}

                <div className="h-px bg-white/10 my-2" />

                <button
                  onClick={handleLogoutClick}
                  className="w-full text-left text-red-300 py-2"
                >
                  Đăng xuất
                </button>
              </div>
            )}

            <div className="h-px bg-white/10 my-2" />

            <button className="w-full text-left text-[#d4ddff]/85 py-2">
              Chọn rạp
            </button>
            <button className="w-full text-left text-[#d4ddff]/85 py-2">
              Dịch Vụ giải trí
            </button>
            <button
              onClick={() => {
                setOpen(false);
                nav("/promotions");
              }}
              className="w-full text-left text-[#d4ddff]/85 py-2"
            >
              Khuyến mãi
            </button>
            <button
              onClick={() => {
                setOpen(false);
                nav("/about");
              }}
              className="w-full text-left text-[#d4ddff]/85 py-2"
            >
              Giới thiệu
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
