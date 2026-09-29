import type { ChatLastMessage, Conversation } from '../types';

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;

const pad = (value: number) => String(value).padStart(2, '0');

const isSameDay = (first: Date, second: Date) =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();

const getYesterday = (reference: Date) => {
  const yesterday = new Date(reference);

  yesterday.setDate(yesterday.getDate() - 1);

  return yesterday;
};

export const formatClockTime = (iso: string): string => {
  const date = new Date(iso);

  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const formatConversationTime = (iso: string, now: Date = new Date()): string => {
  const date = new Date(iso);

  if (isSameDay(date, now)) {
    return formatClockTime(iso);
  }

  if (isSameDay(date, getYesterday(now))) {
    return 'Hôm qua';
  }

  const dayMonth = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}`;

  return date.getFullYear() === now.getFullYear()
    ? dayMonth
    : `${dayMonth}/${String(date.getFullYear()).slice(-2)}`;
};

export const formatDayLabel = (iso: string, now: Date = new Date()): string => {
  const date = new Date(iso);

  if (isSameDay(date, now)) {
    return 'Hôm nay';
  }

  if (isSameDay(date, getYesterday(now))) {
    return 'Hôm qua';
  }

  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
};

export const isSameCalendarDay = (firstIso: string, secondIso: string): boolean =>
  isSameDay(new Date(firstIso), new Date(secondIso));

export const formatPresence = (
  isOnline: boolean,
  lastSeenAt: string | null,
  now: Date = new Date()
): string => {
  if (isOnline) {
    return 'Đang hoạt động';
  }

  if (!lastSeenAt) {
    return 'Ngoại tuyến';
  }

  const elapsed = Math.max(0, now.getTime() - new Date(lastSeenAt).getTime());

  if (elapsed < MINUTE_MS) {
    return 'Vừa hoạt động';
  }

  if (elapsed < HOUR_MS) {
    return `Hoạt động ${Math.floor(elapsed / MINUTE_MS)} phút trước`;
  }

  if (elapsed < 24 * HOUR_MS) {
    return `Hoạt động ${Math.floor(elapsed / HOUR_MS)} giờ trước`;
  }

  return 'Ngoại tuyến';
};

export const getListingStatusLabel = (status: string): string => {
  if (status === 'active') return 'Còn trống';

  if (status === 'rented') return 'Đã cho thuê';

  return 'Tạm ngừng hiển thị';
};

export const getLastMessagePreview = (lastMessage: ChatLastMessage): string => {
  if (lastMessage.isRecalled) {
    return 'Tin nhắn đã được thu hồi';
  }

  if (lastMessage.type === 'image') {
    return lastMessage.content?.trim() || `Đã gửi ${lastMessage.imageCount} ảnh`;
  }

  return lastMessage.content ?? '';
};

export const matchesConversationSearch = (conversation: Conversation, keyword: string): boolean => {
  const normalized = keyword.trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  return (
    conversation.counterpart.fullName.toLowerCase().includes(normalized) ||
    conversation.listing.title.toLowerCase().includes(normalized)
  );
};
