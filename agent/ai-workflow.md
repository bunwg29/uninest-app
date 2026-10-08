# Quy trình làm việc của AI — uninest-app

> Làm **đúng thứ tự** các bước. Không bỏ bước. Gặp điều kiện "DỪNG" thì hỏi người dùng, không tự đoán.

---

## Bước 1 — Hiểu yêu cầu và xác định nghiệp vụ

1. Xác định yêu cầu thuộc **mã FR / TASK-ID** nào (tra `business-logic.md`).
2. Đọc mục nghiệp vụ tương ứng: quy tắc bắt buộc, con số, API, màn hình.
3. Tra mục **2. Ngoài phạm vi** và **3. Quyết định đã chốt**.

**DỪNG và hỏi khi:**
- Yêu cầu nằm ngoài phạm vi, hoặc mâu thuẫn với `business-logic.md`.
- Không tìm thấy nghiệp vụ trong file, hoặc người dùng muốn đổi một con số/quy tắc đã chốt.
- Cần API mà backend chưa có (không tự bịa endpoint, không tự viết dữ liệu giả để "cho chạy được").
- Cần cài thư viện mới.

## Bước 2 — Khảo sát code hiện có (bắt buộc trước khi viết)

1. Đọc `reuse-catalog.md`.
2. Tìm trong code những thứ liên quan: `grep` tên màn hình, tên API, tên component tương tự.
3. Mở **ít nhất một màn/feature tương tự đã làm** để học cách làm (xem mục 7 của `reuse-catalog.md`).
4. Liệt kê cho chính mình: dùng lại gì, mở rộng gì, phải tạo mới gì (và vì sao).

Có thiết kế Figma → lấy đúng node màn hình đó, làm khớp thiết kế; map màu/khoảng cách sang token `@theme`.

## Bước 3 — Viết code

- Đặt file đúng chỗ (xem `rules.md` mục 2 và `reuse-catalog.md` mục 1).
- Tuân thủ toàn bộ `rules.md` (R1–R11).
- Làm **đúng phạm vi được giao**. Thấy lỗi khác ngoài phạm vi → ghi lại để báo, không tự sửa lan man.
- Thêm thứ dùng chung mới → cập nhật `reuse-catalog.md`.
- Thay đổi nghiệp vụ đã được người dùng duyệt → cập nhật `business-logic.md` (và copy sang repo backend).

## Bước 4 — Tự kiểm tra

```bash
npm run lint:fix
npm run format
npm run typecheck
npm run lint
npm test
```
Tất cả phải **0 lỗi, 0 cảnh báo mới**. Lỗi không liên quan tới việc của mình đã có từ trước → báo lại, không tự sửa.

Kiểm tra thủ công luồng chính + 3 trạng thái tải/rỗng/lỗi. Đã sửa component dùng chung → kiểm tra các màn đang dùng nó.

## Bước 5 — Rà lại trước khi báo cáo

- [ ] Đúng nghiệp vụ, đúng con số trong `business-logic.md`
- [ ] Không tạo trùng component/hook/hàm đã có
- [ ] Không hard-code màu, khoảng cách; không `any`; không comment; không `console.log`
- [ ] Mọi chữ hiển thị là tiếng Việt
- [ ] Màn mới đã khai báo route trong `navigation/types.ts` và navigator
- [ ] Store có dữ liệu người dùng đã `registerStoreResetter`
- [ ] Đã xoá file, style, import thừa

## Bước 6 — Commit (chỉ khi người dùng cho phép)

Theo `git.md`: đúng nhánh task, đúng định dạng `<type>(<scope>): <mô tả> (<TASK-ID>)`, mỗi commit một việc, không dòng ghi công AI. **Không push** khi chưa được yêu cầu.

## Bước 7 — Báo cáo cho người dùng (tiếng Việt)

Ngắn gọn, gồm:
1. Đã làm gì (theo nghiệp vụ, không liệt kê từng dòng code).
2. Dùng lại những gì có sẵn; tạo mới gì và vì sao.
3. Kết quả lệnh kiểm tra.
4. Điểm cần người dùng quyết hoặc lỗi phát hiện ngoài phạm vi.
