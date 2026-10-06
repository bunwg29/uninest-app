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
  { id: 1, group: 'Nội thất', name: 'Điều hòa' },
  { id: 2, group: 'Nội thất', name: 'Tủ lạnh' },
  { id: 3, group: 'Nội thất', name: 'Máy giặt chung' },
  { id: 4, group: 'Nội thất', name: 'Gác lửng' },
  { id: 5, group: 'Nội thất', name: 'Nội thất cơ bản' },
  { id: 6, group: 'Tiện ích', name: 'WiFi miễn phí' },
  { id: 7, group: 'Tiện ích', name: 'Chỗ để xe' },
  { id: 8, group: 'Tiện ích', name: 'Bếp chung' },
  { id: 9, group: 'Tiện ích', name: 'Sân phơi' },
  { id: 10, group: 'Tiện ích', name: 'Ban công' },
  { id: 11, group: 'An ninh', name: 'Camera an ninh' },
  { id: 12, group: 'An ninh', name: 'Bảo vệ 24/7' },
  { id: 13, group: 'An ninh', name: 'Khóa cửa điện tử' },
  { id: 14, group: 'Phòng', name: 'WC riêng' },
  { id: 15, group: 'Phòng', name: 'Cửa sổ lớn' },
  { id: 16, group: 'Phòng', name: 'Thang máy' },
] as const;

export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png'] as const;
