// src/app/(public)/movie/movies/page.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import MovieCarousel from "@/components/movies/MovieCarousel";
import HomeButton from "@/components/shared/Buttons/HomeButton";

import { getShowingMovies, getUpcomingMovies } from "@/api/movieService";

export default function MoviesPage() {
  const nav = useNavigate();

  const [showingMovies, setShowingMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMovies = async () => {
      try {
        setLoading(true);

        const [showing, upcoming] = await Promise.all([
          getShowingMovies(),
          getUpcomingMovies(),
        ]);

        setShowingMovies(Array.isArray(showing) ? showing : []);
        setUpcomingMovies(Array.isArray(upcoming) ? upcoming : []);
      } catch (err) {
        console.error("Load movies failed", err);
        setShowingMovies([]);
        setUpcomingMovies([]);
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, []);

  return (
    <div className=" min-h-screen bg-gradient-to-b from-[#050024] via-[#0b0630] to-[#020015] text-white relative overflow-hidden ">
      {" "}
      <div className="pointer-events-none absolute inset-0">
        {" "}
        <div className=" absolute left-1/2 top-[18%] -translate-x-1/2 -translate-y-1/2 w-[165vw] h-[95vh] md:w-[115vw] md:h-[80vh] bg-[radial-gradient(ellipse_at_center,#7b5cff9a,transparent_45%)] blur-[110px] opacity-100 " />{" "}
        <div className=" absolute left-1/2 top-[18%] -translate-x-1/2 -translate-y-1/2 w-[130vw] h-[85vh] md:w-[105vw] md:h-[70vh] bg-[radial-gradient(ellipse_at_center,#ff7af64d,transparent_55%)] blur-[135px] opacity-80 " />{" "}
      </div>{" "}
      <div className=" absolute left-1/2 top-[6%] -translate-x-1/2 -translate-y-1/2 w-[165vw] h-[95vh] md:w-[115vw] md:h-[80vh] bg-[radial-gradient(ellipse_at_center,#7b5cff9a,transparent_45%)] blur-[110px] opacity-100 " />{" "}
      <div className=" absolute left-1/2 top-[6%] -translate-x-1/2 -translate-y-1/2 w-[130vw] h-[85vh] md:w-[105vw] md:h-[70vh] bg-[radial-gradient(ellipse_at_center,#ff7af64d,transparent_55%)] blur-[135px] opacity-80 " />{" "}
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
      <main className="relative z-10 pb-10">
        {/* ĐẶT VÉ NHANH (UI giống Cinestar, chưa cần filter logic) */}
        <section className="max-w-7xl mx-auto px-4 pt-6 pb-10">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h1
              className="
    text-center
    text-2xl md:text-3xl lg:text-4xl
    font-extrabold uppercase
    tracking-[0.25em]
    bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6]
    bg-clip-text text-transparent
    drop-shadow-[0_0_18px_rgba(123,92,255,0.7)]
  "
            >
              ĐẶT VÉ NHANH
            </h1>
            <HomeButton />
          </div>
        </section>

        {loading ? (
          <div className="max-w-7xl mx-auto px-4 pb-10 text-center text-sm text-white/70">
            Đang tải danh sách phim...
          </div>
        ) : (
          <>
            {/* PHIM ĐANG CHIẾU */}
            <MovieCarousel
              title="PHIM ĐANG CHIẾU"
              movies={showingMovies}
              onShowAll={() => nav("/movie/moviesShowing")}
            />

            {/* PHIM SẮP CHIẾU */}
            <MovieCarousel
              title="PHIM SẮP CHIẾU"
              movies={upcomingMovies}
              onShowAll={() => nav("/movie/moviesUpComming")}
            />
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
