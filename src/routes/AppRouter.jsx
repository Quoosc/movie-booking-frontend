// src/routes/AppRouter.jsx
import { Routes, Route, Navigate } from "react-router-dom";

// admin
import AdminLayout from "@/layouts/AdminLayout";
import AdminRoute from "./AdminRoute";
import PrivateRoute from "./PrivateRoute";

// ==== admin pages ====
import AdminDashboardPage from "@/app/(admin)/dashboard/page";
import AdminUsersPage from "@/app/(admin)/users/page";
import AdminMembershipPage from "@/app/(admin)/membership/page";
import AdminMoviesPage from "@/app/(admin)/movies/page";
import AdminCinemasPage from "@/app/(admin)/cinemas/page";
import AdminShowtimesPage from "@/app/(admin)/showtimes/page";
import AdminSeatsPage from "@/app/(admin)/seats/page";
import AdminSnacksPage from "@/app/(admin)/snacks/page";
import AdminPricingPage from "@/app/(admin)/pricing/page";
import AdminPromotionsPage from "@/app/(admin)/promotions/page";
import AdminBookingsPage from "@/app/(admin)/bookings/page";
import AdminOrdersPage from "@/app/(admin)/orders/page";
import AdminToolsPage from "@/app/(admin)/tools/page";
import AdminRoomsPage from "../app/(admin)/rooms/page";

// Public
import Home from "@/app/(public)/home/page";

// user (protected)
import AccountHistoryPage from "../app/(protected)/account/account-history/page";
import AccountMemberPage from "../app/(protected)/account/account-member/page";
import AccountProfilePage from "../app/(protected)/account/account-profile/page";
import AccountPasswordPage from "@/app/(protected)/account/account-password/page.jsx";
import BookingDetailPage from "@/app/(protected)/account/account-history/[bookingId]/page.jsx";

// Auth
import LoginPage from "@/app/(auth)/login/page";
import RegisterPage from "@/app/(auth)/register/page";
import OAuth2SuccessPage from "@/app/(auth)/oauth2-success/page";

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
import EntertainmentServicesPage from "@/app/(public)/game/page.jsx";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      {/* Auth */}
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/oauth2/success" element={<OAuth2SuccessPage />} />

      {/* Public pages */}
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

      <Route path="/dich-vu-giai-tri" element={<EntertainmentServicesPage />} />

      {/* Movie detail + booking */}
      <Route path="/movie/:id" element={<MovieDetailPage />} />

      {/* Checkout step 1 + 2 */}
      <Route path="/checkout" element={<CheckoutPage />} />

      {/* Payment callback */}
      <Route path="/payment/callback" element={<PaymentCallbackPage />} />
      <Route path="/payment-callback" element={<PaymentCallbackPage />} />
      <Route path="/checkout-success" element={<CheckoutSuccessPage />} />

      {/* ====== PROTECTED MEMBER ROUTES (cần login) ====== */}
      <Route element={<PrivateRoute />}>
        <Route
          path="/account/account-history"
          element={<AccountHistoryPage />}
        />
        <Route path="/account/account-member" element={<AccountMemberPage />} />
        <Route
          path="/account/account-profile"
          element={<AccountProfilePage />}
        />
        <Route
          path="/account/account-password"
          element={<AccountPasswordPage />}
        />
        <Route
          path="/account/account-history/:bookingId"
          element={<BookingDetailPage />}
        />
      </Route>

      {/* ====== ADMIN ROUTES ====== */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="membership" element={<AdminMembershipPage />} />
        <Route path="movies" element={<AdminMoviesPage />} />
        <Route path="cinemas" element={<AdminCinemasPage />} />
        <Route path="showtimes" element={<AdminShowtimesPage />} />
        <Route path="seats" element={<AdminSeatsPage />} />
        <Route path="snacks" element={<AdminSnacksPage />} />
        <Route path="pricing" element={<AdminPricingPage />} />
        <Route path="promotions" element={<AdminPromotionsPage />} />
        <Route path="bookings" element={<AdminBookingsPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="tools" element={<AdminToolsPage />} />
        <Route path="rooms" element={<AdminRoomsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
