// src/components/auth/register/RegisterForm/RegisterFields.jsx
import { useState } from 'react';
import { FiMail, FiLock, FiUser, FiPhone } from 'react-icons/fi';
import { toast } from 'react-toastify';
import LoadingIcon from '@/components/shared/LoadingIcon';
import TextInput from '@/components/shared/TextInput';
import { register as registerApi } from '@/api/authService';

export default function RegisterFields() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', password: '', confirmPassword: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p)=>({ ...p, [name]: value }));
    if (errors[name]) setErrors((p)=>({ ...p, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setErrors({});
    if (!formData.fullName.trim()) return setErrors(p=>({ ...p, fullName:['Vui lòng nhập họ tên'] }));
    if (!formData.email.trim()) return setErrors(p=>({ ...p, email:['Vui lòng nhập email'] }));
    if (formData.password.length<6) return setErrors(p=>({ ...p, password:['Mật khẩu tối thiểu 6 ký tự'] }));
    if (formData.password!==formData.confirmPassword) return setErrors(p=>({ ...p, confirmPassword:['Mật khẩu không trùng khớp'] }));
    setIsLoading(true);
    try {
      await registerApi({
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone?.trim() || '',
      });
      toast.success('Đăng ký thành công!');
      window.location.href = '/auth/login';
    } catch (error) {
      toast.error(error?.message || 'Đăng ký thất bại');
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <TextInput label="Họ và tên" name="fullName" value={formData.fullName} onChange={handleChange}
        placeholder="Nguyễn Văn A" type="text" icon={<FiUser />} error={errors.fullName?.[0]} />
      <TextInput label="Email" name="email" value={formData.email} onChange={handleChange}
        placeholder="example@email.com" type="text" icon={<FiMail />} error={errors.email?.[0]} />
      <TextInput label="Số điện thoại" name="phone" value={formData.phone} onChange={handleChange}
        placeholder="0987 654 321" type="text" icon={<FiPhone />} error={errors.phone?.[0]} />
      <TextInput label="Mật khẩu" name="password" value={formData.password} onChange={handleChange}
        placeholder="••••••••" type={showPassword ? 'text' : 'password'} icon={<FiLock />}
        error={errors.password?.[0]} showPasswordToggle showPassword={showPassword}
        onTogglePassword={()=> setShowPassword(!showPassword)} />
      <TextInput label="Xác nhận mật khẩu" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
        placeholder="••••••••" type={showConfirmPassword ? 'text' : 'password'} icon={<FiLock />}
        error={errors.confirmPassword?.[0]} showPasswordToggle showPassword={showConfirmPassword}
        onTogglePassword={()=> setShowConfirmPassword(!showConfirmPassword)} />

      <button type="submit" disabled={isLoading}
        className="w-full relative overflow-hidden rounded-xl text-white font-bold py-3.5 px-4 bg-gradient-to-r from-[#5B2E91] to-[#3C1361]">
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#FFD700]/30 to-transparent transition-transform duration-1000 hover:translate-x-full"></span>
        <span className="relative z-10">{isLoading ? <LoadingIcon text="Đang đăng ký..." /> : 'Đăng ký'}</span>
      </button>
    </form>
  );
}
