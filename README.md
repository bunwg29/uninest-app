# UniNest Mobile App

Expo (React Native, TypeScript) · React Navigation · TanStack Query · Zustand · Socket.IO client.

## Chạy ứng dụng

1. Sao chép `.env.example` thành `.env`.
2. Đặt `EXPO_PUBLIC_API_URL` theo thiết bị: Android emulator dùng `http://10.0.2.2:<PORT>/api/v1`; thiết bị thật dùng IP LAN của máy chạy backend.
3. `npm install` rồi `npm start`.

Một số thư viện có mã native (`expo-video`, `react-native-maps`); khi dùng development build cần build lại sau khi cài thêm.

## Cấu trúc thư mục

```
src/
  core/         cấu hình, HTTP client (làm mới token tự động), lưu token, React Query client, tiện ích dùng chung
  hooks/        hook dùng chung (toast, debounce, bàn phím, bố cục responsive)
  navigation/   Root/Auth/Main/ListingPost navigator và kiểu tham số route
  theme/        token màu, khoảng cách, bo góc, chữ (không hard-code trong màn hình)
  ui/           component dùng chung: atoms, molecules (Input, Modal, DatePickerField…), layout, feedback
  features/<tên>/
    screens/    màn hình
    components/ component riêng của tính năng
    hooks/      React Query hooks
    services/   gọi API
    store/      Zustand (chỉ trạng thái phía client)
    types/      kiểu dữ liệu và hằng số
```

Các tính năng: `auth`, `listings`, `search`, `comparison`, `booking`, `chat`, `forum`, `recommendations`.

## Ghi chú hành vi

- Trạng thái đặt lịch và tình trạng phòng cập nhật realtime qua Socket.IO; React Query polling 15–30 giây chỉ là dự phòng khi mất kết nối.
- Nháp tin đăng, danh sách so sánh, hàng đợi tin nhắn được lưu trên máy và bị xoá khi đăng xuất; lịch sử "Đã xem gần đây" lưu theo từng tài khoản.

## Kiểm tra chất lượng

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test
npm run test:search
npm run test:e2e
```

`test:e2e` (Playwright) chạy luồng đăng nhập → chọn phòng → đặt lịch → giữ chỗ → huỷ trên Expo Web với backend và PostgreSQL thật. Đặt `E2E_LOGIN_PHONE` và `E2E_LOGIN_PASSWORD` trước khi chạy.
