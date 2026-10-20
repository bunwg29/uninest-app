import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { CalendarX2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation';
import { useOpenListingChat } from '@features/chat';
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
import { BookingCard, CancelBookingModal } from '../components';
import { useBookings, useCancelBooking } from '../hooks';
import type { Booking, BookingStatus } from '../types';
import { getHoursUntil } from '../utils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type TabKey = 'pending' | 'confirmed' | 'expired' | 'cancelled';

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'pending', label: 'Chờ' },
  { key: 'confirmed', label: 'Đã xác nhận' },
  { key: 'expired', label: 'Hết hạn' },
  { key: 'cancelled', label: 'Đã huỷ' },
];

export const isInTab = (status: BookingStatus, tab: TabKey) => {
  if (tab === 'pending') return status === 'pending';

  if (tab === 'confirmed') return status === 'confirmed' || status === 'holding';

  if (tab === 'expired') return status === 'expired';

  return status === 'cancelled' || status === 'rejected';
};

const getBookingSubtitle = (booking: Booking) =>
  booking.landlord?.fullName
    ? `${booking.landlord.fullName} · ${booking.listing.address}`
    : booking.listing.address;

export const MyBookingsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [activeTab, setActiveTab] = useState<TabKey>('pending');
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const bookingsQuery = useBookings();
  const cancelBooking = useCancelBooking();
  const { openChat } = useOpenListingChat();
  const toast = useToast();
  const allBookings = bookingsQuery.data?.items ?? [];
  const items = allBookings.filter((booking) => isInTab(booking.status, activeTab));
  const countFor = (tab: TabKey) =>
    allBookings.filter((booking) => isInTab(booking.status, tab)).length;

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;

    const target = cancelTarget;

    setCancelTarget(null);

    try {
      await cancelBooking.mutateAsync({ id: target.id });
      toast.success('Đã hủy yêu cầu xem phòng');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể hủy yêu cầu');
    }
  };

  const handleCancel = (booking: Booking) => {
    if (getHoursUntil(booking.startTime) < 24) {
      navigation.navigate('CancelBooking', { id: booking.id });

      return;
    }

    setCancelTarget(booking);
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
          textStyle={styles.neutralText}
        />
      );
    }

    return (
      <>
        <Button
          title="Nhắn tin"
          variant="outline"
          onPress={() => void openChat(booking.listing.id)}
          style={styles.actionButton}
          textStyle={styles.neutralText}
        />
        {booking.status !== 'holding' ? (
          <Button
            title="Huỷ yêu cầu"
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
            style={[
              styles.tab,
              { flexGrow: tab.label.length },
              activeTab === tab.key && styles.activeTab,
            ]}
          >
            <Typography
              variant="label"
              weight={activeTab === tab.key ? 'BOLD' : 'MEDIUM'}
              align="center"
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              colorKey={activeTab === tab.key ? 'PRIMARY_DARK' : 'TEXT_PLACEHOLDER'}
            >
              {countFor(tab.key) > 0 ? `${tab.label} (${countFor(tab.key)})` : tab.label}
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
              subtitle={getBookingSubtitle(booking)}
              actions={renderActions(booking)}
              onPress={() => navigation.navigate('BookingDetail', { id: booking.id })}
              onExpire={() => void bookingsQuery.refetch()}
            />
          ))}
        </ScrollView>
      )}
      <CancelBookingModal
        isVisible={cancelTarget !== null}
        isLoading={cancelBooking.isPending}
        title="Huỷ yêu cầu xem phòng?"
        description="Khung giờ sẽ được trả lại để người khác có thể đặt."
        confirmText="Huỷ yêu cầu"
        onClose={() => setCancelTarget(null)}
        onConfirm={() => void handleConfirmCancel()}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    backgroundColor: THEME_COLORS.SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.BORDER,
  },
  tab: {
    flexBasis: 0,
    flexShrink: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: SPACING_TOKENS.XS,
    paddingBottom: 6,
    borderBottomWidth: 3,
    borderBottomColor: THEME_COLORS.TRANSPARENT,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
  },
  activeTab: { borderBottomColor: THEME_COLORS.PRIMARY },
  list: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    padding: SPACING_TOKENS.MD,
    gap: 12,
  },
  loading: { padding: SPACING_TOKENS.MD },
  actionButton: { flex: 1, height: 40, backgroundColor: THEME_COLORS.SURFACE },
  neutralText: { color: THEME_COLORS.TEXT_SECONDARY },
  dangerButton: { borderColor: THEME_COLORS.ERROR },
  dangerText: { color: THEME_COLORS.ERROR },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING_TOKENS.MD },
});
