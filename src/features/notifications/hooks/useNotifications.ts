import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notificationService';
import type { NotificationPreferences, NotificationType } from '../types';

export const NOTIFICATION_QUERY_KEY = ['notifications'] as const;

export const useNotifications = (type?: NotificationType) =>
  useInfiniteQuery({
    queryKey: [...NOTIFICATION_QUERY_KEY, 'list', type ?? 'all'],
    queryFn: ({ pageParam }) => notificationService.list(pageParam, type),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
  });

export const useUnreadNotificationCount = (enabled = true) =>
  useQuery({
    queryKey: [...NOTIFICATION_QUERY_KEY, 'unread'],
    queryFn: notificationService.unreadCount,
    enabled,
    refetchInterval: 30_000,
  });

export const useNotificationPreferences = () =>
  useQuery({
    queryKey: [...NOTIFICATION_QUERY_KEY, 'preferences'],
    queryFn: notificationService.getPreferences,
  });

export const useNotificationActions = () => {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEY });

  return {
    markRead: useMutation({ mutationFn: notificationService.markRead, onSuccess: invalidate }),
    markUnread: useMutation({ mutationFn: notificationService.markUnread, onSuccess: invalidate }),
    markAllRead: useMutation({
      mutationFn: notificationService.markAllRead,
      onSuccess: invalidate,
    }),
    updatePreferences: useMutation({
      mutationFn: (value: Partial<NotificationPreferences>) =>
        notificationService.updatePreferences(value),
      onSuccess: invalidate,
    }),
  };
};
