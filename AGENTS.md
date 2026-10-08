# UniNest Mobile App — Hướng dẫn cho AI

Ứng dụng di động UniNest (Expo + React Native + TypeScript) kết nối **Sinh viên** thuê trọ với **Chủ trọ**. Backend ở repo `../uninest-be`.

**AI phải đọc file này trước khi làm bất cứ việc gì trong repo.** Sau đó đọc các file trong `agent/` theo bảng dưới.

| Khi nào | Đọc file |
| --- | --- |
| Mọi yêu cầu | [`agent/business-logic.md`](./agent/business-logic.md) — nghiệp vụ, con số, API, màn hình của cả 5 sprint |
| Trước khi tạo component / hook / hàm / hằng số | [`agent/reuse-catalog.md`](./agent/reuse-catalog.md) — những gì đã có sẵn |
| Khi viết code | [`agent/rules.md`](./agent/rules.md) — quy chuẩn code, ví dụ đúng/sai |
| Thứ tự làm việc, khi nào phải hỏi | [`agent/ai-workflow.md`](./agent/ai-workflow.md) |
| Nhánh, commit, Pull Request | [`agent/git.md`](./agent/git.md) |

---

## 12 luật không được vi phạm

1. **Đúng nghiệp vụ.** Làm theo `agent/business-logic.md`. Không tự đổi giới hạn, trạng thái, luồng. Không làm thứ nằm ngoài phạm vi. Không chắc → **hỏi**.
2. **Dùng lại trước, tạo mới sau.** Tra `agent/reuse-catalog.md` và `grep` code trước khi tạo bất cứ thứ gì. Gần giống → thêm prop, không viết bản thứ hai.
3. **Không hard-code thiết kế.** Màu, khoảng cách, bo góc, cỡ chữ lấy từ `@theme`.
4. **100% tiếng Việt** cho mọi chữ người dùng thấy. Không i18n.
5. **Gọi API chỉ qua `apiClient` trong service + React Query trong hook.** Không gọi API trong component, không lưu dữ liệu server vào Zustand.
6. **Mỗi màn có tải dữ liệu phải có 3 trạng thái:** đang tải, rỗng, lỗi + thử lại.
7. **Không comment trong code**, không `console.log`, không code chết.
8. **Không `any`, `@ts-ignore`, `eslint-disable`.**
9. **Không cài thư viện mới, không bịa API** khi chưa được đồng ý.
10. **Không phá code đang chạy.** Sửa thứ dùng chung → kiểm tra mọi nơi đang dùng.
11. **Kiểm tra 0 lỗi trước khi báo xong** (lệnh ở dưới).
12. **Không tự commit/push.** Khi được phép: đúng `agent/git.md`, định dạng `<type>(<scope>): <mô tả> (<TASK-ID>)`, không dòng ghi công AI.

---

## Kiểm tra trước khi commit

```bash
npm run lint:fix
npm run format
npm run typecheck
npm run lint
npm test
```

## Chạy dự án

```bash
npm install
npx expo start            # Expo Go / emulator
npx expo start --web      # web
```

Biến môi trường (`.env`, xem `.env.example`): `EXPO_PUBLIC_API_URL` (vd `http://<ip-máy>:3001/api/v1`), `EXPO_PUBLIC_WS_URL`.

## Bản đồ thư mục nhanh

`src/core` (apiClient, utils, store toàn cục) · `src/theme` (token) · `src/ui` (component dùng chung) · `src/hooks` · `src/navigation` · `src/features/<feature>` (components, hooks, screens, services, store, types, validations).

Thiết kế Figma: file `43C8yqbyxUmFGTuHcPPiRI`, trang `SinhVien`.
