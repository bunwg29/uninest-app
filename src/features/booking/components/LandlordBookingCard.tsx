import type { ReactNode } from 'react';
import { Image, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { CalendarDays } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, THEME_COLORS } from '@theme';
import { GradientAvatar, GradientView, Typography } from '@ui';
import type { Booking } from '../types';
import { EXPIRING_SOON_HOURS, formatViewingDayMonth, getHoursUntil } from '../utils';
import { formatRemaining } from './CountdownTimer';
import { StatusBadge } from './StatusBadge';

const MONO_FONT = Platform.select({ ios: 'Courier New', default: 'monospace' });

const getPendingLabel = (booking: Booking) => {
  if (booking.status !== 'pending' || !booking.expiresAt) return null;

  const remainingMs = Math.max(0, new Date(booking.expiresAt).getTime() - Date.now());
  const isUrgent = getHoursUntil(booking.expiresAt) <= EXPIRING_SOON_HOURS;

  return {
    isUrgent,
    text: isUrgent ? `${formatRemaining(remainingMs)} để trả lời` : formatRemaining(remainingMs),
  };
};

export const LandlordBookingCard = ({
  booking,
  actions,
  onPress,
}: {
  booking: Booking;
  actions?: ReactNode;
  onPress: () => void;
}) => {
  const pendingLabel = getPendingLabel(booking);
  const isUrgent = pendingLabel?.isUrgent ?? false;
  const isSettled =
    booking.status === 'expired' || booking.status === 'cancelled' || booking.status === 'rejected';

  return (
    <View
      style={[styles.card, isUrgent && styles.cardUrgent]}
      testID={`landlord-booking-${booking.id}`}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={styles.pressable}
        accessibilityRole="button"
        accessibilityLabel={`Xem yêu cầu ${booking.code}`}
      >
        <View style={styles.headerRow}>
          {pendingLabel ? (
            <View style={[styles.pill, isUrgent ? styles.pillUrgent : styles.pillInfo]}>
              <Typography
                variant="tiny"
                weight="BOLD"
                color={isUrgent ? THEME_COLORS.WARNING : THEME_COLORS.PRIMARY_DARK}
                style={styles.pillText}
              >
                {pendingLabel.text.toUpperCase()}
              </Typography>
            </View>
          ) : (
            <StatusBadge status={booking.status} />
          )}

          <Typography variant="caption" colorKey="TEXT_PLACEHOLDER" style={styles.code}>
            #{booking.code}
          </Typography>
        </View>

        <View style={styles.studentRow}>
          <GradientAvatar
            name={booking.student?.fullName}
            uri={booking.student?.avatarUrl}
            size={48}
          />
          <View style={styles.studentText}>
            <Typography
              variant="body2"
              weight="SEMIBOLD"
              numberOfLines={1}
              style={styles.studentName}
            >
              {booking.student?.fullName ?? 'Sinh viên'}
            </Typography>
            {booking.student?.phone ? (
              <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
                {booking.student.phone}
              </Typography>
            ) : null}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.slotBlock}>
          <View style={styles.slotRow}>
            <CalendarDays size={16} color={THEME_COLORS.PRIMARY_DARK} />
            <Typography variant="body2" weight="SEMIBOLD" colorKey="PRIMARY_DARK">
              {formatViewingDayMonth(booking.startTime)}
            </Typography>
          </View>

          <View style={styles.listingRow}>
            {booking.listing.imageUrl ? (
              <Image
                source={{ uri: booking.listing.imageUrl }}
                style={[styles.listingThumb, isSettled && styles.settled]}
              />
            ) : (
              <GradientView
                colors={[OVERLAY_COLORS.SUCCESS_BORDER, THEME_COLORS.SUCCESS_LIGHT]}
                style={styles.listingThumb}
              />
            )}
            <Typography
              variant="body2"
              colorKey="TEXT_MUTED"
              numberOfLines={1}
              style={styles.listingTitle}
            >
              {booking.listing.title}
            </Typography>
          </View>
        </View>

        {booking.note ? (
          <View style={styles.note}>
            <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
              GHI CHÚ CỦA SINH VIÊN
            </Typography>
            <Typography variant="body2" colorKey="TEXT_SECONDARY" style={styles.noteText}>
              {booking.note}
            </Typography>
          </View>
        ) : null}
      </TouchableOpacity>

      {actions ? <View style={styles.actions}>{actions}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    borderWidth: 1,
    borderColor: THEME_COLORS.TRANSPARENT,
    backgroundColor: THEME_COLORS.SURFACE,
    shadowColor: OVERLAY_COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardUrgent: { borderColor: OVERLAY_COLORS.WARNING_BORDER },
  pressable: { gap: 12, padding: 16 },
  headerRow: {
    height: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pill: {
    height: 22,
    paddingHorizontal: 9,
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    borderWidth: 1,
  },
  pillUrgent: {
    borderColor: OVERLAY_COLORS.WARNING_BORDER,
    backgroundColor: THEME_COLORS.WARNING_LIGHT,
  },
  pillInfo: {
    borderColor: OVERLAY_COLORS.INFO_BORDER,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  pillText: { fontSize: 11, lineHeight: 14, letterSpacing: 0.5 },
  code: { fontFamily: MONO_FONT, letterSpacing: 0.2 },
  studentRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  studentText: { flex: 1, gap: 2 },
  studentName: { lineHeight: 22 },
  divider: { height: 1, backgroundColor: THEME_COLORS.DIVIDER },
  slotBlock: { gap: 8 },
  slotRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  listingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  listingThumb: { width: 24, height: 24, borderRadius: 6, overflow: 'hidden' },
  settled: { opacity: 0.7 },
  listingTitle: { flex: 1, fontSize: 13 },
  note: {
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: THEME_COLORS.BACKGROUND,
  },
  noteText: { fontSize: 13, lineHeight: 20 },
  actions: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, paddingBottom: 16 },
});
