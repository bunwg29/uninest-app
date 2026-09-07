# AI Implementation Workflow

Mọi AI coding assistant và thành viên dự án phải tuân thủ nghiêm ngặt quy trình 7 bước sau khi tiếp nhận yêu cầu code:

```
[1. Check Mandates & Boundaries] -> [2. Inspect Existing Code & Packages] -> [3. Implement Feature]
  -> [4. Verify & Test] -> [5. Run Format, Lint & Typecheck] -> [6. Update Docs] -> [7. Confirm to User]
```

## Bước 1: Kiểm tra Ràng buộc, Ranh giới & Ràng buộc Bắt buộc
- Đọc [**`agent/rules.md`**](./rules.md):
  - **SỬ DỤNG PACKAGE SẴN CÓ**: Chỉ code trong các package `@features/*` và base packages sẵn có. Trừ khi là tính năng mới hoàn toàn chưa có package tương ứng thì mới tạo package mới.
  - **BẮT BUỘC ĐA NGÔN NGỮ**: Không viết chuỗi cứng vào code; chuẩn bị sẵn key cho cả `vi` và `en`.
  - **HẰNG SỐ IN HOA**: Mọi hằng số mới phải viết kiểu `UPPER_SNAKE_CASE`.
  - **KHÔNG COMMENT BỪA BÃI**: Để code tự tường minh, không comment giải thích các dòng code hiển nhiên.
  - **KHOẢNG CÁCH DÒNG LOGIC**: Luôn có dòng trống phân cách giữa các block biến, hàm, if/else, return.
- Đọc [**`agent/business-logic.md`**](./business-logic.md): Kiểm tra xem tính năng có thuộc danh sách **Out of scope** (không build) hay không.

## Bước 2: Rà soát & Tái sử dụng Mã nguồn Hiện có
- Tra cứu `@theme` để lấy hằng số màu (`THEME_COLORS`), khoảng cách (`SPACING_TOKENS`), cỡ chữ (`TYPOGRAPHY_TOKENS`).
- Tra cứu `@core` để dùng `apiClient` (Axios), `HTTP_STATUS_CODES`.
- Tra cứu `@ui` để dùng `ErrorBoundary` và các UI components/hooks có sẵn, tránh viết lặp code.

## Bước 3: Triển khai Tính năng theo Kiến trúc Modular
- Đặt code vào đúng thư mục: `src/features/<feature-name>/`:
  - `components/`: UI riêng của tính năng.
  - `hooks/`: TanStack Query hooks hoặc custom hooks của tính năng.
  - `screens/`: Màn hình giao diện.
  - `services/`: API calls gọi thông qua `apiClient` từ `@core`.
  - `store/`: Zustand store (nếu có client state cục bộ).
  - `types/`: Type definitions của tính năng.
  - `index.ts`: Re-export các thành phần public của tính năng.
- Luôn sử dụng alias import (`@features/...`, `@core`, `@theme`, `@i18n`, `@ui`, `@hooks`, `@navigation`).

## Bước 4: Kiểm thử Tính năng
- Kiểm tra render luồng nghiệp vụ chính, các trạng thái loading, empty, error handling.

## Bước 5: Tự động Định dạng & Kiểm tra Type, Lint
Bắt buộc chạy đầy đủ các lệnh sau để tự động format khoảng cách dòng, dọn import thừa và xác minh 0 lỗi:
```bash
npm run lint:fix
npm run format
npm run typecheck
npm run lint
npm run format:check
```
Đảm bảo **0 lỗi TypeScript, 0 lỗi ESLint**.

## Bước 6: Cập nhật Tài liệu Nghiệp vụ (nếu có thay đổi)
- Nếu tính năng bổ sung trạng thái, thực thể hoặc logic mới, cập nhật vào `agent/business-logic.md`.

## Bước 7: Báo cáo cho Người dùng
- Tóm tắt ngắn gọn các việc đã làm, danh sách file thay đổi (có markdown link trực tiếp), và kết quả kiểm tra type/lint.
