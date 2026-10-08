import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, THEME_COLORS } from '@theme';
import { MediaThumbnail, PriceText, SaveButton, Typography } from '@ui';
import type { SearchListingItem } from '../types';
import { getCardStatus, getPlaceholderGradient } from '../utils';
import { StatusPill } from './StatusPill';
import { formatFullPrice } from '@core';

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
        <MediaThumbnail
          uri={listing.thumbnail}
          placeholderColors={getPlaceholderGradient(listing)}
          style={styles.thumbnail}
        />

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

        <PriceText
          price={formatFullPrice(listing.price)}
          variant="h4"
          priceColorKey={isUnavailable ? 'TEXT_PLACEHOLDER' : 'PRIMARY_DARK'}
          priceStyle={styles.price}
          style={styles.priceRow}
        />

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

      <SaveButton
        isSaved
        onPress={onRemove}
        size={22}
        activeColor={isUnavailable ? OVERLAY_COLORS.FIELD_BORDER : THEME_COLORS.ERROR}
        hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
        accessibilityLabel="Bỏ lưu phòng"
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
  priceRow: { marginTop: 4 },
  price: { fontSize: 16, lineHeight: 24 },
  specs: { marginTop: 2, letterSpacing: 0.2 },
});
