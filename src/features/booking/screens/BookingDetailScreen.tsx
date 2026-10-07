import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { Check, TriangleAlert } from 'lucide-react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation';
import { useAuth } from '@features/auth/hooks';
import { useOpenListingChat } from '@features/chat';
import { useOpenListing } from '@features/listings/hooks/useOpenListing';
import { useLandlordListingMutation } from '@features/listings/hooks/useLandlordListings';
import { useToast } from '@hooks';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Button, HeaderBar, Modal, ScreenContainer, Typography } from '@ui';
import {
  BookingFooter,
  FooterButton,
  CancelBookingModal,
  LandlordBookingDetailView,
  REJECT_REASONS,
  RELEASE_REASONS,
  ReasonModal,
  StudentBookingDetailView,
  getBookingSummary,
} from '../components';
import {
  useBookingDetail,
  useCancelBooking,
  useConfirmBooking,
  useRejectBooking,
  useReleaseBooking,
} from '../hooks';
import type { Booking, BookingStatus } from '../types';
import { getHoursUntil } from '../utils';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ScreenRouteProp = RouteProp<RootStackParamList, 'BookingDetail'>;

export const BookingDetailScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { params } = useRoute<ScreenRouteProp>();
  const bookingQuery = useBookingDetail(params.id);
  const cancelBooking = useCancelBooking();
  const toast = useToast();
  const booking = bookingQuery.data;
  const { openChat } = useOpenListingChat();
  const { openListing } = useOpenListing();
  const { role } = useAuth();
  const isLandlord = role === 'landlord';
  const confirmBooking = useConfirmBooking();
  const rejectBooking = useRejectBooking();
  const releaseBooking = useReleaseBooking();
  const [reasonAction, setReasonAction] = useState<'reject' | 'release' | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isRentDialogOpen, setIsRentDialogOpen] = useState(false);
  const listingMutation = useLandlordListingMutation();
  const queryClient = useQueryClient();

  const handleMarkRented = () => {
    if (!booking || listingMutation.isPending) return;

    listingMutation.mutate(
      { action: 'rent', id: booking.listing.id },
      {
        onSuccess: () => {
          setIsRentDialogOpen(false);
          void queryClient.invalidateQueries({ queryKey: ['bookings'] });
          toast.success('Đã đánh dấu phòng đã cho thuê');
        },
        onError: (error) => {
          setIsRentDialogOpen(false);
          toast.error(error instanceof Error ? error.message : 'Không thể cập nhật tin đăng');
        },
      }
    );
  };

  const handleConfirm = async () => {
    if (!booking) return;

    try {
      await confirmBooking.mutateAsync(booking.id);
      toast.success('Đã xác nhận lịch hẹn');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể xác nhận lịch hẹn');
    }
  };

  const handleSubmitReason = async (reason: string) => {
    if (!booking || !reasonAction) return;

    try {
      if (reasonAction === 'reject') {
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

  const cancelWithoutReason = async () => {
    if (!booking) return;

    try {
      await cancelBooking.mutateAsync({ id: booking.id });
      toast.success('Đã hủy lịch hẹn');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Không thể hủy lịch hẹn');
    }
  };

  const handleCancel = () => {
    if (!booking) return;

    if (getHoursUntil(booking.startTime) < 24) {
      navigation.navigate('CancelBooking', { id: booking.id });

      return;
    }

    setIsCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    setIsCancelDialogOpen(false);
    await cancelWithoutReason();
  };

  const handleAddCalendar = async () => {
    if (!booking) return;

    const formatGoogleDate = (value: string) =>
      new Date(value).toISOString().replace(/[-:]|\.\d{3}/g, '');
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Xem phòng ${booking.listing.title}`)}&dates=${formatGoogleDate(booking.startTime)}/${formatGoogleDate(booking.endTime)}&location=${encodeURIComponent(booking.listing.address)}`;

    await Linking.openURL(url);
  };

  const renderLandlordBody = (booking: Booking) => (
    <LandlordBookingDetailView
      booking={booking}
      onOpenListing={() => void openListing(booking.listing.id)}
      onOpenChat={() => void openChat(booking.listing.id, booking.student?.id)}
      onRelease={() => setReasonAction('release')}
    />
  );

  const renderStudentBody = () => {
    if (!booking) return null;

    return (
      <>
        {getBookingSummary(booking) || booking.status === 'expired' ? null : (
          <View
            style={[
              styles.banner,
              isPositiveStatus(booking.status) ? styles.successBanner : styles.warningBanner,
            ]}
          >
            {isPositiveStatus(booking.status) ? (
              <Check size={22} color={THEME_COLORS.SUCCESS} />
            ) : (
              <TriangleAlert size={22} color={THEME_COLORS.WARNING} />
            )}
            <View style={styles.flex}>
              <Typography
                variant="body1"
                weight="BOLD"
                colorKey={isPositiveStatus(booking.status) ? 'SUCCESS' : 'WARNING'}
              >
                {BANNER_LABELS[booking.status]}
              </Typography>
              {booking.cancelReason ? (
                <Typography variant="caption" colorKey="TEXT_SECONDARY">
                  Lý do: {booking.cancelReason}
                </Typography>
              ) : null}
            </View>
          </View>
        )}
        <StudentBookingDetailView
          booking={booking}
          summary={getBookingSummary(booking)}
          onOpenListing={() => void openListing(booking.listing.id)}
          onOpenChat={() => void openChat(booking.listing.id)}
        />
        {isClosedStatus(booking.status) && booking.status !== 'expired' ? (
          <View style={styles.similarBox}>
            <Typography variant="body1" weight="BOLD">
              Phòng tương tự đang còn trống
            </Typography>
            <Typography variant="body2" colorKey="TEXT_MUTED">
              Khám phá thêm các phòng phù hợp gần khu vực này.
            </Typography>
            <Button
              title="Xem phòng khác"
              variant="outline"
              onPress={() => navigation.navigate('Main', { screen: 'Search' })}
            />
          </View>
        ) : null}
      </>
    );
  };

  return (
    <ScreenContainer keyboardAvoiding={false}>
      <HeaderBar
        title={getHeaderTitle(booking, isLandlord)}
        alignTitle={isLandlord ? 'left' : 'center'}
        onBack={() => navigation.goBack()}
      />
      {!booking ? (
        <View style={styles.center}>
          <Typography>Không thể tải chi tiết lịch hẹn.</Typography>
          <Button title="Thử lại" onPress={() => bookingQuery.refetch()} />
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.content}>
            {isLandlord ? renderLandlordBody(booking) : renderStudentBody()}
          </ScrollView>
          {isLandlord && booking.status === 'pending' ? (
            <BookingFooter>
              <View style={styles.bottomRow}>
                <FooterButton
                  title="Từ chối"
                  tone="danger"
                  onPress={() => setReasonAction('reject')}
                  style={styles.rejectButton}
                />
                <FooterButton
                  title="Xác nhận lịch"
                  tone="success"
                  isLoading={confirmBooking.isPending}
                  onPress={() => void handleConfirm()}
                  style={styles.confirmButton}
                />
              </View>
            </BookingFooter>
          ) : null}
          {isLandlord && booking.status === 'holding' ? (
            <BookingFooter>
              <FooterButton
                title="Đánh dấu đã cho thuê"
                tone="success"
                onPress={() => setIsRentDialogOpen(true)}
              />
            </BookingFooter>
          ) : null}
          {!isLandlord && booking.status === 'expired' ? (
            <BookingFooter>
              <FooterButton
                title="Gửi lại yêu cầu"
                onPress={() =>
                  navigation.navigate('BookingNew', { resourceId: booking.listing.id })
                }
              />
              <FooterButton
                title="Xem phòng khác"
                tone="outline"
                onPress={() => navigation.navigate('Main', { screen: 'Search' })}
              />
            </BookingFooter>
          ) : null}
          {!isLandlord && !isClosedStatus(booking.status) ? (
            <BookingFooter>
              {booking.status === 'confirmed' && getHoursUntil(booking.startTime) <= 0 ? (
                <FooterButton
                  title="Giữ chỗ phòng này"
                  onPress={() => navigation.navigate('BookingHold', { id: booking.id })}
                />
              ) : null}
              <View style={styles.bottomRow}>
                <FooterButton
                  title="Thêm vào lịch"
                  tone="outline"
                  onPress={handleAddCalendar}
                  style={styles.footerRowButton}
                />
                <FooterButton
                  title="Huỷ lịch hẹn"
                  tone="danger"
                  disabled={getHoursUntil(booking.startTime) <= 0}
                  onPress={handleCancel}
                  style={styles.footerRowButton}
                />
              </View>
            </BookingFooter>
          ) : null}
        </>
      )}
      <CancelBookingModal
        isVisible={isCancelDialogOpen}
        isLoading={cancelBooking.isPending}
        onClose={() => setIsCancelDialogOpen(false)}
        onConfirm={() => void handleConfirmCancel()}
      />
      <Modal
        isVisible={isRentDialogOpen}
        title="Đánh dấu đã cho thuê?"
        description="Tin sẽ ngừng hiển thị trong tìm kiếm và các lịch hẹn đang chờ hoặc đã xác nhận sẽ hết hạn."
        confirmText="Đã cho thuê"
        isConfirmLoading={listingMutation.isPending}
        onClose={() => setIsRentDialogOpen(false)}
        onConfirm={handleMarkRented}
      />
      <ReasonModal
        isVisible={reasonAction !== null}
        title={reasonAction === 'reject' ? 'Vì sao bạn từ chối?' : 'Vì sao bạn huỷ giữ chỗ?'}
        description={
          reasonAction === 'reject'
            ? 'Sinh viên nhận được lý do này. Chọn lý do đúng giúp bạn giữ điểm uy tín.'
            : 'Phòng sẽ trở về trạng thái còn trống và sinh viên được thông báo.'
        }
        reasons={reasonAction === 'reject' ? REJECT_REASONS : RELEASE_REASONS}
        confirmTone={reasonAction === 'reject' ? 'primary' : 'danger'}
        confirmTitle={reasonAction === 'reject' ? 'Gửi phản hồi' : 'Hủy giữ chỗ'}
        isLoading={rejectBooking.isPending || releaseBooking.isPending}
        onClose={() => setReasonAction(null)}
        onConfirm={(reason) => void handleSubmitReason(reason)}
      />
    </ScreenContainer>
  );
};

const BANNER_LABELS: Record<BookingStatus, string> = {
  pending: 'Đang chờ Chủ trọ xác nhận',
  confirmed: 'Cả 2 bên đã xác nhận',
  holding: 'Bạn đang giữ chỗ phòng này',
  expired: 'Yêu cầu đã hết hạn',
  cancelled: 'Đã hủy',
  rejected: 'Chủ trọ đã từ chối',
};

const isPositiveStatus = (status: BookingStatus) => status === 'confirmed' || status === 'holding';

const isClosedStatus = (status: BookingStatus) =>
  status === 'cancelled' || status === 'expired' || status === 'rejected';

const getHeaderTitle = (booking: Booking | undefined, isLandlord: boolean) => {
  if (!isLandlord || !booking) return 'Chi tiết lịch hẹn';

  return booking.status === 'holding' ? 'Giữ chỗ đang hoạt động' : `Yêu cầu #${booking.code}`;
};

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
    padding: SPACING_TOKENS.MD,
    gap: SPACING_TOKENS.MD,
    paddingBottom: SPACING_TOKENS.XL,
  },
  banner: {
    flexDirection: 'row',
    gap: SPACING_TOKENS.SM,
    padding: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
  },
  successBanner: { backgroundColor: THEME_COLORS.SUCCESS_LIGHT },
  warningBanner: { backgroundColor: THEME_COLORS.WARNING_LIGHT },
  flex: { flex: 1 },
  footerRowButton: { flex: 1, height: 48 },
  similarBox: {
    gap: SPACING_TOKENS.SM,
    padding: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  bottomRow: { flexDirection: 'row', gap: 12 },
  rejectButton: { flex: 1, height: 48 },
  confirmButton: { flex: 2, height: 48 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING_TOKENS.MD,
    padding: SPACING_TOKENS.XL,
  },
});
