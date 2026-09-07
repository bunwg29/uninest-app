import { View, Image, TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Star, Heart, MapPin } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { THEME_COLORS, BORDER_RADIUS_TOKENS, SPACING_TOKENS } from '@theme';
import { Typography } from '../atoms/Typography';
import { Badge, BadgeVariant } from '../atoms/Badge';

export interface ListingCardProps {
  id: string;
  title: string;
  price: number;
  imageUrl?: string;
  areaSquareMeters?: number;
  capacity?: number;
  distanceMeters?: number;
  targetCampusName?: string;
  address?: string;
  rating?: number;
  reviewCount?: number;
  status?: 'available' | 'holding' | 'featured';
  matchPercentage?: number;
  isSaved?: boolean;
  onPress: () => void;
  onBookmarkPress?: () => void;
  style?: StyleProp<ViewStyle>;
  variant?: 'vertical' | 'horizontal';
}

export const ListingCard = ({
  title,
  price,
  imageUrl,
  areaSquareMeters,
  capacity,
  distanceMeters,
  targetCampusName,
  address,
  rating,
  reviewCount,
  status = 'available',
  matchPercentage,
  isSaved = false,
  onPress,
  onBookmarkPress,
  style,
  variant = 'vertical',
}: ListingCardProps) => {
  const { t } = useTranslation();

  const formattedPrice = `${price.toLocaleString('vi-VN')}đ`;
  const formattedDistance = formatDistance(distanceMeters, targetCampusName);
  const isHorizontal = variant === 'horizontal';

  const statusBadgeVariant: BadgeVariant =
    status === 'holding' ? 'holding' : status === 'featured' ? 'featured' : 'available';

  const statusLabel =
    status === 'holding'
      ? t('ui.holding')
      : status === 'featured'
        ? t('ui.featured')
        : t('ui.available');

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isHorizontal ? styles.horizontalContainer : styles.verticalContainer,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.88}
    >
      <View style={isHorizontal ? styles.horizontalImageWrapper : styles.imageWrapper}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderImage} />
        )}

        <View style={styles.topBadgesRow}>
          <Badge label={statusLabel} variant={statusBadgeVariant} size="sm" />

          {onBookmarkPress ? (
            <TouchableOpacity
              style={styles.bookmarkButton}
              onPress={onBookmarkPress}
              activeOpacity={0.8}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Heart
                size={16}
                color={isSaved ? THEME_COLORS.ERROR : THEME_COLORS.TEXT_SECONDARY}
                fill={isSaved ? THEME_COLORS.ERROR : THEME_COLORS.TRANSPARENT}
              />
            </TouchableOpacity>
          ) : null}
        </View>

        {matchPercentage ? (
          <View style={styles.matchBadgeWrapper}>
            <Badge label={`${t('ui.match')} ${matchPercentage}%`} variant="match" size="sm" />
          </View>
        ) : null}
      </View>

      <View style={styles.content}>
        <View style={styles.priceRow}>
          <Typography variant="h4" weight="BOLD" colorKey="TEXT_PRIMARY">
            {formattedPrice}
          </Typography>
          <Typography variant="caption" colorKey="TEXT_MUTED" style={styles.perMonthText}>
            {t('ui.perMonth')}
          </Typography>
        </View>

        <Typography
          variant="body2"
          weight="SEMIBOLD"
          colorKey="TEXT_PRIMARY"
          numberOfLines={2}
          style={styles.title}
        >
          {title}
        </Typography>

        {address ? (
          <View style={styles.addressRow}>
            <MapPin size={13} color={THEME_COLORS.TEXT_MUTED} style={styles.pinIcon} />
            <Typography
              variant="caption"
              colorKey="TEXT_MUTED"
              numberOfLines={1}
              style={styles.addressText}
            >
              {address}
            </Typography>
          </View>
        ) : null}

        <Typography
          variant="caption"
          colorKey="TEXT_SECONDARY"
          numberOfLines={1}
          style={styles.specsText}
        >
          {[
            areaSquareMeters ? `${areaSquareMeters} m²` : null,
            capacity ? `${capacity} ${t('common.appName') ? 'người' : ''}` : null,
            formattedDistance,
          ]
            .filter(Boolean)
            .join(' · ')}
        </Typography>

        {rating !== undefined ? (
          <View style={styles.ratingRow}>
            <Star size={13} color={THEME_COLORS.SECONDARY} fill={THEME_COLORS.SECONDARY} />
            <Typography
              variant="caption"
              weight="SEMIBOLD"
              colorKey="TEXT_PRIMARY"
              style={styles.ratingScore}
            >
              {rating.toFixed(1)}
            </Typography>
            {reviewCount !== undefined ? (
              <Typography variant="caption" colorKey="TEXT_PLACEHOLDER">
                ({reviewCount} {t('ui.reviews')})
              </Typography>
            ) : null}
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

function formatDistance(distanceMeters?: number, campusName?: string): string | null {
  if (distanceMeters === undefined) return null;

  const distText =
    distanceMeters >= 1000 ? `${(distanceMeters / 1000).toFixed(1)} km` : `${distanceMeters} m`;

  return campusName ? `cách ${campusName} ${distText}` : distText;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME_COLORS.SURFACE,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    overflow: 'hidden',
    shadowColor: '#171B22',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  verticalContainer: {
    width: '100%',
  },
  horizontalContainer: {
    flexDirection: 'row',
    width: '100%',
  },
  imageWrapper: {
    width: '100%',
    height: 160,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
    position: 'relative',
  },
  horizontalImageWrapper: {
    width: 120,
    height: '100%',
    minHeight: 130,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  topBadgesRow: {
    position: 'absolute',
    top: SPACING_TOKENS.SM,
    left: SPACING_TOKENS.SM,
    right: SPACING_TOKENS.SM,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookmarkButton: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.SURFACE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#171B22',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  matchBadgeWrapper: {
    position: 'absolute',
    bottom: SPACING_TOKENS.SM,
    left: SPACING_TOKENS.SM,
  },
  content: {
    flex: 1,
    padding: SPACING_TOKENS.MD,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING_TOKENS.XXS + 2,
  },
  perMonthText: {
    marginLeft: SPACING_TOKENS.XS,
  },
  title: {
    marginBottom: SPACING_TOKENS.XS,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING_TOKENS.XXS,
  },
  pinIcon: {
    marginRight: 4,
  },
  addressText: {
    flex: 1,
  },
  specsText: {
    marginBottom: SPACING_TOKENS.XS,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingScore: {
    marginLeft: 4,
    marginRight: 4,
  },
});
