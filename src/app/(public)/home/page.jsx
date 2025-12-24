// src/app/(public)/home/page.jsx

import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";
import { useNavigate } from "react-router-dom";

import Navbar from "@/components/common/Navbar";
import MovieCarousel from "@/components/movies/MovieCarousel";
import { getShowingMovies, getUpcomingMovies } from "@/api/movieService";
import Footer from "@/components/common/Footer";
import MembershipHighlight from "@/components/membership/MembershipHighlight";
import ContactSection from "@/components/contact/ContactSection";
import PromoHighlight from "@/components/promotions/PromoHighlight";
import HeroSlider from "@/components/home/HeroSlider";

// ✅ unwrap đúng dạng response: { code, message, data }
function unwrapMovies(res) {
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res)) return res;
  return [];
}

// ✅ "mới thêm" = sort theo createdAt/created_at (KHÔNG dùng updatedAt)
function sortMoviesByCreatedDesc(list) {
  const toTime = (x) => {
    const v =
      x?.createdAt ||
      x?.created_at ||
      x?.createdDate ||
      x?.created_date ||
      x?.created; // fallback hiếm
    const t = v ? new Date(v).getTime() : NaN;
    return Number.isFinite(t) ? t : 0;
  };

  return [...list].sort((a, b) => {
    const diff = toTime(b) - toTime(a);
    if (diff !== 0) return diff;

    // tie-breaker ổn định nếu createdAt trùng nhau
    const ida = String(a?.movieId || a?.id || "");
    const idb = String(b?.movieId || b?.id || "");
    return idb.localeCompare(ida); // desc
  });
}

export default function HomePage() {
  const [showingMovies, setShowingMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);

  const [activeMembership, setActiveMembership] = useState(null);

  const membershipRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [showingRes, upcomingRes] = await Promise.all([
          getShowingMovies(),
          getUpcomingMovies(),
        ]);

        const showingArr = unwrapMovies(showingRes);
        const upcomingArr = unwrapMovies(upcomingRes);

        setShowingMovies(sortMoviesByCreatedDesc(showingArr));
        setUpcomingMovies(sortMoviesByCreatedDesc(upcomingArr));

        // DEBUG nếu vẫn thấy "chưa đảo"
        // console.table(
        //   sortMoviesByCreatedDesc(showingArr).map((x) => ({
        //     title: x.title,
        //     createdAt: x.createdAt || x.created_at,
        //     updatedAt: x.updatedAt || x.updated_at,
        //   }))
        // );
      } catch (e) {
        console.error("HomePage fetch movies error:", e);
        setShowingMovies([]);
        setUpcomingMovies([]);
      }
    };
    fetchData();
  }, []);

  const scrollInto = (ref) => {
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  function smoothScrollToTop() {
    animate(window.scrollY, 0, {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => window.scrollTo(0, latest),
    });
  }

  const handleSelectMembership = (id) => {
    setActiveMembership(id);
    setTimeout(() => scrollInto(membershipRef), 0);
  };

  const handleBackMembership = () => {
    setActiveMembership(null);
    scrollInto(membershipRef);
  };

  return (
    <div className=" min-h-screen bg-gradient-to-b from-[#050024] via-[#0b0630] to-[#020015] text-white relative overflow-hidden ">
      {" "}
      <div className="pointer-events-none absolute inset-0">
        {/* DECOR GIF 2 BÊN (NHỎ) */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <img
            src="https://iguov8nhvyobj.vcdn.cloud/media/wysiwyg/2025/112025/floating_left_1.gif"
            alt=""
            loading="lazy"
            className="
      hidden xl:block
      absolute left-16 top-1/2 -translate-y-1/2
      w-[120px] 2xl:w-[140px]
      opacity-70 mix-blend-screen
    "
          />

          <img
            src="https://iguov8nhvyobj.vcdn.cloud/media/wysiwyg/2025/112025/floating_left_1.gif"
            alt=""
            loading="lazy"
            className="
      hidden xl:block
      absolute right-16 top-1/2 -translate-y-1/2
      w-[120px] 2xl:w-[140px]
      opacity-70 mix-blend-screen
    "
          />
        </div>{" "}
        <div
          className=" absolute left-1/2 top-[6%] -translate-x-1/2 -translate-y-1/2 w-[220vw] h-[95vh]
 md:w-[115vw] md:h-[80vh] bg-[radial-gradient(ellipse_at_center,#7b5cff9a,transparent_45%)] blur-[110px] opacity-100 "
        />{" "}
        <div className=" absolute left-1/2 top-[6%] -translate-x-1/2 -translate-y-1/2 w-[165vw] h-[95vh] md:w-[115vw] md:h-[80vh] bg-[radial-gradient(ellipse_at_center,#7b5cff9a,transparent_45%)] blur-[110px] opacity-100 " />{" "}
        <div className=" absolute left-1/2 top-[8%] -translate-x-1/2 -translate-y-1/2 w-[130vw] h-[85vh] md:w-[105vw] md:h-[70vh] bg-[radial-gradient(ellipse_at_center,#ff7af64d,transparent_55%)] blur-[135px] opacity-80 " />{" "}
      </div>{" "}
      <div className=" absolute left-1/2 top-[12%] -translate-x-1/2 -translate-y-1/2 w-[165vw] h-[95vh] md:w-[115vw] md:h-[80vh] bg-[radial-gradient(ellipse_at_center,#7b5cff9a,transparent_45%)] blur-[110px] opacity-100 " />{" "}
      <div className=" absolute left-1/2 top-[12%] -translate-x-1/2 -translate-y-1/2 w-[130vw] h-[85vh] md:w-[105vw] md:h-[70vh] bg-[radial-gradient(ellipse_at_center,#ff7af64d,transparent_55%)] blur-[135px] opacity-80 " />{" "}
      <div className="pointer-events-none absolute inset-0">
        {" "}
        <div className=" absolute left-1/2 top-[16%] -translate-x-1/2 -translate-y-1/2 w-[380vw] h-[95vh] md:w-[115vw] md:h-[80vh] bg-[radial-gradient(ellipse_at_center,#7b5cff9a,transparent_45%)] blur-[110px] opacity-100 " />{" "}
        <div className=" absolute left-1/2 top-[18%] -translate-x-1/2 -translate-y-1/2 w-[130vw] h-[85vh] md:w-[105vw] md:h-[70vh] bg-[radial-gradient(ellipse_at_center,#ff7af64d,transparent_55%)] blur-[135px] opacity-80 " />{" "}
      </div>{" "}
      <div className=" absolute left-1/2 top-[22%] -translate-x-1/2 -translate-y-1/2 w-[165vw] h-[95vh] md:w-[115vw] md:h-[80vh] bg-[radial-gradient(ellipse_at_center,#7b5cff9a,transparent_45%)] blur-[110px] opacity-100 " />{" "}
      <div className=" absolute left-1/2 top-[24%] -translate-x-1/2 -translate-y-1/2 w-[130vw] h-[85vh] md:w-[105vw] md:h-[70vh] bg-[radial-gradient(ellipse_at_center,#ff7af64d,transparent_55%)] blur-[135px] opacity-80 " />{" "}
      <div className=" absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 w-[165vw] h-[90vh] md:w-[110vw] md:h-[75vh] bg-[radial-gradient(ellipse_at_center,#43e1ff66,transparent_50%)] blur-[120px] opacity-90 " />{" "}
      <div className=" absolute left-1/2 top-[36%] -translate-x-1/2 -translate-y-1/2 w-[165vw] h-[95vh] md:w-[115vw] md:h-[80vh] bg-[radial-gradient(ellipse_at_center,#7b5cff9a,transparent_45%)] blur-[110px] opacity-100 " />{" "}
      <div className=" absolute left-1/2 top-[32%] -translate-x-1/2 -translate-y-1/2 w-[130vw] h-[85vh] md:w-[105vw] md:h-[70vh] bg-[radial-gradient(ellipse_at_center,#ff7af64d,transparent_55%)] blur-[135px] opacity-80 " />
      {/* đến đây */}
      <Navbar />
      {/* MAIN */}
      <main className="relative z-10 flex-1">
        {/* Hero */}
        <div className="pt-10 md:pt-12">
          <HeroSlider />
        </div>

        {/* ✅ PHIM ĐANG CHIẾU: đã sort sẵn trong state */}
        <div className="mt-8">
          <MovieCarousel
            title="PHIM ĐANG CHIẾU"
            movies={showingMovies}
            onShowAll={() => {
              smoothScrollToTop();
              navigate("/movie/moviesShowing");
            }}
            titleClass="bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(123,92,255,0.7)]"
          />
        </div>

        {/* ✅ PHIM SẮP CHIẾU */}
        <div className="mt-1">
          <MovieCarousel
            title="PHIM SẮP CHIẾU"
            movies={upcomingMovies}
            onShowAll={() => {
              smoothScrollToTop();
              navigate("/movie/moviesUpComming");
            }}
            titleClass="bg-gradient-to-r from-[#ff7af6] via-[#7b5cff] to-[#43e1ff] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(255,122,246,0.7)]"
          />
        </div>

        {/* KHUYẾN MÃI */}
        <div className="mt-14">
          <PromoHighlight />
        </div>

        {/* MEMBERSHIP  */}
        <div className="mt-16">
          <MembershipHighlight
            onSelect={(id) => {
              smoothScrollToTop();
              navigate(`/membership?type=${id}`);
            }}
          />
        </div>

        {/* LIÊN HỆ */}
        <div className="mt-16">
          <ContactSection />
        </div>
      </main>
      {/* FOOTER */}
      <Footer />
    </div>
  );
}
