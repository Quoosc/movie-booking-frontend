// // src/components/movies/MovieCard.jsx
// export default function MovieCard({ m }) {
//   return (
//     <div className="group relative rounded-xl overflow-hidden bg-[#0f1626] border border-white/10 transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
//       {/* Poster */}
//       <div className="aspect-[3/4] bg-black/20 overflow-hidden relative">
//         <img
//           src={m.posterUrl}
//           alt={m.title}
//           className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
//         />

//         {/* Overlay nút khi hover */}
//         <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3 gap-2">
//           <button className="w-full inline-flex items-center justify-center h-9 rounded-md bg-[#FFE700] text-[#111] font-extrabold text-[11px] hover:brightness-95 transition">
//             ĐẶT VÉ
//           </button>
//           <button className="w-full inline-flex items-center justify-center h-9 rounded-md border border-white/25 text-white/90 hover:bg-white/10 text-[11px] transition">
//             TRAILER
//           </button>
//         </div>
//       </div>

//       {/* Info */}
//       <div className="p-3 flex flex-col gap-2">
//         <h4 className="text-white font-bold text-sm leading-snug line-clamp-2 min-h-[40px]">
//           {m.title}
//         </h4>
//         <p className="text-[10px] text-white/60 uppercase tracking-wide">
//           {m.genre}
//         </p>
//         <div className="mt-1 flex items-center gap-1 text-[10px] text-white/50">
//           {m.minimumAge && (
//             <span className="px-1.5 py-0.5 rounded-sm bg-[#ff4b4b] text-[9px] font-extrabold text-white">
//               T{m.minimumAge}
//             </span>
//           )}
//           {m.duration && <span>{m.duration} phút</span>}
//           {m.language && <span>• {m.language}</span>}
//         </div>
//       </div>
//     </div>
//   );
// }
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
      <div className="aspect-[3/4] bg-black/30 overflow-hidden relative">
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
      <div className="p-3 flex flex-col gap-1.5">
        <h4 className="text-white font-bold text-sm leading-snug line-clamp-2 min-h-[38px]">
          {m.title}
        </h4>
        <p className="text-[10px] text-[#9ca3ff] uppercase tracking-wide">
          {m.genre}
        </p>
        <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-white/55">
          {m.minimumAge && (
            <span className="px-1.5 py-0.5 rounded-sm bg-[#ff4b4b] text-[9px] font-extrabold text-white">
              T{m.minimumAge}
            </span>
          )}
          {m.duration && <span>{m.duration} phút</span>}
          {m.language && <span>• {m.language}</span>}
        </div>
      </div>
    </Link>
  );
}
