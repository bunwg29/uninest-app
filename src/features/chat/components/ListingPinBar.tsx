import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Pin } from 'lucide-react-native';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS } from '@theme';
import { Typography } from '@ui';
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
      <View style={[styles.thumbnail, styles.thumbnailPlaceholder]} />
    )}

    <View style={styles.info}>
      <Typography variant="body2" weight="SEMIBOLD" numberOfLines={1}>
        {listing.title}
      </Typography>

      <View style={styles.priceRow}>
        <Typography variant="body2" weight="BOLD" colorKey="PRIMARY_DARK">
          {formatVND(listing.price)}
        </Typography>

        <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
          {` · ${getListingStatusLabel(listing.status)}`}
        </Typography>
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING_TOKENS.MD,
    paddingVertical: SPACING_TOKENS.SM + 2,
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
  thumbnailPlaceholder: {
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
  },
  info: {
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
