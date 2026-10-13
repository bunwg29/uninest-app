import type {
  ForumCategory,
  ForumReportReason,
  RoommateGender,
  RoommateLifestyle,
  RoommateLifestyleKey,
  RoommateStatus,
} from './index';

export const FORUM_PAGE_SIZE = 10;

export const FORUM_COMMENTS_PAGE_SIZE = 10;

export const FORUM_REPLIES_PAGE_SIZE = 5;

export const FORUM_MAX_IMAGES = 10;

export const FORUM_IMAGE_FOLDER = 'forum';

export const FORUM_VIDEO_FOLDER = 'forum';

export const FORUM_FEED_STALE_TIME_MS = 30_000;

export const FORUM_BUDGET_FILTER = 1_500_000;

export const FORUM_AREA_FILTER = 'Liên Chiểu';

export const FORUM_CATEGORY_OPTIONS: { value: ForumCategory; label: string; shortLabel: string }[] =
  [
    { value: 'roommate', label: 'Tìm bạn ở ghép', shortLabel: 'Ở GHÉP' },
    { value: 'experience', label: 'Kinh nghiệm thuê trọ', shortLabel: 'KINH NGHIỆM' },
    { value: 'question', label: 'Hỏi đáp', shortLabel: 'HỎI ĐÁP' },
    { value: 'area_review', label: 'Review khu vực', shortLabel: 'REVIEW' },
  ];

export const FORUM_COMPOSER_CATEGORY_LABELS: Record<ForumCategory, string> = {
  roommate: 'Tìm bạn ở ghép',
  experience: 'Kinh nghiệm',
  question: 'Hỏi đáp',
  area_review: 'Review khu vực',
};

export const ROOMMATE_GENDER_OPTIONS: { value: RoommateGender; label: string }[] = [
  { value: 'female', label: 'Nữ' },
  { value: 'male', label: 'Nam' },
  { value: 'any', label: 'Không quan trọng' },
];

export const ROOMMATE_LIFESTYLE_FIELDS: {
  key: RoommateLifestyleKey;
  label: string;
  options: { value: string; label: string }[];
}[] = [
  {
    key: 'smoking',
    label: 'HÚT THUỐC',
    options: [
      { value: 'no', label: 'Không hút thuốc' },
      { value: 'outside', label: 'Hút ngoài phòng' },
      { value: 'ok', label: 'Thoải mái' },
    ],
  },
  {
    key: 'tidiness',
    label: 'MỨC ĐỘ GỌN GÀNG',
    options: [
      { value: 'very_tidy', label: 'Rất gọn gàng' },
      { value: 'tidy', label: 'Gọn gàng' },
      { value: 'relaxed', label: 'Thoải mái' },
    ],
  },
  {
    key: 'bedtime',
    label: 'GIỜ ĐI NGỦ',
    options: [
      { value: 'before_23', label: 'Trước 23h' },
      { value: 'before_01', label: 'Trước 1h' },
      { value: 'flexible', label: 'Linh hoạt' },
    ],
  },
  {
    key: 'pets',
    label: 'THÚ CƯNG',
    options: [
      { value: 'no', label: 'Không nuôi thú cưng' },
      { value: 'ok', label: 'Chấp nhận thú cưng' },
    ],
  },
  {
    key: 'cooking',
    label: 'NẤU ĂN',
    options: [
      { value: 'often', label: 'Nấu thường xuyên' },
      { value: 'sometimes', label: 'Thỉnh thoảng' },
      { value: 'no', label: 'Không nấu' },
    ],
  },
];

export const getRoommateLifestyleLabels = (lifestyle: RoommateLifestyle): string[] =>
  ROOMMATE_LIFESTYLE_FIELDS.flatMap((field) => {
    const label = field.options.find((option) => option.value === lifestyle[field.key])?.label;

    return label ? [label] : [];
  });

export const ROOMMATE_STATUS_OPTIONS: { value: RoommateStatus; label: string }[] = [
  { value: 'open', label: 'Còn chỗ' },
  { value: 'full', label: 'Đã đủ' },
];

export const FORUM_REPORT_REASON_OPTIONS: { value: ForumReportReason; label: string }[] = [
  { value: 'scam', label: 'Lừa đảo, đòi cọc trước khi xem phòng' },
  { value: 'false_information', label: 'Thông tin sai sự thật' },
  { value: 'contact_information', label: 'Đăng số tài khoản / số điện thoại' },
  { value: 'harassment', label: 'Nội dung xúc phạm, quấy rối' },
  { value: 'spam', label: 'Spam, đăng trùng lặp nhiều lần' },
  { value: 'other', label: 'Lý do khác' },
];

export const FORUM_QUERY_KEYS = {
  ALL: ['forum'] as const,
  VIEWER: (viewerId: string) => ['forum', viewerId] as const,
  FEEDS: (viewerId: string) => ['forum', viewerId, 'feed'] as const,
  POST: (viewerId: string, postId: string) => ['forum', viewerId, 'post', postId] as const,
  COMMENTS: (viewerId: string, postId: string) => ['forum', viewerId, 'comments', postId] as const,
  REPLIES: (viewerId: string, postId: string, commentId: string) =>
    ['forum', viewerId, 'comments', postId, 'replies', commentId] as const,
};
