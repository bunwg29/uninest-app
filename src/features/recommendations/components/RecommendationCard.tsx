import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Star } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { MediaThumbnail, PriceText, SaveButton, Typography } from '@ui';

export const RECOMMENDATION_CARD_WIDTH = 280;

const IMAGE_HEIGHT = 160;

export type RecommendationAvailability = 'available' | 'rented' | 'paused';

export interface RecommendationCardProps {
  title: string;
  price: number;
  imageUrl?: string | null;
  areaSquareMeters?: number;
  capacity?: number;
  distanceMeters?: number | null;
  campusShortName?: string;
  rating?: number;
  reviewCount?: number;
  availability: RecommendationAvailability;
  isHighlighted?: boolean;
  matchPercentage?: number;
  isSaved?: boolean;
  onPress: () => void;
  onToggleSaved?: () => void;
}

interface AvailabilityStyle {
  label: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
}

const AVAILABILITY_STYLES: Record<RecommendationAvailability, AvailabilityStyle> = {
  available: {
    label: 'Còn trống',
    backgroundColor: THEME_COLORS.SUCCESS_LIGHT,
    borderColor: OVERLAY_COLORS.SUCCESS_BORDER,
    textColor: THEME_COLORS.SUCCESS,
  },
  rented: {
    label: 'Đã cho thuê',
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
    borderColor: THEME_COLORS.BORDER,
    textColor: THEME_COLORS.TEXT_MUTED,
  },
  paused: {
    label: 'Ngừng nhận yêu cầu',
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
    borderColor: THEME_COLORS.BORDER,
    textColor: THEME_COLORS.TEXT_MUTED,
  },
};

const formatDecimal = (value: number, fractionDigits: number): string =>
  value.toFixed(fractionDigits).replace('.', ',');

const formatDistance = (
  distanceMeters?: number | null,
  campusShortName?: string
): string | null => {
  if (distanceMeters === undefined || distanceMeters === null) return null;

  const distance =
    distanceMeters >= 1000
      ? `${formatDecimal(distanceMeters / 1000, 1)} km`
      : `${distanceMeters} m`;

  return campusShortName ? `cách ${campusShortName} ${distance}` : distance;
};

export const RecommendationCard = ({
  title,
  price,
  imageUrl,
  areaSquareMeters,
  capacity,
  distanceMeters,
  campusShortName,
  rating,
  reviewCount,
  availability,
  isHighlighted = false,
  matchPercentage,
  isSaved = false,
  onPress,
  onToggleSaved,
}: RecommendationCardProps) => {
  const availabilityStyle = AVAILABILITY_STYLES[availability];
  const specs = [
    areaSquareMeters ? `${areaSquareMeters} m²` : null,
    capacity ? `${capacity} người` : null,
    formatDistance(distanceMeters, campusShortName),
  ]
    .filter(Boolean)
    .join(' · ');
  const placeholderColors = isHighlighted
    ? ([OVERLAY_COLORS.AMBER_GRADIENT_START, THEME_COLORS.WARNING_LIGHT] as const)
    : ([OVERLAY_COLORS.INFO_BORDER, THEME_COLORS.PRIMARY_LIGHT] as const);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.88}
      accessibilityLabel={title}
    >
      <View style={styles.imageWrapper}>
        <MediaThumbnail uri={imageUrl} placeholderColors={placeholderColors} style={styles.image} />

        {matchPercentage ? (
          <View style={styles.overlayPill}>
            <Typography
              variant="tiny"
              weight="SEMIBOLD"
              color={THEME_COLORS.PRIMARY_DARK}
              style={styles.pillText}
            >
              {`Phù hợp ${matchPercentage}%`}
            </Typography>
          </View>
        ) : isHighlighted ? (
          <View style={[styles.overlayPill, styles.featuredPill]}>
            <Typography
              variant="tiny"
              weight="SEMIBOLD"
              color={THEME_COLORS.TEXT_PRIMARY}
              style={styles.pillText}
            >
              Nổi bật
            </Typography>
          </View>
        ) : null}

        {onToggleSaved ? (
          <SaveButton
            isSaved={isSaved}
            onPress={onToggleSaved}
            size={17}
            activeOpacity={0.8}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            style={styles.heartButton}
          />
        ) : null}
      </View>

      <View style={styles.content}>
        <View
          style={[
            styles.availabilityPill,
            {
              backgroundColor: availabilityStyle.backgroundColor,
              borderColor: availabilityStyle.borderColor,
            },
          ]}
        >
          <Typography
            variant="tiny"
            weight="SEMIBOLD"
            color={availabilityStyle.textColor}
            style={styles.pillText}
          >
            {availabilityStyle.label}
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

        <PriceText
          price={`${price.toLocaleString('vi-VN')}đ`}
          variant="h4"
          style={styles.priceRow}
        />

        {specs ? (
          <Typography
            variant="caption"
            colorKey="TEXT_MUTED"
            numberOfLines={1}
            style={styles.specs}
          >
            {specs}
          </Typography>
        ) : null}

        {rating !== undefined ? (
          <View style={styles.ratingRow}>
            <Star size={14} color={THEME_COLORS.SECONDARY} fill={THEME_COLORS.SECONDARY} />

            <Typography
              variant="caption"
              weight="SEMIBOLD"
              colorKey="TEXT_PRIMARY"
              style={styles.ratingScore}
            >
              {formatDecimal(rating, 1)}
            </Typography>

            {reviewCount !== undefined ? (
              <Typography variant="caption" colorKey="TEXT_PLACEHOLDER" style={styles.ratingText}>
                {`(${reviewCount} đánh giá)`}
              </Typography>
            ) : null}
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: RECOMMENDATION_CARD_WIDTH,
    backgroundColor: THEME_COLORS.SURFACE,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    overflow: 'hidden',
    shadowColor: OVERLAY_COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  imageWrapper: {
    width: '100%',
    height: IMAGE_HEIGHT,
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlayPill: {
    position: 'absolute',
    top: SPACING_TOKENS.MD - SPACING_TOKENS.XS,
    left: SPACING_TOKENS.MD - SPACING_TOKENS.XS,
    height: 22,
    paddingHorizontal: SPACING_TOKENS.SM,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: OVERLAY_COLORS.FLOATING_BUTTON,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredPill: {
    backgroundColor: THEME_COLORS.SECONDARY,
  },
  pillText: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  heartButton: {
    position: 'absolute',
    top: SPACING_TOKENS.MD - SPACING_TOKENS.XS,
    right: SPACING_TOKENS.MD - SPACING_TOKENS.XS,
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: OVERLAY_COLORS.FLOATING_BUTTON,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: SPACING_TOKENS.MD - SPACING_TOKENS.XS,
  },
  availabilityPill: {
    alignSelf: 'flex-start',
    height: 22,
    paddingHorizontal: SPACING_TOKENS.SM,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 7,
    minHeight: 40,
  },
  priceRow: {
    marginTop: SPACING_TOKENS.XS + 1,
  },
  specs: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  ratingScore: {
    marginLeft: SPACING_TOKENS.XS,
    fontSize: 13,
    lineHeight: 20,
  },
  ratingText: {
    marginLeft: SPACING_TOKENS.XS + 2,
    fontSize: 13,
    lineHeight: 20,
  },
});
