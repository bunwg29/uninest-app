import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { formatFullPrice } from '@core';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { MediaThumbnail, Typography } from '@ui';
import type { ListingDetail } from '@features/listings';

interface AiListingCardProps {
  index: number;
  listing: ListingDetail;
  onPress: () => void;
}

const formatRating = (listing: ListingDetail): string | null => {
  if (listing.averageRating === null) return null;

  const score = listing.averageRating.toFixed(1).replace('.', ',');

  return listing.reviewCount ? `★ ${score} (${listing.reviewCount})` : `★ ${score}`;
};

export const AiListingCard = ({ index, listing, onPress }: AiListingCardProps) => {
  const cover = listing.images.find((image) => image.isCover) ?? listing.images[0];
  const meta = [listing.address.wardName ?? listing.address.provinceName, formatRating(listing)]
    .filter(Boolean)
    .join(' · ');

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`Phòng ${index}: ${listing.title}`}
    >
      <View style={styles.indexBadge}>
        <Typography variant="tiny" weight="BOLD" color={THEME_COLORS.PRIMARY_DARK}>
          {String(index)}
        </Typography>
      </View>

      <MediaThumbnail
        uri={cover?.url}
        placeholderColors={[OVERLAY_COLORS.INFO_BORDER, THEME_COLORS.PRIMARY_LIGHT]}
        style={styles.thumbnail}
      />

      <View style={styles.content}>
        <Typography variant="label" weight="SEMIBOLD" colorKey="TEXT_PRIMARY" numberOfLines={2}>
          {listing.title}
        </Typography>

        <View style={styles.priceRow}>
          <Typography variant="body2" weight="BOLD" color={THEME_COLORS.PRIMARY_DARK}>
            {formatFullPrice(listing.price)}
          </Typography>

          <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
            {` · ${listing.area} m²`}
          </Typography>
        </View>

        {meta ? (
          <Typography
            variant="caption"
            weight="MEDIUM"
            colorKey="TEXT_PLACEHOLDER"
            numberOfLines={2}
          >
            {meta}
          </Typography>
        ) : null}
      </View>

      <ChevronRight size={16} color={THEME_COLORS.TEXT_PLACEHOLDER} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    minHeight: 112,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: SPACING_TOKENS.SM + 4,
    paddingLeft: SPACING_TOKENS.SM,
    paddingRight: SPACING_TOKENS.SM + 4,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  indexBadge: {
    width: 20,
    height: 20,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 10,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    gap: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
  },
});
