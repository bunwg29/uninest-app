export type NotificationType = 'listing' | 'message' | 'reminder' | 'system' | 'booking' | 'forum';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  payload: Record<string, string>;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationsPage {
  items: AppNotification[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

export interface NotificationPreferences {
  newListings: boolean;
  messages: boolean;
  reminders: boolean;
  system: boolean;
}

export type PushPlatform = 'android' | 'ios';

export interface NotificationFilter {
  type?: NotificationType;
  unread?: boolean;
}
