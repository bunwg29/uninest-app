import { formatNumberWithDots } from '@core';

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export const formatRelativeTime = (isoDate: string | null | undefined): string => {
  if (!isoDate) return '';

  const elapsedMs = Date.now() - new Date(isoDate).getTime();

  if (elapsedMs < MINUTE_MS) return 'Vừa xong';

  if (elapsedMs < HOUR_MS) return `${Math.floor(elapsedMs / MINUTE_MS)} phút trước`;

  if (elapsedMs < DAY_MS) return `${Math.floor(elapsedMs / HOUR_MS)} giờ trước`;

  if (elapsedMs < 2 * DAY_MS) return 'Hôm qua';

  if (elapsedMs < 7 * DAY_MS) return `${Math.floor(elapsedMs / DAY_MS)} ngày trước`;

  return formatDisplayDate(isoDate.slice(0, 10));
};

export const formatDisplayDate = (isoDate: string | null | undefined): string => {
  if (!isoDate) return '';

  const [year, month, day] = isoDate.slice(0, 10).split('-');

  return year && month && day ? `${day}/${month}/${year}` : isoDate;
};

export const formatCostPerPerson = (cost: number): string => `${formatNumberWithDots(cost)}đ/người`;

export const formatCompactMillion = (value: number): string =>
  `${(value / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}tr`;
