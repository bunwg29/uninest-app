import type { LegalDocument, LegalTab } from '../types';

export const LEGAL_UPDATED_AT = '04/09/2026';

export const LEGAL_TABS: LegalTab[] = ['privacy', 'terms'];

export const LEGAL_DOCUMENTS: Record<LegalTab, LegalDocument> = {
  privacy: {
    tab: 'privacy',
    label: 'Quyền riêng tư',
    shareUrl: 'https://uninest.vn/quyen-rieng-tu',
    summary:
      'Tóm tắt: chúng tôi thu thập tối thiểu thông tin để bạn tìm và thuê được phòng, không bán dữ liệu, và bạn xoá được bất cứ lúc nào.',
    sections: [
      {
        title: '1. Dữ liệu chúng tôi thu thập',
        body: 'Họ tên, số điện thoại, email và trường đang học do bạn cung cấp. Vị trí thiết bị chỉ được đọc khi ứng dụng đang mở và bạn đã cho phép, dùng để tính khoảng cách tới phòng trọ.',
      },
      {
        title: '2. Cách dữ liệu được sử dụng',
        body: 'Lịch sử tìm kiếm, phòng đã xem và phòng đã lưu được dùng để gợi ý tin đăng phù hợp trên trang chủ. Gợi ý chỉ dựa trên hành vi của chính bạn, không đối chiếu chéo với dữ liệu người dùng khác.',
      },
      {
        title: '3. Chia sẻ với bên thứ ba',
        body: 'Chúng tôi không bán dữ liệu cá nhân. Số điện thoại chỉ hiển thị cho chủ trọ sau khi bạn chủ động nhắn tin hoặc gửi yêu cầu xem phòng. Bản đồ, gửi OTP, thông báo đẩy và cổng thanh toán do đối tác cung cấp và chỉ nhận dữ liệu tối thiểu cần thiết.',
      },
      {
        title: '4. Thanh toán',
        body: 'Mọi giao dịch đặt cọc được xử lý qua cổng thanh toán đối tác trong môi trường sandbox. UniNest không lưu trữ số thẻ hay thông tin tài khoản ngân hàng của bạn.',
      },
      {
        title: '5. Lưu trữ và thời hạn',
        body: 'Dữ liệu tài khoản được lưu trên máy chủ đặt tại Việt Nam trong suốt thời gian bạn sử dụng dịch vụ. Lịch sử xem phòng gần đây chỉ lưu trên thiết bị của bạn. Tin nhắn và lịch hẹn được giữ tối đa 24 tháng kể từ lần tương tác cuối để phục vụ giải quyết tranh chấp.',
      },
      {
        title: '6. Quyền của bạn',
        body: 'Bạn có thể xem, chỉnh sửa thông tin cá nhân trong mục Hồ sơ, tắt quyền vị trí trong cài đặt thiết bị và yêu cầu xoá tài khoản bất cứ lúc nào. Yêu cầu xoá được xử lý trong vòng 30 ngày, trừ các dữ liệu pháp luật yêu cầu lưu giữ.',
      },
      {
        title: '7. Bảo mật',
        body: 'Mật khẩu được mã hoá một chiều, phiên đăng nhập dùng mã truy cập có thời hạn và mọi kết nối đều qua HTTPS. Nếu phát hiện truy cập bất thường, chúng tôi sẽ đăng xuất các phiên đang mở và thông báo cho bạn qua email.',
      },
      {
        title: '8. Liên hệ',
        body: 'Mọi câu hỏi về quyền riêng tư, vui lòng gửi về hotro@uninest.vn. Chúng tôi phản hồi trong vòng 3 ngày làm việc.',
      },
    ],
  },
  terms: {
    tab: 'terms',
    label: 'Điều khoản',
    shareUrl: 'https://uninest.vn/dieu-khoan',
    summary:
      'Tóm tắt: UniNest là nền tảng kết nối sinh viên và chủ trọ. Thông tin đăng tải phải trung thực, giao dịch cọc tuân theo chính sách hoàn tiền 24 giờ.',
    sections: [
      {
        title: '1. Phạm vi dịch vụ',
        body: 'UniNest giúp sinh viên tìm phòng trọ gần trường, nhắn tin và đặt lịch xem phòng với chủ trọ. UniNest không phải là bên cho thuê và không trực tiếp sở hữu hay quản lý bất kỳ phòng trọ nào.',
      },
      {
        title: '2. Tài khoản',
        body: 'Bạn cần cung cấp số điện thoại hoặc email hợp lệ và chịu trách nhiệm bảo mật mật khẩu của mình. Mỗi người chỉ sử dụng một tài khoản cho mỗi vai trò. Tài khoản chủ trọ cần xác minh danh tính trước khi đăng tin.',
      },
      {
        title: '3. Quy định đăng tin',
        body: 'Tin đăng phải mô tả đúng phòng thực tế: giá thuê, diện tích, chi phí điện nước, ảnh và vị trí. Nghiêm cấm đăng tin trùng lặp, tin ảo, ảnh lấy từ nguồn khác hoặc thu phí giữ chỗ ngoài ứng dụng.',
      },
      {
        title: '4. Đặt lịch và đặt cọc',
        body: 'Trong 24 giờ đầu kể từ khi đặt cọc thành công, sinh viên được huỷ và hoàn 100% tự động. Sau 24 giờ, việc hoàn cọc do hai bên tự thoả thuận theo hợp đồng thuê phòng.',
      },
      {
        title: '5. Hành vi bị cấm',
        body: 'Quấy rối, xúc phạm người dùng khác, chia sẻ nội dung phản cảm, lừa đảo hoặc dụ dỗ giao dịch ngoài nền tảng. Vi phạm có thể dẫn tới ẩn tin đăng, khoá tài khoản tạm thời hoặc vĩnh viễn.',
      },
      {
        title: '6. Giới hạn trách nhiệm',
        body: 'UniNest nỗ lực kiểm duyệt tin đăng nhưng không bảo đảm tuyệt đối về chất lượng phòng hay hành vi của các bên. Bạn nên xem phòng trực tiếp và đọc kỹ hợp đồng trước khi chuyển tiền.',
      },
      {
        title: '7. Thay đổi điều khoản',
        body: 'Khi điều khoản thay đổi, chúng tôi sẽ thông báo trong ứng dụng ít nhất 7 ngày trước ngày áp dụng. Việc tiếp tục sử dụng UniNest sau ngày đó đồng nghĩa với việc bạn chấp nhận điều khoản mới.',
      },
    ],
  },
};
