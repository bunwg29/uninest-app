import type { ReactNode } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { CalendarDays } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, THEME_COLORS } from '@theme';
import { Typography } from '@ui';
import type { Booking } from '../types';
import { formatCompactSlot } from '../utils';
import { CountdownTimer } from './CountdownTimer';
import { StatusBadge } from './StatusBadge';

interface BookingCardProps {
  booking: Booking;
  subtitle?: string;
  actions?: ReactNode;
  onPress: () => void;
  onExpire?: () => void;
}

export const BookingCard = ({
  booking,
  subtitle,
  actions,
  onPress,
  onExpire,
}: BookingCardProps) => {
  const shouldShowCountdown =
    booking.expiresAt !== null && (booking.status === 'pending' || booking.status === 'holding');
  const isSettled = booking.status === 'expired' || booking.status === 'cancelled';

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.pressable}>
        <View style={styles.headerRow}>
          <StatusBadge status={booking.status} />
          {shouldShowCountdown && booking.expiresAt ? (
            <CountdownTimer expiresAt={booking.expiresAt} onExpire={onExpire} />
          ) : (
            <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
              #{booking.code}
            </Typography>
          )}
        </View>

        <View style={styles.bodyRow}>
          {booking.listing.imageUrl ? (
            <Image
              source={{ uri: booking.listing.imageUrl }}
              style={[styles.image, isSettled && styles.imageSettled]}
            />
          ) : (
            <View style={[styles.image, styles.placeholder, isSettled && styles.imageSettled]} />
          )}

          <View style={styles.content}>
            <Typography variant="body2" weight="SEMIBOLD" numberOfLines={2}>
              {booking.listing.title}
            </Typography>
            <Typography
              variant="caption"
              weight="MEDIUM"
              colorKey="TEXT_PLACEHOLDER"
              numberOfLines={1}
              style={styles.meta}
            >
              {subtitle ?? booking.listing.address}
            </Typography>
            <View style={styles.slotRow}>
              <CalendarDays size={14} color={THEME_COLORS.PRIMARY_DARK} />
              <Typography variant="label" weight="SEMIBOLD" colorKey="PRIMARY_DARK">
                {formatCompactSlot(booking.startTime)}
              </Typography>
            </View>
          </View>
        </View>
      </TouchableOpacity>

      {actions ? <View style={styles.actions}>{actions}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
    shadowColor: OVERLAY_COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  pressable: { padding: 16, gap: 6 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bodyRow: { flexDirection: 'row', gap: 12, paddingTop: 6 },
  image: { width: 64, height: 64, borderRadius: BORDER_RADIUS_TOKENS.MD },
  imageSettled: { opacity: 0.7 },
  placeholder: { backgroundColor: OVERLAY_COLORS.PLACEHOLDER_TINT },
  content: { flex: 1 },
  meta: { marginTop: 2, letterSpacing: 0.2 },
  slotRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.SURFACE_MUTED,
  },
});
