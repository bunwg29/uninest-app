import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { SPACING_TOKENS, THEME_COLORS, OVERLAY_COLORS } from '@theme';
import { Typography } from '@ui';
import type { ListingLocationMapProps } from './ListingLocationMap.native';

export const ListingLocationMap = ({ latitude, longitude, title }: ListingLocationMapProps) => (
  <Pressable
    style={styles.container}
    onPress={() =>
      void Linking.openURL(
        `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
      )
    }
    accessibilityRole="link"
    accessibilityLabel="Mở vị trí trên bản đồ"
  >
    <View style={styles.pin}>
      <MapPin size={34} fill={THEME_COLORS.PRIMARY} color={THEME_COLORS.WHITE} />
    </View>
    <Typography variant="caption" weight="SEMIBOLD" colorKey="PRIMARY" numberOfLines={1}>
      {title ? `${title} · Mở bản đồ` : 'Mở bản đồ'}
    </Typography>
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING_TOKENS.XS,
    backgroundColor: OVERLAY_COLORS.MAP_LAND,
  },
  pin: { alignItems: 'center' },
});
