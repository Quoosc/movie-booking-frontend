// src/components/auth/login/LoginForm/LoginFields.jsx
import { useState } from "react";
import { FiMail, FiLock } from "react-icons/fi";
import { toast } from "react-toastify";
// import VerifyModal from "../VerifyModal";
import LoadingIcon from "@/components/shared/LoadingIcon";
import TextInput from "@/components/shared/TextInput";
import { useAuth } from "@/context/AuthContext";
import { USE_EMAIL_VERIFY } from "@/utils/constants";
import { useNavigate, useLocation } from "react-router-dom";

export default function LoginFields() {
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // clear lỗi của field đang sửa
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Validate phía client
  const validate = () => {
    const newErrors = {};
    const email = formData.email.trim();
    const password = formData.password;

    // Email
    if (!email) {
      newErrors.email = ["Vui lòng nhập email."];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = ["Định dạng email không hợp lệ."];
    }

    // Password
    if (!password) {
      newErrors.password = ["Vui lòng nhập mật khẩu."];
    } else if (password.length < 6) {
      newErrors.password = ["Mật khẩu phải có ít nhất 6 ký tự."];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    if (!validate()) {
      setIsLoading(false);
      return;
    }

    try {
      const profile = await login(
        {
          email: formData.email.trim(),
          password: formData.password,
        },
        rememberMe
      );

      const role = profile?.role || profile?.userRole;

      toast.success("Đăng nhập thành công!");

      if (role === "ADMIN") {
        navigate("/admin", { replace: true });
      } else {
        const target =
          from === "/auth/login" || from === "/auth/register" ? "/" : from;
        navigate(target, { replace: true });
      }
    } catch (error) {
      const msg = error?.message || "Đăng nhập thất bại";

      if (USE_EMAIL_VERIFY && msg.includes("chưa được kích hoạt")) {
        setVerifyEmail(formData.email.trim());
        setShowVerifyModal(true);
      } else {
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        {/* Email */}
        <TextInput
          label="Email"
          name="email"
          type="text"
          value={formData.email}
          onChange={handleChange}
          placeholder="example@email.com"
          icon={<FiMail />}
          error={errors.email?.[0]}
        />

        {/* Password */}
        <TextInput
          label="Mật khẩu"
          name="password"
          type={showPassword ? "text" : "password"}
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          icon={<FiLock />}
          error={errors.password?.[0]}
          showPasswordToggle
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword((v) => !v)}
        />

        {/* Remember + Forgot */}
        <div className="flex items-center justify-between text-sm pt-1">
          <label className="flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-gray-400 bg-white accent-[#7b5cff]"
            />
            <span className="ml-2 text-white/80">Ghi nhớ đăng nhập</span>
          </label>

          <a
            href="/auth/forgot"
            className="text-[#ff7af6] hover:text-[#43e1ff] font-medium"
          >
            Quên mật khẩu?
          </a>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="
            w-full relative overflow-hidden rounded-xl
            text-white font-bold py-3.5 px-4
            bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6]
            hover:shadow-[0_0_18px_rgba(123,92,255,0.9)]
            transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed
          "
        >
          <span className="relative z-10">
            {isLoading ? <LoadingIcon text="Đang đăng nhập..." /> : "Đăng nhập"}
          </span>
        </button>
      </form>

      {/* Google Login button */}

      {USE_EMAIL_VERIFY && showVerifyModal && (
        <VerifyModal
          email={verifyEmail}
          onClose={() => setShowVerifyModal(false)}
        />
      )}
    </>
  );
}
