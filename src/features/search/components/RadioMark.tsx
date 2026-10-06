import { StyleSheet, View } from 'react-native';
import { BORDER_RADIUS_TOKENS, OVERLAY_COLORS, THEME_COLORS } from '@theme';

export const RadioMark = ({ isSelected }: { isSelected: boolean }) => (
  <View style={[styles.mark, isSelected && styles.selected]} />
);

const styles = StyleSheet.create({
  mark: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: OVERLAY_COLORS.FIELD_BORDER,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
    backgroundColor: THEME_COLORS.SURFACE,
  },
  selected: { borderWidth: 6, borderColor: THEME_COLORS.PRIMARY },
});
