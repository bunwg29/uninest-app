# UniNest Mobile App

## Chạy ứng dụng

1. Sao chép `.env.example` thành `.env`.
2. Đặt `EXPO_PUBLIC_API_URL` theo thiết bị: Android emulator dùng `http://10.0.2.2:3000/api/v1`; thiết bị thật dùng IP LAN của máy chạy backend.
3. Chạy `npm install` rồi `npm start`.

## Tìm trọ

Tab **Tìm trọ** gọi `GET /api/v1/rooms` và hiển thị toàn bộ phòng từ dữ liệu seed, gồm ảnh đại diện, tên, địa chỉ, giá và diện tích. Giao diện có trạng thái loading, lỗi/thử lại, rỗng và pull-to-refresh. Nút **Đặt lịch xem phòng** truyền `resourceId` sang luồng booking; màn đặt lịch tự tải lại chi tiết bằng `GET /api/v1/rooms/:id`.

Trước khi kiểm thử thủ công, chạy `npm run seed -- rooms` trong repository backend. Tài khoản mẫu `0900000001` có mật khẩu mặc định khai báo trong seeder của backend (`rooms.seeder.ts`); đặt mật khẩu đó vào biến môi trường `E2E_LOGIN_PASSWORD` (và `E2E_LOGIN_PHONE` nếu đổi tài khoản) trước khi chạy `npm run test:e2e`.

## Luồng Booking

Luồng bắt đầu từ nút **Đặt lịch xem phòng** trong màn chi tiết phòng:

1. Chọn ngày và slot tải từ API.
2. Xác nhận số điện thoại, ghi chú và gửi yêu cầu.
3. Xem kết quả, danh sách lịch hẹn và countdown.
4. Xem timeline, thêm lịch Google Calendar, hủy hoặc giữ chỗ.

TanStack Query quản lý API/cache/polling 30 giây. Zustand giữ ngày và slot khi chuyển qua lại giữa các màn hình. Trạng thái loading, lỗi, rỗng và lỗi trùng slot HTTP 409 đều có giao diện tương ứng.

## Kiểm tra chất lượng

```bash
npm run test
npm run test:cov
npm run test:e2e
npm run typecheck
npm run lint
npm run format:check
npm run build
```

Playwright cháº¡y toÃ n bá»™ luá»“ng Ä‘Äƒng nháº­p â†’ chá»n phÃ²ng â†’ Ä‘áº·t lá»‹ch â†’ xem chi tiáº¿t â†’ giá»¯ chá»— â†’ há»§y trÃªn Expo Web vÃ  backend/PostgreSQL tháº­t. Cáº¥u hÃ¬nh sáº½ tá»± khá»Ÿi Ä‘á»™ng hai server náº¿u chÆ°a cháº¡y.
