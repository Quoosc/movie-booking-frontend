// src/app/(public)/home/page.jsx

import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";
import { useNavigate } from "react-router-dom";

import Navbar from "@/components/common/Navbar";
import MovieCarousel from "@/components/movies/MovieCarousel";
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

  const [activeMembership, setActiveMembership] = useState(null);

  const membershipRef = useRef(null);
  const navigate = useNavigate();

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
    //nền chung 
     <div
      className="
        min-h-screen
        bg-gradient-to-b
        from-[#050024] via-[#0b0630] to-[#020015]
        text-white
        relative overflow-hidden
      "
    >
      {/* nền neon nhẹ */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-[10%] w-[420px] h-[420px] bg-[radial-gradient(circle_at_center,#8a66ff70,transparent)] blur-[110px]" />
        <div className="absolute top-[35%] right-[12%] w-[380px] h-[380px] bg-[radial-gradient(circle_at_center,#55e5ff55,transparent)] blur-[110px]" />
        <div className="absolute bottom-[-40px] left-1/3 w-[520px] h-[260px] bg-[radial-gradient(circle_at_center,#ff92ff40,transparent)] blur-[120px]" />
      </div> 
      {/* đến đây
      
      
      
      
      
      */}
      <Navbar />

      {/* MAIN */}
      <main className="relative z-10 flex-1">
        {/* Hero */}
        <div className="pt-10 md:pt-12">
          <HeroSlider />
        </div>

        {/* PHIM ĐANG CHIẾU */}
        <div className="mt-8">
          <MovieCarousel
            title="PHIM ĐANG CHIẾU"
            movies={showingMovies}
            // 🔁 Bấm XEM THÊM -> sang trang /movie/moviesShowing
            onShowAll={() => {
              smoothScrollToTop();
              navigate("/movie/moviesShowing");
            }}
            titleClass="bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(123,92,255,0.7)]"
          />
        </div>

        {/* PHIM SẮP CHIẾU */}
        <div className="mt-10">
          <MovieCarousel
            title="PHIM SẮP CHIẾU"
            movies={upcomingMovies}
            // 🔁 Bấm XEM THÊM -> sang trang /movie/moviesUpComming
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
