// src/components/auth/register/RegisterForm/RegisterFields.jsx
import { useState } from "react";
import { FiMail, FiLock, FiUser, FiPhone } from "react-icons/fi";
import { toast } from "react-toastify";
import LoadingIcon from "@/components/shared/LoadingIcon";
import TextInput from "@/components/shared/TextInput";
import { register as registerApi } from "@/api/authService"; 
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function RegisterFields() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = () => {
    const newErrors = {};
    const fullName = formData.fullName.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    if (!fullName) {
      newErrors.fullName = ["Vui lòng nhập họ và tên."];
    } else if (fullName.length < 2) {
      newErrors.fullName = ["Họ tên quá ngắn."];
    }

    if (!email) {
      newErrors.email = ["Vui lòng nhập email."];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = ["Định dạng email không hợp lệ."];
    }

    if (phone) {
      const cleaned = phone.replace(/\s+/g, "");
      if (!/^[0-9]{9,11}$/.test(cleaned)) {
        newErrors.phone = ["Số điện thoại không hợp lệ."];
      }
    }

    if (!password) {
      newErrors.password = ["Vui lòng nhập mật khẩu."];
    } else if (password.length < 6) {
      newErrors.password = ["Mật khẩu phải có ít nhất 6 ký tự."];
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = ["Vui lòng xác nhận mật khẩu."];
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = ["Mật khẩu không trùng khớp."];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!validate()) return;

    setIsLoading(true);
    try {
      await register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      });

      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
      window.location.href = "/auth/login";
    } catch (error) {
      toast.error(error?.message || "Đăng ký thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <TextInput
        label="Họ và tên"
        name="fullName"
        value={formData.fullName}
        onChange={handleChange}
        placeholder="Nguyễn Văn A"
        type="text"
        icon={<FiUser />}
        error={errors.fullName?.[0]}
      />

      <TextInput
        label="Email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="example@email.com"
        type="text"
        icon={<FiMail />}
        error={errors.email?.[0]}
      />

      <TextInput
        label="Số điện thoại"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        placeholder="0987 654 321"
        type="text"
        icon={<FiPhone />}
        error={errors.phone?.[0]}
      />

      <TextInput
        label="Mật khẩu"
        name="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="••••••••"
        type={showPassword ? "text" : "password"}
        icon={<FiLock />}
        error={errors.password?.[0]}
        showPasswordToggle
        showPassword={showPassword}
        onTogglePassword={() => setShowPassword((v) => !v)}
      />

      <TextInput
        label="Xác nhận mật khẩu"
        name="confirmPassword"
        value={formData.confirmPassword}
        onChange={handleChange}
        placeholder="••••••••"
        type={showConfirmPassword ? "text" : "password"}
        icon={<FiLock />}
        error={errors.confirmPassword?.[0]}
        showPasswordToggle
        showPassword={showConfirmPassword}
        onTogglePassword={() => setShowConfirmPassword((v) => !v)}
      />

      <button
        type="submit"
        disabled={isLoading}
        className="
          w-full relative overflow-hidden rounded-xl
          text-white font-bold py-3.5 px-4
          bg-gradient-to-r from-[#43e1ff] via-[#7b5cff] to-[#ff7af6]
          hover:shadow-[0_0_18px_rgba(123,92,255,0.9)]
          transition-all duration-300
          disabled:opacity-70 disabled:cursor-not-allowed
        "
      >
        <span
          className="
            absolute inset-0 -translate-x-full
            bg-gradient-to-r from-transparent via-white/25 to-transparent
            transition-transform duration-1000
            hover:translate-x-full
          "
        />
        <span className="relative z-10">
          {isLoading ? <LoadingIcon text="Đang đăng ký..." /> : "Đăng ký"}
        </span>
      </button>
    </form>
  );
}
