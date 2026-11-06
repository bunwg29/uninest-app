export type PremiumPlanCode = '1m' | '3m' | '6m';

export interface PremiumPlan {
  code: PremiumPlanCode;
  name: string;
  months: number;
  price: number;
}

export interface PremiumStatus {
  isPremium: boolean;
  expiresAt: string | null;
  daysRemaining: number;
}

export type PremiumOrderStatus = 'pending' | 'paid' | 'expired';

export interface PremiumOrder {
  id: string;
  planCode: PremiumPlanCode;
  months: number;
  amount: number;
  status: PremiumOrderStatus;
  referenceCode: string;
  expiresAt: string;
  paidAt: string | null;
  qrUrl: string;
  bankAccount: string | null;
  bankCode: string | null;
  accountName: string | null;
}

export type PremiumStatsPeriod = '7d' | '30d' | '90d';

export type PremiumViewSource =
  'search' | 'home' | 'map' | 'favorites' | 'recommendation' | 'other';

export interface PremiumDailyStat {
  date: string;
  views: number;
  contacts: number;
}

export interface PremiumSourceStat {
  source: PremiumViewSource;
  views: number;
  ratio: number;
}

export interface PremiumStats {
  period: PremiumStatsPeriod;
  since: string;
  totalViews: number;
  totalContacts: number;
  conversionRate: number;
  daily: PremiumDailyStat[];
  sources: PremiumSourceStat[];
}

export const PREMIUM_STATS_PERIOD_OPTIONS: ReadonlyArray<{
  value: PremiumStatsPeriod;
  label: string;
}> = [
  { value: '7d', label: '7 ngày' },
  { value: '30d', label: '30 ngày' },
  { value: '90d', label: '90 ngày' },
];

export const PREMIUM_SOURCE_LABELS: Record<PremiumViewSource, string> = {
  search: 'Tìm kiếm',
  home: 'Trang chủ',
  map: 'Bản đồ',
  favorites: 'Phòng đã lưu',
  recommendation: 'Gợi ý cho bạn',
  other: 'Khác',
};

export const PREMIUM_BENEFITS: readonly string[] = [
  'Tin đăng được ưu tiên hiển thị ở đầu kết quả tìm kiếm phù hợp',
  'Gắn nhãn "Nổi bật" trên thẻ tin đăng',
  'Thống kê nâng cao: lượt xem theo thời gian, nguồn truy cập, tỉ lệ liên hệ',
  'Nhắc gia hạn trước khi gói hết hạn',
];
