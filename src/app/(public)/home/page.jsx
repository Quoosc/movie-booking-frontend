// // src/pages/HomePage.jsx

// sử dụng để chọn rạp hiện banner trong herobanner
// import { useEffect, useState } from 'react';
// import Navbar from '@/components/common/Navbar';
// import HeroBanner from '@/components/home/HeroBanner';
// import SectionTitle from '@/components/home/SectionTitle';
// import MovieCarousel from '@/components/movies/MovieCarousel';
// import { getAllMovies } from '@/api/movieService';

// export default function HomePage() {
//   const [movies, setMovies] = useState([]);

//   useEffect(() => {
//     const fetchMovies = async () => {
//       const res = await getAllMovies();
//       setMovies(res.data);
//     };
//     fetchMovies();
//   }, []);

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-[#0a0014] to-[#050911] text-white">
//       {/* 🔹 Thanh Navbar cố định trên đầu */}
//       <Navbar />

//       {/* 🔹 Banner đầu trang (ảnh rạp + tab) */}
//       <HeroBanner />

//       <div className="pt-6 md:pt-10">
//         {/* 🔹 Section 1: Phim đang chiếu */}
//         <MovieCarousel title="Phim đang chiếu" movies={movies} />

//         {/* 🔹 Section 2: Phim sắp chiếu */}
//         <MovieCarousel title="Phim sắp chiếu" movies={[...movies].reverse()} />
//       </div>
//     </div>
//   );
// }
// src/app/(public)/home/page.jsx
// src/app/(public)/home/page.jsx


// src/app/(public)/home/page.jsx

import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";

import Navbar from "@/components/common/Navbar";
import MovieCarousel from "@/components/movies/MovieCarousel";
import AllMoviesGrid from "@/components/movies/AllMoviesGrid";
import { getShowingMovies, getUpcomingMovies } from "@/api/movieService";
import Footer from "@/components/common/Footer";
import MembershipHighlight from "@/components/membership/MembershipHighlight";
import MembershipDetail from "@/components/membership/MembershipDetail";
import ContactSection from "@/components/contact/ContactSection";
import PromoHighlight from "@/components/promotions/PromoHighlight";
import HeroSlider from "@/components/home/HeroSlider";

export default function HomePage() {
  const [showingMovies, setShowingMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);

  const [showAllShowing, setShowAllShowing] = useState(false);
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);
  const [activeMembership, setActiveMembership] = useState(null);

  const showingRef = useRef(null);
  const upcomingRef = useRef(null);
  const membershipRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const showing = await getShowingMovies();
      const upcoming = await getUpcomingMovies();
      setShowingMovies(showing || []);
      setUpcomingMovies(upcoming || []);
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
    <div
      className="
        min-h-screen
        flex flex-col
        bg-gradient-to-b from-[#050018] via-[#080023] to-[#050018]
        text-white
        relative
        overflow-hidden
      "
    >
      {/* Neon background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-[8%] w-[520px] h-[520px] bg-[radial-gradient(circle_at_center,#7b5cff55,transparent)] blur-[110px]" />
        <div className="absolute top-[28%] right-[12%] w-[420px] h-[420px] bg-[radial-gradient(circle_at_center,#43e1ff40,transparent)] blur-[110px]" />
        <div className="absolute bottom-[-60px] left-1/3 w-[640px] h-[320px] bg-[radial-gradient(circle_at_center,#ff7af640,transparent)] blur-[130px]" />
      </div>

      <Navbar />

      {/* MAIN */}
      <main className="relative z-10 flex-1">
        {/* Hero */}
        <div className="pt-10 md:pt-12">
          <HeroSlider />
        </div>

        {/* PHIM ĐANG CHIẾU */}
        <div className="mt-8">
          {!showAllUpcoming && (
            <div ref={showingRef}>
              {showAllShowing ? (
                <AllMoviesGrid
                  title="PHIM ĐANG CHIẾU"
                  movies={showingMovies}
                  onCollapse={() => {
                    setShowAllShowing(false);
                    scrollInto(showingRef);
                  }}
                  titleClass="bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(123,92,255,0.7)]"
                />
              ) : (
                <MovieCarousel
                  title="PHIM ĐANG CHIẾU"
                  movies={showingMovies}
                  onShowAll={() => {
                    setShowAllShowing(true);
                    setShowAllUpcoming(false);
                    smoothScrollToTop();
                  }}
                  titleClass="bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(123,92,255,0.7)]"
                />
              )}
            </div>
          )}
        </div>

        {/* PHIM SẮP CHIẾU */}
        <div className="mt-10">
          {!showAllShowing && (
            <div ref={upcomingRef}>
              {showAllUpcoming ? (
                <AllMoviesGrid
                  title="PHIM SẮP CHIẾU"
                  movies={upcomingMovies}
                  onCollapse={() => {
                    setShowAllUpcoming(false);
                    scrollInto(upcomingRef);
                  }}
                  titleClass="bg-gradient-to-r from-[#ff7af6] via-[#7b5cff] to-[#43e1ff] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(255,122,246,0.7)]"
                />
              ) : (
                <MovieCarousel
                  title="PHIM SẮP CHIẾU"
                  movies={upcomingMovies}
                  onShowAll={() => {
                    setShowAllUpcoming(true);
                    setShowAllShowing(false);
                    smoothScrollToTop();
                  }}
                  titleClass="bg-gradient-to-r from-[#ff7af6] via-[#7b5cff] to-[#43e1ff] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(255,122,246,0.7)]"
                />
              )}
            </div>
          )}
        </div>

        {/* KHUYẾN MÃI */}
        <div className="mt-14">
          <PromoHighlight />
        </div>

        {/* MEMBERSHIP */}
        <div ref={membershipRef} className="mt-16">
          <MembershipHighlight
            activeId={activeMembership}
            onSelect={handleSelectMembership}
          />
          <MembershipDetail
            type={activeMembership}
            onBack={handleBackMembership}
          />
        </div>

        {/* LIÊN HỆ */}
        <div className="mt-16">
          <ContactSection />
        </div>
      </main>

      {/* FOOTER: không margin-bottom, sẽ dính đáy nhờ flex */}
      <Footer />
    </div>
  );
}
