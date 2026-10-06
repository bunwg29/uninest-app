# UniNest - Business Logic & Domain Specs

## 1. Core Purpose & Actors

- **Product**: Cross-platform student rental mobile app (UniNest).
- **Actors & Roles**:
  - `student`: Search/filter rooms, spatial distance to campus, compare (max 4), booking view/hold, 1-1 chat, forum, review (verified), sandbox payment.
  - `landlord`: Manage listings (create/edit/hide/delete), manage booking requests, 1-1 chat, view basic stats, buy Premium package.
  - `admin`: Moderation queue (pending listings), report resolution, ban/unban users, audit log.

## 2. Key Modules & Lifecycle Flows

- **Language**: 100% Tiếng Việt thuần trên toàn bộ giao diện (Pure Vietnamese, không dùng đa ngôn ngữ/i18n).
- **Auth & Profile (`FR-AUTH`)**:
  - Register/Login via email or phone + OTP.
  - JWT (Access + Refresh token in SecureStore). RBAC enforced at API guard.
  - Chọn vai trò ban đầu (`RoleSelection`): Sinh viên (`student`) hoặc Chủ trọ (`landlord`).
  - Đăng nhập linh hoạt: Hỗ trợ Số điện thoại hoặc Email kèm Mật khẩu.
  - Định danh thiết bị: Tự động phát hiện `deviceId` và `deviceName` gửi kèm `LoginPayload` để backend lưu vết session thiết bị.
  - Quản lý phiên & Token: Lưu `accessToken`, `refreshToken`, `user`, `role` an toàn trong `expo-secure-store`.
  - Đăng xuất (`logout`): Gửi refresh token và deviceId lên server để thu hồi (`is_revoked = true`), dọn sạch SecureStore và reset stack về màn hình Login.
  - Xác thực OTP (`OtpVerification`): Nhập mã 6 chữ số, thời hạn 5 phút, bộ đếm ngược 60 giây cho phép gửi lại mã hoặc đổi số điện thoại.
  - Chủ trọ mới ở trạng thái "Chờ xác minh": luồng đăng tin hiển thị màn xác minh (CCCD/CMND) thay cho form; mục "Xác minh tài khoản Chủ trọ" ở Cá nhân.
  - Quên mật khẩu & Đặt lại mật khẩu (`ForgotPassword`, `ResetPassword`): Nhập SĐT -> Nhập OTP -> Đặt mật khẩu mới (tối thiểu 8 ký tự, có chữ số và chữ hoa). Schema Zod tiếng Việt đồng bộ.
- **Listing Management (`FR-LISTING`, `FR-MANAGE`)**:
  - Landlord creates listing -> status defaults to `pending` -> Admin approves -> `active`.
  - Chủ trọ thiết lập lịch xem phòng theo buổi cho từng ngày trong tuần; lịch được giữ nguyên khi mở lại luồng chỉnh sửa.
  - Media: chỉ ảnh jpg/png ≤5MB (kiểm tra ngay trên giao diện), upload lên Cloudflare R2 qua presigned URL (hiệu lực 5 phút); database stores object keys while backend resolves public URLs for clients. Soft delete: 90 days retention.
- **Search & Compare (`FR-SEARCH`, `FR-COMPARE`)**:
  - Tab Tìm trọ gọi `GET /listings/search` (không còn dữ liệu giả): danh sách / lưới / bản đồ, lọc giá-diện tích-loại phòng-tiện ích-trường-bán kính, sắp xếp mặc định theo mức độ phù hợp, cuộn vô hạn, màn rỗng kèm gợi ý mở rộng bán kính. Bộ lọc được giữ khi quay lại từ trang chi tiết.
  - Phòng đã lưu đồng bộ với server (`/listings/favorites`), màn "Phòng đã lưu" ở mục Cá nhân; danh mục nổi bật ở Trang chủ áp bộ lọc tương ứng.
  - Trang chi tiết (`ListingDetail`): thanh hành động Nhắn tin / Đặt lịch xem / Giữ chỗ, trạng thái "Đang giữ chỗ" kèm ngày hết hạn, lưu, chia sẻ, báo cáo tin, xem toàn bộ tiện ích và ảnh toàn màn hình; mọi tin hiển thị theo `availability` từ server.
  - Spatial radius via PostGIS (`ST_DWithin`) around university.
  - Multi-filter: Price range, room type, amenities, distance. Sort: price, newest, nearest.
  - Compare matrix: tối đa 4 phòng đồng thời (chỉ lưu phía client); khoảng cách tính theo trường/vị trí đã chọn ở bộ lọc.
- **Booking / Holding (`FR-BOOKING`)**:
  - Statuses: `pending` -> `confirmed` / `rejected` / `expired` / `cancelled`; `confirmed` -> `holding` / `cancelled`; `holding` -> `expired` / `cancelled`.
  - Luồng Sinh viên: chi tiết phòng -> Đặt lịch xem -> Lịch hẹn của tôi (4 tab: Chờ, Đã xác nhận, Hết hạn, Đã hủy; thẻ có Nhắn tin / Hủy yêu cầu và đếm ngược) -> Giữ chỗ chỉ khả dụng khi lịch đã được xác nhận và đã đến giờ xem.
  - Luồng Chủ trọ: tab Lịch hẹn liệt kê yêu cầu của các tin mình đăng; Xác nhận, Từ chối (bắt buộc lý do), Hủy giữ chỗ (bắt buộc lý do).
  - Auto-expire bằng cron backend: yêu cầu `pending` hết hạn sau 24 giờ; `holding` theo `HOLDING_DAYS` (mặc định 7 ngày). Client polling 15-30 giây.
  - Hủy trước giờ xem dưới 24 giờ bắt buộc nhập lý do.
- **Realtime Chat (`FR-CHAT`)**:
  - 1-1 conversation bound to a listing. WebSocket connection.
  - Media attachment via R2 presigned URLs (folder `chat/`, tối đa 10 ảnh/tin; tin nhiều ảnh hiển thị dạng lưới như Messenger, không có nền bong bóng, từ ảnh thứ 6 trở đi gộp thành ô "+N"). Push notification when recipient is offline.
  - Màn hình: `Messages` (danh sách hội thoại, lọc Tất cả/Chưa đọc, trạng thái rỗng), `ChatRoom` (khung chat ghim tin đăng, trạng thái đã đọc, thu hồi/sao chép tin qua long press), `ChatImagePreview` (xem trước ảnh + chú thích trước khi gửi).
  - Danh sách hội thoại tải từng trang 20 mục khi cuộn; tìm kiếm gọi API (`keyword`, debounce 400ms), không lọc phía client. Mở đoạn chat mới tải 30 tin đầu, kéo lên để tải tiếp.
  - Nhấn giữ tin: Sao chép; tin của mình có thêm Thu hồi (không có chỉnh sửa theo SRS). Xoá đoạn chat bằng nhấn giữ trong danh sách hoặc menu ⋮ ở đầu khung chat (chỉ xoá phía mình).
  - Offline: tin nhắn soạn dở và tin chờ gửi được lưu bằng AsyncStorage (`chatStore`), gửi lại tự động khi có mạng, chống trùng nhờ `clientMessageId`. Tin gửi lỗi hiển thị nút "Thử lại".
  - Điểm vào từ trang chi tiết phòng và thẻ lịch hẹn: `useOpenListingChat().openChat(listingId)` (tạo hoặc mở lại hội thoại rồi vào `ChatRoom`).
- **Community Forum (`FR-FORUM`)**:
  - Categories (roommate search, neighborhood tips, Q&A).
  - Client & backend profanity filter before publish. Auto-hide when report threshold reached.
  - Screens (`@features/forum`): `Community` (feed theo chuyên mục, infinite scroll 10 bài/trang, bộ lọc ở ghép Nữ/Nam/Dưới 1,5tr/Còn chỗ), `ForumPostDetail` (chi tiết, like, bình luận trả lời 1 cấp), `ForumPostComposer` (đăng/sửa bài, lưu nháp, tối đa 10 ảnh upload R2 thư mục `forum`).
  - Trước khi đăng, app gọi `POST /forum/moderation/check` và hiện popup cảnh báo (quay lại sửa / tự động xoá phần vi phạm / vẫn đăng nếu chỉ là cảnh báo).
  - Báo cáo gửi `entityType` (`forum_post` | `forum_comment`) + `entityId`, `forumService.report` ánh xạ sang đúng endpoint của bài hoặc bình luận.
  - Điểm vào: danh mục "Tìm ở ghép" ở Trang chủ, mục "Bài viết & bình luận" ở Cá nhân.
- **Verified Review (`FR-REVIEW`)**:
  - 1 student reviews 1 listing 1 time (1-5 stars on cleanliness, security, landlord, price).
  - Landlord can reply publicly once.
- **Notification Center (`FR-NOTIFY`)**:
  - In-app list + Push notifications (FCM). Channels: booking, chat, listing updates, forum.
- **Payment Sandbox (`FR-PAYMENT`, `FR-PREMIUM`)**:
  - VNPay / MoMo Sandbox for deposits & landlord Premium boost.
  - Webhook + query reconciliation. NEVER store card numbers or CVV.
- **AI Capabilities (`FR-AICHAT`, `FR-AIRECOMM`)**:
  - AI Chatbot: RAG pipeline over active listings via `pgvector` embeddings. Must cite real listing links.
  - AI Recommendation: Implicit user tracking (view, search, save) -> user vector -> personalized home feed.

## 3. Strict Out of Scope (DO NOT BUILD)

- Legally binding electronic contracts / digital signatures.
- Real production payment processing (sandbox only).
- Complex AI duplicate / fraud detection algorithms.
- In-depth accounting / bookkeeping tools for landlords.

## 4. Non-Functional Constraints (SLOs)

- Search P95 <= 1.5s (>= 5,000 listings).
- Detail page load <= 2s on 4G. Chat latency <= 1s. Push noti <= 10s.
- HTTPS/TLS 1.2+ mandatory. Passwords hashed with bcrypt/argon2.
