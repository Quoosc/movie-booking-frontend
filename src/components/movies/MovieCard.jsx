// src/components/movies/MovieCard.jsx
import { Link, useNavigate } from "react-router-dom";

export default function MovieCard({ m }) {
  const nav = useNavigate();

  const handleBookClick = (e) => {
    e.stopPropagation();
    nav(`/movie/${m.id}`);
  };

  const handleTrailerClick = (e) => {
    e.stopPropagation();
    if (m.trailerUrl) {
      window.open(m.trailerUrl, "_blank");
    }
  };

  return (
    <Link
      to={`/movie/${m.id}`}
      className="group relative rounded-xl overflow-hidden bg-[#0f1626] border border-white/10 transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.12)] hover:-translate-y-1"
    >
      {/* Poster */}
      <div className="aspect-[3/4] bg-black/30 overflow-hidden relative rounded-t-2xl">
        <img
          src={m.posterUrl}
          alt={m.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Overlay khi hover */}
        <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3 gap-2">
          <button
            onClick={handleBookClick}
            className="w-full inline-flex items-center justify-center h-9 rounded-md bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6] text-white font-extrabold text-[11px] hover:brightness-110 transition"
          >
            ĐẶT VÉ
          </button>
          <button
            onClick={handleTrailerClick}
            className="w-full inline-flex items-center justify-center h-9 rounded-md border border-white/30 text-white/90 hover:bg-white/10 text-[11px] transition"
          >
            TRAILER
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 bg-black/85 backdrop-blur-sm border-t border-white/10 h-[104px] flex flex-col rounded-b-2xl">
        <h4 className="text-white font-bold text-sm leading-[19px] h-[38px] line-clamp-2">
          {m.title || "\u00A0"}
        </h4>

        <p className="text-[10px] text-[#9ca3ff] uppercase tracking-wide leading-[14px] h-[14px] line-clamp-1">
          {m.genre || "\u00A0"}
        </p>

        <div className="mt-1 flex items-center gap-1.5 text-[10px] text-white/55 leading-[14px] h-[14px] overflow-hidden">
          {m.minimumAge ? (
            <span className="px-1.5 py-0.5 rounded-sm bg-[#ff4b4b] text-[9px] font-extrabold text-white">
              T{m.minimumAge}
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded-sm opacity-0 text-[9px] font-extrabold">
              T00
            </span>
          )}

          <span className="truncate">
            {m.duration ? `${m.duration} phút` : "\u00A0"}
          </span>

          <span className="truncate">
            {m.language ? `• ${m.language}` : "\u00A0"}
          </span>
        </div>
      </div>
    </Link>
  );
}
