import type { ReactNode } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { CalendarDays, ImageOff } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
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

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.pressable}>
        <View style={styles.headerRow}>
          <StatusBadge status={booking.status} />
          {shouldShowCountdown && booking.expiresAt ? (
            <CountdownTimer expiresAt={booking.expiresAt} onExpire={onExpire} />
          ) : (
            <Typography variant="caption" colorKey="TEXT_MUTED">
              #{booking.code}
            </Typography>
          )}
        </View>

        <View style={styles.bodyRow}>
          {booking.listing.imageUrl ? (
            <Image source={{ uri: booking.listing.imageUrl }} style={styles.image} />
          ) : (
            <View style={[styles.image, styles.placeholder]}>
              <ImageOff size={22} color={THEME_COLORS.TEXT_PLACEHOLDER} />
            </View>
          )}

          <View style={styles.content}>
            <Typography variant="body1" weight="BOLD" numberOfLines={2}>
              {booking.listing.title}
            </Typography>
            <Typography variant="caption" colorKey="TEXT_MUTED" numberOfLines={1}>
              {subtitle ?? booking.listing.address}
            </Typography>
            <View style={styles.slotRow}>
              <CalendarDays size={14} color={THEME_COLORS.PRIMARY} />
              <Typography variant="body2" weight="BOLD" colorKey="PRIMARY">
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
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
    overflow: 'hidden',
  },
  pressable: { padding: SPACING_TOKENS.MD, gap: SPACING_TOKENS.SM },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bodyRow: { flexDirection: 'row', gap: SPACING_TOKENS.MD },
  image: { width: 64, height: 64, borderRadius: BORDER_RADIUS_TOKENS.MD },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  content: { flex: 1, gap: SPACING_TOKENS.XXS },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.XS,
    marginTop: SPACING_TOKENS.XXS,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING_TOKENS.SM,
    padding: SPACING_TOKENS.MD,
    paddingTop: SPACING_TOKENS.SM,
    borderTopWidth: 1,
    borderTopColor: THEME_COLORS.DIVIDER,
  },
});
