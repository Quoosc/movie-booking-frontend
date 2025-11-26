// src/routes/AppRouter.jsx
import { Routes, Route, Navigate } from "react-router-dom";

// Public
import Home from "@/app/(public)/home/page";

//user
import AccountHistoryPage from "../app/(protected)/account/account-history/page";
import AccountMemberPage from "../app/(protected)/account/account-member/page";
import AccountProfilePage from "../app/(protected)/account/account-profile/page";
import AccountPasswordPage from "@/app/(protected)/account/account-password/page.jsx";
import BookingDetailPage from "@/app/(protected)/account/account-history/[bookingId]/page.jsx";

// Auth
import LoginPage from "@/app/(auth)/login/page";
import RegisterPage from "@/app/(auth)/register/page";

import MoviesPage from "@/app/(public)/movie/movies/page";
import MoviesShowingPage from "@/app/(public)/movie/movies/moviesShowing/page";
import MoviesUpCommingPage from "@/app/(public)/movie/movies/moviesUpComming/page";

import AboutPage from "@/app/(public)/about/page";

// Promotion
import PromotionsPage from "@/app/(public)/promotions/page";
import MembershipPage from "@/app/(public)/membership/page";
import MovieDetailPage from "@/app/(public)/movie/[id]/page.jsx";
import CheckoutPage from "@/app/(public)/checkout/page";
import PaymentCallbackPage from "@/app/(public)/payment-callback/page";
import CheckoutSuccessPage from "@/app/(public)/checkout-success/page";
import MovieSearchPage from "@/app/(public)/movie/search/page";
import CinemaPage from "@/app/(public)/cinema/[cinemaId]/page.jsx";
export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* Auth */}
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />

      <Route path="/promotions" element={<PromotionsPage />} />

      <Route path="/about" element={<AboutPage />} />
      {/* Movies list + detail */}
      <Route path="/movie/movies" element={<MoviesPage />} />
      <Route path="/movie/moviesShowing" element={<MoviesShowingPage />} />
      <Route path="/movie/moviesUpComming" element={<MoviesUpCommingPage />} />
      <Route path="/movie/search" element={<MovieSearchPage />} />

      <Route path="/membership" element={<MembershipPage />} />

      {/* Cinema theo rạp */}
      <Route path="/cinema/:cinemaId" element={<CinemaPage />} />

      {/* Movie detail + booking */}
      <Route path="/movie/:id" element={<MovieDetailPage />} />
      {/*  step 1 và 2 */}
      <Route path="/checkout" element={<CheckoutPage />} />
      {/*call  back thanh toán  quét qr  */}
      <Route path="/payment/callback" element={<PaymentCallbackPage />} />
      <Route path="/payment-callback" element={<PaymentCallbackPage />} />
      <Route path="/checkout-success" element={<CheckoutSuccessPage />} />

      {/* Protected*/}
      <Route path="/account/account-history" element={<AccountHistoryPage />} />
      <Route path="/account/account-member" element={<AccountMemberPage />} />
      <Route path="/account/account-profile" element={<AccountProfilePage />} />
      <Route
        path="/account/account-password"
        element={<AccountPasswordPage />}
      />
      <Route
        path="/account/account-history/:bookingId"
        element={<BookingDetailPage />}
      />
      {/* <Route path="/booking/:showtimeId" element={<BookingPage />} /> */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
