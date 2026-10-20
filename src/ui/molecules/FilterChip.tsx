import type { ReactNode } from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, StyleProp, View } from 'react-native';
import { THEME_COLORS, BORDER_RADIUS_TOKENS, OVERLAY_COLORS, SPACING_TOKENS } from '@theme';
import { Typography } from '../atoms/Typography';

export interface FilterChipProps {
  label: string;
  isSelected?: boolean;
  onPress: () => void;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const FilterChip = ({
  label,
  isSelected = false,
  onPress,
  icon,
  style,
}: FilterChipProps) => {
  return (
    <TouchableOpacity
      style={[styles.chip, isSelected ? styles.selectedChip : styles.unselectedChip, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {icon ? <View style={styles.iconWrapper}>{icon}</View> : null}

      <Typography
        variant="label"
        weight={isSelected ? 'SEMIBOLD' : 'MEDIUM'}
        colorKey={isSelected ? 'PRIMARY_DARK' : 'TEXT_SECONDARY'}
      >
        {label}
      </Typography>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    paddingHorizontal: SPACING_TOKENS.MD - 2,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    borderWidth: 1,
  },
  unselectedChip: {
    backgroundColor: THEME_COLORS.SURFACE,
    borderColor: OVERLAY_COLORS.FIELD_BORDER,
  },
  selectedChip: {
    backgroundColor: THEME_COLORS.PRIMARY_LIGHT,
    borderColor: THEME_COLORS.PRIMARY,
  },
  iconWrapper: {
    marginRight: SPACING_TOKENS.XS + 2,
  },
});
