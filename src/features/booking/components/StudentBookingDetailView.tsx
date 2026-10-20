import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Check, ChevronRight, Clock3, X } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, THEME_COLORS } from '@theme';
import { Avatar, NoticeBanner, Typography } from '@ui';
import { StatusBadge } from './StatusBadge';
import type { Booking } from '../types';
import {
  formatCompactSlot,
  formatTimelineStamp,
  formatViewingShort,
  formatViewingSlot,
} from '../utils';

interface TimelineItem {
  label: string;
  value: string;
  completed: boolean;
  lineCompleted: boolean;
  failed?: boolean;
}

const getExpiredTimeline = (booking: Booking): TimelineItem[] => [
  {
    label: 'Bạn gửi yêu cầu',
    value: formatTimelineStamp(booking.createdAt),
    completed: true,
    lineCompleted: false,
  },
  {
    label: 'Hết hạn — không có phản hồi',
    value: formatTimelineStamp(booking.expiredAt ?? booking.expiresAt ?? booking.createdAt),
    completed: false,
    lineCompleted: false,
    failed: true,
  },
];

const getTimeline = (booking: Booking): TimelineItem[] => {
  if (booking.status === 'expired') return getExpiredTimeline(booking);

  const confirmed = Boolean(booking.confirmedAt);
  const holding = booking.status === 'holding';

  return [
    {
      label: 'Bạn gửi yêu cầu',
      value: formatTimelineStamp(booking.createdAt),
      completed: true,
      lineCompleted: confirmed,
    },
    {
      label: 'Chủ trọ xác nhận',
      value: booking.confirmedAt ? formatTimelineStamp(booking.confirmedAt) : 'Đang chờ phản hồi',
      completed: confirmed,
      lineCompleted: holding,
    },
    {
      label: 'Xem phòng trực tiếp',
      value: formatViewingSlot(booking.startTime),
      completed: holding,
      lineCompleted: holding,
    },
    {
      label: 'Quyết định giữ chỗ',
      value: 'Sau khi xem phòng',
      completed: holding,
      lineCompleted: false,
    },
  ];
};

export const getBookingSummary = (booking: Booking) => {
  const landlordName = booking.landlord?.fullName ?? 'Chủ trọ';

  if (booking.status === 'confirmed') {
    return {
      strong: `${landlordName} đã xác nhận.`,
      rest: ` Hẹn gặp bạn ${formatViewingShort(booking.startTime)}.`,
    };
  }

  return null;
};

export const StudentBookingDetailView = ({
  booking,
  summary,
  onOpenListing,
  onOpenChat,
}: {
  booking: Booking;
  summary: ReturnType<typeof getBookingSummary>;
  onOpenListing: () => void;
  onOpenChat: () => void;
}) => {
  const isExpired = booking.status === 'expired';
  const timeline = getTimeline(booking);

  return (
    <>
      {isExpired ? (
        <NoticeBanner tone="warning" icon={Clock3}>
          <Typography variant="label" weight="SEMIBOLD" colorKey="WARNING">
            Chủ trọ chưa phản hồi trong 24 giờ nên yêu cầu đã hết hạn.
          </Typography>
          {' Bạn không mất khoản nào. Có thể gửi lại hoặc xem phòng khác.'}
        </NoticeBanner>
      ) : null}
      {summary ? (
        <View style={styles.banner}>
          <Check size={19} color={THEME_COLORS.SUCCESS} />
          <Typography variant="body2" style={styles.bannerText} colorKey="SUCCESS">
            <Typography variant="body2" weight="SEMIBOLD" colorKey="SUCCESS">
              {summary.strong}
            </Typography>
            {summary.rest}
          </Typography>
        </View>
      ) : null}
      <View style={styles.card}>
        {timeline.map((item, index) => (
          <View key={item.label} style={styles.timelineRow}>
            <View style={styles.rail}>
              <View
                style={[
                  styles.dot,
                  item.completed
                    ? styles.dotDone
                    : item.failed
                      ? styles.dotFailed
                      : styles.dotPending,
                ]}
              >
                {item.completed ? <Check size={13} color={THEME_COLORS.WHITE} /> : null}
                {item.failed ? <X size={12} color={THEME_COLORS.WHITE} /> : null}
              </View>
              <View
                style={[
                  styles.line,
                  item.lineCompleted ? styles.lineDone : null,
                  index === timeline.length - 1 ? styles.lineHidden : null,
                ]}
              />
            </View>
            <View style={styles.timelineText}>
              <Typography
                variant="body2"
                weight="SEMIBOLD"
                color={
                  item.failed
                    ? OVERLAY_COLORS.EXPIRED_TEXT
                    : item.completed
                      ? THEME_COLORS.TEXT_PRIMARY
                      : OVERLAY_COLORS.STEP_PENDING_TEXT
                }
              >
                {item.label}
              </Typography>
              <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
                {item.value}
              </Typography>
            </View>
          </View>
        ))}
      </View>
      {isExpired ? (
        <View style={styles.card}>
          <StatusBadge status="expired" />
          <TouchableOpacity
            style={[styles.listingRow, styles.expiredListingRow]}
            onPress={onOpenListing}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={`Xem chi tiết phòng ${booking.listing.title}`}
          >
            {booking.listing.imageUrl ? (
              <Image
                source={{ uri: booking.listing.imageUrl }}
                style={[styles.thumb, styles.faded]}
              />
            ) : (
              <View style={[styles.thumb, styles.tint, styles.faded]} />
            )}
            <View style={styles.listingText}>
              <Typography variant="body2" weight="SEMIBOLD" numberOfLines={2}>
                {booking.listing.title}
              </Typography>
              <Typography
                variant="caption"
                weight="MEDIUM"
                colorKey="TEXT_PLACEHOLDER"
                numberOfLines={1}
              >
                {booking.landlord?.fullName
                  ? `${booking.landlord.fullName} · ${booking.listing.address}`
                  : booking.listing.address}
              </Typography>
              <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
                {`Đã đề nghị: ${formatCompactSlot(booking.startTime)}`}
              </Typography>
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />
          <InfoRow label="Mã yêu cầu" value={`#${booking.code}`} />
        </View>
      ) : (
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
                <View style={[styles.thumb, styles.tint]} />
              )}
              <View style={styles.listingText}>
                <Typography variant="body2" weight="SEMIBOLD" numberOfLines={2}>
                  {booking.listing.title}
                </Typography>
                <Typography variant="body1" weight="BOLD" colorKey="PRIMARY_DARK">
                  {`${booking.listing.price.toLocaleString('vi-VN')}đ `}
                  <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
                    /tháng
                  </Typography>
                </Typography>
              </View>
              <ChevronRight size={18} color={THEME_COLORS.TEXT_PLACEHOLDER} />
            </TouchableOpacity>
            <View style={styles.divider} />
            <InfoRow label="Mã yêu cầu" value={`#${booking.code}`} />
            <InfoRow label="Địa chỉ" value={booking.listing.address} />
            {booking.note ? <InfoRow label="Ghi chú của bạn" value={booking.note} regular /> : null}
          </View>
          {booking.landlord ? (
            <TouchableOpacity
              style={[styles.card, styles.landlordRow]}
              onPress={onOpenChat}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Nhắn tin với Chủ trọ"
            >
              <Avatar uri={booking.landlord.avatarUrl} name={booking.landlord.fullName} size="lg" />
              <View style={styles.listingText}>
                <Typography variant="body2" weight="SEMIBOLD">
                  {booking.landlord.fullName}
                </Typography>
                <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
                  Nhấn để nhắn tin với chủ trọ
                </Typography>
              </View>
            </TouchableOpacity>
          ) : null}
        </>
      )}
    </>
  );
};

const InfoRow = ({
  label,
  value,
  regular,
}: {
  label: string;
  value: string;
  regular?: boolean;
}) => (
  <View style={styles.infoRow}>
    <Typography variant="body2" style={styles.infoLabel} colorKey="TEXT_PLACEHOLDER">
      {label}
    </Typography>
    <Typography
      variant="body2"
      weight={regular ? 'REGULAR' : 'SEMIBOLD'}
      align="right"
      colorKey={regular ? 'TEXT_SECONDARY' : 'TEXT_PRIMARY'}
      style={styles.infoValue}
    >
      {value}
    </Typography>
  </View>
);

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: OVERLAY_COLORS.SUCCESS_BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.SUCCESS_LIGHT,
  },
  bannerText: { flex: 1 },
  card: {
    padding: 16,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
    shadowColor: OVERLAY_COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  timelineRow: { flexDirection: 'row', gap: 12, minHeight: 74 },
  rail: { width: 24, alignItems: 'center' },
  dot: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  dotDone: { backgroundColor: THEME_COLORS.SUCCESS },
  dotFailed: { backgroundColor: THEME_COLORS.ERROR },
  dotPending: {
    borderWidth: 2,
    borderColor: OVERLAY_COLORS.STEP_PENDING_BORDER,
    backgroundColor: THEME_COLORS.WHITE,
  },
  line: { flex: 1, width: 2, marginTop: 0, backgroundColor: THEME_COLORS.BORDER },
  lineDone: { backgroundColor: THEME_COLORS.SUCCESS },
  lineHidden: { backgroundColor: THEME_COLORS.TRANSPARENT },
  timelineText: { flex: 1, paddingTop: 1 },
  listingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 16 },
  thumb: { width: 64, height: 64, borderRadius: BORDER_RADIUS_TOKENS.MD },
  faded: { opacity: 0.7 },
  expiredListingRow: { paddingTop: 22, paddingBottom: 16 },
  tint: { backgroundColor: OVERLAY_COLORS.PLACEHOLDER_TINT },
  listingText: { flex: 1, gap: 2 },
  divider: { height: 1, backgroundColor: THEME_COLORS.SURFACE_MUTED, marginBottom: 14 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 16, paddingVertical: 7 },
  infoLabel: { fontSize: 13 },
  infoValue: { flex: 1, fontSize: 13 },
  landlordRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
