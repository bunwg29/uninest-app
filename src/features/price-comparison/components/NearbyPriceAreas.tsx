import { ChevronRight } from 'lucide-react-native';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { BORDER_RADIUS_TOKENS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Typography } from '@ui';
import type { PriceComparisonItem } from '../types';
import { formatMonthlyPrice } from '../utils';

interface NearbyPriceAreasProps {
  items: PriceComparisonItem[];
  provinceName: string;
  onSelect: (areaCode: string) => void;
}

export const NearbyPriceAreas = ({ items, provinceName, onSelect }: NearbyPriceAreasProps) => {
  if (items.length === 0) return null;

  return (
    <View style={styles.section}>
      <Typography variant="tiny" weight="BOLD" colorKey="TEXT_PLACEHOLDER" style={styles.heading}>
        THỬ KHU VỰC LÂN CẬN
      </Typography>
      <View style={styles.card}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={`${item.areaCode}-${item.roomType}`}
            style={[styles.row, index < items.length - 1 && styles.rowDivider]}
            onPress={() => onSelect(item.areaCode)}
            accessibilityRole="button"
          >
            <View style={styles.content}>
              <Typography variant="caption" weight="SEMIBOLD" numberOfLines={1}>
                {`${provinceName} · ${item.area}`}
              </Typography>
              <Typography variant="caption" colorKey="TEXT_PLACEHOLDER">
                {`${item.sampleCount} tin`}
              </Typography>
            </View>
            <Typography variant="body2" weight="BOLD" colorKey="PRIMARY_DARK">
              {formatMonthlyPrice(item.avgPrice ?? 0)}
            </Typography>
            <ChevronRight size={16} color={THEME_COLORS.TEXT_PLACEHOLDER} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: { gap: SPACING_TOKENS.SM + SPACING_TOKENS.XS },
  heading: { letterSpacing: 0.8 },
  card: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME_COLORS.BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.LG,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  row: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING_TOKENS.SM + SPACING_TOKENS.XXS,
    paddingHorizontal: 14,
    paddingVertical: SPACING_TOKENS.SM + SPACING_TOKENS.XS,
  },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: THEME_COLORS.BORDER },
  content: { flex: 1, gap: SPACING_TOKENS.XXS },
});
