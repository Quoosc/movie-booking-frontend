// src/components/cinema/CinemaDropdown.jsx
import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaLocationDot } from "react-icons/fa6";
import { getAllCinemas } from "@/api/cinemaService";

export default function CinemaDropdown() {
  const [cinemas, setCinemas] = useState([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getAllCinemas();
        setCinemas(data || []);
      } catch (e) {
        console.error("Failed to load cinemas", e);
      }
    };
    load();
  }, []);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleSelectCinema = (cinemaId) => {
    setOpen(false);
    navigate(`/cinema/${cinemaId}`);
  };

  // Nhóm rạp theo city (nhìn gọn hơn nếu sau này nhiều rạp)
  const groupedByCity = useMemo(() => {
    const map = {};
    for (const c of cinemas) {
      const city = c.city || "Khác";
      if (!map[city]) map[city] = [];
      map[city].push(c);
    }
    return map;
  }, [cinemas]);

  return (
    <div className="relative" ref={wrapperRef}>
      {/* Nút CHỌN RẠP trong navbar row2 */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="
          inline-flex items-center gap-2
          text-[13px] font-semibold
          text-[#d0cff5]/85 hover:text-[#ffffff]
          transition-colors
        "
      >
        <FaLocationDot className="text-[15px] text-[#43e1ff]" />
        <span>Chọn rạp</span>
      </button>

      {/* Panel dropdown */}
      {open && (
        <div
          className="
            absolute left-0 mt-3 z-40
            w-[1000px] max-h-[400px] overflow-y-auto
            rounded-3xl border border-white/12
            bg-gradient-to-b from-[#050018]/98 via-[#050016]/98 to-[#02000f]/98
            shadow-[0_24px_80px_rgba(0,0,0,0.95)]
            backdrop-blur-xl
            
          "
        >
          {/* Header */}
          <div className="px-5 pt-4 pb-3 border-b border-white/8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="
                  w-8 h-8 rounded-2xl
                  bg-[radial-gradient(circle_at_top,#43e1ff55,transparent)]
                  flex items-center justify-center
                "
              >
                <FaLocationDot className="text-[#43e1ff] text-[16px]" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#9ca3ff]">
                  Hệ thống rạp CinesVerse
                </p>
                <p className="text-[11px] text-white/60 mt-0.5">
                  Chọn rạp bạn muốn xem lịch chiếu
                </p>
              </div>
            </div>
            <span className="text-[10px] text-white/55">
              {cinemas.length > 0 ? `${cinemas.length} rạp` : "Đang tải..."}
            </span>
          </div>

          {/* Danh sách rạp */}
          {cinemas.length === 0 ? (
            <p className="px-5 py-4 text-xs text-white/70">
              Đang tải danh sách rạp...
            </p>
          ) : (
            <div className="px-3 py-3 space-y-3">
              {Object.entries(groupedByCity).map(([city, list]) => (
                <div key={city} className="space-y-1.5">
                  {/* Tiêu đề city */}
                  <div className="flex items-center gap-2 px-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#43e1ff]" />
                    <p className="text-[11px] font-semibold text-[#cbd5ff] uppercase tracking-[0.18em]">
                      {city}
                    </p>
                  </div>

                  {/* Grid rạp trong city */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {list.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectCinema(c.id)}
                        className="
        group text-left
        px-3.5 py-2.5 rounded-2xl
        bg-white/[0.02]
        hover:bg-white/[0.06]
        border border-white/[0.04]
        hover:border-[#43e1ff]/40
        transition-all
        flex gap-3
      "
                      >
                        {/* Thumbnail rạp */}
                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-black/40 flex-shrink-0">
                          <img
                            src={c.thumbnailUrl}
                            alt={c.name}
                            className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-300"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          {/* ⬇️ bỏ truncate, cho line-clamp-2 để hiện đủ tên */}
                          <div className="text-[12px] font-semibold text-white line-clamp-2">
                            {c.name}
                          </div>
                          <div className="mt-0.5 text-[11px] text-white/60 line-clamp-2">
                            {c.address || c.city}
                          </div>

                          {/* Tag nhỏ */}
                          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-white/55">
                            <span className="px-1.5 py-[2px] rounded-full bg-white/[0.06]">
                              {c.district || "Cụm rạp"}
                            </span>
                            <span className="px-1.5 py-[2px] rounded-full bg-[#43e1ff14] text-[#8be7ff]">
                              Xem lịch chiếu
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
