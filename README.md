# Movie Booking Frontend

## Yêu cầu
- Node.js >= 18
- npm >= 9 (hoặc dùng yarn/pnpm nếu thích)

## Cài đặt
```bash
npm install
# hoặc
npm i
```

## Thiết lập biến môi trường (.env)
Dự án sử dụng file `.env.local` để cấu hình biến môi trường cho frontend.
Không commit file này lên Git.

Bạn hãy tạo file `.env.local` ở thư mục gốc dự án theo mẫu dưới đây:

```bash
# .env.local
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=MovieBooking
VITE_APP_VERSION=0.0.1
```

Hướng dẫn:
- Copy file mẫu `.env.example` (nếu có) hoặc tạo mới `.env.local` theo format trên.
- Sửa giá trị các biến cho phù hợp với môi trường của bạn.

Lưu ý:
- Không commit file `.env.local` lên GitHub (đã được thêm vào `.gitignore`).
- Nếu deploy production, hãy cấu hình biến môi trường phù hợp với server.
- Repo có sẵn các file mode: `.env.spring`, `.env.laravel`, `.env.e2e` (dùng với các lệnh dev tương ứng).

## Chạy dự án (phát triển)
```bash
npm run dev
# hoặc
yarn dev
# hoặc
pnpm dev
```

Chạy theo mode API (tuỳ chọn):
```bash
npm run dev:spring
npm run dev:laravel
```

Sau đó truy cập http://localhost:5173 trên trình duyệt.

## Build production
```bash
npm run build
# hoặc
yarn build
# hoặc
pnpm build
```

## Preview production build
```bash
npm run preview
```

## Tests
```bash
npm run test
npm run test:run
npm run test:coverage
```

## E2E tests (Playwright)
```bash
npm run test:e2e:setup
npm run test:e2e
npm run test:e2e:ui
npm run test:e2e:headed
npm run test:e2e:debug
```

## Cấu trúc dự án
- `src/` - Mã nguồn chính
- `src/app/` - Các trang (admin/public)
- `src/components/` - Component dùng chung
- `src/api/` - API clients/services
- `src/routes/` - Routing config
- `src/context/` - Context providers
- `src/layouts/` - Layouts
- `src/utils/` - Helpers/utility

## Lưu ý
- Đảm bảo backend đã chạy
- Nếu gặp lỗi cổng hoặc lỗi mạng, kiểm tra lại file `.env.local` hoặc cấu hình proxy (nếu có).

## Liên hệ
Nếu gặp vấn đề, hãy tạo issue hoặc liên hệ 23521309@gm.uit.edu.vn.
