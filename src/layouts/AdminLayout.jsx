// src/layouts/AdminLayout.jsx
import { Outlet } from "react-router-dom";
import AdminTopbar from "./AdminTopbar";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout() {
  return (
    <div
      className="
        min-h-screen
        bg-gradient-to-b
        from-[#050024] via-[#0b0630] to-[#020015]
        text-white
        relative overflow-hidden
      "
    >
      {/* nền neon giống account pages */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-[10%] w-[460px] h-[460px] bg-[radial-gradient(circle_at_center,#8a66ff70,transparent)] blur-[120px]" />
        <div className="absolute top-[35%] right-[8%] w-[420px] h-[420px] bg-[radial-gradient(circle_at_center,#55e5ff55,transparent)] blur-[120px]" />
        <div className="absolute bottom-[-60px] left-1/3 w-[540px] h-[280px] bg-[radial-gradient(circle_at_center,#ff92ff40,transparent)] blur-[130px]" />
      </div>

      {/* TOPBAR ADMIN */}
      <AdminTopbar />

      {/* MAIN CONTENT */}
      <main className="relative pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="grid lg:grid-cols-[260px,1fr] gap-6 lg:gap-8 items-start">
            {/* SIDEBAR */}
            <div className="hidden lg:block">
              <AdminSidebar />
            </div>

            {/* Mobile sidebar (simple, optional) */}
            <div className="lg:hidden mb-4">
              <AdminSidebar isMobile />
            </div>

            {/* NỘI DUNG TRANG ADMIN */}
            <section
              className="
                relative rounded-3xl overflow-hidden
                bg-gradient-to-br from-[#1a0033]/90 via-[#0f001f] to-black/95
                border border-white/10 backdrop-blur-xl shadow-2xl
                min-h-[60vh]
              "
            >
              {/* overlay màu giống account card */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-bl from-fuchsia-600/20 via-transparent to-emerald-600/20" />
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-violet-500 via-pink-500 to-emerald-400" />

              <div className="relative p-6 md:p-8 lg:p-10">
                <Outlet />
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
