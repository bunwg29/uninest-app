export const formatNumberWithDots = (value: string | number | undefined | null): string => {
  if (value === undefined || value === null || value === '') return '';

  const digitsOnly = String(value).replace(/\D/g, '');

  if (!digitsOnly) return '';

  return digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const parseRawNumberString = (value: string | undefined | null): string => {
  if (!value) return '';

  return value.replace(/\D/g, '');
};

export const formatVND = (value: string | number | undefined | null): string => {
  if (!value) return '0 ₫';

  const raw = typeof value === 'string' ? parseRawNumberString(value) : value;
  const num = Number(raw);

  if (isNaN(num) || num === 0) return '0 ₫';

  return `${num.toLocaleString('vi-VN')} ₫`;
};
