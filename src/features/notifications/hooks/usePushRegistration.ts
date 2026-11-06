import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import * as Device from 'expo-device';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@hooks';
import { navigationRef } from '@navigation/navigationRef';
import { useAuthStore } from '@features/auth';
import { notificationService } from '../services/notificationService';
import { NOTIFICATION_QUERY_KEY } from './useNotifications';

const openNotificationTarget = (data: Record<string, unknown>) => {
  if (!navigationRef.isReady()) return;

  if (data.screen === 'ChatRoom' && typeof data.conversationId === 'string') {
    navigationRef.navigate('ChatRoom', { conversationId: data.conversationId });
  } else if (data.screen === 'BookingDetail' && typeof data.bookingId === 'string') {
    navigationRef.navigate('BookingDetail', { id: data.bookingId });
  } else if (data.screen === 'ListingDetail' && typeof data.listingId === 'string') {
    if (useAuthStore.getState().role === 'landlord') {
      navigationRef.navigate('Main', { screen: 'Listings' });
    } else {
      navigationRef.navigate('ListingDetail', { id: data.listingId });
    }
  } else if (data.screen === 'ForumPostDetail' && typeof data.postId === 'string') {
    navigationRef.navigate('ForumPostDetail', { postId: data.postId });
  } else {
    navigationRef.navigate('Notifications');
  }
};

export const usePushRegistration = (userId: string | null) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  useEffect(() => {
    if (!userId || Platform.OS === 'web' || !Device.isDevice) return;

    let active = true;
    let hasShownError = false;

    const reportError = () => {
      if (active && !hasShownError) {
        hasShownError = true;
        toast.warning('Không thể bật thông báo đẩy. Bạn vẫn xem được thông báo trong ứng dụng.');
      }
    };

    let Notifications: typeof import('expo-notifications');

    try {
      Notifications = require('expo-notifications') as typeof import('expo-notifications');
    } catch {
      reportError();

      return;
    }

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });

    const register = async (requestPermission: boolean) => {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Thông báo UniNest',
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }

      const current = await Notifications.getPermissionsAsync();
      const permission =
        current.granted || !requestPermission
          ? current
          : await Notifications.requestPermissionsAsync();

      if (!permission.granted || !active) return;

      const projectId = process.env.EXPO_PUBLIC_EAS_PROJECT_ID;
      const token = await Notifications.getExpoPushTokenAsync(
        projectId ? { projectId } : undefined
      );

      if (active) {
        await notificationService.registerDevice(
          token.data,
          Platform.OS === 'ios' ? 'ios' : 'android'
        );
      }
    };

    void register(true).catch(reportError);

    const appState = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        void register(false).catch(reportError);
        void queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEY });
      }
    });
    const received = Notifications.addNotificationReceivedListener(() => {
      void queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEY });
    });
    const opened = Notifications.addNotificationResponseReceivedListener((response) => {
      openNotificationTarget(response.notification.request.content.data ?? {});
    });

    void Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (active && response)
          openNotificationTarget(response.notification.request.content.data ?? {});
      })
      .catch(reportError);

    return () => {
      active = false;
      appState.remove();
      received.remove();
      opened.remove();
    };
  }, [queryClient, toast, userId]);
};
