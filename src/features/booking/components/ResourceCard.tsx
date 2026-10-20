import type { ReactNode } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, THEME_COLORS } from '@theme';
import { Typography } from '@ui';
import type { BookingResource } from '../types';

export const ResourceCard = ({
  resource,
  onPress,
  subtitle,
  showPrice = true,
  compact = false,
  footer,
}: {
  resource: BookingResource;
  onPress?: () => void;
  subtitle?: string;
  showPrice?: boolean;
  compact?: boolean;
  footer?: ReactNode;
}) => {
  const thumbStyle = compact ? styles.thumbCompact : styles.thumb;
  const textLines = compact ? 1 : 2;

  return (
    <View style={[styles.card, compact ? styles.cardCompact : styles.cardElevated]}>
      <TouchableOpacity
        style={styles.row}
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={0.85}
        accessibilityRole={onPress ? 'button' : undefined}
        accessibilityLabel={onPress ? `Xem chi tiết phòng ${resource.title}` : undefined}
      >
        {resource.imageUrl ? (
          <Image source={{ uri: resource.imageUrl }} style={thumbStyle} resizeMode="cover" />
        ) : (
          <View style={[thumbStyle, styles.placeholder]} />
        )}
        <View style={styles.content}>
          <Typography variant="body2" weight="SEMIBOLD" numberOfLines={textLines}>
            {resource.title}
          </Typography>
          <Typography
            variant="caption"
            weight="MEDIUM"
            colorKey="TEXT_PLACEHOLDER"
            numberOfLines={textLines}
            style={styles.meta}
          >
            {subtitle ?? resource.address}
          </Typography>
          {showPrice ? (
            <Typography variant="body1" weight="BOLD" colorKey="PRIMARY_DARK" style={styles.price}>
              {`${resource.price.toLocaleString('vi-VN')}đ `}
              <Typography variant="caption" weight="MEDIUM" colorKey="TEXT_PLACEHOLDER">
                /tháng
              </Typography>
            </Typography>
          ) : null}
        </View>
      </TouchableOpacity>
      {footer ? (
        <>
          <View style={styles.divider} />
          {footer}
        </>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  cardElevated: {
    shadowColor: OVERLAY_COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardCompact: { borderWidth: 1, borderColor: THEME_COLORS.BORDER },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  thumb: { width: 64, height: 64, borderRadius: BORDER_RADIUS_TOKENS.MD },
  thumbCompact: { width: 56, height: 56, borderRadius: BORDER_RADIUS_TOKENS.MD },
  placeholder: { backgroundColor: OVERLAY_COLORS.PLACEHOLDER_TINT },
  content: { flex: 1 },
  meta: { marginTop: 2, letterSpacing: 0.2 },
  price: { marginTop: 2 },
  divider: { height: 1, marginTop: 14, backgroundColor: THEME_COLORS.SURFACE_MUTED },
});
