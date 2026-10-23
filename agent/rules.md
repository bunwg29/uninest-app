# Quy chuẩn code — uninest-app

> Mỗi quy tắc có ví dụ ✅ nên / ❌ không. Code vi phạm quy tắc **bắt buộc** thì không được commit.

---

## 1. Công nghệ cố định

Expo SDK 57 · React Native · TypeScript strict · React Navigation (native-stack, bottom-tabs) · TanStack Query (server state) · Zustand (client state) · react-hook-form + zod (form) · axios qua `apiClient` · Socket.IO client qua `chatSocket` · lucide-react-native (icon) · react-native-svg.

**Không tự cài thư viện mới.** Cần thư viện → hỏi người giao việc trước. Không đổi phiên bản thư viện đang dùng.

---

## 2. Cấu trúc thư mục

```
src/
  core/        # apiClient, config, constants, storage, store toàn cục, utils dùng chung
  theme/       # token màu, khoảng cách, chữ, bo góc
  ui/          # component giao diện thuần dùng chung (atoms, molecules, feedback, layout)
  hooks/       # hook dùng chung không gắn nghiệp vụ
  navigation/  # navigator, ParamList, navigationRef
  features/<tên>/
    components/  hooks/  screens/  services/  store/  types/  utils/  validations/
    index.ts     # barrel: chỉ export thứ feature khác được dùng
```

Feature hiện có: `auth`, `listings`, `search`, `comparison`, `booking`, `chat`, `forum`, `support`, `ai-chat`, `recommendations`. Feature của Sprint 3–4 chưa có thì tạo đúng tên sau, theo cấu trúc trên: `reviews` (đánh giá), `notifications` (thông báo), `payment` (thanh toán gói Premium ở Sprint 4), `price-comparison` (so sánh giá), `premium`, `admin` (nếu làm trong app). `ai-chat`, `recommendations` đã có — **viết tiếp vào đó**.

Tạo feature mới chỉ khi nghiệp vụ không thuộc feature nào ở trên, và phải hỏi người giao việc trước.

---

## 3. Quy tắc bắt buộc

### R1. Tái sử dụng trước, tạo mới sau
Trước khi tạo component/hook/hàm/hằng số: tra [`reuse-catalog.md`](./reuse-catalog.md) và tìm trong code (`grep`). Có sẵn → dùng. Gần giống → thêm prop tuỳ chọn (giá trị mặc định giữ hành vi cũ). Tạo mới → giải thích lý do trong báo cáo.

```tsx
// ❌ Tự viết sheet mới
<Modal transparent animationType="slide">
  <Pressable style={styles.backdrop} onPress={onClose} />
  <View style={styles.sheet}>...</View>
</Modal>

// ✅ Dùng BottomSheet có sẵn
<BottomSheet isVisible={isVisible} onClose={onClose}>
  ...
</BottomSheet>
```

### R2. Không hard-code giá trị thiết kế
Màu, khoảng cách, bo góc, cỡ chữ lấy từ `@theme`. Màu mới → thêm token có tên theo ý nghĩa.

```tsx
// ❌
container: { padding: 16, backgroundColor: '#1D53CC', borderRadius: 12 }
// ✅
container: {
  padding: SPACING_TOKENS.MD,
  backgroundColor: THEME_COLORS.PRIMARY,
  borderRadius: BORDER_RADIUS_TOKENS.MD,
}
```

Số lẻ theo đúng thiết kế Figma (vd `gap: 10`, `width: 36`) được phép khi không có token tương ứng.

### R3. Tiếng Việt cho người dùng, không i18n
Mọi chữ trên giao diện, toast, lỗi validation viết thẳng tiếng Việt có dấu, giọng thân thiện. Không dùng `i18n`, `useTranslation`, file locale.

### R4. Gọi API chỉ qua service + React Query
```ts
// services/xxxService.ts
export const xxxService = {
  async list(params: XxxQuery): Promise<XxxListResponse> {
    const response = await apiClient.get('/xxx', { params });

    return unwrapApiData<XxxListResponse>(response.data);
  },
};

// hooks/useXxx.ts
export const XXX_QUERY_KEY = ['xxx'] as const;

export const useXxx = (params: XxxQuery) =>
  useQuery({ queryKey: [...XXX_QUERY_KEY, params], queryFn: () => xxxService.list(params) });
```
- Không gọi `apiClient` trong component/screen.
- Không lưu dữ liệu server vào Zustand. Zustand chỉ cho trạng thái phía client (bộ lọc, nháp, so sánh, phiên).
- Mutation xong phải `invalidateQueries` đúng key liên quan.
- Lỗi API là `AppError` có message tiếng Việt → hiện bằng `toast.error(error.message)`.

### R5. Mọi màn tải dữ liệu có đủ 3 trạng thái
Đang tải (skeleton), rỗng (`EmptyState`), lỗi (thông báo + nút thử lại). Danh sách dài dùng `FlatList` + cuộn vô hạn, có kéo để làm mới.

### R6. Form = react-hook-form + zod
Schema đặt ở `features/<tên>/validations`, message tiếng Việt, **cùng con số với backend** (xem `business-logic.md`). Không tự kiểm tra bằng `if` rải rác trong component.

### R7. Màn hình mới
- Gốc là `ScreenContainer`, đầu màn dùng `HeaderBar` hoặc `BackButton`.
- Khai báo route trong `src/navigation/types.ts` (ParamList) **và** đăng ký trong navigator tương ứng.
- Lấy `navigation`/`route` bằng `useNavigation<NativeStackNavigationProp<RootStackParamList, 'TênRoute'>>()`, `useRoute<RouteProp<...>>()`.
- Phải khớp thiết kế Figma (file `43C8yqbyxUmFGTuHcPPiRI`). Không tự "sáng tạo" bố cục.

### R8. Store Zustand có dữ liệu người dùng phải reset khi đăng xuất
```ts
registerStoreResetter(() => useXxxStore.getState().reset());
```
Ngoại lệ: dữ liệu cố ý giữ lại cho từng tài khoản thì lưu tách theo `userId` (xem `recentlyViewedStore.ts`).

### R9. Không comment
Không viết comment trong code (kể cả `// TODO`, `// call api`). Đặt tên rõ nghĩa thay cho comment. Không để code chết, code bị comment out.

### R10. Không `any`, không bỏ qua lỗi
- Không dùng `any`, `as any`, `@ts-ignore`, `eslint-disable`. Dữ liệu chưa rõ kiểu → `unknown` rồi thu hẹp.
- Không `catch {}` nuốt lỗi im lặng trừ chỗ thật sự chấp nhận được (vd cleanup); lỗi người dùng cần biết phải hiện toast.
- Không `console.log`.

### R11. Không phá cái đang chạy
- Sửa component dùng chung → kiểm tra **mọi nơi đang dùng** (`grep`) vẫn đúng giao diện và hành vi.
- Không đổi tên/xoá export đang được dùng nếu không sửa hết chỗ gọi.
- Không đổi nghiệp vụ (giới hạn, trạng thái, luồng) khi không được giao.

---

## 4. Đặt tên

| Loại | Quy tắc | Ví dụ |
| --- | --- | --- |
| Component, Screen | `PascalCase.tsx`, export có tên (không `default`) | `ListingCard.tsx` → `export const ListingCard` |
| Screen | hậu tố `Screen` | `BookingDetailScreen` |
| Hook | `useXxx.ts` | `useFavorites.ts` |
| Service | `xxxService.ts`, object có method | `listingService.list()` |
| Store | `xxxStore.ts`, hook `useXxxStore` | `comparisonStore.ts` |
| Props | `<Tên>Props` | `SaveButtonProps` |
| Hằng số | `UPPER_SNAKE_CASE` | `MAX_COMPARISON_ITEMS` |
| Query key | `<TÊN>_QUERY_KEY` dạng `as const` | `FAVORITES_QUERY_KEY` |
| Boolean | `is`, `has`, `can`, `should` | `isSaved`, `hasError` |
| Hàm xử lý sự kiện | `handleXxx`; prop callback `onXxx` | `handleSubmit`, `onPress` |
| Thư mục | `kebab-case` | `ai-chat` |

Import luôn qua alias (`@core`, `@ui`, `@theme`, `@hooks`, `@navigation`, `@features/...`). Trong cùng feature dùng đường dẫn tương đối tối đa 1 cấp (`../hooks`). File trong `src/ui` import lẫn nhau bằng đường dẫn tương đối (tránh vòng lặp import).

---

## 5. Định dạng code

- Prettier: nháy đơn, có `;`, 2 space, `printWidth` 100. Chạy `npm run format`.
- Dòng trống: sau khối khai báo biến, trước `return`, trước/sau `if`/`for`/`switch`/`try` (ESLint `padding-line-between-statements` tự nhắc).
- `const styles = StyleSheet.create({...})` đặt **cuối file**, không viết style object trực tiếp trong JSX trừ giá trị động.
- Component nhỏ, một việc. File > ~300 dòng → tách component con vào `components/`.
- Không để style thừa, import thừa, biến thừa (ESLint `unused-imports` + TS `noUnusedLocals`).

---

## 6. Hiệu năng & trải nghiệm

- Danh sách: `FlatList` với `keyExtractor`, không `.map` trong `ScrollView` cho danh sách dài.
- Hàm truyền xuống item trong danh sách: `useCallback`; item nặng: `memo`.
- Ảnh tin đăng dùng `MediaThumbnail` (có xử lý lỗi).
- Vùng chạm ≥ 44×44 (dùng `hitSlop` nếu icon nhỏ). Có `accessibilityRole`, `accessibilityLabel` cho nút chỉ có icon.
- Upload nhiều ảnh: song song, có tiến độ từng ảnh, thử lại từng ảnh (`useUploadImages`).
- Màn có bản đồ: tách `.native.tsx` / `.web.tsx` như các component `*Map` hiện có.
