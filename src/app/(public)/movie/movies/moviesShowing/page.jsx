// src/app/(public)/movie/movies/moviesShowing/page.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import MovieCard from "@/components/movies/MovieCard";
import { getShowingMovies } from "@/api/movieService";
import HomeButton from "@/components/shared/Buttons/HomeButton";

// ✅ NEWEST FIRST: createdAt desc (fallback updatedAt), tie-break by id desc
function sortMoviesNewestFirst(list) {
  const toTime = (x) => {
    const v =
      x?.createdAt ||
      x?.created_at ||
      x?.createdDate ||
      x?.created_date ||
      // fallback nếu BE trả updatedAt mà createdAt thiếu
      x?.updatedAt ||
      x?.updated_at;
    const t = v ? new Date(v).getTime() : NaN;
    return Number.isFinite(t) ? t : 0;
  };

  const toId = (x) => String(x?.movieId || x?.movie_id || x?.id || "");

  return [...list].sort((a, b) => {
    const ta = toTime(a);
    const tb = toTime(b);

    // ✅ DESC: mới lên đầu
    if (tb !== ta) return tb - ta;

    // tie-breaker ổn định: id DESC (uuid string compare)
    const ida = toId(a);
    const idb = toId(b);
    return idb.localeCompare(ida);
  });
}

export default function MoviesShowingPage() {
  const nav = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const res = await getShowingMovies();

        // ✅ unwrap: hỗ trợ cả dạng array và dạng {code,message,data}
        const arr = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res)
          ? res
          : [];

        setMovies(sortMoviesNewestFirst(arr));
      } catch (err) {
        console.error("Load showing movies failed", err);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className=" min-h-screen bg-gradient-to-b from-[#050024] via-[#0b0630] to-[#020015] text-white relative overflow-hidden ">
      {" "}
      <div className="pointer-events-none absolute inset-0">
        {" "}
        <div className=" absolute left-1/2 top-[16%] -translate-x-1/2 -translate-y-1/2 w-[165vw] h-[95vh] md:w-[115vw] md:h-[80vh] bg-[radial-gradient(ellipse_at_center,#7b5cff9a,transparent_45%)] blur-[110px] opacity-100 " />{" "}
        <div className=" absolute left-1/2 top-[18%] -translate-x-1/2 -translate-y-1/2 w-[130vw] h-[85vh] md:w-[105vw] md:h-[70vh] bg-[radial-gradient(ellipse_at_center,#ff7af64d,transparent_55%)] blur-[135px] opacity-80 " />{" "}
      </div>{" "}
      <div className=" absolute left-1/2 top-[22%] -translate-x-1/2 -translate-y-1/2 w-[165vw] h-[95vh] md:w-[115vw] md:h-[80vh] bg-[radial-gradient(ellipse_at_center,#7b5cff9a,transparent_45%)] blur-[110px] opacity-100 " />{" "}
      <div className=" absolute left-1/2 top-[24%] -translate-x-1/2 -translate-y-1/2 w-[130vw] h-[85vh] md:w-[105vw] md:h-[70vh] bg-[radial-gradient(ellipse_at_center,#ff7af64d,transparent_55%)] blur-[135px] opacity-80 " />{" "}
      <div className=" absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 w-[165vw] h-[90vh] md:w-[110vw] md:h-[75vh] bg-[radial-gradient(ellipse_at_center,#43e1ff66,transparent_50%)] blur-[120px] opacity-90 " />{" "}
      <div className=" absolute left-1/2 top-[36%] -translate-x-1/2 -translate-y-1/2 w-[165vw] h-[95vh] md:w-[115vw] md:h-[80vh] bg-[radial-gradient(ellipse_at_center,#7b5cff9a,transparent_45%)] blur-[110px] opacity-100 " />{" "}
      <div className=" absolute left-1/2 top-[32%] -translate-x-1/2 -translate-y-1/2 w-[130vw] h-[85vh] md:w-[105vw] md:h-[70vh] bg-[radial-gradient(ellipse_at_center,#ff7af64d,transparent_55%)] blur-[135px] opacity-80 " />
      <Navbar />
      <main className="relative z-10 pb-16">
        <section className="max-w-6xl mx-auto px-4 pt-10 pb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1
              className="
                text-2xl md:text-3xl lg:text-4xl
                font-extrabold uppercase
                tracking-[0.15em]
                bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6]
                bg-clip-text text-transparent
                drop-shadow-[0_0_18px_rgba(123,92,255,0.7)]
                text-center md:text-left
              "
            >
              PHIM ĐANG CHIẾU
            </h1>

            <p
              className="
                mt-2 text-xs md:text-sm text-white/60
                text-center md:text-left
                max-w-xl
              "
            >
              Toàn bộ phim đang chiếu tại hệ thống rạp CinesVerse. Chọn phim bạn
              thích và đặt vé ngay chỉ với vài bước.
            </p>
          </div>

          <div className="flex justify-center md:justify-end gap-2">
            <HomeButton />
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4">
          <div className="rounded-3xl bg-white/[0.03] border border-white/10 shadow-[0_22px_70px_rgba(0,0,0,0.85)] px-4 md:px-6 py-6 md:py-8">
            {loading ? (
              <p className="text-center text-sm text-white/70 py-6">
                Đang tải danh sách phim...
              </p>
            ) : movies.length === 0 ? (
              <p className="text-center text-sm text-white/60 py-6">
                Hiện chưa có phim đang chiếu.
              </p>
            ) : (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
                style={{ direction: "rtl" }}
              >
                {movies.map((m) => {
                  const key = m?.movieId || m?.movie_id || m?.id;
                  return (
                    <div key={key} className="flex">
                      <MovieCard m={m} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
