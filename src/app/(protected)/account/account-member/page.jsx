// src/app/(protected)/account/account-member/page.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { useAuth } from "@/context/AuthContext";
import { getUserLoyalty, getActiveMembershipTiers } from "@/api/userService";

function formatNumber(n) {
  return new Intl.NumberFormat("vi-VN").format(n ?? 0);
}

export default function AccountMemberPage() {
  const { currentUser, logout } = useAuth() || {};
  const [loyalty, setLoyalty] = useState(null);
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const avatarUrl = currentUser?.avatarUrl || currentUser?.avatarURL;

  // sidebar items
  const sidebarItems = [
    {
      id: "profile",
      label: "Thông tin khách hàng",
      path: "/account/account-profile",
    },
    {
      id: "member",
      label: "Thành viên CinesVerse",
      path: "/account/account-member",
    },
    {
      id: "history",
      label: "Lịch sử mua hàng",
      path: "/account/account-history",
    },
  ];

  const displayName =
    currentUser?.username || currentUser?.email || "Thành viên";
  const tierName =
    loyalty?.membershipTier?.name ||
    currentUser?.membershipTier?.name ||
    "Member";

  const handleNavigate = (path) => {
    if (location.pathname === path) return;
    navigate(path);
  };

  const handleLogoutClick = async () => {
    try {
      if (typeof logout === "function") {
        await logout();
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      navigate("/auth/login");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [loyaltyRes, tierRes] = await Promise.all([
          getUserLoyalty(),
          getActiveMembershipTiers(),
        ]);
        setLoyalty(loyaltyRes);
        setTiers(Array.isArray(tierRes) ? tierRes : tierRes?.data || []);
      } catch (error) {
        console.error(error);
        setErr("Không thể tải thông tin membership. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const { currentTier, nextTier, progressPercent, remainingToNext } =
    useMemo(() => {
      const points = Number(loyalty?.loyaltyPoints ?? 0);

      if (!Array.isArray(tiers) || tiers.length === 0) {
        return {
          currentTier:
            loyalty?.membershipTier || currentUser?.membershipTier || null,
          nextTier: null,
          progressPercent: 0,
          remainingToNext: 0,
        };
      }

      const sorted = [...tiers].sort(
        (a, b) => Number(a.minPoints ?? 0) - Number(b.minPoints ?? 0)
      );

      let current = sorted[0];
      for (const t of sorted) {
        const min = Number(t.minPoints ?? 0);
        if (min <= points) current = t;
        else break;
      }

      const next =
        sorted.find((t) => Number(t.minPoints ?? 0) > points) || null;

      const currentMin = Number(current?.minPoints ?? 0);
      const nextMin = Number(next?.minPoints ?? 0);

      let progress = 100;
      if (next) {
        const range = Math.max(1, nextMin - currentMin);
        progress = ((points - currentMin) / range) * 100;
        progress = Math.max(0, Math.min(100, progress));
      }

      const remaining = next ? Math.max(0, nextMin - points) : 0;

      return {
        currentTier: current || null,
        nextTier: next,
        progressPercent: progress,
        remainingToNext: remaining,
      };
    }, [loyalty, tiers, currentUser]);

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
      {/* nền neon nhẹ */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-[10%] w-[420px] h-[420px] bg-[radial-gradient(circle_at_center,#8a66ff70,transparent)] blur-[110px]" />
        <div className="absolute top-[35%] right-[12%] w-[380px] h-[380px] bg-[radial-gradient(circle_at_center,#55e5ff55,transparent)] blur-[110px]" />
        <div className="absolute bottom-[-40px] left-1/3 w-[520px] h-[260px] bg-[radial-gradient(circle_at_center,#ff92ff40,transparent)] blur-[120px]" />
      </div>
      <Navbar />

      <main className="flex-1 pt-16 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header - Đồng bộ với trang profile */}
          <div className="mb-12 text-center md:text-left">
            <p className="text-xs font-bold tracking-[0.4em] uppercase text-cyan-400/70 mb-3">
              MEMBERSHIP
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-[0.15em] uppercase">
              <span className="bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl">
                QUYỀN LỢI THÀNH VIÊN
              </span>
            </h1>
            <p className="mt-4 text-sm md:text-base text-white/60 max-w-3xl mx-auto md:mx-0">
              Tích điểm mỗi lần đặt vé & mua bắp nước để lên hạng cao hơn và
              nhận ưu đãi giảm giá trực tiếp!
            </p>
          </div>

          {/* Layout: Sidebar + Content */}
          <div className="grid lg:grid-cols-[280px,1fr] gap-8 items-start">
            {/* Sidebar - Dùng lại bản đẹp nhất từ trang profile */}
            <aside className="hidden lg:block sticky top-28 h-fit rounded-3xl overflow-hidden bg-gradient-to-b from-[#14002f]/90 via-[#0b001f] to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-transparent to-emerald-600/20 pointer-events-none" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400" />

              <div className="relative p-6 pb-8">
                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/10">
                  <div className="relative">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-400 via-fuchsia-500 to-emerald-400 p-[2px] shadow-lg shadow-purple-500/30">
                      <div className="h-full w-full rounded-2xl bg-[#0b001f] flex items-center justify-center overflow-hidden">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt={displayName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl font-bold">
                            {displayName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#0b001f] flex items-center justify-center text-[10px] font-bold">
                      {tierName[0]}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-extrabold text-white tracking-wider line-clamp-1">
                      {displayName}
                    </h3>
                    <p className="text-xs text-emerald-300 font-medium mt-0.5">
                      {tierName.toUpperCase()} MEMBER
                    </p>
                  </div>
                </div>

                <nav className="space-y-3">
                  {sidebarItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigate(item.path)}
                        className={`w-full flex items-center gap-3.5 px-5 py-3.5 rounded-2xl text-left font-semibold text-sm tracking-wide transition-all duration-300 group relative overflow-hidden
                    ${
                      isActive
                        ? "bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400 text-black shadow-xl shadow-purple-500/50"
                        : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10"
                    }`}
                      >
                        <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                        <span className="relative z-10">{item.label}</span>
                        {isActive && (
                          <span className="ml-auto relative z-10">
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>

                <div className="mt-10 pt-6 border-t border-white/10">
                  <button
                    onClick={handleLogoutClick}
                    className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-red-600/80 to-rose-600/80 hover:from-red-500 hover:to-rose-500 text-white font-bold text-sm tracking-wider shadow-lg shadow-red-500/30 transition-all duration-300 hover:scale-[1.02]"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Đăng xuất
                  </button>
                </div>
              </div>
            </aside>

            {/* Right Content - Siêu đẹp, siêu đồng bộ */}
            <div className="space-y-8">
              {loading ? (
                <div className="flex items-center justify-center h-96">
                  <p className="text-lg text-white/60">
                    Đang tải thông tin thành viên...
                  </p>
                </div>
              ) : err ? (
                <div className="text-center py-20">
                  <p className="text-red-400 text-lg">{err}</p>
                </div>
              ) : (
                <>
                  {/* Current Tier Card - Đỉnh cao */}
                  <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-purple-900/50 via-violet-900/40 to-indigo-900/50 border border-white/20 backdrop-blur-2xl shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/25 via-purple-500/20 to-cyan-400/25" />
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-400 via-purple-500 to-cyan-400" />

                    <div className="relative p-8 md:p-10">
                      <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div>
                          <p className="text-xs font-bold tracking-[0.4em] uppercase text-cyan-300/80 mb-3">
                            CẤP ĐỘ HIỆN TẠI
                          </p>
                          <h2 className="text-4xl md:text-5xl font-black tracking-wider mb-4">
                            <span className="bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                              {currentTier?.name || "Member"}
                            </span>
                          </h2>
                          <p className="text-sm text-white/70 leading-relaxed">
                            Tích điểm khi đặt vé & mua bắp nước để nâng hạng và
                            nhận ưu đãi giảm giá trực tiếp.
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs font-bold tracking-[0.3em] uppercase text-white/50 mb-2">
                            ĐIỂM TÍCH LŨY
                          </p>
                          <p className="text-5xl md:text-6xl font-black bg-gradient-to-r from-cyan-300 to-purple-400 bg-clip-text text-transparent">
                            {formatNumber(loyalty.loyaltyPoints || 0)}
                          </p>
                          {currentTier?.discountValue > 0 && (
                            <p className="mt-4 text-lg font-bold text-emerald-300">
                              Giảm ngay{" "}
                              <span className="text-3xl">
                                {currentTier.discountValue}%
                              </span>{" "}
                              trên mọi vé!
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-10">
                        <div className="flex justify-between text-sm mb-3">
                          <span className="text-white/70">
                            {nextTier
                              ? `Còn ${formatNumber(
                                  Math.max(
                                    0,
                                    (nextTier.minPoints ?? 0) -
                                      (loyalty.loyaltyPoints ?? 0)
                                  )
                                )} điểm để lên ${nextTier.name}`
                              : "Bạn đang ở hạng cao nhất"}
                          </span>
                          {nextTier && (
                            <span className="text-cyan-300 font-medium">
                              {formatNumber(loyalty.loyaltyPoints ?? 0)} /{" "}
                              {formatNumber(nextTier.minPoints ?? 0)} điểm
                            </span>
                          )}
                        </div>
                        <div className="w-full h-6 rounded-full bg-white/10 overflow-hidden border border-white/20">
                          <div
                            className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400 rounded-full shadow-lg shadow-purple-500/50 transition-all duration-1000 ease-out"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Tier List */}
                  <section className="rounded-3xl bg-gradient-to-b from-white/5 via-white/2 to-transparent border border-white/10 backdrop-blur-xl shadow-2xl p-8">
                    <h3 className="text-xl font-black tracking-wider mb-8 text-center">
                      <span className="bg-gradient-to-r from-cyan-300 to-pink-400 bg-clip-text text-transparent">
                        CÁC HẠNG THÀNH VIÊN
                      </span>
                    </h3>

                    <div className="grid gap-5">
                      {tiers.map((tier) => {
                        const isCurrent =
                          currentTier &&
                          (tier.membershipTierId ===
                            currentTier.membershipTierId ||
                            tier.name === currentTier.name);
                        return (
                          <div
                            key={tier.membershipTierId}
                            className={`relative rounded-3xl p-6 border transition-all duration-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4
                ${
                  isCurrent
                    ? "bg-gradient-to-r from-violet-600/30 via-fuchsia-600/20 to-emerald-600/30 border-violet-400 shadow-2xl shadow-purple-500/50"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
                          >
                            {isCurrent && (
                              <div className="absolute top-1 right-3 px-3 py-1 rounded-full bg-violet-500/30 border border-violet-400 text-violet-200 text-xs font-bold">
                                HIỆN TẠI
                              </div>
                            )}

                            <div>
                              <h4 className="text-xl font-black text-white">
                                {tier.name.toUpperCase()}
                              </h4>
                              <p className="text-sm text-white/70 mt-1">
                                Từ {formatNumber(tier.minPoints ?? 0)} điểm
                              </p>
                            </div>

                            {/* Phần giảm giá – đã căn lại để KHÔNG BỊ ĐÈ CHỮ NỮA */}
                            <div className="text-right">
                              <p className="text-4xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                                -{tier.discountValue ?? 0}%
                              </p>
                              <p className="text-xs text-white/60">
                                giảm giá vé
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
