// src/components/auth/login/LoginForm/LoginFields.jsx
import { useState } from 'react';
import { FiMail, FiLock } from 'react-icons/fi';
import { toast } from 'react-toastify';
import VerifyModal from '../VerifyModal';
import LoadingIcon from '@/components/shared/LoadingIcon';
import TextInput from '@/components/shared/TextInput';
import { useAuth } from "@/context/AuthContext";
import { USE_EMAIL_VERIFY } from '@/utils/constants';

export default function LoginFields() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); setErrors({});
    try {
      await login(formData, rememberMe);
      toast.success('Đăng nhập thành công!');
    } catch (error) {
      const msg = error?.message || 'Đăng nhập thất bại';
      if (USE_EMAIL_VERIFY && msg.includes('chưa được kích hoạt')) {
        setVerifyEmail(formData.email);
        setShowVerifyModal(true);
      } else {
        toast.error(msg);
      }
    } finally { setIsLoading(false); }
  };

  return (
    <>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <TextInput label="Email" name="email" value={formData.email} onChange={handleChange}
          placeholder="example@email.com" type="text" icon={<FiMail />} error={errors.email?.[0]} />
        <TextInput label="Mật khẩu" name="password" value={formData.password} onChange={handleChange}
          placeholder="••••••••" type={showPassword ? 'text' : 'password'} icon={<FiLock />} error={errors.password?.[0]}
          showPasswordToggle showPassword={showPassword} onTogglePassword={() => setShowPassword(!showPassword)} />

        <div className="flex items-center justify-between text-sm pt-1">
          <label className="flex items-center cursor-pointer select-none">
            <input type="checkbox" checked={rememberMe} onChange={(e)=>setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-gray-400 bg-white accent-[#5B2E91]" />
            <span className="ml-2 text-white/80">Ghi nhớ đăng nhập</span>
          </label>
          <a href="/auth/forgot" className="text-[#FFD700] hover:text-[#FFB300] font-medium">Quên mật khẩu?</a>
        </div>

        <button type="submit" disabled={isLoading}
          className="w-full relative overflow-hidden rounded-xl text-white font-bold py-3.5 px-4 bg-gradient-to-r from-[#5B2E91] to-[#3C1361]">
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#FFD700]/30 to-transparent transition-transform duration-1000 hover:translate-x-full"></span>
          <span className="relative z-10">{isLoading ? <LoadingIcon text="Đang đăng nhập..." /> : 'Đăng nhập'}</span>
        </button>
      </form>

      {USE_EMAIL_VERIFY && showVerifyModal && (
        <VerifyModal email={verifyEmail} onClose={() => setShowVerifyModal(false)} />
      )}
    </>
  );
}
