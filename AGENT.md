# UniNest Mobile App - AI Developer Assistant Guide

> **DÀNH CHO AI & THÀNH VIÊN DỰ ÁN**: Khi được tag `@AGENT.md` trong câu hỏi hoặc yêu cầu, AI **BẮT BUỘC** đọc và tuân thủ tuyệt đối các quy chuẩn dưới đây trước khi phân tích, trả lời hoặc viết code.

---

## 1. 7 NGUYÊN TẮC VÀNG BẮT BUỘC (CRITICAL MANDATES)

1. **100% TIẾNG VIỆT THUẦN (PURE VIETNAMESE - NO i18n)**:
   - Hệ thống đa ngôn ngữ đã gỡ bỏ hoàn toàn (`i18next`, `react-i18next`, `@i18n`).
   - Cấm tuyệt đối import hoặc sử dụng `useTranslation()`.
   - 100% text giao diện, tiêu đề, nút bấm, placeholder, helper text, error message, toast và Zod validation schema **PHẢI VIẾT TRỰC TIẾP BẰNG TIẾNG VIỆT**.
2. **KIỂM TRA NHÁNH GIT TRƯỚC KHI CODE (BRANCH RESPONSIBILITY)**:
   - Dự án chia nhánh theo tính năng:
     - `feat/sp1-mobile-shell`: Khung ứng dụng, navigation, router, cấu hình chung.
     - `feat/sp1-ui-components`: UI components dùng chung (`@ui`).
     - `feat/sp1-mobile-auth-screens`: Màn hình và logic xác thực (`@features/auth`).
   - Xác định file cần sửa thuộc nhánh nào -> Checkout đúng nhánh đó -> Code & Test -> Commit chuẩn Conventional Commits kèm Task ID -> Push lên `origin`.
   - Không thay đổi chéo file thuộc trách nhiệm của nhánh khác trên nhánh hiện tại.
3. **ƯU TIÊN TUYỆT ĐỐI PACKAGE CÓ SẴN (SCREAMING ARCHITECTURE)**:
   - Chỉ code trong các package đã định nghĩa:
     - `@core`: `apiClient` (Axios), token storage (`expo-secure-store`), types, constants.
     - `@theme`: `THEME_COLORS`, `SPACING_TOKENS`, `TYPOGRAPHY_TOKENS`, `BORDER_RADIUS_TOKENS`.
     - `@ui`: Các component UI có sẵn (`Button`, `Input`, `Typography`, `ScreenContainer`, `Modal`, `EmptyState`, `LoadingOverlay`, `ErrorBoundary`,...).
     - `@hooks`: Custom hooks dùng chung (`useToast`,...).
     - `@navigation`: Navigator stacks, tabs và ParamLists.
     - `@features`: `auth`, `listings`, `search`, `comparison`, `booking`, `chat`, `forum`, `reviews`, `notifications`, `payment`, `ai-chat`, `recommendations`.
   - Trừ khi là tính năng hoàn toàn mới chưa có trong danh sách trên, cấm tự ý tạo package mới.
4. **HẰNG SỐ IN HOA TOÀN BỘ (UPPER_SNAKE_CASE)**:
   - Ví dụ: `THEME_COLORS`, `SPACING_TOKENS`, `HTTP_STATUS_CODES`, `APP_CONFIG`.
5. **KHOẢNG CÁCH DÒNG GIỮA CÁC BLOCK (PADDED BLOCKS)**:
   - Luôn có 1 dòng trống phân cách giữa các nhóm biến/hooks, câu lệnh điều kiện (`if`, `switch`, `try-catch`), và trước `return` hoặc khối render JSX.
6. **CẤM COMMENT BỪA BÃI (NO TRIVIAL COMMENTS)**:
   - Không viết comment giải thích các dòng code hiển nhiên (`// import component`, `// call api`, `// render ui`).
   - Code phải tự tường minh (Self-documenting code).
7. **KIẾN TRÚC TÁCH BIỆT (SEPARATION OF CONCERNS)**:
   - UI Presentational: Chỉ phụ trách render và event handler, không chứa logic nặng.
   - Server State: 100% qua TanStack Query (`useQuery`, `useMutation`).
   - Client State: Zustand (`zustand`).
   - Form State: `react-hook-form` + `zod` validation schema tĩnh bằng tiếng Việt.

---

## 2. THAM CHIẾU TÀI LIỆU CHI TIẾT (DEEP-DIVE DOCS)

Khi cần thông tin chi tiết về từng mảng, AI hãy tự động đọc các file tương ứng:

- 📖 **Quy tắc & Chuẩn code chi tiết**: [`agent/rules.md`](./agent/rules.md)
- 🏢 **Nghiệp vụ chi tiết các Module & Luồng màn hình**: [`agent/business-logic.md`](./agent/business-logic.md)
- 🔄 **Quy trình làm việc 7 bước**: [`agent/ai-workflow.md`](./agent/ai-workflow.md)

---

## 3. LỆNH KIỂM TRA CHẤT LƯỢNG BẮT BUỘC (VERIFICATION)

Sau khi hoàn tất code, bắt buộc chạy các lệnh sau để đảm bảo **0 lỗi**:

```bash
npm run lint:fix    # Tự động dọn import thừa & format khoảng cách
npm run format      # Format Prettier
npm run typecheck   # Kiểm tra TypeScript
npm run lint        # Kiểm tra ESLint
```
