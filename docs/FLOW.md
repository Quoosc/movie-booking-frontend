# FLOW.md — Luồng dữ liệu (Data Flow)

## 1. Tổng quan kiến trúc

```
┌─────────────────────────────────┐
│   BROWSER (Vite + React 18)     │
│   http://localhost:5173         │
├─────────────────────────────────┤
│  app/  │  api/fetchConfig.js    │
│  pages │  → apiFetch("/...")    │
└────────┬────────────────────────┘
         │ Trực tiếp (không proxy)
         ▼
┌──────────────────────────────────────────┐
│   Spring Boot Backend                    │
│   https://20.212.11.234 (production)     │
│   http://localhost:8080 (dev default)    │
├──────────────────────────────────────────┤
│  Controller → Service → Repository      │
│  → MySQL/PostgreSQL DB                   │
└──────────────────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────────┐
│   3rd Party Services                     │
│   • Cloudinary (image upload)            │
│   • PayPal (payment gateway)             │
│   • Momo (payment gateway)               │
│   • Google/Facebook (OAuth2 login)       │
└──────────────────────────────────────────┘
```

## 2. Luồng xác thực (Authentication Flow)

### 2.1 Login bằng email/password

```
User truy cập /auth/login
  → LoginForm: nhập email + password → submit
  → authService.login({ email, password })
  → apiFetch("/auth/login", { method: "POST", body })
  → BE trả response:
    {
      data: {
        accessToken: "jwt...",
        refreshToken: "jwt...",
        user: { userId, email, role, ... }
      }
    }
  → authService lưu:
    - localStorage["accessToken"] = jwt
    - localStorage["refreshToken"] = jwt
    - localStorage["user"] = JSON.stringify(user)
  → AuthContext.handleLogin():
    - Gọi authService.me() → GET /users/profile
    - Merge profile + stored user → setUser(merged)
  → Redirect về trang chủ hoặc trang trước đó
```

### 2.2 Login bằng OAuth2 (Google/Facebook)

```
User nhấn "Đăng nhập bằng Google/Facebook"
  → Redirect sang backend OAuth2 endpoint:
    OAUTH_BASE_URL + "/oauth2/authorization/google"
  → BE xử lý OAuth2 → redirect về:
    /oauth2/success?token=xxx&refreshToken=xxx
  → OAuth2SuccessPage:
    - Parse token từ URL params
    - Lưu vào localStorage
    - Gọi authService.me() lấy profile
    - setUser() → redirect về "/"
```

### 2.3 Session management

```
Mỗi request API:
  → apiFetch() kiểm tra:
    1. shouldAttachBearer()?
       - AUTH_MODE="bearer" → YES (Laravel)
       - AUTH_MODE="cookie" → NO (Spring Boot)
       - AUTH_MODE="auto"  → port 8000 = YES, port 8080 = NO
    2. Nếu YES → headers.Authorization = "Bearer " + localStorage["accessToken"]
    3. Luôn gửi credentials: "include" (cho cookie-based auth)
    4. Auto gửi CSRF token nếu có (X-XSRF-TOKEN / X-CSRF-TOKEN)

Token hết hạn:
  → GET /auth/refresh → nhận accessToken mới
  → Lưu lại localStorage["accessToken"]
```

### 2.4 Route Protection

```
PrivateRoute (component wrapper):
  → useAuth() → loading? → hiện "Đang tải..."
  → !isAuthenticated? → Navigate to="/auth/login"
  → isAuthenticated? → render <Outlet />

AdminRoute (component wrapper):
  → useAuth() → loading? → hiện "Đang tải..."
  → !isAuthenticated? → Navigate to="/auth/login"
  → !isAdmin? → Navigate to="/"
  → isAdmin? → render children (AdminLayout)
```

## 3. Luồng đặt vé (Booking Flow)

> Đây là flow chính và phức tạp nhất của ứng dụng.
> Hỗ trợ cả **Member** (đã login) và **Guest** (chưa login, dùng `X-Session-Id` header).

### 3.1 Bước 1: Chọn phim + suất chiếu

```
User truy cập /movie/:id (MovieDetailPage)
  → movieService.getMovieById(id) → GET /movies/{id}
  → Hiển thị poster, mô tả, trailer, cast, director

User chọn ngày:
  → showtimeService.getShowtimesByMovie(movieId, date)
  → GET /movies/{movieId}/showtimes?date=YYYY-MM-DD
  → Response:
    [
      {
        cinemaId, cinemaName, address,
        showtimes: [
          { showtimeId, startTime: "19:30", format: "2D", room: "Phòng 2", basePrice: 90000 }
        ]
      }
    ]

User chọn suất chiếu → lưu vào state:
  { showtimeId, cinemaId, cinemaName, startTime, room, basePrice }
```

### 3.2 Bước 2: Chọn loại vé

```
→ ticketTypeService.getTicketTypes({ showtimeId, userId })
→ GET /ticket-types?showtimeId=xxx&userId=xxx
→ Response:
  [
    { ticketTypeId: "uuid", code: "ADULT", label: "Vé Người Lớn", price: 90000 },
    { ticketTypeId: "uuid", code: "CHILD", label: "Vé Trẻ Em",    price: 60000 },
    { ticketTypeId: "uuid", code: "SENIOR", label: "Vé Người Cao Tuổi", price: 70000 },
  ]

User chọn số lượng mỗi loại vé → lưu vào state
```

### 3.3 Bước 3: Chọn ghế (Checkout Page)

```
User vào /checkout (CheckoutPage)
  → bookingService.getSeatLayout(showtimeId)
  → GET /seats/layout?showtime_id=xxx
  → Response: mỗi ghế có:
    {
      showtimeSeatId, row: "A", number: 1,
      type: "NORMAL|VIP|COUPLE",
      status: "AVAILABLE|BOOKED|LOCKED",
      price: 90000
    }
  → Render sơ đồ ghế (grid theo row/number)
  → User click chọn ghế AVAILABLE → highlight

Lock ghế đã chọn:
  → bookingService.lockSeats({
      showtimeId,
      seats: [{ showtimeSeatId, ticketTypeId }],
    })
  → POST /seat-locks
    Headers: { "X-Session-Id": guestSessionId } (nếu guest)
    Body: { showtimeId, seats: [...] }
  → Response: { lockId, status: "LOCKED", expiresAt, remainingSeconds }
  → Bắt đầu countdown timer (thường 10 phút)
```

### 3.4 Bước 4: Chọn bắp nước

```
→ bookingService.getSnacksByCinema(cinemaId)
→ GET /cinemas/snacks?cinemaId=xxx
→ Response: mỗi snack có:
  {
    snackId, name, description, price,
    type: "FOOD|DRINK",
    imageUrl, imageCloudinaryId
  }
→ FE tự group theo category (COMBO, BẮP RANG BÔNG, NƯỚC NGỌT, ...)
→ User chọn số lượng mỗi snack
```

### 3.5 Bước 5: Nhập mã khuyến mãi (optional)

```
→ promotionService.validatePromotion(code)
→ GET /promotions/code/{code}
→ Nếu hợp lệ: { valid: true, promotion: { promotionId, code, discountType, discountValue } }
→ Nếu không: { valid: false, message: "Mã không hợp lệ" }
```

### 3.6 Bước 6: Preview giá

```
→ bookingService.previewPrice({
    lockId,
    snacks: [{ snackId, quantity }],
    promotionCode,
  })
→ POST /bookings/price-preview
  Headers: { "X-Session-Id": guestSessionId }
  Body: { lockId, promotionCode, snacks: [...] }
→ Response: { subtotal, discount, total, breakdown: { ... } }
```

### 3.7 Bước 7: Tạo booking + thanh toán

```
Tạo booking:
  → bookingService.createBooking({
      lockId,
      promotionCode,
      snackCombos: [{ snackId, quantity }],
      guestInfo: { email, username, phoneNumber } (nếu guest),
    })
  → POST /bookings/confirm
    Headers: { "X-Session-Id": guestSessionId }
  → Response: { bookingId, status: "PENDING_PAYMENT", totalAmount, ... }

Tạo lệnh thanh toán:
  → bookingService.createPaymentOrder({
      bookingId,
      paymentMethod: "PAYPAL" | "MOMO",
      amount: totalAmount,
    })
  → POST /payments/order
  → Response: {
      paymentId, orderId, txnRef,
      paymentUrl: "https://paypal.com/..." (redirect URL)
    }
  → window.location.href = paymentUrl (redirect user ra gateway)
```

### 3.8 Bước 8: Payment Callback

```
PayPal/Momo redirect về:
  /payment-callback?token=xxx&PayerID=xxx (PayPal)
  /payment-callback?orderId=xxx&resultCode=0 (Momo)

PaymentCallbackPage:
  → paymentService.capturePayment({
      transactionId: token/orderId,
      paymentMethod: "PAYPAL" | "MOMO",
    })
  → POST /payments/order/capture
  → BE verify với gateway → cập nhật booking status = COMPLETED
  → Redirect → /checkout-success

CheckoutSuccessPage:
  → Hiển thị thông tin booking + QR code
```

### 3.9 Bảng tóm tắt Booking Flow

| Bước | API Endpoint | Method | Mô tả |
|------|-------------|--------|-------|
| 1 | `/movies/{id}` | GET | Chi tiết phim |
| 2 | `/movies/{id}/showtimes?date=` | GET | Suất chiếu |
| 3 | `/ticket-types?showtimeId=` | GET | Loại vé + giá |
| 4 | `/seats/layout?showtime_id=` | GET | Sơ đồ ghế |
| 5 | `/seat-locks` | POST | Lock ghế |
| 6 | `/cinemas/snacks?cinemaId=` | GET | Bắp nước |
| 7 | `/promotions/code/{code}` | GET | Validate promo |
| 8 | `/bookings/price-preview` | POST | Preview giá |
| 9 | `/bookings/confirm` | POST | Tạo booking |
| 10 | `/payments/order` | POST | Tạo payment |
| 11 | `/payments/order/capture` | POST | Capture payment |

## 4. Luồng quản lý tài khoản (Account Flow)

### 4.1 Xem/sửa Profile

```
/account/account-profile
  → userService.getUserProfile() → GET /users/profile
  → userService.updateUserProfile(payload) → PUT /users/profile
  → Upload avatar: cloudinaryService.uploadAvatar(file) → Cloudinary API
```

### 4.2 Đổi mật khẩu

```
/account/account-password
  → userService.changePassword({
      currentPassword, newPassword, confirmPassword
    })
  → PATCH /users/password
```

### 4.3 Lịch sử đặt vé

```
/account/account-history
  → bookingService.getMyBookings() → GET /bookings/my-bookings
  → Click 1 booking → /account/account-history/:bookingId
  → bookingService.getBookingById(bookingId) → GET /bookings/{bookingId}
```

### 4.4 Thông tin thành viên

```
/account/account-member
  → userService.getUserLoyalty() → GET /users/loyalty
  → userService.getActiveMembershipTiers() → GET /membership-tiers/active
  → Hiển thị: tier hiện tại, điểm tích lũy, bảng hạng
```

## 5. Luồng Guest vs Member

| Hành vi | Guest (chưa login) | Member (đã login) |
|---------|--------------------|--------------------|
| Xem phim, suất chiếu | ✅ | ✅ |
| Chọn ghế, lock | ✅ (dùng `X-Session-Id`) | ✅ (JWT cookie) |
| Đặt vé | ✅ (nhập guestInfo) | ✅ (auto từ profile) |
| Thanh toán | ✅ | ✅ |
| Xem lịch sử booking | ❌ | ✅ |
| Tích điểm thành viên | ❌ | ✅ |
| Quản lý profile | ❌ | ✅ |
| Admin panel | ❌ | ✅ (role ADMIN) |

## 6. Cách data chảy trong code

```
User clicks button
  → React Component event handler (onClick)
  → Import service: import { getSeatLayout } from "@/api/bookingService"
  → Service function gọi: apiFetch("/seats/layout?showtime_id=xxx")
  → fetchConfig.js:
    1. Set headers (Content-Type, CSRF, Bearer nếu cần)
    2. fetch(API_BASE_URL + path, { credentials: "include", ... })
  → Spring Boot Controller receives request
  → Service layer processes business logic
  → Repository queries Database
  → Controller returns JSON: { code: 200, data: {...} }
  → apiFetch() parse JSON, throw Error nếu !res.ok
  → Service function unwrap: res.data || res
  → Component setState → UI re-render
```

## 7. Dual-backend Auth Detection

```
fetchConfig.js → shouldAttachBearer():

  ┌─────────────────────────────────────────────┐
  │ VITE_AUTH_MODE env variable                 │
  │   "bearer" → luôn gửi Bearer token (Laravel)│
  │   "cookie" → không gửi Bearer (Spring Boot) │
  │   "auto" (default) → tự detect:             │
  │     • port 8000 → Bearer (Laravel)           │
  │     • port 8080 → Cookie (Spring Boot)       │
  │     • khác      → Cookie (default)           │
  └─────────────────────────────────────────────┘

Cả 2 mode đều gửi:
  - credentials: "include" (Cookie)
  - X-XSRF-TOKEN / X-CSRF-TOKEN (nếu có)
```
