// src/app/(public)/cinema/[cinemaId]/page.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";

import { getCinemaById } from "@/api/cinemaService";
import CinemaHero from "@/components/cinema/CinemaHero";
import CinemaTabs from "@/components/cinema/CinemaTabs";
import CinemaMovieGrid from "@/components/cinema/CinemaMovieGrid";

export default function CinemaPage() {
  const { cinemaId } = useParams();
  const [cinema, setCinema] = useState(null);
  const [activeTab, setActiveTab] = useState("showing");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getCinemaById(cinemaId);
        setCinema(data);
      } catch (e) {
        console.error("Failed to load cinema detail", e);
        setCinema(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [cinemaId]);

  const bg =
    "bg-gradient-to-b from-[#050018] via-[#080023] to-[#050018] text-white";

  if (loading) {
    return (
      <div
        className={`min-h-screen flex flex-col relative overflow-hidden ${bg}`}
      >
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-sm text-white/70">Đang tải thông tin rạp...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!cinema) {
    return (
      <div
        className={`min-h-screen flex flex-col relative overflow-hidden ${bg}`}
      >
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-sm text-white/70">
            Không tìm thấy thông tin rạp. Vui lòng chọn rạp khác.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div
      className={`
        min-h-screen flex flex-col
        ${bg}
        relative overflow-hidden
      `}
    >
      {/* neon blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-[8%] w-[520px] h-[520px] bg-[radial-gradient(circle_at_center,#7b5cff55,transparent)] blur-[110px]" />
        <div className="absolute top-[28%] right-[12%] w-[420px] h-[420px] bg-[radial-gradient(circle_at_center,#43e1ff40,transparent)] blur-[110px]" />
        <div className="absolute bottom-[-60px] left-1/3 w-[640px] h-[320px] bg-[radial-gradient(circle_at_center,#ff7af640,transparent)] blur-[130px]" />
      </div>

      <Navbar />

      <main className="relative z-10 flex-1 pb-10">
        <CinemaHero cinema={cinema} />
        <CinemaTabs activeTab={activeTab} onChange={setActiveTab} />
        <CinemaMovieGrid cinema={cinema} activeTab={activeTab} />
      </main>

      <Footer />
    </div>
  );
}
