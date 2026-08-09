# CinesVerse Frontend

Frontend SPA cho hệ thống đặt vé xem phim CinesVerse, xây dựng bằng React 18, Vite 5 và Tailwind CSS 3. Backend chính hiện tại là Laravel 12.

## Tính năng hiện có

- Danh sách, tìm kiếm và chi tiết phim; trailer và phim liên quan.
- Lịch chiếu toàn hệ thống theo ngày, thành phố, rạp, format, khung giờ và số ghế trống.
- Trang rạp, lịch theo ngày và giá suất chiếu.
- Chọn loại vé/ghế, seat lock có countdown, snack, promotion và price preview.
- Booking cho cả member và guest; vé điện tử và QR.
- PayPal capture và MoMo callback an toàn qua signed IPN.
- Review, reaction, reply, report, spoiler, media và moderation.
- Profile, mật khẩu, membership/loyalty, lịch sử booking và notifications.
- Admin panel cho user, phim, rạp, phòng, ghế, suất chiếu, giá, snack, promotion, hero slide, booking/payment và review.

## Yêu cầu

- Node.js 18 trở lên.
- npm 9 trở lên.
- Laravel backend chạy tại `http://localhost:8000` khi phát triển local.

Môi trường đã kiểm chứng gần nhất: Node.js `22.19.0`, npm `10.9.3`.

## Cài đặt

```powershell
npm install
```

## Cấu hình môi trường

Repository có `.env.laravel` dành cho backend hiện tại:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

Khởi động đúng mode bằng `npm run dev:laravel`. Nếu dùng `.env.local`, tối thiểu cấu hình:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_USE_MOCK=false
VITE_AUTH_MODE=bearer
```

Các biến Cloudinary/contact có thể tham khảo từ `.env.laravel`. Không commit secret hoặc credential production.

`.env.spring` và script `dev:spring` vẫn còn để tương thích cấu hình cũ. `fetchConfig.js` cũng còn fallback port `8080` khi không có `VITE_API_BASE_URL`; không nên dựa vào fallback khi phát triển với Laravel.

## Chạy local

Khởi động Laravel backend trước:

```powershell
php artisan serve --port=8000
```

Tại repository frontend:

```powershell
npm run dev:laravel
```

Truy cập `http://localhost:5173`.

## Scripts được duy trì

| Lệnh | Mục đích |
|---|---|
| `npm run dev` | Chạy Vite bằng mode mặc định |
| `npm run dev:laravel` | Chạy với `.env.laravel` |
| `npm run dev:spring` | Chế độ tương thích backend cũ |
| `npm run build` | Build production |
| `npm run preview` | Preview thư mục build |
| `npm run test` | Vitest watch mode |
| `npm run test:run` | Chạy unit/component tests một lần |
| `npm run test:coverage` | Coverage |

Các file/script E2E thử nghiệm vẫn có thể tồn tại trong repository nhưng không thuộc phạm vi kiểm chứng và bảo trì hiện tại.

## Cấu trúc nhanh

```text
src/
├── api/          # Domain services và fetchConfig
├── app/          # auth/public/protected/admin pages
├── components/   # UI theo domain và shared components
├── context/      # AuthContext
├── layouts/      # Main/Auth/Admin layouts
├── routes/       # AppRouter và guards
└── utils/        # Constants/helpers
```

Routing hiện lazy-load các page. Route account được bảo vệ bởi `PrivateRoute`; `/admin/*` được bảo vệ bởi `AdminRoute` và vẫn cần backend kiểm tra role.

## Authentication và guest booking

- Member/admin dùng Bearer access token; refresh được thực hiện qua `/auth/refresh`.
- Guest checkout dùng `X-Session-Id` để sở hữu seat lock.
- Guest booking nhận capability token riêng và gửi qua `X-Booking-Access-Token` khi mở lại vé hoặc tạo payment.
- Notification hiện cập nhật bằng request/poll, chưa dùng WebSocket/SSE.

## Kiểm tra trước khi bàn giao

```powershell
npm run test:run
npm run build
```

Snapshot kiểm chứng ngày 2026-08-09: `47` test files, `450` tests pass và production build thành công.

## Tài liệu

- [Cấu trúc dự án](./docs/PROJECT_STRUCTURE.md)
- [Component và pages](./docs/COMPONENT_GUIDE.md)
- [API contract](./docs/API_CONTRACT.md)
- [Data flow](./docs/FLOW.md)
- [Admin guide](./docs/ADMIN_GUIDE.md)
- [Improvement backlog](./docs/IMPROVEMENT_BACKLOG.md)

Lưu ý: `docs/` hiện đang được ignore trong `.gitignore`; tài liệu vẫn tồn tại local nhưng cần thay đổi rule hoặc force-add nếu muốn đưa vào version control.

## Xử lý sự cố nhanh

| Triệu chứng | Kiểm tra |
|---|---|
| Network/CORS | `VITE_API_BASE_URL`, backend port và `CORS_ALLOWED_ORIGINS` |
| 401 sau khi login | access token, refresh cookie/token và `/users/profile` |
| `provided key is too short` | cập nhật backend mới và cấu hình `APP_KEY`/`JWT_SECRET` hợp lệ |
| Guest không mở được vé | capability token theo đúng `bookingId` |
| MoMo còn pending | kiểm tra IPN URL/chữ ký; không capture từ browser redirect |

Liên hệ dự án: `23521309@gm.uit.edu.vn`.
