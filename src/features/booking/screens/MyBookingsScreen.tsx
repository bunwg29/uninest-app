import { useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { CalendarX2, MessageCircle } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation';
import { useOpenListingChat } from '@features/chat';
import { useToast } from '@hooks';
import { SPACING_TOKENS, THEME_COLORS } from '@theme';
import {
  Button,
  EmptyState,
  HeaderBar,
  ListingCardSkeleton,
  ScreenContainer,
  Typography,
} from '@ui';
import { BookingCard } from '../components';
import { useBookings, useCancelBooking } from '../hooks';
import type { Booking, BookingStatus } from '../types';
import { getHoursUntil } from '../utils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type TabKey = 'pending' | 'confirmed' | 'expired' | 'cancelled';

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'pending', label: 'Chờ' },
  { key: 'confirmed', label: 'Đã xác nhận' },
  { key: 'expired', label: 'Hết hạn' },
  { key: 'cancelled', label: 'Đã hủy' },
];

export const isInTab = (status: BookingStatus, tab: TabKey) => {
  if (tab === 'pending') return status === 'pending';

  if (tab === 'confirmed') return status === 'confirmed' || status === 'holding';

  if (tab === 'expired') return status === 'expired';

  return status === 'cancelled' || status === 'rejected';
};

export const MyBookingsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState<TabKey>('pending');
  const bookingsQuery = useBookings();
  const cancelBooking = useCancelBooking();
  const { openChat } = useOpenListingChat();
  const toast = useToast();
  const allBookings = bookingsQuery.data?.items ?? [];
  const items = allBookings.filter((booking) => isInTab(booking.status, activeTab));
  const countFor = (tab: TabKey) =>
    allBookings.filter((booking) => isInTab(booking.status, tab)).length;

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

  const renderActions = (booking: Booking) => {
    if (
      booking.status === 'expired' ||
      booking.status === 'cancelled' ||
      booking.status === 'rejected'
    ) {
      return (
        <Button
          title="Xem phòng khác"
          variant="outline"
          onPress={() => navigation.navigate('Main', { screen: 'Search' })}
          style={styles.actionButton}
        />
      );
    }

    return (
      <>
        <Button
          title="Nhắn tin"
          variant="outline"
          leftIcon={<MessageCircle size={17} color={THEME_COLORS.TEXT_PRIMARY} />}
          onPress={() => void openChat(booking.listing.id)}
          style={styles.actionButton}
        />
        {booking.status !== 'holding' ? (
          <Button
            title="Hủy yêu cầu"
            variant="outline"
            onPress={() => handleCancel(booking)}
            style={[styles.actionButton, styles.dangerButton]}
            textStyle={styles.dangerText}
          />
        ) : null}
      </>
    );
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
              variant="caption"
              weight="BOLD"
              align="center"
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
          title="Chưa có lịch hẹn nào ở mục này"
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
            <BookingCard
              key={booking.id}
              booking={booking}
              actions={renderActions(booking)}
              onPress={() => navigation.navigate('BookingDetail', { id: booking.id })}
              onExpire={() => void bookingsQuery.refetch()}
            />
          ))}
        </ScrollView>
      )}
    </ScreenContainer>
  );
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
    paddingHorizontal: SPACING_TOKENS.XS,
    borderBottomWidth: 2,
    borderBottomColor: THEME_COLORS.TRANSPARENT,
  },
  activeTab: { borderBottomColor: THEME_COLORS.PRIMARY },
  list: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    padding: SPACING_TOKENS.MD,
    gap: SPACING_TOKENS.MD,
  },
  loading: { padding: SPACING_TOKENS.MD },
  actionButton: { flex: 1 },
  dangerButton: { borderColor: THEME_COLORS.ERROR },
  dangerText: { color: THEME_COLORS.ERROR },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING_TOKENS.MD },
});
