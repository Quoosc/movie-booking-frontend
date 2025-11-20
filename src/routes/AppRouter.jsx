// src/routes/AppRouter.jsx
import { Routes, Route, Navigate } from "react-router-dom";

// Public
import Home from "@/app/(public)/home/page";

// Auth
import LoginPage from "@/app/(auth)/login/page";
import RegisterPage from "@/app/(auth)/register/page";

// Promotion
import PromotionsPage from "@/app/(public)/promotions/page";

import MovieDetailPage from "@/app/(public)/movie/[id]/page.jsx";
import CheckoutPage from "@/app/(public)/checkout/page";
import PaymentCallbackPage from "@/app/(public)/payment-callback/page";
import CheckoutSuccessPage from "@/app/(public)/checkout-success/page";
export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* Auth */}
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />

      <Route path="/promotions" element={<PromotionsPage />} />

      {/* Movie detail + booking */}
      <Route path="/movie/:id" element={<MovieDetailPage />} />
      {/*  step 1 và 2 */}
      <Route path="/checkout" element={<CheckoutPage />} />
      {/*call  back thanh toán  quét qr  */}
      <Route path="/payment/callback" element={<PaymentCallbackPage />} />
      <Route path="/payment-callback" element={<PaymentCallbackPage />} />
      <Route path="/checkout-success" element={<CheckoutSuccessPage />} />

      {/* Protected / Admin sẽ thêm sau */}
      {/* <Route path="/booking/:showtimeId" element={<BookingPage />} /> */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
