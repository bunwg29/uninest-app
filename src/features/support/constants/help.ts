import { CreditCard, House, Search, ShieldCheck } from 'lucide-react-native';
import { THEME_COLORS } from '@theme';
import type { HelpArticle, HelpTopic } from '../types';

export const SUPPORT_EMAIL = 'hotro@uninest.vn';

export const SCAM_REPORT_SUBJECT = 'Báo cáo lừa đảo';

export const HELP_TOPICS: HelpTopic[] = [
  {
    id: 'search',
    label: 'Tìm kiếm & đặt lịch',
    icon: Search,
    color: THEME_COLORS.PRIMARY,
    background: THEME_COLORS.PRIMARY_LIGHT,
  },
  {
    id: 'deposit',
    label: 'Tiền cọc & an toàn',
    icon: CreditCard,
    color: THEME_COLORS.SUCCESS,
    background: THEME_COLORS.SUCCESS_LIGHT,
  },
  {
    id: 'account',
    label: 'Tài khoản & bảo mật',
    icon: ShieldCheck,
    color: THEME_COLORS.WARNING,
    background: THEME_COLORS.WARNING_LIGHT,
  },
  {
    id: 'landlord',
    label: 'Dành cho chủ trọ',
    icon: House,
    color: THEME_COLORS.TEXT_MUTED,
    background: THEME_COLORS.SURFACE_MUTED,
  },
];

export const HELP_ARTICLES: HelpArticle[] = [
  {
    id: 'deposit-offline',
    topicId: 'deposit',
    isFeatured: true,
    question: 'Đặt cọc và giữ phòng trên UniNest thế nào?',
    answer:
      'UniNest không nhận đặt cọc hay giữ phòng. Sau khi đặt lịch và đi xem phòng, bạn và chủ trọ tự thoả thuận tiền cọc, hợp đồng và ngày dọn vào trực tiếp với nhau.',
  },
  {
    id: 'landlord-no-response',
    topicId: 'search',
    isFeatured: true,
    question: 'Chủ trọ không phản hồi yêu cầu xem phòng thì sao?',
    answer:
      'Yêu cầu xem phòng tự hết hạn nếu chủ trọ không xác nhận trước giờ hẹn. Bạn có thể nhắn tin trực tiếp cho chủ trọ hoặc đặt lịch với phòng khác — yêu cầu cũ không ảnh hưởng tới các lịch mới.',
  },
  {
    id: 'listing-authenticity',
    topicId: 'search',
    isFeatured: true,
    question: 'Làm sao biết tin đăng là thật?',
    answer:
      'Ưu tiên tin có huy hiệu "Đã xác minh" — chủ trọ đã xác thực danh tính với UniNest. Hãy xem phòng trực tiếp trước khi cọc, không chuyển tiền cho người chưa gặp và luôn yêu cầu giấy biên nhận hoặc hợp đồng.',
  },
  {
    id: 'ai-source',
    topicId: 'search',
    isFeatured: true,
    question: 'Trợ lý AI lấy thông tin phòng từ đâu?',
    answer:
      'Trợ lý AI chỉ trả lời dựa trên các tin đăng đang hiển thị trên UniNest và tiêu chí bạn đã nhập. Thông tin giá, tiện ích luôn lấy từ tin đăng gốc, vì vậy hãy mở chi tiết phòng để kiểm tra lại trước khi quyết định.',
  },
  {
    id: 'dual-role',
    topicId: 'account',
    isFeatured: true,
    question: 'Tôi muốn vừa thuê vừa cho thuê được không?',
    answer:
      'Hiện mỗi tài khoản gắn với một vai trò. Nếu bạn vừa là sinh viên vừa có phòng cho thuê, hãy đăng ký thêm một tài khoản chủ trọ bằng số điện thoại hoặc email khác.',
  },
  {
    id: 'search-near-school',
    topicId: 'search',
    question: 'Làm sao tìm phòng gần trường của tôi?',
    answer:
      'Tại màn Tìm trọ, chọn bộ lọc Trường và chọn một hoặc nhiều trường. Kết quả được sắp theo khoảng cách tới trường, bạn cũng có thể chuyển sang chế độ bản đồ để xem vị trí trực quan.',
  },
  {
    id: 'save-compare',
    topicId: 'search',
    question: 'Làm sao so sánh nhiều phòng cùng lúc?',
    answer:
      'Nhấn biểu tượng trái tim để lưu phòng, sau đó vào Phòng đã lưu và chọn So sánh. Bạn có thể so sánh tối đa 3 phòng theo giá, diện tích, chi phí điện nước và tiện ích.',
  },
  {
    id: 'reschedule',
    topicId: 'search',
    question: 'Tôi muốn đổi giờ xem phòng đã đặt?',
    answer:
      'Mở Lịch hẹn của tôi, huỷ lịch hiện tại và đặt lại khung giờ mới. Nếu lịch đã được chủ trọ xác nhận, hãy nhắn tin báo trước để chủ trọ sắp xếp.',
  },
  {
    id: 'viewing-limit',
    topicId: 'search',
    question: 'Tôi được đặt bao nhiêu lịch xem phòng cùng lúc?',
    answer:
      'Bạn có thể giữ nhiều lịch xem với các phòng khác nhau, nhưng mỗi phòng chỉ có một lịch đang chờ hoặc đã xác nhận tại một thời điểm.',
  },
  {
    id: 'price-filter',
    topicId: 'search',
    question: 'Bộ lọc giá có tính cả tiền điện nước không?',
    answer:
      'Bộ lọc giá chỉ tính tiền phòng hằng tháng. Chi phí điện, nước, dịch vụ được ghi riêng trong chi tiết tin đăng để bạn tự cộng tổng chi phí.',
  },
  {
    id: 'deposit-amount',
    topicId: 'deposit',
    question: 'Tiền cọc được tính như thế nào?',
    answer:
      'Mức cọc do chủ trọ ghi trong tin đăng, thường bằng một tháng tiền phòng. Bạn trả cọc trực tiếp cho chủ trọ khi hai bên đã thống nhất, nên hãy hỏi rõ điều kiện hoàn cọc trước.',
  },
  {
    id: 'forgot-password',
    topicId: 'account',
    question: 'Tôi quên mật khẩu thì làm sao?',
    answer:
      'Tại màn Đăng nhập, chọn Quên mật khẩu và nhập số điện thoại hoặc email đã đăng ký. Mã OTP sẽ được gửi tới để bạn đặt mật khẩu mới.',
  },
  {
    id: 'change-contact',
    topicId: 'account',
    question: 'Làm sao đổi số điện thoại hoặc email?',
    answer:
      'Vào Hồ sơ, chọn Chỉnh sửa và nhấn vào số điện thoại hoặc email. Bạn cần xác minh bằng mã OTP gửi tới thông tin mới trước khi thay đổi có hiệu lực.',
  },
  {
    id: 'delete-account',
    topicId: 'account',
    question: 'Tôi muốn xoá tài khoản?',
    answer:
      'Gửi yêu cầu từ email đăng ký về hotro@uninest.vn. Tài khoản và dữ liệu cá nhân được xoá trong vòng 30 ngày, các lịch hẹn đang diễn ra sẽ được huỷ.',
  },
  {
    id: 'landlord-verification',
    topicId: 'landlord',
    question: 'Vì sao tôi cần xác minh tài khoản chủ trọ?',
    answer:
      'Xác minh giúp sinh viên tin tưởng tin đăng của bạn hơn và là điều kiện để tin đăng hiển thị huy hiệu "Đã xác minh". Hồ sơ thường được duyệt trong vòng 1 ngày làm việc.',
  },
  {
    id: 'landlord-listing-review',
    topicId: 'landlord',
    question: 'Tin đăng của tôi bị từ chối?',
    answer:
      'Lý do từ chối được ghi trong chi tiết tin đăng. Thường gặp nhất là ảnh không rõ, giá hoặc địa chỉ không khớp mô tả. Hãy chỉnh sửa và gửi lại để được duyệt.',
  },
  {
    id: 'landlord-multiple-areas',
    topicId: 'landlord',
    question: 'Tôi có nhiều phòng ở các khu vực khác nhau?',
    answer:
      'Mỗi tin đăng có địa chỉ và danh sách trường lân cận riêng. Bạn có thể chọn tối đa 3 trường cho từng tin để sinh viên các trường đó dễ tìm thấy.',
  },
  {
    id: 'landlord-mark-rented',
    topicId: 'landlord',
    question: 'Phòng đã cho thuê thì làm gì với tin đăng?',
    answer:
      'Mở tin đăng trong mục Tin của tôi và chọn Đánh dấu đã cho thuê. Tin sẽ ngừng hiển thị trong kết quả tìm kiếm nhưng vẫn được lưu để bạn đăng lại khi phòng trống.',
  },
];
