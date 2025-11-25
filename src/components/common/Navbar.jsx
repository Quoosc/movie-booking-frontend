// src/components/common/Navbar.jsx
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaRegUser } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { LuCalendarClock } from "react-icons/lu";
import { PiCalendarCheckBold, PiPopcornBold } from "react-icons/pi";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
import CinemaDropdown from "@/components/cinema/CinemaDropdown";

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
    await logout();
    setOpenUserMenu(false);
    setOpen(false);
    nav("/", { replace: true });
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
              src="/public/movies/—Pngtree—film festival logo popcorn and_4686389.png"
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
            <button className={`${LinkBase} flex items-center gap-2`}>
              <CinemaDropdown />
              {Underline}
            </button>

            <button className={`${LinkBase} flex items-center gap-2`}>
              <LuCalendarClock className="text-[#ff7af6]" />
              <span>Lịch chiếu</span>
              {Underline}
            </button>

            <span className="opacity-25">|</span>

            <NavLink
              to="/promotions"
              className={({ isActive }) =>
                `${LinkBase} ${isActive ? "text-white" : ""}`
              }
            >
              Khuyến mãi
              {Underline}
            </NavLink>

            <NavLink
              to="/about"
              className={({ isActive }) =>
                `${LinkBase} ${isActive ? "text-white" : ""}`
              }
            >
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
              Lịch chiếu
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

// // src/components/common/Navbar.jsx
// import { useState } from "react";
// import { Link, NavLink, useNavigate } from "react-router-dom";
// import { FaRegUser } from "react-icons/fa";
// import { LuCalendarClock } from "react-icons/lu";
// import { PiPopcornBold, PiCalendarCheckBold } from "react-icons/pi";
// import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";
// import CinemaDropdown from "@/components/cinema/CinemaDropdown";
// import { useAuth } from "@/context/AuthContext";

// export default function Navbar() {
//   const nav = useNavigate();
//   const [searchTerm, setSearchTerm] = useState("");
//   const [open, setOpen] = useState(false);
//   const [openUserMenu, setOpenUserMenu] = useState(false);

//   const { user, isAuthenticated, isMember, isAdmin, logout } = useAuth();
//   const displayName = user?.fullName || user?.name || user?.email || "Tài khoản";

//   const handleLogoutClick = async () => {
//     await logout();
//     setOpenUserMenu(false);
//     setOpen(false);
//     nav("/", { replace: true });
//   };

//   const handleSearch = () => {
//     const q = searchTerm.trim();
//     if (!q) return;
//     nav(`/movie/search?q=${encodeURIComponent(q)}`);
//   };

//   return (
//     <header className="sticky top-0 left-0 right-0 z-50 bg-[#050018]/98 backdrop-blur-2xl border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
//       {/* Glow tím hồng mờ phía trên */}
//       <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#7b5cff33] via-transparent to-transparent" />

//       <div className="relative max-w-7xl mx-auto px-4">
//         <div className="flex flex-col">
//           {/* ROW 1: Logo + Search + CTA + Auth */}
//           <div className="h-20 flex items-center justify-between gap-4">
//             {/* Left: Logo + Mobile Menu */}
//             <div className="flex items-center gap-4">
//               <button
//                 onClick={() => setOpen(true)}
//                 className="md:hidden text-[#d4ddff]/80 hover:text-white transition"
//               >
//                 <HiOutlineMenu className="w-7 h-7" />
//               </button>

//               <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition">
//                 <img
//                   src="/public/movies/—Pngtree—film festival logo popcorn and_4686389.png"
//                   alt="CinesVerse"
//                   className="h-10 w-auto drop-shadow-[0_0_20px_rgba(123,92,255,0.9)]"
//                 />
//               </Link>
//             </div>

//             {/* Search */}
//             <div className="flex-1 max-w-2xl mx-4">
//               <div className="relative group">
//                 <input
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   onKeyDown={(e) => e.key === "Enter" && handleSearch()}
//                   placeholder="Tìm phim, rạp, suất chiếu..."
//                   className="w-full rounded-full py-3 pl-5 pr-12 text-sm bg-[#0f001f]/80 border border-[#7b5cff]/30 text-white placeholder:text-[#9ca3ff]/70 outline-none focus:ring-2 focus:ring-[#7b5cff]/60 focus:border-[#43e1ff] transition-all duration-300"
//                 />
//                 <button
//                   onClick={handleSearch}
//                   className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center text-[#9ca3ff] hover:text-white hover:bg-white/10 transition"
//                 >
//                   <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                     <circle cx="11" cy="11" r="8" />
//                     <path d="M21 21l-4.35-4.35" />
//                   </svg>
//                 </button>
//               </div>
//             </div>

//             {/* CTA + Auth */}
//             <div className="flex items-center gap-3">
//               {/* CTA Đặt vé */}
//               <button
//                 onClick={() => nav("/movie/movies")}
//                 className="hidden lg:flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6] text-white font-extrabold text-sm tracking-wider shadow-xl shadow-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/70 hover:scale-105 transition-all duration-300"
//               >
//                 <PiCalendarCheckBold className="text-lg" />
//                 <PiPopcornBold className="text-lg" />
//                 <span>ĐẶT VÉ NGAY</span>
//               </button>

//               {/* Auth */}
//               {!isAuthenticated ? (
//                 <>
//                   <button
//                     onClick={() => nav("/auth/login")}
//                     className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/20 bg-white/5 text-[#d4ddff] hover:bg-white/10 hover:border-[#7b5cff]/60 transition-all"
//                   >
//                     <FaRegUser />
//                     <span className="font-semibold">Đăng nhập</span>
//                   </button>
//                   <button
//                     onClick={() => nav("/auth/register")}
//                     className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6] text-white font-extrabold text-sm hover:shadow-xl hover:shadow-purple-500/60 transition-all"
//                   >
//                     Đăng ký
//                   </button>
//                 </>
//               ) : (
//                 <div className="relative">
//                   <button
//                     onClick={() => setOpenUserMenu(!openUserMenu)}
//                     className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/20 bg-white/5 text-[#d4ddff] hover:bg-white/10 hover:border-[#7b5cff]/60 transition-all"
//                   >
//                     <FaRegUser />
//                     <span className truncate кури="font-semibold truncate max-w-32">{displayName}</span>
//                   </button>

//                   {openUserMenu && (
//                     <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#050018] border border-white/15 shadow-2xl py-2 text-sm">
//                       {isMember && (
//                         <>
//                           <button
//                             onClick={() => { setOpenUserMenu(false); nav("/account/account-profile"); }}
//                             className="w-full text-left px-4 py-2.5 hover:bg-white/10 text-[#e5e7ff]"
//                           >
//                             Hồ sơ cá nhân
//                           </button>
//                           <button
//                             onClick={() => { setOpenUserMenu(false); nav("/account/account-history"); }}
//                             className="w-full text-left px-4 py-2.5 hover:bg-white/10 text-[#e5e7ff]"
//                           >
//                             Lịch sử đặt vé
//                           </button>
//                         </>
//                       )}
//                       {isAdmin && (
//                         <button
//                           onClick={() => { setOpenUserMenu(false); nav("/admin"); }}
//                           className="w-full text-left px-4 py-2.5 hover:bg-white/10 text-yellow-400"
//                         >
//                           Admin Dashboard
//                         </button>
//                       )}
//                       <div className="h-px bg-white/10 my-1" />
//                       <button
//                         onClick={handleLogoutClick}
//                         className="w-full text-left px-4 py-2.5 hover:bg-red-500/10 text-red-300"
//                       >
//                         Đăng xuất
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* ROW 2: Menu ngang – ĐỒNG BỘ MÀU VỚI ROW 1 */}
//           <div className="h-14 flex items-center border-t border-white/10">
//             <nav className="flex items-center gap-8 text-sm font-medium">
//               <CinemaDropdown />

//               <NavLink
//                 to="/showtimes"
//                 className={({ isActive }) =>
//                   `flex items-center gap-2 transition-all ${isActive ? "text-white" : "text-[#d4ddff]/80 hover:text-white"}`
//                 }
//               >
//                 <LuCalendarClock className="text-[#ff7af6]" />
//                 Lịch chiếu
//               </NavLink>

//               <NavLink
//                 to="/promotions"
//                 className={({ isActive }) =>
//                   `transition-all ${isActive ? "text-white" : "text-[#d4ddff]/80 hover:text-white"}`
//                 }
//               >
//                 Khuyến mãi
//               </NavLink>

//               <NavLink
//                 to="/entertainment"
//                 className={({ isActive }) =>
//                   `transition-all ${isActive ? "text-white" : "text-[#d4ddff]/80 hover:text-white"}`
//                 }
//               >
//                 Các dịch vụ giải trí khác
//               </NavLink>

//               <NavLink
//                 to="/about"
//                 className={({ isActive }) =>
//                   `transition-all ${isActive ? "text-white" : "text-[#d4ddff]/80 hover:text-white"}`
//                 }
//               >
//                 Giới thiệu
//               </NavLink>
//             </nav>
//           </div>
//         </div>
//       </div>

//       {/* Mobile Drawer – giữ nguyên đẹp */}
//       <div className={`fixed inset-0 z-50 transition ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
//         <div
//           className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity ${open ? "opacity-100" : "opacity-0"}`}
//           onClick={() => setOpen(false)}
//         />
//         <div className={`absolute left-0 top-0 h-full w-80 bg-[#050018] border-r border-white/10 transform transition-transform ${open ? "translate-x-0" : "-translate-x-full"}`}>
//           <div className="px-4 py-4 flex items-center justify-between border-b border-white/10">
//             <img src="/public/movies/—Pngtree—film festival logo popcorn and_4686389.png" className="h-8 drop-shadow-[0_0_10px_rgba(123,92,255,0.9)]" alt="CinesVerse" />
//             <button onClick={() => setOpen(false)} className="text-[#d4ddff]/80 hover:text-white transition">
//               <HiOutlineX className="w-7 h-7" />
//             </button>
//           </div>

//           <div className="p-4 space-y-3 text-sm">
//             {!isAuthenticated ? (
//               <>
//                 <button onClick={() => { setOpen(false); nav("/auth/login"); }} className="w-full px-4 py-3 rounded-xl border border-white/12 bg-white/4 text-[#d4ddff] hover:bg-white/8 transition flex items-center gap-2">
//                   <FaRegUser className="text-[#7b5cff]" /> Đăng nhập
//                 </button>
//                 <button onClick={() => { setOpen(false); nav("/auth/register"); }} className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6] text-white font-extrabold hover:shadow-[0_0_16px_rgba(123,92,255,0.9)] transition">
//                   Đăng ký
//                 </button>
//               </>
//             ) : (
//               <div className="space-y-2">
//                 <div className="px-1 py-2 text-[#e5e7ff]/90">
//                   <div className="flex items-center gap-2">
//                     <FaRegUser className="text-[#7b5cff]" />
//                     <div>
//                       <span className="font-semibold">{displayName}</span>
//                       <span className="block text-[11px] text-[#9ca3ff]">
//                         {isAdmin ? "Quản trị viên" : isMember ? "Thành viên" : "Khách"}
//                       </span>
//                     </div>
//                   </div>
//                 </div>

//                 {isMember && (
//                   <>
//                     <button onClick={() => { setOpen(false); nav("/account/account-profile"); }} className="w-full text-left text-[#d4ddff]/85 py-2">Hồ sơ cá nhân</button>
//                     <button onClick={() => { setOpen(false); nav("/account/account-history"); }} className="w-full text-left text-[#d4ddff]/85 py-2">Lịch sử đặt vé</button>
//                   </>
//                 )}
//                 {isAdmin && (
//                   <button onClick={() => { setOpen(false); nav("/admin"); }} className="w-full text-left text-yellow-400 py-2">Admin Dashboard</button>
//                 )}
//                 <div className="h-px bg-white/10 my-2" />
//                 <button onClick={handleLogoutClick} className="w-full text-left text-red-300 py-2">Đăng xuất</button>
//               </div>
//             )}

//             <div className="h-px bg-white/10 my-2" />
//             <button className="w-full text-left text-[#d4ddff]/85 py-2">Chọn rạp</button>
//             <button className="w-full text-left text-[#d4ddff]/85 py-2">Lịch chiếu</button>
//             <button onClick={() => { setOpen(false); nav("/promotions"); }} className="w-full text-left text-[#d4ddff]/85 py-2">Khuyến mãi</button>
//             <button onClick={() => { setOpen(false); nav("/entertainment"); }} className="w-full text-left text-[#d4ddff]/85 py-2">Các dịch vụ giải trí khác</button>
//             <button onClick={() => { setOpen(false); nav("/about"); }} className="w-full text-left text-[#d4ddff]/85 py-2">Giới thiệu</button>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }
