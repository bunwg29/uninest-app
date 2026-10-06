import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Heart } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, THEME_COLORS } from '@theme';
import { GradientView, Typography } from '@ui';
import type { SearchListingItem } from '../types';
import { formatFullPrice, getCardStatus, getPlaceholderGradient } from '../utils';
import { StatusPill } from './StatusPill';

interface SavedRoomRowProps {
  listing: SearchListingItem;
  onPress: () => void;
  onRemove: () => void;
}

export const SavedRoomRow = ({ listing, onPress, onRemove }: SavedRoomRowProps) => {
  const status = getCardStatus(listing);
  const isUnavailable = status === 'rented' || status === 'paused';
  const specs = [listing.area ? `${listing.area} m²` : null, listing.address]
    .filter(Boolean)
    .join(' · ');

  return (
    <TouchableOpacity
      style={[styles.card, isUnavailable && styles.unavailable]}
      onPress={onPress}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel={`${listing.title}, ${formatFullPrice(listing.price)} mỗi tháng`}
    >
      <View style={styles.thumbnailWrapper}>
        {listing.thumbnail ? (
          <Image source={{ uri: listing.thumbnail }} style={styles.thumbnail} resizeMode="cover" />
        ) : (
          <GradientView colors={getPlaceholderGradient(listing)} style={styles.thumbnail} />
        )}

        {isUnavailable ? (
          <View style={styles.thumbnailOverlay}>
            <View style={styles.unavailablePill}>
              <Typography
                variant="tiny"
                weight="SEMIBOLD"
                color={THEME_COLORS.WHITE}
                style={styles.pillText}
              >
                {status === 'rented' ? 'ĐÃ THUÊ' : 'TẠM NGỪNG'}
              </Typography>
            </View>
          </View>
        ) : null}
      </View>

      <View style={styles.content}>
        {isUnavailable ? null : (
          <View style={styles.badges}>
            <StatusPill status={status} />
          </View>
        )}

        <Typography variant="body2" weight="SEMIBOLD" numberOfLines={2} style={styles.title}>
          {listing.title}
        </Typography>

        <View style={styles.priceRow}>
          <Typography
            variant="h4"
            weight="BOLD"
            colorKey={isUnavailable ? 'TEXT_PLACEHOLDER' : 'PRIMARY_DARK'}
            style={styles.price}
          >
            {formatFullPrice(listing.price)}
          </Typography>
          <Typography variant="caption" colorKey="TEXT_PLACEHOLDER">
            /tháng
          </Typography>
        </View>

        {specs ? (
          <Typography
            variant="caption"
            weight="MEDIUM"
            colorKey="TEXT_PLACEHOLDER"
            numberOfLines={1}
            style={styles.specs}
          >
            {specs}
          </Typography>
        ) : null}
      </View>

      <TouchableOpacity
        onPress={onRemove}
        hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
        accessibilityRole="button"
        accessibilityLabel="Bỏ lưu phòng"
      >
        <Heart
          size={22}
          color={isUnavailable ? OVERLAY_COLORS.FIELD_BORDER : THEME_COLORS.ERROR}
          fill={isUnavailable ? OVERLAY_COLORS.FIELD_BORDER : THEME_COLORS.ERROR}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    minHeight: 112,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
    shadowColor: OVERLAY_COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  unavailable: { opacity: 0.72 },
  thumbnailWrapper: { width: 88, height: 88 },
  thumbnail: { width: 88, height: 88, borderRadius: BORDER_RADIUS_TOKENS.MD },
  thumbnailOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: OVERLAY_COLORS.SHEET_BACKDROP,
  },
  unavailablePill: {
    height: 20,
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: OVERLAY_COLORS.RENTED_PILL,
  },
  pillText: { fontSize: 10, lineHeight: 14, letterSpacing: 0.5 },
  content: { flex: 1, minWidth: 0 },
  badges: { flexDirection: 'row', marginBottom: 4 },
  title: { lineHeight: 20 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 4 },
  price: { fontSize: 16, lineHeight: 24 },
  specs: { marginTop: 2, letterSpacing: 0.2 },
});
