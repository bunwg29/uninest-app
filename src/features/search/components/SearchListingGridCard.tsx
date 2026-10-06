import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Heart } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, THEME_COLORS } from '@theme';
import { GradientView, Typography } from '@ui';
import type { SearchListingItem } from '../types';
import {
  formatFullPrice,
  formatListingDistance,
  getCardStatus,
  getPlaceholderGradient,
} from '../utils';
import { StatusPill } from './StatusPill';

interface SearchListingGridCardProps {
  listing: SearchListingItem;
  isSaved: boolean;
  distanceSuffix?: string;
  onPress: () => void;
  onToggleSaved: () => void;
}

export const SearchListingGridCard = ({
  listing,
  isSaved,
  distanceSuffix = 'tới trường',
  onPress,
  onToggleSaved,
}: SearchListingGridCardProps) => {
  const status = getCardStatus(listing);
  const distance = formatListingDistance(listing.distanceMeters);
  const specs = [
    listing.area ? `${listing.area} m²` : null,
    distance ? `${distance} ${distanceSuffix}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel={`${listing.title}, ${formatFullPrice(listing.price)} mỗi tháng`}
    >
      <View style={styles.imageWrapper}>
        {listing.thumbnail ? (
          <Image source={{ uri: listing.thumbnail }} style={styles.image} resizeMode="cover" />
        ) : (
          <GradientView colors={getPlaceholderGradient(listing)} style={styles.image} />
        )}

        <View style={styles.statusPill}>
          <StatusPill status={status} compact />
        </View>

        <TouchableOpacity
          style={styles.heartButton}
          onPress={onToggleSaved}
          hitSlop={{ top: 6, right: 6, bottom: 6, left: 6 }}
          accessibilityRole="button"
          accessibilityLabel={isSaved ? 'Bỏ lưu phòng' : 'Lưu phòng'}
        >
          <Heart
            size={15}
            color={isSaved ? THEME_COLORS.ERROR : THEME_COLORS.TEXT_SECONDARY}
            fill={isSaved ? THEME_COLORS.ERROR : THEME_COLORS.TRANSPARENT}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Typography variant="body2" weight="SEMIBOLD" numberOfLines={2} style={styles.title}>
          {listing.title}
        </Typography>

        <View style={styles.priceRow}>
          <Typography variant="body2" weight="BOLD" colorKey="PRIMARY_DARK" style={styles.price}>
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
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
    shadowColor: OVERLAY_COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  imageWrapper: { height: 120, backgroundColor: THEME_COLORS.SURFACE_MUTED },
  image: { width: '100%', height: '100%' },
  statusPill: { position: 'absolute', top: 12, left: 12 },
  heartButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: OVERLAY_COLORS.FLOATING_BUTTON,
  },
  content: { padding: 12, paddingTop: 12 },
  title: { fontSize: 13, lineHeight: 19, minHeight: 38 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginTop: 6 },
  price: { fontSize: 14, lineHeight: 22 },
  specs: { marginTop: 4, letterSpacing: 0.2 },
});
