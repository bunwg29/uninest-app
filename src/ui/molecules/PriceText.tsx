import { StyleSheet, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import type { ThemeColorKey } from '@theme';
import { Typography, type TypographyVariant } from '../atoms/Typography';

export interface PriceTextProps {
  price: string;
  suffix?: string;
  variant?: TypographyVariant;
  priceColorKey?: ThemeColorKey;
  priceStyle?: StyleProp<TextStyle>;
  suffixStyle?: StyleProp<TextStyle>;
  style?: StyleProp<ViewStyle>;
}

export const PriceText = ({
  price,
  suffix = '/tháng',
  variant = 'body2',
  priceColorKey = 'PRIMARY_DARK',
  priceStyle,
  suffixStyle,
  style,
}: PriceTextProps) => (
  <View style={[styles.row, style]}>
    <Typography variant={variant} weight="BOLD" colorKey={priceColorKey} style={priceStyle}>
      {price}
    </Typography>
    <Typography variant="caption" colorKey="TEXT_PLACEHOLDER" style={suffixStyle}>
      {suffix}
    </Typography>
  </View>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
});
