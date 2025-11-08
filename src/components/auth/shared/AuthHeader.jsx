// src/components/auth/shared/AuthHeader.jsx
export default function AuthHeader({ title, content1, content2, showBrand = true }) {
  return (
    <div className="text-center mb-10 relative">
      <div className="relative inline-block mb-3">
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#FFD700] to-[#FFB300] bg-clip-text text-transparent mb-2 drop-shadow-[0_0_10px_rgba(255,215,0,0.25)]">
          {title}
        </h1>
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-28 h-[3px] bg-gradient-to-r from-[#FFD700] via-[#FFB300] to-transparent rounded-full"></div>
      </div>

      <p className="text-base font-light tracking-wide text-white/90 leading-relaxed">
        {content1}{' '}
        {showBrand && <span className="font-semibold text-[#FFD700]">Cinestar • </span>}
        {content2}
      </p>

      <div className="flex justify-center gap-2 mt-5">
        <div className="w-14 h-[2px] bg-gradient-to-r from-[#FFD700] to-transparent rounded-full"></div>
        <div className="w-3 h-3 bg-[#FFD700] rotate-45 shadow-[0_0_8px_#FFD700]"></div>
        <div className="w-14 h-[2px] bg-gradient-to-l from-[#FFD700] to-transparent rounded-full"></div>
      </div>
    </div>
  );
}
