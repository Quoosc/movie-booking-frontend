// // src/components/common/Navbar.jsx
// import { useState } from "react";
// import { Link, NavLink, useNavigate } from "react-router-dom";
// import { FaRegUser } from "react-icons/fa";
// import { FaLocationDot } from "react-icons/fa6";
// import { LuCalendarClock } from "react-icons/lu";
// import { PiCalendarCheckBold, PiPopcornBold } from "react-icons/pi";
// import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";

// export default function Navbar() {
//   const nav = useNavigate();
//   const [open, setOpen] = useState(false);
//   const [langOpen, setLangOpen] = useState(false);

//   const LinkBase =
//     "relative py-3 text-white/85 hover:text-white transition group";
//   const Underline = (
//     <span className="absolute left-0 -bottom-0.5 h-[2px] w-0 bg-gradient-to-r from-[#FFE700] via-[#FFCA28] to-[#FFD700] rounded-full transition-all duration-300 group-hover:w-full" />
//   );

//   return (
//     <header className="sticky top-0 z-50">
//       {/* Glow backdrop */}
//       <div className="pointer-events-none absolute inset-0 h-[92px] bg-gradient-to-b from-[#FFD700]/10 via-transparent to-transparent" />

//       {/* Row 1 */}
//       <div className="border-b border-white/10 bg-[#0b1220]/70 backdrop-blur-xl">
//         <div className="max-w-7xl mx-auto px-4">
//           <div className="h-[68px] flex items-center gap-3">
//             {/* Hamburger */}
//             <button
//               className="md:hidden text-white/80 hover:text-white"
//               onClick={() => setOpen(true)}
//               aria-label="Open Menu"
//             >
//               <HiOutlineMenu className="w-7 h-7" />
//             </button>

//             {/* Logo */}
//             <Link to="/" className="flex items-center gap-2 shrink-0">
//               <img
//                 src="/cinestar_logo_light.png"
//                 alt="Cinestar"
//                 className="h-9 w-auto drop-shadow-[0_2px_8px_rgba(255,215,0,0.35)]"
//               />
//             </Link>

//             {/* CTA */}
//             <div className="hidden lg:flex items-center gap-2 ml-3">
//               <button
//                 onClick={() => nav("/")}
//                 className="group relative overflow-hidden px-4 py-2 rounded-xl border border-[#FFE700]/60 bg-[#FFE700] text-[#1a1a1a] font-extrabold tracking-wide hover:brightness-95 transition"
//                 title="Đặt vé ngay"
//               >
//                 <span className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-700 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
//                 <div className="flex items-center gap-2 relative">
//                   <PiCalendarCheckBold className="opacity-80" />
//                   ĐẶT VÉ NGAY
//                 </div>
//               </button>
//               <button
//                 onClick={() => nav("/")}
//                 className="group relative overflow-hidden px-4 py-2 rounded-xl border border-white/15 bg-gradient-to-r from-[#6D38B5] to-[#3C1361] text-white font-extrabold tracking-wide hover:opacity-95 transition shadow-[0_6px_20px_rgba(93,53,166,0.35)]"
//                 title="Đặt bắp nước"
//               >
//                 <span className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
//                 <div className="flex items-center gap-2 relative">
//                   <PiPopcornBold className="opacity-90" />
//                   ĐẶT BẮP NƯỚC
//                 </div>
//               </button>
//             </div>

//             {/* Search */}
//             <div className="flex-1 mx-3">
//               <div className="relative group">
//                 <input
//                   placeholder="Tìm phim, rạp"
//                   className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-4 pr-11 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-[#FFD700]/40 focus:border-[#FFD700]/40"
//                 />
//                 <svg
//                   className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/70 group-focus-within:text-white"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                 >
//                   <circle cx="11" cy="11" r="8" strokeWidth="2" />
//                   <path d="M21 21l-3.5-3.5" strokeWidth="2" />
//                 </svg>
//               </div>
//             </div>

//             {/* Auth + Lang */}
//             <div className="hidden md:flex items-center gap-3">
//               <button
//                 onClick={() => nav("/auth/login")}
//                 className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white/90 hover:text-white hover:bg-white/10 transition flex items-center gap-2"
//               >
//                 <FaRegUser />
//                 <span className="font-semibold">Đăng nhập</span>
//               </button>
//               <button
//                 onClick={() => nav("/auth/register")}
//                 className="px-3 py-2 rounded-lg bg-gradient-to-r from-[#FFE700] to-[#FFB300] text-black font-extrabold hover:opacity-90 transition border border-black/10"
//               >
//                 Đăng ký
//               </button>

             
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Row 2 */}
//       <div className="border-b border-white/10 bg-[#0b1220]/70 backdrop-blur-xl">
//         <div className="max-w-7xl mx-auto px-4">
//           <nav className="flex items-center gap-6 overflow-x-auto">
//             <button className={`${LinkBase} flex items-center gap-2`}>
//               <FaLocationDot className="text-[#FFD700]" />
//               <span>Chọn rạp</span>
//               {Underline}
//             </button>
//             <button className={`${LinkBase} flex items-center gap-2`}>
//               <LuCalendarClock className="text-[#FFD700]" />
//               <span>Lịch chiếu</span>
//               {Underline}
//             </button>

//             <span className="opacity-30">|</span>

//             <NavLink to="/promotions" className={({ isActive }) =>
//               `${LinkBase} ${isActive ? "text-white" : ""}`
//             }>
//               Khuyến mãi
//               {Underline}
//             </NavLink>
//             <NavLink to="/about" className={({ isActive }) =>
//               `${LinkBase} ${isActive ? "text-white" : ""}`
//             }>
//               Giới thiệu
//               {Underline}
//             </NavLink>
//           </nav>
//         </div>
//       </div>

//       {/* Mobile drawer */}
//       <div
//         className={`fixed inset-0 z-50 transition ${open ? "pointer-events-auto" : "pointer-events-none"}`}
//         aria-hidden={!open}
//       >
//         {/* backdrop */}
//         <div
//           className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity ${
//             open ? "opacity-100" : "opacity-0"
//           }`}
//           onClick={() => setOpen(false)}
//         />
//         {/* panel */}
//         <div
//           className={`absolute left-0 top-0 h-full w-80 bg-[#0b1220] border-r border-white/10 transform transition-transform ${
//             open ? "translate-x-0" : "-translate-x-full"
//           }`}
//         >
//           <div className="px-4 py-4 flex items-center justify-between border-b border-white/10">
//             <img src="/cinestar_logo_light.png" className="h-8" />
//             <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
//               <HiOutlineX className="w-7 h-7" />
//             </button>
//           </div>

//           <div className="p-4 space-y-3">
//             <button
//               onClick={() => { setOpen(false); nav("/auth/login"); }}
//               className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white/90 hover:bg-white/10 transition flex items-center gap-2"
//             >
//               <FaRegUser /> Đăng nhập
//             </button>
//             <button
//               onClick={() => { setOpen(false); nav("/auth/register"); }}
//               className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-[#FFE700] to-[#FFB300] text-black font-extrabold hover:opacity-90 transition"
//             >
//               Đăng ký
//             </button>

//             <div className="h-px bg-white/10 my-2" />

//             <button className="w-full text-left text-white/85 py-2">Chọn rạp</button>
//             <button className="w-full text-left text-white/85 py-2">Lịch chiếu</button>
//             <button onClick={() => { setOpen(false); nav("/promotions"); }} className="w-full text-left text-white/85 py-2">
//               Khuyến mãi
//             </button>
//             <button onClick={() => { setOpen(false); nav("/about"); }} className="w-full text-left text-white/85 py-2">
//               Giới thiệu
//             </button>
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { FaRegUser } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { LuCalendarClock } from "react-icons/lu";
import { PiCalendarCheckBold, PiPopcornBold } from "react-icons/pi";
import { HiOutlineMenu, HiOutlineX } from "react-icons/hi";

export default function Navbar() {
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  const LinkBase =
    "relative py-3 text-sm md:text-[15px] text-[#d4ddff]/80 hover:text-white transition-colors duration-200 group";

  const Underline = (
    <span className="absolute left-0 -bottom-0.5 h-[2px] w-0 bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6] rounded-full transition-all duration-300 group-hover:w-full" />
  );

  return (
    <header className="sticky top-0 z-50">
      {/* Neon glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[92px] bg-[radial-gradient(circle_at_top,#7b5cff33,transparent)]" />

      {/* ROW 1 */}
      <div className="border-b border-white/8 bg-[#040016]/90 backdrop-blur-xl shadow-[0_8px_26px_rgba(0,0,0,0.55)]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-[68px] flex items-center gap-3">
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
                onClick={() => nav("/")}
                className="group relative overflow-hidden px-4 py-2 rounded-xl border border-[#43e1ff]/70 bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6] text-white font-extrabold tracking-wide hover:shadow-[0_0_18px_rgba(123,92,255,0.9)] transition-all duration-300"
                title="Đặt vé ngay"
              >
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-700 bg-gradient-to-r from-transparent via-white/35 to-transparent" />
                <div className="flex items-center gap-2 relative z-10">
                  <PiCalendarCheckBold className="opacity-90" />
                  ĐẶT VÉ NGAY
                </div>
              </button>

              <button
                onClick={() => nav("/")}
                className="group relative overflow-hidden px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-[#e5e7ff] font-semibold hover:bg-white/[0.08] hover:shadow-[0_0_14px_rgba(255,255,255,0.16)] transition-all duration-300 flex items-center gap-2"
                title="Đặt bắp nước"
              >
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-700 bg-gradient-to-r from-transparent via-white/18 to-transparent" />
                <div className="flex items-center gap-2 relative z-10">
                  <PiPopcornBold className="text-[#ffdd55]" />
                  ĐẶT BẮP NƯỚC
                </div>
              </button>
            </div>

            {/* Search */}
            <div className="flex-1 mx-3">
              <div className="relative group">
                <input
                  placeholder="Tìm phim, rạp, suất chiếu..."
                  className="w-full bg-white/3 border border-white/10 rounded-full py-2.5 pl-4 pr-11 text-[13px] text-[#e5e7ff] placeholder-[#9ca3ff]/55 outline-none focus:ring-2 focus:ring-[#7b5cff]/55 focus:border-[#7b5cff]/70 transition-all"
                />
                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9ca3ff]/75 group-focus-within:text-[#ff7af6]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <circle cx="11" cy="11" r="8" strokeWidth="2" />
                  <path d="M21 21l-3.5-3.5" strokeWidth="2" />
                </svg>
              </div>
            </div>

            {/* Auth desktop */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => nav("/auth/login")} // ✅ dùng lại path 
                className="px-3 py-2 rounded-lg border border-white/15 bg-white/3 text-[#d4ddff] hover:text-white hover:bg-white/8 hover:border-[#7b5cff55] transition-all duration-200 flex items-center gap-2 text-[13px]"
              >
                <FaRegUser className="text-[#7b5cff]" />
                <span className="font-semibold">Đăng nhập</span>
              </button>
              <button
                onClick={() => nav("/auth/register")} // ✅ dùng lại path
                className="px-3 py-2 rounded-lg bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6] text-white font-extrabold text-[13px] hover:shadow-[0_0_16px_rgba(123,92,255,0.9)] hover:scale-[1.02] active:scale-100 transition-all duration-200 border border-[#43e1ff]/40"
              >
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2 */}
      <div className="border-b border-white/8 bg-[#030013]/92 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center gap-6 overflow-x-auto">
            <button className={`${LinkBase} flex items-center gap-2`}>
              <FaLocationDot className="text-[#43e1ff]" />
              <span>Chọn rạp</span>
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
        {/* backdrop */}
        <div
          className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity ${
            open ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setOpen(false)}
        />
        {/* panel */}
        <div
          className={`absolute left-0 top-0 h-full w-80 bg-[#040016] border-r border-white/10 transform transition-transform ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="px-4 py-4 flex items-center justify-between border-b border-white/10">
            <img
              src="/cinestar_logo_light.png"
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
            <button
              onClick={() => {
                setOpen(false);
                nav("/auth/login"); // ✅ mobile cũng dùng đúng path
              }}
              className="w-full px-4 py-3 rounded-xl border border-white/12 bg-white/4 text-[#d4ddff] hover:bg-white/8 transition flex items-center gap-2"
            >
              <FaRegUser className="text-[#7b5cff]" /> Đăng nhập
            </button>
            <button
              onClick={() => {
                setOpen(false);
                nav("/auth/register"); // ✅
              }}
              className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6] text-white font-extrabold hover:shadow-[0_0_16px_rgba(123,92,255,0.9)] transition"
            >
              Đăng ký
            </button>

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
