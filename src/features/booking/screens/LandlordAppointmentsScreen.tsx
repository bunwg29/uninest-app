import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { CalendarX2 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation';
import { useToast } from '@hooks';
import { SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Button, EmptyState, ListingCardSkeleton, ScreenContainer, Typography } from '@ui';
import { BookingCard, ReasonModal } from '../components';
import {
  useConfirmBooking,
  useLandlordBookings,
  useRejectBooking,
  useReleaseBooking,
} from '../hooks';
import type { Booking, BookingStatus } from '../types';

type TabKey = 'pending' | 'confirmed' | 'closed';
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ReasonAction = { type: 'reject' | 'release'; booking: Booking };

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'pending', label: 'Chờ xác nhận' },
  { key: 'confirmed', label: 'Đã xác nhận' },
  { key: 'closed', label: 'Đã đóng' },
];

const isInTab = (status: BookingStatus, tab: TabKey) => {
  if (tab === 'pending') return status === 'pending';

  if (tab === 'confirmed') return status === 'confirmed' || status === 'holding';

  return status === 'expired' || status === 'cancelled' || status === 'rejected';
};

export const LandlordAppointmentsScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>('pending');
  const [reasonAction, setReasonAction] = useState<ReasonAction | null>(null);
  const bookingsQuery = useLandlordBookings();
  const confirmBooking = useConfirmBooking();
  const rejectBooking = useRejectBooking();
  const releaseBooking = useReleaseBooking();
  const allBookings = bookingsQuery.data?.items ?? [];
  const items = allBookings.filter((booking) => isInTab(booking.status, activeTab));

  const handleConfirm = async (booking: Booking) => {
    try {
      await confirmBooking.mutateAsync(booking.id);
      toast.success('Đã xác nhận lịch hẹn');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xác nhận lịch hẹn');
    }
  };

  const handleSubmitReason = async (reason: string) => {
    if (!reasonAction) return;

    const { type, booking } = reasonAction;

    try {
      if (type === 'reject') {
        await rejectBooking.mutateAsync({ id: booking.id, reason });
        toast.success('Đã từ chối yêu cầu');
      } else {
        await releaseBooking.mutateAsync({ id: booking.id, reason });
        toast.success('Đã hủy giữ chỗ');
      }

      setReasonAction(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể thực hiện thao tác');
    }
  };

  const renderActions = (booking: Booking) => {
    if (booking.status === 'pending') {
      return (
        <>
          <Button
            title="Từ chối"
            variant="outline"
            onPress={() => setReasonAction({ type: 'reject', booking })}
            style={[styles.action, styles.dangerButton]}
            textStyle={styles.dangerText}
          />
          <Button
            title="Xác nhận"
            isLoading={confirmBooking.isPending && confirmBooking.variables === booking.id}
            onPress={() => void handleConfirm(booking)}
            style={styles.action}
          />
        </>
      );
    }

    if (booking.status === 'holding') {
      return (
        <Button
          title="Hủy giữ chỗ"
          variant="outline"
          onPress={() => setReasonAction({ type: 'release', booking })}
          style={[styles.action, styles.dangerButton]}
          textStyle={styles.dangerText}
        />
      );
    }

    return null;
  };

  return (
    <ScreenContainer style={styles.safeArea} applyBottomInset={false} keyboardAvoiding={false}>
      <View style={styles.header}>
        <Typography variant="h1" weight="BOLD">
          Lịch hẹn
        </Typography>
        <Typography variant="body2" colorKey="TEXT_MUTED">
          Yêu cầu xem phòng từ sinh viên. Chưa phản hồi sau 24 giờ sẽ tự động hết hạn.
        </Typography>
      </View>

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
              color={activeTab === tab.key ? THEME_COLORS.PRIMARY : THEME_COLORS.TEXT_MUTED}
            >
              {tab.label} (
              {allBookings.filter((booking) => isInTab(booking.status, tab.key)).length})
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
          <Typography>Không thể tải danh sách lịch hẹn.</Typography>
          <Button title="Thử lại" onPress={() => bookingsQuery.refetch()} />
        </View>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<CalendarX2 size={42} color={THEME_COLORS.TEXT_PLACEHOLDER} />}
          title="Chưa có lịch hẹn nào"
          description="Khi sinh viên đặt lịch xem phòng, yêu cầu sẽ xuất hiện tại đây."
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
              subtitle={
                booking.student
                  ? `${booking.student.fullName} · ${booking.student.phone}`
                  : undefined
              }
              actions={renderActions(booking)}
              onPress={() => navigation.navigate('BookingDetail', { id: booking.id })}
              onExpire={() => void bookingsQuery.refetch()}
            />
          ))}
        </ScrollView>
      )}

      <ReasonModal
        isVisible={reasonAction !== null}
        title={reasonAction?.type === 'reject' ? 'Từ chối yêu cầu xem phòng' : 'Hủy giữ chỗ'}
        description={
          reasonAction?.type === 'reject'
            ? 'Lý do sẽ được gửi tới sinh viên.'
            : 'Phòng sẽ trở về trạng thái còn trống và sinh viên được thông báo.'
        }
        confirmTitle={reasonAction?.type === 'reject' ? 'Từ chối' : 'Hủy giữ chỗ'}
        isLoading={rejectBooking.isPending || releaseBooking.isPending}
        onClose={() => setReasonAction(null)}
        onConfirm={(reason) => void handleSubmitReason(reason)}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: THEME_COLORS.BACKGROUND },
  header: {
    padding: SPACING_TOKENS.MD,
    gap: SPACING_TOKENS.XXS,
    backgroundColor: THEME_COLORS.SURFACE,
  },
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
  list: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    padding: SPACING_TOKENS.MD,
    gap: SPACING_TOKENS.MD,
    paddingBottom: 96,
  },
  loading: { padding: SPACING_TOKENS.MD },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING_TOKENS.MD },
  action: { flex: 1 },
  dangerButton: { borderColor: THEME_COLORS.ERROR },
  dangerText: { color: THEME_COLORS.ERROR },
});
