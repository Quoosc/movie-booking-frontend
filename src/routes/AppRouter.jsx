// src/routes/AppRouter.jsx
import { Routes, Route, Navigate } from 'react-router-dom';

// Public
import Home from '@/app/(public)/home/page';

// Auth
import LoginPage from '@/app/(auth)/login/page';
import RegisterPage from '@/app/(auth)/register/page';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      {/* AUTH */}
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />

      {/* Protected / Admin sẽ thêm sau */}
      {/* <Route path="/booking/:showtimeId" element={<BookingPage />} /> */}

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
