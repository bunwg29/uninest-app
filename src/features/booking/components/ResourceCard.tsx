import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ImageOff, MapPin } from 'lucide-react-native';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Typography } from '@ui';
import type { BookingResource } from '../types';

export const ResourceCard = ({
  resource,
  onPress,
}: {
  resource: BookingResource;
  onPress?: () => void;
}) => (
  <TouchableOpacity
    style={styles.card}
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={0.85}
    accessibilityRole={onPress ? 'button' : undefined}
    accessibilityLabel={onPress ? `Xem chi tiết phòng ${resource.title}` : undefined}
  >
    {resource.imageUrl ? (
      <Image source={{ uri: resource.imageUrl }} style={styles.image} resizeMode="cover" />
    ) : (
      <View style={[styles.image, styles.placeholder]}>
        <ImageOff size={26} color={THEME_COLORS.TEXT_PLACEHOLDER} />
      </View>
    )}
    <View style={styles.content}>
      <Typography variant="body1" weight="BOLD" numberOfLines={2}>
        {resource.title}
      </Typography>
      <Typography variant="h3" weight="BOLD" colorKey="PRIMARY" style={styles.price}>
        {resource.price.toLocaleString('vi-VN')} ₫
        <Typography variant="caption" colorKey="TEXT_MUTED">
          {' '}
          / tháng
        </Typography>
      </Typography>
      <View style={styles.addressRow}>
        <MapPin size={14} color={THEME_COLORS.TEXT_MUTED} />
        <Typography
          variant="caption"
          colorKey="TEXT_MUTED"
          numberOfLines={1}
          style={styles.address}
        >
          {resource.address}
        </Typography>
      </View>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: SPACING_TOKENS.SM,
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  image: { width: 92, height: 92, borderRadius: BORDER_RADIUS_TOKENS.MD },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME_COLORS.SURFACE_MUTED,
  },
  content: { flex: 1, paddingHorizontal: SPACING_TOKENS.MD, justifyContent: 'center' },
  price: { marginTop: SPACING_TOKENS.XS },
  addressRow: { flexDirection: 'row', alignItems: 'center', marginTop: SPACING_TOKENS.XS },
  address: { flex: 1, marginLeft: SPACING_TOKENS.XS },
});
