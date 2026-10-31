import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  SectionList,
  StyleSheet,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Bell, House, SlidersHorizontal } from 'lucide-react-native';
import type { RootStackParamList } from '@navigation';
import { useAuthStore } from '@features/auth';
import { useToast } from '@hooks';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import {
  BackButton,
  Button,
  EmptyState,
  FilterChip,
  HeaderBar,
  ScreenContainer,
  SkeletonBox,
  SkeletonCircle,
  Typography,
} from '@ui';
import { NotificationRow } from '../components/NotificationRow';
import {
  useNotificationActions,
  useNotifications,
  useUnreadNotificationCount,
} from '../hooks/useNotifications';
import type { AppNotification, NotificationFilter } from '../types';
import {
  getNotificationSection,
  NOTIFICATION_SECTION_LABELS,
  type NotificationSection,
} from '../utils/notificationTime';

type Navigation = NativeStackNavigationProp<RootStackParamList, 'Notifications'>;

const STUDENT_TABS: Array<{ key: string; label: string; filter: NotificationFilter }> = [
  { key: 'all', label: 'Tất cả', filter: {} },
  { key: 'booking', label: 'Lịch hẹn', filter: { type: 'booking' } },
  { key: 'listing', label: 'Tin mới', filter: { type: 'listing' } },
  { key: 'forum', label: 'Cộng đồng', filter: { type: 'forum' } },
];

const LANDLORD_TABS: Array<{ key: string; label: string; filter: NotificationFilter }> = [
  { key: 'all', label: 'Tất cả', filter: {} },
  { key: 'unread', label: 'Chưa đọc', filter: { unread: true } },
  { key: 'booking', label: 'Lịch hẹn', filter: { type: 'booking' } },
  { key: 'system', label: 'Hệ thống', filter: { type: 'system' } },
];

const groupBySection = (items: AppNotification[]) => {
  const order: NotificationSection[] = ['today', 'yesterday', 'earlier'];
  const groups = new Map<NotificationSection, AppNotification[]>();

  items.forEach((item) => {
    const section = getNotificationSection(item.createdAt);

    groups.set(section, [...(groups.get(section) ?? []), item]);
  });

  return order
    .filter((section) => groups.has(section))
    .map((section) => ({
      key: section,
      title: NOTIFICATION_SECTION_LABELS[section],
      data: groups.get(section) ?? [],
    }));
};

const ListSkeleton = () => (
  <View style={styles.skeleton} accessibilityLabel="Đang tải thông báo">
    {[0, 1, 2, 3].map((index) => (
      <View key={index} style={styles.skeletonRow}>
        <SkeletonCircle size={42} />
        <View style={styles.skeletonText}>
          <SkeletonBox height={14} width="85%" />
          <SkeletonBox height={14} width="60%" />
          <SkeletonBox height={12} width="30%" />
        </View>
      </View>
    ))}
  </View>
);

export const NotificationsScreen = () => {
  const navigation = useNavigation<Navigation>();
  const toast = useToast();
  const role = useAuthStore((state) => state.role);
  const isLandlord = role === 'landlord';
  const tabs = isLandlord ? LANDLORD_TABS : STUDENT_TABS;
  const [tabKey, setTabKey] = useState('all');
  const activeTab = tabs.find((item) => item.key === tabKey) ?? tabs[0];
  const query = useNotifications(activeTab.filter);
  const unreadQuery = useUnreadNotificationCount();
  const { markRead, markAllRead } = useNotificationActions();
  const items = useMemo(() => query.data?.pages.flatMap((page) => page.items) ?? [], [query.data]);
  const sections = useMemo(() => groupBySection(items), [items]);

  const handleOpen = useCallback(
    async (item: AppNotification) => {
      try {
        if (!item.readAt) await markRead.mutateAsync(item.id);

        const { payload } = item;

        if (payload.screen === 'ChatRoom' && payload.conversationId) {
          navigation.navigate('ChatRoom', { conversationId: payload.conversationId });
        } else if (payload.screen === 'BookingDetail' && payload.bookingId) {
          navigation.navigate('BookingDetail', { id: payload.bookingId });
        } else if (payload.screen === 'ListingDetail' && payload.listingId) {
          if (isLandlord) navigation.navigate('Main', { screen: 'Listings' });
          else navigation.navigate('ListingDetail', { id: payload.listingId });
        } else if (payload.screen === 'ForumPostDetail' && payload.postId) {
          navigation.navigate('ForumPostDetail', { postId: payload.postId });
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Không thể mở thông báo');
      }
    },
    [isLandlord, markRead, navigation, toast]
  );

  const handleMarkAllRead = async () => {
    try {
      await markAllRead.mutateAsync();
      toast.success('Đã đánh dấu tất cả là đã đọc');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể cập nhật thông báo');
    }
  };

  const loadMore = () => {
    if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage();
  };

  const refreshControl = (
    <RefreshControl
      refreshing={query.isRefetching && !query.isFetchingNextPage}
      onRefresh={() => {
        void query.refetch();
        void unreadQuery.refetch();
      }}
      tintColor={THEME_COLORS.PRIMARY}
    />
  );

  const footer = query.isFetchingNextPage ? (
    <ActivityIndicator style={styles.footer} color={THEME_COLORS.PRIMARY} />
  ) : undefined;

  const renderBody = () => {
    if (query.isLoading) return <ListSkeleton />;

    if (query.isError) {
      return (
        <EmptyState
          title="Không tải được thông báo"
          description="Kiểm tra kết nối mạng rồi thử lại."
          actionTitle="Thử lại"
          onAction={() => void query.refetch()}
        />
      );
    }

    if (items.length === 0) {
      if (isLandlord || tabKey !== 'all') {
        return (
          <EmptyState
            icon={<Bell size={32} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
            title={tabKey === 'unread' ? 'Bạn đã đọc hết thông báo' : 'Chưa có thông báo nào'}
            description="Khi có cập nhật mới, bạn sẽ thấy ở đây."
          />
        );
      }

      return (
        <ScrollView contentContainerStyle={styles.emptyContent} refreshControl={refreshControl}>
          <View style={styles.emptyIllustration}>
            <Bell size={56} color={THEME_COLORS.TEXT_PLACEHOLDER} strokeWidth={1.5} />
          </View>
          <Typography variant="h2" weight="SEMIBOLD" align="center">
            Chưa có thông báo nào
          </Typography>
          <Typography variant="body1" colorKey="TEXT_MUTED" align="center" style={styles.emptyText}>
            Khi chủ trọ trả lời, lịch hẹn được xác nhận hoặc có phòng mới khớp bộ lọc, bạn sẽ thấy ở
            đây.
          </Typography>
          <View style={styles.ctaCard}>
            <View style={styles.ctaRow}>
              <View style={styles.ctaIcon}>
                <House size={20} color={THEME_COLORS.PRIMARY} />
              </View>
              <View style={styles.ctaText}>
                <Typography variant="body2" weight="SEMIBOLD">
                  Lưu bộ lọc để nhận phòng mới
                </Typography>
                <Typography variant="caption" colorKey="TEXT_PLACEHOLDER">
                  Phòng tốt ở khu sinh viên thường hết trong 1–2 ngày.
                </Typography>
              </View>
            </View>
            <Button
              title="Tạo bộ lọc đầu tiên"
              variant="outline"
              fullWidth
              onPress={() =>
                navigation.navigate('Main', { screen: 'Search', params: { openFilters: true } })
              }
            />
          </View>
        </ScrollView>
      );
    }

    if (isLandlord) {
      return (
        <SectionList
          sections={[{ key: 'all', data: items }]}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <View
              style={[
                styles.cardItem,
                index === 0 && styles.cardFirst,
                index === items.length - 1 && styles.cardLast,
              ]}
            >
              {index > 0 ? <View style={styles.divider} /> : null}
              <NotificationRow
                item={item}
                variant="card"
                onPress={(value) => void handleOpen(value)}
              />
            </View>
          )}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          refreshControl={refreshControl}
          ListFooterComponent={footer}
          contentContainerStyle={styles.cardList}
        />
      );
    }

    return (
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <Typography
            variant="tiny"
            weight="SEMIBOLD"
            colorKey="TEXT_PLACEHOLDER"
            style={styles.sectionTitle}
          >
            {section.title.toUpperCase()}
          </Typography>
        )}
        renderItem={({ item, index }) => (
          <>
            {index > 0 ? <View style={styles.divider} /> : null}
            <NotificationRow
              item={item}
              variant="list"
              onPress={(value) => void handleOpen(value)}
            />
          </>
        )}
        renderSectionFooter={() => <View style={styles.divider} />}
        stickySectionHeadersEnabled={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={refreshControl}
        ListFooterComponent={footer}
      />
    );
  };

  if (isLandlord) {
    const unread = unreadQuery.data ?? 0;

    return (
      <ScreenContainer keyboardAvoiding={false} style={styles.container}>
        <View style={styles.landlordHeader}>
          <BackButton onPress={() => navigation.goBack()} />
          <Typography variant="h1" weight="BOLD" style={styles.landlordTitle}>
            Thông báo
          </Typography>
          <Pressable
            onPress={() => navigation.navigate('NotificationSettings')}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="Cài đặt thông báo"
          >
            <SlidersHorizontal size={20} color={THEME_COLORS.TEXT_PRIMARY} />
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chips}
          style={styles.chipBar}
        >
          {tabs.map((item) => (
            <FilterChip
              key={item.key}
              label={item.key === 'unread' && unread > 0 ? `${item.label} ${unread}` : item.label}
              isSelected={tabKey === item.key}
              onPress={() => setTabKey(item.key)}
            />
          ))}
        </ScrollView>
        {renderBody()}
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer keyboardAvoiding={false} style={styles.container}>
      <HeaderBar
        title="Thông báo"
        alignTitle="left"
        onBack={() => navigation.goBack()}
        hasBottomBorder={false}
        rightActionWidth={72}
        rightAction={
          items.length > 0 ? (
            <Pressable
              onPress={() => void handleMarkAllRead()}
              style={styles.readAll}
              accessibilityRole="button"
              accessibilityLabel="Đánh dấu tất cả thông báo đã đọc"
            >
              <Typography variant="label" weight="SEMIBOLD" colorKey="PRIMARY_DARK">
                Đọc hết
              </Typography>
            </Pressable>
          ) : (
            <View style={styles.readAll}>
              <Bell size={20} color={THEME_COLORS.TEXT_PRIMARY} />
            </View>
          )
        }
      />
      <View style={styles.tabs} accessibilityRole="tablist">
        {tabs.map((item) => {
          const active = tabKey === item.key;

          return (
            <Pressable
              key={item.key}
              onPress={() => setTabKey(item.key)}
              style={styles.tab}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
            >
              <Typography
                variant="label"
                weight={active ? 'BOLD' : 'MEDIUM'}
                colorKey={active ? 'PRIMARY_DARK' : 'TEXT_PLACEHOLDER'}
              >
                {item.label}
              </Typography>
              <View style={[styles.tabIndicator, active && styles.tabIndicatorActive]} />
            </Pressable>
          );
        })}
      </View>
      {renderBody()}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: THEME_COLORS.BACKGROUND },
  readAll: {
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: SPACING_TOKENS.MD,
    backgroundColor: THEME_COLORS.SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.BORDER,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingTop: SPACING_TOKENS.XS + 2,
    minHeight: 44,
    justifyContent: 'space-between',
  },
  tabIndicator: {
    alignSelf: 'stretch',
    height: 3,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
  },
  tabIndicatorActive: { backgroundColor: THEME_COLORS.PRIMARY },
  sectionTitle: {
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingTop: SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.SM,
    letterSpacing: 0.6,
  },
  divider: { height: 1, backgroundColor: THEME_COLORS.DIVIDER },
  footer: { padding: SPACING_TOKENS.MD },
  skeleton: { padding: SPACING_TOKENS.MD, gap: SPACING_TOKENS.LG },
  skeletonRow: { flexDirection: 'row', gap: SPACING_TOKENS.SM + SPACING_TOKENS.XS },
  skeletonText: { flex: 1, gap: SPACING_TOKENS.SM },
  emptyContent: {
    alignItems: 'center',
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingTop: SPACING_TOKENS.XXL + SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.XL,
    gap: SPACING_TOKENS.SM,
  },
  emptyIllustration: {
    width: 150,
    height: 150,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING_TOKENS.LG,
  },
  emptyText: { marginBottom: SPACING_TOKENS.LG },
  ctaCard: {
    alignSelf: 'stretch',
    gap: SPACING_TOKENS.MD,
    padding: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  ctaRow: { flexDirection: 'row', gap: SPACING_TOKENS.SM + SPACING_TOKENS.XS },
  ctaIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { flex: 1, gap: 2 },
  landlordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.SM + SPACING_TOKENS.XS,
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingVertical: SPACING_TOKENS.SM,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  landlordTitle: { flex: 1 },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  chipBar: { flexGrow: 0, backgroundColor: THEME_COLORS.SURFACE },
  chips: {
    gap: SPACING_TOKENS.SM,
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.SM + SPACING_TOKENS.XS,
  },
  cardList: { padding: SPACING_TOKENS.MD },
  cardItem: {
    backgroundColor: THEME_COLORS.SURFACE,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    overflow: 'hidden',
  },
  cardFirst: {
    borderTopWidth: 1,
    borderTopLeftRadius: BORDER_RADIUS_TOKENS.LG,
    borderTopRightRadius: BORDER_RADIUS_TOKENS.LG,
  },
  cardLast: {
    borderBottomWidth: 1,
    borderBottomLeftRadius: BORDER_RADIUS_TOKENS.LG,
    borderBottomRightRadius: BORDER_RADIUS_TOKENS.LG,
  },
});
