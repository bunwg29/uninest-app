import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Check, Clock3, Info, MessageSquare } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, THEME_COLORS } from '@theme';
import { GradientAvatar, GradientView, NoticeBanner, Typography } from '@ui';
import { LandlordStatusPill } from '@features/listings/components/landlord/LandlordStatusPill';
import { StatusBadge } from './StatusBadge';
import type { Booking, BookingStatus } from '../types';
import { formatDayMonth, formatFullDate, formatTimelineStamp, formatViewingSlot } from '../utils';
import { formatFullPrice } from '@core';

const MS_PER_DAY = 86_400_000;
const MS_PER_HOUR = 3_600_000;

const STATUS_NOTICES: Record<
  BookingStatus,
  { tone: 'info' | 'warning' | 'success'; strong: string; rest?: string }
> = {
  pending: { tone: 'warning', strong: 'Đang chờ bạn xác nhận.' },
  confirmed: { tone: 'success', strong: 'Bạn đã xác nhận lịch hẹn.' },
  holding: { tone: 'warning', strong: 'Sinh viên đang giữ chỗ phòng này.' },
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

  if (booking.status === 'holding' && remaining && booking.expiresAt) {
    return {
      ...base,
      strong: remaining,
      rest: ` Giữ chỗ hết hạn ${formatDayMonth(booking.expiresAt)}, phòng tự mở lại nếu chưa hoàn tất thủ tục.`,
    };
  }

  if (booking.status === 'pending' && remaining) {
    return { ...base, rest: ` ${remaining} để phản hồi trước khi yêu cầu tự hủy.` };
  }

  if (booking.cancelReason) return { ...base, rest: ` Lý do: ${booking.cancelReason}` };

  return base;
};

interface StepProps {
  title: string;
  value?: string;
  state: 'done' | 'current' | 'pending';
  isLast?: boolean;
  lineDone?: boolean;
}

const Step = ({ title, value, state, isLast, lineDone }: StepProps) => (
  <View style={styles.stepRow}>
    <View style={styles.rail}>
      <View
        style={[
          styles.dot,
          state === 'done' && styles.dotDone,
          state === 'current' && styles.dotCurrent,
          state === 'pending' && styles.dotPending,
        ]}
      >
        {state === 'done' ? <Check size={13} color={THEME_COLORS.WHITE} /> : null}
        {state === 'current' ? <View style={styles.dotCore} /> : null}
      </View>
      {isLast ? null : <View style={[styles.line, lineDone && styles.lineDone]} />}
    </View>
    <View style={[styles.stepText, isLast ? null : styles.stepTextSpaced]}>
      <Typography
        variant="body2"
        weight="SEMIBOLD"
        color={
          state === 'current'
            ? THEME_COLORS.PRIMARY_DARK
            : state === 'pending'
              ? OVERLAY_COLORS.STEP_PENDING_TEXT
              : THEME_COLORS.TEXT_PRIMARY
        }
        style={styles.stepTitle}
      >
        {title}
      </Typography>
      {value ? (
        <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
          {value}
        </Typography>
      ) : null}
    </View>
  </View>
);

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
  onRelease,
}: {
  booking: Booking;
  onOpenListing: () => void;
  onOpenChat: () => void;
  onRelease: () => void;
}) => {
  const notice = getNotice(booking);
  const isHolding = booking.status === 'holding';
  const depositEvent = booking.events.find((event) => /hold|deposit/i.test(event.eventType));

  return (
    <>
      <NoticeBanner
        tone={notice.tone}
        icon={isHolding || notice.tone === 'warning' ? Clock3 : Check}
      >
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

      {isHolding ? (
        <>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.listingRow}
              onPress={onOpenListing}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={`Xem chi tiết phòng ${booking.listing.title}`}
            >
              {booking.listing.imageUrl ? (
                <Image source={{ uri: booking.listing.imageUrl }} style={styles.thumb} />
              ) : (
                <GradientView
                  colors={[OVERLAY_COLORS.FIELD_BORDER, THEME_COLORS.SURFACE_MUTED]}
                  style={styles.thumb}
                />
              )}
              <View style={styles.listingText}>
                <View style={styles.pillRow}>
                  <LandlordStatusPill label="Đang giữ chỗ" tone="warning" />
                </View>
                <Typography variant="body2" weight="SEMIBOLD" numberOfLines={2}>
                  {booking.listing.title}
                </Typography>
                <View style={styles.priceRow}>
                  <Typography variant="body1" weight="BOLD" colorKey="PRIMARY_DARK">
                    {formatFullPrice(booking.listing.price)}
                  </Typography>
                  <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
                    /tháng
                  </Typography>
                </View>
              </View>
            </TouchableOpacity>
            <View style={styles.divider} />
            <StudentRow booking={booking} onOpenChat={onOpenChat} />
          </View>

          <View style={styles.card}>
            <Step
              state="done"
              lineDone
              title="Sinh viên đã xem phòng"
              value={formatTimelineStamp(booking.startTime)}
            />
            <Step
              state="done"
              title={
                booking.depositAmount
                  ? `Đã cọc ${formatFullPrice(booking.depositAmount)} qua UniNest`
                  : 'Đã ghi nhận đặt cọc'
              }
              value={depositEvent ? formatTimelineStamp(depositEvent.createdAt) : undefined}
            />
            <Step
              state="current"
              title="Chờ hai bên hoàn tất thủ tục thuê"
              value={booking.expiresAt ? `Hạn ${formatFullDate(booking.expiresAt)}` : undefined}
            />
            <Step
              state="pending"
              isLast
              title="Đánh dấu đã cho thuê"
              value="Tin sẽ được gỡ khỏi kết quả tìm kiếm"
            />
          </View>

          <NoticeBanner tone="info" icon={Info}>
            Tiền cọc do sinh viên trả trực tiếp cho bạn theo thoả thuận. UniNest không giữ tiền, chỉ
            ghi nhận giao dịch để đối chiếu.
          </NoticeBanner>

          <View style={styles.releaseCard}>
            <Typography
              variant="body2"
              weight="SEMIBOLD"
              colorKey="ERROR"
              style={styles.releaseTitle}
            >
              Huỷ giữ chỗ
            </Typography>
            <Typography variant="body2" colorKey="TEXT_MUTED" style={styles.bodyText}>
              Chỉ huỷ khi sinh viên không hoàn tất thủ tục trong thời hạn đã thoả thuận. Việc hoàn
              cọc do hai bên tự giải quyết ngoài ứng dụng.
            </Typography>
            <TouchableOpacity
              style={styles.releaseButton}
              onPress={onRelease}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Huỷ giữ chỗ này"
              testID="landlord-booking-release"
            >
              <Typography variant="body2" weight="SEMIBOLD" colorKey="ERROR">
                Huỷ giữ chỗ này
              </Typography>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
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
      )}
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
  listingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  thumb: { width: 64, height: 64, borderRadius: BORDER_RADIUS_TOKENS.MD, overflow: 'hidden' },
  listingText: { flex: 1, gap: 4 },
  pillRow: { flexDirection: 'row' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
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
  stepRow: { flexDirection: 'row', gap: 12 },
  rail: { width: 24, alignItems: 'center' },
  dot: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
  },
  dotDone: { backgroundColor: THEME_COLORS.SUCCESS },
  dotCurrent: { backgroundColor: THEME_COLORS.PRIMARY },
  dotCore: {
    width: 8,
    height: 8,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.WHITE,
  },
  dotPending: {
    borderWidth: 2,
    borderColor: OVERLAY_COLORS.STEP_PENDING_BORDER,
    backgroundColor: THEME_COLORS.WHITE,
  },
  line: { flex: 1, width: 2, backgroundColor: THEME_COLORS.BORDER },
  lineDone: { backgroundColor: THEME_COLORS.SUCCESS },
  stepText: { flex: 1, gap: 2 },
  stepTextSpaced: { paddingBottom: 20 },
  stepTitle: { lineHeight: 22 },
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
  releaseCard: {
    gap: 12,
    padding: 17,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    borderWidth: 1,
    borderColor: OVERLAY_COLORS.NOTICE_ERROR_BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  releaseTitle: { lineHeight: 22 },
  releaseButton: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    borderWidth: 1,
    borderColor: THEME_COLORS.ERROR,
    backgroundColor: THEME_COLORS.SURFACE,
  },
});
