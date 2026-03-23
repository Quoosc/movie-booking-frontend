# ADMIN_GUIDE.md — Hướng dẫn Admin Panel

## 1. Tổng quan

Admin Panel nằm tại route `/admin/*`, được bảo vệ bởi **AdminRoute** (yêu cầu login + role `ADMIN`).
Layout gồm: **AdminSidebar** (trái) + **AdminTopbar** (trên) + **Content** (giữa).

### Cấu trúc Admin Layout

```
AdminRoute (guard)
  └── AdminLayout
      ├── AdminSidebar (navigation menu)
      ├── AdminTopbar (user info, logout)
      └── <Outlet /> (page content)
```

### Quyền truy cập

| Role | Truy cập Admin | Ghi chú |
|------|---------------|---------|
| ADMIN | ✅ | Toàn quyền |
| USER (Member) | ❌ | Redirect về `/` |
| GUEST (chưa login) | ❌ | Redirect về `/auth/login` |

---

## 2. Danh sách Admin Pages

### 2.1 Dashboard (`/admin`)

- **File**: `src/app/(admin)/dashboard/page.jsx`
- **Mô tả**: Tổng quan thống kê hệ thống
- **Data hiển thị**: Tổng phim, tổng booking, doanh thu, biểu đồ (recharts)

### 2.2 Quản lý Users (`/admin/users`)

- **File**: `src/app/(admin)/users/page.jsx`
- **Service**: `adminUserService.js`
- **API calls**:
  - `getUsers()` → `GET /users` → Danh sách tất cả user
  - `getUserById(id)` → `GET /users/{id}` → Chi tiết user
  - `deleteUser(id)` → `DELETE /users/{id}` → Xóa user
  - `updateUserRole(id, role)` → `PATCH /users/{id}/role` → Đổi role (body: `"ADMIN"` | `"USER"`, Content-Type: `text/plain`)

### 2.3 Quản lý Membership (`/admin/membership`)

- **File**: `src/app/(admin)/membership/page.jsx`
- **Service**: `adminUserService.js`
- **API calls**:
  - `getMembershipTiers()` → `GET /membership-tiers`
  - `createMembershipTier(payload)` → `POST /membership-tiers`
  - `updateMembershipTier(id, payload)` → `PUT /membership-tiers/{id}`
  - `deactivateMembershipTier(id)` → `PATCH /membership-tiers/{id}/deactivate`
  - `deleteMembershipTier(id)` → `DELETE /membership-tiers/{id}`

### 2.4 Quản lý Movies (`/admin/movies`)

- **File**: `src/app/(admin)/movies/page.jsx`
- **Service**: `adminMovieService.js`
- **API calls**:
  - `getMovies(filters)` → `GET /movies?title=&genre=&status=`
  - `createMovie(payload)` → `POST /movies`
  - `updateMovie(id, payload)` → `PUT /movies/{id}`
  - `deleteMovie(id)` → `DELETE /movies/{id}`
- **Upload poster**: `cloudinaryService.uploadPoster(file)` → Cloudinary API
- **Payload ví dụ**:
  ```javascript
  {
    title: "Tên phim",
    genre: "Hài, Phiêu lưu",
    language: "VI",
    duration: 120,
    minimumAge: 13,
    director: "Nguyễn Văn A",
    cast: "Diễn viên A, Diễn viên B",
    description: "Mô tả phim...",
    trailerUrl: "https://youtube.com/...",
    posterUrl: "https://res.cloudinary.com/...",
    posterCloudinaryId: "movie-posters/xxx",
    status: "SHOWING",
    releaseDate: "2026-03-24"
  }
  ```

### 2.5 Quản lý Cinemas (`/admin/cinemas`)

- **File**: `src/app/(admin)/cinemas/page.jsx`
- **Service**: `adminCinemaService.js`
- **API calls**:
  - `getCinemas()` → `GET /cinemas`
  - `createCinema(payload)` → `POST /cinemas`
  - `updateCinema(id, payload)` → `PUT /cinemas/{id}`
  - `deleteCinema(id)` → `DELETE /cinemas/{id}`

### 2.6 Quản lý Rooms (`/admin/rooms`)

- **File**: `src/app/(admin)/rooms/page.jsx`
- **Service**: `adminCinemaService.js`
- **API calls**:
  - `getRooms()` → `GET /cinemas/rooms`
  - `createRoom(payload)` → `POST /cinemas/rooms`
  - `updateRoom(id, payload)` → `PUT /cinemas/rooms/{id}`
  - `deleteRoom(id)` → `DELETE /cinemas/rooms/{id}`

### 2.7 Quản lý Showtimes (`/admin/showtimes`)

- **File**: `src/app/(admin)/showtimes/page.jsx`
- **Service**: `adminMovieService.js`
- **API calls**:
  - `getAllShowtimes()` → `GET /showtimes`
  - `createShowtime(payload)` → `POST /showtimes`
  - `updateShowtime(id, payload)` → `PUT /showtimes/{id}`
  - `deleteShowtime(id)` → `DELETE /showtimes/{id}`
  - `getShowtimesByMovie(movieId)` → `GET /showtimes/movie/{movieId}`
  - `getShowtimesByRoom(roomId)` → `GET /showtimes/room/{roomId}`
- **Gán ticket types cho showtime**:
  - `getShowtimeTicketTypes(showtimeId)` → `GET /showtimes/{id}/ticket-types`
  - `replaceShowtimeTicketTypes(showtimeId, ids)` → `PUT /showtimes/{id}/ticket-types`

### 2.8 Quản lý Seats (`/admin/seats`)

- **File**: `src/app/(admin)/seats/page.jsx`
- **Service**: `adminCinemaService.js`
- **API calls**:
  - `getAllSeats()` → `GET /seats`
  - `getSeatsByRoom(roomId)` → `GET /seats/room/{roomId}`
  - `createSeat(payload)` → `POST /seats`
  - `generateSeats(payload)` → `POST /seats/generate` (tạo hàng loạt)
  - `updateSeat(id, payload)` → `PUT /seats/{id}`
  - `deleteSeat(id)` → `DELETE /seats/{id}`
  - `getSeatRowLabels(rows)` → `GET /seats/row-labels?rows=`

### 2.9 Quản lý Snacks (`/admin/snacks`)

- **File**: `src/app/(admin)/snacks/page.jsx`
- **Service**: `adminCinemaService.js`
- **API calls**:
  - `getSnacks()` → `GET /cinemas/snacks`
  - `createSnack(payload)` → `POST /cinemas/snacks`
  - `updateSnack(id, payload)` → `PUT /cinemas/snacks/{id}`
  - `deleteSnack(id)` → `DELETE /cinemas/snacks/{id}`
- **Upload ảnh snack**: `cloudinaryService.uploadSnackImage(file)` → Cloudinary API

### 2.10 Quản lý Pricing (`/admin/pricing`)

- **File**: `src/app/(admin)/pricing/page.jsx`
- **Service**: `adminPricingService.js`
- **3 phần**:

**Price Base** (giá gốc):
  - `getPriceBases()`, `getActivePriceBase()`
  - `createPriceBase()`, `updatePriceBase()`, `deletePriceBase()`

**Price Modifiers** (phụ thu / giảm giá theo điều kiện):
  - `getPriceModifiers()`, `getActivePriceModifiers()`
  - `getPriceModifiersByCondition(conditionType)`
  - `createPriceModifier()`, `updatePriceModifier()`, `deletePriceModifier()`

**Ticket Types** (loại vé):
  - `getAdminTicketTypes()` → `GET /ticket-types/admin`
  - `createTicketType()`, `updateTicketType()`, `deleteTicketType()`

### 2.11 Quản lý Promotions (`/admin/promotions`)

- **File**: `src/app/(admin)/promotions/page.jsx`
- **Service**: `adminToolsService.js`
- **API calls**:
  - `getPromotions(filter)` → `GET /promotions?filter=`
  - `createPromotion(payload)` → `POST /promotions`
  - `updatePromotion(id, payload)` → `PUT /promotions/{id}`
  - `deactivatePromotion(id)` → `PATCH /promotions/{id}/deactivate`
  - `deletePromotion(id)` → `DELETE /promotions/{id}`

### 2.12 Quản lý Bookings (`/admin/bookings`)

- **File**: `src/app/(admin)/bookings/page.jsx`
- **Service**: `adminOrderService.js`
- **API calls**:
  - `getBookingById(id)` → `GET /bookings/{id}`
  - `updateBookingQr(id, qrCodeUrl)` → `PATCH /bookings/{id}/qr`

### 2.13 Quản lý Orders / Payments (`/admin/orders`)

- **File**: `src/app/(admin)/orders/page.jsx`
- **Service**: `adminOrderService.js`
- **API calls**:
  - `searchPayments(filters)` → `GET /payments/search?bookingId=&userId=&status=&method=&startDate=&endDate=`
  - `requestRefund(paymentId, reason)` → `POST /payments/{id}/refund`
  - `capturePayment(payload)` → `POST /payments/order/capture`

### 2.14 Admin Tools (`/admin/tools`)

- **File**: `src/app/(admin)/tools/page.jsx`
- **Service**: `adminToolsService.js`
- **Chức năng debug/dev**:
  - `createSeatLock(payload)` → `POST /seat-locks`
  - `getSeatLockAvailability(showtimeId)` → `GET /seat-locks/availability/showtime/{id}`
  - `releaseSeatLocks(showtimeId)` → `DELETE /seat-locks/showtime/{id}`
  - `previewBookingPrice(payload)` → `POST /bookings/price-preview`
  - **Showtime Seats management**:
    - `getShowtimeSeats(showtimeId)` → `GET /showtime-seats/showtime/{id}`
    - `updateShowtimeSeat(id, payload)` → `PUT /showtime-seats/{id}`
    - `resetShowtimeSeat(id)` → `PUT /showtime-seats/{id}/reset`
    - `recalculateShowtimeSeatPrices(showtimeId)` → `POST /showtime-seats/showtime/{id}/recalculate-prices`
  - **Momo IPN test**:
    - `getMomoIpnTest()` → `GET /payments/momo/ipn`
    - `postMomoIpnTest(body)` → `POST /payments/momo/ipn`

---

## 3. Admin Service Files — Quick Reference

| Service File | Quản lý | Endpoints chính |
|-------------|---------|-----------------|
| `adminMovieService.js` | Movies, Showtimes | `/movies`, `/showtimes` |
| `adminCinemaService.js` | Cinemas, Rooms, Snacks, Seats | `/cinemas`, `/cinemas/rooms`, `/cinemas/snacks`, `/seats` |
| `adminUserService.js` | Users, Membership Tiers | `/users`, `/membership-tiers` |
| `adminOrderService.js` | Bookings, Payments, Refunds | `/bookings`, `/payments` |
| `adminPricingService.js` | Price Base/Modifiers, Ticket Types, Showtime Seats | `/price-base`, `/price-modifiers`, `/ticket-types`, `/showtime-seats` |
| `adminToolsService.js` | Seat Locks, Promotions, Debug tools | `/seat-locks`, `/promotions`, `/bookings/price-preview` |

---

## 4. Pattern chung trong Admin Services

```javascript
// Import
import { apiFetch } from "../fetchConfig";

// Query builder
const buildQuery = (params = {}) => {
  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null && value !== ""
  );
  if (!entries.length) return "";
  return `?${new URLSearchParams(entries).toString()}`;
};

// CRUD pattern
export async function getItems()              { return (await apiFetch("/items")).data || res; }
export async function getItemById(id)         { return (await apiFetch(`/items/${id}`)).data || res; }
export async function createItem(payload)     { return (await apiFetch("/items", { method: "POST", body: JSON.stringify(payload) })).data || res; }
export async function updateItem(id, payload) { return (await apiFetch(`/items/${id}`, { method: "PUT", body: JSON.stringify(payload) })).data || res; }
export async function deleteItem(id)          { await apiFetch(`/items/${id}`, { method: "DELETE" }); return true; }
```
