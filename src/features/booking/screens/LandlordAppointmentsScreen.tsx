import { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { CalendarX2, Clock3 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation';
import { useToast } from '@hooks';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import {
  Button,
  EmptyState,
  ListingCardSkeleton,
  NoticeBanner,
  ScreenContainer,
  Typography,
} from '@ui';
import { LandlordBookingCard, REJECT_REASONS, RELEASE_REASONS, ReasonModal } from '../components';
import {
  useConfirmBooking,
  useLandlordBookings,
  useRejectBooking,
  useReleaseBooking,
} from '../hooks';
import type { Booking, BookingStatus } from '../types';

type TabKey = 'pending' | 'confirmed' | 'rejected' | 'expired';
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ReasonAction = { type: 'reject' | 'release'; booking: Booking };

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'pending', label: 'Chờ' },
  { key: 'confirmed', label: 'Đã nhận' },
  { key: 'rejected', label: 'Từ chối' },
  { key: 'expired', label: 'Hết hạn' },
];

const isInTab = (status: BookingStatus, tab: TabKey) => {
  if (tab === 'pending') return status === 'pending';

  if (tab === 'confirmed') return status === 'confirmed' || status === 'holding';

  if (tab === 'rejected') return status === 'rejected';

  return status === 'expired' || status === 'cancelled';
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
            title="Xác nhận lịch"
            isLoading={confirmBooking.isPending && confirmBooking.variables === booking.id}
            onPress={() => void handleConfirm(booking)}
            style={[styles.confirmAction, styles.successButton]}
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
        <Typography variant="h1" weight="BOLD" style={styles.headerTitle}>
          Lịch hẹn
        </Typography>
      </View>

      <View style={styles.tabs}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const count = allBookings.filter((booking) => isInTab(booking.status, tab.key)).length;

          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[styles.tab, { flexGrow: tab.label.length }]}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Typography
                variant="caption"
                weight={isActive ? 'BOLD' : 'MEDIUM'}
                color={isActive ? THEME_COLORS.PRIMARY_DARK : THEME_COLORS.TEXT_PLACEHOLDER}
                style={styles.tabLabel}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                {count > 0 ? `${tab.label} (${count})` : tab.label}
              </Typography>
              <View style={[styles.tabIndicator, isActive && styles.tabIndicatorActive]} />
            </TouchableOpacity>
          );
        })}
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
          {activeTab === 'pending' ? (
            <NoticeBanner tone="warning" icon={Clock3}>
              Yêu cầu không phản hồi trong 24 giờ sẽ tự huỷ. Tỉ lệ phản hồi ảnh hưởng tới thứ hạng
              tin của bạn.
            </NoticeBanner>
          ) : null}
          {items.map((booking) => (
            <LandlordBookingCard
              key={booking.id}
              booking={booking}
              actions={renderActions(booking)}
              onPress={() => navigation.navigate('BookingDetail', { id: booking.id })}
            />
          ))}
        </ScrollView>
      )}

      <ReasonModal
        isVisible={reasonAction !== null}
        title={reasonAction?.type === 'reject' ? 'Vì sao bạn từ chối?' : 'Vì sao bạn huỷ giữ chỗ?'}
        description={
          reasonAction?.type === 'reject'
            ? 'Sinh viên nhận được lý do này. Chọn lý do đúng giúp bạn giữ điểm uy tín.'
            : 'Phòng sẽ trở về trạng thái còn trống và sinh viên được thông báo.'
        }
        reasons={reasonAction?.type === 'reject' ? REJECT_REASONS : RELEASE_REASONS}
        confirmTone={reasonAction?.type === 'reject' ? 'primary' : 'danger'}
        confirmTitle={reasonAction?.type === 'reject' ? 'Gửi phản hồi' : 'Hủy giữ chỗ'}
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
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: SPACING_TOKENS.MD,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  headerTitle: { letterSpacing: -0.5 },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: SPACING_TOKENS.MD,
    backgroundColor: THEME_COLORS.SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.BORDER,
  },
  tab: { flexBasis: 0, flexShrink: 1, alignItems: 'center', gap: 8, paddingTop: 6 },
  tabLabel: { fontSize: 12.5, lineHeight: 20 },
  tabIndicator: {
    alignSelf: 'stretch',
    height: 3,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.TRANSPARENT,
  },
  tabIndicatorActive: { backgroundColor: THEME_COLORS.PRIMARY },
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
  action: { flex: 1, height: 44 },
  confirmAction: { flex: 2, height: 44 },
  dangerButton: { borderColor: THEME_COLORS.ERROR },
  dangerText: { color: THEME_COLORS.ERROR },
  successButton: { backgroundColor: THEME_COLORS.SUCCESS },
});
