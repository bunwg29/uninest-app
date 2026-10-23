const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;

const pad = (value: number) => String(value).padStart(2, '0');

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

const dayDiff = (date: Date, now: Date) =>
  Math.round((startOfDay(now) - startOfDay(date)) / (24 * HOUR_MS));

export type NotificationSection = 'today' | 'yesterday' | 'earlier';

export const NOTIFICATION_SECTION_LABELS: Record<NotificationSection, string> = {
  today: 'Hôm nay',
  yesterday: 'Hôm qua',
  earlier: 'Trước đó',
};

export const getNotificationSection = (value: string, now = new Date()): NotificationSection => {
  const diff = dayDiff(new Date(value), now);

  if (diff <= 0) return 'today';

  if (diff === 1) return 'yesterday';

  return 'earlier';
};

export const formatNotificationTime = (value: string, now = new Date()) => {
  const date = new Date(value);
  const elapsed = now.getTime() - date.getTime();
  const clock = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  const diff = dayDiff(date, now);

  if (diff <= 0) {
    if (elapsed < MINUTE_MS) return 'Vừa xong';

    if (elapsed < HOUR_MS) return `${Math.floor(elapsed / MINUTE_MS)} phút trước`;

    return `${Math.floor(elapsed / HOUR_MS)} giờ trước`;
  }

  if (diff === 1) return `Hôm qua · ${clock}`;

  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)} · ${clock}`;
};
