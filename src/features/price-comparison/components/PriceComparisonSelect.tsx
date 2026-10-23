import { ChevronDown } from 'lucide-react-native';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, SPACING_TOKENS, THEME_COLORS } from '@theme';
import { Typography } from '@ui';

interface PriceComparisonSelectProps {
  label: string;
  value?: string;
  placeholder: string;
  onPress: () => void;
  disabled?: boolean;
}

export const PriceComparisonSelect = ({
  label,
  value,
  placeholder,
  onPress,
  disabled = false,
}: PriceComparisonSelectProps) => (
  <View style={styles.container}>
    <Typography variant="caption" weight="SEMIBOLD" colorKey="TEXT_SECONDARY" style={styles.label}>
      {label}
    </Typography>

    <TouchableOpacity
      style={[styles.trigger, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value || placeholder}`}
    >
      <Typography
        variant="caption"
        weight="MEDIUM"
        colorKey={value ? 'TEXT_PRIMARY' : 'TEXT_PLACEHOLDER'}
        numberOfLines={1}
        style={styles.value}
      >
        {value || placeholder}
      </Typography>
      <ChevronDown size={16} color={THEME_COLORS.TEXT_PLACEHOLDER} />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  label: { marginBottom: 5 },
  trigger: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING_TOKENS.SM + SPACING_TOKENS.XS,
    borderWidth: 1,
    borderColor: OVERLAY_COLORS.FIELD_BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.MD,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  disabled: { opacity: 0.55 },
  value: { flex: 1, marginRight: SPACING_TOKENS.XS },
});
