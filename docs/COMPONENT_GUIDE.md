# COMPONENT_GUIDE.md — Hướng dẫn Component & Page

## 1. Tổ chức Components

```
src/components/
├── auth/                    # Auth-specific components
│   ├── login/
│   │   └── LoginForm/
│   │       ├── LoginForm.jsx        # Form đăng nhập chính
│   │       └── LoginFields.jsx      # Fields: email, password
│   ├── register/
│   │   └── RegisterForm/
│   │       ├── RegisterForm.jsx     # Form đăng ký chính
│   │       └── RegisterFields.jsx   # Fields: name, email, phone, password
│   ├── shared/
│   │   ├── AuthDivider.jsx          # Dòng "hoặc" giữa form và social login
│   │   ├── AuthHeader.jsx           # Logo + title trên form
│   │   └── AuthRedirect.jsx         # Link "Đã có tài khoản? Đăng nhập"
│   └── social_login/
│       ├── SocialLogin.jsx          # Nút Google/Facebook (trang login)
│       └── SocialRegister.jsx       # Nút Google/Facebook (trang register)
│
├── cinema/
│   ├── CinemaDropdown.jsx           # Dropdown chọn rạp
│   ├── CinemaHero.jsx               # Banner hero rạp
│   ├── CinemaMovieGrid.jsx          # Grid phim đang chiếu tại rạp
│   └── CinemaTabs.jsx               # Tab chuyển SHOWING/UPCOMING
│
├── common/
│   ├── Navbar.jsx                   # Header navigation chính
│   ├── Footer.jsx                   # Footer chung
│   └── ScrollToTop.jsx              # Auto scroll top khi chuyển route
│
├── home/
│   ├── HeroSlider.jsx               # Carousel banner trang chủ (framer-motion)
│   └── SectionTitle.jsx             # Title chung cho section
│
├── movies/
│   ├── MovieCard.jsx                # Card 1 phim (poster, title, genre, rating)
│   ├── MovieCarousel.jsx            # Carousel phim (framer-motion swipe)
│   └── AllMoviesGrid.jsx            # Grid tất cả phim
│
├── membership/
│   ├── MembershipDetail.jsx         # Chi tiết hạng thành viên
│   └── MembershipHighlight.jsx      # Highlight ưu đãi membership
│
├── promotions/
│   ├── PromoHighlight.jsx           # Banner promotion nổi bật
│   └── PromoList.jsx                # Danh sách promotion
│
├── contact/
│   └── ContactSection.jsx           # Form/info liên hệ
│
├── logo/
│   └── movie_booking_logo.jsx       # SVG/Component logo
│
└── shared/
    ├── Buttons/
    │   └── HomeButton.jsx           # Nút "Về trang chủ"
    ├── LoadingIcon.jsx              # Spinner loading
    ├── TextInput.jsx                # Input field chung (label, error)
    └── WarningModal.jsx             # Modal cảnh báo/xác nhận
```

## 2. Tổ chức Pages

### 2.1 Auth Pages (`src/app/(auth)/`)

| Page | Route | Mô tả | Components sử dụng |
|------|-------|-------|---------------------|
| `login/page.jsx` | `/auth/login` | Form đăng nhập | `LoginForm`, `SocialLogin`, `AuthHeader`, `AuthRedirect` |
| `register/page.jsx` | `/auth/register` | Form đăng ký | `RegisterForm`, `SocialRegister`, `AuthHeader`, `AuthRedirect` |
| `oauth2-success/page.jsx` | `/oauth2/success` | Callback OAuth2 | Parse token → lưu → redirect |

### 2.2 Public Pages (`src/app/(public)/`)

| Page | Route | API calls | Mô tả |
|------|-------|-----------|-------|
| `home/page.jsx` | `/` | `getShowingMovies()`, `getUpcomingMovies()` | Trang chủ: HeroSlider + carousel phim |
| `movie/movies/page.jsx` | `/movie/movies` | `getAllMovies()` | Grid tất cả phim |
| `movie/movies/moviesShowing/page.jsx` | `/movie/moviesShowing` | `getShowingMovies()` | Phim đang chiếu |
| `movie/movies/moviesUpComming/page.jsx` | `/movie/moviesUpComming` | `getUpcomingMovies()` | Phim sắp chiếu |
| `movie/search/page.jsx` | `/movie/search` | `searchMoviesByTitle()`, `filterMoviesByGenre()`, `filterMoviesByStatus()` | Tìm kiếm + lọc phim |
| `movie/[id]/page.jsx` | `/movie/:id` | `getMovieById()`, `getMovieShowtimesByDate()`, `getTicketTypes()` | Chi tiết phim + chọn suất chiếu + loại vé |
| `cinema/[cinemaId]/page.jsx` | `/cinema/:cinemaId` | `getCinemaById()`, `getCinemaMovies()` | Chi tiết rạp + phim đang chiếu |
| `checkout/page.jsx` | `/checkout` | `getSeatLayout()`, `lockSeats()`, `getSnacksByCinema()`, `previewPrice()`, `createBooking()`, `createPaymentOrder()` | **Page phức tạp nhất** — toàn bộ checkout flow |
| `payment-callback/page.jsx` | `/payment/callback` | `capturePayment()` | Xử lý callback từ PayPal/Momo |
| `checkout-success/page.jsx` | `/checkout-success` | — | Hiển thị thành công + QR code |
| `promotions/page.jsx` | `/promotions` | `getValidPromotions()` | Danh sách khuyến mãi |
| `membership/page.jsx` | `/membership` | `getActiveMembershipTiers()` | Bảng hạng thành viên |
| `about/page.jsx` | `/about` | — | Trang giới thiệu |
| `game/page.jsx` | `/dich-vu-giai-tri` | — | Dịch vụ giải trí |

### 2.3 Protected Pages (`src/app/(protected)/`)

> Yêu cầu đăng nhập — wrap bởi `PrivateRoute`

| Page | Route | API calls |
|------|-------|-----------|
| `account/account-profile/page.jsx` | `/account/account-profile` | `getUserProfile()`, `updateUserProfile()`, `uploadAvatar()` |
| `account/account-history/page.jsx` | `/account/account-history` | `getMyBookings()` |
| `account/account-history/[bookingId]/page.jsx` | `/account/account-history/:bookingId` | `getBookingById()` |
| `account/account-member/page.jsx` | `/account/account-member` | `getUserLoyalty()`, `getActiveMembershipTiers()` |
| `account/account-password/page.jsx` | `/account/account-password` | `changePassword()` |

### 2.4 Admin Pages (`src/app/(admin)/`)

> Yêu cầu role ADMIN — wrap bởi `AdminRoute` + `AdminLayout`

| Page | Route | Admin Service |
|------|-------|---------------|
| `dashboard/page.jsx` | `/admin` | Tổng hợp thống kê |
| `users/page.jsx` | `/admin/users` | `AdminUserService` |
| `membership/page.jsx` | `/admin/membership` | `AdminUserService` (membership tiers) |
| `movies/page.jsx` | `/admin/movies` | `AdminMovieService` |
| `cinemas/page.jsx` | `/admin/cinemas` | `AdminCinemaService` (cinemas) |
| `rooms/page.jsx` | `/admin/rooms` | `AdminCinemaService` (rooms) |
| `showtimes/page.jsx` | `/admin/showtimes` | `AdminMovieService` (showtimes) |
| `seats/page.jsx` | `/admin/seats` | `AdminCinemaService` (seats) |
| `snacks/page.jsx` | `/admin/snacks` | `AdminCinemaService` (snacks) |
| `pricing/page.jsx` | `/admin/pricing` | `AdminPricingService` |
| `promotions/page.jsx` | `/admin/promotions` | `AdminToolsService` |
| `bookings/page.jsx` | `/admin/bookings` | `AdminOrderService` |
| `orders/page.jsx` | `/admin/orders` | `AdminOrderService` (payments) |
| `tools/page.jsx` | `/admin/tools` | `AdminToolsService` (seat locks, debug) |

## 3. Quy tắc khi thêm trang mới

### Thêm Public Page

1. Tạo folder trong `src/app/(public)/{tên-page}/page.jsx`
2. Import vào `src/routes/AppRouter.jsx`
3. Thêm `<Route path="/xxx" element={<XxxPage />} />`

### Thêm Protected Page

1. Tạo folder trong `src/app/(protected)/{tên-page}/page.jsx`
2. Import vào `AppRouter.jsx`
3. Thêm `<Route>` bên trong `<Route element={<PrivateRoute />}>`

### Thêm Admin Page

1. Tạo folder trong `src/app/(admin)/{tên-page}/page.jsx`
2. Import vào `AppRouter.jsx`
3. Thêm `<Route path="xxx" element={<AdminXxxPage />} />` bên trong AdminRoute block
4. Thêm menu item vào `AdminSidebar.jsx`

### Thêm API Service

1. Tạo file trong `src/api/{tên}Service.js` (public) hoặc `src/api/adminservice/admin{Tên}Service.js` (admin)
2. Import `apiFetch` từ `./fetchConfig`
3. Export async functions
4. Pattern chuẩn:
   ```javascript
   export async function getXxx() {
     const res = await apiFetch("/xxx");
     return res.data || res;
   }
   ```

### Thêm Component

1. Tạo folder trong `src/components/{category}/{TenComponent}.jsx`
2. Export default component
3. Nếu cần test: tạo `tests/{TenComponent}.test.jsx` cùng folder

## 4. State Management

```
AuthContext (global):
  → user, role, isAuthenticated, isAdmin, isMember, isGuest
  → login(), logout(), register(), refreshProfile()
  → Dùng: useAuth() hook

Page-level state (local):
  → useState() cho form data, loading, error
  → useEffect() cho data fetching on mount
  → URL params: useParams(), useSearchParams()
  → Navigation: useNavigate(), useLocation()
```

## 5. Dependencies chính dùng trong Components

| Library | Component/Page sử dụng | Mục đích |
|---------|------------------------|----------|
| `framer-motion` | HeroSlider, MovieCarousel | Animation, swipe gesture |
| `react-icons` | Navbar, Sidebar, Cards | Icons (FiHome, FiFilm, ...) |
| `react-toastify` | Tất cả pages | Toast notification |
| `react-qr-code` | CheckoutSuccessPage, BookingDetail | QR code vé |
| `recharts` | AdminDashboard | Biểu đồ thống kê |
| `react-router-dom` | AppRouter, PrivateRoute, AdminRoute | Routing, params, navigate |
