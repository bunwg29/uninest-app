import { View, StyleSheet } from 'react-native';
import { THEME_COLORS, SPACING_TOKENS, BORDER_RADIUS_TOKENS } from '@theme';
import { Typography } from '@ui';

export interface DateSeparatorProps {
  label: string;
}

export const DateSeparator = ({ label }: DateSeparatorProps) => (
  <View style={styles.container}>
    <View style={styles.pill}>
      <Typography variant="tiny" weight="SEMIBOLD" colorKey="TEXT_PLACEHOLDER">
        {label}
      </Typography>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: SPACING_TOKENS.MD,
  },
  pill: {
    backgroundColor: THEME_COLORS.BORDER,
    paddingHorizontal: SPACING_TOKENS.SM + 4,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS_TOKENS.FULL,
  },
});
