// src/app/(protected)/account/account-password/page.jsx
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { useAuth } from "@/context/AuthContext";
import { changePassword } from "@/api/userService";

export default function AccountPasswordPage() {
  const { currentUser, logout } = useAuth() || {};
  const navigate = useNavigate();
  const location = useLocation();
  const avatarUrl = currentUser?.avatarUrl || currentUser?.avatarURL;

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage(null);

  if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
    setMessage({ type: "error", text: "Vui lòng nhập đầy đủ các trường." });
    return;
  }
  if (form.newPassword.length < 6) {
    setMessage({
      type: "error",
      text: "Mật khẩu mới phải có ít nhất 6 ký tự.",
    });
    return;
  }
  if (form.newPassword !== form.confirmPassword) {
    setMessage({ type: "error", text: "Xác nhận mật khẩu mới không khớp." });
    return;
  }

  try {
    setSubmitting(true);

    const payload = {
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
      confirmPassword: form.confirmPassword, // BẮT BUỘC GỬI LÊN
    };

    const resMessage = await changePassword(payload);

    setMessage({
      type: "success",
      text: resMessage || "Đổi mật khẩu thành công.",
    });
    setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  } catch (err) {
    console.error("changePassword error:", err);
    setMessage({
      type: "error",
      text:
        err?.message ||
        "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại.",
    });
  } finally {
    setSubmitting(false);
  }
};


  const handleNavigate = (path) => {
    if (location.pathname === path) return;
    navigate(path);
  };

  const handleLogoutClick = async () => {
    try {
      if (typeof logout === "function") await logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      navigate("/auth/login");
    }
  };

  const displayName =
    currentUser?.username || currentUser?.email || "Thành viên";
  const tierName = currentUser?.membershipTier?.name || "Member";

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
    {
      id: "password",
      label: "Đổi mật khẩu",
      path: "/account/account-password",
    },
  ];

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

      <main className="flex-1 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="mb-12 text-center md:text-left">
            <p className="text-xs font-bold tracking-[0.4em] uppercase text-cyan-400/70 mb-3">
              ACCOUNT
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-[0.15em] uppercase">
              <span className="bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl">
                ĐỔI MẬT KHẨU
              </span>
            </h1>
            <p className="mt-4 text-sm md:text-base text-white/60 max-w-3xl mx-auto md:mx-0">
              Cập nhật mật khẩu để bảo vệ tài khoản CinesVerse của bạn an toàn
              hơn.
            </p>
          </div>

          <div className="grid lg:grid-cols-[280px,1fr] gap-8 items-start">
            {/* Sidebar cố định – ĐỒNG BỘ 100% với 3 trang kia */}
            <aside className="hidden lg:block sticky top-20 h-fit rounded-3xl overflow-hidden bg-gradient-to-b from-[#14002f]/90 via-[#0b001f] to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl">
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

            {/* Form đổi mật khẩu – ĐẸP SIÊU CẤP, ĐỒNG BỘ HOÀN HẢO */}
            <div className="space-y-8">
              <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a0033]/90 via-[#0f001f] to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-bl from-fuchsia-600/20 via-transparent to-emerald-600/20" />
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-violet-500 via-pink-500 to-emerald-400" />

                <div className="relative p-8 md:p-10">
                  <h3 className="mb-8 text-xl font-black tracking-[0.2em] uppercase bg-gradient-to-r from-cyan-300 to-pink-300 bg-clip-text text-transparent">
                    Thay đổi mật khẩu đăng nhập
                  </h3>

                  {message && (
                    <div
                      className={`mb-8 rounded-2xl px-6 py-4 border text-sm font-medium transition-all
                      ${
                        message.type === "success"
                          ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-100"
                          : "bg-red-500/10 border-red-500/50 text-red-100"
                      }`}
                    >
                      {message.text}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
                    <div>
                      <label className="block text-xs font-bold text-white/70 mb-3">
                        Mật khẩu hiện tại
                      </label>
                      <input
                        type="password"
                        value={form.currentPassword}
                        onChange={handleChange("currentPassword")}
                        placeholder="••••••••"
                        className="w-full rounded-2xl bg-white/5 border border-white/15 px-6 py-5 text-base text-white placeholder-white/30
                                   focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all duration-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-white/70 mb-3">
                        Mật khẩu mới
                      </label>
                      <input
                        type="password"
                        value={form.newPassword}
                        onChange={handleChange("newPassword")}
                        placeholder="••••••••"
                        className="w-full rounded-2xl bg-white/5 border border-white/15 px-6 py-5 text-base text-white placeholder-white/30
                                   focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all duration-300"
                      />
                      <p className="mt-3 text-xs text-white/50">
                        Gợi ý: ít nhất 6 ký tự, kết hợp chữ hoa, số và ký tự đặc
                        biệt
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-white/70 mb-3">
                        Xác nhận mật khẩu mới
                      </label>
                      <input
                        type="password"
                        value={form.confirmPassword}
                        onChange={handleChange("confirmPassword")}
                        placeholder="••••••••"
                        className="w-full rounded-2xl bg-white/5 border border-white/15 px-6 py-5 text-base text-white placeholder-white/30
                                   focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all duration-300"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-8">
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => {
                          setForm({
                            currentPassword: "",
                            newPassword: "",
                            confirmPassword: "",
                          });
                          setMessage(null);
                        }}
                        className="flex-1 rounded-2xl border border-white/20 bg-white/5 py-5 font-bold text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300"
                      >
                        Nhập lại
                      </button>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400 py-5 font-black text-black shadow-xl shadow-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/70 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300"
                      >
                        {submitting ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
                      </button>
                    </div>
                  </form>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
