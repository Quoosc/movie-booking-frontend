import { Link } from "react-router-dom";
import { HiHome } from "react-icons/hi";

export default function HomeButton({ className = "" }) {
	return (
		<Link
			to="/"
			className={`
        inline-flex items-center gap-1.5
        px-3 py-1.5 rounded-full
        bg-white/5 border border-[#7b5cff33]
        text-[10px] md:text-xs text-[#e5e7ff]
        backdrop-blur-sm
        shadow-[0_0_8px_rgba(123,92,255,0.35)]
        hover:bg-[#7b5cff22]
        hover:border-[#ffe700cc]
        hover:shadow-[0_0_14px_rgba(255,231,0,0.45)]
        transition-all duration-200
        ${className}
      `}
		>
			<div
				className="
          w-5 h-5 flex items-center justify-center rounded-full
          bg-gradient-to-tr from-[#ffe700] via-[#ff7af6] to-[#7b5cff]
          text-[#050816]
          shadow-[0_0_6px_rgba(255,231,0,0.9)]
        "
			>
				<HiHome className="text-[11px]" />
			</div>
			<span className="font-medium tracking-wide">Trang chủ</span>
		</Link>
	);
}
