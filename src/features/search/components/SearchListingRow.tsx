import { StyleSheet, TouchableOpacity, View, type StyleProp, type ViewStyle } from 'react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, THEME_COLORS } from '@theme';
import { MediaThumbnail, PriceText, SaveButton, Typography } from '@ui';
import type { SearchListingItem } from '../types';
import {
  formatFullPrice,
  formatListingSpecs,
  getCardStatus,
  getPlaceholderGradient,
} from '../utils';
import { StatusPill } from './StatusPill';

interface SearchListingRowProps {
  listing: SearchListingItem;
  isSaved: boolean;
  specsText?: string;
  distanceSuffix?: string;
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
  onPress: () => void;
  onToggleSaved: () => void;
}

export const SearchListingRow = ({
  listing,
  isSaved,
  specsText,
  distanceSuffix,
  elevated = true,
  style,
  onPress,
  onToggleSaved,
}: SearchListingRowProps) => {
  const status = getCardStatus(listing);
  const showFeaturedBadge = status !== 'featured' && listing.isHighlighted;

  return (
    <TouchableOpacity
      style={[styles.card, elevated ? styles.elevated : styles.outlined, style]}
      onPress={onPress}
      activeOpacity={0.88}
      accessibilityRole="button"
      accessibilityLabel={`${listing.title}, ${formatFullPrice(listing.price)} mỗi tháng`}
    >
      <MediaThumbnail
        uri={listing.thumbnail}
        placeholderColors={getPlaceholderGradient(listing)}
        style={styles.thumbnail}
      />

      <View style={styles.content}>
        <View style={styles.badges}>
          <StatusPill status={status} />
          {showFeaturedBadge ? <StatusPill status="featured" /> : null}
        </View>

        <Typography variant="body2" weight="SEMIBOLD" numberOfLines={2} style={styles.title}>
          {listing.title}
        </Typography>

        <PriceText
          price={formatFullPrice(listing.price)}
          variant="h4"
          priceStyle={styles.price}
          style={styles.priceRow}
        />

        <Typography
          variant="caption"
          weight="MEDIUM"
          colorKey="TEXT_PLACEHOLDER"
          numberOfLines={2}
          style={styles.specs}
        >
          {specsText ?? formatListingSpecs(listing, true, distanceSuffix)}
        </Typography>
      </View>

      <SaveButton
        isSaved={isSaved}
        onPress={onToggleSaved}
        size={20}
        inactiveColor={THEME_COLORS.TEXT_PLACEHOLDER}
        hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
        style={styles.heartButton}
      />
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
  },
  elevated: {
    shadowColor: OVERLAY_COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  outlined: { borderWidth: 1, borderColor: THEME_COLORS.BORDER },
  thumbnail: {
    width: 88,
    height: 88,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  content: { flex: 1, minWidth: 0 },
  badges: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  title: { lineHeight: 20 },
  priceRow: { marginTop: 4 },
  price: { fontSize: 16, lineHeight: 24 },
  specs: { marginTop: 2, letterSpacing: 0.2 },
  heartButton: { alignSelf: 'flex-start', padding: 2 },
});
