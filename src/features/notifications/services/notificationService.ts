import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient, unwrapApiData } from '@core';
import type {
  NotificationFilter,
  NotificationPreferences,
  NotificationsPage,
  PushPlatform,
} from '../types';

const REGISTERED_DEVICE_KEY = 'uninest:registered-push-device';

export const notificationService = {
  async list(page: number, filter: NotificationFilter = {}): Promise<NotificationsPage> {
    const response = await apiClient.get('/notifications', {
      params: { page, limit: 20, type: filter.type, unread: filter.unread || undefined },
    });

    return unwrapApiData<NotificationsPage>(response.data);
  },

  async unreadCount(): Promise<number> {
    const response = await apiClient.get('/notifications/unread-count');

    return unwrapApiData<{ count: number }>(response.data).count;
  },

  async markRead(id: string): Promise<void> {
    await apiClient.patch(`/notifications/${id}/read`);
  },

  async markUnread(id: string): Promise<void> {
    await apiClient.patch(`/notifications/${id}/unread`);
  },

  async markAllRead(): Promise<void> {
    await apiClient.patch('/notifications/read-all');
  },

  async getPreferences(): Promise<NotificationPreferences> {
    const response = await apiClient.get('/notifications/preferences');

    return unwrapApiData<NotificationPreferences>(response.data);
  },

  async updatePreferences(
    value: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    const response = await apiClient.patch('/notifications/preferences', value);

    return unwrapApiData<NotificationPreferences>(response.data);
  },

  async registerDevice(token: string, platform: PushPlatform): Promise<void> {
    await apiClient.post('/notifications/devices', { token, platform });
    await AsyncStorage.setItem(REGISTERED_DEVICE_KEY, JSON.stringify({ token, platform }));
  },

  async unregisterDevice(token: string, platform: PushPlatform): Promise<void> {
    await apiClient.delete('/notifications/devices', { data: { token, platform } });
    await AsyncStorage.removeItem(REGISTERED_DEVICE_KEY);
  },

  async unregisterCurrentDevice(): Promise<void> {
    const stored = await AsyncStorage.getItem(REGISTERED_DEVICE_KEY);

    if (!stored) return;

    const device: unknown = JSON.parse(stored);

    if (
      typeof device !== 'object' ||
      device === null ||
      !('token' in device) ||
      typeof device.token !== 'string' ||
      !('platform' in device) ||
      (device.platform !== 'android' && device.platform !== 'ios')
    ) {
      await AsyncStorage.removeItem(REGISTERED_DEVICE_KEY);

      return;
    }

    await this.unregisterDevice(device.token, device.platform);
  },
};
