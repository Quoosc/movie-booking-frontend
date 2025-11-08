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

import { useEffect, useRef, useState } from "react";
import Navbar from "@/components/common/Navbar";
import MovieCarousel from "@/components/movies/MovieCarousel";
import AllMoviesGrid from "@/components/movies/AllMoviesGrid";
import { getShowingMovies, getUpcomingMovies } from "@/api/movieService";
import Footer from "@/components/common/Footer";
import MembershipHighlight from "@/components/membership/MembershipHighlight";
import MembershipDetail from "@/components/membership/MembershipDetail";
import ContactSection from "@/components/contact/ContactSection";

export default function HomePage() {
  const [showingMovies, setShowingMovies] = useState([]);
  const [upcomingMovies, setUpcomingMovies] = useState([]);

  const [showAllShowing, setShowAllShowing] = useState(false);
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);

  // 👉 thêm cho membership
  const [activeMembership, setActiveMembership] = useState(null);

  const showingRef = useRef(null);
  const upcomingRef = useRef(null);
  const membershipRef = useRef(null);
  

  useEffect(() => {
    const fetchData = async () => {
      // hiện tại getShowingMovies / getUpcomingMovies đang dùng mock bên movieService
      // sau này backend xong chỉ cần sửa trong movieService là toàn site dùng API thật
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

  // chọn C'Friend / C'VIP
  const handleSelectMembership = (id) => {
    setActiveMembership(id);
    // scroll xuống block chi tiết
    setTimeout(() => scrollInto(membershipRef), 0);
  };

  // quay lại 2 card membership
  const handleBackMembership = () => {
    setActiveMembership(null);
    scrollInto(membershipRef);
  };

  return (
    <div
      className="
        min-h-screen
        bg-gradient-to-b
        from-[#070018] via-[#100526] to-[#02000f]
        text-white
        relative overflow-hidden
      "
    >
      {/* Hiệu ứng nền đồng bộ với login/register */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-[8%] w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,#7b5cff40,transparent)] blur-3xl" />
        <div className="absolute top-[30%] right-[15%] w-[400px] h-[400px] bg-[radial-gradient(circle_at_center,#43e1ff30,transparent)] blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-[600px] h-[300px] bg-[radial-gradient(circle_at_center,#ff7af630,transparent)] blur-3xl" />
      </div>

      <Navbar />

      <div className="relative z-10 pt-20">
        {/* PHIM ĐANG CHIẾU */}
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
                  scrollInto(showingRef);
                }}
                titleClass="bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(123,92,255,0.7)]"
              />
            )}
          </div>
        )}

        {/* PHIM SẮP CHIẾU */}
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
                  scrollInto(upcomingRef);
                }}
                titleClass="bg-gradient-to-r from-[#ff7af6] via-[#7b5cff] to-[#43e1ff] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(255,122,246,0.7)]"
              />
            )}
          </div>
        )}

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

        {/* 🔹 LIÊN HỆ VỚI CHÚNG TÔI - nằm giữa membership và footer */}
        <ContactSection />
      </div>

      <Footer />
    </div>
  );
}

