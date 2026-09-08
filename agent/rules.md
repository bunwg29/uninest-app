# UniNest Frontend Rules & Enterprise Coding Standards

## 1. QUY TẮC BẮT BUỘC (CRITICAL MANDATES FOR ALL DEVELOPERS & AI)

### [MANDATE-1] NGUYÊN TẮC QUẢN LÝ & SỬ DỤNG PACKAGE
- **Dự án làm theo team với kiến trúc module hóa (Screaming Architecture)**.
- **Ưu tiên tuyệt đối các package đã define sẵn**: Mọi AI và thành viên trong nhóm phải kiểm tra và chỉ được triển khai code bên trong các package đã định nghĩa sẵn:
  - **Base Packages**: `@core`, `@theme`, `@ui`, `@i18n`, `@hooks`, `@navigation`.
  - **Base Packages**: `@core`, `@theme`, `@ui`, `@hooks`, `@navigation`.
  - **Predefined Feature Packages**:
    `@features/auth`, `@features/listings`, `@features/search`, `@features/comparison`,
    `@features/booking`, `@features/chat`, `@features/forum`, `@features/reviews`,
    `@features/notifications`, `@features/payment`, `@features/ai-chat`, `@features/recommendations`.
- **RÀNG BUỘC TẠO PACKAGE MỚI**: **TRỪ KHI** là tính năng mới hoàn toàn và **CHƯA CÓ** package define sẵn phù hợp trong danh sách trên, thì mới được phép tạo package mới. Khi tạo mới:
  - Phải đặt tên chuẩn `kebab-case`.
  - Tuân thủ đầy đủ cấu trúc thư mục con (`components/`, `hooks/`, `screens/`, `services/`, `types/`).
  - Phải có file `index.ts` barrel export và khai báo alias path trong `tsconfig.json`.

### [MANDATE-2] 100% ĐA NGÔN NGỮ (MANDATORY i18n)
- **CẤM TUYỆT ĐỐI** hard-code bất kỳ chuỗi văn bản nào trong JSX/TSX.
- 100% chuỗi text hiển thị trên giao diện người dùng phải sử dụng `useTranslation()` từ `@i18n`.
- Khi thêm key mới, BẮT BUỘC định nghĩa đồng bộ cả hai file ngôn ngữ:
  - `src/i18n/locales/vi/index.ts` (Tiếng Việt)
  - `src/i18n/locales/en/index.ts` (Tiếng Anh)
### [MANDATE-2] 100% TIẾNG VIỆT THUẦN (PURE VIETNAMESE - KHÔNG DÙNG i18n)
- **Hệ thống đa ngôn ngữ đã bị gỡ bỏ hoàn toàn**: Tuyệt đối không import hoặc sử dụng `i18n`, `react-i18next`, `@i18n` hay hook `useTranslation()`.
- **100% chuỗi văn bản giao diện viết trực tiếp bằng Tiếng Việt**: Toàn bộ tiêu đề màn hình, nhãn nút bấm, placeholder ô nhập liệu, helper text, thông báo toast và cảnh báo lỗi đều phải viết bằng Tiếng Việt tự nhiên, thân thiện và chuẩn văn phong sinh viên/chủ trọ Việt Nam.
- **Validation Schema tĩnh**: Toàn bộ schema validation Zod (`authValidation.ts`, ...) định nghĩa trực tiếp chuỗi lỗi bằng Tiếng Việt, không dùng hàm bao bọc hay truyền hàm `t`.

### [MANDATE-3] HẰNG SỐ PHẢI ĐẶT TÊN IN HOA (UPPER_SNAKE_CASE)
- Mọi biến đại diện cho hằng số (config, status code, theme tokens, keys) **BẮT BUỘC PHẢI VIẾT IN HOA TOÀN BỘ**.
- Ví dụ: `API_CONFIG`, `HTTP_STATUS_CODES`, `THEME_COLORS`, `SPACING_TOKENS`, `TYPOGRAPHY_TOKENS`.

### [MANDATE-4] TÁI SỬ DỤNG BASE PACKAGES SẴN CÓ (ZERO DUPLICATION)
- Bắt buộc đọc và tái sử dụng các package nền tảng đã dựng sẵn:
  - HTTP Requests: Dùng `apiClient` từ `@core`. Cấm tạo instance axios mới.
  - Colors / Layout: Dùng `THEME_COLORS`, `SPACING_TOKENS`, `TYPOGRAPHY_TOKENS` từ `@theme`.
  - Error Catching: Dùng `ErrorBoundary` từ `@ui`.
  - Icons: Dùng `lucide-react-native`.

### [MANDATE-5] CẤM COMMENT BỪA BÃI (NO TRIVIAL COMMENTS)
- **Tuyệt đối không viết comment giải thích các dòng code hiển nhiên** (ví dụ: `// import library`, `// call api`, `// render component`, `// handle click`, `// set state`).
- Code phải tự tường minh thông qua cách đặt tên hàm, biến rõ nghĩa (Self-documenting code).
- **Chỉ người lập trình trực tiếp tự comment** khi thật sự cần thiết cho các logic thuật toán phức tạp hay ngữ cảnh phi hiển nhiên.

### [MANDATE-6] KHOẢNG CÁCH DÒNG GIỮA CÁC BLOCK LOGIC (PADDED BLOCKS)
- **Tuyệt đối không viết code dính sát nhau**.
- Phải luôn có 1 dòng trống phân cách giữa các khối logic rõ ràng:
  - Giữa nhóm khai báo biến / hooks và nhóm logic xử lý.
  - Giữa các câu lệnh điều kiện, luồng xử lý (`if`, `switch`, `try-catch`, `for`).
  - Trước câu lệnh `return` hoặc khối JSX render.
- ESLint rule `padding-line-between-statements` và Prettier sẽ tự động hỗ trợ định dạng khoảng cách chuẩn mực này.

### [MANDATE-7] QUY TẮC PHÂN NHÁNH GIT & TRÁCH NHIỆM MÃ NGUỒN (BRANCH RESPONSIBILITY)
- **Phát triển theo cấu trúc phân nhánh tính năng (Feature Branching)**: Dự án tổ chức thành các nhánh độc lập theo từng trách nhiệm:
  - `feat/sp1-mobile-shell`: Cấu trúc khung app, Root/Tab navigator, router, cấu hình chung.
  - `feat/sp1-ui-components`: Các component dùng chung thuộc `@ui` (atoms, molecules, feedback, layout).
  - `feat/sp1-mobile-auth-screens`: Màn hình và logic xác thực thuộc `@features/auth`.
- **Trách nhiệm mã nguồn theo nhánh**: Khi thực hiện thay đổi, **BẮT BUỘC** xác định file thay đổi thuộc phạm vi nhánh nào:
  - Phải checkout sang đúng nhánh đó để thực hiện code, kiểm tra và commit.
  - Không thay đổi các file thuộc trách nhiệm của nhánh khác trên nhánh hiện tại.
  - Kế thừa và đồng bộ: Nhánh downstream merge từ nhánh upstream theo thứ tự (`shell` -> `ui-components` -> `auth-screens`). Kiểm tra `npm run lint` & `npm run typecheck` đạt 0 lỗi trước khi push lên `origin`.
- **Format commit message chuẩn Conventional Commits**: `<type>(<scope>): <mô tả ngắn> (<TASK-ID>)` (ví dụ: `refactor(auth): remove i18n dependency (TSK-SP1-03)`).

---

## 2. Quy chuẩn Đặt tên Toàn diện (Naming Conventions)

### A. Tệp tin (Files) & Thư mục (Folders)
- **Components & Screens**: `PascalCase.tsx` (ví dụ: `ListingCard.tsx`, `HomeScreen.tsx`, `RootNavigator.tsx`).
- **Custom Hooks**: `camelCase.ts` bắt đầu bằng tiền tố `use` (ví dụ: `useDebounce.ts`, `useKeyboard.ts`).
- **Services, Utilities & Helpers**: `camelCase.ts` (ví dụ: `listingService.ts`, `formatCurrency.ts`).
- **Stores**: `camelCase.ts` có hậu tố `Store` (ví dụ: `authStore.ts`, `compareStore.ts`).
- **Thư mục (Folders/Packages)**: `kebab-case` cho tên ghép hoặc chữ thường (ví dụ: `ai-chat`, `features`, `ui`, `core`).

### B. Biến (Variables)
- **Biến thông thường**: `camelCase` (ví dụ: `listingId`, `currentUser`, `totalCount`).
- **Biến Boolean**: Bắt buộc bắt đầu bằng `is`, `has`, `should`, `can` (ví dụ: `isLoading`, `hasPermission`, `shouldRefresh`, `canSubmit`).
- **Danh sách / Mảng (Arrays)**: Danh từ số nhiều hoặc có hậu tố `List` (ví dụ: `listings`, `users`, `amenityList`).
- **Hằng số (Constants)**: `UPPER_SNAKE_CASE` toàn bộ (ví dụ: `API_CONFIG`, `HTTP_STATUS_CODES`, `THEME_COLORS`, `SPACING_TOKENS`).

### C. Hàm (Functions) & Xử lý sự kiện (Handlers)
- **Hàm xử lý sự kiện nội bộ**: Tiền tố `handle` (ví dụ: `handleSubmit`, `handlePressListing`, `handleDelete`).
- **Props callback truyền xuống**: Tiền tố `on` (ví dụ: `onPress`, `onChangeText`, `onSubmitSuccess`).
- **Hàm gọi API / Data fetching**: Động từ mô tả hành động (ví dụ: `fetchListingDetail`, `createBooking`, `updateUserProfile`).
- **Hàm tiện ích / Helper**: Tiền tố `get`, `format`, `validate`, `parse` (ví dụ: `formatPrice`, `validatePhoneNumber`, `getDistanceKm`).

### D. Kiểu dữ liệu (Types & Interfaces)
- **Type / Interface**: `PascalCase` (ví dụ: `User`, `Listing`, `BookingStatus`).
- **Component Props**: `<TênComponent>Props` (ví dụ: `ButtonProps`, `ListingCardProps`).
- **Request DTO / Payload**: `<TênHànhĐộng>Dto` hoặc `<TênHànhĐộng>Payload` (ví dụ: `CreateListingDto`, `LoginPayload`).
- **API Response**: `<TênNghiệpVụ>Response` (ví dụ: `ListingDetailResponse`).

### E. React Native & Styling
- **StyleSheet Object**: Luôn đặt tên biến là `styles` (ví dụ: `const styles = StyleSheet.create({ ... })`).
- **Navigation Param List**: `<TênStack>ParamList` (ví dụ: `RootStackParamList`, `MainTabParamList`).
- **Path Imports**: Luôn dùng alias `@core`, `@ui`, `@theme`, `@i18n`, `@hooks`, `@navigation`, `@features/...`. Không dùng relative path vượt quá 1 cấp (`../../`).
- **Path Imports**: Luôn dùng alias `@core`, `@ui`, `@theme`, `@hooks`, `@navigation`, `@features/...`. Không dùng relative path vượt quá 1 cấp (`../../`).
- **Zero Unused Imports & Variables**: Tuyệt đối không để lại import thừa hoặc biến không dùng. Hệ thống tự động chặn ở cả 2 tầng: ESLint (`unused-imports/no-unused-imports: error`) và TypeScript (`noUnusedLocals: true`). Chạy `npm run lint:fix` để tự động dọn sạch import thừa.

---

## 3. Clean Architecture & Separation of Concerns
- **UI Presentational**: Chỉ phụ trách render và event handler, không chứa business logic nặng.
- **Server State**: 100% qua TanStack Query (`useQuery`, `useMutation`). Không lưu cache dữ liệu server thủ công vào Zustand.
- **Client State**: Zustand (`zustand`). Giữ store tinh gọn, đúng phạm vi feature.
- **Form State**: `react-hook-form` + `zod` validation schema.
- **Layout**: Dùng Flexbox, Safe Area Context (`react-native-safe-area-context`), tokens từ `@theme`.
