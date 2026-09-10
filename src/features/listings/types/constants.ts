import type { DayKey } from './index';

export const ROOM_TYPE_OPTIONS = [
  { label: 'Phòng trọ', value: 'phong_tro' },
  { label: 'Nhà nguyên căn', value: 'nha_nguyen_can' },
  { label: 'Chung cư mini', value: 'chung_cu_mini' },
  { label: 'Ký túc xá', value: 'ky_tuc_xa' },
  { label: 'Studio', value: 'studio' },
  { label: 'Căn hộ dịch vụ', value: 'can_ho_dich_vu' },
] as const;

export const MAX_LISTING_IMAGES = 10;

export const LISTING_FORM_STEPS = ['Thông tin', 'Ảnh', 'Vị trí', 'Tiện ích', 'Lịch xem'] as const;

export const DAYS_OF_WEEK: { key: DayKey; label: string }[] = [
  { key: 'mon', label: 'T2' },
  { key: 'tue', label: 'T3' },
  { key: 'wed', label: 'T4' },
  { key: 'thu', label: 'T5' },
  { key: 'fri', label: 'T6' },
  { key: 'sat', label: 'T7' },
  { key: 'sun', label: 'CN' },
];

export const VIEWING_SLOT_LABELS = [
  { key: 'morning', label: 'Sáng' },
  { key: 'afternoon', label: 'Chiều' },
  { key: 'evening', label: 'Tối' },
] as const;

export const AMENITY_DISPLAY_LIST = [
  { group: 'Nội thất', name: 'Điều hòa' },
  { group: 'Nội thất', name: 'Tủ lạnh' },
  { group: 'Nội thất', name: 'Máy giặt chung' },
  { group: 'Nội thất', name: 'Gác lửng' },
  { group: 'Nội thất', name: 'Nội thất cơ bản' },
  { group: 'Tiện ích', name: 'WiFi miễn phí' },
  { group: 'Tiện ích', name: 'Chỗ để xe' },
  { group: 'Tiện ích', name: 'Bếp chung' },
  { group: 'Tiện ích', name: 'Sân phơi' },
  { group: 'Tiện ích', name: 'Ban công' },
  { group: 'An ninh', name: 'Camera an ninh' },
  { group: 'An ninh', name: 'Bảo vệ 24/7' },
  { group: 'An ninh', name: 'Khóa cửa điện tử' },
  { group: 'Phòng', name: 'WC riêng' },
  { group: 'Phòng', name: 'Cửa sổ lớn' },
  { group: 'Phòng', name: 'Thang máy' },
] as const;

export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
