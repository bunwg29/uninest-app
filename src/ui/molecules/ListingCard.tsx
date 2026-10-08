import { View, Image, TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Star, Heart, MapPin } from 'lucide-react-native';
import { THEME_COLORS, BORDER_RADIUS_TOKENS, SPACING_TOKENS, OVERLAY_COLORS } from '@theme';
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
  status?: 'available' | 'holding' | 'featured' | 'rented' | 'paused';
  matchPercentage?: number;
  isSaved?: boolean;
  onPress: () => void;
  onBookmarkPress?: () => void;
  style?: StyleProp<ViewStyle>;
  variant?: 'vertical' | 'horizontal';
  compact?: boolean;
}

const STATUS_BADGE_VARIANTS: Record<NonNullable<ListingCardProps['status']>, BadgeVariant> = {
  available: 'available',
  holding: 'holding',
  featured: 'featured',
  rented: 'neutral',
  paused: 'neutral',
};

const STATUS_LABELS: Record<NonNullable<ListingCardProps['status']>, string> = {
  available: 'Còn trống',
  holding: 'Đang giữ chỗ',
  featured: 'Nổi bật',
  rented: 'Đã cho thuê',
  paused: 'Ngừng nhận yêu cầu',
};

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
  compact = false,
}: ListingCardProps) => {
  const formattedPrice = `${price.toLocaleString('vi-VN')}đ`;
  const formattedDistance = formatDistance(distanceMeters, targetCampusName);
  const isHorizontal = variant === 'horizontal';

  const statusBadgeVariant: BadgeVariant = STATUS_BADGE_VARIANTS[status];
  const statusLabel = STATUS_LABELS[status];

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isHorizontal ? styles.horizontalContainer : styles.verticalContainer,
        isHorizontal && compact ? styles.compactHorizontalContainer : null,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.88}
    >
      <View
        style={[
          isHorizontal ? styles.horizontalImageWrapper : styles.imageWrapper,
          isHorizontal && compact ? styles.compactHorizontalImageWrapper : null,
        ]}
      >
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
            <Badge label={`Phù hợp ${matchPercentage}%`} variant="match" size="sm" />
          </View>
        ) : null}
      </View>

      <View style={[styles.content, compact && styles.compactContent]}>
        <View style={[styles.priceRow, compact && styles.compactPriceRow]}>
          <Typography variant="h4" weight="BOLD" colorKey="TEXT_PRIMARY">
            {formattedPrice}
          </Typography>
          <Typography variant="caption" colorKey="TEXT_MUTED" style={styles.perMonthText}>
            /tháng
          </Typography>
        </View>

        <Typography
          variant="body2"
          weight="SEMIBOLD"
          colorKey="TEXT_PRIMARY"
          numberOfLines={2}
          style={[styles.title, compact && styles.compactTitle]}
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
          style={[styles.specsText, compact && styles.compactSpecsText]}
        >
          {[
            areaSquareMeters ? `${areaSquareMeters} m²` : null,
            capacity ? `${capacity} người` : null,
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
                ({reviewCount} đánh giá)
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
    shadowColor: OVERLAY_COLORS.SHADOW,
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
  compactHorizontalContainer: {
    height: 138,
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
  compactHorizontalImageWrapper: {
    width: 108,
    minHeight: 0,
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
    shadowColor: OVERLAY_COLORS.SHADOW,
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
  compactContent: {
    minWidth: 0,
    padding: SPACING_TOKENS.SM,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING_TOKENS.XXS + 2,
  },
  compactPriceRow: {
    marginBottom: SPACING_TOKENS.XXS,
  },
  perMonthText: {
    marginLeft: SPACING_TOKENS.XS,
  },
  title: {
    marginBottom: SPACING_TOKENS.XS,
  },
  compactTitle: {
    marginBottom: SPACING_TOKENS.XXS,
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
  compactSpecsText: {
    marginBottom: SPACING_TOKENS.XXS,
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
