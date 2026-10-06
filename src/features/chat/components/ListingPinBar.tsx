import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Pin } from 'lucide-react-native';
import {
  THEME_COLORS,
  SPACING_TOKENS,
  BORDER_RADIUS_TOKENS,
  OVERLAY_COLORS,
  TYPOGRAPHY_TOKENS,
} from '@theme';
import { GradientView, Typography } from '@ui';
import { formatVND } from '@core';
import { getListingStatusLabel } from '../services/chatFormatters';
import type { ChatListingSummary } from '../types';

export interface ListingPinBarProps {
  listing: ChatListingSummary;
  onPress?: () => void;
}

export const ListingPinBar = ({ listing, onPress }: ListingPinBarProps) => (
  <TouchableOpacity
    style={styles.container}
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={0.85}
    accessibilityRole={onPress ? 'button' : undefined}
    accessibilityLabel={onPress ? `Xem chi tiết phòng ${listing.title}` : undefined}
  >
    <Pin size={16} color={THEME_COLORS.TEXT_PLACEHOLDER} />

    {listing.coverImageUrl ? (
      <Image source={{ uri: listing.coverImageUrl }} style={styles.thumbnail} />
    ) : (
      <GradientView
        colors={[OVERLAY_COLORS.INFO_BORDER, THEME_COLORS.PRIMARY_LIGHT]}
        style={styles.thumbnail}
      />
    )}

    <View style={styles.info}>
      <Typography variant="body2" weight="SEMIBOLD" numberOfLines={1} style={styles.title}>
        {listing.title}
      </Typography>

      <View style={styles.priceRow}>
        <Typography variant="body2" weight="BOLD" colorKey="PRIMARY_DARK" style={styles.price}>
          {formatVND(listing.price)}
        </Typography>

        <Typography
          variant="caption"
          weight="MEDIUM"
          colorKey="TEXT_PLACEHOLDER"
          style={styles.status}
        >
          {` · ${getListingStatusLabel(listing.status)}`}
        </Typography>
      </View>
    </View>

    {onPress ? (
      <View style={styles.viewButton}>
        <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_SECONDARY">
          Xem
        </Typography>
      </View>
    ) : null}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingVertical: 12,
    backgroundColor: THEME_COLORS.SURFACE,
    borderBottomWidth: 1,
    borderBottomColor: THEME_COLORS.BORDER,
    gap: SPACING_TOKENS.SM + 2,
  },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS_TOKENS.SM,
  },
  info: {
    flex: 1,
    gap: SPACING_TOKENS.XXS,
  },
  title: {
    fontSize: TYPOGRAPHY_TOKENS.FONT_SIZES.SUB,
    lineHeight: TYPOGRAPHY_TOKENS.LINE_HEIGHTS.SUB,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: TYPOGRAPHY_TOKENS.FONT_SIZES.SUB,
    lineHeight: 22,
  },
  status: {
    letterSpacing: 0.2,
  },
  viewButton: {
    height: 32,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    borderWidth: 1,
    borderColor: OVERLAY_COLORS.FIELD_BORDER,
    backgroundColor: THEME_COLORS.SURFACE,
  },
});
