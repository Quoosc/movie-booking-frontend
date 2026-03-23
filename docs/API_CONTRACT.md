# API_CONTRACT.md — Đồng bộ API giữa Frontend & Backend

## Base URL

- **Spring Boot (dev)**: `http://localhost:8080` (không có `/api` prefix)
- **Spring Boot (prod)**: `https://20.212.11.234`
- **Laravel (dev)**: `http://localhost:8000/api`
- **Frontend config**: `VITE_API_BASE_URL` trong `.env.spring` hoặc `.env.laravel`

## Response Format (chung)

```json
{
  "code": 200,
  "message": "Success",
  "data": { ... }
}
```

> Tất cả service files đều unwrap bằng `res.data || res` để lấy data bên trong.

---

## 1. Authentication (`/auth`) ✅

| Method | Endpoint | Request Body | Response Data | Auth |
|--------|----------|-------------|---------------|------|
| POST | `/auth/register` | `RegisterRequest` | `{ success: true }` | ❌ |
| POST | `/auth/login` | `LoginRequest` | `LoginResponse` | ❌ |
| POST | `/auth/logout` | — | — | ✅ |
| POST | `/auth/logout-all?email=` | Query: email | — | ✅ |
| GET | `/auth/refresh` | — | `{ accessToken }` | ✅ (cookie/token) |

### Request/Response DTOs

```javascript
// RegisterRequest
{
  phoneNumber: string,
  email: string,
  username: string,      // fullName
  password: string,
  confirmPassword: string
}

// LoginRequest
{ email: string, password: string }

// LoginResponse
{
  data: {
    accessToken: string,
    refreshToken: string,
    user: {
      userId: string,
      email: string,
      role: "ADMIN" | "USER",
      ...
    }
  }
}
```

---

## 2. Users (`/users`) ✅

| Method | Endpoint | Body | Response | Auth | Ghi chú |
|--------|----------|------|----------|------|---------|
| GET | `/users/profile` | — | `UserProfile` | ✅ | Dùng cho me() |
| PUT | `/users/profile` | `UpdateProfileDTO` | `UserProfile` | ✅ | |
| PATCH | `/users/password` | `ChangePasswordDTO` | `string` | ✅ | |
| GET | `/users/loyalty` | — | `UserLoyalty` | ✅ | Điểm tích lũy |
| GET | `/users` | — | `User[]` | ✅ Admin | List all users |
| GET | `/users/{id}` | — | `User` | ✅ Admin | |
| DELETE | `/users/{id}` | — | — | ✅ Admin | |
| PATCH | `/users/{id}/role` | `"ADMIN"` (text/plain) | `User` | ✅ Admin | Đổi role |

### DTOs

```javascript
// UpdateProfileDTO
{ username: string, phone: string, avatarUrl?: string, ... }

// ChangePasswordDTO
{ currentPassword: string, newPassword: string, confirmPassword: string }
```

---

## 3. Movies (`/movies`) ✅

| Method | Endpoint | Body | Response | Auth |
|--------|----------|------|----------|------|
| GET | `/movies` | — | `Movie[]` | ❌ |
| GET | `/movies/{id}` | — | `Movie` | ❌ |
| POST | `/movies` | `CreateMovieDTO` | `Movie` | ✅ Admin |
| PUT | `/movies/{id}` | `UpdateMovieDTO` | `Movie` | ✅ Admin |
| DELETE | `/movies/{id}` | — | — | ✅ Admin |
| GET | `/movies/search/title?title=` | Query | `Movie[]` | ❌ |
| GET | `/movies/filter/status?status=` | Query: SHOWING/UPCOMING | `Movie[]` | ❌ |
| GET | `/movies/filter/genre?genre=` | Query | `Movie[]` | ❌ |
| GET | `/movies/{id}/showtimes?date=` | Query: YYYY-MM-DD | `ShowtimeGroup[]` | ❌ |

### DTOs

```javascript
// Movie (response)
{
  movieId: string,        // UUID
  title: string,
  description: string,
  genre: string,          // "Hài, Gia đình"
  language: string,       // "EN", "VI"
  duration: number,       // phút
  minimumAge: number,
  releaseDate: string,    // ISO date
  director: string,
  cast: string,           // hoặc actors
  trailerUrl: string,
  status: "SHOWING" | "UPCOMING",
  posterUrl: string,
  posterCloudinaryId: string,
  bannerUrl: string,
  ratingAvg: number | null
}

// ShowtimeGroup (response)
{
  cinemaId: string,
  cinemaName: string,
  address: string,
  showtimes: [
    {
      showtimeId: string,
      startTime: string,    // ISO datetime
      format: string,       // "2D", "3D"
      roomName: string,
      basePrice: number
    }
  ]
}
```

---

## 4. Showtimes (`/showtimes`) ✅

| Method | Endpoint | Body | Response | Auth |
|--------|----------|------|----------|------|
| GET | `/showtimes` | — | `Showtime[]` | ✅ Admin |
| GET | `/showtimes/{id}` | — | `Showtime` | ❌ |
| POST | `/showtimes` | `CreateShowtimeDTO` | `Showtime` | ✅ Admin |
| PUT | `/showtimes/{id}` | `UpdateShowtimeDTO` | `Showtime` | ✅ Admin |
| DELETE | `/showtimes/{id}` | — | — | ✅ Admin |
| GET | `/showtimes/movie/{movieId}` | — | `Showtime[]` | ✅ Admin |
| GET | `/showtimes/movie/{movieId}/upcoming` | — | `Showtime[]` | ✅ Admin |
| GET | `/showtimes/room/{roomId}` | — | `Showtime[]` | ✅ Admin |
| GET | `/showtimes/movie/{id}/date-range?startDate=&endDate=` | Query | `Showtime[]` | ✅ Admin |

### Showtime Ticket Types

| Method | Endpoint | Body | Response | Auth |
|--------|----------|------|----------|------|
| GET | `/showtimes/{id}/ticket-types` | — | `{ showtimeId, assignedTicketTypeIds }` | ✅ Admin |
| PUT | `/showtimes/{id}/ticket-types` | `{ ticketTypeIds: [] }` | — | ✅ Admin |
| POST | `/showtimes/{id}/ticket-types` | `{ ticketTypeIds: [] }` | — | ✅ Admin |
| POST | `/showtimes/{id}/ticket-types/{ticketTypeId}` | — | — | ✅ Admin |
| DELETE | `/showtimes/{id}/ticket-types/{ticketTypeId}` | — | — | ✅ Admin |

---

## 5. Cinemas (`/cinemas`) ✅

| Method | Endpoint | Body | Response | Auth |
|--------|----------|------|----------|------|
| GET | `/cinemas` | — | `Cinema[]` | ❌ |
| GET | `/cinemas/{id}` | — | `Cinema` | ❌ |
| POST | `/cinemas` | `CreateCinemaDTO` | `Cinema` | ✅ Admin |
| PUT | `/cinemas/{id}` | `UpdateCinemaDTO` | `Cinema` | ✅ Admin |
| DELETE | `/cinemas/{id}` | — | — | ✅ Admin |
| GET | `/cinemas/{id}/movies?status=` | Query: SHOWING/UPCOMING | `Movie[]` | ❌ |
| GET | `/cinemas/snacks?cinemaId=` | Query | `Snack[]` | ❌ |

### Rooms

| Method | Endpoint | Body | Response | Auth |
|--------|----------|------|----------|------|
| GET | `/cinemas/rooms` | — | `Room[]` | ✅ Admin |
| GET | `/cinemas/rooms/{id}` | — | `Room` | ✅ Admin |
| POST | `/cinemas/rooms` | `CreateRoomDTO` | `Room` | ✅ Admin |
| PUT | `/cinemas/rooms/{id}` | `UpdateRoomDTO` | `Room` | ✅ Admin |
| DELETE | `/cinemas/rooms/{id}` | — | — | ✅ Admin |

### Snacks (Admin)

| Method | Endpoint | Body | Response | Auth |
|--------|----------|------|----------|------|
| GET | `/cinemas/snacks` | — | `Snack[]` | ✅ Admin |
| GET | `/cinemas/snacks/{id}` | — | `Snack` | ✅ Admin |
| POST | `/cinemas/snacks` | `CreateSnackDTO` | `Snack` | ✅ Admin |
| PUT | `/cinemas/snacks/{id}` | `UpdateSnackDTO` | `Snack` | ✅ Admin |
| DELETE | `/cinemas/snacks/{id}` | — | — | ✅ Admin |

### DTOs

```javascript
// Cinema
{
  cinemaId: string,
  name: string,
  address: string,
  city: string,
  district: string,
  heroImageUrl: string,
  thumbnailUrl: string
}

// Snack
{
  snackId: string,
  cinemaId: string,
  name: string,
  description: string,
  price: number,
  type: "FOOD" | "DRINK",
  imageUrl: string,
  imageCloudinaryId: string
}
```

---

## 6. Seats (`/seats`) ✅

| Method | Endpoint | Body | Response | Auth |
|--------|----------|------|----------|------|
| GET | `/seats/layout?showtime_id=` | Query | `SeatLayout[]` | ❌ |
| GET | `/seats` | — | `Seat[]` | ✅ Admin |
| GET | `/seats/{id}` | — | `Seat` | ✅ Admin |
| POST | `/seats` | `CreateSeatDTO` | `Seat` | ✅ Admin |
| PUT | `/seats/{id}` | `UpdateSeatDTO` | `Seat` | ✅ Admin |
| DELETE | `/seats/{id}` | — | — | ✅ Admin |
| GET | `/seats/room/{roomId}` | — | `Seat[]` | ✅ Admin |
| POST | `/seats/generate` | `GenerateSeatsDTO` | `BulkSeatResponse` | ✅ Admin |
| GET | `/seats/row-labels?rows=` | Query | `RowLabelsResponse` | ✅ Admin |

### Showtime Seats

| Method | Endpoint | Body | Response | Auth |
|--------|----------|------|----------|------|
| GET | `/showtime-seats/{id}` | — | `ShowtimeSeat` | ✅ Admin |
| GET | `/showtime-seats/showtime/{showtimeId}` | — | `ShowtimeSeat[]` | ✅ Admin |
| GET | `/showtime-seats/showtime/{id}/available` | — | `ShowtimeSeat[]` | ✅ Admin |
| PUT | `/showtime-seats/{id}` | `{ status, price }` | `ShowtimeSeat` | ✅ Admin |
| PUT | `/showtime-seats/{id}/reset` | — | `ShowtimeSeat` | ✅ Admin |
| POST | `/showtime-seats/showtime/{id}/recalculate-prices` | — | — | ✅ Admin |

### DTOs

```javascript
// SeatLayout (response cho booking)
{
  showtimeSeatId: string,
  row: string,         // "A", "B", ...
  seatNumber: number,
  seatType: "NORMAL" | "VIP" | "COUPLE",
  status: "AVAILABLE" | "BOOKED" | "LOCKED",
  price: number
}
```

---

## 7. Seat Locks (`/seat-locks`) ✅

| Method | Endpoint | Body | Response | Auth |
|--------|----------|------|----------|------|
| POST | `/seat-locks` | `LockSeatsRequest` | `LockSeatsResponse` | ✅/Guest |
| DELETE | `/seat-locks/showtime/{showtimeId}` | — | — | ✅/Guest |
| GET | `/seat-locks/availability/showtime/{id}` | — | `SeatAvailability` | ✅ Admin |

> **Guest**: gửi `X-Session-Id` header thay cho JWT.

### DTOs

```javascript
// LockSeatsRequest
{
  showtimeId: string,
  seats: [
    { showtimeSeatId: string, ticketTypeId: string }
  ]
}

// LockSeatsResponse
{
  lockId: string,
  status: "LOCKED",
  showtimeId: string,
  seats: [...],
  expiresAt: string,       // ISO datetime
  remainingSeconds: number
}
```

---

## 8. Bookings (`/bookings`) ✅

| Method | Endpoint | Body | Response | Auth |
|--------|----------|------|----------|------|
| POST | `/bookings/price-preview` | `PricePreviewRequest` | `PricePreview` | ✅/Guest |
| POST | `/bookings/confirm` | `ConfirmBookingRequest` | `Booking` | ✅/Guest |
| GET | `/bookings/{id}` | — | `Booking` | ✅ |
| GET | `/bookings/my-bookings` | — | `Booking[]` | ✅ |
| PATCH | `/bookings/{id}/qr` | `{ qrCodeUrl }` | `Booking` | ✅ Admin |

### DTOs

```javascript
// PricePreviewRequest
{
  lockId: string,
  promotionCode: string | null,
  snacks: [{ snackId: string, quantity: number }]
}

// ConfirmBookingRequest
{
  lockId: string,
  promotionCode: string | null,
  snackCombos: [{ snackId: string, quantity: number }],
  guestInfo: {                    // chỉ khi guest
    email: string,
    username: string,
    phoneNumber: string
  } | null
}
```

---

## 9. Payments (`/payments`) ✅

| Method | Endpoint | Body | Response | Auth |
|--------|----------|------|----------|------|
| POST | `/payments/order` | `CreatePaymentOrder` | `InitiatePaymentResponse` | ✅/Guest |
| POST | `/payments/order/capture` | `CapturePaymentRequest` | `PaymentResponse` | ❌ (callback) |
| GET | `/payments/search?...` | Query params | `Payment[]` | ✅ Admin |
| POST | `/payments/{id}/refund` | `{ reason }` | `Payment` | ✅ Admin |
| GET | `/payments/momo/ipn` | — | `IpnResponse` | ✅ Admin |
| POST | `/payments/momo/ipn` | IPN body | `IpnResponse` | ✅ Admin |

### DTOs

```javascript
// CreatePaymentOrder
{
  bookingId: string,
  paymentMethod: "PAYPAL" | "MOMO",
  amount: number
}

// InitiatePaymentResponse
{
  paymentId: string,
  orderId: string,          // gateway order ID
  txnRef: string,           // Momo only
  paymentUrl: string        // redirect URL
}

// CapturePaymentRequest
{
  transactionId: string,    // PayPal order ID hoặc Momo requestId
  paymentMethod: "PAYPAL" | "MOMO"
}
```

---

## 10. Promotions (`/promotions`) ✅

| Method | Endpoint | Body | Response | Auth |
|--------|----------|------|----------|------|
| GET | `/promotions?filter=valid` | Query | `Promotion[]` | ❌ |
| GET | `/promotions/code/{code}` | — | `Promotion` | ❌ |
| GET | `/promotions` | — | `Promotion[]` | ✅ Admin |
| GET | `/promotions/active` | — | `Promotion[]` | ✅ Admin |
| GET | `/promotions/{id}` | — | `Promotion` | ✅ Admin |
| POST | `/promotions` | `CreatePromotionDTO` | `Promotion` | ✅ Admin |
| PUT | `/promotions/{id}` | `UpdatePromotionDTO` | `Promotion` | ✅ Admin |
| PATCH | `/promotions/{id}/deactivate` | — | `Promotion` | ✅ Admin |
| DELETE | `/promotions/{id}` | — | — | ✅ Admin |

---

## 11. Ticket Types (`/ticket-types`) ✅

| Method | Endpoint | Body | Response | Auth |
|--------|----------|------|----------|------|
| GET | `/ticket-types?showtimeId=&userId=` | Query | `TicketType[]` | ❌ |
| GET | `/ticket-types/admin` | — | `TicketType[]` | ✅ Admin |
| POST | `/ticket-types` | `CreateTicketTypeDTO` | `TicketType` | ✅ Admin |
| PUT | `/ticket-types/{id}` | `UpdateTicketTypeDTO` | `TicketType` | ✅ Admin |
| DELETE | `/ticket-types/{id}` | — | — | ✅ Admin |

### DTOs

```javascript
// TicketType
{
  ticketTypeId: string,
  code: string,      // "ADULT", "CHILD", "SENIOR"
  label: string,     // "Vé Người Lớn"
  price: number
}
```

---

## 12. Membership Tiers (`/membership-tiers`) ✅

| Method | Endpoint | Body | Response | Auth |
|--------|----------|------|----------|------|
| GET | `/membership-tiers/active` | — | `MembershipTier[]` | ❌ |
| GET | `/membership-tiers` | — | `MembershipTier[]` | ✅ Admin |
| GET | `/membership-tiers/{id}` | — | `MembershipTier` | ✅ Admin |
| GET | `/membership-tiers/name/{name}` | — | `MembershipTier` | ✅ Admin |
| POST | `/membership-tiers` | `CreateTierDTO` | `MembershipTier` | ✅ Admin |
| PUT | `/membership-tiers/{id}` | `UpdateTierDTO` | `MembershipTier` | ✅ Admin |
| PATCH | `/membership-tiers/{id}/deactivate` | — | — | ✅ Admin |
| DELETE | `/membership-tiers/{id}` | — | — | ✅ Admin |

---

## 13. Pricing (`/price-base`, `/price-modifiers`) ✅

### Price Base

| Method | Endpoint | Body | Response | Auth |
|--------|----------|------|----------|------|
| GET | `/price-base` | — | `PriceBase[]` | ✅ Admin |
| GET | `/price-base/active` | — | `PriceBase` | ✅ Admin |
| GET | `/price-base/{id}` | — | `PriceBase` | ✅ Admin |
| POST | `/price-base` | — | `PriceBase` | ✅ Admin |
| PUT | `/price-base/{id}` | — | `PriceBase` | ✅ Admin |
| DELETE | `/price-base/{id}` | — | — | ✅ Admin |

### Price Modifiers

| Method | Endpoint | Body | Response | Auth |
|--------|----------|------|----------|------|
| GET | `/price-modifiers` | — | `PriceModifier[]` | ✅ Admin |
| GET | `/price-modifiers/active` | — | `PriceModifier[]` | ✅ Admin |
| GET | `/price-modifiers/{id}` | — | `PriceModifier` | ✅ Admin |
| GET | `/price-modifiers/by-condition?conditionType=` | Query | `PriceModifier[]` | ✅ Admin |
| POST | `/price-modifiers` | — | `PriceModifier` | ✅ Admin |
| PUT | `/price-modifiers/{id}` | — | `PriceModifier` | ✅ Admin |
| DELETE | `/price-modifiers/{id}` | — | — | ✅ Admin |

---

## 14. Cloudinary (3rd Party — không qua Backend)

| Action | URL | Method | Ghi chú |
|--------|-----|--------|---------|
| Upload poster | `https://api.cloudinary.com/v1_1/{cloud}/image/upload` | POST | FormData: file, upload_preset, folder="movie-posters" |
| Upload snack | Same | POST | folder="snacks" |
| Upload avatar | Same | POST | folder="avatars" |

---

## Legend

| Icon | Nghĩa |
|------|-------|
| ✅ | Backend Controller đã implement |
| ✅ Auth | Yêu cầu JWT token hoặc session cookie |
| ✅ Admin | Yêu cầu role = ADMIN |
| ✅/Guest | Guest dùng `X-Session-Id` header thay JWT |
| ❌ Auth | Public endpoint |
