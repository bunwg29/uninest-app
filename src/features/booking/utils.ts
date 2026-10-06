export const formatBookingDateTime = (value: string) =>
  new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));

export const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const getHoursUntil = (value: string) =>
  (new Date(value).getTime() - Date.now()) / 3_600_000;

const WEEKDAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export const formatCompactSlot = (value: string) => {
  const date = new Date(value);
  const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  const day = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;

  return `${time} · ${WEEKDAY_LABELS[date.getDay()]} ${day}`;
};

const BOOKING_TIME_ZONE = 'Asia/Ho_Chi_Minh';

const formatParts = (value: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('vi-VN', { timeZone: BOOKING_TIME_ZONE, ...options }).format(
    new Date(value)
  );

export const formatTime = (value: string) =>
  formatParts(value, { hour: '2-digit', minute: '2-digit', hour12: false });

export const formatFullDate = (value: string) =>
  formatParts(value, { day: '2-digit', month: '2-digit', year: 'numeric' });

export const formatTimelineStamp = (value: string) =>
  `${formatFullDate(value)} · ${formatTime(value)}`;

export const formatViewingSlot = (value: string) =>
  `${formatTime(value)} · ${formatParts(value, { weekday: 'long' })} ${formatFullDate(value)}`;

export const formatViewingShort = (value: string) =>
  `${formatTime(value)} ${formatParts(value, { weekday: 'long' })} ${formatParts(value, {
    day: '2-digit',
    month: '2-digit',
  })}`;

export const formatDayLabel = (dateKey: string) => {
  const date = new Date(`${dateKey}T12:00:00`);
  const weekday = new Intl.DateTimeFormat('vi-VN', { weekday: 'long' }).format(date);
  const day = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;

  return `${weekday} ${day}`;
};

export const formatViewingLong = (value: string) =>
  `${formatTime(value)} — ${formatParts(value, { weekday: 'long' })}, ${formatFullDate(value)}`;
