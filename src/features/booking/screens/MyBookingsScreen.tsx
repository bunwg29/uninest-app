import { useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { CalendarX2, ChevronRight, MessageCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation';
import { useToast } from '@hooks';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import {
  Button,
  EmptyState,
  HeaderBar,
  ListingCardSkeleton,
  ScreenContainer,
  Typography,
} from '@ui';
import { CountdownTimer, ResourceCard, StatusBadge } from '../components';
import { useBookings, useCancelBooking } from '../hooks';
import type { Booking, BookingStatus } from '../types';
import { formatBookingDateTime, getHoursUntil } from '../utils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type TabKey = 'pending' | 'confirmed' | 'cancelled';

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'pending', label: 'Chờ' },
  { key: 'confirmed', label: 'Đã xác nhận' },
  { key: 'cancelled', label: 'Đã hủy' },
];

export const MyBookingsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState<TabKey>('pending');
  const bookingsQuery = useBookings();
  const cancelBooking = useCancelBooking();
  const toast = useToast();
  const items = (bookingsQuery.data?.items ?? []).filter((booking) =>
    isInTab(booking.status, activeTab)
  );
  const countFor = (tab: TabKey) =>
    (bookingsQuery.data?.items ?? []).filter((booking) => isInTab(booking.status, tab)).length;

  const handleCancel = (booking: Booking) => {
    if (getHoursUntil(booking.startTime) < 24) {
      navigation.navigate('CancelBooking', { id: booking.id });

      return;
    }

    Alert.alert('Hủy yêu cầu xem phòng?', 'Khung giờ sẽ được trả lại để người khác có thể đặt.', [
      { text: 'Giữ lại', style: 'cancel' },
      {
        text: 'Hủy yêu cầu',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelBooking.mutateAsync({ id: booking.id });
            toast.success('Đã hủy yêu cầu xem phòng');
          } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Không thể hủy yêu cầu');
          }
        },
      },
    ]);
  };

  return (
    <ScreenContainer keyboardAvoiding={false}>
      <HeaderBar title="Lịch hẹn của tôi" onBack={() => navigation.goBack()} />
      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
          >
            <Typography
              variant="body2"
              weight="BOLD"
              color={activeTab === tab.key ? THEME_COLORS.PRIMARY : THEME_COLORS.TEXT_MUTED}
            >
              {tab.label} ({countFor(tab.key)})
            </Typography>
          </TouchableOpacity>
        ))}
      </View>
      {bookingsQuery.isLoading ? (
        <View style={styles.loading}>
          {[1, 2].map((item) => (
            <ListingCardSkeleton key={item} />
          ))}
        </View>
      ) : bookingsQuery.isError ? (
        <View style={styles.center}>
          <Typography>Không thể tải lịch hẹn.</Typography>
          <Button title="Thử lại" onPress={() => bookingsQuery.refetch()} />
        </View>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<CalendarX2 size={42} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
          title="Bạn chưa có lịch hẹn nào"
          description="Các yêu cầu xem phòng sẽ xuất hiện tại đây."
          actionTitle="Tìm phòng ngay"
          onAction={() => navigation.navigate('Main', { screen: 'Search' })}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={bookingsQuery.isRefetching}
              onRefresh={() => bookingsQuery.refetch()}
            />
          }
        >
          {items.map((booking) => (
            <View key={booking.id} style={styles.card}>
              <TouchableOpacity
                onPress={() => navigation.navigate('BookingDetail', { id: booking.id })}
              >
                <ResourceCard resource={booking.listing} />
                <View style={styles.metaRow}>
                  <StatusBadge status={booking.status} />
                  <ChevronRight size={20} color={THEME_COLORS.TEXT_MUTED} />
                </View>
                <Typography variant="body2" weight="BOLD" style={styles.time}>
                  {formatBookingDateTime(booking.startTime)}
                </Typography>
                <Typography variant="caption" colorKey="TEXT_MUTED">
                  #{booking.code}
                </Typography>
                {booking.expiresAt &&
                (booking.status === 'pending' || booking.status === 'holding') ? (
                  <CountdownTimer
                    expiresAt={booking.expiresAt}
                    onExpire={() => bookingsQuery.refetch()}
                  />
                ) : null}
              </TouchableOpacity>
              {booking.status === 'pending' ||
              booking.status === 'confirmed' ||
              booking.status === 'holding' ? (
                <View style={styles.actions}>
                  <Button
                    title="Nhắn tin"
                    variant="outline"
                    leftIcon={<MessageCircle size={17} color={THEME_COLORS.TEXT_PRIMARY} />}
                    onPress={() => navigation.navigate('Main', { screen: 'Messages' })}
                    style={styles.actionButton}
                  />
                  {booking.status !== 'confirmed' ? (
                    <Button
                      title="Hủy yêu cầu"
                      variant="ghost"
                      onPress={() => handleCancel(booking)}
                      style={styles.actionButton}
                    />
                  ) : null}
                </View>
              ) : null}
            </View>
          ))}
        </ScrollView>
      )}
    </ScreenContainer>
  );
};

export const isInTab = (status: BookingStatus, tab: TabKey) => {
  if (tab === 'pending') return status === 'pending' || status === 'holding';

  if (tab === 'confirmed') return status === 'confirmed';

  return status === 'cancelled' || status === 'expired';
};

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    backgroundColor: THEME_COLORS.SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.DIVIDER,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING_TOKENS.MD,
    borderBottomWidth: 2,
    borderBottomColor: THEME_COLORS.TRANSPARENT,
  },
  activeTab: { borderBottomColor: THEME_COLORS.PRIMARY },
  list: { padding: SPACING_TOKENS.MD, gap: SPACING_TOKENS.MD },
  loading: { padding: SPACING_TOKENS.MD },
  card: {
    padding: SPACING_TOKENS.MD,
    gap: SPACING_TOKENS.SM,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING_TOKENS.MD,
  },
  time: { marginTop: SPACING_TOKENS.SM },
  actions: { flexDirection: 'row', gap: SPACING_TOKENS.SM, marginTop: SPACING_TOKENS.SM },
  actionButton: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING_TOKENS.MD },
});
