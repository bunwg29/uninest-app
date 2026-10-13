# Danh mục tái sử dụng — uninest-app

> **Đọc file này TRƯỚC KHI tạo bất kỳ component, hook, hàm tiện ích hay hằng số nào.**
> Có sẵn thì dùng lại. Gần giống thì **mở rộng bằng prop** (không đổi hành vi cũ). Chỉ tạo mới khi chắc chắn không có gì phù hợp, và phải nêu lý do trong báo cáo.
>
> Danh mục này phản ánh code ngày 08/10/2026. Ai thêm thứ dùng chung mới thì **bổ sung vào đây trong cùng commit**.

---

## 1. Quy tắc chọn chỗ đặt code

| Thứ cần viết | Dùng ở mấy feature? | Đặt ở đâu |
| --- | --- | --- |
| Component giao diện thuần (không gọi API, không biết nghiệp vụ) | ≥ 2 feature | `src/ui/atoms` (nhỏ nhất) · `src/ui/molecules` (ghép nhiều atom) · `src/ui/feedback` · `src/ui/layout` |
| Component có nghiệp vụ của 1 feature | 1 feature | `src/features/<feature>/components` |
| Hook dùng chung không gắn nghiệp vụ | ≥ 2 feature | `src/hooks` |
| Hook gọi API của 1 feature | — | `src/features/<feature>/hooks` |
| Hàm định dạng/chuẩn hoá dữ liệu dùng chung | ≥ 2 feature | `src/core/utils` |
| Hằng số dùng chung (status code, role…) | ≥ 2 feature | `src/core/constants` |
| Màu, khoảng cách, cỡ chữ, bo góc | luôn luôn | `src/theme` (**không** hard-code) |

Feature A cần thứ nằm trong feature B → import qua barrel `@features/b` (chỉ những gì B export ở `index.ts`). Nếu thứ đó thật ra là giao diện thuần → chuyển nó lên `@ui` thay vì import chéo.

---

## 2. `@theme` — token thiết kế

| Token | Dùng cho |
| --- | --- |
| `THEME_COLORS` | Màu chính: `PRIMARY`, `PRIMARY_DARK`, `PRIMARY_LIGHT`, `BACKGROUND`, `SURFACE`, `SURFACE_MUTED`, `TEXT_PRIMARY`, `TEXT_SECONDARY`, `TEXT_MUTED`, `TEXT_PLACEHOLDER`, `BORDER`, `DIVIDER`, `ERROR(_LIGHT)`, `WARNING(_LIGHT)`, `SUCCESS(_LIGHT)`, `WHITE`, `BLACK` |
| `OVERLAY_COLORS` | Màu phụ của thiết kế: viền thông báo (`INFO_BORDER`, `SUCCESS_BORDER`, `NOTICE_ERROR_BORDER`, `WARNING_BORDER`), nền mờ (`SHEET_BACKDROP`, `MODAL_BACKDROP`), bản đồ, gradient… |
| `SPACING_TOKENS` | `XXS 2`, `XS 4`, `SM 8`, `MD 16`, `LG 24`, `XL 32`, `XXL 48` |
| `BORDER_RADIUS_TOKENS` | `XS 4`, `SM 8`, `MD 12`, `LG 16`, `XL 20`, `FULL 999` |
| `TYPOGRAPHY_TOKENS` | `FONT_SIZES`, `LINE_HEIGHTS`, `FONT_WEIGHTS` |

Thiết kế có màu chưa có token → **thêm token vào `src/theme/colors.ts`** (đặt tên theo ý nghĩa), không viết mã màu trong component.

---

## 3. `@ui` — component dùng chung

### Atoms
| Component | Dùng khi | Prop chính |
| --- | --- | --- |
| `Typography` | **Mọi chữ hiển thị.** Không dùng `<Text>` trần trừ chữ lồng trong `Typography` | `variant` (`h1`…`h4`, `body1`, `body2`, `label`, `caption`, `tiny`), `weight`, `colorKey`/`color`, `align` |
| `Button` | Mọi nút hành động | `title`, `variant` (`primary`, `secondary`, `outline`, `ghost`, `danger`), `size` (`sm` 36, `md` 44, `lg` 52), `isLoading`, `disabled`, `fullWidth`, `leftIcon`, `rightIcon` |
| `BackButton` | Nút quay lại / đóng ở đầu màn | `onPress`, `icon` (`back` \| `close`) |
| `Badge` | Nhãn nhỏ, đếm số | `label`, `variant`, `size`, `icon` |
| `Avatar` | Ảnh đại diện có chữ cái thay thế | `uri`, `name`, `size`, `isOnline` |
| `GradientAvatar` | Avatar nền gradient theo seed (chat, forum) | `name`, `seed`, `uri`, `size` |
| `GradientView` | Nền gradient | `colors`, `angle` |
| `MediaThumbnail` | Ảnh tin đăng có xử lý lỗi + nền gradient dự phòng | `uri`, `placeholderColors`, `style` |
| `SaveButton` | Nút trái tim lưu phòng | `isSaved`, `onPress`, `size`, màu |
| `Divider` | Đường kẻ | `orientation`, `label` |

### Molecules
| Component | Dùng khi | Prop chính |
| --- | --- | --- |
| `Input` | Mọi ô nhập liệu | `label`, `errorMessage`, `helperText`, `leftIcon`, `rightIcon`, `isPassword`, `clearable`, `containerStyle`, `inputContainerStyle` |
| `DatePickerField` | **Mọi ô chọn ngày.** Không cho gõ tay, không dùng picker hệ điều hành | `value` (ISO `YYYY-MM-DD`), `onChange`, `minimumDate`, `maximumDate`, `clearable`, `title` · tiện ích kèm: `toIsoDate`, `fromIsoDate`, `formatDateForDisplay` |
| `BottomSheet` | **Mọi sheet trượt từ dưới lên** (chọn, lọc, menu hành động) | `isVisible`, `onClose`, `keyboardAvoiding`, `showHandle`, `applyBottomInset`, `sheetStyle`, `handleStyle` |
| `Modal` | Hộp thoại xác nhận giữa màn hình | `title`, `description`, `confirmText`, `cancelText`, `onConfirm`, `confirmVariant`, `isConfirmLoading`, `dismissible` |
| `NoticeBanner` | Hộp thông báo có icon (tóm tắt, cảnh báo, thành công) | `tone` (`info`, `warning`, `success`, `error`), `icon` (lucide), `style` |
| `VideoPickerField` | Ô thêm/xoá 1 video đính kèm (tin đăng, bài forum) | `video` (`fileName`, `fileSize`), `onAdd`, `onRemove` |
| `PriceText` | Giá "x.xxx.xxxđ/tháng" | `price` (chuỗi đã format), `suffix`, `variant`, `priceColorKey` |
| `FilterChip` | Chip chọn/bỏ chọn trong bộ lọc | `label`, `isSelected`, `onPress`, `icon` |
| `Toast` | Hiển thị toast — **không gọi trực tiếp**, dùng `useToast()` | — |

### Feedback
| Component | Dùng khi |
| --- | --- |
| `EmptyState` | Trạng thái rỗng (bắt buộc ở mọi danh sách) — `title`, `description`, `icon`, `actionTitle`, `onAction` |
| `SkeletonBox`, `SkeletonCircle`, `SkeletonText`, `ListingCardSkeleton` | Trạng thái đang tải (bắt buộc ở mọi màn tải dữ liệu) |
| `LoadingOverlay` | Phủ loading toàn màn khi đang gửi |
| `GlobalToast` | Đã gắn ở `App.tsx`, không gắn thêm |

### Layout
| Component | Dùng khi |
| --- | --- |
| `ScreenContainer` | **Gốc của mọi màn hình** — tự xử lý safe area, bàn phím, độ rộng tối đa. Prop: `scrollable`, `padding`, `refreshControl`, `applyTopInset`, `applyBottomInset`, `keyboardAvoiding` |
| `HeaderBar` | Thanh tiêu đề màn hình có nút quay lại — `title`, `subtitle`, `onBack`, `rightAction`, `alignTitle`, `hasBottomBorder` |
| `KeyboardAwareScrollView`, `KeyboardAvoidingContainer` | Form dài có bàn phím (thường đã có sẵn trong `ScreenContainer`) |

### Boundaries
`ErrorBoundary` — đã bọc ở `App.tsx`.

---

## 4. `@hooks`

| Hook | Dùng khi |
| --- | --- |
| `useToast()` | Hiện thông báo: `success`, `error`, `warning`, `info` |
| `useDebouncedValue(value, ms)` | Ô tìm kiếm, gọi API khi gõ (400ms là chuẩn dự án) |
| `useKeyboardHeight()` | Cần biết chiều cao bàn phím |
| `useResponsiveLayout()` | Màn hình rộng/hẹp; hằng `RESPONSIVE_MAX_CONTENT_WIDTH`, `COMPACT_SCREEN_WIDTH` |

---

## 5. `@core`

| Thứ | Dùng khi |
| --- | --- |
| `apiClient` | **Mọi lời gọi API.** Đã tự gắn token, tự refresh khi 401, tự chuyển lỗi thành `AppError` (message tiếng Việt). Không tạo axios instance khác |
| `unwrapApiData<T>(response.data)` | Bóc envelope `{ status, data, error, messages }` — dùng trong mọi service |
| `AppError` | Kiểu lỗi chuẩn (`statusCode`, `errorCode`, `message`) |
| `QUERY_CLIENT` | QueryClient dùng chung (đã cấu hình retry, staleTime) |
| `tokenStorage` | Đọc/ghi token SecureStore — chỉ module auth dùng |
| `registerStoreResetter(fn)` / `resetAllStores()` | Store Zustand có dữ liệu người dùng **phải đăng ký reset** để xoá khi đăng xuất |
| `useUIStore`, `useMaintenanceStore` | Trạng thái giao diện toàn cục, màn bảo trì |
| `USER_ROLES`, `HTTP_STATUS_CODES`, `MAINTENANCE_STATUS_CODES` | Hằng số dùng chung |
| `API_CONFIG`, `APP_CONFIG` | Cấu hình từ biến môi trường `EXPO_PUBLIC_*` |
| `formatFullPrice(number)` | Giá đầy đủ `3.600.000đ` |
| `formatVND`, `formatNumberWithDots`, `parseRawNumberString` | Ô nhập tiền có dấu chấm |
| `removeDiacritics(text)` | So khớp tìm kiếm không dấu phía client |
| `validateUploadImage`, `filterValidUploadImages`, `resolveImageContentType`, `MAX_UPLOAD_IMAGE_BYTES` | Kiểm tra ảnh trước khi tải lên (jpg/png, dung lượng) |
| `validateUploadVideo`, `resolveVideoContentType`, `MAX_UPLOAD_VIDEO_BYTES` | Kiểm tra video |
| `getDeviceInfo()` | `deviceId`, `deviceName` khi đăng nhập |

---

## 6. Thứ dùng chung nằm trong feature (import qua barrel)

| Thứ | Import từ | Dùng khi |
| --- | --- | --- |
| `useAuth()`, `useAuthStore` | `@features/auth` | Lấy `user`, `role`, `isAuthenticated`, `logout`… |
| `useRoleGuard()` | `@features/auth` | Kiểm tra `isStudent`, `isLandlord` để ẩn/hiện chức năng |
| `UniversityPicker` | `@features/auth` | Chọn trường đại học (1 hoặc nhiều, có giới hạn) |
| `AddressFields`, `EMPTY_ADDRESS`, `AddressValue` | `@features/auth` | Nhập địa chỉ tỉnh → phường → số nhà, tên đường |
| `OtpInput` | `@features/auth` (components) | Ô nhập OTP 6 số |
| `useOpenListingChat().openChat(listingId)` | `@features/chat` | Mở/tạo hội thoại từ bất kỳ đâu |
| `chatSocket` | `@features/chat` (services) | Kết nối Socket.IO duy nhất của app — **không tạo socket thứ hai** |
| `useChatSummary()` | `@features/chat` | Số tin chưa đọc cho badge |
| `useFavoriteIds()`, `useToggleFavorite()`, `FAVORITE_IDS_QUERY_KEY` | `@features/search` | Lưu/bỏ lưu phòng ở bất kỳ màn nào |
| `useSearchStore`, `SEARCH_SCHOOLS` | `@features/search` | Áp bộ lọc từ màn khác (vd danh mục ở Trang chủ) |
| `useComparison()` | `@features/comparison` | Thêm/bỏ phòng khỏi danh sách so sánh (tối đa 4) |
| `useRecentlyViewedStore`, `useRecentListingIds` | `@features/recommendations` | Ghi/đọc phòng đã xem gần đây |
| `useUploadImages()` | `@features/listings` (hooks) | Tải nhiều ảnh song song lên R2 có tiến độ, thử lại từng ảnh |
| `AvailabilityBadge` | `@features/listings` | Nhãn còn trống / đang giữ chỗ / đã cho thuê |
| `SearchListingRow`, `SearchListingGridCard`, `SavedRoomRow`, `RecommendationCard` | feature tương ứng | 4 biến thể thẻ tin đã có — **làm thẻ tin mới phải dùng lại `MediaThumbnail`, `PriceText`, `SaveButton`** |
| `TermsScreen`, `HelpCenterScreen`, `MaintenanceScreen` | `@features/support` | Màn chung (điều khoản, trợ giúp, bảo trì) |

---

## 7. Mẫu code chuẩn đã có trong dự án (copy cách làm, không copy code)

| Việc | Xem mẫu ở |
| --- | --- |
| Service gọi API + `unwrapApiData` | `src/features/auth/services/universitiesService.ts` |
| Hook React Query có optimistic update | `src/features/search/hooks/useFavorites.ts` (`useToggleFavorite`) |
| Danh sách cuộn vô hạn | `useFavorites` (`useInfiniteQuery`) |
| Zustand store lưu trên máy + reset khi đăng xuất | `src/features/comparison/store/comparisonStore.ts` |
| Form react-hook-form + zod tiếng Việt | `src/features/auth/screens/RegisterScreen.tsx` + `src/features/auth/validations` |
| Sheet chọn dùng `BottomSheet` | `src/features/search/components/SearchSortSheet.tsx` |
| Màn có đủ 3 trạng thái tải/rỗng/lỗi | `src/features/search/components/SearchStateViews.tsx` |
| Màn đơn giản có `HeaderBar` | `src/features/support/screens/TermsScreen.tsx` |
| Lắng nghe sự kiện socket | `src/features/chat/hooks/useChatRealtime.ts` |

---

## 8. Dấu hiệu đang tạo trùng — dừng lại kiểm tra

- Đang viết `StyleSheet` có `borderTopLeftRadius` + nền mờ + `Modal transparent` → đã có **`BottomSheet`**.
- Đang viết `toLocaleString('vi-VN')` + `'đ'` → đã có **`formatFullPrice`** / **`PriceText`**.
- Đang viết `normalize('NFD')` → đã có **`removeDiacritics`**.
- Đang viết `if (payload.data && payload.status...)` → đã có **`unwrapApiData`**.
- Đang viết `<Image>` + `onError` + gradient → đã có **`MediaThumbnail`**.
- Đang viết icon `Heart` có trạng thái lưu → đã có **`SaveButton`**.
- Đang viết hộp có icon + viền màu + chữ → đã có **`NoticeBanner`**.
- Đang viết `TextInput` cho ngày tháng → phải dùng **`DatePickerField`**.
- Đang viết hàm debounce/`setTimeout` cho ô tìm kiếm → đã có **`useDebouncedValue`**.
- Đang viết `axios.create` hoặc `fetch(` gọi backend → phải dùng **`apiClient`**.
- Đang viết mã màu `#xxxxxx` hoặc số px khoảng cách lặp lại → dùng **token `@theme`**.
- Đang tạo `io(` socket mới → dùng **`chatSocket`**.
