import { useState } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { Check, Circle, Clock3, MapPin, MessageCircle, TriangleAlert } from 'lucide-react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@navigation';
import { useAuth } from '@features/auth/hooks';
import { useOpenListingChat } from '@features/chat';
import { useOpenListing } from '@features/listings/hooks/useOpenListing';
import { useToast } from '@hooks';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Button, HeaderBar, Modal, ScreenContainer, Typography } from '@ui';
import {
  BookingFooter,
  FooterButton,
  ReasonModal,
  ResourceCard,
  StatusBadge,
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
import { formatBookingDateTime, getHoursUntil } from '../utils';

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
    <>
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
            {isLandlord ? LANDLORD_BANNER_LABELS[booking.status] : BANNER_LABELS[booking.status]}
          </Typography>
          {booking.cancelReason ? (
            <Typography variant="caption" colorKey="TEXT_SECONDARY">
              Lý do: {booking.cancelReason}
            </Typography>
          ) : null}
        </View>
      </View>
      <View style={styles.timeline}>
        <TimelineStep
          label="Gửi yêu cầu"
          value={formatBookingDateTime(booking.createdAt)}
          completed
        />
        <TimelineStep
          label="Chủ trọ xác nhận"
          value={
            booking.confirmedAt ? formatBookingDateTime(booking.confirmedAt) : 'Đang chờ phản hồi'
          }
          completed={Boolean(booking.confirmedAt)}
        />
        <TimelineStep
          label={isClosedStatus(booking.status) ? 'Lịch hẹn đã đóng' : 'Xem phòng trực tiếp'}
          value={formatBookingDateTime(booking.startTime)}
          completed={false}
        />
      </View>
      {isLandlord && booking.student ? (
        <View style={styles.details}>
          <View style={styles.codeRow}>
            <Typography variant="body2" colorKey="TEXT_MUTED">
              Sinh viên
            </Typography>
            <Typography variant="body2" weight="BOLD">
              {booking.student.fullName}
            </Typography>
          </View>
          <View style={styles.codeRow}>
            <Typography variant="body2" colorKey="TEXT_MUTED">
              Số điện thoại
            </Typography>
            <Typography variant="body2" weight="BOLD">
              {booking.student.phone}
            </Typography>
          </View>
          {booking.note ? (
            <Typography variant="body2" colorKey="TEXT_SECONDARY">
              Ghi chú: {booking.note}
            </Typography>
          ) : null}
        </View>
      ) : null}
      <ResourceCard
        resource={booking.listing}
        onPress={() => void openListing(booking.listing.id)}
      />
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Clock3 size={18} color={THEME_COLORS.PRIMARY} />
          <View style={styles.flex}>
            <Typography variant="caption" colorKey="TEXT_MUTED">
              Thời gian
            </Typography>
            <Typography variant="body2" weight="BOLD">
              {formatBookingDateTime(booking.startTime)}
            </Typography>
          </View>
        </View>
        <View style={styles.detailRow}>
          <MapPin size={18} color={THEME_COLORS.PRIMARY} />
          <View style={styles.flex}>
            <Typography variant="caption" colorKey="TEXT_MUTED">
              Địa chỉ
            </Typography>
            <Typography variant="body2" weight="BOLD">
              {booking.listing.address}
            </Typography>
          </View>
        </View>
        <View style={styles.codeRow}>
          <Typography variant="body2" colorKey="TEXT_MUTED">
            Mã yêu cầu
          </Typography>
          <Typography variant="body2" weight="BOLD">
            #{booking.code}
          </Typography>
        </View>
        <StatusBadge status={booking.status} />
      </View>
      <View style={styles.actions}>
        {booking.status === 'pending' ? (
          <>
            <Button
              title="Từ chối"
              variant="outline"
              onPress={() => setReasonAction('reject')}
              style={styles.actionButton}
            />
            <Button
              title="Xác nhận"
              isLoading={confirmBooking.isPending}
              onPress={() => void handleConfirm()}
              style={styles.actionButton}
            />
          </>
        ) : null}
        {booking.status === 'holding' ? (
          <Button
            title="Hủy giữ chỗ"
            variant="danger"
            onPress={() => setReasonAction('release')}
            fullWidth
          />
        ) : null}
        {booking.student ? (
          <Button
            title="Nhắn tin với sinh viên"
            variant="outline"
            leftIcon={<MessageCircle size={17} color={THEME_COLORS.TEXT_PRIMARY} />}
            onPress={() => void openChat(booking.listing.id, booking.student?.id)}
            fullWidth
          />
        ) : null}
      </View>
    </>
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
      <HeaderBar title="Chi tiết lịch hẹn" onBack={() => navigation.goBack()} />
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
      <Modal
        isVisible={isCancelDialogOpen}
        title="Hủy lịch hẹn?"
        description="Bạn có thể đặt lại nếu khung giờ vẫn còn trống."
        cancelText="Không"
        confirmText="Hủy lịch"
        confirmVariant="danger"
        isConfirmLoading={cancelBooking.isPending}
        onClose={() => setIsCancelDialogOpen(false)}
        onConfirm={() => void handleConfirmCancel()}
      />
      <ReasonModal
        isVisible={reasonAction !== null}
        title={reasonAction === 'reject' ? 'Từ chối yêu cầu xem phòng' : 'Hủy giữ chỗ'}
        description={
          reasonAction === 'reject'
            ? 'Lý do sẽ được gửi tới sinh viên.'
            : 'Phòng sẽ trở về trạng thái còn trống và sinh viên được thông báo.'
        }
        confirmTitle={reasonAction === 'reject' ? 'Từ chối' : 'Hủy giữ chỗ'}
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

const LANDLORD_BANNER_LABELS: Record<BookingStatus, string> = {
  pending: 'Đang chờ bạn xác nhận',
  confirmed: 'Bạn đã xác nhận lịch hẹn',
  holding: 'Sinh viên đang giữ chỗ phòng này',
  expired: 'Yêu cầu đã hết hạn',
  cancelled: 'Lịch hẹn đã bị hủy',
  rejected: 'Bạn đã từ chối yêu cầu',
};

const isPositiveStatus = (status: BookingStatus) => status === 'confirmed' || status === 'holding';

const isClosedStatus = (status: BookingStatus) =>
  status === 'cancelled' || status === 'expired' || status === 'rejected';

const TimelineStep = ({
  label,
  value,
  completed,
}: {
  label: string;
  value: string;
  completed: boolean;
}) => (
  <View style={styles.timelineRow}>
    <View style={[styles.timelineIcon, completed && styles.timelineCompleted]}>
      {completed ? (
        <Check size={14} color={THEME_COLORS.WHITE} />
      ) : (
        <Circle size={14} color={THEME_COLORS.TEXT_PLACEHOLDER} />
      )}
    </View>
    <View style={styles.flex}>
      <Typography variant="body2" weight="BOLD">
        {label}
      </Typography>
      <Typography variant="caption" colorKey="TEXT_MUTED">
        {value}
      </Typography>
    </View>
  </View>
);

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
  timeline: {
    gap: SPACING_TOKENS.MD,
    padding: SPACING_TOKENS.MD,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  timelineRow: { flexDirection: 'row', gap: SPACING_TOKENS.MD },
  timelineIcon: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  timelineCompleted: { backgroundColor: THEME_COLORS.SUCCESS },
  details: {
    gap: SPACING_TOKENS.MD,
    padding: SPACING_TOKENS.MD,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  detailRow: { flexDirection: 'row', gap: SPACING_TOKENS.SM },
  codeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING_TOKENS.SM },
  actionButton: { flex: 1 },
  footerRowButton: { flex: 1, height: 48 },
  similarBox: {
    gap: SPACING_TOKENS.SM,
    padding: SPACING_TOKENS.MD,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  bottomRow: { flexDirection: 'row', gap: 12 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING_TOKENS.MD,
    padding: SPACING_TOKENS.XL,
  },
});
