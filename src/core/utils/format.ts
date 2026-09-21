/**
 * Định dạng chuỗi hoặc số thành tiền tệ Việt Nam có dấu chấm phân cách hàng nghìn.
 * Ví dụ: '3000000' -> '3.000.000'
 */
export const formatNumberWithDots = (value: string | number | undefined | null): string => {
  if (value === undefined || value === null || value === '') return '';

  const digitsOnly = String(value).replace(/\D/g, '');

  if (!digitsOnly) return '';

  return digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/**
 * Lọc bỏ dấu chấm và ký tự đặc biệt, chỉ giữ lại các chữ số thô để lưu state/gửi API.
 * Ví dụ: '3.000.000' -> '3000000'
 */
export const parseRawNumberString = (value: string | undefined | null): string => {
  if (!value) return '';

  return value.replace(/\D/g, '');
};

/**
 * Định dạng tiền tệ hiển thị kèm đơn vị đ.
 * Ví dụ: 3000000 -> '3.000.000 đ'
 */
export const formatVND = (value: string | number | undefined | null): string => {
  if (!value) return '0 ₫';

  const raw = typeof value === 'string' ? parseRawNumberString(value) : value;
  const num = Number(raw);

  if (isNaN(num) || num === 0) return '0 ₫';

  return `${num.toLocaleString('vi-VN')} ₫`;
};
