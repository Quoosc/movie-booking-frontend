// src/app/(protected)/account/account-profile/page.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { useAuth } from "@/context/AuthContext";
import { getUserProfile, updateUserProfile } from "@/api/userService";
import { uploadAvatar } from "@/api/cloudinaryService";
import { toast } from "react-toastify";

export default function AccountProfilePage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { updateUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    avatarUrl: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const avatarSrc = profile?.avatarUrl || form.avatarUrl || "";
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(form.avatarUrl || "");

  // Load profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await getUserProfile(); // trả thẳng UserProfileResponse.data
        setProfile(data);
        setForm({
          username: data.username || "",
          email: data.email || "",
          phoneNumber: data.phoneNumber || "",
          avatarUrl: data.avatarUrl || "",
        });
      } catch (err) {
        console.error("getUserProfile error:", err);
        setMessage({
          type: "error",
          text: "Không tải được hồ sơ. Vui lòng thử lại.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    setAvatarPreview(form.avatarUrl || "");
  }, [form.avatarUrl]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  // nhớ ở trên component có:
  // const { updateUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      setSaving(true);

      const payload = {
        username: form.username,
        phoneNumber: form.phoneNumber,
        avatarUrl: form.avatarUrl || null,
      };

      const updated = await updateUserProfile(payload);
      const newProfile = updated?.data || updated || {};

      // cập nhật state cục bộ của trang
      setProfile((prev) => ({
        ...prev,
        ...newProfile,
      }));

      // cập nhật luôn AuthContext để navbar / member / trang khác re-render
      updateUser({
        username: newProfile.username,
        phoneNumber: newProfile.phoneNumber,
        avatarUrl: newProfile.avatarUrl,
      });

      setMessage({
        type: "success",
        text: "Cập nhật hồ sơ thành công.",
      });
    } catch (err) {
      console.error("updateUserProfile error:", err);
      setMessage({
        type: "error",
        text: "Cập nhật thất bại. Vui lòng thử lại.",
      });
    } finally {
      setSaving(false);
    }
  };
// update ảnh 
  const handlePickAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setAvatarPreview(localUrl);

    try {
      setAvatarUploading(true);
      const { avatarUrl } = await uploadAvatar(file);

      setForm((prev) => ({ ...prev, avatarUrl }));
      toast.success("Upload avatar thành công!");
    } catch (err) {
      console.error(err);
      toast.error(err?.message || "Upload avatar thất bại");
      setAvatarPreview(form.avatarUrl || "");
    } finally {
      setAvatarUploading(false);
      e.target.value = ""; 
    }
  };

  const handleNavigate = (path) => {
    if (location.pathname === path) return;
    navigate(path);
  };

  const handleLogoutClick = async () => {
    try {
      if (typeof logout === "function") {
        await logout();
      }
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      navigate("/auth/login");
    }
  };

  const displayName =
    profile?.username ||
    currentUser?.username ||
    currentUser?.email ||
    "Thành viên";

  const tierName = profile?.membershipTier?.name || "Member";
  const discount = profile?.membershipTier?.discountValue;

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
          {/* Header */}
          <div className="mb-12 text-center md:text-left">
            <p className="text-xs font-bold tracking-[0.4em] uppercase text-cyan-400/70 mb-3">
              ACCOUNT
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-[0.15em] uppercase">
              <span className="bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl">
                HỒ SƠ CÁ NHÂN
              </span>
            </h1>
            <p className="mt-4 text-sm md:text-base text-white/60 max-w-3xl mx-auto md:mx-0">
              Quản lý thông tin tài khoản CinesVerse của bạn.
            </p>
          </div>

          <div className="grid lg:grid-cols-[280px,1fr] gap-8 items-start">
            {/* Sidebar cố định – ĐỒNG BỘ 100% với Member & History */}
            <aside className="hidden lg:block sticky top-28 h-fit rounded-3xl overflow-hidden bg-gradient-to-b from-[#14002f]/90 via-[#0b001f] to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-transparent to-emerald-600/20 pointer-events-none" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400" />

              <div className="relative p-6 pb-8">
                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/10">
                  <div className="relative">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-violet-400 via-fuchsia-500 to-emerald-400 p-[2px] shadow-lg shadow-purple-500/30">
                      <div className="h-full w-full rounded-2xl bg-[#0b001f] flex items-center justify-center overflow-hidden">
                        {avatarSrc ? (
                          <img
                            src={avatarSrc}
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
                    {discount > 0 && (
                      <p className="text-[10px] text-white/70 mt-1">
                        Ưu đãi{" "}
                        <span className="text-emerald-400 font-bold">
                          {discount}%
                        </span>{" "}
                        trên mọi vé
                      </p>
                    )}
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

            {/* Right Content – ĐỒNG BỘ HOÀN HẢO */}
            <div className="space-y-8">
              {/* Avatar Card */}
              <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-purple-900/50 via-violet-900/40 to-indigo-900/50 border border-white/20 backdrop-blur-2xl shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/25 via-purple-500/20 to-cyan-400/25" />
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-400 via-purple-500 to-cyan-400" />

                <div className="relative p-8 md:p-10 text-center">
                  <div className="relative inline-block mb-6">
                    <div className="h-32 w-32 rounded-3xl bg-gradient-to-br from-pink-400 via-purple-400 to-cyan-400 p-[4px] shadow-2xl shadow-purple-500/60">
                      <div className="h-full w-full rounded-3xl bg-gray-900/95 backdrop-blur-sm flex items-center justify-center text-5xl font-black text-white overflow-hidden">
                        {avatarSrc ? (
                          <img
                            src={avatarSrc}
                            alt={displayName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          displayName.charAt(0).toUpperCase()
                        )}
                      </div>
                    </div>
                    <div className="absolute -bottom-3 -right-3 w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 border-4 border-gray-900 flex items-center justify-center text-lg font-bold shadow-2xl">
                      {tierName[0]}
                    </div>
                  </div>

                  <h2 className="text-2xl font-black text-white tracking-wider drop-shadow-lg">
                    {displayName}
                  </h2>
                  <p className="mt-2 text-sm text-cyan-200 font-medium">
                    {profile?.email || currentUser?.email}
                  </p>

                  <div className="mt-8 grid grid-cols-1 gap-4 text-left max-w-sm mx-auto">
                    <div className="flex justify-between items-center py-4 px-6 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm">
                      <span className="text-xs font-medium text-gray-300">
                        Số điện thoại
                      </span>
                      <span className="font-bold text-white text-sm">
                        {profile?.phoneNumber || "Chưa cập nhật"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-4 px-6 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm">
                      <span className="text-xs font-medium text-gray-300">
                        Điểm tích lũy
                      </span>
                      <span className="font-bold text-cyan-300 text-xl">
                        {profile?.loyaltyPoints ?? 0} pts
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-4 px-6 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm">
                      <span className="text-xs font-medium text-gray-300">
                        Tham gia từ
                      </span>
                      <span className="font-medium text-gray-200">
                        {profile?.createdAt
                          ? new Date(profile.createdAt).toLocaleDateString(
                              "vi-VN"
                            )
                          : "--"}
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Form cập nhật */}
              <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1a0033]/90 via-[#0f001f] to-black/95 border border-white/10 backdrop-blur-xl shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-bl from-fuchsia-600/20 via-transparent to-emerald-600/20" />
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-violet-500 via-pink-500 to-emerald-400" />

                <div className="relative p-8">
                  <h3 className="mb-6 text-lg font-black tracking-[0.2em] uppercase bg-gradient-to-r from-cyan-300 to-pink-300 bg-clip-text text-transparent">
                    Cập nhật thông tin
                  </h3>

                  {message && (
                    <div
                      className={`mb-6 rounded-2xl px-5 py-3 border text-sm font-medium transition-all
                ${
                  message.type === "success"
                    ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-100"
                    : "bg-red-500/10 border-red-500/40 text-red-100"
                }`}
                    >
                      {message.text}
                    </div>
                  )}

                  {loading ? (
                    <div className="flex h-64 items-center justify-center">
                      <div className="text-white/60">Đang tải hồ sơ...</div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Email */}
                      <div>
                        <label className="block text-xs font-bold text-white/70 mb-2">
                          Email (không thể thay đổi)
                        </label>
                        <input
                          type="email"
                          value={form.email}
                          disabled
                          className="w-full rounded-2xl bg-white/5 border border-white/20 px-5 py-4 text-sm text-white/70 cursor-not-allowed"
                        />
                      </div>

                      {/* Username */}
                      <div>
                        <label className="block text-xs font-bold text-white/70 mb-2">
                          Tên hiển thị
                        </label>
                        <input
                          type="text"
                          value={form.username}
                          onChange={handleChange("username")}
                          placeholder="Nhập tên bạn muốn hiển thị"
                          className="w-full rounded-2xl bg-white/5 border border-white/15 px-5 py-4 text-sm text-white placeholder-white/30
                               focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all duration-300"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-xs font-bold text-white/70 mb-2">
                          Số điện thoại
                        </label>
                        <input
                          type="tel"
                          value={form.phoneNumber}
                          onChange={handleChange("phoneNumber")}
                          placeholder="0912345678"
                          className="w-full rounded-2xl bg-white/5 border border-white/15 px-5 py-4 text-sm text-white placeholder-white/30
                               focus:border-violet-400 focus:ring-2 focus:ring-violet-400/40 focus:bg-white/10 transition-all duration-300"
                        />
                      </div>

                      {/* Avatar Upload */}
                      <div>
                        <label className="block text-xs font-bold text-white/70 mb-2">
                          Ảnh đại diện
                        </label>

                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-2xl overflow-hidden border border-white/15 bg-white/5">
                            {avatarPreview ? (
                              <img
                                src={avatarPreview}
                                alt="avatar"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-[11px] text-white/40">
                                No Avatar
                              </div>
                            )}
                          </div>

                          <div className="flex-1">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePickAvatar}
                              disabled={avatarUploading}
                              className="block w-full text-sm text-white/70
                   file:mr-4 file:rounded-xl file:border-0
                   file:bg-white/10 file:px-4 file:py-2
                   file:text-white file:font-semibold
                   hover:file:bg-white/15"
                            />
                            <p className="mt-1 text-[11px] text-white/40">
                              Chọn ảnh (jpg/png/webp)
                              
                            </p>

                            {avatarUploading && (
                              <p className="mt-2 text-[11px] text-yellow-200/80">
                                Đang tải ảnh lên...
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="flex flex-col sm:flex-row gap-4 pt-6">
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => {
                            if (!profile) return;
                            setForm({
                              username: profile.username || "",
                              email: profile.email || "",
                              phoneNumber: profile.phoneNumber || "",
                              avatarUrl: profile.avatarUrl || "",
                            });
                            setMessage(null);
                          }}
                          className="flex-1 rounded-2xl border border-white/20 bg-white/5 py-4 font-bold text-sm text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300"
                        >
                          Đặt lại
                        </button>

                        <button
                          type="submit"
                          disabled={saving}
                          className="flex-1 rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-emerald-400 py-4 font-black text-sm text-black shadow-xl shadow-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/70 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300"
                        >
                          {saving ? "Đang lưu..." : "Lưu thay đổi"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </section>

              {/* Đổi mật khẩu */}
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => navigate("/account/account-password")}
                  className="
      group relative inline-flex items-center gap-3 
      rounded-2xl px-8 py-4 
      font-bold text-white text-sm tracking-wider
      bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500
      shadow-lg shadow-purple-500/40
      overflow-hidden
      transition-all duration-500 ease-out
      hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/60
      active:scale-100
    "
                >
                  {/* Glow viền tím hồng khi hover */}
                  <span
                    className="
      absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 
      bg-gradient-to-r from-violet-400 via-pink-400 to-purple-400 
      blur-xl scale-150 group-hover:scale-100 
      transition-all duration-700
    "
                  />

                  {/* Icon khóa */}
                  <svg
                    className="w-5 h-5 relative z-10"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 11c0 1.656-1.344 3-3 3s-3-1.344-3-3 1.344-3 3-3 3 1.344 3 3z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M12 15v4m-6 1h12a2 2 0 002-2v-3a2 2 0 00-2-2H6a2 2 0 00-2 2v3a2 2 0 002 2z"
                    />
                  </svg>

                  <span className="relative z-10">Đổi mật khẩu</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
