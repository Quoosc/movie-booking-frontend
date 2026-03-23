# PROJECT_STRUCTURE.md — Cấu trúc dự án Frontend

## Tổng quan

Dự án sử dụng **Vite 5 + React 18** (SPA, JavaScript) kết nối với Backend **Java Spring Boot** (port 8080) hoặc **Laravel** (port 8000).
Styling bằng **TailwindCSS 3**, routing bằng **react-router-dom v6**.

```
movie-booking-frontend/
├── src/
│   ├── api/                          # ← API Service Layer
│   │   ├── fetchConfig.js            # Base fetch wrapper (apiFetch), CSRF, JWT auto-detect
│   │   ├── authService.js            # Login, register, logout, refresh, me()
│   │   ├── movieService.js           # CRUD phim, search, filter, cinema movies
│   │   ├── showtimeService.js        # Suất chiếu theo phim + ngày
│   │   ├── bookingService.js         # Seat layout, lock/release, booking, payment order, snacks
│   │   ├── cinemaService.js          # List/detail rạp phim
│   │   ├── paymentService.js         # Capture payment (PayPal/Momo)
│   │   ├── promotionService.js       # Validate mã khuyến mãi
│   │   ├── userService.js            # Profile, loyalty, password
│   │   ├── ticketTypeService.js      # Loại vé + giá theo showtime
│   │   ├── cloudinaryService.js      # Upload poster/snack/avatar lên Cloudinary
│   │   └── adminservice/             # Admin-only API services
│   │       ├── index.js              # Barrel export
│   │       ├── adminMovieService.js   # CRUD phim + suất chiếu (admin)
│   │       ├── adminCinemaService.js  # CRUD rạp, phòng, ghế, snack (admin)
│   │       ├── adminUserService.js    # Quản lý user, role, membership tier
│   │       ├── adminOrderService.js   # Booking detail, payment search, refund
│   │       ├── adminPricingService.js # Price base/modifier, ticket types, showtime seats
│   │       └── adminToolsService.js   # Seat locks, promotions, price preview
│   │
│   ├── context/
│   │   └── AuthContext.jsx           # Global auth state (user, role, login/logout)
│   │
│   ├── routes/
│   │   ├── AppRouter.jsx             # Tất cả route definitions (~145 lines)
│   │   ├── PrivateRoute.jsx          # Guard: chuyển /auth/login nếu chưa login
│   │   └── AdminRoute.jsx            # Guard: cần login + role ADMIN
│   │
│   ├── layouts/
│   │   ├── MainLayout.jsx            # Layout chung (public pages)
│   │   ├── AuthLayout.jsx            # Layout cho login/register
│   │   ├── AdminLayout.jsx           # Layout admin (sidebar + topbar + content)
│   │   ├── AdminSidebar.jsx          # Sidebar navigation admin
│   │   └── AdminTopbar.jsx           # Topbar admin (user info, notifications)
│   │
│   ├── components/                   # 48 component files
│   │   ├── auth/                     # LoginForm, RegisterForm, SocialLogin, VerifyModal
│   │   ├── cinema/                   # CinemaDropdown, CinemaHero, CinemaMovieGrid, CinemaTabs
│   │   ├── common/                   # Footer, Navbar, ScrollToTop
│   │   ├── contact/                  # ContactSection
│   │   ├── home/                     # HeroSlider, SectionTitle
│   │   ├── logo/                     # movie_booking_logo
│   │   ├── membership/              # MembershipDetail, MembershipHighlight
│   │   ├── movies/                   # MovieCard, MovieCarousel, AllMoviesGrid
│   │   ├── promotions/              # PromoHighlight, PromoList
│   │   └── shared/                   # Buttons, LoadingIcon, TextInput, WarningModal
│   │
│   ├── app/                          # 36 page files (tổ chức theo route group)
│   │   ├── (auth)/                   # 3 pages: login, register, oauth2-success
│   │   ├── (public)/                 # 13 pages: home, movies, checkout, payment...
│   │   ├── (protected)/             # 5 pages: account profile/history/member/password
│   │   └── (admin)/                  # 14 pages: dashboard, users, movies, cinemas...
│   │
│   ├── utils/
│   │   └── constants.js              # ROLES, USE_MOCK_API, USE_EMAIL_VERIFY
│   │
│   ├── test/                         # Test setup
│   ├── main.jsx                      # Entry point (BrowserRouter + AuthProvider + ToastContainer)
│   ├── App.jsx                       # Render AppRouter
│   └── index.css                     # TailwindCSS imports
│
├── e2e/                              # Playwright E2E tests
├── .env.spring                       # Backend Spring Boot config
├── .env.laravel                      # Backend Laravel config
├── .env.e2e                          # E2E test credentials
├── vite.config.js                    # Vite config + Vitest setup + path alias @/
├── tailwind.config.js                # TailwindCSS config
├── vercel.json                       # Vercel deployment config
├── playwright.config.ts             # Playwright E2E config
└── package.json                      # Dependencies + scripts
```

## Quy ước quan trọng

| Concept | Quy tắc |
|---------|---------|
| **Route Groups** | `(auth)`, `(public)`, `(protected)`, `(admin)` — tổ chức logic, không ảnh hưởng URL |
| **Page file** | Mỗi route là 1 folder chứa `page.jsx` — convention giống Next.js |
| **Dynamic routes** | Dùng folder `[param]` — ví dụ `movie/[id]/page.jsx` |
| **API calls** | Luôn dùng `apiFetch(path)` từ `@/api/fetchConfig` |
| **Path alias** | `@/` = `src/` (cấu hình trong `vite.config.js`) |
| **Mock toggle** | Mỗi service file có `const USE_MOCK = false` — bật `true` để test offline |
| **Auth check** | Dùng `useAuth()` hook từ `@/context/AuthContext` |
| **Role check** | `isAdmin` cho admin, `isMember` cho user đã login, `isGuest` cho chưa login |

## Mapping Backend ↔ Frontend

| Backend Module | Frontend Route | Service File | Mô tả |
|---------------|---------------|-------------|-------|
| `auth` | `/auth/login`, `/auth/register` | `authService.js` | Đăng nhập, đăng ký, OAuth2 |
| `movies` | `/movie/*` | `movieService.js` | Danh sách, chi tiết, search, filter phim |
| `showtimes` | `/movie/:id` (tab suất chiếu) | `showtimeService.js` | Suất chiếu theo phim + ngày |
| `cinemas` | `/cinema/:cinemaId` | `cinemaService.js` | Chi tiết rạp, phim đang chiếu |
| `seats` | `/checkout` (step 1) | `bookingService.js` | Sơ đồ ghế, lock/release |
| `bookings` | `/checkout` (step 2) | `bookingService.js` | Tạo booking, snacks |
| `payments` | `/payment/callback` | `paymentService.js`, `bookingService.js` | PayPal/Momo payment |
| `promotions` | `/promotions`, `/checkout` | `promotionService.js` | Mã khuyến mãi |
| `users` | `/account/*` | `userService.js` | Profile, loyalty, password |
| `ticket-types` | `/checkout` | `ticketTypeService.js` | Loại vé + giá |
| `membership-tiers` | `/membership`, `/account/account-member` | `userService.js` | Hạng thành viên |
| `cloudinary` | Admin pages | `cloudinaryService.js` | Upload hình ảnh |
| `admin/*` | `/admin/*` | `adminservice/*.js` | Tất cả chức năng quản trị |
