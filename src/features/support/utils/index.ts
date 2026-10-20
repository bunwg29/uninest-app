const pad = (value: number) => String(value).padStart(2, '0');

const formatTime = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

const formatDate = (date: Date) =>
  `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;

const isSameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

export const formatExpectedEnd = (timestamp: number, now: Date = new Date()): string => {
  const date = new Date(timestamp);

  if (isSameDay(date, now)) return `${formatTime(date)} hôm nay`;

  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  if (isSameDay(date, tomorrow)) return `${formatTime(date)} ngày mai`;

  return `${formatTime(date)} ${formatDate(date)}`;
};

export const formatIncidentTime = (timestamp: number): string => {
  const date = new Date(timestamp);

  return `${formatDate(date)} ${formatTime(date)}`;
};
