import { formatNumberWithDots } from '@core';
import { FORUM_AVATAR_TONES } from '../types';

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

export const parseDisplayDate = (displayDate: string): string | undefined => {
  const match = displayDate.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  if (!match) return undefined;

  const [, day, month, year] = match;

  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

export const formatCostPerPerson = (cost: number): string => `${formatNumberWithDots(cost)}đ/người`;

export const formatCompactMillion = (value: number): string =>
  `${(value / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}tr`;

export const getAvatarTone = (seed: string) => {
  const hash = [...seed].reduce((total, char) => total + char.charCodeAt(0), 0);

  return FORUM_AVATAR_TONES[hash % FORUM_AVATAR_TONES.length];
};

export const getInitials = (fullName: string): string => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (!parts.length) return '?';

  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

  return (parts[parts.length - 2].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};
