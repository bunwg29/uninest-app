import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Bell } from 'lucide-react-native';
import type { RootStackParamList } from '@navigation';
import { useToast } from '@hooks';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Button, EmptyState, HeaderBar, ScreenContainer, Typography } from '@ui';
import { useNotificationActions, useNotifications } from '../hooks/useNotifications';
import type { AppNotification, NotificationType } from '../types';

type TabKey = 'all' | 'message' | 'booking' | 'listing';

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'all', label: 'Tất cả' },
  { key: 'message', label: 'Tin nhắn' },
  { key: 'booking', label: 'Lịch hẹn' },
  { key: 'listing', label: 'Tin mới' },
];

export const NotificationsScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList, 'Notifications'>>();
  const toast = useToast();
  const [tab, setTab] = useState<TabKey>('all');
  const query = useNotifications(tab === 'all' ? undefined : (tab as NotificationType));
  const { markRead, markUnread, markAllRead } = useNotificationActions();
  const items = query.data?.pages.flatMap((page) => page.items) ?? [];

  const handleOpen = useCallback(
    async (item: AppNotification) => {
      try {
        if (!item.readAt) {
          await markRead.mutateAsync(item.id);
        }

        if (item.payload.screen === 'ChatRoom' && item.payload.conversationId) {
          navigation.navigate('ChatRoom', { conversationId: item.payload.conversationId });
        } else if (item.payload.screen === 'BookingDetail' && item.payload.bookingId) {
          navigation.navigate('BookingDetail', { id: item.payload.bookingId });
        } else if (item.payload.screen === 'ListingDetail' && item.payload.listingId) {
          navigation.navigate('ListingDetail', { id: item.payload.listingId });
        } else if (item.payload.screen === 'ForumPostDetail' && item.payload.postId) {
          navigation.navigate('ForumPostDetail', { postId: item.payload.postId });
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Không thể mở thông báo');
      }
    },
    [markRead, navigation, toast]
  );

  const handleMarkAllRead = async () => {
    try {
      await markAllRead.mutateAsync();
      toast.success('Đã đánh dấu tất cả là đã đọc');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật thông báo');
    }
  };

  const handleMarkUnread = useCallback(
    async (id: string) => {
      try {
        await markUnread.mutateAsync(id);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Không thể cập nhật thông báo');
      }
    },
    [markUnread, toast]
  );

  const renderItem = useCallback(
    ({ item }: { item: AppNotification }) => (
      <Pressable
        onPress={() => void handleOpen(item)}
        style={[styles.item, !item.readAt && styles.unreadItem]}
        accessibilityRole="button"
        accessibilityLabel={`Mở thông báo: ${item.title}`}
      >
        <View style={styles.itemIcon}>
          <Bell size={20} color={THEME_COLORS.PRIMARY} />
        </View>
        <View style={styles.itemContent}>
          <Typography variant="body2" weight="SEMIBOLD">
            {item.title}
          </Typography>
          <Typography variant="caption" colorKey="TEXT_MUTED">
            {item.body}
          </Typography>
          <Typography variant="tiny" colorKey="TEXT_PLACEHOLDER">
            {new Date(item.createdAt).toLocaleString('vi-VN')}
          </Typography>
          {item.readAt ? (
            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                void handleMarkUnread(item.id);
              }}
              style={styles.unreadAction}
              accessibilityRole="button"
              accessibilityLabel={`Đánh dấu chưa đọc: ${item.title}`}
            >
              <Typography variant="caption" colorKey="PRIMARY">
                Đánh dấu chưa đọc
              </Typography>
            </Pressable>
          ) : null}
        </View>
        {!item.readAt ? <View style={styles.unreadDot} /> : null}
      </Pressable>
    ),
    [handleMarkUnread, handleOpen]
  );

  return (
    <ScreenContainer keyboardAvoiding={false} style={styles.container}>
      <HeaderBar
        title="Thông báo"
        onBack={() => navigation.goBack()}
        rightAction={
          <Pressable
            onPress={() => void handleMarkAllRead()}
            style={styles.readAll}
            accessibilityRole="button"
            accessibilityLabel="Đánh dấu tất cả thông báo đã đọc"
          >
            <Typography variant="caption" color={THEME_COLORS.PRIMARY}>
              Đọc hết
            </Typography>
          </Pressable>
        }
      />
      <View style={styles.tabs}>
        {TABS.map((item) => (
          <Pressable
            key={item.key}
            onPress={() => setTab(item.key)}
            style={[styles.tab, tab === item.key && styles.activeTab]}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === item.key }}
          >
            <Typography
              variant="caption"
              weight={tab === item.key ? 'BOLD' : 'REGULAR'}
              color={tab === item.key ? THEME_COLORS.PRIMARY : THEME_COLORS.TEXT_MUTED}
            >
              {item.label}
            </Typography>
          </Pressable>
        ))}
      </View>
      {query.isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={THEME_COLORS.PRIMARY} />
        </View>
      ) : query.isError ? (
        <View style={styles.center}>
          <EmptyState title="Không tải được thông báo" description="Vui lòng thử lại sau." />
          <Button title="Thử lại" onPress={() => void query.refetch()} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          onEndReached={() => {
            if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
          }}
          onEndReachedThreshold={0.4}
          refreshControl={
            <RefreshControl
              refreshing={query.isRefetching}
              onRefresh={() => void query.refetch()}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="Chưa có thông báo"
              description="Khi có cập nhật mới, bạn sẽ thấy ở đây."
            />
          }
          ListFooterComponent={
            query.isFetchingNextPage ? <ActivityIndicator color={THEME_COLORS.PRIMARY} /> : null
          }
          contentContainerStyle={items.length ? styles.list : styles.emptyList}
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: THEME_COLORS.BACKGROUND },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingVertical: SPACING_TOKENS.SM,
    gap: SPACING_TOKENS.SM,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
  },
  activeTab: { backgroundColor: THEME_COLORS.PRIMARY_LIGHT },
  readAll: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING_TOKENS.SM,
    minHeight: 44,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING_TOKENS.MD },
  list: { padding: SPACING_TOKENS.MD, gap: SPACING_TOKENS.SM },
  emptyList: { flexGrow: 1, justifyContent: 'center' },
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING_TOKENS.MD,
    padding: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  unreadItem: { backgroundColor: THEME_COLORS.PRIMARY_LIGHT },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME_COLORS.SURFACE,
  },
  itemContent: { flex: 1, gap: SPACING_TOKENS.XS },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.PRIMARY,
  },
  unreadAction: {
    alignSelf: 'flex-start',
    justifyContent: 'center',
    minHeight: 44,
  },
});
