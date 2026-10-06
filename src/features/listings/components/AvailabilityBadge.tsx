import { StyleSheet, View } from 'react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, THEME_COLORS, TYPOGRAPHY_TOKENS } from '@theme';
import { Typography } from '@ui';
import type { ListingAvailability } from '../types';

const BADGE_HEIGHT = 22;
const BADGE_PADDING = 8;

const AVAILABILITY_BADGES: Record<
  ListingAvailability,
  {
    label: string;
    backgroundColor: string;
    borderColor: string;
    textColor: string;
  }
> = {
  available: {
    label: 'CÒN TRỐNG',
    backgroundColor: THEME_COLORS.SUCCESS_LIGHT,
    borderColor: OVERLAY_COLORS.SUCCESS_BORDER,
    textColor: THEME_COLORS.SUCCESS,
  },
  holding: {
    label: 'ĐANG GIỮ CHỖ',
    backgroundColor: THEME_COLORS.WARNING_LIGHT,
    borderColor: OVERLAY_COLORS.WARNING_BORDER,
    textColor: THEME_COLORS.WARNING,
  },
  rented: {
    label: 'ĐÃ CHO THUÊ',
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
    borderColor: THEME_COLORS.SURFACE_MUTED,
    textColor: THEME_COLORS.TEXT_MUTED,
  },
  paused: {
    label: 'NGỪNG NHẬN YÊU CẦU',
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
    borderColor: THEME_COLORS.SURFACE_MUTED,
    textColor: THEME_COLORS.TEXT_MUTED,
  },
};

interface AvailabilityBadgeProps {
  availability: ListingAvailability;
}

export const AvailabilityBadge = ({ availability }: AvailabilityBadgeProps) => {
  const badge = AVAILABILITY_BADGES[availability];

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: badge.backgroundColor, borderColor: badge.borderColor },
      ]}
    >
      <Typography variant="caption" weight="SEMIBOLD" color={badge.textColor} style={styles.text}>
        {badge.label}
      </Typography>
    </View>
  );
};

export const FeaturedBadge = () => (
  <View
    style={[
      styles.badge,
      { backgroundColor: THEME_COLORS.SECONDARY, borderColor: THEME_COLORS.SECONDARY },
    ]}
  >
    <Typography variant="caption" weight="SEMIBOLD" colorKey="TEXT_PRIMARY" style={styles.text}>
      NỔI BẬT
    </Typography>
  </View>
);

const styles = StyleSheet.create({
  badge: {
    height: BADGE_HEIGHT,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: BADGE_PADDING,
    borderWidth: 1,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
  },
  text: {
    fontSize: TYPOGRAPHY_TOKENS.FONT_SIZES.CAPTION_SM,
    lineHeight: TYPOGRAPHY_TOKENS.LINE_HEIGHTS.TINY,
    letterSpacing: 0.5,
  },
});
