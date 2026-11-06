import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Check, Clock3, MessageSquare } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, THEME_COLORS } from '@theme';
import { GradientAvatar, NoticeBanner, Typography } from '@ui';
import { StatusBadge } from './StatusBadge';
import type { Booking, BookingStatus } from '../types';
import { formatViewingSlot } from '../utils';

const MS_PER_DAY = 86_400_000;
const MS_PER_HOUR = 3_600_000;

const STATUS_NOTICES: Record<
  BookingStatus,
  { tone: 'info' | 'warning' | 'success'; strong: string; rest?: string }
> = {
  pending: { tone: 'warning', strong: 'Đang chờ bạn xác nhận.' },
  confirmed: { tone: 'success', strong: 'Bạn đã xác nhận lịch hẹn.' },
  expired: { tone: 'warning', strong: 'Yêu cầu đã hết hạn.' },
  cancelled: { tone: 'warning', strong: 'Lịch hẹn đã bị hủy.' },
  rejected: { tone: 'warning', strong: 'Bạn đã từ chối yêu cầu.' },
};

const NOTICE_COLORS = {
  info: THEME_COLORS.PRIMARY_DARK,
  warning: THEME_COLORS.WARNING,
  success: THEME_COLORS.SUCCESS,
} as const;

const getRemainingText = (expiresAt: string | null) => {
  if (!expiresAt) return null;

  const remainingMs = new Date(expiresAt).getTime() - Date.now();

  if (remainingMs <= 0) return null;

  return remainingMs >= MS_PER_DAY
    ? `Còn ${Math.ceil(remainingMs / MS_PER_DAY)} ngày.`
    : `Còn ${Math.ceil(remainingMs / MS_PER_HOUR)} giờ.`;
};

const getNotice = (booking: Booking) => {
  const base = STATUS_NOTICES[booking.status];
  const remaining = getRemainingText(booking.expiresAt);

  if (booking.status === 'pending' && remaining) {
    return { ...base, rest: ` ${remaining} để phản hồi trước khi yêu cầu tự hủy.` };
  }

  if (booking.cancelReason) return { ...base, rest: ` Lý do: ${booking.cancelReason}` };

  return base;
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Typography variant="body2" colorKey="TEXT_PLACEHOLDER" style={styles.infoText}>
      {label}
    </Typography>
    <Typography
      variant="body2"
      weight="SEMIBOLD"
      align="right"
      style={[styles.infoText, styles.infoValue]}
    >
      {value}
    </Typography>
  </View>
);

const StudentRow = ({ booking, onOpenChat }: { booking: Booking; onOpenChat: () => void }) => (
  <View style={styles.studentRow}>
    <GradientAvatar name={booking.student?.fullName} uri={booking.student?.avatarUrl} size={44} />
    <View style={styles.flex}>
      <Typography variant="body2" weight="SEMIBOLD" numberOfLines={1} style={styles.studentName}>
        {booking.student?.fullName ?? 'Sinh viên'}
      </Typography>
      {booking.student?.phone ? (
        <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
          {booking.student.phone}
        </Typography>
      ) : null}
    </View>
    {booking.student ? (
      <TouchableOpacity
        style={styles.chatButton}
        onPress={onOpenChat}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Nhắn tin với sinh viên"
        testID="landlord-booking-chat"
      >
        <MessageSquare size={19} color={THEME_COLORS.PRIMARY} />
      </TouchableOpacity>
    ) : null}
  </View>
);

export const LandlordBookingDetailView = ({
  booking,
  onOpenListing,
  onOpenChat,
}: {
  booking: Booking;
  onOpenListing: () => void;
  onOpenChat: () => void;
}) => {
  const notice = getNotice(booking);

  return (
    <>
      <NoticeBanner tone={notice.tone} icon={notice.tone === 'warning' ? Clock3 : Check}>
        <Typography
          variant="label"
          weight="SEMIBOLD"
          color={NOTICE_COLORS[notice.tone]}
          style={styles.noticeStrong}
        >
          {notice.strong}
        </Typography>
        {notice.rest ?? ''}
      </NoticeBanner>

      <View style={styles.card}>
        <StudentRow booking={booking} onOpenChat={onOpenChat} />
        <View style={styles.divider} />
        <InfoRow label="Thời gian" value={formatViewingSlot(booking.startTime)} />
        <TouchableOpacity
          onPress={onOpenListing}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={`Xem chi tiết phòng ${booking.listing.title}`}
        >
          <InfoRow label="Phòng" value={booking.listing.title} />
        </TouchableOpacity>
        <InfoRow label="Địa chỉ" value={booking.listing.address} />
        <InfoRow label="Mã yêu cầu" value={`#${booking.code}`} />
        <View style={styles.statusRow}>
          <StatusBadge status={booking.status} />
        </View>
      </View>

      {booking.note ? (
        <View style={styles.note}>
          <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
            GHI CHÚ CỦA SINH VIÊN
          </Typography>
          <Typography variant="body2" colorKey="TEXT_SECONDARY" style={styles.bodyText}>
            {booking.note}
          </Typography>
        </View>
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 2 },
  bodyText: { fontSize: 13, lineHeight: 20 },
  noticeStrong: { fontSize: 13, lineHeight: 20 },
  card: {
    gap: 14,
    padding: 16,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
    shadowColor: OVERLAY_COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  divider: { height: 1, backgroundColor: THEME_COLORS.DIVIDER },
  studentRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  studentName: { lineHeight: 22 },
  chatButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  infoText: { fontSize: 13, lineHeight: 20 },
  infoValue: { flex: 1 },
  statusRow: { flexDirection: 'row' },
  note: {
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: THEME_COLORS.SURFACE,
  },
});
