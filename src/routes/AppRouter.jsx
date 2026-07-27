import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AdminRoute from "./AdminRoute";
import PrivateRoute from "./PrivateRoute";

const AdminLayout = lazy(() => import("@/layouts/AdminLayout"));
const AdminDashboardPage = lazy(() => import("@/app/(admin)/dashboard/page"));
const AdminUsersPage = lazy(() => import("@/app/(admin)/users/page"));
const AdminMembershipPage = lazy(() => import("@/app/(admin)/membership/page"));
const AdminMoviesPage = lazy(() => import("@/app/(admin)/movies/page"));
const AdminCinemasPage = lazy(() => import("@/app/(admin)/cinemas/page"));
const AdminShowtimesPage = lazy(() => import("@/app/(admin)/showtimes/page"));
const AdminSeatsPage = lazy(() => import("@/app/(admin)/seats/page"));
const AdminSnacksPage = lazy(() => import("@/app/(admin)/snacks/page"));
const AdminPricingPage = lazy(() => import("@/app/(admin)/pricing/page"));
const AdminPromotionsPage = lazy(() => import("@/app/(admin)/promotions/page"));
const AdminHeroSlidesPage = lazy(() => import("@/app/(admin)/heroslides/page"));
const AdminBookingsPage = lazy(() => import("@/app/(admin)/bookings/page"));
const AdminOrdersPage = lazy(() => import("@/app/(admin)/orders/page"));
const AdminToolsPage = lazy(() => import("@/app/(admin)/tools/page"));
const AdminRoomsPage = lazy(() => import("@/app/(admin)/rooms/page"));
const AdminReviewsPage = lazy(() => import("@/app/(admin)/reviews/page"));

const Home = lazy(() => import("@/app/(public)/home/page"));
const LoginPage = lazy(() => import("@/app/(auth)/login/page"));
const RegisterPage = lazy(() => import("@/app/(auth)/register/page"));
const OAuth2SuccessPage = lazy(() => import("@/app/(auth)/oauth2-success/page"));
const PromotionsPage = lazy(() => import("@/app/(public)/promotions/page"));
const AboutPage = lazy(() => import("@/app/(public)/about/page"));
const MoviesPage = lazy(() => import("@/app/(public)/movie/movies/page"));
const MoviesShowingPage = lazy(() =>
  import("@/app/(public)/movie/movies/moviesShowing/page")
);
const MoviesUpCommingPage = lazy(() =>
  import("@/app/(public)/movie/movies/moviesUpComming/page")
);
const MovieSearchPage = lazy(() => import("@/app/(public)/movie/search/page"));
const MembershipPage = lazy(() => import("@/app/(public)/membership/page"));
const ShowtimesPage = lazy(() => import("@/app/(public)/showtimes/page"));
const CinemaPage = lazy(() => import("@/app/(public)/cinema/[cinemaId]/page.jsx"));
const EntertainmentServicesPage = lazy(() => import("@/app/(public)/game/page.jsx"));
const MovieDetailPage = lazy(() => import("@/app/(public)/movie/[id]/page.jsx"));
const CheckoutPage = lazy(() => import("@/app/(public)/checkout/page"));
const PaymentCallbackPage = lazy(() =>
  import("@/app/(public)/payment-callback/page")
);
const CheckoutSuccessPage = lazy(() => import("@/app/(public)/checkout-success/page"));

const AccountHistoryPage = lazy(() =>
  import("@/app/(protected)/account/account-history/page")
);
const AccountMemberPage = lazy(() =>
  import("@/app/(protected)/account/account-member/page")
);
const AccountProfilePage = lazy(() =>
  import("@/app/(protected)/account/account-profile/page")
);
const AccountPasswordPage = lazy(() =>
  import("@/app/(protected)/account/account-password/page.jsx")
);
const NotificationsPage = lazy(() =>
  import("@/app/(protected)/account/notifications/page.jsx")
);
const BookingDetailPage = lazy(() =>
  import("@/app/(protected)/account/account-history/[bookingId]/page.jsx")
);

function RouteFallback() {
  return (
    <div className="min-h-screen bg-[#050018] text-white flex items-center justify-center">
      <p className="text-sm text-white/70">Đang tải trang...</p>
    </div>
  );
}

export default function AppRouter() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/oauth2/success" element={<OAuth2SuccessPage />} />

        <Route path="/promotions" element={<PromotionsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/movie/movies" element={<MoviesPage />} />
        <Route path="/movie/moviesShowing" element={<MoviesShowingPage />} />
        <Route path="/movie/moviesUpComming" element={<MoviesUpCommingPage />} />
        <Route path="/movie/search" element={<MovieSearchPage />} />
        <Route path="/membership" element={<MembershipPage />} />
        <Route path="/showtimes" element={<ShowtimesPage />} />
        <Route path="/cinema/:cinemaId" element={<CinemaPage />} />
        <Route path="/dich-vu-giai-tri" element={<EntertainmentServicesPage />} />
        <Route path="/movie/:id" element={<MovieDetailPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment/callback" element={<PaymentCallbackPage />} />
        <Route path="/payment-callback" element={<PaymentCallbackPage />} />
        <Route path="/checkout-success" element={<CheckoutSuccessPage />} />

        <Route element={<PrivateRoute />}>
          <Route path="/account/account-history" element={<AccountHistoryPage />} />
          <Route path="/account/account-member" element={<AccountMemberPage />} />
          <Route path="/account/account-profile" element={<AccountProfilePage />} />
          <Route path="/account/account-password" element={<AccountPasswordPage />} />
          <Route path="/account/notifications" element={<NotificationsPage />} />
          <Route
            path="/account/account-history/:bookingId"
            element={<BookingDetailPage />}
          />
        </Route>

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
          <Route path="heroslides" element={<AdminHeroSlidesPage />} />
          <Route path="bookings" element={<AdminBookingsPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="tools" element={<AdminToolsPage />} />
          <Route path="rooms" element={<AdminRoomsPage />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
